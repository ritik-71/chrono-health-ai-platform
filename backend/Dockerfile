# Production Dockerfile for ChronoHealth AI Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for scientific libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Create directory for local models and sqlite fallback
RUN mkdir -p /app/ml/models

# Expose FastAPI port
EXPOSE 8000

# Health check for production orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start using Gunicorn with Uvicorn workers for production stability
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
