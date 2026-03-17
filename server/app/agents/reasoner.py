from .base import BaseAgent
from typing import Dict, Any

class ReasoningAgent(BaseAgent):
    def __init__(self, llm):
        super().__init__(name="Reasoning", tools=[], llm=llm)

    async def generate_answer(self, user_query: str, context: list) -> Dict[str, Any]:
        """Synthesize answer from context."""
        
        prompt = f"""
        Question: {user_query}
        Context: {context}
        
        Answer based on the context provided.
        When mentioning GitHub issues, you MUST provide a markdown link to the issue using its url from the context (e.g., [Issue #123](https://github.com/...)).
        """
        
        response = await self.ainvoke(prompt)
        return {"answer": response["content"]}
