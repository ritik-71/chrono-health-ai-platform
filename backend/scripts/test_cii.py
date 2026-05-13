import requests
import json
import time

def test_cii_history():
    base_url = "http://localhost:8000/api"
    
    print("--- Triggering 3 CII Computations ---")
    for i in range(3):
        res = requests.get(f"{base_url}/cii")
        print(f"CII Computation {i+1}: {res.status_code}")
        time.sleep(1)
        
    print("\n--- Fetching CII History ---")
    history_res = requests.get(f"{base_url}/cii/history")
    print(f"Status: {history_res.status_code}")
    if history_res.status_code == 200:
        history = history_res.json()
        print(f"Total Records: {len(history)}")
        print("Latest Record:")
        print(json.dumps(history[-1], indent=2))
    else:
        print(history_res.text)

if __name__ == "__main__":
    test_cii_history()
