# ChronoHealth AI Platform — PPT & Viva Guide

## 📊 Presentation Structure (Recommended Slides)
1.  **Title Slide**: ChronoHealth AI — Precision Clinical Analytics.
2.  **Problem Statement**: The "Black Box" of circadian disruption in chronic health.
3.  **Proposed Solution**: A data-driven, XAI-powered platform for longitudinal health tracking.
4.  **System Architecture**: Next.js + FastAPI + Async Persistence.
5.  **Analytics Layer**: CII calculation, SHAP explainability, and DQN simulation.
6.  **Results & Dashboard**: Visualizing the "Patient Journey" and "Recovery Curves."
7.  **Future Scope**: IoT integration and Genetic stratification.

## 🎙️ Likely Viva Questions & Key Answers

### Q1: Why use SHAP for explainability?
**Answer**: Unlike "Black Box" models, SHAP provides mathematically sound feature contributions, allowing clinicians to see exactly which biomarker (e.g., Cortisol level) drove a "High Stress" prediction.

### Q2: How is the CII index calculated?
**Answer**: The CII (Circadian Interaction Index) is a composite score derived from the phase shift rate, stress-sleep correlation coefficients, and zeitgeber (light) alignment scores.

### Q3: What is the benefit of the global analytics persistence layer?
**Answer**: It ensures that expensive ML results are only computed once after a dataset upload. Navigating through the 10+ dashboard sub-pages becomes near-instant because the data is served from a centralized global state (`AnalyticsContext`).

### Q4: How does the RL Simulation work?
**Answer**: It uses a Deep Q-Network (DQN) that takes the current health state as input and recommends interventions (e.g., CBT-I) that maximize a reward function based on long-term stability.
