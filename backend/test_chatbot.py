import requests
import json

def test_chatbot():
    url = "http://localhost:8000/api/chatbot"
    payload = {
        "message": "Is there a police station nearby?",
        "history": [],
        "lat": 17.3850,
        "lon": 78.4867
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chatbot()
