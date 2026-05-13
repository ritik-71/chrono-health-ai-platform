# ChronoHealth AI Platform: Complete Site Overview

## 1. Executive Summary
The ChronoHealth AI Platform is a sophisticated SaaS product designed to model, analyze, and manage the complex bidirectional relationship between psychological stress and circadian rhythm disruptions. It acts as an advanced clinical dashboard powered by real-time ML inference, a Reinforcement Learning (RL) agent for chronotherapy recommendations, and a Next.js front end.

## 2. Frontend Architecture Overview
- **Framework**: Next.js 16 (App Router), React 19.
- **Styling**: Tailwind CSS v4 with a highly customized class-based Semantic Theme System (Dark/Light).
- **Visualization**: Recharts, utilizing global CSS overrides to ensure tooltips, grids, and ticks maintain contrast across themes.
- **Animation**: Framer Motion for micro-interactions, page transitions, and data-entry simulations.
- **State Management**: React Hooks (useState, useEffect, custom hooks like `useChronoTheme`) handling real-time data polling.

## 3. Backend Architecture Overview
- **Framework**: FastAPI (Python 3.13), providing highly concurrent async endpoints.
- **Routing**: Modularized endpoints for Authentication (`/auth/login`), Analytics (`/api/analytics`), Explanations (`/api/explain`), and Real-time CII Tracking (`/api/cii`).
- **Database Integration**: Set up to utilize SQLAlchemy for connecting to SQLite (local development) or Neon Serverless Postgres (production).
- **Concurrency**: Uvicorn ASGI server managing real-time websocket-like polling efficiently without thread-blocking.

## 4. Machine Learning & Analytics Engines
- **Predictive Analytics (XGBoost/LightGBM)**: Powers the Stress Predictor and Sleep Analysis by forecasting physiological degradation.
- **Circadian Interaction Index (CII)**: A core proprietary metric combining stress vectors, phase shift rates, and external zeitgebers to quantify chronobiological risk.
- **Phenotype Clustering**: Utilizes K-Means/DBSCAN logic to cluster patient behavioral data into actionable clinical phenotypes.

## 5. Reinforcement Learning (RL) System
- **Purpose**: Dynamically simulates optimal intervention strategies (e.g., CBT-I, Light Therapy).
- **Mechanics**: Computes cumulative reward progressions by simulating state-action pairs, ensuring that the prescribed chronotherapy minimizes long-term physiological volatility.

## 6. Chatbot Overview
- **Technology**: Built into the frontend via a sliding drawer (`AIAssistant.tsx`) communicating with the backend.
- **Context Awareness**: Leverages current dashboard context (e.g., "The patient is currently high risk with a CII of 88") to deliver highly relevant clinical advice and explain analytical findings in human-readable terms.

## 7. Deployment Readiness
The platform is in a highly mature state:
- **Build Status**: Passing (0 errors, 9.9s build time).
- **Type Safety**: Passing (TypeScript fully resolved for complex chart mappings).
- **Theme Scalability**: Robust semantic tokens enable seamless scalability without hardcoded color conflicts.
- **Readiness**: Ready for containerization (Docker) and deployment via Vercel (Frontend) and AWS/Render (FastAPI).
