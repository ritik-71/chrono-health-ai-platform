"""
CII Timeline Analytics — Advanced temporal analysis endpoint.
Generates daily trends, circadian drift, weekly instability metrics,
rolling correlations, and heatmap data from CII + prediction history.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from core.database import get_db
from models.cii import CIIHistory
from models.prediction import PredictionHistory

import math
import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

router = APIRouter()


def _rolling_avg(values: List[float], window: int = 5) -> List[float]:
    """Compute a simple rolling average."""
    result = []
    for i in range(len(values)):
        start = max(0, i - window + 1)
        result.append(round(sum(values[start:i+1]) / (i - start + 1), 2))
    return result


def _rolling_std(values: List[float], window: int = 5) -> List[float]:
    """Compute rolling standard deviation (instability metric)."""
    result = []
    for i in range(len(values)):
        start = max(0, i - window + 1)
        chunk = values[start:i+1]
        mean = sum(chunk) / len(chunk)
        variance = sum((x - mean) ** 2 for x in chunk) / len(chunk)
        result.append(round(math.sqrt(variance), 2))
    return result


def _pearson(xs: List[float], ys: List[float]) -> float:
    """Quick Pearson-r for two equal-length lists."""
    n = len(xs)
    if n < 2:
        return 0.0
    mx = sum(xs) / n
    my = sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    dx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    dy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if dx * dy == 0:
        return 0.0
    return round(num / (dx * dy), 4)


def _rolling_correlation(xs: List[float], ys: List[float], window: int = 7) -> List[float]:
    """Rolling Pearson correlation between two series."""
    result = []
    for i in range(len(xs)):
        start = max(0, i - window + 1)
        result.append(_pearson(xs[start:i+1], ys[start:i+1]))
    return result


def _circadian_drift(ciis: List[float]) -> List[float]:
    """
    |dCII/dt| — absolute rate of change between consecutive entries.
    Measures how rapidly the circadian index is shifting.
    """
    drift = [0.0]
    for i in range(1, len(ciis)):
        drift.append(round(abs(ciis[i] - ciis[i-1]), 2))
    return drift


def _weekly_bins(ciis: List[float], timestamps: List[str]) -> List[Dict[str, Any]]:
    """
    Group CII values into weekly bins and compute per-week statistics.
    """
    weeks: Dict[str, List[float]] = {}
    for cii, ts in zip(ciis, timestamps):
        try:
            dt = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
        except Exception:
            dt = datetime.now(timezone.utc)
        iso_week = dt.strftime("%Y-W%W")
        weeks.setdefault(iso_week, []).append(cii)

    result = []
    for week_label in sorted(weeks.keys()):
        vals = weeks[week_label]
        mean_val = sum(vals) / len(vals)
        min_val = min(vals)
        max_val = max(vals)
        std_val = math.sqrt(sum((v - mean_val) ** 2 for v in vals) / len(vals)) if len(vals) > 1 else 0
        result.append({
            "week": week_label,
            "mean": round(mean_val, 2),
            "min": round(min_val, 2),
            "max": round(max_val, 2),
            "instability": round(std_val, 2),
            "count": len(vals),
        })
    return result


def _heatmap_data(ciis: List[float], timestamps: List[str]) -> List[Dict[str, Any]]:
    """
    Generate hour-of-day vs day-of-week heatmap cells from CII timestamps.
    """
    grid: Dict[str, List[float]] = {}
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for cii, ts in zip(ciis, timestamps):
        try:
            dt = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
        except Exception:
            dt = datetime.now(timezone.utc)
        day = days[dt.weekday()]
        hour = dt.hour
        key = f"{day}_{hour}"
        grid.setdefault(key, []).append(cii)

    result = []
    for day_idx, day_name in enumerate(days):
        for hour in range(24):
            key = f"{day_name}_{hour}"
            vals = grid.get(key, [])
            avg = round(sum(vals) / len(vals), 1) if vals else None
            result.append({
                "day": day_name,
                "dayIndex": day_idx,
                "hour": hour,
                "value": avg,
                "count": len(vals),
            })
    return result


@router.get("/analytics/cii-timeline")
async def cii_timeline_analytics(db: AsyncSession = Depends(get_db)):
    """
    Advanced temporal CII analytics: daily trends, circadian drift,
    weekly instability, rolling correlations, and heatmap data.
    """
    try:
        # Fetch CII history
        cii_result = await db.execute(
            select(CIIHistory).order_by(CIIHistory.timestamp.asc()).limit(200)
        )
        cii_records = cii_result.scalars().all()

        # Fetch prediction history for cross-correlation
        pred_result = await db.execute(
            select(PredictionHistory).order_by(PredictionHistory.timestamp.asc()).limit(200)
        )
        pred_records = pred_result.scalars().all()

        # Extract arrays
        cii_vals = [r.cii_value for r in cii_records]
        cii_ts = [str(r.timestamp) for r in cii_records]
        cii_risks = [r.risk_level for r in cii_records]
        cii_corr = [r.stress_sleep_correlation or 0 for r in cii_records]
        cii_phase = [r.phase_shift_rate or 0 for r in cii_records]
        cii_zeit = [r.zeitgeber_score or 0 for r in cii_records]

        stress_vals = [r.stress_score for r in pred_records]
        sleep_vals = [r.sleep_score for r in pred_records]
        fatigue_vals = [r.fatigue_score for r in pred_records]

        n = len(cii_vals)

        # Compute analytics
        rolling_mean = _rolling_avg(cii_vals, 5)
        rolling_instability = _rolling_std(cii_vals, 5)
        drift = _circadian_drift(cii_vals)

        # Rolling correlations (CII vs stress, CII vs sleep) — align lengths
        min_len = min(n, len(stress_vals))
        cii_stress_corr = _rolling_correlation(cii_vals[:min_len], stress_vals[:min_len], 7)
        cii_sleep_corr = _rolling_correlation(cii_vals[:min_len], sleep_vals[:min_len], 7)

        weekly = _weekly_bins(cii_vals, cii_ts)
        heatmap = _heatmap_data(cii_vals, cii_ts)

        # Build the daily timeline series
        daily_timeline = []
        for i in range(n):
            entry: Dict[str, Any] = {
                "index": i,
                "timestamp": cii_ts[i],
                "cii": cii_vals[i],
                "risk": cii_risks[i],
                "rollingMean": rolling_mean[i],
                "instability": rolling_instability[i],
                "drift": drift[i],
                "correlation": cii_corr[i],
                "phaseShift": cii_phase[i],
                "zeitgeber": cii_zeit[i],
            }
            if i < min_len:
                entry["stressCorrelation"] = cii_stress_corr[i]
                entry["sleepCorrelation"] = cii_sleep_corr[i]
            if i < len(stress_vals):
                entry["stress"] = stress_vals[i]
            if i < len(sleep_vals):
                entry["sleep"] = sleep_vals[i]
            daily_timeline.append(entry)

        # Summary statistics
        overall_mean = round(sum(cii_vals) / n, 2) if n else 0
        overall_std = round(math.sqrt(sum((v - overall_mean) ** 2 for v in cii_vals) / n), 2) if n else 0
        risk_dist = {}
        for r in cii_risks:
            risk_dist[r] = risk_dist.get(r, 0) + 1

        global_corr_stress = _pearson(cii_vals[:min_len], stress_vals[:min_len]) if min_len > 1 else 0
        global_corr_sleep = _pearson(cii_vals[:min_len], sleep_vals[:min_len]) if min_len > 1 else 0

        return {
            "timeline": daily_timeline,
            "weeklyComparison": weekly,
            "heatmap": heatmap,
            "summary": {
                "totalRecords": n,
                "mean": overall_mean,
                "stdDev": overall_std,
                "latest": cii_vals[-1] if cii_vals else 0,
                "min": round(min(cii_vals), 1) if cii_vals else 0,
                "max": round(max(cii_vals), 1) if cii_vals else 0,
                "riskDistribution": risk_dist,
                "globalStressCorrelation": global_corr_stress,
                "globalSleepCorrelation": global_corr_sleep,
                "avgDrift": round(sum(drift) / len(drift), 2) if drift else 0,
                "avgInstability": round(sum(rolling_instability) / len(rolling_instability), 2) if rolling_instability else 0,
            },
        }

    except Exception as e:
        import traceback
        print(f"CII Timeline Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
