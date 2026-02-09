from typing import TypedDict, List, Dict, Any, Union
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    input: str
    plan: List[str]
    context: List[Any]
    github_data: List[Any]
    answer: str
    messages: List[BaseMessage]
    final_output: Dict[str, Any]
