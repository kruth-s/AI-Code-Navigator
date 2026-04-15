from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import init_db
from .mcp_server import mcp

# ─── Import ALL models BEFORE init_db so SQLAlchemy metadata is populated ───
from .models.user import User, Account, Session, VerificationToken
from .models.repository import Repository, IndexedFile

# ─── Import routes ───
from .api import routes_simple
from .api import users as user_routes
from .api import auth as auth_routes
from .api import github_repos as github_repos_routes

# Create the MCP HTTP ASGI app (path="/" because we mount at /mcp)
mcp_app = mcp.http_app(path="/")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — models are imported, metadata is ready
    init_db()
    print("✅ Database initialized with Neon PostgreSQL")
    if hasattr(mcp_app, 'lifespan'):
        async with mcp_app.lifespan(app):
            yield
    else:
        yield
    # Shutdown
    print("👋 Shutting down Akaza Backend")

app = FastAPI(
    title="Akaza Codebase Q&A Backend",
    version="0.2.0",
    description="AI-powered Codebase Q&A Agent with MCP integration",
    lifespan=lifespan,
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from .api import routes_simple
from .api import users as user_routes
from .api import auth as auth_routes
from .api import github_repos as github_repos_routes
from .api import code_reviewer as code_reviewer_routes

app.include_router(routes_simple.router)
app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(github_repos_routes.router)
app.include_router(code_reviewer_routes.router)

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
