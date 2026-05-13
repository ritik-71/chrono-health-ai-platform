"""Test the upgraded context-aware chatbot with multiple queries."""
import urllib.request
import json

BASE = "http://localhost:8000"
SESSION_ID = "test_session_001"

queries = [
    "What is my current stress level?",
    "Tell me about my sleep quality",
    "Explain the CII formula and my current CII",
    "What interventions has the RL agent recommended?",
    "What datasets have been uploaded?",
    "How is my overall health looking?",
    # Repeat — should give DIFFERENT responses
    "What is my current stress level?",
    "Tell me about my sleep quality",
]

print("=" * 70)
print("ChronoHealth AI — Context-Aware Chatbot Verification")
print("=" * 70)

for i, q in enumerate(queries, 1):
    data = json.dumps({
        "message": q,
        "context": "User is on /dashboard",
        "session_id": SESSION_ID,
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE}/api/chat",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            response_text = result["response"]
            print(f"\n[Q{i}] {q}")
            print(f"[A{i}] {response_text[:300]}...")
    except Exception as e:
        print(f"\n[Q{i}] {q}")
        print(f"[ERR] {e}")

# Test the new /api/context-chat endpoint
print("\n" + "=" * 70)
print("Testing /api/context-chat endpoint")
print("=" * 70)

data = json.dumps({
    "message": "Give me a full analytics overview",
    "context": "User is on /dashboard",
    "session_id": "ctx_test",
}).encode("utf-8")

req = urllib.request.Request(
    f"{BASE}/api/context-chat",
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read())
        print(f"\nResponse: {result['response'][:300]}...")
        print(f"\nContext Keys: {list(result.get('context', {}).keys())}")
        print(f"Session ID: {result.get('session_id')}")
        ctx = result.get("context", {})
        for k, v in ctx.items():
            print(f"  [{k}] {v[:100]}...")
except Exception as e:
    print(f"[ERR] {e}")

print("\n" + "=" * 70)
print("DONE")
