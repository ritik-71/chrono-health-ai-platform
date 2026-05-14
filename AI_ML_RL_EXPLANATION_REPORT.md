# ChronoHealth AI - AI/ML/RL Logic Explanation Report

## 1. Stress & Health Prediction (ML)
- **Algorithms**: XGBoost and LightGBM.
* **Why**: Chosen for their superior performance with tabular clinical data and ability to handle non-linear relationships.
* **Logic**: Predicts three simultaneous targets:
  - `stress_risk`: Continuous score (0-100).
  - `sleep_quality`: Multi-class classification (Poor, Fair, Optimal).
  - `fatigue_score`: Quantified exhaustion index.
* **Healthcare Significance**: Early detection of burnout and chronic stress patterns.

## 2. Circadian Interaction Index (CII)
- **Mathematical Model**: A proprietary vector-based formula:
  `CII(t) = α·ρ(S,C) + β·|dC/dt| + γ·Σ(w·f)`
* **Parameters**:
  - `ρ(S,C)`: Stress-Sleep Correlation.
  - `|dC/dt|`: Circadian Drift Rate (Phase Shift).
  - `Σ(f)`: External Zeitgebers (Light, Activity).
* **Innovation**: Quantifies "Chrono-Disruption" in a single score (0-100).

## 3. Reinforcement Learning (RL)
- **Algorithm**: Q-Learning (Off-policy TD Control).
* **State Space**: (Stress Level, Sleep Deficit, Circadian Phase).
* **Action Space**: (Morning Light Therapy, CBT-I, Melatonin, No Intervention).
* **Reward Function**: `R = ΔSleep - ΔStress - ΔCII`.
* **Logic**: The agent learns the optimal "Policy" for each patient to maximize recovery reward.

## 4. Explainable AI (SHAP)
- **Method**: KernelSHAP / TreeSHAP.
* **Implementation**: Generates "Waterfall" and "Bar" plots for every prediction.
* **Clinical Benefit**: Doctors can see that a "High Stress" prediction was driven by `hrv=45ms` and `cortisol=18µg/dL`, allowing for validated clinical decisions.

## 5. Phenotype Clustering
- **Algorithm**: K-Means / DBSCAN (Unsupervised).
* **Usage**: Groups patients into behavioral phenotypes (e.g., "Stress-Dominant", "Sleep-Dominant").
* **Benefit**: Allows for group-level intervention strategies and population health management.

---
*AI/ML Technical Documentation Complete.*
