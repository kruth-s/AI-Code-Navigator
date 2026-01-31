# AI-Code-Navigator Backend

## Overview
This is the backend for AI-Code-Navigator, a tool that allows developers to ask natural language questions about their codebase. It uses:
- **FastAPI** for the REST API
- **Celery + Redis** for background processing (ingestion, webhooks)
- **Pinecone** for vector storage
- **Groq** for LLM inference
- **sentence-transformers** for local embeddings

## Setup

1. **Prerequisites**:
   - Python 3.10+
   - Redis server running locally or accessible
   - Pinecone Account
   - Groq API Key
   - GitHub Personal Access Token

2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. **Start Redis**:
   Ensure Redis is running on the port specified in `.env` (default 6379).

2. **Start the API Server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.
   Docs are at `http://localhost:8000/docs`.

3. **Start the Celery Worker**:
   Open a new terminal and run:
   ```bash
   celery -A app.worker.celery_app worker --loglevel=info --pool=solo
   ```
   *Note: On Windows, use `--pool=solo`.*

## Architecture

- **`app/api`**: REST endpoints (`/ingest`, `/query`, `/webhooks`).
- **`app/services`**: Core logic (GitHub, Ingestion, LLM, VectorDB).
- **`app/worker`**: Async tasks for heavy lifting.
- **`app/core`**: Configuration.

## Usage

1. **Ingest a Repo**:
   POST `/api/v1/repositories/ingest`
   ```json
   { "repo_url": "https://github.com/user/repo" }
   ```

2. **Ask a Question**:
   POST `/api/v1/chat/query`
   ```json
   {
     "query": "How does the authentication work?",
     "repo_url": "https://github.com/user/repo"
   }
   ```

3. **GitHub Webhook**:
   Configure your GitHub repo settings -> Webhooks.
   - Payload URL: `http://<your-public-url>/api/v1/webhooks/`
   - Content type: `application/json`
   - Secret: Matches `.env`
   - Events: Issue comments, Pull request reviews.
   
   Comment `/ask Should I refactor this?` in a PR to trigger the bot.
