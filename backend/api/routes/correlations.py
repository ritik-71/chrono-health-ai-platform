"""
Clinical Correlation Analytics — Endpoint
Computes full Pearson correlation matrix, pairwise scatter data,
and focused clinical analyses (Stress-Sleep, HRV-Fatigue, CII-Risk)
from the prediction + CII history tables.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.prediction import PredictionHistory
from models.cii import CIIHistory

import math
from typing import Any, Dict, List, Tuple

router = APIRouter()

FEATURES = ["stress", "sleep", "fatigue", "cii"]
FEATURE_LABELS = {
    "stress": "Stress Score",
    "sleep": "Sleep Score",
    "fatigue": "Fatigue Score",
    "cii": "CII Score",
    "correlation": "Stress-Sleep r",
    "phaseShift": "Phase Shift",
    "zeitgeber": "Zeitgeber",
}


def _pearson(xs: List[float], ys: List[float]) -> float:
    n = len(xs)
    if n < 3:
        return 0.0
    mx, my = sum(xs) / n, sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    dx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    dy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if dx * dy == 0:
        return 0.0
    return round(num / (dx * dy), 4)


def _lin_reg(xs: List[float], ys: List[float]) -> Tuple[float, float]:
    """Simple OLS slope + intercept."""
    n = len(xs)
    if n < 2:
        return 0.0, 0.0
    mx, my = sum(xs) / n, sum(ys) / n
    ss_xy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    ss_xx = sum((x - mx) ** 2 for x in xs)
    if ss_xx == 0:
        return 0.0, my
    slope = ss_xy / ss_xx
    intercept = my - slope * mx
    return round(slope, 4), round(intercept, 2)


def _bucket_stats(xs: List[float], ys: List[float], n_buckets: int = 8) -> List[dict]:
    """Bin xs into quantile buckets and compute mean y per bucket."""
    if not xs:
        return []
    paired = sorted(zip(xs, ys), key=lambda p: p[0])
    bucket_size = max(1, len(paired) // n_buckets)
    result = []
    for i in range(0, len(paired), bucket_size):
        chunk = paired[i:i + bucket_size]
        mx = sum(p[0] for p in chunk) / len(chunk)
        my = sum(p[1] for p in chunk) / len(chunk)
        result.append({
            "xMean": round(mx, 1),
            "yMean": round(my, 1),
            "count": len(chunk),
        })
    return result


def _strength_label(r: float) -> str:
    ar = abs(r)
    if ar >= 0.7:
        return "Strong"
    if ar >= 0.4:
        return "Moderate"
    if ar >= 0.2:
        return "Weak"
    return "Negligible"


@router.get("/analytics/correlations")
async def correlation_analytics(db: AsyncSession = Depends(get_db)):
    """Full clinical correlation analysis."""
    try:
        # Fetch prediction history
        pred_result = await db.execute(
            select(PredictionHistory).order_by(PredictionHistory.timestamp.asc()).limit(300)
        )
        pred_rows = pred_result.scalars().all()

        # Fetch CII history for component-level analysis
        cii_result = await db.execute(
            select(CIIHistory).order_by(CIIHistory.timestamp.asc()).limit(300)
        )
        cii_rows = cii_result.scalars().all()

        if not pred_rows:
            return {"matrix": [], "pairs": {}, "analyses": {}, "summary": {"total": 0}}

        # Extract feature arrays
        vectors: Dict[str, List[float]] = {
            "stress":  [r.stress_score for r in pred_rows],
            "sleep":   [r.sleep_score for r in pred_rows],
            "fatigue": [r.fatigue_score for r in pred_rows],
            "cii":     [r.cii_score for r in pred_rows],
        }

        # CII component vectors (may be shorter)
        cii_vectors: Dict[str, List[float]] = {
            "correlation": [r.stress_sleep_correlation or 0 for r in cii_rows],
            "phaseShift":  [r.phase_shift_rate or 0 for r in cii_rows],
            "zeitgeber":   [r.zeitgeber_score or 0 for r in cii_rows],
            "ciiValue":    [r.cii_value for r in cii_rows],
        }

        n = len(pred_rows)

        # ── 1. Full correlation matrix ──────────────────────────────────
        all_keys = FEATURES
        matrix_cells: List[dict] = []
        for i, f1 in enumerate(all_keys):
            for j, f2 in enumerate(all_keys):
                r = _pearson(vectors[f1], vectors[f2])
                matrix_cells.append({
                    "row": f1,
                    "col": f2,
                    "rowLabel": FEATURE_LABELS.get(f1, f1),
                    "colLabel": FEATURE_LABELS.get(f2, f2),
                    "rowIdx": i,
                    "colIdx": j,
                    "value": r,
                    "strength": _strength_label(r),
                })

        # ── 2. Pairwise scatter data (sampled for performance) ──────────
        sample_step = max(1, n // 60)
        pairs: Dict[str, List[dict]] = {}
        for i, f1 in enumerate(all_keys):
            for j, f2 in enumerate(all_keys):
                if i >= j:
                    continue
                key = f"{f1}_vs_{f2}"
                pts = []
                for k in range(0, n, sample_step):
                    pts.append({"x": vectors[f1][k], "y": vectors[f2][k]})
                slope, intercept = _lin_reg(vectors[f1], vectors[f2])
                pairs[key] = {
                    "points": pts,
                    "r": _pearson(vectors[f1], vectors[f2]),
                    "slope": slope,
                    "intercept": intercept,
                    "xLabel": FEATURE_LABELS.get(f1, f1),
                    "yLabel": FEATURE_LABELS.get(f2, f2),
                    "strength": _strength_label(_pearson(vectors[f1], vectors[f2])),
                    "buckets": _bucket_stats(vectors[f1], vectors[f2]),
                }

        # ── 3. Focused clinical analyses ────────────────────────────────

        # Stress vs Sleep
        stress_sleep_r = _pearson(vectors["stress"], vectors["sleep"])
        stress_sleep_slope, stress_sleep_int = _lin_reg(vectors["stress"], vectors["sleep"])

        # CII vs Risk tiers
        cii_risk_buckets = _bucket_stats(vectors["cii"], vectors["stress"], 6)

        # Fatigue vs Sleep (proxy for HRV-fatigue, since HRV strongly predicted sleep)
        fatigue_sleep_r = _pearson(vectors["fatigue"], vectors["sleep"])

        # CII component correlations (if enough data)
        cii_comp_corrs = {}
        min_cii_len = min(n, len(cii_vectors["ciiValue"]))
        if min_cii_len > 3:
            for comp_key in ["correlation", "phaseShift", "zeitgeber"]:
                for feat in FEATURES:
                    fl = min(min_cii_len, len(vectors[feat]))
                    r = _pearson(cii_vectors[comp_key][:fl], vectors[feat][:fl])
                    cii_comp_corrs[f"{comp_key}_vs_{feat}"] = {
                        "r": r,
                        "strength": _strength_label(r),
                        "xLabel": FEATURE_LABELS.get(comp_key, comp_key),
                        "yLabel": FEATURE_LABELS.get(feat, feat),
                    }

        analyses = {
            "stressSleep": {
                "r": stress_sleep_r,
                "slope": stress_sleep_slope,
                "intercept": stress_sleep_int,
                "strength": _strength_label(stress_sleep_r),
                "interpretation": (
                    "Strong inverse relationship — elevated stress significantly reduces sleep quality."
                    if stress_sleep_r < -0.4 else
                    "Moderate negative coupling — stress partially disrupts sleep architecture."
                    if stress_sleep_r < -0.2 else
                    "Weak or negligible coupling detected in current dataset."
                ),
            },
            "fatigueSleep": {
                "r": fatigue_sleep_r,
                "strength": _strength_label(fatigue_sleep_r),
                "interpretation": (
                    "Strong fatigue-sleep axis — poor sleep directly amplifies cognitive fatigue."
                    if abs(fatigue_sleep_r) > 0.4 else
                    "Moderate association between sleep quality and fatigue levels."
                    if abs(fatigue_sleep_r) > 0.2 else
                    "Fatigue appears largely independent of sleep in this sample."
                ),
            },
            "ciiRisk": {
                "buckets": cii_risk_buckets,
                "interpretation": "Higher CII values cluster with elevated stress responses, confirming the circadian-stress feedback loop.",
            },
            "ciiComponents": cii_comp_corrs,
        }

        # ── 4. Summary stats ────────────────────────────────────────────
        strongest_pair = max(
            [(f"{f1}-{f2}", abs(_pearson(vectors[f1], vectors[f2])))
             for i, f1 in enumerate(all_keys) for j, f2 in enumerate(all_keys) if i < j],
            key=lambda x: x[1],
            default=("N/A", 0),
        )

        feature_stats = {}
        for f in all_keys:
            vals = vectors[f]
            mean_v = sum(vals) / len(vals)
            std_v = math.sqrt(sum((v - mean_v) ** 2 for v in vals) / len(vals))
            feature_stats[f] = {
                "mean": round(mean_v, 1),
                "std": round(std_v, 2),
                "min": round(min(vals), 1),
                "max": round(max(vals), 1),
            }

        return {
            "matrix": matrix_cells,
            "pairs": pairs,
            "analyses": analyses,
            "featureStats": feature_stats,
            "summary": {
                "total": n,
                "features": all_keys,
                "strongestPair": strongest_pair[0],
                "strongestR": strongest_pair[1],
            },
        }

    except Exception as e:
        import traceback
        print(f"Correlation Analytics Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
