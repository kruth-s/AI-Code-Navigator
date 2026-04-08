"""
Script to initialize the database directly without Alembic
Use this for quick setup in development
"""
import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import init_db, engine
from app.models.user import User, Account, Session, VerificationToken
from app.models.repository import Repository, IndexedFile

def main():
    print("🚀 Initializing database with Neon PostgreSQL...")
    
    try:
        # Create all tables
        init_db()
        print("✅ Database initialized successfully!")
        print("\nCreated tables:")
        for table in ['users', 'accounts', 'sessions', 'verification_tokens', 'repositories', 'indexed_files']:
            print(f"  ✓ {table}")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
