# ChronoHealth AI — AI, ML & RL Implementation Report

## 1. Machine Learning Pipelines

### Stress Prediction Engine
- **Model**: XGBoost / RandomForest Classifier.
- **Features**: HRV (Heart Rate Variability), Cortisol levels, Sleep quality, Activity intensity.
- **Output**: Multi-class classification (Low, Moderate, High risk).
- **Explainability**: Integrated SHAP values to explain feature contributions for every prediction.

### Sleep Analysis Engine
- **Model**: Probabilistic Random Forest.
- **Metrics**: Sleep Duration, Fragmentation Index, Phase Shift estimation.
- **Output**: Disorder probability and sleep architecture staging.

### Behavioral Phenotypes
- **Logic**: Unsupervised clustering of longitudinal records.
- **Categories**: Balanced, Stress-Dominant, Sleep-Dominant, Comorbid.
- **Purpose**: Personalized clinical grouping for targeted interventions.

## 2. Circadian Interaction Index (CII) Engine

### Mathematical Modeling
- **Formula**: `CII(t) = α·ρ(Stress,Sleep) + β·|dC/dt| + γ·ZeitgeberWeight`.
- **Temporal Component**: Uses a Keras LSTM model to forecast CII values 24 hours into the future.
- **Interpretation**: A higher CII indicates a strong interaction between psychological stress and circadian disruption, requiring chronotherapy.

## 3. Reinforcement Learning (RL) Agent

### Q-Learning Implementation
- **State Space**: (Current Stress, Current CII, Time of Day).
- **Action Space**: {CBT-I, Bright Light Therapy, Melatonin Scheduling, No Action}.
- **Reward Signal**: Optimized based on the delta reduction in Stress score and CII normalization.
- **Engagement Policy**: Simulates patient adherence over a 30-day window to determine the most stable intervention path.

## 4. Explainable AI (SHAP)
- **KernelExplainer**: Used to decompose black-box model outputs.
- **Clinical Utility**: Identifies if a "High Stress" prediction is driven more by physiological markers (HRV) or behavioral patterns (Sleep Loss).
- **Real-time Integration**: SHAP summaries are injected into the AI Assistant's context for transparent reasoning.

## 5. Clinical AI Assistant
- **Logic**: Advanced prompt engineering with dynamic context injection.
- **Awareness**: Injects real-time analytics, dataset metadata, and architecture facts into the GPT-4 system prompt.
- **Stability**: Multi-layered fallback system ensures responses even during API latency spikes.
