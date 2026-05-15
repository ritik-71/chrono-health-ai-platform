# ChronoHealth AI — Analytics & ML Implementation

## 1. Predictive Intelligence

### High-Speed Inference Engine
- **Implementation**: The `ClinicalPredictor` class provides both `predict` (single) and `predict_batch` (vectorized) methods.
- **Models**:
  - **Stress**: XGBoost classification into Low/Moderate/High risk tiers.
  - **Sleep**: Probabilistic RandomForest for disorder detection.
  - **Fatigue**: Multiclass classifier for cognitive fatigue estimation.
- **Optimization**: Batch inference recomputes 100 longitudinal data points in under 1 second.

### Explainable AI (SHAP)
- **Logic**: Integrates SHAP KernelExplainer to decompose biomarker contributions.
- **Clinical Utility**: Identifies the primary driver (e.g., HRV strain vs. Sleep loss) for every high-risk prediction.

## 2. Circadian Interaction Index (CII)
- **Concept**: Quantifies the synchronization between psychological state and biological rhythms.
- **Formula**: Derived from Pearson correlations and phase-shift rates.
- **Forecasting**: A TensorFlow LSTM model predicts CII trends based on historical longitudinal patterns.

## 3. Reinforcement Learning (RL)
- **Algorithm**: Deep Q-Learning simulation.
- **Goal**: Optimal chronotherapy scheduling (Light Therapy, CBT-I).
- **Reward Signal**: Delta reduction in Stress and CII scores over time.

## 4. Behavioral Phenotyping
- **Logic**: Unsupervised logic categorizes patients into "Balanced," "Stress-Dominant," "Sleep-Dominant," or "Comorbid" archetypes.
- **Dynamics**: Phenotypes are re-evaluated dynamically as new datasets are ingested.

## 5. Patient Journey Timeline
- **Implementation**: Temporal mapping of health state transitions.
- **Usage**: Provides clinicians with a longitudinal view of state changes across multiple health dimensions.
