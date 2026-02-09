from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Akaza Codebase Q&A"
    GROQ_API_KEY: Optional[str] = None
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_ENV: Optional[str] = "gcp-starter"
    PINECONE_INDEX: Optional[str] = "akaza.codebase"
    GITHUB_TOKEN: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()
