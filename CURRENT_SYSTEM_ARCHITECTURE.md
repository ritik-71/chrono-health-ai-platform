# ChronoHealth AI — Current System Architecture

## 1. Technical Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Visualizations**: Recharts (Optimized for dynamic data streams)

### Backend
- **Framework**: FastAPI (Async engine)
- **ORM**: SQLAlchemy (Async Engine)
- **Database**: 
  - **Production**: Neon (Managed PostgreSQL)
  - **Local**: SQLite (aiosqlite)

### Machine Learning
- **Core Models**: Scikit-learn (RandomForest, XGBoost)
- **Forecasting**: TensorFlow/Keras (Temporal CII Forecasting)
- **Explainability**: SHAP (Vectorized computation)
- **Optimization**: Batch Inference Engine for high-speed dataset processing.

## 2. Optimized Pipeline Architecture

### Data Ingestion & Batch Recomputation
1. **Frontend**: Dataset uploaded via `dashboard/upload`.
2. **Backend**: `upload.py` persists raw metadata.
3. **Analytics Engine**: `LiveAnalyticsEngine` triggers `predict_batch`.
4. **Vectorization**: Instead of individual record processing, the system performs a single vectorized pass through the ML models.
5. **Persistence**: Bulk database inserts minimize I/O overhead.

### Dynamic Rendering Loop
- The frontend uses a reactive state pattern where data-driven updates from the database trigger targeted rerenders of Recharts components.
- Analytics summaries are computed server-side to reduce client-side overhead.

## 3. Deployment Strategy
- **Frontend**: Vercel (CI/CD connected to GitHub).
- **Backend**: Render (Uvicorn-based async deployment).
- **Persistence**: Neon (Autoscaling PostgreSQL).
- **Isolation**: Environment variables are strictly managed for production-grade security.
