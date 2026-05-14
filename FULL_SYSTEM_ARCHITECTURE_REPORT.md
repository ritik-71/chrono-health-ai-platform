# ChronoHealth AI - Full System Architecture Report

## 1. High-Level Architecture
The platform is built on a **Decoupled Service Architecture** where the frontend and backend operate as independent entities communicating via a RESTful API. This ensures scalability, modularity, and ease of deployment.

## 2. Frontend Architecture (Next.js)
- **App Router**: Uses the modern Next.js folder structure for route handling and layout persistence.
* **Component-Based UI**: Modular React components for charts, stat cards, and navigation.
* **Client-Side State**: Uses React Hooks (useState, useEffect, useCallback) for managing live analytics and user interactions.
* **Responsive Design**: Mobile-first approach using Tailwind's utility classes.

## 3. Backend Architecture (FastAPI)
- **Router Pattern**: Organized into specialized routes (`/prediction`, `/cii`, `/rl`, etc.).
* **Async Database Layer**: Utilizes `SQLAlchemy` with `asyncpg` for non-blocking database operations.
* **Service Layer**: Dedicated logic for ML inference and data processing in `backend/ml`.
* **Model Layer**: Pydantic schemas for request/response validation.

## 4. AI/ML Integration Workflow
1. **Request**: Frontend sends clinical data or triggers an analysis.
2. **Inference**: Backend loads pre-trained models (`.pkl`/`.joblib`) and runs prediction.
3. **Explanation**: SHAP engine computes feature importance for that specific prediction.
4. **Response**: Backend returns JSON containing scores, labels, and SHAP values.

## 5. Data Flow (Ingestion Pipeline)
1. **Upload**: User uploads a clinical dataset (CSV/JSON).
2. **Validation**: Backend checks for schema consistency and missing values.
3. **Persistence**: Valid records are stored in PostgreSQL.
4. **Recomputation**: The dashboard polls the API, finds new history records, and updates all charts automatically.

## 6. Security & Stability
- **Environment Isolation**: Secrets managed via `.env` and deployment platform variables.
* **Error Handling**: Comprehensive middleware for catching and logging runtime exceptions.
* **CORS Management**: Securely handles cross-origin requests between Vercel and Render.

---
*Architectural Review Complete.*
