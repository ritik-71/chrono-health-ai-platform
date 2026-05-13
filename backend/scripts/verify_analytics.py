"""Verification script for Advanced Analytics."""
import urllib.request
import json
import traceback

def test_endpoint(name, url, method="GET", body=None):
    try:
        req = urllib.request.Request(url, method=method)
        if body:
            req.data = json.dumps(body).encode()
            req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read()) if r.headers.get_content_type() == "application/json" else r.read().decode()
            print(f"[OK] {name} ({r.status})")
            return {"status": r.status, "data": data, "error": None}
    except Exception as e:
        print(f"[FAILED] {name} ({str(e)})")
        return {"status": None, "data": None, "error": str(e)}

def test_frontend(name, url):
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            print(f"[OK] Frontend {name} ({r.status})")
            return r.status
    except Exception as e:
        print(f"[FAILED] Frontend {name} ({str(e)})")
        return None

results = {}

# API Tests
results["context-chat"] = test_endpoint("Chatbot Context", "http://localhost:8000/api/context-chat", method="POST", body={"message": "Analyze my recent trend"})
results["cii-timeline"] = test_endpoint("CII Timeline", "http://localhost:8000/api/analytics/cii-timeline")
results["phenotypes"] = test_endpoint("Phenotypes", "http://localhost:8000/api/phenotypes/analyze")
results["correlations"] = test_endpoint("Correlations", "http://localhost:8000/api/analytics/correlations")
results["rl-analytics"] = test_endpoint("RL Analytics", "http://localhost:8000/api/rl/analytics")
results["shap-explainability"] = test_endpoint("SHAP Explainability", "http://localhost:8000/api/explainability/analyze")
results["patient-journey"] = test_endpoint("Patient Journey", "http://localhost:8000/api/timeline/patient-journey")

# Frontend Tests
fe_routes = [
    ("Dashboard", "http://localhost:3000/dashboard"),
    ("Chatbot", "http://localhost:3000/dashboard"),
    ("CII Timeline", "http://localhost:3000/dashboard/cii-timeline"),
    ("Phenotypes", "http://localhost:3000/dashboard/phenotypes"),
    ("Correlations", "http://localhost:3000/dashboard/correlations"),
    ("RL Simulation", "http://localhost:3000/dashboard/rl"),
    ("Explainability", "http://localhost:3000/dashboard/explainability"),
    ("Patient Journey", "http://localhost:3000/dashboard/patient-journey"),
]

for name, url in fe_routes:
    test_frontend(name, url)

# Summarize JSON validation
print("\nValidation Summary:")
for name, res in results.items():
    if res["error"]:
        print(f"❌ {name}: {res['error']}")
    else:
        # Check payload size
        keys = len(res["data"].keys()) if isinstance(res["data"], dict) else len(res["data"])
        print(f"✅ {name} (valid JSON, {keys} keys)")
