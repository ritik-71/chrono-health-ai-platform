import asyncio
import socket
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from core.config import settings

async def check_dns():
    host = "ep-dark-salad-apb3csxg-pooler.c-7.us-east-1.aws.neon.tech"
    print(f"Checking DNS for {host}...")
    try:
        addr = socket.gethostbyname(host)
        print(f"Resolved to {addr}")
    except Exception as e:
        print(f"DNS Resolution Failed: {e}")
        
    url = settings.DATABASE_URL
    print(f"Current DATABASE_URL: {url}")
    # Strip sensitive info for printing
    safe_url = url.split("@")[-1] if "@" in url else url
    print(f"Host part: {safe_url}")

if __name__ == "__main__":
    asyncio.run(check_dns())
