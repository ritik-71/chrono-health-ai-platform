"""Verify the CII timeline analytics endpoint."""
import urllib.request, json

url = "http://localhost:8000/api/analytics/cii-timeline"
try:
    with urllib.request.urlopen(url, timeout=15) as resp:
        data = json.loads(resp.read())
        print(f"Status: {resp.status}")
        print(f"Timeline records: {len(data['timeline'])}")
        print(f"Weekly bins: {len(data['weeklyComparison'])}")
        print(f"Heatmap cells: {len(data['heatmap'])}")
        print(f"Summary: {json.dumps(data['summary'], indent=2)}")
        if data['timeline']:
            sample = data['timeline'][0]
            print(f"\nSample entry keys: {list(sample.keys())}")
            print(f"Sample entry: {json.dumps(sample, indent=2)}")
except Exception as e:
    print(f"ERROR: {e}")
