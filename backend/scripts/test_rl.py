import requests
import json
import time

def test_rl_history():
    base_url = "http://localhost:8000/api"
    
    print("--- Triggering 3 RL Simulations ---")
    for i in range(3):
        res = requests.get(f"{base_url}/rl/simulation")
        print(f"RL Simulation {i+1}: {res.status_code}")
        time.sleep(1)
        
    print("\n--- Fetching RL History ---")
    history_res = requests.get(f"{base_url}/rl/history")
    print(f"Status: {history_res.status_code}")
    if history_res.status_code == 200:
        history = history_res.json()
        print(f"Total Records: {len(history)}")
        print("Latest Record:")
        print(json.dumps(history[-1], indent=2))
    else:
        print(history_res.text)

if __name__ == "__main__":
    test_rl_history()
