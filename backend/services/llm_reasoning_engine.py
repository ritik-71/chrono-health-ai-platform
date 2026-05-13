"""
ChronoHealth AI — LLM Reasoning Engine
Dedicated service for high-fidelity clinical reasoning using GPT-4.
Integrates live analytics (CII, RL, SHAP, Phenotypes) with conversational memory.
"""

import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime

try:
    from openai import AsyncOpenAI
    _OPENAI_AVAILABLE = True
except ImportError:
    _OPENAI_AVAILABLE = False

SYSTEM_PROMPT = """You are ChronoHealth AI, a senior clinical intelligence assistant specialized in chronobiology and behavioral health.
Your objective is to provide high-fidelity reasoning based on the patient's LIVE analytics context.

CONTEXT SOURCES YOU HAVE ACCESS TO:
1. PREDICTION HISTORY: Longitudinal trends in Stress, Sleep, Fatigue, and CII.
2. PHENOTYPE ANALYTICS: Classification into Balanced, Stress-dominant, Sleep-dominant, or Comorbid archetypes.
3. CII TEMPORAL TRENDS: Circadian Interaction Index values showing the coupling between physiological stress and circadian phase.
4. RL INTERVENTION HISTORY: Effectiveness and rewards of prior interventions (CBT-I, Bright Light, Melatonin).
5. SHAP EXPLAINABILITY: Feature importance showing WHICH biomarkers (HRV, Cortisol, etc.) are driving the current predictions.

REASONING GUIDELINES:
- Always reference specific numbers from the context.
- Summarize trends (e.g., "Your CII has increased by 15% over the last 3 days").
- Use SHAP values to explain WHY a risk is high (e.g., "Reduced HRV is the primary driver of your 'High' stress classification").
- Recommend interventions based on RL history (e.g., "Melatonin at 21:00 has historically yielded a high reward score for you").
- Avoid repetition. Be clinical, empathetic, and highly analytical.
- If data is missing, state it clearly rather than hallucinating.
"""

class LLMReasoningEngine:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self._client = None
        if self.api_key and _OPENAI_AVAILABLE:
            self._client = AsyncOpenAI(api_key=self.api_key)

    @property
    def is_available(self) -> bool:
        return self._client is not None

    async def get_reasoned_response(
        self,
        message: str,
        context_data: Dict[str, Any],
        history: List[Dict[str, str]],
        page_context: str = ""
    ) -> str:
        """
        Primary entry point for GPT-based clinical reasoning.
        """
        if not self.is_available:
            return "LLM Engine Unavailable: Please check your API key."

        # Structured context injection
        formatted_context = self._format_context(context_data)
        
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "system", "content": f"### CURRENT ANALYTICS CONTEXT ###\n{formatted_context}"}
        ]
        
        # Add conversation history (sliding window)
        messages.extend(history[-10:])
        
        # Add current user message with page context
        user_content = f"[User is on page: {page_context}]\n\n{message}"
        messages.append({"role": "user", "content": user_content})

        try:
            response = await self._client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=messages,
                temperature=0.4, # Lower temperature for clinical consistency
                max_tokens=600,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM Reasoning Error: {e}")
            return f"Error in reasoning engine: {str(e)}"

    def _format_context(self, data: Dict[str, Any]) -> str:
        """
        Converts the raw context dictionary into a dense, readable string for the LLM.
        """
        ctx_blocks = []
        
        # 1. Prediction & CII Trends
        if "prediction_summary" in data:
            ctx_blocks.append(f"PREDICTIONS & TRENDS:\n{data['prediction_summary']}")
            
        # 2. Phenotype
        if "phenotype_summary" in data:
            ctx_blocks.append(f"BEHAVIORAL PHENOTYPES:\n{data['phenotype_summary']}")
            
        # 3. RL History
        if "rl_summary" in data:
            ctx_blocks.append(f"RL INTERVENTION EFFECTIVENESS:\n{data['rl_summary']}")
            
        # 4. SHAP/Explainability
        if "explainability_summary" in data:
            ctx_blocks.append(f"AI EXPLAINABILITY (SHAP):\n{data['explainability_summary']}")
            
        # 5. Datasets
        if "dataset_summary" in data:
            ctx_blocks.append(f"DATASET METADATA:\n{data['dataset_summary']}")

        return "\n\n".join(ctx_blocks)

# Singleton instance
llm_reasoning_engine = LLMReasoningEngine()
