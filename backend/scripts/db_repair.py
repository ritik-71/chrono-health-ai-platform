import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Add parent dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.config import settings

async def repair_db():
    database_url = settings.DATABASE_URL
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Remove incompatible parameters
    if "?" in database_url:
        base_url, query = database_url.split("?", 1)
        incompatible_params = ["sslmode", "channel_binding"]
        params = query.split("&")
        filtered_params = [p for p in params if not any(ip in p for ip in incompatible_params)]
        if filtered_params:
            database_url = f"{base_url}?{'&'.join(filtered_params)}"
        else:
            database_url = base_url

    print(f"Connecting to: {database_url}")
    
    connect_args = {}
    if "neon.tech" in database_url:
        connect_args["ssl"] = True

    engine = create_async_engine(database_url, connect_args=connect_args)
    
    async with engine.begin() as conn:
        print("Checking for mood_stability column in prediction_history...")
        try:
            # Check if column exists
            result = await conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='prediction_history' AND column_name='mood_stability';
            """))
            exists = result.scalar()
            
            if not exists:
                print("Column missing. Adding mood_stability to prediction_history...")
                await conn.execute(text("ALTER TABLE prediction_history ADD COLUMN mood_stability FLOAT DEFAULT 75.0;"))
                print("Column added successfully.")
            else:
                print("Column already exists.")
        except Exception as e:
            print(f"Error during repair: {e}")
    
    await engine.dispose()
    print("Repair complete.")

if __name__ == "__main__":
    asyncio.run(repair_db())
