from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.future import select
from core.config import settings
import os

# Ensure the DATABASE_URL uses the async driver
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Remove incompatible query parameters that cause asyncpg errors
if "?" in database_url:
    base_url, query = database_url.split("?", 1)
    # List of parameters to remove if they exist
    incompatible_params = ["sslmode", "channel_binding"]
    params = query.split("&")
    filtered_params = [p for p in params if not any(ip in p for ip in incompatible_params)]
    
    if filtered_params:
        database_url = f"{base_url}?{'&'.join(filtered_params)}"
    else:
        database_url = base_url

# Neon-specific SSL configuration
connect_args = {}
if "neon.tech" in database_url:
    connect_args["ssl"] = True

engine = create_async_engine(
    database_url,
    echo=False,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
