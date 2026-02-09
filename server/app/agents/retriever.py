from .base import BaseAgent
from typing import List

class RetrievalAgent(BaseAgent):
    def __init__(self, llm, tools: List[object]):
        super().__init__(name="Retrieval", tools=tools, llm=llm)

    async def retrieve_context(self, queries: List[str]) -> dict:
        context = []
        # Simple implementation: Loop through tools and call 'vector_search' if available
        # In a real agent, the LLM would decide which tool to call.
        # Here we enforce vector search for the demo.
        
        search_tool = next((t for t in self.tools if t.name == "vector_search"), None)
        
        if search_tool:
            for query in queries:
                try:
                    # Invoke the tool
                    result = search_tool.invoke({"query": query})
                    context.append(str(result))
                except Exception as e:
                    context.append(f"Error searching for {query}: {e}")
        else:
            context.append("Vector search tool not available.")

        return {"context": context}
