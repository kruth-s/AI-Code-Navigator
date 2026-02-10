from typing import TypedDict, List, Dict, Any, Union, Optional
from typing_extensions import NotRequired
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    input: str
    repo_id: NotRequired[str]  # Repository ID for context (optional)
    plan: List[str]
    context: List[Any]
    github_data: List[Any]
    answer: str
    messages: List[BaseMessage]
    final_output: Dict[str, Any]
