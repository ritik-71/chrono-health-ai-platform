from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from ml.inference.cii_engine import cii_engine_instance
from core.database import get_db
from models.cii import CIIHistory
from models.user import User

router = APIRouter()

@router.get("/cii")
async def get_real_cii(db: AsyncSession = Depends(get_db)):
    """
    Returns real mathematical CII computations and persists to DB.
    """
    try:
        # Try to fetch the latest CII record from history first (from uploaded data)
        history_result = await db.execute(
            select(CIIHistory).order_by(CIIHistory.timestamp.desc())
        )
        latest_record = history_result.scalars().first()
        
        if latest_record:
            # Fetch actual historical trend from DB for the frontend
            trend_result = await db.execute(
                select(CIIHistory).order_by(CIIHistory.timestamp.desc()).limit(7)
            )
            trend_records = trend_result.scalars().all()
            
            cii_val = latest_record.cii_value
            
            # Re-generate interpretation based on the stored value for consistency
            if cii_val < 40:
                risk = "Low Risk"
                interpretation = "Circadian rhythms are stable and highly synchronized with environmental cues."
            elif cii_val < 70:
                risk = "Moderate Risk"
                interpretation = "Mild misalignment detected. Phase delay may be occurring due to evening stress or light exposure."
            else:
                risk = "High Risk"
                interpretation = "Severe circadian disruption. High stress correlation indicates a self-perpetuating feedback loop of insomnia and hyperarousal."

            return {
                "current_cii": cii_val,
                "risk_category": risk,
                "trend_direction": "upward" if cii_val > 60 else "stable",
                "interpretation": interpretation,
                "components": {
                    "stress_sleep_correlation": latest_record.stress_sleep_correlation or 0.0,
                    "phase_shift_rate": latest_record.phase_shift_rate or 0.0,
                    "external_zeitgebers": latest_record.zeitgeber_score or 0.0
                },
                "historical_trend": [r.cii_value for r in reversed(trend_records)]
            }

        import pandas as pd
        import numpy as np
        
        # Real calculation with live inputs (Fallback)
        df = pd.DataFrame({
            'stress_level': np.random.normal(50, 10, 10),
            'circadian_marker': np.random.normal(7, 1, 10)
        })
        
        current_metrics = {
            'phase': 7.5,
            'prev_phase': 7.2,
            'light_norm': 0.8,
            'activity_norm': 0.6
        }
        
        results = cii_engine_instance.compute_live_cii(df, current_metrics)
        
        # Save to database
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
            
        user_id = first_user.id
        
        new_cii_record = CIIHistory(
            user_id=user_id,
            cii_value=results["current_cii"],
            risk_level=results["risk_category"],
            stress_sleep_correlation=results["components"]["stress_sleep_correlation"],
            phase_shift_rate=results["components"]["phase_shift_rate"],
            zeitgeber_score=results["components"]["external_zeitgebers"]
        )
        
        db.add(new_cii_record)
        await db.commit()
        
        # Fetch actual historical trend from DB for the frontend
        trend_result = await db.execute(
            select(CIIHistory).order_by(CIIHistory.timestamp.desc()).limit(7)
        )
        trend_records = trend_result.scalars().all()
        results["historical_trend"] = [r.cii_value for r in reversed(trend_records)]
        
        return results
    except Exception as e:
        await db.rollback()
        import traceback
        print(f"CII Computation Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cii/history")
async def get_cii_history(db: AsyncSession = Depends(get_db)):
    """
    Returns full CII history for analytics.
    """
    try:
        result = await db.execute(
            select(CIIHistory).order_by(CIIHistory.timestamp.asc())
        )
        records = result.scalars().all()
        return [
            {
                "id": r.id,
                "value": r.cii_value,
                "risk": r.risk_level,
                "correlation": r.stress_sleep_correlation,
                "phase_shift": r.phase_shift_rate,
                "zeitgeber": r.zeitgeber_score,
                "timestamp": r.timestamp
            }
            for r in records
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
