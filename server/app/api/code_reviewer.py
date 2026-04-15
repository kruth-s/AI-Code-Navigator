from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import os
import re
from app.services.llm import get_llm
from langchain_core.messages import SystemMessage

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
    rules = load_rules(sections)
    
    if not rules:
        return CodeReviewResponse(
            violations="None",
            suggestions="No specific rules matched for this code snippet based on SKILL.md.",
            severity="Info"
        )
    
    rules_text = "\n\n".join([f"### {r['section']}\n{r['content']}" for r in rules])
    
    prompt = f"""
You are a strict Next.js code reviewer.

Follow ONLY the rules below to evaluate the code:
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
