"""
Behavioral Phenotype Analytics — Endpoint
Classifies each prediction record into a behavioral phenotype and
computes population-level phenotype distributions, trends, radar
profiles, and risk segmentation from the prediction + CII history.

Phenotype taxonomy (from capstone notebook):
  - Balanced        : low stress, good sleep, low fatigue, low CII
  - Stress-dominant : elevated stress drives circadian disruption
  - Sleep-dominant  : poor sleep quality is the primary disruptor
  - Comorbid        : both stress and sleep axes are impaired
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from core.database import get_db
from models.prediction import PredictionHistory
from models.cii import CIIHistory

import math
from typing import Any, Dict, List

router = APIRouter()

# ── thresholds (calibrated to the capstone score ranges) ──────────────────
STRESS_HIGH = 55.0     # stress_score above this → "high stress"
SLEEP_LOW   = 75.0     # sleep_score  below this → "poor sleep"
FATIGUE_HIGH = 50.0    # fatigue_score above this → "high fatigue"
CII_HIGH     = 40.0    # cii_score above this → elevated circadian disruption


# ── classifier ────────────────────────────────────────────────────────────
def classify_phenotype(stress: float, sleep: float, fatigue: float, cii: float) -> str:
    high_stress = stress >= STRESS_HIGH
    poor_sleep  = sleep  <= SLEEP_LOW
    if high_stress and poor_sleep:
        return "Comorbid"
    if high_stress:
        return "Stress-Dominant"
    if poor_sleep:
        return "Sleep-Dominant"
    return "Balanced"


def phenotype_color(p: str) -> str:
    return {
        "Balanced": "#10b981",
        "Stress-Dominant": "#f43f5e",
        "Sleep-Dominant": "#8b5cf6",
        "Comorbid": "#f59e0b",
    }.get(p, "#6b7280")


def risk_tier(stress: float, sleep: float, fatigue: float, cii: float) -> str:
    score = 0
    if stress >= STRESS_HIGH: score += 1
    if sleep <= SLEEP_LOW:    score += 1
    if fatigue >= FATIGUE_HIGH: score += 1
    if cii >= CII_HIGH:       score += 1
    if score <= 1: return "Low"
    if score == 2: return "Moderate"
    return "High"


# ── radar profile builder ────────────────────────────────────────────────
def phenotype_radar(records: List[dict], phenotype: str) -> List[dict]:
    """Average radar profile for a specific phenotype."""
    filtered = [r for r in records if r["phenotype"] == phenotype]
    if not filtered:
        return []
    n = len(filtered)
    return [
        {"axis": "Stress",   "value": round(sum(r["stress"]  for r in filtered) / n, 1)},
        {"axis": "Sleep",    "value": round(sum(r["sleep"]   for r in filtered) / n, 1)},
        {"axis": "Fatigue",  "value": round(sum(r["fatigue"] for r in filtered) / n, 1)},
        {"axis": "CII",      "value": round(sum(r["cii"]     for r in filtered) / n, 1)},
        {"axis": "Stability","value": round(100 - sum(r["cii"] for r in filtered) / n, 1)},
    ]


# ── trend builder ────────────────────────────────────────────────────────
def phenotype_trend(records: List[dict], window: int = 10) -> List[dict]:
    """
    Sliding-window phenotype distribution over time.
    Returns a list of {index, Balanced, Stress-Dominant, Sleep-Dominant, Comorbid}.
    """
    result = []
    for i in range(0, len(records), max(1, window)):
        chunk = records[i:i+window]
        counts = {"Balanced": 0, "Stress-Dominant": 0, "Sleep-Dominant": 0, "Comorbid": 0}
        for r in chunk:
            counts[r["phenotype"]] = counts.get(r["phenotype"], 0) + 1
        total = len(chunk)
        result.append({
            "index": i,
            "Balanced":         round(counts["Balanced"] / total * 100, 1),
            "Stress-Dominant":  round(counts["Stress-Dominant"] / total * 100, 1),
            "Sleep-Dominant":   round(counts["Sleep-Dominant"] / total * 100, 1),
            "Comorbid":         round(counts["Comorbid"] / total * 100, 1),
        })
    return result


# ── main endpoint ─────────────────────────────────────────────────────────
@router.get("/phenotypes/analyze")
async def analyze_phenotypes(db: AsyncSession = Depends(get_db)):
    """
    Full behavioral phenotype analysis from prediction history.
    """
    try:
        # Fetch prediction history
        pred_result = await db.execute(
            select(PredictionHistory).order_by(PredictionHistory.timestamp.asc()).limit(200)
        )
        pred_records = pred_result.scalars().all()

        if not pred_records:
            return {
                "records": [],
                "distribution": {},
                "dominant": None,
                "radarProfiles": {},
                "trend": [],
                "riskSegmentation": {},
                "groupComparison": [],
                "summary": {"total": 0},
            }

        # Classify each record
        classified: List[dict] = []
        for r in pred_records:
            pheno = classify_phenotype(r.stress_score, r.sleep_score, r.fatigue_score, r.cii_score)
            tier = risk_tier(r.stress_score, r.sleep_score, r.fatigue_score, r.cii_score)
            classified.append({
                "id": r.id,
                "stress": r.stress_score,
                "sleep": r.sleep_score,
                "fatigue": r.fatigue_score,
                "cii": r.cii_score,
                "phenotype": pheno,
                "color": phenotype_color(pheno),
                "riskTier": tier,
                "timestamp": str(r.timestamp),
            })

        n = len(classified)

        # Distribution
        dist: Dict[str, int] = {}
        for r in classified:
            dist[r["phenotype"]] = dist.get(r["phenotype"], 0) + 1

        # Dominant phenotype
        dominant = max(dist, key=dist.get) if dist else None

        # Radar profiles for each phenotype
        radar_profiles: Dict[str, Any] = {}
        for pheno in ["Balanced", "Stress-Dominant", "Sleep-Dominant", "Comorbid"]:
            radar_profiles[pheno] = phenotype_radar(classified, pheno)

        # Trend
        trend = phenotype_trend(classified, window=max(1, n // 10) if n > 10 else 1)

        # Risk segmentation
        risk_seg: Dict[str, int] = {}
        for r in classified:
            risk_seg[r["riskTier"]] = risk_seg.get(r["riskTier"], 0) + 1

        # Group comparison (mean scores per phenotype)
        group_comparison: List[dict] = []
        for pheno in ["Balanced", "Stress-Dominant", "Sleep-Dominant", "Comorbid"]:
            group = [r for r in classified if r["phenotype"] == pheno]
            if group:
                gn = len(group)
                group_comparison.append({
                    "phenotype": pheno,
                    "color": phenotype_color(pheno),
                    "count": gn,
                    "avgStress":  round(sum(r["stress"]  for r in group) / gn, 1),
                    "avgSleep":   round(sum(r["sleep"]   for r in group) / gn, 1),
                    "avgFatigue": round(sum(r["fatigue"] for r in group) / gn, 1),
                    "avgCII":     round(sum(r["cii"]     for r in group) / gn, 1),
                })

        # Summary
        summary = {
            "total": n,
            "dominant": dominant,
            "dominantCount": dist.get(dominant, 0) if dominant else 0,
            "dominantPct": round(dist.get(dominant, 0) / n * 100, 1) if dominant and n else 0,
            "avgStress": round(sum(r["stress"] for r in classified) / n, 1),
            "avgSleep": round(sum(r["sleep"] for r in classified) / n, 1),
            "avgFatigue": round(sum(r["fatigue"] for r in classified) / n, 1),
            "avgCII": round(sum(r["cii"] for r in classified) / n, 1),
            "riskSegmentation": risk_seg,
        }

        return {
            "records": classified,
            "distribution": dist,
            "dominant": dominant,
            "radarProfiles": radar_profiles,
            "trend": trend,
            "riskSegmentation": risk_seg,
            "groupComparison": group_comparison,
            "summary": summary,
        }

    except Exception as e:
        import traceback
        print(f"Phenotype Analysis Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
