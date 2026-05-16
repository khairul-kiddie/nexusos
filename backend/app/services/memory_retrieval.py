"""
Memory retrieval and trust analytics for the RelationshipMemoryAgent.

Architecture:
  - MemoryRetriever   — scores and ranks memories by relevance to a query context
  - TrustAnalyticsService — derives deterministic trust metrics from retrieved records
  - run_memory_analytics() — public entry point called by the agent

Production evolution path (each step is independently deployable):
  Step 1  Embed memory records at ingestion with text-embedding-ada-002 or Gemini embeddings.
  Step 2  Store embeddings + metadata in pgvector, Pinecone, or Weaviate.
  Step 3  Replace MemoryRetriever.retrieve() with ANN search (HNSW / IVF) — sub-ms at scale.
  Step 4  Add per-tenant access control via metadata filters (isolate ecosystem operators).
  Step 5  Integrate Neo4j RelationshipGraph: graph-traversal queries to find memories involving
          entities N hops from the querying startup in the relationship graph.
  Step 6  Add hybrid retrieval: BM25 keyword search + dense vector re-ranking.
  Step 7  Add trust-decay curves per entity using full event history (not just top-K records).
"""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.data.mock_data import DEMO_MENTORS, DEMO_PROGRAMMES, ECOSYSTEM_MEMORIES
from app.models.schemas import EcosystemMemory

logger = logging.getLogger(__name__)

_TOP_K_MEMORIES = 5

# ---------------------------------------------------------------------------
# Event type → frontend output-contract type
# ---------------------------------------------------------------------------

_EVENT_TYPE_MAP: Dict[str, str] = {
    "mentorship_session":   "mentor_collaboration",
    "grant_application":    "grant_success",
    "grant_disbursement":   "grant_success",
    "regulatory_navigation":"regulatory_success",
    "programme_completion": "programme_outcome",
    "market_entry":         "market_intelligence",
    "investor_introduction":"fundraising",
    "partnership":          "partnership",
}

# ---------------------------------------------------------------------------
# Industry keyword clusters — enables fuzzy match across synonyms
# e.g. "AI Healthcare" and "HealthTech" both resolve to cluster "health"
# TODO: Replace with embedding cosine similarity for semantic matching
# ---------------------------------------------------------------------------

_INDUSTRY_CLUSTERS: Dict[str, List[str]] = {
    "health":     ["health", "medical", "clinical", "pharma", "bio", "medtech", "diagnostic"],
    "fintech":    ["fintech", "finance", "banking", "payment", "insurance", "wealth"],
    "edtech":     ["edtech", "education", "learning", "training"],
    "agritech":   ["agritech", "agriculture", "farming", "crop", "precision"],
    "cleantech":  ["cleantech", "energy", "renewable", "solar", "sustainability", "climate"],
    "logistics":  ["logistics", "supply chain", "delivery", "transport", "freight"],
    "ai":         ["ai", "ml", "machine learning", "deep learning", "nlp", "computer vision"],
    "saas":       ["saas", "software", "platform", "b2b", "enterprise"],
    "proptech":   ["proptech", "property", "real estate", "construction"],
}

# Broad-eligibility markers in programme sector lists
_BROAD_ELIGIBILITY = {"all sectors", "all tech sectors", "global", "all industries"}


# ---------------------------------------------------------------------------
# Entity resolution — maps entity_id to a display name and industry list
# TODO: In production, this becomes a DB lookup or graph query
# ---------------------------------------------------------------------------

def _build_entity_map() -> Dict[str, dict]:
    entity_map: Dict[str, dict] = {}
    for m in DEMO_MENTORS:
        entity_map[m.id] = {
            "name": m.name,
            "type": "mentor",
            "industries": m.industries,
            "markets": m.markets,
        }
    for p in DEMO_PROGRAMMES:
        entity_map[p.id] = {
            "name": p.name,
            "type": "programme",
            "industries": p.eligible_industries,
            "markets": p.eligible_markets,
        }
    return entity_map


# Computed once at module load — acts as the mock entity store
_ENTITY_MAP: Dict[str, dict] = _build_entity_map()


# ---------------------------------------------------------------------------
# Scoring functions (all deterministic — no LLM involvement)
# ---------------------------------------------------------------------------

def _get_industry_cluster(industry_lower: str) -> Optional[str]:
    """Map an industry string to its canonical cluster name."""
    for cluster_name, keywords in _INDUSTRY_CLUSTERS.items():
        if any(kw in industry_lower for kw in keywords):
            return cluster_name
    return None


def _industry_match_score(memory: EcosystemMemory, industry: str) -> float:
    """
    Return 0.0–1.0 relevance of this memory to the given industry.
    Uses substring matching first, then cluster-based fuzzy matching.
    TODO: Replace with embedding cosine similarity for richer semantic coverage.
    """
    entity_data = _ENTITY_MAP.get(memory.entity_id, {})
    entity_industries: List[str] = entity_data.get("industries", [])

    if not entity_industries:
        # Entity not in map (e.g. an anonymised peer startup)
        return 0.4 if memory.entity_type == "startup" else 0.2

    industry_lower = industry.lower()

    for ei in entity_industries:
        ei_lower = ei.lower()
        # Broad eligibility — programmes open to all sectors
        if ei_lower in _BROAD_ELIGIBILITY:
            return 0.65
        # Direct substring overlap either direction
        if industry_lower in ei_lower or ei_lower in industry_lower:
            return 1.0

    # Cluster-based fuzzy match — catches synonyms across different naming conventions
    query_cluster = _get_industry_cluster(industry_lower)
    if query_cluster:
        for ei in entity_industries:
            ei_cluster = _get_industry_cluster(ei.lower())
            if ei_cluster and ei_cluster == query_cluster:
                return 0.75

    # Startup memories carry generic playbook value even without exact industry match
    if memory.entity_type == "startup":
        return 0.45

    return 0.15


def _market_match_score(memory: EcosystemMemory, target_markets: List[str]) -> float:
    """
    Return 0.0–1.0 indicating how well the memory entity's markets overlap with
    the startup's target markets.
    TODO: Extend with geographic proximity scoring (e.g. ASEAN sub-regional groupings).
    """
    entity_data = _ENTITY_MAP.get(memory.entity_id, {})
    entity_markets: List[str] = entity_data.get("markets", [])

    if not entity_markets or not target_markets:
        return 0.5  # neutral when data is absent

    target_lower = {m.lower() for m in target_markets}
    sea_terms = {"sea", "asean", "southeast asia", "global"}

    for em in entity_markets:
        em_lower = em.lower()
        if em_lower in target_lower:
            return 1.0
        if em_lower in sea_terms:
            return 0.7

    return 0.2


def _recency_weight(timestamp_str: str, decay_rate: float = 0.5) -> float:
    """
    Exponential decay: weight = exp(-decay_rate × years_elapsed).
    At decay_rate=0.5: ~78% after 6 months, ~61% after 1 year, ~37% after 2 years.
    Older memories are still surfaced but ranked lower than recent ones.
    TODO: Tune decay_rate per event type — relationship events decay slower than market data.
    """
    try:
        ts = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        years_elapsed = (datetime.now(timezone.utc) - ts).days / 365.25
        return round(math.exp(-decay_rate * years_elapsed), 3)
    except (ValueError, TypeError, AttributeError):
        return 0.5


def _compute_relevance_score(
    memory: EcosystemMemory,
    industry: str,
    target_markets: List[str],
) -> float:
    """
    Composite relevance score (weighted sum, clamped to [0, 1]):
      30% industry match  |  15% market overlap  |  30% recency  |
      15% collaboration quality  |  10% trust delta magnitude
    """
    industry_score   = _industry_match_score(memory, industry)
    market_score     = _market_match_score(memory, target_markets)
    recency          = _recency_weight(memory.timestamp)
    quality          = memory.collaboration_quality
    trust_contrib    = min(1.0, abs(memory.trust_delta) * 5)   # normalize 0–0.2 → 0–1

    score = (
        0.30 * industry_score
        + 0.15 * market_score
        + 0.30 * recency
        + 0.15 * quality
        + 0.10 * trust_contrib
    )
    return round(min(1.0, max(0.0, score)), 3)


# ---------------------------------------------------------------------------
# Internal result type
# ---------------------------------------------------------------------------

@dataclass
class ScoredMemory:
    memory: EcosystemMemory
    entity_data: dict = field(default_factory=dict)
    relevance_score: float = 0.0


# ---------------------------------------------------------------------------
# MemoryRetriever
# ---------------------------------------------------------------------------

class MemoryRetriever:
    """
    Retrieves the most relevant memories for a given query context.

    Current implementation uses score-based ranking over an in-memory store.
    The interface is deliberately thin so the implementation can be swapped out
    without touching the agent or analytics layers.

    TODO: Replace retrieve() with vector similarity search when the memory store
          grows beyond a few hundred records. See module docstring for migration path.
    """

    def __init__(self, top_k: int = _TOP_K_MEMORIES) -> None:
        self._top_k = top_k

    def retrieve(
        self,
        industry: str,
        target_markets: List[str],
        memories: Optional[List[EcosystemMemory]] = None,
    ) -> List[ScoredMemory]:
        """
        Score and rank memories by relevance. Returns at most top_k records,
        sorted by descending composite relevance score.

        The `memories` parameter allows test injection of a custom store;
        in production it defaults to the live ECOSYSTEM_MEMORIES collection.
        """
        source = memories or ECOSYSTEM_MEMORIES
        if not source:
            logger.warning("Memory store is empty — no records to retrieve")
            return []

        scored = [
            ScoredMemory(
                memory=mem,
                entity_data=_ENTITY_MAP.get(mem.entity_id, {}),
                relevance_score=_compute_relevance_score(mem, industry, target_markets),
            )
            for mem in source
        ]
        scored.sort(key=lambda s: s.relevance_score, reverse=True)
        top = scored[: self._top_k]

        logger.debug(
            "MemoryRetriever: scored=%d returning=%d best=%.3f worst=%.3f",
            len(scored),
            len(top),
            top[0].relevance_score if top else 0.0,
            top[-1].relevance_score if top else 0.0,
        )
        return top


# ---------------------------------------------------------------------------
# Record enrichment — converts ScoredMemory → output contract dict
# ---------------------------------------------------------------------------

def _resolve_entity_name(entity_id: str, entity_data: dict, entity_type: str) -> str:
    """Return a display-friendly entity name, falling back to a cleaned entity_id."""
    if entity_data.get("name"):
        return entity_data["name"]
    if entity_type == "startup":
        return "Peer Ecosystem Startup"
    return entity_id.replace("-", " ").replace("_", " ").title()


def _format_outcome(outcome: str) -> str:
    return outcome.replace("_", " ").replace("-", " ").title()


def _build_event_description(memory: EcosystemMemory, entity_name: str) -> str:
    outcome_str = _format_outcome(memory.outcome)
    templates: Dict[str, str] = {
        "mentorship_session":    f"{entity_name} completed a mentorship session — outcome: {outcome_str}",
        "grant_application":     f"Grant application via {entity_name} — outcome: {outcome_str}",
        "grant_disbursement":    f"{entity_name} grant disbursed — outcome: {outcome_str}",
        "regulatory_navigation": f"{entity_name} provided regulatory guidance — outcome: {outcome_str}",
        "programme_completion":  f"Programme cohort completed via {entity_name} — outcome: {outcome_str}",
        "market_entry":          f"{entity_name} supported market entry — outcome: {outcome_str}",
        "investor_introduction": f"{entity_name} facilitated investor introduction — outcome: {outcome_str}",
    }
    template = templates.get(memory.event_type)
    return template or f"{entity_name} — {memory.event_type.replace('_', ' ').title()}: {outcome_str}"


def _enrich_record(sm: ScoredMemory) -> dict:
    """Produce the output-contract dict for a single ScoredMemory."""
    entity_name = _resolve_entity_name(
        sm.memory.entity_id, sm.entity_data, sm.memory.entity_type
    )
    return {
        "memory_id":             sm.memory.memory_id,
        "type":                  _EVENT_TYPE_MAP.get(sm.memory.event_type, sm.memory.event_type),
        "entity":                entity_name,
        "event":                 _build_event_description(sm.memory, entity_name),
        "outcome":               _format_outcome(sm.memory.outcome),
        "date":                  sm.memory.timestamp[:10] if sm.memory.timestamp else "",
        "trust_delta":           sm.memory.trust_delta,
        "collaboration_quality": sm.memory.collaboration_quality,
        "relevance_score":       sm.relevance_score,
        "insight":               "",  # populated by LLM synthesis step
    }


# ---------------------------------------------------------------------------
# TrustAnalyticsService
# ---------------------------------------------------------------------------

@dataclass
class _TrustAnalytics:
    collaboration_quality_avg: float
    memory_confidence: float
    high_trust_nodes: List[str]
    trust_trajectory: str
    ecosystem_memory_depth: str


class TrustAnalyticsService:
    """
    Computes deterministic trust and collaboration metrics from retrieved records.

    All numeric values here are injected into the LLM prompt as ground truth.
    The LLM synthesizes narratives from them — it never generates the numbers.

    TODO (Production evolution):
      - Add per-entity trust decay curves using full event history
      - Detect sudden trust drops (breach-of-trust anomaly detection)
      - Weight trust scores by relationship graph centrality (Neo4j)
      - Support configurable decay models per relationship type
    """

    @staticmethod
    def compute(scored_memories: List[ScoredMemory]) -> _TrustAnalytics:
        if not scored_memories:
            return _TrustAnalytics(
                collaboration_quality_avg=0.5,
                memory_confidence=0.30,
                high_trust_nodes=[],
                trust_trajectory="Insufficient data for trend analysis",
                ecosystem_memory_depth="No collaboration history available",
            )

        qualities    = [sm.memory.collaboration_quality for sm in scored_memories]
        collab_avg   = round(sum(qualities) / len(qualities), 3)
        avg_relevance = round(sum(sm.relevance_score for sm in scored_memories) / len(scored_memories), 3)

        # Confidence: how much of the desired top-K we filled, weighted by quality + relevance
        count_score = min(1.0, len(scored_memories) / _TOP_K_MEMORIES)
        confidence  = round(0.40 * count_score + 0.30 * collab_avg + 0.30 * avg_relevance, 3)

        # High-trust nodes: entities whose retrieved record has collaboration_quality ≥ 0.85
        high_trust: List[str] = []
        for sm in sorted(scored_memories, key=lambda x: x.memory.collaboration_quality, reverse=True):
            if sm.memory.collaboration_quality < 0.85:
                break
            name  = _resolve_entity_name(sm.memory.entity_id, sm.entity_data, sm.memory.entity_type)
            label = f"{name} ({sm.memory.collaboration_quality:.2f})"
            if sm.memory.trust_delta > 0:
                label += f" +{sm.memory.trust_delta:.2f} trust"
            high_trust.append(label)

        # Trust trajectory: compare earliest vs latest collaboration quality
        sorted_by_time = sorted(scored_memories, key=lambda x: x.memory.timestamp or "")
        if len(sorted_by_time) >= 2:
            mid        = max(1, len(sorted_by_time) // 2)
            early_avg  = sum(sm.memory.collaboration_quality for sm in sorted_by_time[:mid]) / mid
            late_count = len(sorted_by_time) - mid
            late_avg   = sum(sm.memory.collaboration_quality for sm in sorted_by_time[mid:]) / late_count
            delta      = late_avg - early_avg
            if delta >= 0.05:
                trajectory = f"Positive — collaboration quality improving (Δ+{delta:.2f} across retrieved records)"
            elif delta <= -0.05:
                trajectory = f"Declining — quality degrading (Δ{delta:.2f}), review recommended"
            else:
                trajectory = f"Stable — consistent collaboration quality (avg {collab_avg:.2f})"
        else:
            trajectory = f"Stable — single record available (quality: {qualities[0]:.2f})"

        # Ecosystem memory depth from timestamp range of retrieved records
        depth_str = "Recent collaboration history available"
        timestamps = [sm.memory.timestamp for sm in scored_memories if sm.memory.timestamp]
        if len(timestamps) >= 2:
            try:
                dates = sorted(
                    datetime.fromisoformat(t.replace("Z", "+00:00")) for t in timestamps
                )
                months = max(1, (dates[-1] - dates[0]).days // 30)
                depth_str = f"{months} months of collaboration history available"
            except ValueError:
                pass

        return _TrustAnalytics(
            collaboration_quality_avg=collab_avg,
            memory_confidence=confidence,
            high_trust_nodes=high_trust,
            trust_trajectory=trajectory,
            ecosystem_memory_depth=depth_str,
        )


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def run_memory_analytics(industry: str, target_markets: List[str]) -> dict:
    """
    Orchestrate retrieval and analytics, returning a structured dict.
    The agent feeds this into the LLM prompt and merges it into the final output.

    Returned keys:
      retrieved_records        — enriched memory dicts ready for the prompt
      collaboration_quality_avg — deterministic average across retrieved records
      memory_confidence        — retrieval quality signal (0–1)
      high_trust_nodes         — list of entity labels with high quality scores
      trust_trajectory         — trend description from temporal analysis
      ecosystem_memory_depth   — human-readable date range of retrieved records
      total_memories           — total records in the memory store (for diagnostics)
    """
    retriever = MemoryRetriever(top_k=_TOP_K_MEMORIES)
    scored    = retriever.retrieve(industry=industry, target_markets=target_markets)
    analytics = TrustAnalyticsService.compute(scored)
    enriched  = [_enrich_record(sm) for sm in scored]

    logger.info(
        "Memory analytics complete — retrieved=%d total=%d collab_avg=%.2f confidence=%.2f",
        len(scored),
        len(ECOSYSTEM_MEMORIES),
        analytics.collaboration_quality_avg,
        analytics.memory_confidence,
    )

    return {
        "retrieved_records":        enriched,
        "collaboration_quality_avg": analytics.collaboration_quality_avg,
        "memory_confidence":         analytics.memory_confidence,
        "high_trust_nodes":          analytics.high_trust_nodes,
        "trust_trajectory":          analytics.trust_trajectory,
        "ecosystem_memory_depth":    analytics.ecosystem_memory_depth,
        "total_memories":            len(ECOSYSTEM_MEMORIES),
    }
