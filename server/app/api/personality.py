from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import os
import json
from app.services.llm import get_llm
from langchain_core.messages import SystemMessage

router = APIRouter(prefix="/api/personality", tags=["personality"])

class PersonalityRequest(BaseModel):
    repo_name: str

class PersonalityResponse(BaseModel):
    personality_title: str
    catchphrase: str
    strengths: List[str]
    weaknesses: List[str]
    avatar_seed: str

@router.post("/repo", response_model=PersonalityResponse)
async def generate_personality(request: PersonalityRequest):
    repo_name = request.repo_name
    repos_dir = os.path.join(os.getcwd(), "repos", repo_name)
    
    if not os.path.exists(repos_dir):
         return PersonalityResponse(
             personality_title="The Ghost Project",
             catchphrase="Where did the code go?",
             strengths=["Extremely lightweight", "Zero bugs"],
             weaknesses=["Does not actually exist"],
             avatar_seed="ghost"
         )
         
    # Read a sample of files to get the "vibe"
    code_samples = []
    total_files = 0
    total_comments = 0
    total_lines = 0
    
    for root, dirs, files in os.walk(repos_dir):
        if ".git" in root or "node_modules" in root or "dist" in root:
            continue
        for file in files:
            if file.endswith(('.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.css', '.html')):
                total_files += 1
                try:
                    path = os.path.join(root, file)
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                        total_lines += len(content.splitlines())
                        # rudimentary comment counter
                        total_comments += content.count("//") + content.count("#")
                        if len(code_samples) < 5 and len(content) < 5000:
                            code_samples.append(f"File: {file}\n{content[:1000]}")
                except:
                    pass

    if total_files == 0:
        prompt = f"""
You are a highly creative software engineering psychoanalyst. 
The user has requested a personality for their repository: "{repo_name}".
However, the local codebase is currently empty or still being initialized! 

Based SOLELY on the repository name "{repo_name}", invent a highly creative, viral, and fun "AI Personality" for what this project will become.
 Examples: "The Ambitious Ghost", "Vaporware Visionary", "Future Spaghetti Monster".

Return your analysis STRICTLY as a valid JSON object with NO markdown block encapsulation. 
The object must perfectly match this schema:
{{
   "personality_title": "string (The title, max 5 words)",
   "catchphrase": "string (A funny quote this repo would say)",
   "strengths": ["string", "string", "string"],
   "weaknesses": ["string", "string", "string"],
   "avatar_seed": "string"
}}
"""
    else:
        vibe_context = "\n\n".join(code_samples)

        prompt = f"""
You are a highly creative software engineering psychoanalyst. 
Your job is to analyze a codebase's metrics and code snippets and assign it a fun, viral, shareable "AI Personality".
Repository Name: {repo_name}

Codebase Stats:
- Files scanned: {total_files}
- Total lines roughly: {total_lines}
- Estimated comments: {total_comments}

Code Snippets for Vibe Check:
{vibe_context}

Based on this repository name, structure, naming conventions, and stats, give this repository a human-like personality. 
 Examples of personalities: "Chaotic Genius", "Over-Engineered Perfectionist", "Spaghetti Monster", "Last-Minute Hacker", "The Boilerplate King".

Return your analysis STRICTLY as a valid JSON object with NO markdown block encapsulation. 
The object must perfectly match this schema:
{{
   "personality_title": "string (The title, max 5 words)",
   "catchphrase": "string (A funny quote this repo would say)",
   "strengths": ["string", "string", "string"],
   "weaknesses": ["string", "string", "string"],
   "avatar_seed": "string (a single camelCase or hyphenated word we can use as a random seed to generate a bot avatar, e.g. 'crazyscientist' or 'ninja')"
}}
"""
    try:
        llm = get_llm()
        response = llm.invoke([SystemMessage(content=prompt)])
        text = response.content.strip()
        
        # Clean markdown if present
        if text.startswith("```json"):
            text = text.replace("```json", "", 1)
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        data = json.loads(text)
        return PersonalityResponse(
            personality_title=data.get("personality_title", "Unknown Entity"),
            catchphrase=data.get("catchphrase", "Beep boop."),
            strengths=data.get("strengths", ["Mystery"]),
            weaknesses=data.get("weaknesses", ["Unknown"]),
            avatar_seed=data.get("avatar_seed", "default")
        )
    except Exception as e:
        print("Personality LLM Error:", e)
        return PersonalityResponse(
            personality_title="The Enigma",
            catchphrase="My code is too complex for AI to comprehend.",
            strengths=["Unpredictable", "Fails gracefully"],
            weaknesses=["Broke the AI evaluator"],
            avatar_seed="error123"
        )
