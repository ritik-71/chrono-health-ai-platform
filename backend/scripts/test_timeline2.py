"""Test the Patient Journey Timeline API."""
import urllib.request, json

url = "http://localhost:8000/api/timeline/patient-journey"
try:
    with urllib.request.urlopen(url, timeout=15) as r:
        data = json.loads(r.read())
        print(f"Status: {r.status}")
        
        timeline = data.get("timeline", [])
        stats = data.get("recoveryStats", {})
        markers = data.get("interventionMarkers", [])
        
        print(f"\nTimeline days tracked: {len(timeline)}")
        if timeline:
            print(f"  Day 1: stressEMA={timeline[0]['stressEMA']}, ciiEMA={timeline[0]['ciiEMA']}")
            print(f"  Day {len(timeline)}: stressEMA={timeline[-1]['stressEMA']}, ciiEMA={timeline[-1]['ciiEMA']}")
            
        print(f"\nRecovery Stats:")
        for k, v in stats.items():
            print(f"  {k}: {v}")
            
        print(f"\nIntervention Markers: {len(markers)}")
        if markers:
            print(f"  First marker: {markers[0]}")
            
except Exception as e:
    print(f"ERROR: {e}")

# Frontend Check
try:
    with urllib.request.urlopen("http://localhost:3000/dashboard/patient-journey", timeout=10) as r:
        print(f"\nFrontend page: {r.status}")
except Exception as e:
    print(f"\nFrontend ERROR: {e}")
