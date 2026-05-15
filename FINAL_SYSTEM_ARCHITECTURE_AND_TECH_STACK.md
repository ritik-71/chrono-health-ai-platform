# ChronoHealth AI Platform — System Architecture & Tech Stack

## 1. Technical Stack

### Frontend Layer
*   **Framework**: Next.js 14/16 (App Router)
*   **Styling**: Tailwind CSS v4 (Modern CSS Architecture)
*   **Animations**: Framer Motion (High-performance UI interactions)
*   **Charts**: Recharts (Dynamic vector-based clinical visualizations)
*   **Icons**: Lucide React
*   **API Client**: Axios (Centralized instance with interceptors)

### Backend Layer
*   **Framework**: FastAPI (High-performance Asynchronous Python)
*   **ORM**: SQLAlchemy (Async Engine)
*   **Validation**: Pydantic v2
*   **ML Engine**: Scikit-Learn, XGBoost, Pandas, NumPy
*   **Explainability**: SHAP (TreeExplainer & Perturbation analysis)

### Persistence & Infrastructure
*   **Database**: Neon PostgreSQL (Primary), SQLite (Development Fallback)
*   **Platform**: Render (Backend), Vercel (Frontend)
*   **Version Control**: Git / GitHub

## 2. System Architecture

### API Flow
The platform follows a RESTful architecture with a focus on real-time data consistency.
1.  **Request**: Frontend sends authenticated requests via the centralized `api` client.
2.  **Auth**: JWT-based authentication ensures secure access to patient history.
3.  **Inference**: The `ClinicalPredictor` service runs vectorized batch inference on requested datasets.
4.  **Database**: Results are persisted in PostgreSQL, enabling longitudinal tracking.

### Upload & Analytics Recomputation Pipeline
A unique feature of the platform is its **Recursive Analytics Engine**:
1.  **Ingestion**: User uploads a dataset (CSV/XLSX).
2.  **Normalization**: `LiveAnalyticsEngine` sanitizes and scales the data.
3.  **Backfill**: The engine triggers a **Batch Inference** for the entire uploaded history (up to 100 records).
4.  **CII Calculation**: Circadian Interaction Index is mathematically derived for every point.
5.  **Persistence**: The previous history is cleared and replaced with the new, higher-fidelity dataset.
6.  **Refresh**: Frontend pages automatically update via polling/refresh cycles.

### ML/RL Subsystems
*   **Predictor**: Multi-target model (Stress, Sleep, Fatigue).
*   **CII Engine**: Correlation-based mathematical model for phase alignment.
*   **RL Engine**: Epsilon-greedy simulation for optimal intervention scheduling.
*   **Explainability**: Local SHAP cards explaining individual prediction drivers.

## 3. Deployment Architecture
*   **Production Frontend**: Hosted on Vercel with automated build optimizations.
*   **Production Backend**: Hosted on Render with auto-deployment from the `main` branch.
*   **Database**: Managed Neon PostgreSQL cluster with auto-scaling capabilities.
