import os
import subprocess
import sys

def run():
    env = os.environ.copy()
    env["ENVIRONMENT"] = "development"
    env["PYTHONPATH"] = os.getcwd()
    
    try:
        # Check if python -m uvicorn works
        subprocess.run(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
            env=env,
            check=True
        )
    except Exception as e:
        print(f"Failed to start backend: {e}")

if __name__ == "__main__":
    run()
