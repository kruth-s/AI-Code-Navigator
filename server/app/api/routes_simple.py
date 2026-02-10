from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from datetime import datetime

router = APIRouter()

# In-memory storage for repository status (in production, use a database)
repositories_db: Dict[str, Dict[str, Any]] = {}

# Request/Response Models
class ChatRequest(BaseModel):
    query: str
    repo_id: Optional[str] = None  # Which repo to query

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
    status: str  # "Indexed", "Indexing", "Error"
    lastSynced: str
    branch: str
    language: str
    progress: Optional[int] = 0
    status_message: Optional[str] = ""  # Detailed status message

# API Endpoints

@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Handle chat queries about a specific repository
    """
    try:
        if not request.repo_id:
            raise HTTPException(status_code=400, detail="Please select a repository first")
        
        if request.repo_id not in repositories_db:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        if repositories_db[request.repo_id]["status"] != "Indexed":
            raise HTTPException(status_code=400, detail="Repository is not indexed yet")
        
        # Lazy import to avoid loading graph at startup
        from ..graph import app_graph
        
        # Prepare initial state for the agent graph with repo_id
        initial_state = {
            "input": request.query,
            "repo_id": request.repo_id,  # Pass repo_id to graph
            "context": [],
            "github_data": [],
            "messages": [],
            "plan": [],
            "answer": ""
        }
        
        # Run the agent graph
        result = await app_graph.ainvoke(initial_state)
        final_output = result.get("final_output", {})
        
        return ChatResponse(
            answer=final_output.get('answer', 'No answer generated'),
            confidence=final_output.get('confidence', 'unknown'),
            sources=final_output.get('sources', [])
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@router.get("/api/repos", response_model=List[Repository])
async def get_repositories():
    """
    Get list of all repositories
    """
    return list(repositories_db.values())

@router.post("/api/ingest", response_model=IngestResponse)
async def ingest_repository(request: IngestRequest, background_tasks: BackgroundTasks):
    """
    Start ingesting a new repository (max 5 repos allowed)
    """
    try:
        # Check if we already have 5 repos
        indexed_repos = [r for r in repositories_db.values() if r["status"] == "Indexed"]
        if len(indexed_repos) >= 5:
            raise HTTPException(
                status_code=400, 
                detail="Maximum 5 repositories allowed. Please delete some repositories first or use /api/repos/clear-all to clear all."
            )
        
        # Extract repo name from URL
        repo_name = request.repo_url.rstrip("/").split("/")[-1].replace(".git", "")
        repo_id = repo_name.lower().replace(" ", "-").replace("_", "-")
        
        # Check if repo already exists
        if repo_id in repositories_db:
            raise HTTPException(status_code=400, detail="Repository already indexed or being indexed")
        
        # Create repository entry
        repositories_db[repo_id] = {
            "id": repo_id,
            "name": repo_name,
            "url": request.repo_url,
            "status": "Indexing",
            "lastSynced": "Just now",
            "branch": "main",
            "language": "Python",
            "progress": 0,
            "status_message": f"Starting ingestion for {repo_name}..."
        }
        
        # Start ingestion in background
        background_tasks.add_task(ingest_repo_background, repo_id, request.repo_url)
        
        return IngestResponse(
            status="success",
            message=f"Started ingesting repository: {repo_name} ({len(indexed_repos) + 1}/5)",
            repo_id=repo_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting ingestion: {str(e)}")

async def ingest_repo_background(repo_id: str, repo_url: str):
    """
    Background task to ingest repository with detailed status updates
    """
    try:
        from git import Repo
        import shutil
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from pinecone import Pinecone
        from ..core.config import settings
        
        # Extract repo name
        repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
        base_dir = os.path.join(os.getcwd(), "repos")
        repo_dir = os.path.join(base_dir, repo_name)
        
        # Clone/Pull repository
        repositories_db[repo_id]["progress"] = 10
        repositories_db[repo_id]["status_message"] = f"Ingesting repository: {repo_url}\n{'=' * 70}"
        
        if os.path.exists(repo_dir):
            try:
                repositories_db[repo_id]["status_message"] = "Repository exists, pulling latest..."
                repo = Repo(repo_dir)
                repo.remotes.origin.pull()
            except:
                repositories_db[repo_id]["status_message"] = "Pull failed, re-cloning..."
                shutil.rmtree(repo_dir)
                Repo.clone_from(repo_url, repo_dir)
        else:
            repositories_db[repo_id]["status_message"] = f"Cloning to {repo_dir}..."
            os.makedirs(base_dir, exist_ok=True)
            Repo.clone_from(repo_url, repo_dir)
        
        repositories_db[repo_id]["progress"] = 30
        
        # Read files
        repositories_db[repo_id]["status_message"] = "Reading files..."
        documents = []
        for root, _, files in os.walk(repo_dir):
            if ".git" in root:
                continue
            for file in files:
                if file.endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.md', '.txt', '.java', '.go', '.rs', '.c', '.cpp', '.h')):
                    path = os.path.join(root, file)
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            content = f.read()
                            documents.append({"text": content, "source": path, "repo": repo_name})
                    except:
                        pass
        
        repositories_db[repo_id]["progress"] = 50
        repositories_db[repo_id]["status_message"] = f"Found {len(documents)} files"
        
        if not documents:
            repositories_db[repo_id]["status"] = "Error"
            repositories_db[repo_id]["status_message"] = "No supported files found in repository"
            repositories_db[repo_id]["lastSynced"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            return
        
        # Chunk documents
        repositories_db[repo_id]["status_message"] = "Splitting into chunks..."
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks_text = []
        chunks_meta = []
        
        for d in documents:
            splits = splitter.split_text(d["text"])
            for i, s in enumerate(splits):
                chunk_id = f"{repo_name}-{os.path.basename(d['source'])}-{i}"
                chunks_text.append(s)
                chunks_meta.append({"text": s, "source": d["source"], "repo": d["repo"], "chunk_id": chunk_id})
        
        repositories_db[repo_id]["progress"] = 60
        repositories_db[repo_id]["status_message"] = f"Created {len(chunks_text)} chunks"
        
        # Generate embeddings
        repositories_db[repo_id]["status_message"] = "Generating embeddings..."
        repositories_db[repo_id]["progress"] = 65
        
        repositories_db[repo_id]["status_message"] = "Loading embedding model..."
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        repositories_db[repo_id]["status_message"] = "Embedding documents..."
        vectors = embeddings.embed_documents(chunks_text)
        
        repositories_db[repo_id]["progress"] = 80
        
        # Upsert to Pinecone
        repositories_db[repo_id]["status_message"] = "Uploading to Pinecone..."
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX)
        
        # Use repo_id as namespace to keep repos separate
        batch_size = 100
        total_batches = (len(chunks_text) + batch_size - 1) // batch_size
        
        for i in range(0, len(chunks_text), batch_size):
            batch_num = (i // batch_size) + 1
            repositories_db[repo_id]["status_message"] = f"   Batch {batch_num}/{total_batches} uploaded"
            
            batch_vecs = vectors[i:i+batch_size]
            batch_meta = chunks_meta[i:i+batch_size]
            
            to_upsert = []
            for j, vec in enumerate(batch_vecs):
                meta = batch_meta[j]
                to_upsert.append({
                    "id": meta["chunk_id"],
                    "values": vec,
                    "metadata": {"text": meta["text"], "source": meta["source"], "repo": meta["repo"]}
                })
            
            # Upsert with namespace = repo_id
            index.upsert(vectors=to_upsert, namespace=repo_id)
            repositories_db[repo_id]["progress"] = 80 + (batch_num * 15 // total_batches)
        
        # Update status to completed
        repositories_db[repo_id]["status"] = "Indexed"
        repositories_db[repo_id]["progress"] = 100
        repositories_db[repo_id]["status_message"] = f"\nRepository '{repo_name}' ingested successfully!"
        repositories_db[repo_id]["lastSynced"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
    except Exception as e:
        print(f"Error ingesting repository: {e}")
        repositories_db[repo_id]["status"] = "Error"
        repositories_db[repo_id]["status_message"] = f"Error: {str(e)}"
        repositories_db[repo_id]["lastSynced"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@router.delete("/api/repos/{repo_id}")
async def delete_repository(repo_id: str):
    """
    Delete a repository and its vectors from Pinecone
    """
    if repo_id not in repositories_db:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    try:
        # Delete from Pinecone namespace
        from pinecone import Pinecone
        from ..core.config import settings
        
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX)
        
        # Delete all vectors in this namespace
        index.delete(delete_all=True, namespace=repo_id)
        
        # Delete from in-memory DB
        del repositories_db[repo_id]
        
        return {"status": "success", "message": "Repository deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting repository: {str(e)}")

@router.post("/api/repos/clear-all")
async def clear_all_repositories():
    """
    Clear all repositories and their vectors from Pinecone
    """
    try:
        from pinecone import Pinecone
        from ..core.config import settings
        
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX)
        
        # Delete all namespaces
        for repo_id in list(repositories_db.keys()):
            try:
                index.delete(delete_all=True, namespace=repo_id)
            except:
                pass
        
        # Clear in-memory DB
        repositories_db.clear()
        
        return {"status": "success", "message": "All repositories cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing repositories: {str(e)}")

@router.get("/api/settings")
async def get_settings():
    """
    Get current settings (API keys masked)
    """
    return {
        "GEMINI_API_KEY": "********" if os.getenv("GEMINI_API_KEY") else None,
        "GROQ_API_KEY": "********" if os.getenv("GROQ_API_KEY") else None,
        "GITHUB_ACCESS_TOKEN": "********" if os.getenv("GITHUB_ACCESS_TOKEN") else None
    }

@router.post("/api/settings")
async def update_settings(settings: Dict[str, str]):
    """
    Update settings (in production, save to .env file or database)
    """
    # In production, you would save these to a .env file or database
    # For now, just return success
    for key, value in settings.items():
        if key in ["GEMINI_API_KEY", "GROQ_API_KEY", "GITHUB_ACCESS_TOKEN"]:
            os.environ[key] = value
    
    return {"status": "success", "message": "Settings updated"}

@router.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "ok",
        "repositories": len(repositories_db)
    }
