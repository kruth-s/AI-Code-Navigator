from fastapi import FastAPI
from .core.config import settings

app = FastAPI(
    title="Akaza Codebase Q&A Backend",
    version="0.1.0",
    description="AI-powered Codebase Q&A Agent"
)

@app.get("/")
async def root():
    return {"message": "Akaza Backend is running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

from pydantic import BaseModel
from .graph import app_graph
from typing import Dict, Any

class QueryRequest(BaseModel):
    question: str
    context: Dict[str, Any] = {}

@app.post("/query")
async def query_agent(request: QueryRequest):
    """
    Process a natural language query about the codebase.
    """
    initial_state = {
        "input": request.question,
        "context": [],
        "github_data": [],
        "messages": [],
        "plan": [],
        "answer": ""
    }
    
    # Run the graph
    result = await app_graph.ainvoke(initial_state)
    
    return result.get("final_output", {"error": "No output generated"})
