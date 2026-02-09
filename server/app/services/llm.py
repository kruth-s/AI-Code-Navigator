from langchain_groq import ChatGroq
from ..core.config import settings
from langchain_core.language_models.fake import FakeListLLM

def get_llm(model_name: str = "llama-3.3-70b-versatile"):
    key = settings.GROQ_API_KEY
    if not key or key.startswith("your_") or key == "":
        print("WARNING: GROQ_API_KEY not found or invalid. Using Fake LLM.")
        return FakeListLLM(responses=["Simulated LLM Response: No API Key Configured."] * 100)
    
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model_name=model_name,
        temperature=0
    )
