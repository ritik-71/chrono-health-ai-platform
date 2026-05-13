"""Test the phenotype analytics endpoint."""
import urllib.request, json

url = "http://localhost:8000/api/phenotypes/analyze"
try:
    with urllib.request.urlopen(url, timeout=15) as resp:
        data = json.loads(resp.read())
        print(f"Status: {resp.status}")
        print(f"Total records classified: {data['summary']['total']}")
        print(f"Dominant phenotype: {data['dominant']} ({data['summary']['dominantPct']}%)")
        print(f"Distribution: {json.dumps(data['distribution'], indent=2)}")
        print(f"Risk segmentation: {json.dumps(data['riskSegmentation'], indent=2)}")
        print(f"Group comparison entries: {len(data['groupComparison'])}")
        for g in data['groupComparison']:
            print(f"  {g['phenotype']}: stress={g['avgStress']}, sleep={g['avgSleep']}, fatigue={g['avgFatigue']}, cii={g['avgCII']} (n={g['count']})")
        print(f"Radar profiles available: {list(data['radarProfiles'].keys())}")
        print(f"Trend data points: {len(data['trend'])}")
except Exception as e:
    print(f"ERROR: {e}")
