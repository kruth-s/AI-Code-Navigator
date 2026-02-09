import requests

def test_query():
    print("Testing server query endpoint...")
    response = requests.post(
        "http://localhost:8000/query",
        json={"question": "How does authentication work?"}
    )
    if response.status_code == 200:
        print("Success!")
        print(response.json())
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_query()
