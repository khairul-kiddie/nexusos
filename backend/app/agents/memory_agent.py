"""
RelationshipMemoryAgent — Ecosystem relationship intelligence for NexusOS.

Architecture:
  1. memory_retrieval.py retrieves and scores relevant memories deterministically
  2. TrustAnalyticsService computes collaboration metrics from retrieved records
  3. This agent feeds those analytics into the LLM, which synthesises insights
  4. Pydantic validates the merged output before it reaches the caller
  5. On any failure the agent returns pre-written Malaysian fallback enriched
     with live trust analytics so numeric values are always current

Security:
  - User query is stripped of XML/HTML tags and truncated (prompt injection mitigation)
  - Startup profile is whitelisted to known-safe fields only
  - LLM receives retrieved records only — never the raw memory store in bulk
  - Prompt instructs LLM not to invent entities or modify pre-computed metrics
"""

from __future__ import annotations

import json
import logging
import re
import time
from typing import Any, Dict

from pydantic import ValidationError

from app.agents.base import BaseAgent
from app.data.memory_fallback import MEMORY_FALLBACK
from app.models.memory_schemas import MemoryAgentOutput
from app.services.memory_retrieval import run_memory_analytics

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System instruction — model role, kept separate from user content
# ---------------------------------------------------------------------------

_SYSTEM_INSTRUCTION = """You are the Relationship Memory Agent in NexusOS — an AI-powered startup ecosystem operating system for Malaysia.

Your role:
- Synthesise relationship intelligence from retrieved ecosystem memory records
- Generate precise, grounded insights for each memory record (2–3 sentences each)
- Identify recurring patterns and produce a coherent memory synthesis narrative
- Surface similar startup outcome narratives derived strictly from the provided records

Important constraints:
- Reference ONLY entities, metrics, and events present in the provided memory records
- Do NOT invent mentors, startups, programmes, or agencies not shown in the data
- Preserve ALL pre-computed numeric values unchanged (trust scores, relevance scores, confidence)
- All agency/programme references must reflect Malaysian / SEA ecosystem context
- Respond ONLY with valid JSON matching the schema below — no markdown, no prose outside JSON"""

_OUTPUT_SCHEMA = """{
  "relevant_memories": [
    {
      "memory_id": "<preserve from input>",
      "type": "<preserve from input>",
      "entity": "<preserve from input>",
      "event": "<preserve from input>",
      "outcome": "<preserve from input>",
      "date": "<preserve from input>",
      "trust_delta": <preserve numeric>,
      "collaboration_quality": <preserve numeric>,
      "relevance_score": <preserve numeric>,
      "insight": "<2-3 sentences grounded strictly in this memory record and Malaysian ecosystem context>"
    }
  ],
  "trust_network_insights": {
    "high_trust_nodes": ["<preserve from pre-computed list>"],
    "trust_trajectory": "<preserve from pre-computed analytics>",
    "ecosystem_memory_depth": "<preserve from pre-computed analytics>",
    "similar_startup_outcomes": [
      "<pattern derived strictly from the provided records — max 3, no invented entities>"
    ]
  },
  "memory_synthesis": "<2-3 paragraphs synthesising patterns across ALL provided memory records>",
  "collaboration_quality_avg": <preserve numeric>,
  "memory_confidence": <preserve numeric>,
  "reasoning": "<one paragraph: what was retrieved, why it ranked this way, key trust patterns>"
}"""


# ---------------------------------------------------------------------------
# Input sanitization
# ---------------------------------------------------------------------------

def _sanitize_query(query: str) -> str:
    """Strip XML/HTML tags and truncate — prevents prompt delimiter injection."""
    return re.sub(r"<[^>]{0,100}>", "", query)[:500].strip()


_SAFE_STARTUP_FIELDS = frozenset({
    "name", "industry", "stage", "target_markets",
    "description", "founded_year", "tech_stack",
})


def _sanitize_startup(startup: Any) -> dict:
    """Whitelist known-safe fields and cap string lengths to contain prompt size."""
    raw: dict = startup.model_dump() if hasattr(startup, "model_dump") else (startup or {})
    sanitized = {k: v for k, v in raw.items() if k in _SAFE_STARTUP_FIELDS}
    for k, v in sanitized.items():
        if isinstance(v, str):
            sanitized[k] = v[:200]
    return sanitized


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------

def _build_prompt(query: str, startup: dict, analytics: dict) -> str:
    n_retrieved = len(analytics["retrieved_records"])
    return f"""Synthesise relationship memory intelligence from the following pre-computed analytics.

## Retrieved Memory Records ({n_retrieved} of {analytics["total_memories"]} total)
```json
{json.dumps(analytics["retrieved_records"], indent=2)}
```

## Pre-Computed Trust Analytics (preserve all values unchanged)
- collaboration_quality_avg: {analytics["collaboration_quality_avg"]}
- memory_confidence: {analytics["memory_confidence"]}
- high_trust_nodes: {analytics["high_trust_nodes"]}
- trust_trajectory: {analytics["trust_trajectory"]}
- ecosystem_memory_depth: {analytics["ecosystem_memory_depth"]}

## Startup Context
```json
{json.dumps(startup, indent=2)}
```

## User Query
<user_context>
{query}
</user_context>

## Instructions
1. For each record in `retrieved_records`: write a 2-3 sentence `insight` grounded in that
   record's entity, event, outcome, and Malaysian ecosystem context
2. Populate `similar_startup_outcomes` with 2-3 patterns derived from the records only
3. Write `memory_synthesis` (2-3 paragraphs) synthesising patterns across ALL records
4. Write `reasoning` (1 paragraph) explaining what was retrieved and how it was ranked
5. Preserve ALL pre-computed numeric values exactly — do NOT modify any score or metric
6. Do NOT reference entities, programmes, or outcomes not present in the provided records

## Required Output Schema
{_OUTPUT_SCHEMA}"""


# ---------------------------------------------------------------------------
# Output merging and validation
# ---------------------------------------------------------------------------

def _merge_with_analytics(llm_output: dict, analytics: dict) -> dict:
    """
    Keep LLM-generated narrative fields; restore all numeric/computed fields from
    deterministic analytics. This prevents the LLM from drifting trust scores away
    from their computed values even when it follows instructions imperfectly.
    """
    computed_by_id = {r["memory_id"]: r for r in analytics["retrieved_records"]}

    merged_memories = []
    for mem in llm_output.get("relevant_memories", []):
        mid = mem.get("memory_id", "")
        if mid in computed_by_id:
            src = computed_by_id[mid]
            mem["relevance_score"]       = src["relevance_score"]
            mem["trust_delta"]           = src["trust_delta"]
            mem["collaboration_quality"] = src["collaboration_quality"]
        merged_memories.append(mem)

    trust_insights = llm_output.get("trust_network_insights", {})
    # Always restore deterministic fields regardless of what LLM produced
    trust_insights["high_trust_nodes"]       = analytics["high_trust_nodes"]
    trust_insights["trust_trajectory"]       = analytics["trust_trajectory"]
    trust_insights["ecosystem_memory_depth"] = analytics["ecosystem_memory_depth"]

    return {
        "relevant_memories":         merged_memories,
        "trust_network_insights":    trust_insights,
        "memory_synthesis":          llm_output.get("memory_synthesis", ""),
        "collaboration_quality_avg": analytics["collaboration_quality_avg"],
        "memory_confidence":         analytics["memory_confidence"],
        "reasoning":                 llm_output.get("reasoning", ""),
    }


def _validate(raw: dict) -> MemoryAgentOutput | None:
    try:
        return MemoryAgentOutput.model_validate(raw)
    except ValidationError as exc:
        logger.warning("Memory agent output failed schema validation: %s", exc)
        return None


def _apply_live_analytics(fallback: dict, analytics: dict) -> dict:
    """Inject live analytics into the pre-written fallback so numeric fields are current."""
    return {
        **fallback,
        "collaboration_quality_avg": analytics["collaboration_quality_avg"],
        "memory_confidence":         analytics["memory_confidence"],
        "trust_network_insights": {
            **fallback.get("trust_network_insights", {}),
            "high_trust_nodes":       analytics["high_trust_nodes"],
            "trust_trajectory":       analytics["trust_trajectory"],
            "ecosystem_memory_depth": analytics["ecosystem_memory_depth"],
        },
    }


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------

class RelationshipMemoryAgent(BaseAgent):
    name = "Relationship Memory Agent"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query   = context.get("query", "")
        startup = context.get("startup_profile", {})

        sanitized_query   = _sanitize_query(query)
        sanitized_startup = _sanitize_startup(startup)

        industry       = sanitized_startup.get("industry", "technology")
        target_markets = sanitized_startup.get("target_markets") or ["Malaysia"]
        if not isinstance(target_markets, list):
            target_markets = [str(target_markets)]

        # --- Phase 1: deterministic retrieval + trust analytics ---
        t0 = time.monotonic()
        analytics = run_memory_analytics(industry, target_markets)
        logger.debug(
            "Memory retrieval completed in %.0f ms — %d records retrieved",
            (time.monotonic() - t0) * 1000,
            len(analytics["retrieved_records"]),
        )

        # --- Phase 2: LLM synthesizes insights from retrieved records only ---
        prompt = _build_prompt(sanitized_query, sanitized_startup, analytics)

        raw_llm = await self.gemini.generate_structured(
            system_prompt="",               # overridden by system_instruction
            user_prompt=prompt,
            fallback_data={},               # we own the fallback logic below
            system_instruction=_SYSTEM_INSTRUCTION,
        )

        # --- Phase 3: merge, validate, return ---
        if raw_llm:
            merged    = _merge_with_analytics(raw_llm, analytics)
            validated = _validate(merged)
            if validated:
                logger.info(
                    "RelationshipMemoryAgent completed via LLM "
                    "(memories=%d confidence=%.2f collab_avg=%.2f)",
                    len(validated.relevant_memories),
                    validated.memory_confidence,
                    validated.collaboration_quality_avg,
                )
                return validated.model_dump(mode="json")
            logger.warning("LLM output failed Pydantic validation — using fallback")
        else:
            logger.warning("LLM returned empty output — using fallback")

        # --- Fallback: pre-written narrative + live analytics ---
        return _apply_live_analytics(MEMORY_FALLBACK, analytics)
