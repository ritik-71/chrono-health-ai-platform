"""
ChronoHealth AI — Assistant Routes
Both the legacy /chat endpoint and the new /context-chat endpoint.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from services.ai_service import ai_service
from core.database import get_db

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    context: str = ""
    session_id: str = "default"


# ── Legacy endpoint (backward-compatible) ────────────────────────────────
@router.post("/chat")
async def chat_with_assistant(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Original chat route — now context-aware via the upgraded ai_service."""
    try:
        response = await ai_service.get_response(
            message=request.message,
            context=request.context,
            db=db,
            session_id=request.session_id,
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── New context-chat endpoint ────────────────────────────────────────────
@router.post("/context-chat")
async def context_chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Enhanced context-chat that explicitly returns the analytics context
    snapshot alongside the AI response.
    """
    try:
        from services.context_engine import build_context

        # Build context + get response in parallel-ish fashion
        analytics_ctx = {}
        try:
            analytics_ctx = await build_context(db)
        except Exception as ctx_err:
            print(f"Context build warning: {ctx_err}")

        response = await ai_service.get_response(
            message=request.message,
            context=request.context,
            db=db,
            session_id=request.session_id,
        )

        return {
            "response": response,
            "context": {
                "predictions": analytics_ctx.get("prediction_summary", ""),
                "cii": analytics_ctx.get("cii_summary", ""),
                "rl": analytics_ctx.get("rl_summary", ""),
                "datasets": analytics_ctx.get("dataset_summary", ""),
            },
            "session_id": request.session_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
