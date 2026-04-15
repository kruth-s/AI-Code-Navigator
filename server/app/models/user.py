"""
SQLAlchemy models for Users and related data
Mirrors the Better Auth schema structure
"""
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func as sql_func
import uuid
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    image = Column(Text, nullable=True)
    email_verified = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=sql_func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=sql_func.now(), onupdate=sql_func.now(), nullable=False)

    # Relationships
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    repositories = relationship("Repository", back_populates="user", cascade="all, delete-orphan")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=False)
    provider_account_id = Column(String(255), nullable=False)
    refresh_token = Column(Text, nullable=True)
    access_token = Column(Text, nullable=True)
    expires_at = Column(Integer, nullable=True)
    token_type = Column(String(255), nullable=True)
    scope = Column(String(255), nullable=True)
    id_token = Column(Text, nullable=True)
    session_state = Column(String(255), nullable=True)

    # Relationships
    user = relationship("User", back_populates="accounts")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_token = Column(String(255), unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires = Column(DateTime, nullable=False)

    # Relationships
    user = relationship("User", back_populates="sessions")


class VerificationToken(Base):
    __tablename__ = "verification_tokens"

    identifier = Column(String(255), primary_key=True)
    token = Column(String(255), unique=True, nullable=False)
    expires = Column(DateTime, nullable=False)
