from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import os
import re
from app.services.llm import get_llm
from langchain_core.messages import SystemMessage
from ..core.repo_utils import resolve_repo_id

router = APIRouter(prefix="/api/review", tags=["code-reviewer"])

class CodeReviewRequest(BaseModel):
    code: str

class CodeReviewResponse(BaseModel):
    violations: str
    suggestions: str
    severity: str

BASE_PATH = "markdown_rules"

def load_index():
    path = os.path.join(BASE_PATH, "SKILL.md")
    if not os.path.exists(path):
        return []

    with open(path, "r") as f:
        content = f.read()

    sections = re.split(r"## ", content)[1:]
    parsed = []

    for sec in sections:
        lines = sec.strip().split("\n")
        if not lines: continue
        title = lines[0]
        file_line = [l for l in lines if l.startswith("file:")]
        keywords_line = [l for l in lines if l.startswith("keywords:")]

        file = file_line[0].split(":")[1].strip() if file_line else ""
        keywords = keywords_line[0].split(":")[1].strip().split(", ") if keywords_line else []

        parsed.append({
            "title": title,
            "file": file,
            "keywords": keywords
        })

    return parsed

def find_relevant_sections(code, index_data):
    relevant = []
    for section in index_data:
        for keyword in section["keywords"]:
            if keyword.lower() in code.lower():
                relevant.append(section)
                break
    return relevant

def load_rules(sections):
    rules = []
    for sec in sections:
        path = os.path.join(BASE_PATH, sec["file"])
        if os.path.exists(path):
            with open(path, "r") as f:
                rules.append({
                    "section": sec["title"],
                    "content": f.read()
                })
    return rules

@router.post("/", response_model=CodeReviewResponse)
async def review_code(request: CodeReviewRequest):
    code = request.code
    index_data = load_index()
    sections = find_relevant_sections(code, index_data)
    
    # If no specific keyword triggers match, evaluate the snippet against ALL rules
    if not sections:
        sections = index_data
        
    rules = load_rules(sections)
    
    if not rules:
        return CodeReviewResponse(
            violations="None",
            suggestions="No specific rules found in SKILL.md to evaluate.",
            severity="Info"
        )
    
    rules_text = "\n\n".join([f"### {r['section']}\n{r['content']}" for r in rules])
    
    prompt = f"""
You are a strict Next.js code reviewer.

Follow STRICTLY the rules provided below. 
Do NOT invent new rules. 
ONLY evaluate based on the given rules below. If the code does not violate the explicit text in these rules, you must find no violations.

Rules:
{rules_text}

Code to analyze:
{code}

Return your evaluation in the following exact format (no markdown blocks, strictly use these prefixes):
VIOLATIONS: <List any violations>
SUGGESTIONS: <List fixes>
SEVERITY: <High/Medium/Low>
"""

    llm = get_llm()
    response = llm.invoke([SystemMessage(content=prompt)])
    text = response.content
    
    violations = ""
    suggestions = ""
    severity = ""
    
    if "VIOLATIONS:" in text:
        parts = text.split("VIOLATIONS:")
        rest = parts[1] if len(parts) > 1 else ""
        if "SUGGESTIONS:" in rest:
            v_parts = rest.split("SUGGESTIONS:")
            violations = v_parts[0].strip()
            rest2 = v_parts[1]
            if "SEVERITY:" in rest2:
                s_parts = rest2.split("SEVERITY:")
                suggestions = s_parts[0].strip()
                severity = s_parts[1].strip()
            else:
                suggestions = rest2.strip()
        else:
            violations = rest.strip()
    else:
        suggestions = text

    return CodeReviewResponse(
        violations=violations or "No violations identified.",
        suggestions=suggestions or "Looks good based on strict rules.",
        severity=severity or "Info"
    )

class RepoReviewRequest(BaseModel):
    repo_name: str

import json

class Improvement(BaseModel):
    code_section: str
    rule_violated: str
    what_to_do: str
    severity: str

class FileReview(BaseModel):
    file_path: str
    improvements: List[Improvement]

class RepoReviewResponse(BaseModel):
    summary: str
    file_reviews: List[FileReview]

@router.post("/repo", response_model=RepoReviewResponse)
async def review_repository(request: RepoReviewRequest):
    repo_name = resolve_repo_id(request.repo_name)
    repos_dir = os.path.join(os.getcwd(), "repos", repo_name)
    
    if not os.path.exists(repos_dir):
        return RepoReviewResponse(
            summary="Repository not cloned locally. Please Index the repository first so it can be evaluated.",
            file_reviews=[]
        )
        
    index_data = load_index()
    if not index_data:
        return RepoReviewResponse(
            summary="No SKILL.md found in markdown_rules.",
            file_reviews=[]
        )

    code_files = []
    for root, dirs, files in os.walk(repos_dir):
        if ".git" in root or "node_modules" in root or "dist" in root:
            continue
        for file in files:
            if file.endswith(('.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.java')):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        code = f.read()
                        if len(code) > 0 and len(code) < 15000:
                            code_files.append((file, path, code))
                except:
                    pass
                if len(code_files) >= 10:
                    break
        if len(code_files) >= 10:
            break

    if not code_files:
        return RepoReviewResponse(
            summary="No supported code files found in the repository to evaluate.",
            file_reviews=[]
        )

    llm = get_llm()
    file_reviews = []
    high_issues = 0

    for file_name, path, code in code_files:
        sections = find_relevant_sections(code, index_data)
        if not sections:
            continue
            
        rules = load_rules(sections)
        rules_text = "\n\n".join([f"### {r['section']}\n{r['content']}" for r in rules])
        
        prompt = f"""
You are a strict codebase reviewer. Check the file `{file_name}`.

Follow STRICTLY the rules provided below. 
Do NOT invent new rules. 
ONLY evaluate based on the given rules below. If the code does not violate the explicit text in these rules, you must find no violations.

Rules:
{rules_text}

Code:
{code[:5000]}

Analyze the code section by section. If there is NO room for improvement based on the strict rules above, return exactly the string "NO_VIOLATIONS_FOUND".
Otherwise, return your review STRICTLY as a valid JSON array of objects. Do not wrap it in markdown codeblocks.
Each object must have these exact keys mapping to strings:
[
  {{
    "code_section": "Brief snippet of the problematic code",
    "rule_violated": "Name of the rule violated",
    "what_to_do": "What the developer should do to fix this",
    "severity": "High"
  }}
]
"""
        try:
            response = llm.invoke([SystemMessage(content=prompt)])
            text = response.content.strip()
            
            if "NO_VIOLATIONS_FOUND" in text:
                continue
                
            # Clean up potential markdown formatting from LLM
            if text.startswith("```json"):
                text = text.replace("```json", "", 1)
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            improvements_data = json.loads(text)
            parsed_improvements = []
            
            for item in improvements_data:
                sev = str(item.get("severity", "Info")).capitalize()
                if sev in ["High", "Critical"]:
                    high_issues += 1
                parsed_improvements.append(Improvement(
                    code_section=str(item.get("code_section", "")),
                    rule_violated=str(item.get("rule_violated", "")),
                    what_to_do=str(item.get("what_to_do", "")),
                    severity=sev
                ))
            
            if parsed_improvements:
                file_reviews.append(FileReview(
                    file_path=file_name,
                    improvements=parsed_improvements
                ))
                
        except Exception as e:
            print("LLM Parsing JSON Error:", e)
            continue
            
    summary = f"Evaluated {len(code_files)} files. Found room for improvement in {len(file_reviews)} files. Critical/High issues: {high_issues}."
    return RepoReviewResponse(
        summary=summary,
        file_reviews=file_reviews
    )
