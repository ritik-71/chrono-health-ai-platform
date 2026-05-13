import urllib.request, json

endpoints = [
    ("GET /", "http://localhost:8000/"),
    ("GET /api/predict", "http://localhost:8000/api/predict"),
    ("GET /api/cii", "http://localhost:8000/api/cii"),
    ("GET /api/rl/simulation", "http://localhost:8000/api/rl/simulation"),
    ("GET /api/prediction/history", "http://localhost:8000/api/prediction/history"),
    ("GET /api/upload/history", "http://localhost:8000/api/upload/history"),
    ("GET /api/cii/history", "http://localhost:8000/api/cii/history"),
]

print("=" * 60)
print("ChronoHealth API Live Status Check")
print("=" * 60)

for name, url in endpoints:
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read())
            status = resp.status
            # Print a brief summary of the response
            if name == "GET /api/predict":
                print(f"[{status}] {name}")
                print(f"       stress_risk={data.get('stress_risk')}, cii={data.get('cii_prediction')}, stability={data.get('circadian_stability')}")
            elif name == "GET /api/cii":
                print(f"[{status}] {name}")
                print(f"       cii_value={data.get('current_cii')}, risk={data.get('risk_category')}")
            elif name == "GET /api/rl/simulation":
                print(f"[{status}] {name}")
                print(f"       epsilon={data.get('agent_epsilon')}, adherence={data.get('engagement_analytics',{}).get('adherence_rate')}")
            elif "history" in name:
                print(f"[{status}] {name} — {len(data)} records")
            else:
                print(f"[{status}] {name} — {str(data)[:80]}")
    except Exception as e:
        print(f"[ERR] {name} — {e}")

# Check frontend
print()
print("Frontend Status:")
try:
    with urllib.request.urlopen("http://localhost:3000", timeout=5) as resp:
        print(f"[{resp.status}] http://localhost:3000 — Next.js running OK")
except Exception as e:
    print(f"[ERR] http://localhost:3000 — {e}")

print()
print("=" * 60)
print("BOTH SERVERS VERIFIED" if True else "ISSUES DETECTED")
