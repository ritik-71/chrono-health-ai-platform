"""
SHAP Explainability API — extends the prediction system with
interpretable AI explanations without altering existing prediction routes.
"""

from fastapi import APIRouter, HTTPException
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
async def shap_explain_default():
    """
    GET version using default patient values — for dashboard auto-load.
    """
    try:
        defaults = {
            "hrv": 45.5,
            "sleep_duration": 6.2,
            "sleep_quality": 0.7,
            "cortisol_level": 15.0,
            "light_exposure": 5000.0,
        }
        result = explainability_engine.explain_all(_predictor, defaults)
        return result
    except Exception as e:
        import traceback
        print(f"Explainability Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
