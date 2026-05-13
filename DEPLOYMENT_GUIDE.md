# 🚀 ChronoHealth AI Platform Deployment Guide

This guide provides step-by-step instructions for deploying the **ChronoHealth AI Platform** using **Vercel** (Frontend) and **Render** (Backend).

## 🏗️ Architecture Overview
- **Frontend**: Next.js (TypeScript) -> Deployed on **Vercel**.
- **Backend**: FastAPI (Python) -> Deployed on **Render** (Dockerized).
- **Database**: SQLite (Local for now, can be migrated to PostgreSQL).

---

## 🎨 1. Frontend Deployment (Vercel)

### Step 1: Push to GitHub
Ensure your code is pushed to a GitHub repository.

### Step 2: Create Project on Vercel
1.  Go to [Vercel](https://vercel.com) and click **"Add New" -> "Project"**.
2.  Import your repository.
3.  **Project Configuration**:
    *   **Framework Preset**: Next.js
    *   **Root Directory**: `frontend` (Click "Edit" next to Root Directory and select the `frontend` folder).
4.  **Environment Variables**:
    *   Add `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://chronohealth-backend.onrender.com`).
    *   *Note: You'll get this URL after deploying the backend.*

### Step 3: Deploy
Click **Deploy**. Vercel will automatically build and serve your Next.js app.

---

## ⚙️ 2. Backend Deployment (Render)

### Step 1: Create Web Service
1.  Go to [Render](https://render.com) and click **"New" -> "Web Service"**.
2.  Connect your GitHub repository.
3.  **Project Configuration**:
    *   **Name**: `chronohealth-backend`
    *   **Environment**: `Docker` (Render will automatically detect the `Dockerfile` in the subfolder).
    *   **Root Directory**: `backend`
4.  **Plan**: Select "Starter" (Note: ML dependencies are heavy and might require more RAM).

### Step 2: Environment Variables
Add the following in the Render Dashboard:
*   `ENVIRONMENT`: `production`
*   `SECRET_KEY`: A long random string.
*   `ALLOWED_ORIGINS`: `https://your-vercel-domain.vercel.app,http://localhost:3000`
*   `OPENAI_API_KEY`: Your OpenAI key (if using AI Assistant).
*   `DATABASE_URL`: `sqlite+aiosqlite:///./chronohealth.db` (Default).

### Step 3: Deploy
Click **Create Web Service**. Render will build the Docker image and deploy the API.

---

## 🔗 3. Connecting the Pieces

1.  **Get the Backend URL**: Once Render finishes, copy the URL (e.g., `https://chronohealth-api.onrender.com`).
2.  **Update Vercel**: Go back to Vercel Settings -> Environment Variables and update `NEXT_PUBLIC_API_URL` with the actual backend URL.
3.  **Redeploy Frontend**: Trigger a new deployment on Vercel to pick up the new URL.

---

## 🛠️ Troubleshooting & Tips

### Heavy ML Dependencies
The `requirements.txt` includes TensorFlow, PyTorch, and Transformers. 
- **Free Tier Limits**: Render's free tier has limited RAM. If the build fails, consider upgrading to a "Starter" plan.
- **Docker Cache**: The `Dockerfile` is optimized to cache dependencies. Subsequent builds will be faster.

### Database Persistence
Render's disk is ephemeral by default.
- **SQLite**: Data will be lost on every restart.
- **Solution**: Use a managed PostgreSQL database (Render offers one) and update `DATABASE_URL`.

### CORS Issues
If you see "CORS error" in the browser console:
1.  Check the `ALLOWED_ORIGINS` in Render environment variables.
2.  Ensure it matches exactly your Vercel URL (including `https://` and no trailing slash).
