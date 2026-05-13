import requests
import json

base = "http://localhost:8000"
results = []

# Test Register
r = requests.post(f"{base}/api/v1/auth/register", json={"name":"Diagnostics Bot","email":"diag_final@test.com","password":"testpass123"})
results.append(f"Register: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    token = data["access_token"][:30]
    results.append(f"  Token: {token}...")
    results.append(f"  User: {data['user']}")
else:
    results.append(f"  Error: {r.text[:300]}")

# Test Login
r2 = requests.post(f"{base}/api/v1/auth/login", json={"email":"diag_final@test.com","password":"testpass123"})
results.append(f"Login: {r2.status_code}")
if r2.status_code == 200:
    token2 = r2.json()["access_token"][:30]
    results.append(f"  Token: {token2}...")
else:
    results.append(f"  Error: {r2.text[:300]}")

# Verify all endpoints
for ep in ["/api/predict","/api/cii","/api/rl/simulation","/api/prediction/history","/api/cii/history","/api/rl/history","/api/upload/history"]:
    r = requests.get(f"{base}{ep}")
    results.append(f"{ep}: {r.status_code}")

for line in results:
    print(line)
