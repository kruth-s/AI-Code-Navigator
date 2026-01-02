# Backend for AI-Code-Navigator

This is a FastAPI-based backend providing indexing, vector search, and LLM-based answers for the repository.

## Quick start

1. Create a Python venv and install dependencies:

```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

2. Start the app:

```bash
uvicorn backend.app.main:app --reload --port 8000
```

3. Endpoints:
- GET /health
- POST /index {"repo_path": "../"}
- POST /search {"query":"where is login","top_k":5}
- POST /answer {"query":"where is login","top_k":5}
- GET /files
- GET /file?path=path/to/file

Notes:
- If you set OPENAI_API_KEY environment variable, the answer endpoint will call OpenAI's Chat API.
- A more robust vector store and background task queue will be implemented next.
