from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import os
import json
from app.services.llm import get_llm
from langchain_core.messages import SystemMessage

router = APIRouter(prefix="/api/architecture", tags=["architecture"])

class ArchitectureRequest(BaseModel):
    repo_name: str

class ArchitectureResponse(BaseModel):
    nodes: List[dict]
    edges: List[dict]
    tech_stack: List[str]
    architecture_summary: str
    issues: List[str]

@router.post("/generate", response_model=ArchitectureResponse)
async def generate_architecture(request: ArchitectureRequest):
    repo_name = request.repo_name
    repos_dir = os.path.join(os.getcwd(), "repos", repo_name)
    
    # Very high-level extraction of packages and folders
    architecture_context = ""
    total_files = 0
    package_json = ""
    requirements_txt = ""
    folder_structure = []
    
    if os.path.exists(repos_dir):
        for root, dirs, files in os.walk(repos_dir):
            if ".git" in root or "node_modules" in root or ".next" in root or "dist" in root or "build" in root:
                continue
            folder_structure.append(os.path.relpath(root, repos_dir))
            for file in files:
                if file.endswith(('.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go')):
                    total_files += 1
                if file == "package.json" and len(package_json) == 0:
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                            package_json = f.read()[:1000]
                    except:
                        pass
                if file == "requirements.txt" and len(requirements_txt) == 0:
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                            requirements_txt = f.read()[:1000]
                    except:
                        pass
    
    # We truncate folder structure so LLM doesn't overflow
    folder_text = "\n".join(folder_structure[:100])

    if total_files == 0:
        prompt = f"""
You are an expert Solutions Architect.
The user wants an Architectural Diagram for their repository '{repo_name}'.
However, the local codebase is empty or uninitialized.

Based ONLY on the repository name '{repo_name}', creatively imagine an advanced System Architecture for what this product could be.

Return ONLY a valid JSON object matching this schema. NO markdown backticks.
{{
  "nodes": [
    {{"id": "frontend", "label": "Frontend (React)"}},
    {{"id": "api", "label": "API Gateway"}},
    {{"id": "db", "label": "Database (PostgreSQL)"}}
  ],
  "edges": [
    {{"id": "e1", "source": "frontend", "target": "api", "label": "REST"}},
    {{"id": "e2", "source": "api", "target": "db", "label": "SQL"}}
  ],
  "tech_stack": ["React", "Node.js", "PostgreSQL"],
  "architecture_summary": "Simulated architecture describing layers...",
  "issues": ["Simulated bottleneck point"]
}}
"""
    else:
        prompt = f"""
You are an expert Solutions Architect.
Analyze this repository's structure and dependencies to map out its System Architecture. Create a component graph mapping.

Repository Name: {repo_name}
Folders detected:
{folder_text}

Dependencies found (package.json):
{package_json}

Dependencies found (requirements.txt):
{requirements_txt}

Return ONLY a valid JSON object matching this schema mapped for React Flow graph rendering. NO markdown backticks.
{{
  "nodes": [
    {{"id": "frontend", "label": "Frontend (Next.js)"}},
    {{"id": "backend", "label": "Backend (FastAPI)"}},
    {{"id": "db", "label": "Database (Pinecone)"}}
  ],
  "edges": [
    {{"id": "e1-2", "source": "frontend", "target": "backend", "label": "API Call"}},
    {{"id": "e2-3", "source": "backend", "target": "db", "label": "Vector Search"}}
  ],
  "tech_stack": ["React", "PostgreSQL", "Kafka"],
  "architecture_summary": "Short description of the system architecture pattern detected.",
  "issues": ["Any detected single points of failure, tight coupling."]
}}
"""

    try:
        llm = get_llm()
        response = llm.invoke([SystemMessage(content=prompt)])
        text = response.content.strip()
        
        # Clean markdown
        if text.startswith("```json"):
            text = text.replace("```json", "", 1)
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        data = json.loads(text)
        return ArchitectureResponse(
            nodes=data.get("nodes", [{"id": "1", "label": "Unknown"}]),
            edges=data.get("edges", []),
            tech_stack=data.get("tech_stack", ["Unknown"]),
            architecture_summary=data.get("architecture_summary", "Could not fully parse structure."),
            issues=data.get("issues", ["Manual review required."])
        )
    except Exception as e:
        print("Architecture Diagram Error:", e)
        return ArchitectureResponse(
            nodes=[{"id": "error", "label": "Error Occurred"}],
            edges=[],
            tech_stack=["Error"],
            architecture_summary="The analysis engine failed to parse the architectural graph.",
            issues=[str(e)]
        )
