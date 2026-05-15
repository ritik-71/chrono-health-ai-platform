# FINAL: System Architecture & Tech Stack

## 🏗️ High-Level Architecture
ChronoHealth AI follows a **Decoupled Analytics & Persistence Architecture**. The backend handles heavy-duty ML inference and asynchronous processing, while the frontend maintains a persistent global session for seamless clinical navigation.

## 💻 Technical Stack

### Frontend (Next.js 16.2 + TypeScript)
*   **Engine**: Next.js App Router for high-performance static generation and SSR.
*   **State Persistence**: `AnalyticsContext` providing a centralized global store for all clinical metrics.
*   **Visualizations**: Recharts for interactive, SVG-based health charts.
*   **Design System**: Modern Glassmorphism using Vanilla CSS + Tailwind-compatible utilities.

### Backend (FastAPI + Python 3.11)
*   **Framework**: FastAPI for high-concurrency, asynchronous API endpoints.
*   **Database**: SQLAlchemy (Async) with `AnalyticsCache` for result persistence.
*   **ML Pipeline**: Scikit-learn, NumPy, and SHAP for explainable health predictions.
*   **RL Engine**: Deep Q-Network (DQN) for behavioral intervention optimization.

## 🔄 Core Systems & Flow
*   **Upload Pipeline**: Securely receives CSV data, triggers the `LiveAnalyticsEngine`, and updates the global cache.
*   **API Synchronization**: The frontend uses a centralized `refreshAll` mechanism to sync with the backend state via parallel `Promise.all` requests.
*   **Deployment**: Validated for **Vercel** (Frontend) and **Render** (Backend).

## 🛡️ Stability Features
*   **Hydration Control**: Strict client/server boundary management for flawless production rendering.
*   **Cache Invalidation**: Automated clearing of stale clinical results upon new dataset ingestion.
*   **Async Processing**: Non-blocking analytics computation for large-scale backfills.
