import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.database import engine, Base
from models.user import User # Ensure model is registered with Base

async def create_tables():
    print("Connecting to database to create tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully on primary database!")
    except Exception as e:
        print(f"Error creating tables on primary database: {e}")
        print("Attempting to initialize local SQLite fallback...")
        try:
            from sqlalchemy.ext.asyncio import create_async_engine
            sqlite_engine = create_async_engine("sqlite+aiosqlite:///./chronohealth.db")
            async with sqlite_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("Local SQLite fallback tables created successfully!")
            await sqlite_engine.dispose()
        except Exception as se:
            print(f"Critical Error: Could not initialize local fallback: {se}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_tables())
