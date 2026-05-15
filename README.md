# ChronoHealth.ai - Clinical Intelligence Platform

![ChronoHealth Platform Banner](https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

**A Unified Chrono-Behavioural Digital Health Platform for the Management of Stress and Circadian Rhythm Sleep–Wake Disorders.**

---

## 📖 Final Project Documentation
For comprehensive technical details, please refer to the following final reports:
*   [Final Project Overview](./FINAL_PROJECT_OVERVIEW.md)
*   [System Architecture & Tech Stack](./FINAL_SYSTEM_ARCHITECTURE_AND_TECH_STACK.md)
*   [AI/ML/RL Implementation](./FINAL_AI_ML_RL_IMPLEMENTATION.md)
*   [Project Workflow & Pipeline](./FINAL_PROJECT_WORKFLOW_AND_PIPELINE.md)
*   [Future Scope & Roadmap](./FINAL_FUTURE_SCOPE_AND_IMPROVEMENTS.md)
*   [PPT & Viva Preparation Guide](./FINAL_PPT_AND_VIVA_GUIDE.md)

---

## 📖 Executive Summary
ChronoHealth.ai is a production-ready Healthcare SaaS platform functioning as a clinical intelligence dashboard. It bridges the gap between psychological stress and circadian misalignment. By ingesting multi-modal physiological data, processing it through an XGBoost/Random Forest pipeline, and applying Reinforcement Learning, the platform provides explainable insights and adaptive intervention scheduling.

## ✨ Core Features
1. **Clinical AI Dashboard**: Real-time ML inference visualization using `Recharts` and Framer Motion.
2. **Explainability Center**: SHAP-powered local reasoning explaining the drivers behind every prediction.
3. **Dataset Ingestion Engine**: Robust CSV/XLSX upload pipeline with automated history recomputation.
4. **Behavioral Phenotypes**: ML-based clustering to classify patients into behavioral state phenotypes.
5. **CII Interaction Engine**: Live calculation and visualization of the Circadian Interaction Index (CII).
6. **RL Intervention Scheduler**: Reinforcement learning simulation for optimizing therapeutic timing.
7. **Patient Journey Timeline**: Longitudinal recovery tracking with intervention event logs.

---

## 🛠️ Technology Stack

**Frontend Layer:**
- Next.js 14/16 (App Router)
- Tailwind CSS v4 (Modern UI Architecture)
- Framer Motion (Micro-interactions)
- Recharts (Clinical analytics)

**Backend & ML Layer:**
- FastAPI (Python 3.13)
- PostgreSQL (Neon Primary / SQLite Fallback)
- SQLAlchemy (Async ORM)
- XGBoost & Scikit-Learn (ML Inference)
- SHAP (Explainability Engine)

---

## 🚀 Environment Setup & Deployment

### Prerequisites
- Node.js (v18+)
- Python (3.11+)

### 1. Backend Initialization (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Initialization (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 Core API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | `GET` | Latest Stress & Sleep inference for the active dashboard. |
| `/api/upload` | `POST` | Ingests datasets and triggers the backfill recomputation engine. |
| `/api/cii` | `GET` | Returns mathematical Circadian Interaction Index and stability metrics. |
| `/api/explainability/analyze` | `GET/POST` | Generates SHAP feature importance and clinical reasoning cards. |
| `/api/phenotypes/analyze` | `GET` | Clusters patient data into behavioral phenotype distributions. |
| `/api/timeline/patient-journey` | `GET` | Fetches longitudinal recovery curves and intervention history. |

---

## 📊 Deployment
*   **Frontend**: Deployed on **Vercel**.
*   **Backend**: Deployed on **Render**.
*   **Database**: Hosted on **Neon PostgreSQL**.

---
*Developed by the ChronoHealth AI Research Team. All rights reserved.*
