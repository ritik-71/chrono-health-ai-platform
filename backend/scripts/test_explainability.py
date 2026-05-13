"""Test SHAP explainability endpoints + verify prediction APIs untouched."""
import urllib.request, json

def test_get(url, label):
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            data = json.loads(r.read())
            print(f"[{r.status}] {label}")
            return data
    except Exception as e:
        print(f"[ERR] {label}: {e}")
        return None

def test_post(url, body, label):
    try:
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type":"application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
            print(f"[{r.status}] {label}")
            return data
    except Exception as e:
        print(f"[ERR] {label}: {e}")
        return None

# Original prediction APIs — must still work
test_get("http://localhost:8000/api/predict", "GET /api/predict (original)")
test_get("http://localhost:8000/api/prediction/history", "GET /api/prediction/history (original)")

# GET default explain
data = test_get("http://localhost:8000/api/explainability/analyze", "GET /api/explainability/analyze")
if data:
    print(f"  Method: {data['method']}")
    print(f"  Global importance: {[g['feature'] + '=' + str(g['importance']) for g in data['globalImportance']]}")
    print(f"  Targets: {list(data['targets'].keys())}")
    print(f"  Explanation cards: {len(data['explanationCards'])}")
    for card in data['explanationCards']:
        print(f"    [{card['target']}] prediction={card['prediction']}, driver={card['primaryDriver']}")

# POST custom explain
data2 = test_post("http://localhost:8000/api/explainability/analyze",
    {"hrv": 30, "sleep_duration": 4.5, "sleep_quality": 0.3, "cortisol_level": 28, "light_exposure": 1500},
    "POST /api/explainability/analyze (high-stress patient)")
if data2:
    print(f"  Stress: {data2['predictions']['stressRisk']}, CII: {data2['predictions']['cii']}")
    for t in data2['targets']:
        top = data2['targets'][t]['contributions'][0]
        print(f"    [{t}] top driver: {top['label']} (SHAP={top['shapValue']:.4f})")

# Frontend
try:
    with urllib.request.urlopen("http://localhost:3000/dashboard/explainability", timeout=10) as r:
        print(f"\n[{r.status}] Frontend /dashboard/explainability")
except Exception as e:
    print(f"\n[ERR] Frontend: {e}")
