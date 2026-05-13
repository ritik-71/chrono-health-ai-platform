import sys
import os
import random
import numpy as np

# Add the project root to sys.path so we can import ml.preprocessing
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from ml.preprocessing.pipeline import DataPreprocessor

class ClinicalPredictor:
    def __init__(self):
        self.preprocessor = DataPreprocessor()
        # In a real scenario, we would load models here:
        # self.stress_model = joblib.load('models/xgboost_stress.pkl')
        # self.sleep_model = tf.keras.models.load_model('models/lstm_sleep.h5')

    def predict(self, raw_data: dict) -> dict:
        """
        Runs the full inference pipeline based on Capstone Code logic.
        """
        # 1. Preprocess data
        processed_data = self.preprocessor.preprocess(raw_data)
        
        # 2. Mock Model Inference (Fallback logic since models aren't provided)
        # Using HRV as a core base feature if provided, else randomize
        hrv = float(raw_data.get('hrv', random.uniform(30, 80)))
        sleep_duration = float(raw_data.get('sleep_duration', random.uniform(4.5, 9.0)))
        
        # Simulated XGBoost output
        stress_prob = max(0.1, min(0.99, (100 - hrv) / 100.0))
        stress_risk = "High" if stress_prob > 0.7 else "Moderate" if stress_prob > 0.4 else "Low"
        
        # Simulated LSTM output
        sleep_prob = max(0.1, min(0.99, (10 - sleep_duration) / 10.0))
        
        # CII (Circadian Interaction Index) Formula Simulation
        # CII(t)= α·ρ(S,C)(t) + β·|dC/dt| + γ·Σwi·fi(t)
        cii_prediction = min(100.0, max(0.0, 100 - (stress_prob * 50) - (sleep_prob * 30)))
        
        # Recommendations Generator
        cbt_suggestions = ["Practice progressive muscle relaxation."]
        timing = "08:00 AM Light Therapy"
        if sleep_prob > 0.6:
            cbt_suggestions.append("Implement strict stimulus control tonight.")
            timing = "07:30 AM Light Therapy + Melatonin at 9:00 PM"
            
        return {
            "stress_risk": stress_risk,
            "sleep_disorder_probability": round(sleep_prob, 2),
            "circadian_stability": round(random.uniform(60, 95), 1),
            "mental_fatigue": "High" if stress_risk == "High" else "Low",
            "cii_prediction": round(cii_prediction, 1),
            "chronotherapy_timing": timing,
            "personalized_cbt_suggestions": cbt_suggestions
        }
