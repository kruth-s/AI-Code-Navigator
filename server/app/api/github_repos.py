"""
GitHub Repositories API Routes
Fetches repos from GitHub and manages connected repos in DB
"""
import os
import httpx
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import Account
from app.crud import users as user_crud
from app.crud import repositories as repo_crud
from app.schemas.user import RepositoryResponse, RepositoryCreate

router = APIRouter(prefix="/api/github/repos", tags=["github-repos"])


@router.get("/list")
async def list_github_repos(
    user_id: str,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Fetch all repositories for a GitHub user
    """
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = user_crud.get_user(db, user_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get GitHub access token from accounts
    account = db.query(Account).filter(
        Account.user_id == user_uuid,
        Account.provider == "github"
    ).first()

    if not account or not account.access_token:
        raise HTTPException(status_code=401, detail="GitHub token not found. Please reconnect your GitHub account.")

    # Fetch repos from GitHub API
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user/repos",
            headers={
                "Authorization": f"Bearer {account.access_token}",
                "Accept": "application/vnd.github.v3+json",
            },
            params={
                "type": "all",
                "sort": "updated",
                "direction": "desc",
                "page": page,
                "per_page": per_page,
            },
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"GitHub API error: {response.text}"
            )

        github_repos = response.json()

    # Get already connected repo IDs
    connected_repos = repo_crud.get_user_repositories(db, user_uuid)
    connected_github_ids = {r.github_id for r in connected_repos if r.github_id}

    # Format response
    result = []
    for repo in github_repos:
        result.append({
            "id": str(repo["id"]),
            "name": repo["name"],
            "full_name": repo["full_name"],
            "description": repo["description"] or "",
            "html_url": repo["html_url"],
            "private": repo["private"],
            "language": repo.get("language"),
            "stargazers_count": repo.get("stargazers_count", 0),
            "updated_at": repo.get("updated_at"),
            "is_connected": str(repo["id"]) in connected_github_ids,
        })

    return {
        "repositories": result,
        "page": page,
        "per_page": per_page,
        "total": len(result),
    }


@router.post("/connect/{repo_id}")
async def connect_repository(
    repo_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Connect a GitHub repository (save to database)
    """
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = user_crud.get_user(db, user_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get GitHub access token
    from app.models.user import Account
    account = db.query(Account).filter(
        Account.user_id == user_uuid,
        Account.provider == "github"
    ).first()

    if not account or not account.access_token:
        raise HTTPException(status_code=401, detail="GitHub token not found.")

    # Fetch repo details from GitHub
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.github.com/repositories/{repo_id}",
            headers={
                "Authorization": f"Bearer {account.access_token}",
                "Accept": "application/vnd.github.v3+json",
            },
        )

        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Repository not found on GitHub")

        github_repo = response.json()

    # Check if already connected
    existing = repo_crud.get_repository_by_github_id(db, str(github_repo["id"]))
    if existing:
        raise HTTPException(status_code=400, detail="Repository already connected")

    # Save to database
    repo_data = RepositoryCreate(
        github_id=str(github_repo["id"]),
        name=github_repo["full_name"],
        full_name=github_repo["full_name"],
        description=github_repo.get("description"),
        html_url=github_repo["html_url"],
        private=github_repo["private"],
    )

    repo = repo_crud.create_repository(db, user_uuid, repo_data)

    return {
        "id": str(repo.id),
        "name": repo.name,
        "github_id": repo.github_id,
        "message": f"Successfully connected {repo.name}",
    }


@router.delete("/disconnect/{repo_db_id}")
async def disconnect_repository(
    repo_db_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Disconnect a repository from the user
    """
    try:
        user_uuid = UUID(user_id)
        repo_uuid = UUID(repo_db_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID")

    repo = repo_crud.get_repository(db, repo_uuid)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    if repo.user_id != user_uuid:
        raise HTTPException(status_code=403, detail="Not authorized")

    repo_crud.delete_repository(db, repo_uuid)
    return {"message": f"Disconnected {repo.name}"}
