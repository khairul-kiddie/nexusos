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

        # fallback = {
        #     "relevant_memories": [
        #         {
        #             "memory_id": "mem-001",
        #             "type": "mentor_collaboration",
        #             "entity": "Dr. Sarah Chen",
        #             "event": "Led market entry strategy for DiagnostiQ (similar AI diagnostic startup)",
        #             "outcome": "Successful Malaysia-to-Indonesia expansion, 6 hospital partnerships signed",
        #             "date": "2024-08-15",
        #             "trust_delta": +0.05,
        #             "collaboration_quality": 0.92,
        #             "relevance_score": 0.94,
        #             "insight": "Dr. Chen's methodology for hospital partnership sequencing (start with private, then public) proved highly effective in the Indonesian market",
        #         },
        #         {
        #             "memory_id": "mem-003",
        #             "type": "regulatory_navigation",
        #             "entity": "Ahmad Fauzi",
        #             "event": "BPOM Class II approval facilitation for MedScan AI",
        #             "outcome": "Approval obtained in 11 months (vs. typical 18 months) — 39% faster",
        #             "date": "2024-11-05",
        #             "trust_delta": +0.08,
        #             "collaboration_quality": 0.95,
        #             "relevance_score": 0.97,
        #             "insight": "Fauzi's pre-submission BPOM consultation approach saved 7 months of revision cycles. Pre-submission meeting is now standard recommendation.",
        #         },
        #         {
        #             "memory_id": "mem-002",
        #             "type": "grant_success",
        #             "entity": "MDEC GAIN Grant",
        #             "event": "Grant awarded to HealthSync — AI patient monitoring company",
        #             "outcome": "Full RM 500K awarded, Indonesia pilot launched within 90 days of approval",
        #             "date": "2024-09-20",
        #             "trust_delta": 0.0,
        #             "collaboration_quality": 0.88,
        #             "relevance_score": 0.89,
        #             "insight": "MDEC fast-tracked companies with clinical validation data. HealthAI should prioritize collecting and presenting clinical outcome metrics.",
        #         },
        #         {
        #             "memory_id": "mem-004",
        #             "type": "programme_outcome",
        #             "entity": "MaGIC Global Accelerator Alumni",
        #             "event": "ClinicalAI completed MaGIC cohort 2024",
        #             "outcome": "Raised Series A of USD 3.2M within 8 months of graduation",
        #             "date": "2025-01-10",
        #             "trust_delta": 0.0,
        #             "collaboration_quality": 0.90,
        #             "relevance_score": 0.85,
        #             "insight": "MaGIC graduates with Indonesia pilots receive premium valuation in SEA VC market. Indonesia traction is the key fundraising differentiator.",
        #         },
        #     ],
        #     "trust_network_insights": {
        #         "high_trust_nodes": ["Dr. Sarah Chen (0.94)", "Ahmad Fauzi (0.91)", "MDEC GAIN (0.88)"],
        #         "trust_trajectory": "Positive — all recommended mentors have improving trust scores over 12 months",
        #         "ecosystem_memory_depth": "24 months of collaboration history available",
        #         "similar_startup_outcomes": [
        #             "DiagnostiQ: Malaysia → Indonesia expansion in 8 months with Chen mentorship",
        #             "MedScan AI: BPOM approval in 11 months with Fauzi guidance",
        #             "ClinicalAI: Series A raised post-MaGIC with Indonesia traction",
        #         ],
        #     },
        #     "memory_synthesis": (
        #         "Ecosystem memory reveals a proven playbook for AI healthcare startups expanding to Indonesia from Malaysia: "
        #         "(1) Engage Fauzi for BPOM pre-submission consultation immediately — saves 7+ months; "
        #         "(2) Use Dr. Chen's hospital sequencing methodology (private → public); "
        #         "(3) Apply MDEC GAIN with clinical validation data front-and-center; "
        #         "(4) Join MaGIC to build Indonesia credibility before Series A. "
        #         "This playbook has been validated by 3 similar companies in the last 24 months."
        #     ),
        #     "collaboration_quality_avg": 0.91,
        #     "memory_confidence": 0.93,
        #     "reasoning": (
        #         "The relationship memory database contains directly applicable precedents for HealthAI's situation. "
        #         "Three startups with near-identical profiles (AI diagnostic tools, Malaysia base, Indonesia target) "
        #         "have navigated this exact path in the last 2 years. Their combined experience forms a high-confidence "
        #         "playbook. The ecosystem memory's trust-weighting ensures recommendations from high-quality past collaborations "
        #         "are surfaced over lower-quality historical data. Confidence level: 93%."
        #     ),
        # }

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
