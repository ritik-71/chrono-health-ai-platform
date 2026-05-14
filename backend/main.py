from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os
import logging

# Ensure absolute imports work in all environments
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from core.database import engine, Base
from core.config import settings
from models.user import User 
from models.dataset import UploadedDataset
from models.prediction import PredictionHistory
from models.cii import CIIHistory
from models.rl import RLIntervention 
from api.routes import auth, upload, prediction, cii, rl, assistant
from api.routes import analytics, phenotypes, correlations, explainability, timeline

# Structured Logging Configuration
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("chronohealth")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatic database initialization with robust fallback
    try:
        async with engine.begin() as conn:
            # Sync metadata
            await conn.run_sync(Base.metadata.create_all)
            
            # Manual Migration Check: Ensure mood_stability exists (Base.metadata.create_all doesn't add columns to existing tables)
            from sqlalchemy import text
            try:
                # Check column existence using information_schema
                result = await conn.execute(text("""
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_name='prediction_history' AND column_name='mood_stability';
                """))
                if not result.scalar():
                    logger.info("Migrating database: Adding mood_stability column to prediction_history...")
                    await conn.execute(text("ALTER TABLE prediction_history ADD COLUMN mood_stability FLOAT DEFAULT 75.0;"))
                
                # Check for new raw feature columns
                res_hrv = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='prediction_history' AND column_name='hrv';"))
                if not res_hrv.scalar():
                    logger.info("Migrating database: Adding raw feature columns for explainability...")
                    await conn.execute(text("ALTER TABLE prediction_history ADD COLUMN hrv FLOAT;"))
                    await conn.execute(text("ALTER TABLE prediction_history ADD COLUMN sleep_duration FLOAT;"))
                    await conn.execute(text("ALTER TABLE prediction_history ADD COLUMN sleep_quality FLOAT;"))
                    await conn.execute(text("ALTER TABLE prediction_history ADD COLUMN cortisol_level FLOAT;"))
                    await conn.execute(text("ALTER TABLE prediction_history ADD COLUMN light_exposure FLOAT;"))
                    logger.info("Explainability columns added.")
                
                # Check for CII history component columns
                res_cii = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='cii_history' AND column_name='stress_sleep_correlation';"))
                if not res_cii.scalar():
                    logger.info("Migrating database: Adding component columns to cii_history...")
                    await conn.execute(text("ALTER TABLE cii_history ADD COLUMN stress_sleep_correlation FLOAT;"))
                    await conn.execute(text("ALTER TABLE cii_history ADD COLUMN phase_shift_rate FLOAT;"))
                    await conn.execute(text("ALTER TABLE cii_history ADD COLUMN zeitgeber_score FLOAT;"))
                    logger.info("CII component columns added.")

                logger.info("Migration successful.")
            except Exception as me:
                logger.warning(f"Column migration check/apply failed: {me}")
                
            logger.info("Primary database synchronized successfully.")
    except Exception as e:
        logger.warning(f"Primary Database sync failed: {e}. Attempting fallback to local SQLite.")
        try:
            from sqlalchemy.ext.asyncio import create_async_engine
            fallback_engine = create_async_engine("sqlite+aiosqlite:///./chronohealth.db")
            async with fallback_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                # Try adding column to SQLite too
                try:
                    await conn.execute(text("ALTER TABLE prediction_history ADD COLUMN mood_stability FLOAT DEFAULT 75.0;"))
                except: pass 
            logger.info("Fallback local database synchronized successfully.")
            await fallback_engine.dispose()
        except Exception as fe:
            logger.error(f"Critical Database Failure (Primary & Fallback): {fe}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the Chrono-Behavioural Digital Health Platform",
    version="2.0.0",
    lifespan=lifespan,
    debug=settings.DEBUG
)

# Simplified CORS for production stability
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT, "timestamp": logging.time.time()}

# Register Modular Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/api/upload", tags=["Dataset Ingestion"])
app.include_router(prediction.router, prefix="/api", tags=["ML Inference"])
app.include_router(cii.router, prefix="/api", tags=["CII Engine"])
app.include_router(rl.router, prefix="/api", tags=["Reinforcement Learning"])
app.include_router(assistant.router, prefix="/api", tags=["AI Assistant"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(phenotypes.router, prefix="/api", tags=["Phenotypes"])
app.include_router(correlations.router, prefix="/api", tags=["Correlations"])
app.include_router(explainability.router, prefix="/api", tags=["Explainability"])
app.include_router(timeline.router, prefix="/api", tags=["Patient Journey Timeline"])

@app.get("/")
def read_root():
    return {"message": "ChronoHealth AI Clinical API is running (Production Mode)."}
