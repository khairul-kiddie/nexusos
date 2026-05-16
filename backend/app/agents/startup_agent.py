from typing import Any, Dict
from app.agents.base import BaseAgent
from app.data.mock_data import DEMO_STARTUP


SYSTEM_PROMPT = """You are the Startup Intelligence Agent in the NexusOS AI Operating System.
Your role is to deeply analyze startup profiles and provide strategic intelligence for ecosystem navigation.
Provide structured JSON analysis with actionable insights."""


class StartupIntelligenceAgent(BaseAgent):
    name = "Startup Intelligence Agent"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        startup = context.get("startup_profile", DEMO_STARTUP.model_dump())
        query = context.get("query", "")

        fallback = {
            "startup_id": startup.get("id", "startup-healthai-001"),
            "readiness_score": 78.5,
            "industry_classification": "AI-Enabled Digital Health (MedTech + SaaS)",
            "maturity_level": "Early Revenue / Pre-Series A",
            "market_readiness": {
                "Malaysia": 0.85,
                "Indonesia": 0.62,
                "Singapore": 0.78,
                "Thailand": 0.55,
            },
            "ecosystem_pathways": [
                "Apply for MDEC GAIN Grant to fund Indonesia market entry costs",
                "Engage Ahmad Fauzi for BPOM regulatory navigation and MoH relationships",
                "Partner with Universiti Indonesia for clinical validation study",
                "Join MaGIC Global Accelerator for ASEAN network access",
                "Initiate pilot with 2–3 Indonesian hospital groups in Q3 2025",
            ],
            "strategic_insights": [
                "Indonesia represents a 270M population opportunity with <5% AI diagnostic penetration",
                "BPOM Class II medical device registration takes 12–18 months — start immediately",
                "Hospital procurement cycles in Indonesia average 9 months — build government channel",
                "Local clinical data for FHIR compliance is mandatory for Indonesian market",
                "JKN integration (national health insurance) is a GTM unlock for scale",
            ],
            "expansion_risks": [
                "Regulatory lag: BPOM approval timeline may delay market entry",
                "Data sovereignty requirements under Indonesia's PDP Law",
                "Currency risk and payment infrastructure gaps in Tier 2 cities",
                "Strong local competition from Halodoc and Alodokter",
            ],
            "tech_stack_alignment": "Strong — FHIR/HL7 compliance is critical differentiator for hospital integrations",
            "funding_trajectory": "Well-positioned for Seed extension or Pre-Series A in 12 months post Indonesia validation",
            "reasoning": (
                "HealthAI Solutions demonstrates strong product-market fit in Malaysia with proven clinical outcomes "
                "(40% error reduction). The Indonesia expansion thesis is sound given demographic tailwinds, low AI penetration, "
                "and recent Jokowi-era digital health mandates. Primary risk is regulatory — BPOM classification and PDP Law "
                "compliance must be addressed before market entry. Recommend parallel-tracking regulatory engagement and "
                "clinical partnership with UI Jakarta to build local evidence base. The team's FHIR expertise is a rare "
                "differentiator that opens hospital procurement pathways unavailable to consumer-first competitors."
            ),
        }

        result = await self.gemini.generate_structured(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=f"""Analyze this startup for ecosystem navigation:
Startup: {startup}
Query: {query}

Return JSON with: startup_id, readiness_score (0-100), industry_classification, maturity_level,
market_readiness (dict of market->score 0-1), ecosystem_pathways (list), strategic_insights (list),
expansion_risks (list), tech_stack_alignment, funding_trajectory, reasoning.""",
            fallback_data=fallback,
        )

        return result
