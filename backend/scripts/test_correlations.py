"""Test the correlation analytics endpoint."""
import urllib.request, json

url = "http://localhost:8000/api/analytics/correlations"
try:
    with urllib.request.urlopen(url, timeout=15) as resp:
        data = json.loads(resp.read())
        s = data["summary"]
        print(f"Status: {resp.status}")
        print(f"Total records: {s['total']}")
        print(f"Features: {s['features']}")
        print(f"Strongest pair: {s['strongestPair']} (|r| = {s['strongestR']})")
        print(f"Matrix cells: {len(data['matrix'])}")
        print(f"Pair keys: {list(data['pairs'].keys())}")
        print(f"\nStress-Sleep analysis: r={data['analyses']['stressSleep']['r']}, strength={data['analyses']['stressSleep']['strength']}")
        print(f"Fatigue-Sleep analysis: r={data['analyses']['fatigueSleep']['r']}, strength={data['analyses']['fatigueSleep']['strength']}")
        print(f"\nFeature stats:")
        for f, st in data['featureStats'].items():
            print(f"  {f}: mean={st['mean']}, std={st['std']}, range=[{st['min']}, {st['max']}]")
except Exception as e:
    print(f"ERROR: {e}")

# Frontend check
try:
    with urllib.request.urlopen("http://localhost:3000/dashboard/correlations", timeout=10) as resp:
        print(f"\nFrontend page: {resp.status}")
except Exception as e:
    print(f"\nFrontend: {e}")
