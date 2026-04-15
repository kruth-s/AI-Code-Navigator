"""
FastAPI routes for User management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.crud import users as user_crud
from app.schemas.user import (
    UserResponse, 
    UserCreate, 
    UserUpdate,
    RepositoryResponse,
    RepositoryCreate,
)
from app.crud import repositories as repo_crud

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    # In production, add authentication dependency here
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information
    TODO: Add authentication middleware to extract user from session
    """
    # For now, returns first user (for testing)
    users = user_crud.list_users(db, limit=1)
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return users[0]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get user by ID"""
    db_user = user_crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.post("/", response_model=UserResponse)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user (typically called after OAuth authentication)
    """
    # Check if user already exists
    if user_data.email:
        existing = user_crud.get_user_by_email(db, user_data.email)
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists")
    
    return user_crud.create_user(db, user_data)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    update_data: UserUpdate,
    db: Session = Depends(get_db)
):
    """Update user information"""
    db_user = user_crud.update_user(db, user_id, update_data)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.delete("/{user_id}")
async def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    """Delete a user"""
    success = user_crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


@router.get("/{user_id}/repositories", response_model=list[RepositoryResponse])
async def get_user_repositories(
    user_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all repositories for a user"""
    # Verify user exists
    db_user = user_crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return repo_crud.get_user_repositories(db, user_id, skip=skip, limit=limit)


@router.post("/{user_id}/repositories", response_model=RepositoryResponse)
async def add_repository(
    user_id: UUID,
    repo_data: RepositoryCreate,
    db: Session = Depends(get_db)
):
    """Add a repository to a user's account"""
    # Verify user exists
    db_user = user_crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return repo_crud.create_repository(db, user_id, repo_data)
