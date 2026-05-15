# ChronoHealth AI Platform — AI, ML, & RL Implementation

## 1. Machine Learning Ecosystem

### Stress Prediction System
*   **Model**: XGBoost Classifier.
*   **Target**: 3-tier risk classification (Low, Moderate, High).
*   **Features**: HRV (Heart Rate Variability), Cortisol Levels, Sleep Quality.
*   **Confidence**: Derived from `predict_proba` with a 0.85 calibration baseline.

### Sleep Analysis Model
*   **Model**: Random Forest Regressor.
*   **Target**: Disorder Probability (0.0 to 1.0).
*   **Logic**: Analyzes duration and quality consistency to detect fragmentation.

### Behavioral Phenotype Analysis
*   **Algorithm**: K-Means Clustering + Heuristic Refinement.
*   **Categories**: Balanced, Stress-Dominant, Sleep-Dominant, Comorbid.
*   **Dynamic**: Phenotypes are recalculated for each record in the history to track state transitions.

## 2. Advanced Clinical Indices

### Circadian Interaction Index (CII)
The CII is a proprietary metric calculated using:
$$CII = \alpha \cdot \rho(Stress, Sleep) + \beta \cdot \text{PhaseShift} + \gamma \cdot \text{ZeitgeberScore}$$
*   **$\rho$**: Weighted Pearson correlation between stress and sleep biomarkers.
*   **PhaseShift**: Deviation from a 7-hour target sleep duration.
*   **ZeitgeberScore**: Intensity and timing of light exposure.

### SHAP Explainability Engine
*   **Global Importance**: Aggregated mean absolute SHAP values across all clinical targets.
*   **Local Explanations**: Uses `TreeExplainer` (where available) or **Perturbation Analysis** (surrogate) to explain specific predictions.
*   **Clinical Reasoning**: Maps SHAP directions (Positive/Negative) to human-readable clinical templates (e.g., "Reduced HRV signals autonomic dysfunction").

## 3. Reinforcement Learning (RL)

### Intervention Scheduler
*   **Framework**: Multi-Armed Bandit / Epsilon-Greedy.
*   **State**: Current CII stability and Stress risk.
*   **Actions**: Bright Light Therapy, CBT-I Session, Stimulus Control, Melatonin Timing.
*   **Reward**: Reduction in Stress risk + Improvement in Sleep Quality in the subsequent 24-hour cycle.
*   **Simulation**: Generates optimal therapeutic trajectories based on reward maximization.

## 4. Analytics Pipeline
1.  **Feature Engineering**: Scaling raw physiological inputs via `StandardScaler`.
2.  **Vectorized Inference**: Using `np.array` matrix operations for batch predictions in the `predictor.py` engine.
3.  **Real-time Analytics**: Poll-based refresh of Dashboard metrics every 30 seconds.
4.  **Recomputation**: Automated backfill logic in `live_analytics_engine.py` ensuring that every upload updates the entire longitudinal trend.
