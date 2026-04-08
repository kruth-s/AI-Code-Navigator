"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


# User Schemas
class UserBase(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    image: Optional[str] = None


class UserCreate(UserBase):
    github_id: Optional[str] = None
    provider: str = "github"


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email_verified: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None


# Repository Schemas
class RepositoryBase(BaseModel):
    name: str
    full_name: Optional[str] = None
    description: Optional[str] = None
    html_url: Optional[str] = None
    private: bool = False
    github_id: Optional[str] = None


class RepositoryCreate(RepositoryBase):
    pass


class RepositoryResponse(RepositoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    is_indexed: bool
    indexed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class RepositoryUpdate(BaseModel):
    is_indexed: Optional[bool] = None
    description: Optional[str] = None


# Session Schema
class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    expires: datetime
    created_at: datetime
