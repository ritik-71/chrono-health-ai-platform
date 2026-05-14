# ChronoHealth AI Platform - Master Documentation

## 1. Project Overview
ChronoHealth AI is a state-of-the-art, professional-grade AI Healthcare SaaS platform designed for longitudinal clinical monitoring, circadian rhythm analysis, and personalized intervention optimization. It utilizes advanced Machine Learning (XGBoost/LightGBM), Explainable AI (SHAP), and Reinforcement Learning (Q-Learning) to provide clinicians with actionable insights into patient health dynamics.

## 2. Core Modules
- **Clinical Dashboard**: Real-time visualization of health metrics with live synchronization.
* **CII Engine**: Quantifies the Circadian Interaction Index using a proprietary mathematical vector model.
* **Stress Predictor**: Multi-target ML inference for stress risk, sleep quality, and fatigue.
* **RL Simulation**: Adaptive Q-Learning engine for personalized chronotherapy scheduling.
* **Explainability Center**: SHAP-powered local and global feature importance analysis.
* **Phenotype Explorer**: Unsupervised/Supervised behavioral clustering for patient segmentation.
* **Patient Journey**: Longitudinal tracking of biomarker recovery curves over time.
* **AI Assistant**: Context-aware clinical chatbot for data-driven queries.

## 3. Technology Stack Summary
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts.
* **Backend**: FastAPI (Python), SQLAlchemy (Async), Pydantic.
* **AI/ML**: XGBoost, LightGBM, SHAP, Scikit-learn, Reinforcement Learning (Q-Learning).
* **Database**: Neon PostgreSQL (Production), SQLite (Development).
* **Deployment**: Vercel (Frontend), Render (Backend), Docker.

## 4. System Architecture
The project follows a decoupled, asynchronous architecture:
- **Frontend**: Client-side heavy rendering with real-time polling and hydration-safe theme management.
* **Backend**: High-performance FastAPI server with asynchronous database drivers.
* **ML Layer**: Isolated inference engines for ML, CII, and RL logic.
* **Persistence**: Relational database with Alembic migrations.

## 5. Key Innovations
1. **Dynamic Dataset-Driven Analytics**: The platform is 100% data-driven; uploading a dataset recomputes the entire dashboard in real-time.
2. **Proprietary CII Formula**: Mathematical quantification of the coupling between stress, sleep, and light exposure.
3. **Adaptive RL Scheduling**: Moving beyond static advice to a learning agent that optimizes interventions based on reward feedback.
4. **Clinical SHAP Integration**: Visualizing 'Why' the AI made a prediction, essential for medical trust.

---
*Document Generated on: 2026-05-14*
