import requests
import json
import time

def test_predictions():
    base_url = "http://localhost:8000/api"
    
    print("--- Triggering 5 Predictions ---")
    for i in range(5):
        res = requests.get(f"{base_url}/predict")
        print(f"Prediction {i+1}: {res.status_code}")
        time.sleep(1) # Wait a bit to have distinct timestamps
        
    print("\n--- Fetching Prediction History ---")
    history_res = requests.get(f"{base_url}/prediction/history")
    print(f"Status: {history_res.status_code}")
    if history_res.status_code == 200:
        history = history_res.json()
        print(f"Total Records: {len(history)}")
        print("Latest Record:")
        print(json.dumps(history[-1], indent=2))
    else:
        print(history_res.text)

if __name__ == "__main__":
    test_predictions()
