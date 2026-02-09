import asyncio
import os
from app.graph import app_graph
from app.services.llm import get_llm

async def test_graph_run():
    print("Testing Graph Execution...")
    try:
        initial_state = {
            "input": "test query",
            "context": [],
            "github_data": [],
            "messages": [],
            "plan": [],
            "answer": ""
        }
        print("Invoking graph...")
        result = await app_graph.ainvoke(initial_state)
        print("Graph execution successful!")
        print("Result:", result.get("final_output"))
    except Exception as e:
        print(f"Graph execution failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_graph_run())
