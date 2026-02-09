from .base import BaseAgent
from typing import Dict, Any

class GitHubAgent(BaseAgent):
    def __init__(self, llm, tools: list):
        super().__init__(name="GitHub", tools=tools, llm=llm)

    async def analyze_issue(self, issue_id: int) -> Dict[str, Any]:
        tool = next((t for t in self.tools if t.name == "search_github_issues"), None)
        if tool:
            return {"issue_data": str(tool.invoke(f"issue {issue_id}"))}
        return {"error": "GitHub tool not available"}

    async def analyze_pr(self, pr_id: int) -> Dict[str, Any]:
        tool = next((t for t in self.tools if t.name == "get_pr_diff"), None)
        if tool:
             return {"pr_diff": str(tool.invoke(pr_id))}
        return {"error": "Diff tool not available"}
