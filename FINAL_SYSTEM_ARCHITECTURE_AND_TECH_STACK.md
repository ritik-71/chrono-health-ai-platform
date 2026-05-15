# ChronoHealth AI Platform — System Architecture & Tech Stack

## 🏗️ Architectural Pattern
The system follows a **Decoupled Analytics Architecture** with a centralized state persistence layer. This ensures that heavy ML/RL computations are performed asynchronously or cached, while the UI remains highly responsive.

## 💻 Tech Stack

### Frontend (Next.js 16.2 + TypeScript)
*   **Framework**: Next.js (App Router) for SSR and SEO optimization.
*   **Styling**: Vanilla CSS + Tailwind-compatible utilities for premium glassmorphism effects.
*   **Animations**: Framer Motion for high-performance micro-interactions.
*   **State Management**: `AnalyticsContext` (React Context API) providing global persistence for all clinical metrics.
*   **Visualizations**: Recharts for interactive, SVG-based clinical charts.

### Backend (FastAPI + Python 3.11)
*   **Framework**: FastAPI for high-concurrency, async API handling.
*   **ORM**: SQLAlchemy (Async) with PostgreSQL/SQLite.
*   **Inference Engine**: Custom ML Pipeline using Scikit-learn and NumPy.
*   **RL Engine**: Deep Q-Network (DQN) implementation for intervention simulations.
*   **Caching**: `AnalyticsCache` table for persisting expensive analytic results (SHAP, Timeline).

### Deployment
*   **Frontend**: Vercel (Production Build).
*   **Backend**: Render (Python Environment).

## 🛠️ Performance Optimizations
1.  **Global Analytics Persistence**: Navigation between tabs does not trigger new API calls; data is served from the `AnalyticsContext`.
2.  **Backend Result Caching**: SHAP explainability and Patient Journey timelines are computed once and stored, drastically reducing CPU load.
3.  **Parallel Ingestion**: The `refreshAll` mechanism uses `Promise.all` to fetch all core metrics in parallel upon dataset upload.
