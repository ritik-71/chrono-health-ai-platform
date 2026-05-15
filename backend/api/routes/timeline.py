"""
Longitudinal Patient Journey Timeline Analytics
Aggregates prediction history and RL interventions into a unified
day-wise/episode-wise temporal progression to visualize recovery curves,
intervention impacts, and biomarker evolution.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.prediction import PredictionHistory
from models.rl import RLIntervention
from datetime import timedelta
import math
from typing import Any, Dict, List

router = APIRouter()

def smooth_curve(data: List[float], alpha: float = 0.3) -> List[float]:
    """Exponential Moving Average for visual smoothing."""
    if not data:
        return []
    smoothed = [data[0]]
    for i in range(1, len(data)):
        smoothed.append(alpha * data[i] + (1 - alpha) * smoothed[-1])
    return [round(x, 2) for x in smoothed]


@router.get("/timeline/patient-journey")
async def patient_journey_timeline(db: AsyncSession = Depends(get_db)):
    """
    Constructs or retrieves longitudinal timeline analytics combining biomarker evolution
    with intervention impacts. Uses AnalyticsCache for high performance.
    """
    try:
        from models.analytics_cache import AnalyticsCache
        
        # 1. Check Cache First
        cache_result = await db.execute(
            select(AnalyticsCache).where(AnalyticsCache.cache_key == "patient_journey")
        )
        cached = cache_result.scalars().first()
        if cached:
            return cached.data

        # 2. Cache Miss: Compute Analytics
        # Fetch predictions (chronological)
        pred_result = await db.execute(
            select(PredictionHistory).order_by(PredictionHistory.timestamp.asc()).limit(300)
        )
        predictions = pred_result.scalars().all()

        # Fetch RL interventions
        rl_result = await db.execute(
            select(RLIntervention).order_by(RLIntervention.timestamp.asc()).limit(150)
        )
        interventions = rl_result.scalars().all()

        if not predictions:
            return {"timeline": [], "recoveryStats": {}, "interventions": []}

        n_days = len(predictions)
        stress_series = [r.stress_score for r in predictions]
        sleep_series = [r.sleep_score for r in predictions]
        fatigue_series = [r.fatigue_score for r in predictions]
        cii_series = [r.cii_score for r in predictions]

        stress_smooth = smooth_curve(stress_series, alpha=0.25)
        sleep_smooth = smooth_curve(sleep_series, alpha=0.25)
        fatigue_smooth = smooth_curve(fatigue_series, alpha=0.25)
        cii_smooth = smooth_curve(cii_series, alpha=0.25)

        n_interventions = len(interventions)
        mapped_interventions = {}
        if n_interventions > 0 and n_days > 0:
            step = max(1, n_days // min(n_interventions, 20))
            for i in range(min(n_interventions, 20)):
                day_idx = min(i * step + step // 2, n_days - 1)
                mapped_interventions[day_idx] = {
                    "type": interventions[i].intervention_type,
                    "reward": round(interventions[i].reward_score, 1)
                }

        timeline = []
        for i in range(n_days):
            entry = {
                "day": i + 1,
                "stress": round(stress_series[i], 1),
                "sleep": round(sleep_series[i], 1),
                "fatigue": round(fatigue_series[i], 1),
                "cii": round(cii_series[i], 1),
                "stressEMA": stress_smooth[i],
                "sleepEMA": sleep_smooth[i],
                "fatigueEMA": fatigue_smooth[i],
                "ciiEMA": cii_smooth[i],
            }
            if i in mapped_interventions:
                entry["intervention"] = mapped_interventions[i]["type"]
                entry["interventionReward"] = mapped_interventions[i]["reward"]
            timeline.append(entry)

        def slope(series: List[float]) -> float:
            if len(series) < 2: return 0.0
            x = list(range(len(series)))
            mx = sum(x) / len(x)
            my = sum(series) / len(series)
            ss_xy = sum((xi - mx) * (yi - my) for xi, yi in zip(x, series))
            ss_xx = sum((xi - mx) ** 2 for xi in x)
            return round(ss_xy / ss_xx if ss_xx != 0 else 0, 3)

        recovery_stats = {
            "stressTrend": slope(stress_smooth),
            "sleepTrend": slope(sleep_smooth),
            "ciiTrend": slope(cii_smooth),
            "fatigueTrend": slope(fatigue_smooth),
            "daysTracked": n_days,
            "totalInterventions": n_interventions,
            "initialStress": stress_smooth[0],
            "currentStress": stress_smooth[-1],
            "initialSleep": sleep_smooth[0],
            "currentSleep": sleep_smooth[-1],
            "initialCII": cii_smooth[0],
            "currentCII": cii_smooth[-1],
        }

        markers = [{"day": k + 1, **v} for k, v in mapped_interventions.items()]

        result = {
            "timeline": timeline,
            "recoveryStats": recovery_stats,
            "interventionMarkers": markers,
        }

        # 3. Store in Cache
        new_cache = AnalyticsCache(
            user_id=predictions[0].user_id,
            cache_key="patient_journey",
            data=result
        )
        db.add(new_cache)
        await db.commit()

        return result

    except Exception as e:
        import traceback
        print(f"Patient Journey Timeline Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
