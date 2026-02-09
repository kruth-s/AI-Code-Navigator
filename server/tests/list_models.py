import os
from dotenv import load_dotenv
import requests

load_dotenv()

def list_models():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("No API Key")
        return

    url = "https://api.groq.com/openai/v1/models"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            models = response.json()
            print("Available models:")
            for m in models['data']:
                print(f"- {m['id']}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    list_models()
