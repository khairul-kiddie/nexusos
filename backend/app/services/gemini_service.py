import asyncio
import json
import logging
import os
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai not installed; Gemini calls will use fallback data")


class GeminiService:
    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-pro-preview-06-05")
        self._base_model = None

        if self.api_key and GEMINI_AVAILABLE:
            genai.configure(api_key=self.api_key)
            self._base_model = genai.GenerativeModel(self.model_name)
            logger.info("GeminiService initialised with model=%s", self.model_name)
        else:
            logger.warning(
                "GeminiService running in fallback mode "
                "(GEMINI_API_KEY missing or google-generativeai not installed)"
            )

    @property
    def is_available(self) -> bool:
        return self._base_model is not None

    def _get_model(self, system_instruction: Optional[str]) -> Any:
        """Return a model instance with the given system instruction, or the base model."""
        if not system_instruction:
            return self._base_model
        # GenerativeModel is a lightweight Python object — no network call here
        return genai.GenerativeModel(
            self.model_name,
            system_instruction=system_instruction,
        )

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback_data: Dict[str, Any],
        system_instruction: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a structured JSON response from Gemini.

        When `system_instruction` is provided it is set at the model level via the
        native Gemini API — keeping role context isolated from user content.
        When omitted, `system_prompt` is prepended to the prompt (legacy behaviour,
        preserving compatibility with existing agents).
        """
        if not self.is_available:
            await asyncio.sleep(0.5)
            return fallback_data

        try:
            if system_instruction:
                model = self._get_model(system_instruction)
                full_prompt = (
                    f"{user_prompt}\n\n"
                    "IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, "
                    "no text outside the JSON object."
                )
            else:
                model = self._base_model
                full_prompt = (
                    f"{system_prompt}\n\n{user_prompt}\n\n"
                    "IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, "
                    "no explanation outside the JSON."
                )

            response = await asyncio.to_thread(
                model.generate_content,
                full_prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    response_mime_type="application/json",
                ),
            )

            text = response.text.strip()
            # Strip accidental markdown fences (defensive; response_mime_type should prevent this)
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]

            parsed = json.loads(text)
            logger.debug("Gemini structured response received (%d chars)", len(text))
            return parsed

        except json.JSONDecodeError as exc:
            logger.error("Gemini returned non-JSON output: %s", exc)
            return fallback_data
        except Exception as exc:
            logger.error("Gemini API error in generate_structured: %s", exc)
            return fallback_data

    async def generate_reasoning(
        self,
        prompt: str,
        fallback_reasoning: str,
        system_instruction: Optional[str] = None,
    ) -> str:
        if not self.is_available:
            await asyncio.sleep(0.3)
            return fallback_reasoning

        try:
            model = self._get_model(system_instruction)
            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config=genai.GenerationConfig(temperature=0.4),
            )
            text = response.text.strip()
            logger.debug("Gemini reasoning response received (%d chars)", len(text))
            return text
        except Exception as exc:
            logger.error("Gemini API error in generate_reasoning: %s", exc)
            return fallback_reasoning


gemini_service = GeminiService()
