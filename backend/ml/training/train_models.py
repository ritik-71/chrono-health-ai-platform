import os
import sys
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

try:
    import xgboost as xgb
except ImportError:
    print("XGBoost not available, falling back to RandomForest")
    xgb = None

try:
    import lightgbm as lgb
except ImportError:
    print("LightGBM not available")
    lgb = None

try:
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
except ImportError:
    print("TensorFlow not available")
    Sequential = None

def generate_synthetic_dataset(num_samples=2000):
    np.random.seed(42)
    # Simulate clinical features
    hrv = np.random.normal(50, 15, num_samples) # Heart Rate Variability
    sleep_duration = np.random.normal(6.5, 1.5, num_samples) # Hours
    sleep_quality = np.random.uniform(0.3, 0.95, num_samples) # Index
    cortisol_level = np.random.normal(15, 5, num_samples) # mcg/dL
    light_exposure = np.random.normal(5000, 2000, num_samples) # Lux
    
    # Target variables calculated via logical correlations with noise
    stress_risk = np.where(hrv < 40, 2, np.where(hrv < 60, 1, 0)) # 0: Low, 1: Moderate, 2: High
    sleep_disorder = np.where((sleep_duration < 5.5) | (sleep_quality < 0.5), 1, 0) # 0: No, 1: Yes
    circadian_stability = np.clip(100 - (abs(sleep_duration - 7.5) * 10) + (light_exposure / 1000) * 2, 0, 100)
    mental_fatigue = np.where((stress_risk == 2) & (sleep_disorder == 1), 2, np.where(stress_risk >= 1, 1, 0))
    
    df = pd.DataFrame({
        'hrv': hrv,
        'sleep_duration': sleep_duration,
        'sleep_quality': sleep_quality,
        'cortisol_level': cortisol_level,
        'light_exposure': light_exposure,
        'stress_risk': stress_risk,
        'sleep_disorder': sleep_disorder,
        'circadian_stability': circadian_stability,
        'mental_fatigue': mental_fatigue
    })
    
    os.makedirs('../../datasets', exist_ok=True)
    dataset_path = '../../datasets/chrono_cbt_dataset.csv'
    df.to_csv(dataset_path, index=False)
    print(f"Generated synthetic dataset at {dataset_path}")
    return df

def train_and_save_models():
    df = generate_synthetic_dataset()
    
    # Features & Targets
    features = ['hrv', 'sleep_duration', 'sleep_quality', 'cortisol_level', 'light_exposure']
    X = df[features]
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    os.makedirs('../models', exist_ok=True)
    joblib.dump(scaler, '../models/scaler.pkl')
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, df, test_size=0.2, random_state=42)

    # 1. Stress Risk Model (XGBoost / Fallback RF)
    if xgb:
        stress_model = xgb.XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.1)
    else:
        stress_model = RandomForestClassifier(n_estimators=100, random_state=42)
    stress_model.fit(X_train, y_train['stress_risk'])
    joblib.dump(stress_model, '../models/stress_model.pkl')
    print("Saved stress_model.pkl")

    # 2. Sleep Disorder Model (Random Forest)
    sleep_model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    sleep_model.fit(X_train, y_train['sleep_disorder'])
    joblib.dump(sleep_model, '../models/sleep_model.pkl')
    print("Saved sleep_model.pkl")
    
    # 3. Circadian Stability Model (LightGBM / Fallback XGB/RF)
    if lgb:
        circadian_model = lgb.LGBMRegressor(n_estimators=100, learning_rate=0.05)
    else:
        circadian_model = RandomForestClassifier(n_estimators=100) # Fallback
    circadian_model.fit(X_train, y_train['circadian_stability'])
    joblib.dump(circadian_model, '../models/circadian_model.pkl')
    print("Saved circadian_model.pkl")
    
    # 4. Mental Fatigue Model (XGBoost)
    fatigue_model = RandomForestClassifier(n_estimators=100, random_state=42)
    fatigue_model.fit(X_train, y_train['mental_fatigue'])
    joblib.dump(fatigue_model, '../models/fatigue_model.pkl')
    print("Saved fatigue_model.pkl")

    # 5. LSTM for CII Temporal Forecasting
    if Sequential:
        # LSTM expects 3D shape (samples, time steps, features)
        X_lstm = X_train.reshape((X_train.shape[0], 1, X_train.shape[1]))
        y_lstm = y_train['circadian_stability'].values # Predicting stability as a proxy for CII
        
        lstm_model = Sequential([
            LSTM(32, activation='relu', input_shape=(1, X_train.shape[1])),
            Dense(16, activation='relu'),
            Dense(1)
        ])
        lstm_model.compile(optimizer='adam', loss='mse')
        lstm_model.fit(X_lstm, y_lstm, epochs=10, batch_size=32, verbose=0)
        lstm_model.save('../models/cii_lstm.keras')
        print("Saved cii_lstm.keras")

if __name__ == "__main__":
    train_and_save_models()
    print("Machine Learning Pipeline execution complete. Real models are now persisted.")
