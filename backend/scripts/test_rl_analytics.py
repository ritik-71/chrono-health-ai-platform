"""Test the new RL analytics endpoint + verify existing RL APIs still work."""
import urllib.request, json

def test(url, label):
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            data = json.loads(r.read())
            print(f"[{r.status}] {label}")
            return data
    except Exception as e:
        print(f"[ERR] {label}: {e}")
        return None

# Existing APIs — must still work
test("http://localhost:8000/api/rl/simulation", "GET /api/rl/simulation")
test("http://localhost:8000/api/rl/history", "GET /api/rl/history")

# New analytics
data = test("http://localhost:8000/api/rl/analytics", "GET /api/rl/analytics")
if data:
    s = data["summary"]
    print(f"\n  Total steps: {s['total']}")
    print(f"  Cumulative R: {s['totalCumulativeReward']}")
    print(f"  Mean reward: {s['meanReward']}")
    print(f"  Best intervention: {s['bestIntervention']} (mean R = {s['bestMeanReward']})")
    print(f"  Unique interventions: {s['uniqueInterventions']}")
    print(f"  Q-heatmap cells: {len(data['qHeatmap'])}")
    print(f"  Policy evo points: {len(data['policyEvolution'])}")
    print(f"  Frequency entries: {len(data['frequency'])}")
    print(f"  Effectiveness entries: {len(data['effectiveness'])}")

# Frontend
try:
    with urllib.request.urlopen("http://localhost:3000/dashboard/rl", timeout=10) as r:
        print(f"\n[{r.status}] Frontend /dashboard/rl")
except Exception as e:
    print(f"\n[ERR] Frontend: {e}")
