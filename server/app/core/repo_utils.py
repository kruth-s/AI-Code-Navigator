from typing import Dict, Any
from .database import SessionLocal
from ..models.repository import Repository as RepositoryModel
import json
import os

REPOS_FILE = os.path.join(os.getcwd(), "repositories.json")

def load_repos_json() -> Dict[str, Dict[str, Any]]:
    if os.path.exists(REPOS_FILE):
        try:
            with open(REPOS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def resolve_repo_id(repo_id: str) -> str:
    """
    Resolves a repository identifier (slug, UUID, or URL) 
    to its standard slug in repositories.json.
    """
    if not repo_id:
        return repo_id

    repos_db = load_repos_json()

    # 1. Direct slug match
    if repo_id in repos_db:
        return repo_id

    # 2. Check for URL match
    for rid, data in repos_db.items():
        if data.get("url") == repo_id or data.get("url") == repo_id + ".git":
            return rid

    # 3. Resolve via DB if it looks like a UUID
    if len(repo_id) >= 32:
        db = SessionLocal()
        try:
            sql_repo = (
                db.query(RepositoryModel)
                .filter(RepositoryModel.id == repo_id)
                .first()
            )
            if sql_repo and sql_repo.html_url:
                url = sql_repo.html_url
                for rid, data in repos_db.items():
                    if data.get("url") == url or data.get("url") == url + ".git":
                        return rid
        except Exception:
            pass
        finally:
            db.close()

    return repo_id
