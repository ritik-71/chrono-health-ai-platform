"""
SHAP Explainability API — extends the prediction system with
interpretable AI explanations without altering existing prediction routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from pydantic import BaseModel
from typing import Optional

import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from ml.inference.predictor import ClinicalPredictor
from ml.explainability_engine import explainability_engine

router = APIRouter()

# Reuse the same predictor instance
_predictor = ClinicalPredictor()


class ExplainRequest(BaseModel):
    hrv: float = 45.5
    sleep_duration: float = 6.2
    sleep_quality: float = 0.7
    cortisol_level: float = 15.0
    light_exposure: float = 5000.0


@router.post("/explainability/analyze")
async def shap_explain(data: ExplainRequest):
    """
    Generate SHAP-style feature importance, contribution analysis,
    and clinical reasoning for the given patient input.
    """
    try:
        result = explainability_engine.explain_all(_predictor, data.dict())
        return result
    except Exception as e:
        import traceback
        print(f"Explainability Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/explainability/analyze")
async def shap_explain_default(db: AsyncSession = Depends(get_db)):
    """
    GET version using the latest processed patient data from history — for dashboard auto-load.
    """
    try:
        from sqlalchemy.future import select
        from models.prediction import PredictionHistory
        
        # Try to find the latest prediction record to explain
        history_result = await db.execute(
            select(PredictionHistory).order_by(PredictionHistory.timestamp.desc())
        )
        latest_record = history_result.scalars().first()
        
        # Use actual stored raw features if available, fallback to defaults only if no records exist
        if latest_record and latest_record.hrv is not None:
            inputs = {
                "hrv": latest_record.hrv,
                "sleep_duration": latest_record.sleep_duration,
                "sleep_quality": latest_record.sleep_quality,
                "cortisol_level": latest_record.cortisol_level,
                "light_exposure": latest_record.light_exposure,
            }
        else:
            # Reconstruct representative inputs based on the latest health state (fallback for legacy records)
            inputs = {
                "hrv": 45.0 if not latest_record else (55.0 if latest_record.stress_score < 40 else 35.0),
                "sleep_duration": 7.0 if not latest_record else (latest_record.sleep_score / 10),
                "sleep_quality": 0.8 if not latest_record else (latest_record.sleep_score / 100),
                "cortisol_level": 15.0 if not latest_record else (20.0 if latest_record.stress_score > 60 else 12.0),
                "light_exposure": 5000.0 if not latest_record else (3000.0 if latest_record.cii_score > 50 else 6000.0),
            }
        
        result = explainability_engine.explain_all(_predictor, inputs)
        result["inputs"] = inputs
        return result
    except Exception as e:
        import traceback
        print(f"Explainability Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
