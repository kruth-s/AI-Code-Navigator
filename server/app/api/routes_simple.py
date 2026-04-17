"""
FastAPI REST Routes — Thin wrappers over MCP tools.

These routes exist so the Next.js frontend can call familiar REST endpoints.
Under the hood, every route delegates to the MCP Server tools via the MCP Client.

    Frontend  →  REST route  →  MCP Client  →  MCP Server tool
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import re
from datetime import datetime

from ..mcp_client import mcp_client
from ..core.database import SessionLocal
from ..models.repository import Repository as RepositoryModel

def resolve_repo_id(repo_id: str) -> str:
    """Helper to resolve UUID to slug if needed."""
    repos_db = mcp_client.repos_db
    if repo_id in repos_db:
        return repo_id
        
    if len(repo_id) >= 32:
        db = SessionLocal()
        try:
            sql_repo = db.query(RepositoryModel).filter(RepositoryModel.id == repo_id).first()
            if sql_repo and sql_repo.html_url:
                url = sql_repo.html_url
                for rid, data in repos_db.items():
                    if data.get("url") == url or data.get("url") == url + ".git":
                        return rid
        finally:
            db.close()
    return repo_id

router = APIRouter()


# ─── Request / Response Models ────────────────────────────────────────────────


class ChatRequest(BaseModel):
    query: str
    repo_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    confidence: Optional[str] = None
    sources: Optional[List[str]] = None


class IngestRequest(BaseModel):
    repo_url: str


class IngestResponse(BaseModel):
    status: str
    message: str
    repo_id: str


class Repository(BaseModel):
    id: str
    name: str
    url: str
    status: str
    lastSynced: str
    branch: str
    language: str
    progress: Optional[int] = 0
    status_message: Optional[str] = ""


# ─── Chat ─────────────────────────────────────────────────────────────────────


@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Handle chat queries about a specific repository.
    Delegates to the `query_codebase` MCP tool.
    """
    if not request.repo_id:
        raise HTTPException(status_code=400, detail="Please select a repository first")

    result = await mcp_client.chat(query=request.query, repo_id=request.repo_id)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return ChatResponse(
        answer=result.get("answer", "No answer generated"),
        confidence=result.get("confidence", "unknown"),
        sources=result.get("sources", []),
    )


# ─── Repositories ────────────────────────────────────────────────────────────


@router.get("/api/repos", response_model=List[Repository])
async def get_repositories():
    """
    Get list of all repositories, synced with Pinecone.
    Delegates to the `list_repositories` MCP tool.
    """
    repos = mcp_client.get_repos()
    return repos


@router.post("/api/ingest", response_model=IngestResponse)
async def ingest_repository(request: IngestRequest, background_tasks: BackgroundTasks):
    """
    Start ingesting a new repository.
    Delegates to the `ingest_repository` MCP tool for initial setup,
    then runs the heavy indexing in a background task.
    """
    result = mcp_client.start_ingest(repo_url=request.repo_url)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Run the actual clone + embed + upsert work in the background
    background_tasks.add_task(
        _ingest_background, result["repo_id"], request.repo_url
    )

    return IngestResponse(
        status=result["status"],
        message=result["message"],
        repo_id=result["repo_id"],
    )


@router.delete("/api/repos/{repo_id}")
async def delete_repository(repo_id: str):
    """
    Delete a repository.
    Delegates to the `delete_repository` MCP tool.
    """
    repo_id = resolve_repo_id(repo_id)
    result = mcp_client.remove_repo(repo_id=repo_id)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@router.post("/api/repos/clear-all")
async def clear_all_repositories():
    """
    Clear all repositories.
    Delegates to the `clear_all_repositories` MCP tool.
    """
    result = mcp_client.clear_repos()

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result


# ─── Issues ──────────────────────────────────────────────────────────────────


@router.get("/api/repos/{repo_id}/issues")
async def get_repo_issues(repo_id: str):
    """
    Fetch open issues from GitHub for a repository.
    Delegates to the `get_github_issues` MCP tool.
    """
    repo_id = resolve_repo_id(repo_id)
    repos_db = mcp_client.repos_db

    if repo_id not in repos_db:
        raise HTTPException(status_code=404, detail="Repository not found")

    repo = repos_db[repo_id]
    repo_url = repo.get("url", "")

    match = re.search(r"github\.com/([^/]+)/([^/]+)", repo_url)
    if not match:
        raise HTTPException(status_code=400, detail="Not a valid GitHub repository URL")

    owner = match.group(1)
    repo_name = match.group(2).replace(".git", "")

    issues = mcp_client.fetch_issues(repo_url=repo_url)

    if issues and isinstance(issues[0], dict) and "error" in issues[0]:
        raise HTTPException(status_code=500, detail=issues[0]["error"])

    return {"issues": issues, "repo": f"{owner}/{repo_name}"}


# ─── Settings ────────────────────────────────────────────────────────────────


@router.get("/api/settings")
async def get_settings():
    """
    Get current settings (masked).
    Delegates to the `get_settings` MCP tool.
    """
    return mcp_client.fetch_settings()


@router.post("/api/settings")
async def update_settings(settings: Dict[str, str]):
    """
    Update settings.
    Delegates to the `update_settings` MCP tool.
    """
    return mcp_client.save_settings(settings_dict=settings)


# ─── Health ──────────────────────────────────────────────────────────────────


@router.get("/api/health")
async def health_check():
    """Health check endpoint."""
    repos_db = mcp_client.repos_db
    return {
        "status": "ok",
        "repositories": len(repos_db),
        "mcp": "enabled",
    }


# ─── Background Ingestion (heavy lifting) ───────────────────────────────────


def _ingest_background(repo_id: str, repo_url: str):
    """
    Background task to ingest repository with detailed status updates.
    Accesses the MCP server's shared repositories_db through the client.
    """
    repos_db = mcp_client.repos_db

    try:
        from git import Repo
        import shutil
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from pinecone import Pinecone
        from ..core.config import settings

        repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
        base_dir = os.path.join(os.getcwd(), "repos")
        repo_dir = os.path.join(base_dir, repo_name)

        # Clone / Pull
        repos_db[repo_id]["progress"] = 10
        repos_db[repo_id]["status_message"] = f"Ingesting repository: {repo_url}"

        if os.path.exists(repo_dir):
            try:
                repos_db[repo_id]["status_message"] = "Repository exists, pulling latest..."
                repo = Repo(repo_dir)
                repo.remotes.origin.pull()
            except Exception:
                repos_db[repo_id]["status_message"] = "Pull failed, re-cloning..."
                import stat

                def on_rm_error(func, path, exc_info):
                    os.chmod(path, stat.S_IWRITE)
                    func(path)

                shutil.rmtree(repo_dir, onerror=on_rm_error)
                Repo.clone_from(repo_url, repo_dir)
        else:
            repos_db[repo_id]["status_message"] = f"Cloning to {repo_dir}..."
            os.makedirs(base_dir, exist_ok=True)
            Repo.clone_from(repo_url, repo_dir)

        repos_db[repo_id]["progress"] = 30

        # Read files
        repos_db[repo_id]["status_message"] = "Reading files..."
        documents = []
        for root, _, files in os.walk(repo_dir):
            if ".git" in root:
                continue
            for file in files:
                if file.endswith((
                    ".py", ".js", ".ts", ".jsx", ".tsx", ".md", ".txt",
                    ".java", ".go", ".rs", ".c", ".cpp", ".h",
                )):
                    path = os.path.join(root, file)
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            content = f.read()
                            documents.append({
                                "text": content, "source": path, "repo": repo_name
                            })
                    except Exception:
                        pass

        repos_db[repo_id]["progress"] = 50
        repos_db[repo_id]["status_message"] = f"Found {len(documents)} files"

        if not documents:
            repos_db[repo_id]["status"] = "Error"
            repos_db[repo_id]["status_message"] = "No supported files found"
            repos_db[repo_id]["lastSynced"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            mcp_client.save_repos()
            return

        # Chunk
        repos_db[repo_id]["status_message"] = "Splitting into chunks..."
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks_text = []
        chunks_meta = []

        for d in documents:
            splits = splitter.split_text(d["text"])
            for i, s in enumerate(splits):
                chunk_id = f"{repo_name}-{os.path.basename(d['source'])}-{i}"
                chunks_text.append(s)
                chunks_meta.append({
                    "text": s, "source": d["source"],
                    "repo": d["repo"], "chunk_id": chunk_id,
                })

        repos_db[repo_id]["progress"] = 60
        repos_db[repo_id]["status_message"] = f"Created {len(chunks_text)} chunks"

        # Embed
        repos_db[repo_id]["status_message"] = "Loading embedding model..."
        repos_db[repo_id]["progress"] = 65
        embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        repos_db[repo_id]["status_message"] = "Embedding documents..."
        vectors = embeddings_model.embed_documents(chunks_text)
        repos_db[repo_id]["progress"] = 80

        # Upsert to Pinecone
        repos_db[repo_id]["status_message"] = "Uploading to Pinecone..."
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX)

        batch_size = 100
        total_batches = (len(chunks_text) + batch_size - 1) // batch_size

        for i in range(0, len(chunks_text), batch_size):
            batch_num = (i // batch_size) + 1
            repos_db[repo_id]["status_message"] = f"Batch {batch_num}/{total_batches} uploaded"

            batch_vecs = vectors[i : i + batch_size]
            batch_meta = chunks_meta[i : i + batch_size]

            to_upsert = []
            for j, vec in enumerate(batch_vecs):
                meta = batch_meta[j]
                to_upsert.append({
                    "id": meta["chunk_id"],
                    "values": vec,
                    "metadata": {
                        "text": meta["text"],
                        "source": meta["source"],
                        "repo": meta["repo"],
                    },
                })

            index.upsert(vectors=to_upsert, namespace=repo_id)
            repos_db[repo_id]["progress"] = 80 + (batch_num * 15 // total_batches)

        # Done
        repos_db[repo_id]["status"] = "Indexed"
        repos_db[repo_id]["progress"] = 100
        repos_db[repo_id]["status_message"] = f"Repository '{repo_name}' ingested successfully!"
        repos_db[repo_id]["lastSynced"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        mcp_client.save_repos()

    except Exception as e:
        print(f"Error ingesting repository: {e}")
        repos_db[repo_id]["status"] = "Error"
        repos_db[repo_id]["status_message"] = f"Error: {str(e)}"
        repos_db[repo_id]["lastSynced"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        mcp_client.save_repos()
