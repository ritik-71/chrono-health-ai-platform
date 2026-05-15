"""
ChronoHealth AI — Live Analytics Engine
Handles real-time recomputation of clinical analytics when new datasets are uploaded.
Synchronizes prediction history, CII trends, and phenotype distributions.
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from ml.inference.predictor import ClinicalPredictor
from models.prediction import PredictionHistory
from models.cii import CIIHistory
from models.rl import RLIntervention

class LiveAnalyticsEngine:
    def __init__(self):
        self.predictor = ClinicalPredictor()

    async def process_and_backfill(self, df: pd.DataFrame, user_id: int, db: AsyncSession):
        """
        Takes an uploaded dataframe and generates longitudinal analytics records.
        Ensures the dashboard reflects the newly uploaded data.
        """
        try:
            # 0. Clear old history to make the new dataset the ACTIVE source
            from sqlalchemy import delete
            from models.analytics_cache import AnalyticsCache
            await db.execute(delete(PredictionHistory).where(PredictionHistory.user_id == user_id))
            await db.execute(delete(CIIHistory).where(CIIHistory.user_id == user_id))
            await db.execute(delete(RLIntervention).where(RLIntervention.user_id == user_id))
            await db.execute(delete(AnalyticsCache).where(AnalyticsCache.user_id == user_id))
            
            # 1. Data Validation & Schema Normalization
            df = self._normalize_schema(df)
            if df.empty:
                return 0
                
            # 2. Extract Features & Run Batch Inference
            inputs = []
            process_df = df.head(100) # Limit backfill to 100 records
            for i, (_, row) in enumerate(process_df.iterrows()):
                inputs.append({
                    "hrv": float(row.get("hrv", 55.0)),
                    "sleep_duration": float(row.get("sleep_duration", 7.0)),
                    "sleep_quality": float(row.get("sleep_quality", 0.75)),
                    "cortisol_level": float(row.get("cortisol_level", 15.0)),
                    "light_exposure": float(row.get("light_exposure", 5000.0))
                })
                
            # Execute vectorized inference
            batch_preds = self.predictor.predict_batch(inputs)
            
            records_to_add = []
            cii_records = []
            base_time = datetime.utcnow() - timedelta(days=len(process_df))
            
            for i, pred in enumerate(batch_preds):
                raw_input = inputs[i]
                ts = base_time + timedelta(hours=i*6)
                
                stress_map = {"Low": 25.0, "Moderate": 55.0, "High": 85.0}
                stress_score = stress_map.get(pred["stress_risk"], 50.0)
                
                # 3. Create Prediction History Record
                history_item = PredictionHistory(
                    user_id=user_id,
                    stress_score=stress_score,
                    sleep_score=pred["sleep_disorder_probability"] * 100,
                    cii_score=pred["cii_prediction"],
                    fatigue_score=50.0 if pred["mental_fatigue"] == "Moderate" else (80.0 if pred["mental_fatigue"] == "High" else 20.0),
                    mood_stability=pred.get("mood_stability", 75.0),
                    hrv=raw_input["hrv"],
                    sleep_duration=raw_input["sleep_duration"],
                    sleep_quality=raw_input["sleep_quality"],
                    cortisol_level=raw_input["cortisol_level"],
                    light_exposure=raw_input["light_exposure"],
                    timestamp=ts
                )
                records_to_add.append(history_item)
                
                # 4. Create CII History Record
                rho_comp = max(5.0, min(45.0, (1 - (pred.get("mood_stability", 75.0)/100)) * 50))
                shift_comp = max(5.0, min(35.0, abs(raw_input["sleep_duration"] - 7.0) * 8))
                zeit_comp = max(5.0, min(30.0, raw_input["light_exposure"] / 500))

                cii_item = CIIHistory(
                    user_id=user_id,
                    cii_value=pred["cii_prediction"],
                    risk_level=pred["stress_risk"], 
                    stress_sleep_correlation=round(rho_comp, 1),
                    phase_shift_rate=round(shift_comp, 1),
                    zeitgeber_score=round(zeit_comp, 1),
                    timestamp=ts
                )
                cii_records.append(cii_item)

            # 5. Batch Save to Database
            db.add_all(records_to_add)
            db.add_all(cii_records)
            
            # 6. Generate a few RL interventions for historical context based on new data
            if len(records_to_add) > 5:
                for j in range(3):
                    rl_item = RLIntervention(
                        user_id=user_id,
                        intervention_type="Bright Light Therapy" if records_to_add[-1-j].cii_score > 60 else "CBT-I Session",
                        recommendation="Generated from live data upload analysis.",
                        reward_score=0.7 + (random.random() * 0.2),
                        timestamp=datetime.utcnow() - timedelta(hours=j*2)
                    )
                    db.add(rl_item)

            await db.commit()
            return len(records_to_add)
        except Exception as e:
            await db.rollback()
            print(f"CRITICAL BACKFILL ERROR: {e}")
            raise e

    def _normalize_schema(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Cleans and normalizes columns to match clinical expectations.
        Handles missing values via median imputation.
        """
        # Case-insensitive column mapping
        mapping = {
            'hrv': 'hrv',
            'heart rate variability': 'hrv',
            'sleep': 'sleep_duration',
            'duration': 'sleep_duration',
            'quality': 'sleep_quality',
            'cortisol': 'cortisol_level',
            'light': 'light_exposure'
        }
        
        df.columns = [c.lower() for c in df.columns]
        for old, new in mapping.items():
            if old in df.columns and new not in df.columns:
                df[new] = df[old]
                
        # Missing value handling
        for col in ['hrv', 'sleep_duration', 'sleep_quality', 'cortisol_level', 'light_exposure']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                df[col] = df[col].fillna(df[col].median() if not df[col].empty else 0)
            else:
                # Default values if column missing
                defaults = {'hrv': 55.0, 'sleep_duration': 7.0, 'sleep_quality': 0.75, 'cortisol_level': 15.0, 'light_exposure': 5000.0}
                df[col] = defaults[col]
                
        return df

# Singleton instance
live_analytics_engine = LiveAnalyticsEngine()
