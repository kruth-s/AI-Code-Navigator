"""
GitHub OAuth Authentication Routes
Handles the complete OAuth flow with GitHub
"""
import os
import httpx
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.crud import users as user_crud
from app.schemas.user import UserCreate

router = APIRouter(prefix="/api/auth/github", tags=["auth"])

# GitHub OAuth URLs
GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"

# OAuth credentials from env
GITHUB_CLIENT_ID = os.getenv("GITHUB_ID") or os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_SECRET") or os.getenv("GITHUB_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
GITHUB_CALLBACK_URL = os.getenv("GITHUB_CALLBACK_URL") or f"{BACKEND_URL}/api/auth/github/callback"

if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
    print("⚠️  WARNING: GitHub OAuth credentials not configured!")
    print("   Set GITHUB_ID and GITHUB_SECRET in your .env file")


@router.get("/login")
async def github_login():
    """
    Initiate GitHub OAuth login
    Redirects user to GitHub authorization page
    """
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")

    # Generate state parameter for CSRF protection
    state = secrets.token_urlsafe(32)

    # Build authorization URL - callback goes BACK to backend, not frontend
    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": GITHUB_CALLBACK_URL,
        "scope": "user:email public_repo",
        "state": state,
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    auth_url = f"{GITHUB_AUTH_URL}?{query_string}"
    
    # Redirect to GitHub
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def github_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """
    GitHub OAuth callback
    Exchanges code for access token and creates/updates user
    """
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    
    # Exchange authorization code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GITHUB_TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_CALLBACK_URL,
                "state": state,
            }
        )
        
        token_data = token_response.json()
        
        if "error" in token_data:
            raise HTTPException(
                status_code=400, 
                detail=f"GitHub OAuth error: {token_data.get('error_description', 'Unknown error')}"
            )
        
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get access token from GitHub")
        
        # Get user information from GitHub
        user_response = await client.get(
            GITHUB_USER_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
                "User-Agent": "AI-Code-Navigator",
            }
        )
        
        github_user = user_response.json()
    
    # Extract user data
    github_id = str(github_user.get("id"))
    name = github_user.get("name") or github_user.get("login")
    email = github_user.get("email")
    avatar_url = github_user.get("avatar_url")
    login = github_user.get("login")
    
    # If email is not public, fallback to a standard GitHub noreply email to prevent 403 OAuth blocking
    if not email:
        email = f"{login}@users.noreply.github.com"
    
    # Check if user already exists
    existing_user = user_crud.get_user_by_github(db, github_id)
    
    if existing_user:
        # Update existing user's account token
        user = existing_user
        user_crud.update_account_token(
            db,
            user_id=user.id,
            provider="github",
            access_token=access_token,
        )
    else:
        # Create new user
        user_data = UserCreate(
            name=name,
            email=email,
            image=avatar_url,
            github_id=github_id,
            provider="github",
        )
        user = user_crud.create_user(db, user_data)
        
        # Create OAuth account record
        user_crud.create_account(
            db,
            user_id=user.id,
            provider="github",
            provider_account_id=github_id,
            access_token=access_token,
        )
    
    # Create session (simple token-based)
    session_token = secrets.token_urlsafe(48)
    
    # Use timezone-aware UTC datetime to fix deprecation warning
    from datetime import timezone
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)  # 7 days
    
    user_crud.create_session(
        db,
        user_id=user.id,
        session_token=session_token,
        expires=expires_at,
    )
    
    # Redirect to frontend with session token in URL
    # In production, use HTTP-only cookies instead
    redirect_url = f"{FRONTEND_URL}/dashboard?session_token={session_token}&user_id={user.id}"
    return RedirectResponse(url=redirect_url)


@router.get("/user/{user_id}")
async def get_auth_user(user_id: str, db: Session = Depends(get_db)):
    """
    Get authenticated user information
    """
    from uuid import UUID
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = user_crud.get_user(db, user_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "image": user.image,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
