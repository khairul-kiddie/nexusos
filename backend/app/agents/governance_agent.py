"""
GovernanceAgent — Ecosystem intelligence for NexusOS operators.

Architecture:
  1. governance_analytics.py computes deterministic metrics from ecosystem data
  2. This agent feeds those metrics into the LLM, which produces narrative intelligence
  3. Pydantic validates the merged output before it reaches the caller
  4. On any failure the agent returns pre-written fallback data enriched with live metrics
"""

from __future__ import annotations

import json
import logging
import re
import time
from typing import Any, Dict

from pydantic import ValidationError

from app.agents.base import BaseAgent
from app.data.governance_fallback import GOVERNANCE_FALLBACK
from app.models.governance_schemas import GovernanceOutput
from app.services.governance_analytics import run_governance_analytics

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Prompt constants  (kept here so the agent is self-contained and auditable)
# ---------------------------------------------------------------------------

_SYSTEM_INSTRUCTION = """You are the Governance Intelligence Agent in NexusOS — an AI-powered startup ecosystem operating system for Malaysia.

Your role:
- Interpret pre-computed ecosystem metrics and detected issues
- Generate structured governance alerts with precise, data-grounded descriptions
- Produce actionable recommendations tailored to Malaysian ecosystem operators
- Write a coherent governance narrative synthesising all signals

Important constraints:
- Only reference data present in the provided metrics — do not invent statistics
- All agency, programme, and market references must reflect Malaysian / SEA context
  (MDEC, MaGIC, Cradle, MTDC, PUNB, Khazanah, MDA, NPRA, MOSTI, etc.)
- Respond ONLY with valid JSON matching the schema below — no markdown, no prose outside JSON"""

_OUTPUT_SCHEMA = """{
  "governance_alerts": [
    {
      "alert_id": "alert-001",
      "type": "<mentor_overload|sector_gap|geographic_imbalance|funding_bottleneck>",
      "severity": "<high|medium|low>",
      "title": "<concise alert title, max 80 chars>",
      "description": "<2-3 sentences grounded strictly in the provided metrics>",
      "affected_entities": ["<entity name>"],
      "recommendation": "<specific, actionable recommendation for ecosystem operators>",
      "impact_score": <0.0 to 1.0>
    }
  ],
  "ecosystem_bottlenecks": [
    "<bottleneck statement — specific, narrative, Malaysian-ecosystem context>"
  ],
  "recommendations_for_operators": [
    "<operator recommendation — specific and actionable>"
  ],
  "reasoning": "<one paragraph synthesising ecosystem health narrative from the provided metrics>"
}"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _sanitize_query(query: str) -> str:
    """Strip XML/HTML tags and truncate to prevent prompt delimiter injection."""
    sanitized = re.sub(r"<[^>]{0,100}>", "", query)
    return sanitized[:500].strip()


def _build_prompt(sanitized_query: str, metrics: dict) -> str:
    return f"""Interpret the following pre-computed Malaysian startup ecosystem metrics and produce governance intelligence.

## Computed Ecosystem Metrics
```json
{json.dumps(metrics, indent=2)}
```

## User Context
<user_context>
{sanitized_query}
</user_context>

## Instructions
For each item in `detected_issues`:
- Create one `governance_alerts` entry with a title, 2-3 sentence description, and specific recommendation
- Set `impact_score` equal to the issue's `impact_score` from the metrics above

Then generate:
- `ecosystem_bottlenecks`: 3 narrative bottleneck statements grounded in the metrics
- `recommendations_for_operators`: 5 specific, actionable recommendations
- `reasoning`: one paragraph synthesising the overall ecosystem health narrative

## Required Output Schema
{_OUTPUT_SCHEMA}"""


def _inject_alert_ids(alerts: list) -> list:
    """Ensure every alert has an alert_id; generate sequential IDs for any missing."""
    for i, alert in enumerate(alerts):
        if not alert.get("alert_id"):
            alert["alert_id"] = f"alert-{i + 1:03d}"
    return alerts


def _merge_with_metrics(llm_output: dict, metrics: dict) -> dict:
    """Replace deterministic fields with analytics values; keep LLM narrative fields."""
    alerts = _inject_alert_ids(llm_output.get("governance_alerts", []))
    return {
        "ecosystem_health_score": metrics["health_score"],
        "health_breakdown":       metrics["health_breakdown"],
        "governance_alerts":      alerts,
        "ecosystem_bottlenecks":  llm_output.get("ecosystem_bottlenecks", []),
        "sector_coverage":        metrics["sector_coverage"],
        "monthly_trends":         metrics["monthly_trends"],
        "recommendations_for_operators": llm_output.get("recommendations_for_operators", []),
        "reasoning":              llm_output.get("reasoning", ""),
    }


def _validate(raw: dict) -> GovernanceOutput | None:
    try:
        return GovernanceOutput.model_validate(raw)
    except ValidationError as exc:
        logger.warning("Governance output failed schema validation: %s", exc)
        return None


def _apply_live_metrics(fallback: dict, metrics: dict) -> dict:
    """Inject live analytics values into the fallback so numeric data is always current."""
    return {
        **fallback,
        "ecosystem_health_score": metrics["health_score"],
        "health_breakdown":       metrics["health_breakdown"],
        "sector_coverage":        metrics["sector_coverage"],
        "monthly_trends":         metrics["monthly_trends"],
    }


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------

class GovernanceAgent(BaseAgent):
    name = "Governance Agent"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query = context.get("query", "")
        sanitized_query = _sanitize_query(query)

        # --- Phase 1: deterministic analytics (always runs) ---
        t0 = time.monotonic()
        metrics = run_governance_analytics()
        logger.debug("Analytics completed in %.0f ms", (time.monotonic() - t0) * 1000)

        # --- Phase 2: LLM interprets the metrics ---
        prompt = _build_prompt(sanitized_query, metrics)

        raw_llm = await self.gemini.generate_structured(
            system_prompt="",           # overridden by system_instruction
            user_prompt=prompt,
            fallback_data={},           # we own the fallback logic below
            system_instruction=_SYSTEM_INSTRUCTION,
        )

        # --- Phase 3: merge, validate, return ---
        if raw_llm:
            merged = _merge_with_metrics(raw_llm, metrics)
            validated = _validate(merged)
            if validated:
                logger.info(
                    "GovernanceAgent completed via LLM (score=%.1f alerts=%d)",
                    validated.ecosystem_health_score,
                    len(validated.governance_alerts),
                )
                # mode='json' ensures enums are serialised as their string values
                return validated.model_dump(mode="json")
            logger.warning("LLM output failed Pydantic validation — using fallback")
        else:
            logger.warning("LLM returned empty output — using fallback")

        # --- Fallback: pre-written narrative + live metrics ---
        return _apply_live_metrics(GOVERNANCE_FALLBACK, metrics)
