from typing import List, Dict, Any, Optional
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

class BaseAgent:
    def __init__(self, name: str, tools: List[Any], llm: Any):
        self.name = name
        self.tools = tools
        self.llm = llm

    async def ainvoke(self, query: str) -> Dict[str, Any]:
        """Invoke the agent asynchronously."""
        # Simple implementation, usually involves LangGraph or LangChain
        messages = [
            SystemMessage(content=f"You are the {self.name} agent."),
            HumanMessage(content=query)
        ]
        
        # If tools are bound, bind them
        if self.tools and hasattr(self.llm, "bind_tools"):
            model = self.llm.bind_tools(self.tools)
        else:
            model = self.llm
        
        response = await model.ainvoke(messages)
        
        content = response.content if hasattr(response, "content") else str(response)
        return {"content": content}
