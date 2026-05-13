"""
ChronoHealth AI — Live Analytics Engine
Handles real-time recomputation of clinical analytics when new datasets are uploaded.
Synchronizes prediction history, CII trends, and phenotype distributions.
"""

import pandas as pd
import numpy as np
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
        # 1. Data Validation & Schema Normalization
        df = self._normalize_schema(df)
        
        # 2. Extract Features & Run Batch Inference
        # We simulate a longitudinal timeline based on the rows if no timestamp is present
        records_to_add = []
        cii_records = []
        
        # Limit backfill to 100 records to prevent DB bloat/latency
        process_df = df.head(100)
        
        base_time = datetime.utcnow() - timedelta(days=len(process_df))
        
        for i, (_, row) in enumerate(process_df.iterrows()):
            # Map columns to predictor features
            raw_input = {
                "hrv": row.get("hrv", 55.0),
                "sleep_duration": row.get("sleep_duration", row.get("sleep", 7.0)),
                "sleep_quality": row.get("sleep_quality", 0.75),
                "cortisol_level": row.get("cortisol_level", 15.0),
                "light_exposure": row.get("light_exposure", 5000.0)
            }
            
            # Run inference
            pred = self.predictor.predict(raw_input)
            
            # Create timestamp for this record
            ts = base_time + timedelta(hours=i*6) # 4 readings per day
            
            # Map stress risk string back to numeric score for the DB
            stress_map = {"Low": 25.0, "Moderate": 55.0, "High": 85.0}
            stress_score = stress_map.get(pred["stress_risk"], 50.0)
            
            # 3. Create Prediction History Record
            history_item = PredictionHistory(
                user_id=user_id,
                stress_score=stress_score,
                sleep_score=pred["sleep_disorder_probability"] * 100,
                cii_score=pred["cii_prediction"],
                fatigue_score=50.0 if pred["mental_fatigue"] == "Moderate" else (80.0 if pred["mental_fatigue"] == "High" else 20.0),
                timestamp=ts
            )
            records_to_add.append(history_item)
            
            # 4. Create CII History Record
            cii_item = CIIHistory(
                user_id=user_id,
                cii_value=pred["cii_prediction"],
                risk_level=pred["stress_risk"], 
                timestamp=ts
            )
            cii_records.append(cii_item)
            
            # Phenotype classification is already integrated into PredictionHistory logic via scores
            # but we could add more specific phenotype tracking if needed.

        # 5. Batch Save to Database
        db.add_all(records_to_add)
        db.add_all(cii_records)
        
        # 6. (Optional) Generate a few RL interventions for historical context
        if len(records_to_add) > 5:
            rl_item = RLIntervention(
                user_id=user_id,
                intervention_type="Bright Light Therapy" if records_to_add[-1].cii_score > 60 else "CBT-I Session",
                recommendation="Generated from live data upload analysis.",
                reward_score=0.85,
                timestamp=datetime.utcnow()
            )
            db.add(rl_item)

        await db.commit()
        return len(records_to_add)

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
