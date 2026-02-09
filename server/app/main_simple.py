from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings

app = FastAPI(
    title="Akaza Codebase Q&A Backend",
    version="0.1.0",
    description="AI-powered Codebase Q&A Agent"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes after app is created to avoid circular imports
from .api import routes_simple
app.include_router(routes_simple.router)

@app.get("/")
async def root():
    return {"message": "Akaza Backend is running", "version": "0.1.0"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Akaza Codebase Q&A"}
