import asyncio
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
import os

load_dotenv()

async def test_groq():
    api_key = os.getenv("GROQ_API_KEY")
    print(f"Testing with key: {api_key[:5]}...")
    
    models = [
        "llama-3.1-70b-versatile",
        "llama3-70b-8192", 
        "llama3-8b-8192",
        "mixtral-8x7b-32768",
        "gemma-7b-it" 
    ]
    
    for model in models:
        print(f"Testing {model}...")
        llm = ChatGroq(
            api_key=api_key,
            model_name=model,
            temperature=0
        )
        
        try:
            response = await llm.ainvoke([HumanMessage(content="Hello")])
            print(f"Success with {model}: {response.content}")
            return
        except Exception as e:
            print(f"Failed with {model}: {e}")

if __name__ == "__main__":
    asyncio.run(test_groq())
