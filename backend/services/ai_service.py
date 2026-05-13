"""
ChronoHealth AI — Upgraded AI Service
Context-aware clinical assistant with conversation memory,
dynamic analytics references, and OpenAI / fallback dual-mode.
"""

import os
from typing import Dict, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession

from services.context_engine import (
    build_context,
    format_context_for_prompt,
    generate_contextual_response,
    get_memory,
    ConversationMemory,
)

# Try to import the OpenAI client (v1+ API)
try:
    from openai import AsyncOpenAI
    _OPENAI_AVAILABLE = True
except ImportError:
    _OPENAI_AVAILABLE = False


from services.llm_reasoning_engine import llm_reasoning_engine


class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        # llm_reasoning_engine handles its own client initialization

    async def get_response(
        self,
        message: str,
        context: str = "",
        db: Optional[AsyncSession] = None,
        session_id: str = "default",
    ) -> str:
        """
        Generate a context-aware response.
        1. Build live analytics context from the database.
        2. Retrieve conversation memory for this session.
        3. Route to OpenAI Reasoning Engine or the intelligent fallback engine.
        """
        # -- 1. Build live context -----------------------------------------
        analytics_ctx: Dict[str, Any] = {}
        if db:
            try:
                analytics_ctx = await build_context(db)
            except Exception as e:
                print(f"Context engine error (non-fatal): {e}")

        # -- 2. Conversation memory ----------------------------------------
        memory = get_memory(session_id)
        memory.add_user(message)

        # -- 3. Generate response ------------------------------------------
        if llm_reasoning_engine.is_available:
            response_text = await llm_reasoning_engine.get_reasoned_response(
                message=message,
                context_data=analytics_ctx,
                history=memory.get_messages()[:-1], # pass history excluding current user msg
                page_context=context
            )
        else:
            response_text = self._fallback_response(message, analytics_ctx, memory)

        memory.add_assistant(response_text)
        return response_text

    # -- Intelligent fallback path -----------------------------------------

    def _fallback_response(
        self,
        message: str,
        ctx: Dict[str, Any],
        memory: ConversationMemory,
    ) -> str:
        return generate_contextual_response(message, ctx, memory)


ai_service = AIService()
