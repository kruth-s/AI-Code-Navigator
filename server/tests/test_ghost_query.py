import requests

def test_ghost_context():
    print("🔍 Testing: Where is 'ghost context' used/implemented?")
    print("=" * 70)
    
    response = requests.post(
        "http://localhost:8000/query",
        json={"question": "Where is ghost context used or implemented in this codebase? Show me the files and explain what it does."}
    )
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ Query successful!\n")
        print(f"📝 Answer:\n{result.get('answer', 'No answer')}\n")
        print(f"🎯 Confidence: {result.get('confidence', 'unknown')}")
        print(f"📚 Sources: {result.get('sources', [])}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_ghost_context()
