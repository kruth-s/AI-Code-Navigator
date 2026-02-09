import asyncio
import os
from langchain_core.language_models.fake import FakeListLLM
from langchain_core.messages import AIMessage

async def test_fake_llm():
    llm = FakeListLLM(responses=["No API key provided."])
    try:
        response = await llm.ainvoke("test")
        print(f"Response type: {type(response)}")
        print(f"Response content: {response}")
        if hasattr(response, 'content'):
            print(f"Content attr: {response.content}")
        else:
            print("No content attribute")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_fake_llm())
