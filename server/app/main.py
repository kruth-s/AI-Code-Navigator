from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .mcp_server import mcp

# Create the MCP HTTP ASGI app (path="/" because we mount at /mcp)
mcp_app = mcp.http_app(path="/")

app = FastAPI(
    title="Akaza Codebase Q&A Backend",
    version="0.2.0",
    description="AI-powered Codebase Q&A Agent with MCP integration",
    lifespan=mcp_app.lifespan,
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes after app is created to avoid circular imports
from .api import routes_simple
app.include_router(routes_simple.router)

# Mount the MCP server at /mcp
# This exposes the MCP Streamable HTTP endpoint at http://localhost:8000/mcp
app.mount("/mcp", mcp_app)


@app.get("/")
async def root():
    return {
        "message": "Akaza Backend is running",
        "version": "0.2.0",
        "mcp_endpoint": "/mcp",
        "mcp_tools": [
            "query_codebase",
            "search_code_vectors",
            "search_code_files",
            "read_file",
            "get_github_issues",
            "list_repositories",
            "ingest_repository",
            "delete_repository",
            "clear_all_repositories",
            "get_settings",
            "update_settings",
        ],
    }


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Akaza Codebase Q&A", "mcp": "enabled"}
