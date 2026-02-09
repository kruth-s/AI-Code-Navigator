from .base import BaseAgent

class PlannerAgent(BaseAgent):
    def __init__(self, llm):
        super().__init__(name="Planner", tools=[], llm=llm)

    async def plan_task(self, query: str) -> dict:
        """Analyze the query and create a plan."""
        # Simple implementation
        prompt = f"Analyze this request and break it down into steps: {query}"
        result = await self.ainvoke(prompt)
        return {"plan": result["content"]}
