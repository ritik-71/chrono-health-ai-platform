# ChronoHealth AI - Deployment Architecture Report

## 1. Production Topology
The platform is deployed using a distributed cloud model to optimize for performance, cost, and developer experience.

## 2. Frontend Deployment (Vercel)
- **Host**: Vercel (Optimized for Next.js).
* **Strategy**: Continuous Deployment (CD) from GitHub `main` branch.
* **Rendering**: Hybrid SSR/CSR approach for optimal hydration and speed.
* **Env Vars**: `NEXT_PUBLIC_API_URL` (Points to Render backend).

## 3. Backend Deployment (Render)
- **Host**: Render (Web Service).
* **Environment**: Dockerized (Python 3.11).
* **Inference**: Loaded model weights from `backend/ml/models`.
* **Sync**: Auto-deploys on every push to the repository.

## 4. Database Persistence (Neon)
- **Host**: Neon (Serverless PostgreSQL).
* **Connection**: Managed via `SQLALCHEMY_DATABASE_URL` secret.
* **Migrations**: Automated via Alembic for schema consistency across dev/prod.

## 5. API Synchronization
- **Cross-Origin Resource Sharing (CORS)**: Configured in `backend/main.py` to allow requests only from authorized Vercel domains.
* **Async Polling**: The frontend uses asynchronous hooks to fetch fresh data from Render every 10 seconds (for live views).

## 6. Stability & Production Strategy
1. **Hydration Protection**: All theme-specific components use `useEffect` checks to prevent SSR mismatches.
2. **Graceful Failovers**: API clients use `try-catch` blocks and default fallbacks if the Render backend is in a "cold start" period.
3. **Log Monitoring**: Integrated logs on Render and Vercel for real-time error tracking.

---
*Deployment Report Finalized.*
