import asyncio
from app.services.tools import vector_search
from app.graph import app_graph

async def test_ghost_context_query():
    print("=" * 60)
    print("Testing: Where is 'ghost context' used/implemented?")
    print("=" * 60)
    
    # Test 1: Direct vector search
    print("\n1️⃣ Direct Vector Search:")
    print("-" * 60)
    results = vector_search.invoke({"query": "ghost context implementation", "top_k": 5})
    for i, result in enumerate(results, 1):
        if "error" in result:
            print(f"Error: {result['error']}")
        else:
            print(f"\n[{i}] File: {result['file']}")
            print(f"    Score: {result['score']:.4f}")
            print(f"    Content: {result['content'][:200]}...")
    
    # Test 2: Full agent pipeline
    print("\n\n2️⃣ Full Agent Pipeline (Planner → Retrieval → Reasoning):")
    print("-" * 60)
    
    initial_state = {
        "input": "Where is ghost context used or implemented in this codebase?",
        "context": [],
        "github_data": [],
        "messages": [],
        "plan": [],
        "answer": ""
    }
    
    result = await app_graph.ainvoke(initial_state)
    
    print("\n📊 Final Answer:")
    print("-" * 60)
    final_output = result.get("final_output", {})
    print(f"Answer: {final_output.get('answer', 'No answer generated')}")
    print(f"Confidence: {final_output.get('confidence', 'unknown')}")
    print(f"Sources: {final_output.get('sources', [])}")

if __name__ == "__main__":
    asyncio.run(test_ghost_context_query())
