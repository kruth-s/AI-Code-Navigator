"""
CRUD operations for Repositories
"""
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.repository import Repository, IndexedFile
from app.schemas.user import RepositoryCreate, RepositoryUpdate


def get_repository(db: Session, repo_id: UUID) -> Repository | None:
    """Get repository by ID"""
    return db.query(Repository).filter(Repository.id == repo_id).first()


def get_repository_by_github_id(db: Session, github_id: str) -> Repository | None:
    """Get repository by GitHub ID"""
    return db.query(Repository).filter(Repository.github_id == github_id).first()


def get_user_repositories(db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> list[Repository]:
    """Get all repositories for a user"""
    return (
        db.query(Repository)
        .filter(Repository.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_repository(db: Session, user_id: UUID, repo_data: RepositoryCreate) -> Repository:
    """Create a new repository"""
    db_repo = Repository(
        user_id=user_id,
        github_id=repo_data.github_id,
        name=repo_data.name,
        full_name=repo_data.full_name,
        description=repo_data.description,
        html_url=repo_data.html_url,
        private=repo_data.private,
    )
    db.add(db_repo)
    db.commit()
    db.refresh(db_repo)
    return db_repo


def update_repository(db: Session, repo_id: UUID, update_data: RepositoryUpdate) -> Repository | None:
    """Update repository information"""
    db_repo = get_repository(db, repo_id)
    if not db_repo:
        return None
    
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(db_repo, field, value)
    
    db.commit()
    db.refresh(db_repo)
    return db_repo


def mark_repository_indexed(db: Session, repo_id: UUID) -> Repository | None:
    """Mark a repository as indexed"""
    from datetime import datetime
    db_repo = get_repository(db, repo_id)
    if not db_repo:
        return None
    
    db_repo.is_indexed = True
    db_repo.indexed_at = datetime.utcnow()
    db.commit()
    db.refresh(db_repo)
    return db_repo


def delete_repository(db: Session, repo_id: UUID) -> bool:
    """Delete a repository"""
    db_repo = get_repository(db, repo_id)
    if not db_repo:
        return False
    
    db.delete(db_repo)
    db.commit()
    return True


def add_indexed_file(
    db: Session,
    repository_id: UUID,
    file_path: str,
    content_hash: str | None = None
) -> IndexedFile:
    """Add an indexed file record"""
    db_file = IndexedFile(
        repository_id=repository_id,
        file_path=file_path,
        content_hash=content_hash,
        embeddings_stored=False,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def get_repository_indexed_files(db: Session, repo_id: UUID) -> list[IndexedFile]:
    """Get all indexed files for a repository"""
    return db.query(IndexedFile).filter(IndexedFile.repository_id == repo_id).all()
