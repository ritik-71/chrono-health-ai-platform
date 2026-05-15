# ChronoHealth AI Platform — Analytics Pipeline & Implementation

## 🔄 The Data Ingestion Flow
1.  **Ingestion**: CSV dataset upload via the specialized Ingestion Engine.
2.  **Backfill**: `LiveAnalyticsEngine` processes historical records, running batch ML inference.
3.  **Synchronization**: The engine invalidates old caches and populates `PredictionHistory` and `CIIHistory`.
4.  **Persistence**: Results are stored in the database and indexed for the global `AnalyticsContext`.

## 🧠 Intelligence Modules

### 1. Circadian Interaction Index (CII)
*   **Formula**: Quantifies phase drift between biological rhythms and behavioral markers.
*   **Components**: Stress-Sleep Correlation, Phase Shift Rate, and External Zeitgeber (Light) alignment.
*   **Insight**: Identifies "Chronodisruption" before it manifests as chronic disease.

### 2. Explainable AI (XAI)
*   **Algorithm**: SHAP (SHapley Additive exPlanations).
*   **Implementation**: Calculates the marginal contribution of each biomarker (HRV, Cortisol, etc.) to the final risk score.
*   **Benefit**: Provides clinicians with "The Why" behind every AI-driven alert.

### 3. RL Simulation Engine
*   **Model**: Deep Q-Learning (DQN).
*   **Objective**: Optimize the reward function (minimized stress + maximized circadian stability).
*   **Actions**: CBT-I protocols, Light Therapy, and Sleep Restriction schedules.

## 📊 Visualization Strategy
*   **Recovery Curves**: Composed charts showing raw biomarkers vs. smoothed EMA trends.
*   **Biomarker Radar**: 5-dimensional health profile visualizing HRV, Fatigue, and CII simultaneously.
*   **Temporal Heatmaps**: Day/Hour matrices identifying peak disruption periods.
