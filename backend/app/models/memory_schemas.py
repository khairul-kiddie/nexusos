"""
Pydantic output contract for the RelationshipMemoryAgent.

These models validate every LLM response before it reaches the caller.
The field constraints mirror the existing frontend JSON contract exactly —
no downstream changes needed when the agent returns validated output.
"""

from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class MemoryRecord(BaseModel):
    """A single enriched memory record returned to the caller."""

    memory_id: str
    type: str                                    # e.g. "mentor_collaboration", "grant_success"
    entity: str                                  # resolved entity name
    event: str                                   # human-readable event description
    outcome: str
    date: str                                    # ISO date string (YYYY-MM-DD)
    trust_delta: float = Field(ge=-1.0, le=1.0)
    collaboration_quality: float = Field(ge=0.0, le=1.0)
    relevance_score: float = Field(ge=0.0, le=1.0)
    insight: str                                 # LLM-generated, grounded in the record


class TrustNetworkInsights(BaseModel):
    """Ecosystem trust network summary for the query context."""

    high_trust_nodes: List[str]                  # deterministically computed
    trust_trajectory: str                        # deterministically computed
    ecosystem_memory_depth: str                  # deterministically computed
    similar_startup_outcomes: List[str]          # LLM-generated from retrieved records


class MemoryAgentOutput(BaseModel):
    """Full output contract for the RelationshipMemoryAgent.

    Numeric fields (collaboration_quality_avg, memory_confidence) are always
    populated from deterministic analytics — never from LLM invention.
    """

    relevant_memories: List[MemoryRecord]
    trust_network_insights: TrustNetworkInsights
    memory_synthesis: str                        # LLM-generated
    collaboration_quality_avg: float = Field(ge=0.0, le=1.0)
    memory_confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str                               # LLM-generated
