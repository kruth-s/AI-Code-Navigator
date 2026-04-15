"""
CRUD operations for Users
"""
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from app.models.user import User, Account, Session
from app.schemas.user import UserCreate, UserUpdate


def get_user(db: Session, user_id: UUID) -> User | None:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_github(db: Session, github_account_id: str) -> User | None:
    """Get user by GitHub account ID"""
    account = db.query(Account).filter(
        Account.provider == "github",
        Account.provider_account_id == github_account_id
    ).first()
    
    if account:
        return db.query(User).filter(User.id == account.user_id).first()
    return None


def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user"""
    db_user = User(
        name=user_data.name,
        email=user_data.email,
        image=user_data.image,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: UUID, update_data: UserUpdate) -> User | None:
    """Update user information"""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: UUID) -> bool:
    """Delete a user"""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True


def list_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    """List all users with pagination"""
    return db.query(User).offset(skip).limit(limit).all()


def create_account(
    db: Session, 
    user_id: UUID, 
    provider: str, 
    provider_account_id: str,
    access_token: str | None = None,
    refresh_token: str | None = None,
    expires_at: int | None = None
) -> Account:
    """Create an OAuth account linked to a user"""
    db_account = Account(
        user_id=user_id,
        type="oauth",
        provider=provider,
        provider_account_id=provider_account_id,
        access_token=access_token,
        refresh_token=refresh_token,
        expires_at=expires_at,
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


def create_session(
    db: Session, 
    user_id: UUID, 
    session_token: str,
    expires: any
) -> Session:
    """Create a user session"""
    db_session = Session(
        user_id=user_id,
        session_token=session_token,
        expires=expires,
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session
