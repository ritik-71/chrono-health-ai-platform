# ChronoHealth AI — Tech Stack & Architecture

## 1. Technical Stack

### Frontend (User Interface)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion (Animations)
- **Visualizations**: Recharts (Dynamic Canvas-based rendering)
- **State Management**: React Hooks + Local Storage
- **API Client**: Axios + Native Fetch (Streaming Ready)

### Backend (Core Logic)
- **Framework**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy (Async Engine)
- **Database**: 
  - **Production**: Neon (Managed PostgreSQL)
  - **Local/Test**: SQLite (aiosqlite)
- **Authentication**: JWT-based session management

### AI & Machine Learning
- **Processing**: Pandas, NumPy, Scikit-learn
- **Deep Learning**: TensorFlow/Keras (Temporal Forecasting)
- **Explainability**: SHAP (SHapley Additive exPlanations)
- **Large Language Models**: OpenAI GPT-4 API (Context-Aware Reasoning)

## 2. System Architecture
- **Multi-Modular Micro-Services**: The backend is organized into routes (`api/routes/`), services (`services/`), and ML modules (`ml/`).
- **Async Processing**: All database and AI interactions are non-blocking to support high-concurrency clinical research.
- **Data-Driven Synchronization**: The `LiveAnalyticsEngine` serves as the central "brain" that synchronizes the database with uploaded clinical files.

## 3. Key Architectural Flows

### Upload & Recomputation Flow
1. **Frontend**: `dashboard/upload` page sends CSV/JSON to `/api/upload`.
2. **Backend**: `upload.py` validates structure and calculates AI quality scores.
3. **Engine**: `LiveAnalyticsEngine` triggers a full data backfill.
4. **Persistence**: Database records are updated, triggering a refresh of all frontend dashboard modules via periodic polling.

### Clinical AI Reasoning Flow
1. **Trigger**: User asks a question in the AI Assistant.
2. **Context Gathering**: `context_engine.py` parallelizes queries to gather latest Predictions, CII, SHAP, and RL metrics.
3. **Prompting**: `llm_reasoning_engine.py` constructs a dense, technical prompt.
4. **OpenAI**: GPT-4 generates a reasoned response grounded in the live analytics.
5. **Fallback**: If the LLM times out, the system triggers a local template engine for stability.

## 4. Deployment Architecture
- **Frontend**: Vercel (Optimized for Next.js 14).
- **Backend**: Render (Uvicorn-based async process).
- **Persistence**: Neon (Serverless PostgreSQL).
- **Environment Management**: Strictly isolated `.env` configurations for production and local development.
