from typing import Any, Dict, List
from app.agents.base import BaseAgent
from app.data.mock_data import DEMO_MENTORS, DEMO_STARTUP


SYSTEM_PROMPT = """You are the Mentor Intelligence Agent in NexusOS.
Your role is to analyze mentor-startup compatibility using trust-weighted matching algorithms.
Consider expertise alignment, market knowledge, availability, and historical collaboration quality."""


class MentorIntelligenceAgent(BaseAgent):
    name = "Mentor Intelligence Agent"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        startup = context.get("startup_profile", DEMO_STARTUP.model_dump())
        query = context.get("query", "")

        industry = startup.get("industry", "technology")
        target_markets = startup.get("target_markets", ["Malaysia"])
        startup_name = startup.get("name", "the startup")
        fallback = {
            "ranked_mentors": [
                {
                    "mentor_id": "mentor-001",
                    "name": "Dr. Sarah Chen",
                    "compatibility_score": 0.82,
                    "trust_weighted_rank": 1,
                    "expertise_alignment": [
                        f"AI/ML applications in {industry}",
                        "ASEAN market expansion strategy",
                        "Regulatory frameworks across SEA",
                        "Strategic partnerships and enterprise sales",
                    ],
                    "market_fit": target_markets,
                    "why_selected": (
                        f"Dr. Chen's broad ASEAN market experience and AI/ML expertise provide strong strategic value "
                        f"for {startup_name}'s expansion objectives. Her trust score of 0.94 reflects consistent "
                        "mentorship quality across multiple sectors and markets."
                    ),
                    "engagement_recommendation": f"Schedule strategic sessions focused on {', '.join(target_markets)} market entry and regulatory landscape",
                    "estimated_time_to_value": "2-4 weeks",
                },
                {
                    "mentor_id": "mentor-002",
                    "name": "Ahmad Fauzi",
                    "compatibility_score": 0.78,
                    "trust_weighted_rank": 2,
                    "expertise_alignment": [
                        "Malaysian market entry and government relations",
                        "Regulatory navigation across SEA",
                        "Government and institutional partnerships",
                        "Cross-border business development",
                    ],
                    "market_fit": ["Malaysia", "Indonesia"],
                    "why_selected": (
                        f"Ahmad's deep government and regulatory networks are valuable for {startup_name} navigating "
                        f"the Malaysian ecosystem. His track record of facilitating foreign company market entries "
                        "makes him a key resource for regulatory and partnership acceleration."
                    ),
                    "engagement_recommendation": "Engage for regulatory strategy and government relationship mapping",
                    "estimated_time_to_value": "1-3 weeks",
                },
                {
                    "mentor_id": "mentor-003",
                    "name": "Priya Menon",
                    "compatibility_score": 0.75,
                    "trust_weighted_rank": 3,
                    "expertise_alignment": [
                        "Fundraising and investor relations",
                        "SEA venture capital landscape",
                        "Product-market fit validation",
                        "Growth strategy and board governance",
                    ],
                    "market_fit": ["SEA", "Malaysia", "Singapore"],
                    "why_selected": (
                        f"Priya's VC background and SEA investment expertise provide critical fundraising guidance "
                        f"for {startup_name}. Her network across Openspace portfolio companies opens partnership "
                        "and co-investment opportunities."
                    ),
                    "engagement_recommendation": "Engage for fundraising readiness and investor introduction strategy",
                    "estimated_time_to_value": "4-8 weeks",
                },
            ],
            "matching_methodology": (
                "Trust-weighted compatibility scoring using: (1) expertise vector cosine similarity [40%], "
                "(2) market overlap scoring [30%], (3) historical trust score [20%], (4) availability weighting [10%]. "
                "All scores validated against ecosystem memory for past collaboration quality."
            ),
            "ecosystem_gap": f"Limited mentor coverage for deep {industry}-specific regulatory expertise in all target markets",
            "reasoning": (
                f"Top 3 mentors selected for {startup_name} based on query: '{query}'. "
                "The cohort provides complementary coverage across strategy, regulatory, and fundraising dimensions. "
                f"Market overlap with {', '.join(target_markets)} is the primary selection criterion alongside industry alignment."
            ),
        }

        result = await self.gemini.generate_structured(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=f"""Match mentors for this startup:
Startup: {startup}
Available Mentors: {[m.model_dump() for m in DEMO_MENTORS]}
Query: {query}

Return JSON with: ranked_mentors (list with mentor_id, name, compatibility_score 0-1, trust_weighted_rank,
expertise_alignment list, market_fit list, why_selected, engagement_recommendation, estimated_time_to_value),
matching_methodology, ecosystem_gap, reasoning.""",
            fallback_data=fallback,
        )

        return result
