import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_squared_error

try:
    import xgboost as xgb
except ImportError:
    xgb = None

# Ensure directory exists
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_robust_clinical_dataset(num_samples=5000):
    """
    Generates a robust synthetic dataset based on clinical chronobiological research
    (proxy for the Capstone notebook logic) to allow the platform to function 
    with realistic distributions until real patient data is ingested.
    """
    np.random.seed(42)
    
    # ── BASE CLINICAL FEATURES ──────────────────────────────────────────────
    # HRV: Lower values correlate with high stress/autonomic strain
    hrv = np.random.normal(55, 12, num_samples) 
    # Sleep Duration: 7-9 is healthy, <6 is high risk
    sleep_duration = np.random.normal(7.0, 1.2, num_samples)
    # Sleep Quality: 0.0 to 1.0 index
    sleep_quality = np.random.beta(7, 2, num_samples) 
    # Cortisol: Normal morning range 10-20, high >25
    cortisol_level = np.random.normal(16, 6, num_samples)
    # Light Exposure: Measured in Lux, anchors the SCN clock
    light_exposure = np.random.gamma(5, 1000, num_samples)

    # ── TARGET GENERATION LOGIC (ML GROUND TRUTH) ───────────────────────────
    
    # 1. Stress Risk (0: Low, 1: Moderate, 2: High)
    stress_score = (80 - hrv) * 0.4 + (cortisol_level * 1.5) + (7 - sleep_duration) * 2
    stress_risk = np.where(stress_score > 65, 2, np.where(stress_score > 40, 1, 0))

    # 2. Sleep Disorder (0: No, 1: Yes)
    # CRSWD proxy: Misalignment between light and sleep
    sleep_disorder_score = (6 - sleep_duration) * 3 + (1 - sleep_quality) * 40 + (cortisol_level > 22) * 10
    sleep_disorder = np.where(sleep_disorder_score > 30, 1, 0)

    # 3. Mental Fatigue (0: Low, 1: Moderate, 2: High)
    fatigue_score = (stress_risk * 20) + (sleep_disorder * 30) + np.random.normal(0, 5, num_samples)
    fatigue_risk = np.where(fatigue_score > 60, 2, np.where(fatigue_score > 30, 1, 0))

    # 4. Circadian Interaction Index (CII) - Regression target (0-100)
    # Formula based on capstone: CII = alpha*hrv + beta*sleep + gamma*light
    cii = np.clip(100 - (abs(sleep_duration - 7.5) * 8) - (stress_risk * 10) + (light_exposure / 5000) * 5, 0, 100)

    # 5. Behavioral Phenotypes (Categorical)
    # Balanced, Stress-Dominant, Sleep-Dominant, Comorbid
    phenotypes = []
    for i in range(num_samples):
        s = stress_risk[i]
        sl = sleep_disorder[i]
        if s >= 2 and sl >= 1: phenotypes.append(3) # Comorbid
        elif s >= 2: phenotypes.append(1) # Stress-Dominant
        elif sl >= 1: phenotypes.append(2) # Sleep-Dominant
        else: phenotypes.append(0) # Balanced
    phenotype_labels = np.array(phenotypes)

    df = pd.DataFrame({
        'hrv': hrv,
        'sleep_duration': sleep_duration,
        'sleep_quality': sleep_quality,
        'cortisol_level': cortisol_level,
        'light_exposure': light_exposure,
        'stress_risk': stress_risk,
        'sleep_disorder': sleep_disorder,
        'mental_fatigue': fatigue_risk,
        'cii': cii,
        'phenotype': phenotype_labels
    })
    
    return df

def train_models():
    print("Initializing Clinical Model Training Pipeline...")
    df = generate_robust_clinical_dataset()
    
    features = ['hrv', 'sleep_duration', 'sleep_quality', 'cortisol_level', 'light_exposure']
    X = df[features]
    
    # Initialize and save scaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.pkl'))
    print("Scaler persisted.")

    # ── 1. Stress Model (XGBoost if available, else RF) ───────────────────
    if xgb:
        stress_model = xgb.XGBClassifier(n_estimators=100, learning_rate=0.05, max_depth=5)
    else:
        stress_model = RandomForestClassifier(n_estimators=100, random_state=42)
    stress_model.fit(X_scaled, df['stress_risk'])
    joblib.dump(stress_model, os.path.join(MODELS_DIR, 'stress_model.pkl'))
    print("Stress Model persisted.")

    # ── 2. Sleep Model ────────────────────────────────────────────────────
    sleep_model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    sleep_model.fit(X_scaled, df['sleep_disorder'])
    joblib.dump(sleep_model, os.path.join(MODELS_DIR, 'sleep_model.pkl'))
    print("Sleep Model persisted.")

    # ── 3. Fatigue Model ──────────────────────────────────────────────────
    fatigue_model = RandomForestClassifier(n_estimators=100, random_state=42)
    fatigue_model.fit(X_scaled, df['mental_fatigue'])
    joblib.dump(fatigue_model, os.path.join(MODELS_DIR, 'fatigue_model.pkl'))
    print("Fatigue Model persisted.")

    # ── 4. Phenotype Model (Multiclass) ───────────────────────────────────
    pheno_model = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42)
    pheno_model.fit(X_scaled, df['phenotype'])
    joblib.dump(pheno_model, os.path.join(MODELS_DIR, 'phenotype_model.pkl'))
    print("Phenotype Model persisted.")

    # ── 5. CII Regression Model ───────────────────────────────────────────
    cii_model = RandomForestRegressor(n_estimators=100, random_state=42)
    cii_model.fit(X_scaled, df['cii'])
    joblib.dump(cii_model, os.path.join(MODELS_DIR, 'cii_model.pkl'))
    print("CII Model persisted.")
    
    # ── 6. Legacy Circadian Model (for backward compatibility) ───────────
    circ_model = RandomForestRegressor(n_estimators=50, random_state=42)
    circ_model.fit(X_scaled, df['cii']) # Uses CII as proxy for legacy circadian stability
    joblib.dump(circ_model, os.path.join(MODELS_DIR, 'circadian_model.pkl'))
    print("Legacy Circadian Model persisted.")

    print("\nAll models successfully trained and modularized.")

if __name__ == "__main__":
    train_models()
