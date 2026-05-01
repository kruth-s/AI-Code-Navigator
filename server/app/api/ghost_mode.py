from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/ghost", tags=["Ghost Mode"])

class Issue(BaseModel):
    id: str
    line: int
    title: str
    description: str
    severity: str
    confidence: int
    suggestion: str
    fixPatch: Optional[str] = None

class FileAnalysisResponse(BaseModel):
    file_path: str
    issues: List[Issue]

# Mock dummy data similar to the frontend MVP implementation
MOCK_ISSUES = [
    Issue(
        id="issue-1",
        line=8,
        title="Deep Nesting / Complexity",
        description="The authentication logic has deep nesting which makes it hard to read and maintain.",
        severity="High",
        confidence=87,
        suggestion="Extract validation logic into separate function or reduce nesting by using early returns.",
        fixPatch="""export const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token or invalid format' });
  }

  const actualToken = token.slice(7, token.length);
  
  try {
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User invalid or deactivated' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};"""
    ),
    Issue(
        id="issue-2",
        line=14,
        title="Database call in middleware",
        description="Calling the database on every authenticated request can cause performance bottlenecks.",
        severity="Medium",
        confidence=92,
        suggestion="Consider caching user sessions using Redis or rely on the JWT payload if immediate revocation isn't critical.",
        fixPatch=None
    )
]

@router.get("/analyze", response_model=FileAnalysisResponse)
async def analyze_file(repo_id: str, file_path: str):
    """
    Analyzes a file and returns potential issues and suggestions for Ghost Mode.
    Currently returns mock data for MVP.
    """
    # Here you would typically:
    # 1. Fetch file content from indexed DB or GitHub API using repo_id and file_path
    # 2. Run AST parser to identify complexity/long functions
    # 3. Use an LLM agent to analyze the code and generate the structured suggestions
    
    if "auth.js" in file_path:
        return FileAnalysisResponse(file_path=file_path, issues=MOCK_ISSUES)
    
    return FileAnalysisResponse(file_path=file_path, issues=[])
