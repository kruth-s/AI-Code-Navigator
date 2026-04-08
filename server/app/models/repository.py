"""
SQLAlchemy models for Repositories
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func as sql_func
import uuid
from app.core.database import Base


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    github_id = Column(String(255), unique=True, nullable=True)  # GitHub's repo ID
    name = Column(String(255), nullable=False)  # e.g., "owner/repo"
    full_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    html_url = Column(String(500), nullable=True)
    private = Column(Boolean, default=False)
    is_indexed = Column(Boolean, default=False)
    indexed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=sql_func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=sql_func.now(), onupdate=sql_func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="repositories")
    indexed_files = relationship("IndexedFile", back_populates="repository", cascade="all, delete-orphan")


class IndexedFile(Base):
    __tablename__ = "indexed_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(500), nullable=False)
    content_hash = Column(String(64), nullable=True)  # SHA-256 hash
    embeddings_stored = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=sql_func.now(), nullable=False)

    # Relationships
    repository = relationship("Repository", back_populates="indexed_files")
