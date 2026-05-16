import os
import json
import asyncio
from typing import Any, Dict, Optional
from datetime import datetime

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-pro-preview-06-05")
        self.model = None

        if self.api_key and GEMINI_AVAILABLE:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)

    @property
    def is_available(self) -> bool:
        return self.model is not None

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        if not self.is_available:
            await asyncio.sleep(0.5)
            return fallback_data

        try:
            full_prompt = f"""{system_prompt}

{user_prompt}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation outside the JSON."""

            response = await asyncio.to_thread(
                self.model.generate_content,
                full_prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    response_mime_type="application/json",
                )
            )

            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)

        except Exception as e:
            print(f"Gemini error: {e}, using fallback")
            return fallback_data

    async def generate_reasoning(
        self,
        prompt: str,
        fallback_reasoning: str,
    ) -> str:
        if not self.is_available:
            await asyncio.sleep(0.3)
            return fallback_reasoning

        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt,
                generation_config=genai.GenerationConfig(temperature=0.4)
            )
            return response.text.strip()
        except Exception:
            return fallback_reasoning


gemini_service = GeminiService()
