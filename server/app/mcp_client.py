"""
MCP Client — AI Code Navigator

Internal MCP client that the FastAPI REST routes use to call MCP tools.
This demonstrates MCP as the core communication protocol:

    Frontend  →  REST routes  →  MCP Client  →  MCP Server (tools)

The client calls MCP tools directly through the in-process FastMCP server,
avoiding network overhead while keeping the MCP protocol as the contract.
"""

from typing import Dict, Any, List
from .mcp_server import (
    mcp,
    query_codebase,
    search_code_vectors,
    search_code_files,
    read_file,
    get_github_issues,
    list_repositories,
    ingest_repository,
    delete_repository,
    clear_all_repositories,
    get_settings,
    update_settings,
    repositories_db,
    _save_repos,
)


class MCPClient:
    """
    Thin wrapper that calls MCP tool functions directly (in-process).

    In a distributed setup, you would replace these with:
        from fastmcp import Client
        client = Client("http://remote-mcp-server:8000/mcp")
        async with client:
            result = await client.call_tool("query_codebase", {...})

    For now, calling the tool functions directly is both faster
    and avoids the need for a second network hop.
    """

    # ---- Codebase Q&A ----

    async def chat(self, query: str, repo_id: str) -> Dict[str, Any]:
        """Call the query_codebase MCP tool."""
        return await query_codebase(query=query, repo_id=repo_id)

    # ---- Code Search ----

    def vector_search(self, query: str, repo_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Call the search_code_vectors MCP tool."""
        return search_code_vectors(query=query, repo_id=repo_id, top_k=top_k)

    def grep_search(self, pattern: str, repo_id: str) -> List[str]:
        """Call the search_code_files MCP tool."""
        return search_code_files(pattern=pattern, repo_id=repo_id)

    def read_repo_file(self, file_path: str) -> str:
        """Call the read_file MCP tool."""
        return read_file(file_path=file_path)

    # ---- GitHub ----

    def fetch_issues(self, repo_url: str) -> List[Dict[str, Any]]:
        """Call the get_github_issues MCP tool."""
        return get_github_issues(repo_url=repo_url)

    # ---- Repository Management ----

    def get_repos(self) -> List[Dict[str, Any]]:
        """Call the list_repositories MCP tool."""
        return list_repositories()

    def start_ingest(self, repo_url: str) -> Dict[str, Any]:
        """Call the ingest_repository MCP tool."""
        return ingest_repository(repo_url=repo_url)

    def remove_repo(self, repo_id: str) -> Dict[str, Any]:
        """Call the delete_repository MCP tool."""
        return delete_repository(repo_id=repo_id)

    def clear_repos(self) -> Dict[str, Any]:
        """Call the clear_all_repositories MCP tool."""
        return clear_all_repositories()

    # ---- Settings ----

    def fetch_settings(self) -> Dict[str, Any]:
        """Call the get_settings MCP tool."""
        return get_settings()

    def save_settings(self, settings_dict: Dict[str, str]) -> Dict[str, Any]:
        """Call the update_settings MCP tool."""
        return update_settings(settings_dict=settings_dict)

    # ---- Direct access to shared state (for background tasks) ----

    @property
    def repos_db(self) -> Dict[str, Dict[str, Any]]:
        return repositories_db

    def save_repos(self):
        _save_repos(repositories_db)


# Singleton
mcp_client = MCPClient()
