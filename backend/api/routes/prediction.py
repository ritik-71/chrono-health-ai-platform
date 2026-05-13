from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import sys
import os

# Ensure ml can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from ml.inference.predictor import ClinicalPredictor
from core.database import get_db
from models.prediction import PredictionHistory
from models.user import User

router = APIRouter()
predictor_instance = ClinicalPredictor()

class PatientPayload(BaseModel):
    hrv: float = 45.5
    sleep_duration: float = 6.2
    sleep_quality: float = 0.7
    cortisol_level: float = 15.0
    light_exposure: float = 5000.0

# Simple in-memory cache for demo user_id to avoid repeated lookups
_demo_user_id_cache = None

@router.get("/predict")
async def get_live_predictions(db: AsyncSession = Depends(get_db)):
    """
    Live dashboard prediction route using real loaded models and persists to DB.
    Optimized with user ID caching.
    """
    global _demo_user_id_cache
    try:
        payload = {
            "hrv": 45.5,
            "sleep_duration": 6.2,
            "sleep_quality": 0.7,
            "cortisol_level": 18.2,
            "light_exposure": 4000.0
        }
        results = predictor_instance.predict(payload)
        
        # Save to database with cached user ID lookup
        if _demo_user_id_cache is None:
            user_result = await db.execute(select(User))
            first_user = user_result.scalars().first()
            
            if not first_user:
                first_user = User(
                    name="Clinical Researcher",
                    email="researcher@chronohealth.ai",
                    hashed_password="hashed_placeholder_for_demo"
                )
                db.add(first_user)
                await db.commit()
                await db.refresh(first_user)
            _demo_user_id_cache = first_user.id
            
        user_id = _demo_user_id_cache
        
        stress_map = {"Low": 20.0, "Moderate": 50.0, "High": 85.0}
        fatigue_map = {"Low": 15.0, "Moderate": 45.0, "High": 80.0}
        
        new_record = PredictionHistory(
            user_id=user_id,
            stress_score=stress_map.get(results["stress_risk"], 50.0),
            sleep_score=(1 - results["sleep_disorder_probability"]) * 100,
            cii_score=results["cii_prediction"],
            fatigue_score=fatigue_map.get(results["mental_fatigue"], 40.0)
        )
        
        db.add(new_record)
        await db.commit()
        
        return results
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/prediction/history")
async def get_prediction_history(limit: int = 50, offset: int = 0, db: AsyncSession = Depends(get_db)):
    """
    Fetches the history of predictions with pagination support.
    """
    try:
        result = await db.execute(
            select(PredictionHistory)
            .order_by(PredictionHistory.timestamp.asc())
            .offset(offset)
            .limit(limit)
        )
        records = result.scalars().all()
        return [
            {
                "id": r.id,
                "stress": r.stress_score,
                "sleep": r.sleep_score,
                "cii": r.cii_score,
                "fatigue": r.fatigue_score,
                "timestamp": r.timestamp
            }
            for r in records
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@router.post("/predict/patient")
async def predict_patient(data: PatientPayload, db: AsyncSession = Depends(get_db)):
    """Specific patient inference route with persistence."""
    try:
        results = predictor_instance.predict(data.dict())
        
        # Save to database (optional, depending on if we want to track one-off patient checks)
        # For this requirement, we'll track it
        user_result = await db.execute(select(User))
        first_user = user_result.scalars().first()
        user_id = first_user.id if first_user else 1
        
        stress_map = {"Low": 20.0, "Moderate": 50.0, "High": 85.0}
        fatigue_map = {"Low": 15.0, "Moderate": 45.0, "High": 80.0}
        
        new_record = PredictionHistory(
            user_id=user_id,
            stress_score=stress_map.get(results["stress_risk"], 50.0),
            sleep_score=(1 - results["sleep_disorder_probability"]) * 100,
            cii_score=results["cii_prediction"],
            fatigue_score=fatigue_map.get(results["mental_fatigue"], 40.0)
        )
        db.add(new_record)
        await db.commit()
        
        return results
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
