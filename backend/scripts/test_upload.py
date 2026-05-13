import requests
import os
import json

def test_upload():
    url = "http://localhost:8000/api/upload"
    # Create a dummy CSV file
    csv_content = "timestamp,heart_rate,steps,sleep_stage\n2026-05-11 08:00:00,72,0,awake\n2026-05-11 08:15:00,75,120,awake\n2026-05-11 23:00:00,60,0,rem\n2026-05-12 02:00:00,55,0,deep"
    
    file_path = "test_clinical_data.csv"
    with open(file_path, "w") as f:
        f.write(csv_content)
    
    try:
        with open(file_path, "rb") as f:
            files = {"file": (file_path, f, "text/csv")}
            response = requests.post(url, files=files)
            
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code == 200:
            print("\n--- Testing History API ---")
            history_url = "http://localhost:8000/api/upload/history"
            history_response = requests.get(history_url)
            print(f"History Status Code: {history_response.status_code}")
            print(json.dumps(history_response.json(), indent=2))
            
    except Exception as e:
        print(f"Error during test: {e}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == "__main__":
    test_upload()
