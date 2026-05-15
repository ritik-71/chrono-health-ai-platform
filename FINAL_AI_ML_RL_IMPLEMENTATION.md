# FINAL: AI, ML, & RL Implementation Detail

## 🧠 Diagnostic Engines

### 1. Stress & Sleep Predictor
*   **Algorithm**: Vectorized ML Ensemble.
*   **Workflow**: Analyzes HRV, Cortisol, and Sleep Quality to classify stress risks (Low/Moderate/High) and predict sleep disorder probabilities.
*   **Feature Engineering**: Derived phase stability metrics and metabolic biomarker normalization.

### 2. Circadian Instability Index (CII)
*   **Definition**: A composite metric quantifying phase drift between biological rhythms and behavioral markers.
*   **Computation**: Derived from Stress-Sleep correlation coefficients, phase shift rates, and zeitgeber (light) alignment scores.

### 3. Phenotype Cluster Analysis
*   **Logic**: Multi-dimensional clustering based on the "Balanced", "Stress-Dominant", "Sleep-Dominant", and "Comorbid" health states.
*   **Utility**: Allows clinicians to categorize patients into behavioral archetypes for standardized care.

## 🤖 Decision Support (RL)

### RL Simulation Engine
*   **Model**: Deep Q-Network (DQN) implementing Reinforcement Learning.
*   **State Space**: Biometric health state (HRV, Fatigue, Sleep).
*   **Action Space**: Interventions such as CBT-I, Light Therapy, and Sleep Restriction.
*   **Optimization**: Maximizes long-term circadian stability reward scores.

## 🔍 Explainability (XAI)
*   **Engine**: SHAP (SHapley Additive exPlanations).
*   **Workflow**: Post-hoc analysis of feature contributions for each prediction.
*   **Clinical Transparency**: Visualizes exactly how biomarkers like "Cortisol Level" or "Light Exposure" influenced a high-risk score.

## 📊 Longitudinal Intelligence
*   **Patient Journey**: Aggregates prediction history into temporal recovery curves using Exponential Moving Averages (EMA).
*   **Correlations Engine**: Real-time Pearson/Spearman matrix computation across all ingested biomarkers.
