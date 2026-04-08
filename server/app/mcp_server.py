"""
MCP Server — AI Code Navigator

This is the core of the application. All codebase operations are exposed
as MCP tools using FastMCP. The FastAPI routes act as thin HTTP wrappers
that call these MCP tools via the MCP client.

MCP endpoint: http://localhost:8000/mcp
"""

from fastmcp import FastMCP
from typing import Dict, Any, List, Optional
import os
import json
import re
from datetime import datetime

# ---------------------------------------------------------------------------
# MCP Server instance
# ---------------------------------------------------------------------------

mcp = FastMCP(
    name="AI-Code-Navigator",
    instructions="""
    This MCP server provides tools to interact with a codebase Q&A system.
    You can:
    - Query indexed codebases with natural language
    - Search code using vector similarity
    - Grep through repository files
    - Fetch GitHub issues for a repository
    - Ingest (clone + index) new repositories
    - List and manage indexed repositories
    """,
)

# ---------------------------------------------------------------------------
# Shared state — repositories database (file-backed)
# ---------------------------------------------------------------------------

REPOS_FILE = os.path.join(os.getcwd(), "repositories.json")


def _load_repos() -> Dict[str, Dict[str, Any]]:
    if os.path.exists(REPOS_FILE):
        try:
            with open(REPOS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def _save_repos(db: dict):
    try:
        with open(REPOS_FILE, "w") as f:
            json.dump(db, f, indent=4)
    except Exception as e:
        print(f"Error saving repos: {e}")


repositories_db: Dict[str, Dict[str, Any]] = _load_repos()

# ---------------------------------------------------------------------------
# MCP Resources
# ---------------------------------------------------------------------------


@mcp.resource("repos://list")
def resource_repos_list() -> str:
    """Returns the current list of indexed repositories as JSON."""
    return json.dumps(list(repositories_db.values()), indent=2)


@mcp.resource("repos://{repo_id}/status")
def resource_repo_status(repo_id: str) -> str:
    """Returns the status of a specific repository."""
    repo = repositories_db.get(repo_id)
    if not repo:
        return json.dumps({"error": "Repository not found"})
    return json.dumps(repo, indent=2)


# ---------------------------------------------------------------------------
# MCP Tools — Codebase Q&A
# ---------------------------------------------------------------------------


@mcp.tool
async def query_codebase(query: str, repo_id: str) -> Dict[str, Any]:
    """
    Ask a natural-language question about an indexed codebase.
    Uses the LangGraph agent pipeline (planner → retriever → github → reasoner → safety).

    Args:
        query: The question to ask.
        repo_id: The repository ID to query against.

    Returns:
        A dict with 'answer', 'confidence', and 'sources'.
    """
    if repo_id not in repositories_db:
        return {"error": f"Repository '{repo_id}' not found"}

    if repositories_db[repo_id]["status"] != "Indexed":
        return {"error": f"Repository '{repo_id}' is not indexed yet"}

    try:
        from .graph import app_graph

        repo_url = repositories_db[repo_id].get("url", "")

        initial_state = {
            "input": query,
            "repo_id": repo_id,
            "repo_url": repo_url,
            "context": [],
            "github_data": [],
            "messages": [],
            "plan": [],
            "answer": "",
        }

        result = await app_graph.ainvoke(initial_state)
        final_output = result.get("final_output", {})

        return {
            "answer": final_output.get("answer", "No answer generated"),
            "confidence": final_output.get("confidence", "unknown"),
            "sources": final_output.get("sources", []),
        }
    except Exception as e:
        return {"error": f"Error processing query: {str(e)}"}


# ---------------------------------------------------------------------------
# MCP Tools — Code Search
# ---------------------------------------------------------------------------


@mcp.tool
def search_code_vectors(query: str, repo_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search for relevant code chunks using Pinecone vector search.

    Args:
        query: The search query.
        repo_id: The repository namespace to search in.
        top_k: Number of results to return.

    Returns:
        A list of matching code chunks with file paths and scores.
    """
    try:
        from pinecone import Pinecone
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from .core.config import settings

        if not settings.PINECONE_API_KEY:
            return [{"error": "Pinecone not configured"}]

        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX)

        vector = embeddings.embed_query(query)
        results = index.query(
            vector=vector,
            top_k=top_k,
            include_metadata=True,
            namespace=repo_id,
        )

        matches = []
        for match in results.matches:
            matches.append({
                "file": match.metadata.get("source", "unknown"),
                "content": match.metadata.get("text", "")[:500],
                "score": match.score,
            })
        return matches
    except Exception as e:
        return [{"error": str(e)}]


@mcp.tool
def search_code_files(pattern: str, repo_id: str) -> List[str]:
    """
    Grep-style search for an exact string pattern in repository files.

    Args:
        pattern: The text pattern to search for.
        repo_id: The repository to search in (used to resolve directory).

    Returns:
        A list of matching lines with file paths and line numbers.
    """
    repo_path = os.path.join(os.getcwd(), "repos", repo_id)
    matches = []

    if not os.path.exists(repo_path):
        return ["Repository directory not found."]

    for root, _, files in os.walk(repo_path):
        if ".git" in root:
            continue
        for file in files:
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    if pattern in content:
                        lines = content.split("\n")
                        for i, line in enumerate(lines):
                            if pattern in line:
                                matches.append(f"{path}:{i+1}: {line.strip()}")
            except Exception:
                pass
            if len(matches) > 20:
                break

    return matches if matches else ["No matches found."]


@mcp.tool
def read_file(file_path: str) -> str:
    """
    Read the contents of a file from a cloned repository.

    Args:
        file_path: Absolute path or path relative to the repos directory.

    Returns:
        The file contents as a string.
    """
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {e}"

    return f"File not found: {file_path}"


# ---------------------------------------------------------------------------
# MCP Tools — GitHub
# ---------------------------------------------------------------------------


@mcp.tool
def get_github_issues(repo_url: str) -> List[Dict[str, Any]]:
    """
    Fetch open GitHub issues for a repository.

    Args:
        repo_url: The GitHub repository URL (e.g. https://github.com/owner/repo).

    Returns:
        A list of open issues with number, title, labels, user, and URL.
    """
    import httpx

    match = re.search(r"github\.com/([^/]+)/([^/]+)", repo_url)
    if not match:
        return [{"error": "Not a valid GitHub repository URL"}]

    owner = match.group(1)
    repo_name = match.group(2).replace(".git", "")

    try:
        from .core.config import settings

        headers = {"Accept": "application/vnd.github+json"}
        token = settings.GITHUB_ACCESS_TOKEN or settings.GITHUB_TOKEN
        if token and len(token) > 10 and not token.startswith("your_"):
            headers["Authorization"] = f"Bearer {token}"

        response = httpx.get(
            f"https://api.github.com/repos/{owner}/{repo_name}/issues",
            params={"state": "open", "per_page": 30},
            headers=headers,
            timeout=15.0,
        )

        if response.status_code != 200:
            return [{"error": f"GitHub API returned {response.status_code}"}]

        issues = []
        for issue in response.json():
            if "pull_request" in issue:
                continue
            issues.append({
                "number": issue["number"],
                "title": issue["title"],
                "state": issue["state"],
                "labels": [
                    {"name": l["name"], "color": l.get("color", "333333")}
                    for l in issue.get("labels", [])
                ],
                "created_at": issue["created_at"],
                "html_url": issue["html_url"],
                "user": issue["user"]["login"] if issue.get("user") else "unknown",
                "comments": issue.get("comments", 0),
                "body": (issue.get("body") or "")[:200],
            })

        return issues
    except Exception as e:
        return [{"error": f"Failed to fetch issues: {str(e)}"}]


# ---------------------------------------------------------------------------
# MCP Tools — Repository Management
# ---------------------------------------------------------------------------


@mcp.tool
def list_repositories() -> List[Dict[str, Any]]:
    """
    List all repositories and sync with Pinecone namespaces.

    Returns:
        A list of repository objects with id, name, url, status, etc.
    """
    try:
        from pinecone import Pinecone
        from .core.config import settings

        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX)

        stats = index.describe_index_stats()
        active_namespaces = set(stats.namespaces.keys()) if stats.namespaces else set()

        repos_changed = False

        # Remove repos that claim "Indexed" but aren't in Pinecone
        repos_to_delete = [
            rid for rid, repo in repositories_db.items()
            if repo["status"] == "Indexed" and rid not in active_namespaces
        ]
        for rid in repos_to_delete:
            del repositories_db[rid]
            repos_changed = True

        # Add repos that are in Pinecone but missing locally
        for ns in active_namespaces:
            if ns not in repositories_db:
                repositories_db[ns] = {
                    "id": ns,
                    "name": ns.replace("-", " ").title(),
                    "url": f"https://github.com/unknown/{ns}",
                    "status": "Indexed",
                    "lastSynced": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "branch": "main",
                    "language": "Unknown",
                    "progress": 100,
                    "status_message": "Discovered in Pinecone",
                }
                repos_changed = True

        if repos_changed:
            _save_repos(repositories_db)

    except Exception as e:
        print(f"Warning: Could not sync with Pinecone: {e}")

    return list(repositories_db.values())


@mcp.tool
def ingest_repository(repo_url: str) -> Dict[str, Any]:
    """
    Start ingesting (clone + index) a new repository. Max 5 repos allowed.
    Runs synchronously — for background processing, the FastAPI route wraps this.

    Args:
        repo_url: The git clone URL for the repository.

    Returns:
        Status dict with repo_id and message.
    """
    indexed_repos = [r for r in repositories_db.values() if r["status"] == "Indexed"]
    if len(indexed_repos) >= 5:
        return {"error": "Maximum 5 repositories allowed. Delete some first."}

    repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
    repo_id = repo_name.lower().replace(" ", "-").replace("_", "-")

    if repo_id in repositories_db:
        return {"error": "Repository already indexed or being indexed"}

    repositories_db[repo_id] = {
        "id": repo_id,
        "name": repo_name,
        "url": repo_url,
        "status": "Indexing",
        "lastSynced": "Just now",
        "branch": "main",
        "language": "Python",
        "progress": 0,
        "status_message": f"Starting ingestion for {repo_name}...",
    }
    _save_repos(repositories_db)

    return {
        "status": "success",
        "message": f"Started ingesting repository: {repo_name} ({len(indexed_repos) + 1}/5)",
        "repo_id": repo_id,
    }


@mcp.tool
def delete_repository(repo_id: str) -> Dict[str, Any]:
    """
    Delete a repository and its vectors from Pinecone.

    Args:
        repo_id: The ID of the repository to delete.

    Returns:
        Status dict confirming deletion.
    """
    if repo_id not in repositories_db:
        return {"error": "Repository not found"}

    try:
        from pinecone import Pinecone
        from .core.config import settings

        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX)
        index.delete(delete_all=True, namespace=repo_id)

        del repositories_db[repo_id]
        _save_repos(repositories_db)

        return {"status": "success", "message": "Repository deleted"}
    except Exception as e:
        return {"error": f"Error deleting repository: {str(e)}"}


@mcp.tool
def clear_all_repositories() -> Dict[str, Any]:
    """
    Clear all repositories and their vectors from Pinecone.

    Returns:
        Status dict confirming all repos cleared.
    """
    try:
        from pinecone import Pinecone
        from .core.config import settings

        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX)

        for rid in list(repositories_db.keys()):
            try:
                index.delete(delete_all=True, namespace=rid)
            except Exception:
                pass

        repositories_db.clear()
        _save_repos(repositories_db)

        return {"status": "success", "message": "All repositories cleared"}
    except Exception as e:
        return {"error": f"Error clearing repositories: {str(e)}"}


# ---------------------------------------------------------------------------
# MCP Tools — Settings
# ---------------------------------------------------------------------------


@mcp.tool
def get_settings() -> Dict[str, Any]:
    """
    Get current API key settings (masked).

    Returns:
        A dict of setting names with masked values.
    """
    return {
        "GEMINI_API_KEY": "********" if os.getenv("GEMINI_API_KEY") else None,
        "GROQ_API_KEY": "********" if os.getenv("GROQ_API_KEY") else None,
        "GITHUB_ACCESS_TOKEN": "********" if os.getenv("GITHUB_ACCESS_TOKEN") else None,
    }


@mcp.tool
def update_settings(settings_dict: Dict[str, str]) -> Dict[str, Any]:
    """
    Update API key settings.

    Args:
        settings_dict: Dictionary of setting key-value pairs.

    Returns:
        Status confirmation.
    """
    for key, value in settings_dict.items():
        if key in ["GEMINI_API_KEY", "GROQ_API_KEY", "GITHUB_ACCESS_TOKEN"]:
            os.environ[key] = value

    return {"status": "success", "message": "Settings updated"}
