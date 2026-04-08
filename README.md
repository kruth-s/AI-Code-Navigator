# AI-Code-Navigator

An AI-powered Q&A assistant for developers that answers natural language queries about a codebase by combining large language models, vector search, and GitHub integration with **Neon PostgreSQL** and **Better Auth**.

## Overview

This Q&A Bot is an AI-powered assistant designed to help developers query large codebases efficiently. By combining large language models (LLMs) with vector search technologies, the system provides precise answers to natural language questions about repository contents. It integrates directly with GitHub Issues and Pull Requests, enabling context-aware discussions and automated responses.

**✨ New Features:**

- 🔐 **GitHub OAuth Authentication** via Better Auth
- 💾 **Neon PostgreSQL Database** for user and repository management
- 📊 **Full User Management** with session handling
- 🔄 **Automatic Database Migrations** with Drizzle (frontend) and Alembic (backend)

---

## Features

- **🔐 User Authentication** - GitHub OAuth login with Better Auth
- **💾 Database Integration** - Neon PostgreSQL for persistent storage
- **Natural Language Querying** - Ask questions such as _"Where is the login function implemented?"_ or _"Which files handle database connections?"_
- **Semantic Code Search** - Uses vector embeddings (via FAISS or Pinecone) to retrieve relevant code snippets.
- **LLM-Powered Responses** - Generates context-aware explanations and summaries of relevant code sections.
- **GitHub Integration** - Responds directly to questions in Issues and Pull Requests through the GitHub API.
- **Scalable Architecture** - Designed to work with both small projects and enterprise-scale repositories.

---

## Quick Start

### 1. Neon Database Setup

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret

### 3. Install & Configure

```bash
# Frontend
cd client
npm install
copy .env.example .env  # Edit with your credentials
npx drizzle-kit push    # Push schema to Neon DB

# Backend
cd ../server
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy .env.example .env  # Edit with your credentials
python scripts/init_db.py  # Initialize database
```

### 4. Run the App

```bash
# Terminal 1 - Backend
cd server
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd client
npm run dev
```

👉 **For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## Architecture

1. **Authentication & Database**
   - Better Auth handles GitHub OAuth flow
   - User data stored in Neon PostgreSQL
   - Session management with automatic expiration

2. **Code Embedding**
   - Repository files are parsed and converted into embeddings using a pre-trained model.
   - Embeddings are stored in a vector database (FAISS or Pinecone).

3. **Query Processing**
   - Developer submits a natural language query.
   - The query is embedded and matched against the code embeddings.

4. **Answer Generation**
   - Relevant code snippets are retrieved.
   - An LLM processes the context and generates a natural language answer.

5. **GitHub Integration**
   - Bot listens to Issues and PR comments.
   - Answers are posted automatically to the relevant discussion thread.

---

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Authentication**: Better Auth with GitHub OAuth
- **Backend**: Python (FastAPI) with MCP integration
- **Database**: Neon PostgreSQL (cloud)
- **ORM**: Drizzle (TypeScript), SQLAlchemy (Python)
- **Vector Database**: Pinecone (cloud)
- **LLM**: OpenAI API or Hugging Face Transformers
- **GitHub Integration**: GitHub REST/GraphQL API
- **Task Queue (Optional)**: Celery / Redis for background jobs
