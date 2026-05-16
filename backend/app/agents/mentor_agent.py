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

        fallback = {
            "ranked_mentors": [
                {
                    "mentor_id": "mentor-001",
                    "name": "Dr. Sarah Chen",
                    "compatibility_score": 0.96,
                    "trust_weighted_rank": 1,
                    "expertise_alignment": [
                        "AI/ML healthcare applications",
                        "ASEAN market expansion strategy",
                        "Digital health regulatory frameworks",
                        "Hospital system integration",
                    ],
                    "market_fit": ["Indonesia", "Malaysia", "Singapore"],
                    "why_selected": (
                        "Dr. Chen's 18 years in digital health combined with successful IHH Digital expansion "
                        "across 6 ASEAN markets makes her the highest-value mentor for HealthAI's Indonesia push. "
                        "Her trust score of 0.94 reflects 3 verified successful mentorships in the healthcare AI space. "
                        "Specific value: regulatory pathway knowledge and C-suite hospital relationships in Indonesia."
                    ),
                    "engagement_recommendation": "Schedule bi-weekly strategic sessions focused on Indonesia GTM and regulatory timeline",
                    "estimated_time_to_value": "2-4 weeks",
                },
                {
                    "mentor_id": "mentor-002",
                    "name": "Ahmad Fauzi",
                    "compatibility_score": 0.91,
                    "trust_weighted_rank": 2,
                    "expertise_alignment": [
                        "BPOM regulatory navigation",
                        "Kemenkes (MoH Indonesia) relationships",
                        "Healthcare policy and JKN integration",
                        "Government procurement channels",
                    ],
                    "market_fit": ["Indonesia"],
                    "why_selected": (
                        "Ahmad's former role as Director at Kemenkes makes him irreplaceable for navigating Indonesian "
                        "government channels. His BPOM expertise directly addresses HealthAI's highest-priority risk. "
                        "Track record: 8 foreign health-tech market entries facilitated. Trust score 0.91 verified "
                        "through 4 ecosystem collaborations."
                    ),
                    "engagement_recommendation": "Immediate engagement for BPOM Class II application strategy",
                    "estimated_time_to_value": "1-2 weeks",
                },
                {
                    "mentor_id": "mentor-003",
                    "name": "Priya Menon",
                    "compatibility_score": 0.88,
                    "trust_weighted_rank": 3,
                    "expertise_alignment": [
                        "Series A fundraising strategy",
                        "HealthTech VC landscape in SEA",
                        "Clinical validation for investor readiness",
                        "Board governance and metrics",
                    ],
                    "market_fit": ["SEA", "India", "US"],
                    "why_selected": (
                        "Priya's dual role as active VC and former McKinsey health consultant provides unique value "
                        "for HealthAI's fundraising preparation. Her $120M deployment in health-tech means she understands "
                        "what investors want to see from Indonesia expansion. Secondary benefit: warm introductions to "
                        "co-investors in the Openspace portfolio network."
                    ),
                    "engagement_recommendation": "Engage for fundraising readiness after 3-month Indonesia pilot data is available",
                    "estimated_time_to_value": "3-6 months",
                },
            ],
            "matching_methodology": (
                "Trust-weighted compatibility scoring using: (1) expertise vector cosine similarity [40%], "
                "(2) market overlap scoring [30%], (3) historical trust score [20%], (4) availability weighting [10%]. "
                "All scores validated against ecosystem memory for past collaboration quality."
            ),
            "ecosystem_gap": "No mentor available with deep Thailand healthcare regulatory expertise — recommend recruiting",
            "reasoning": (
                "The mentor cohort for HealthAI's Indonesia expansion is exceptionally well-matched. The top 3 mentors "
                "provide complementary coverage: Chen for strategic AI/health market entry, Fauzi for regulatory and "
                "government, Menon for capital. This triangular coverage addresses the three biggest risks in the "
                "expansion thesis. Recommend sequencing: Fauzi first (regulatory), Chen concurrent (strategy), "
                "Menon after first hospital pilot (fundraising readiness)."
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
