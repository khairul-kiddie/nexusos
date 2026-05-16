from typing import Any, Dict
from app.agents.base import BaseAgent
from app.data.mock_data import DEMO_PROGRAMMES, DEMO_STARTUP


SYSTEM_PROMPT = """You are the Programme Intelligence Agent in NexusOS.
Your role is to discover and recommend grants, accelerators, and ecosystem programmes.
Analyze eligibility, funding value, strategic fit, and cross-border support potential."""


class ProgrammeIntelligenceAgent(BaseAgent):
    name = "Programme Intelligence Agent"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        startup = context.get("startup_profile", DEMO_STARTUP.model_dump())
        query = context.get("query", "")

        industry = startup.get("industry", "technology")
        stage = startup.get("stage", "Seed")
        startup_name = startup.get("name", "the startup")
        target_markets = startup.get("target_markets", ["Malaysia"])
        fallback = {
            "recommended_programmes": [
                {
                    "programme_id": "prog-001",
                    "name": "MDEC GAIN Grant",
                    "type": "Grant",
                    "provider": "MDEC",
                    "funding_amount": 500000,
                    "eligibility_score": 0.88,
                    "strategic_value": "Critical",
                    "match_reasons": [
                        f"Supports ASEAN market expansion for {industry} startups",
                        f"{stage} stage eligibility confirmed",
                        "No equity dilution — non-dilutive funding",
                        "MDEC ecosystem network accelerates market entry",
                    ],
                    "action_required": "Submit Expression of Interest. Highlight target market expansion plan.",
                    "deadline": "2025-09-30",
                    "why_selected": (
                        f"MDEC GAIN is the primary expansion grant for {startup_name}. "
                        f"The RM 500K directly funds market entry costs into {', '.join(target_markets)} with no equity dilution."
                    ),
                    "cross_border_opportunity": True,
                },
                {
                    "programme_id": "prog-002",
                    "name": "MaGIC Global Accelerator",
                    "type": "Accelerator",
                    "provider": "MaGIC",
                    "funding_amount": 150000,
                    "eligibility_score": 0.82,
                    "strategic_value": "High",
                    "match_reasons": [
                        f"{industry} sector aligned with programme focus areas",
                        "Global mentor network with ASEAN market specialists",
                        "Investment plus follow-on facilitation",
                        "International bootcamp opens partnership opportunities",
                    ],
                    "action_required": "Apply by Aug 15. Demonstrate market traction and expansion readiness.",
                    "deadline": "2025-08-15",
                    "why_selected": (
                        f"MaGIC provides capital and a network for {startup_name}. "
                        "The ASEAN mentor pool and international exposure directly support expansion objectives."
                    ),
                    "cross_border_opportunity": True,
                },
                {
                    "programme_id": "prog-003",
                    "name": "Cradle CIP Catalyst",
                    "type": "Grant",
                    "provider": "Cradle Fund",
                    "funding_amount": 300000,
                    "eligibility_score": 0.75,
                    "strategic_value": "Medium",
                    "match_reasons": [
                        "R&D and IP commercialisation support",
                        "Co-investment structure for additional capital leverage",
                        "Ministry of Finance backing for government sector access",
                    ],
                    "action_required": "Prepare IP documentation. Apply after primary grant outcome to avoid stacking conflicts.",
                    "deadline": "2025-10-31",
                    "why_selected": (
                        f"Cradle CIP is a strong secondary funding source for {startup_name}. "
                        "Best sequenced after the MDEC GAIN result."
                    ),
                    "cross_border_opportunity": False,
                },
            ],
            "total_available_funding": 950000,
            "recommended_funding_sequence": [
                "1. MaGIC (Aug 15 deadline) — apply immediately",
                "2. MDEC GAIN (Sep 30) — primary expansion grant",
                "3. Cradle CIP (Oct 31) — secondary, apply after MDEC result",
            ],
            "cross_border_programmes": 2,
            "reasoning": (
                f"{startup_name} can access up to MYR 950K in non-dilutive funding across 3 programmes. "
                f"The recommended sequence manages application bandwidth and avoids conflicting grant conditions. "
                f"Priority order maximises support for the query: '{query}'."
            ),
        }

        result = await self.gemini.generate_structured(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=f"""Recommend programmes for this startup:
Startup: {startup}
Available Programmes: {[p.model_dump() for p in DEMO_PROGRAMMES]}
Query: {query}

Return JSON with: recommended_programmes (list with programme_id, name, type, provider, funding_amount,
eligibility_score 0-1, strategic_value, match_reasons list, action_required, deadline, why_selected,
cross_border_opportunity bool), total_available_funding, recommended_funding_sequence list,
cross_border_programmes count, reasoning.""",
            fallback_data=fallback,
        )

        return result
