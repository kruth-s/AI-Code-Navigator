from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from app.services.llm import get_llm
from langchain_core.messages import SystemMessage

router = APIRouter(prefix="/api/brief", tags=["repo-brief"])

class BriefRequest(BaseModel):
    repo_name: str
    audience: Optional[str] = "Senior Engineer"
    tone: Optional[str] = "Energetic"

class BriefResponse(BaseModel):
    repo_name: str
    tech_stack: List[str]
    transcript: str
    duration_seconds: int = 60
    estimated_word_count: int

@router.post("/generate", response_model=BriefResponse)
async def generate_repo_brief(request: BriefRequest):
    repo_name = request.repo_name
    audience = request.audience
    tone = request.tone
    
    repos_dir = os.path.join(os.getcwd(), "repos", repo_name)
    
    code_samples = []
    total_files = 0
    languages = set()
    
    if os.path.exists(repos_dir):
        for root, dirs, files in os.walk(repos_dir):
            if ".git" in root or "node_modules" in root or "dist" in root or "__pycache__" in root:
                continue
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in ('.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h'):
                    total_files += 1
                    languages.add(ext.replace('.', ''))
                    try:
                        path = os.path.join(root, file)
                        with open(path, "r", encoding="utf-8") as f:
                            content = f.read()
                            if len(code_samples) < 12 and len(content) > 100:
                                # Get a good slice of the file
                                code_samples.append(f"File: {file}\n```\n{content[:1200]}\n```")
                    except:
                        pass
    
    vibe_context = "\n\n".join(code_samples)
    tech_stack_str = ", ".join(list(languages)[:5])
    
    prompt = f"""
You are a world-class technical communicator. Your task is to generate a **60-second spoken brief** of a GitHub repository.
The goal is to explain the architecture, core value, and technical "vibe" of the codebase as if you were speaking to a {audience} in a {tone} tone.

Repository Name: {repo_name}
Tech Stack (detected): {tech_stack_str}
Total Files: {total_files}

Code Context:
{vibe_context}

INSTRUCTIONS:
1. Write a script that is approximately 140-160 words (this fits well within 60 seconds of natural speech).
2. Start with a hook that captures the essence of the project.
3. Briefly mention the core tech stack and the most interesting architectural decision you notice.
4. End with a impactful closing statement.
5. Do NOT use markdown formatting in the transcript text (no bold, no italics, no bullet points). Just raw spoken text.
6. Detected Tech Stack should be a list of the most prominent technologies found.

Return your response STRICTLY as a valid JSON object:
{{
  "repo_name": "{repo_name}",
  "tech_stack": ["React", "TypeScript", "Tailwind"],
  "transcript": "Write the full script here...",
  "estimated_word_count": 150
}}
"""

    try:
        llm = get_llm()
        response = llm.invoke([SystemMessage(content=prompt)])
        text = response.content.strip()
        
        # Comprehensive JSON cleaning
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        text = text.strip()
        
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            # Emergency fallback if LLM returns text instead of JSON
            return BriefResponse(
                repo_name=repo_name,
                tech_stack=list(languages)[:5],
                transcript=text if len(text) > 50 else "This repository contains a collection of source files and resources. It seems to be a well-structured project focusing on " + repo_name + " related features.",
                estimated_word_count=len(text.split())
            )
            
        return BriefResponse(
            repo_name=data.get("repo_name", repo_name),
            tech_stack=data.get("tech_stack", list(languages)[:5]),
            transcript=data.get("transcript", "Error generating transcript."),
            estimated_word_count=len(data.get("transcript", "").split())
        )
    except Exception as e:
        print("Repo Brief LLM Error:", e)
        # Final fallback
        return BriefResponse(
            repo_name=repo_name,
            tech_stack=list(languages)[:5],
            transcript=f"Welcome to the 60-second brief for {repo_name}. This project is built using modern tech stacks including {tech_stack_str}. I've scanned {total_files} files and the architecture looks solid. Dig into the modules to learn more.",
            estimated_word_count=40
        )
