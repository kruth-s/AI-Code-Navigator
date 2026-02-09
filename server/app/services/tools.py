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
def vector_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search for relevant code chunks using Pinecone vector search.
    Returns a list of matches with file paths and text snippets.
    """
    if not index:
        return [{"error": "Pinecone not initialized or invalid key."}]
    
    try:
        vector = embeddings.embed_query(query)
        results = index.query(vector=vector, top_k=top_k, include_metadata=True)
        
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
def search_github_issues(query: str) -> List[Dict[str, Any]]:
    """Search GitHub issues."""
    # Mock for now
    return []

@tool
def get_pr_diff(pr_number: int) -> str:
    """Get the diff for a pull request."""
    # Mock for now
    return ""

def get_all_tools():
    return [vector_search, read_repository_file, search_code_fs, search_github_issues, get_pr_diff]
