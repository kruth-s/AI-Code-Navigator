from langchain_core.tools import tool
from typing import List, Dict, Any
import os
try:
    from pinecone import Pinecone
except ImportError:
    pass

from langchain_community.embeddings import HuggingFaceEmbeddings
from ..core.config import settings

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

pc = None
index = None

try:
    if settings.PINECONE_API_KEY:
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX)
except Exception as e:
    print(f"Pinecone init error: {e}")

@tool
def vector_search(query: str, repo_id: str = None, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search for relevant code chunks using Pinecone vector search.
    Returns a list of matches with file paths and text snippets.
    Args:
        query: The search query
        repo_id: The repository ID to search in (namespace)
        top_k: Number of results to return
    """
    if not index:
        return [{"error": "Pinecone not initialized or invalid key."}]
    
    if not repo_id:
        return [{"error": "Please specify a repo_id to search in"}]
    
    try:
        vector = embeddings.embed_query(query)
        # Query specific namespace for this repo
        results = index.query(
            vector=vector, 
            top_k=top_k, 
            include_metadata=True,
            namespace=repo_id  # Search only in this repo's namespace
        )
        
        matches = []
        for match in results.matches:
            matches.append({
                "file": match.metadata.get("source", "unknown"),
                "content": match.metadata.get("text", "")[:500] + "...", # Truncate for display
                "score": match.score
            })
        return matches
    except Exception as e:
        return [{"error": str(e)}]

@tool
def read_repository_file(file_path: str) -> str:
    """Read contents of a file from the repository. Path should be relative to repo root or absolute."""
    # Handle absolute paths from ingestion metadata which stored absolute paths
    # If path is absolute, use it directly if it exists
    if os.path.exists(file_path):
         try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
         except Exception as e:
            return f"Error reading file: {e}"

    # Try relative to repos dir
    # For now assume one repo "object-identity-ai-gcp"
    repo_name = "object-identity-ai-gcp"
    abs_path = os.path.join(os.getcwd(), "repos", repo_name, file_path)
    
    try:
        if os.path.exists(abs_path):
            with open(abs_path, "r", encoding="utf-8") as f:
                return f.read()
        else:
            return f"File not found: {file_path}"
    except Exception as e:
        return str(e)

@tool
def search_code_fs(query: str) -> List[str]:
    """
    Search for a string pattern in the repository files (grep-like).
    Useful if vector search fails or for exact matches.
    """
    repo_name = "object-identity-ai-gcp"
    repo_path = os.path.join(os.getcwd(), "repos", repo_name)
    matches = []
    
    if not os.path.exists(repo_path):
        return ["Repository not found."]

    for root, _, files in os.walk(repo_path):
        if ".git" in root: continue
        for file in files:
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8", errors='ignore') as f:
                    content = f.read()
                    if query in content:
                        # Find line number or snippet?
                        lines = content.split('\n')
                        for i, line in enumerate(lines):
                            if query in line:
                                matches.append(f"{path}:{i+1}: {line.strip()}")
            except: pass
            if len(matches) > 20: break # Limit results
            
    return matches

@tool
def search_github_issues(repo_url: str) -> List[Dict[str, Any]]:
    """
    Fetch open GitHub issues for a repository.
    Args:
        repo_url: The GitHub repository URL (e.g. https://github.com/owner/repo)
    Returns:
        A list of open issues with number, title, labels, user, and URL.
    """
    import re
    import httpx

    match = re.search(r"github\.com/([^/]+)/([^/]+)", repo_url)
    if not match:
        return [{"error": "Not a valid GitHub repository URL"}]

    owner = match.group(1)
    repo_name = match.group(2).replace(".git", "")

    try:
        headers = {"Accept": "application/vnd.github+json"}
        token = settings.GITHUB_ACCESS_TOKEN or settings.GITHUB_TOKEN
        if token and len(token) > 10 and not token.startswith("your_"):
            headers["Authorization"] = f"Bearer {token}"

        response = httpx.get(
            f"https://api.github.com/repos/{owner}/{repo_name}/issues",
            params={"state": "open", "per_page": 15},
            headers=headers,
            timeout=15.0
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
                "labels": [l["name"] for l in issue.get("labels", [])],
                "user": issue["user"]["login"] if issue.get("user") else "unknown",
                "html_url": issue["html_url"],
                "body": (issue.get("body") or "")[:150]
            })

        return issues
    except Exception as e:
        return [{"error": f"Failed to fetch issues: {str(e)}"}]

@tool
def get_pr_diff(pr_number: int) -> str:
    """Get the diff for a pull request."""
    # Mock for now
    return ""

def get_all_tools():
    return [vector_search, read_repository_file, search_code_fs, search_github_issues, get_pr_diff]
