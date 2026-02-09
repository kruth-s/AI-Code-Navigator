from .base import BaseAgent

class SafetyAgent(BaseAgent):
    def __init__(self, llm):
        super().__init__(name="Safety", tools=[], llm=llm)

    async def check_response(self, content: str) -> dict:
        """Validate response for safety and accuracy."""
        prompt = f"Review this answer: {content}\nIs it safe and grounded in code? If not, flag it."
        result = await self.ainvoke(prompt)
        return {"review": result["content"]}
