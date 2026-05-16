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

        fallback = {
            "recommended_programmes": [
                {
                    "programme_id": "prog-001",
                    "name": "MDEC GAIN Grant",
                    "type": "Grant",
                    "provider": "MDEC",
                    "funding_amount": 500000,
                    "eligibility_score": 0.95,
                    "strategic_value": "Critical",
                    "match_reasons": [
                        "Direct mandate for ASEAN market expansion — Indonesia qualifies",
                        "AI Healthcare listed as priority sector for 2025 cohort",
                        "HealthAI's seed stage and MYR revenue meets all criteria",
                        "MDEC has active partnership with Kemenkes for recipient introductions",
                    ],
                    "action_required": "Submit Expression of Interest by Aug 2025. Request MDEC tech advisor introduction.",
                    "deadline": "2025-09-30",
                    "why_selected": (
                        "MDEC GAIN is the single highest-impact programme for HealthAI's Indonesia expansion. "
                        "The RM 500K grant directly funds market entry costs (regulatory, BD, local ops) with no equity dilution. "
                        "MDEC's existing Indonesia government relationships accelerate Kemenkes engagement by an estimated 6 months."
                    ),
                    "cross_border_opportunity": True,
                },
                {
                    "programme_id": "prog-002",
                    "name": "MaGIC Global Accelerator",
                    "type": "Accelerator",
                    "provider": "MaGIC",
                    "funding_amount": 150000,
                    "eligibility_score": 0.87,
                    "strategic_value": "High",
                    "match_reasons": [
                        "Healthcare AI vertical is 2025 cohort focus",
                        "Global mentor network includes 3 Indonesia-specific advisors",
                        "$150K investment with follow-on facilitation",
                        "Silicon Valley bootcamp opens US clinical partnership opportunities",
                    ],
                    "action_required": "Apply by Aug 15. Highlight Indonesia clinical pilot commitment in application.",
                    "deadline": "2025-08-15",
                    "why_selected": (
                        "MaGIC provides capital AND network — the combination is rare. The Indonesia advisor network within "
                        "MaGIC's mentor pool directly de-risks market entry. The Silicon Valley bootcamp could open "
                        "FDA regulatory pathway conversations valuable for long-term US expansion."
                    ),
                    "cross_border_opportunity": True,
                },
                {
                    "programme_id": "prog-004",
                    "name": "Indonesia Digital Health Initiative",
                    "type": "Government Programme",
                    "provider": "Kemenkes Indonesia / USAID",
                    "funding_amount": 200000,
                    "eligibility_score": 0.82,
                    "strategic_value": "High",
                    "match_reasons": [
                        "Direct Kemenkes relationship — fastest path to hospital pilot approval",
                        "USAID co-funding adds credibility for hospital procurement",
                        "Programme includes BPOM fast-track designation for USAID-backed companies",
                        "Network of 45 participating hospitals across Java, Bali, and Sumatra",
                    ],
                    "action_required": "Apply through Kemenkes Digital Health Office. Ahmad Fauzi can facilitate introduction.",
                    "deadline": "2025-12-01",
                    "why_selected": (
                        "This programme solves HealthAI's most critical Indonesia challenge: hospital access. "
                        "The USAID-backed credibility bypasses 12+ months of typical procurement cycles. "
                        "BPOM fast-track (available to programme participants) reduces regulatory timeline by ~40%."
                    ),
                    "cross_border_opportunity": False,
                },
                {
                    "programme_id": "prog-003",
                    "name": "Cradle CIP Catalyst",
                    "type": "Grant",
                    "provider": "Cradle Fund",
                    "funding_amount": 300000,
                    "eligibility_score": 0.78,
                    "strategic_value": "Medium",
                    "match_reasons": [
                        "IP-focused grant aligns with HealthAI's computer vision IP portfolio",
                        "Co-investment structure unlocks up to RM 300K additional capital",
                        "Ministry of Finance backing enables government hospital procurement",
                    ],
                    "action_required": "Prepare IP documentation. Apply after MDEC GAIN result (avoid funding conflict).",
                    "deadline": "2025-10-31",
                    "why_selected": (
                        "Cradle complements MDEC GAIN as a secondary funding source. "
                        "Best applied for in Q4 after MDEC outcome is known to avoid grant stacking issues."
                    ),
                    "cross_border_opportunity": False,
                },
            ],
            "total_available_funding": 1150000,
            "recommended_funding_sequence": [
                "1. MaGIC (Aug 15 deadline) — apply immediately",
                "2. MDEC GAIN (Sep 30) — primary expansion grant",
                "3. Indonesia Digital Health Initiative (Dec 1) — in-country programme",
                "4. Cradle CIP (Oct 31) — secondary, apply after MDEC result",
            ],
            "cross_border_programmes": 2,
            "reasoning": (
                "HealthAI can access up to MYR 1.15M in non-dilutive funding across 4 programmes. "
                "The recommended sequence manages application bandwidth and avoids conflicting grant conditions. "
                "Priority order maximizes Indonesia-specific support: MaGIC builds the network, MDEC GAIN funds the entry, "
                "Indonesia Digital Health opens hospital doors. Total funding trajectory positions HealthAI for a "
                "Series A raise from a position of validated Indonesia traction with government-backed credibility."
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
