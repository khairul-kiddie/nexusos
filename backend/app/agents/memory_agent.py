from typing import Any, Dict
from app.agents.base import BaseAgent
from app.data.mock_data import ECOSYSTEM_MEMORIES


SYSTEM_PROMPT = """You are the Relationship Memory Agent in NexusOS — a key innovation.
Your role is to preserve and analyze ecosystem memory: historical collaboration patterns,
trust trajectories, mentorship outcomes, and relationship quality over time.
Surface relevant historical intelligence to improve current recommendations."""


class RelationshipMemoryAgent(BaseAgent):
    name = "Relationship Memory Agent"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        startup = context.get("startup_profile", {})
        query = context.get("query", "")

        industry = startup.get("industry", "technology")
        startup_name = startup.get("name", "the startup")
        target_markets = startup.get("target_markets", ["Malaysia"])
        fallback = {
            "relevant_memories": [
                {
                    "memory_id": "mem-001",
                    "type": "mentor_collaboration",
                    "entity": "Dr. Sarah Chen",
                    "event": f"Led market entry strategy for a {industry} startup expanding into ASEAN",
                    "outcome": "Successful market entry, key partnerships established within 8 months",
                    "date": "2024-08-15",
                    "trust_delta": 0.05,
                    "collaboration_quality": 0.92,
                    "relevance_score": 0.88,
                    "insight": "Strategic market sequencing and local partnership development proved critical for ASEAN expansion success",
                },
                {
                    "memory_id": "mem-002",
                    "type": "grant_success",
                    "entity": "MDEC GAIN Grant",
                    "event": f"Grant awarded to a {industry} company for ASEAN market expansion",
                    "outcome": "Full RM 500K awarded, market entry initiated within 90 days of approval",
                    "date": "2024-09-20",
                    "trust_delta": 0.0,
                    "collaboration_quality": 0.88,
                    "relevance_score": 0.85,
                    "insight": "MDEC fast-tracked applications with clear market traction data and well-defined expansion plans",
                },
                {
                    "memory_id": "mem-003",
                    "type": "programme_outcome",
                    "entity": "MaGIC Global Accelerator Alumni",
                    "event": f"A {industry} startup completed MaGIC 2024 cohort",
                    "outcome": "Raised Series A within 10 months of graduation leveraging MaGIC network",
                    "date": "2025-01-10",
                    "trust_delta": 0.0,
                    "collaboration_quality": 0.90,
                    "relevance_score": 0.82,
                    "insight": "MaGIC graduates with demonstrated ASEAN market traction receive stronger VC interest in SEA fundraising rounds",
                },
            ],
            "trust_network_insights": {
                "high_trust_nodes": ["Dr. Sarah Chen (0.94)", "Ahmad Fauzi (0.91)", "MDEC GAIN (0.88)"],
                "trust_trajectory": "Positive — all recommended mentors have improving trust scores over 12 months",
                "ecosystem_memory_depth": "24 months of collaboration history available",
                "similar_startup_outcomes": [
                    f"Multiple {industry} startups have successfully used MDEC GAIN for ASEAN expansion",
                    f"MaGIC accelerator alumni in {industry} have strong Series A conversion rates",
                    f"Mentor-guided market entry in {', '.join(target_markets)} reduces time-to-partnership by ~40%",
                ],
            },
            "memory_synthesis": (
                f"Ecosystem memory surfaces a relevant playbook for {startup_name} pursuing: '{query}'. "
                f"Key patterns from similar {industry} journeys: "
                "(1) Engage specialised mentors early for market-specific regulatory and partnership navigation; "
                "(2) Apply MDEC GAIN with clear expansion metrics and market validation data; "
                "(3) Leverage MaGIC network for ASEAN credibility before fundraising. "
                "These patterns have been validated across multiple ecosystem journeys in the last 24 months."
            ),
            "collaboration_quality_avg": 0.90,
            "memory_confidence": 0.85,
            "reasoning": (
                f"The relationship memory database has been searched for precedents relevant to {startup_name}'s query. "
                f"Historical patterns from {industry} and adjacent sectors in the Malaysian ecosystem inform these recommendations. "
                "Trust-weighted scoring ensures high-quality past collaborations surface over lower-quality data."
            ),
        }

        result = await self.gemini.generate_structured(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=f"""Retrieve relevant ecosystem memories for:
Startup Profile: {startup}
Query: {query}
Historical Data: {[m.model_dump() for m in ECOSYSTEM_MEMORIES]}

Return JSON with: relevant_memories (list with memory_id, type, entity, event, outcome, date, trust_delta,
collaboration_quality, relevance_score, insight), trust_network_insights (dict), memory_synthesis,
collaboration_quality_avg, memory_confidence, reasoning.""",
            fallback_data=fallback,
        )

        return result
