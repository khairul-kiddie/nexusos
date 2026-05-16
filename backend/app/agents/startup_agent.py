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

        target_markets = startup.get("target_markets", ["Malaysia"])
        fallback = {
            "startup_id": startup.get("id", "startup-001"),
            "readiness_score": 72.0,
            "industry_classification": startup.get("industry", "Technology"),
            "maturity_level": startup.get("stage", "Early Stage"),
            "market_readiness": {m: 0.65 for m in target_markets},
            "ecosystem_pathways": [
                f"Engage mentors with expertise in {startup.get('industry', 'your sector')} and target market entry",
                "Apply for MDEC GAIN Grant to fund market expansion costs",
                "Join MaGIC Global Accelerator for ASEAN network access",
                "Identify strategic local partners in target markets",
                "Engage CRADLE or MRANTI for R&D grant funding",
            ],
            "strategic_insights": [
                f"Malaysia's {startup.get('industry', 'tech')} ecosystem is maturing with active government support",
                "MDEC and MaGIC offer dedicated programmes for startups targeting ASEAN expansion",
                "Local partnerships accelerate regulatory approval and enterprise sales cycles",
                "Non-dilutive grant funding from CRADLE/MDEC can extend runway significantly",
            ],
            "expansion_risks": [
                "Regulatory requirements vary significantly across ASEAN markets",
                "Local competition may have established distribution and government relationships",
                "Currency and payment infrastructure differences across target markets",
                "Talent acquisition in competitive tech markets",
            ],
            "tech_stack_alignment": f"Assess alignment of {startup.get('tech_stack', ['technology'])} with target market infrastructure",
            "funding_trajectory": f"Well-positioned for next funding round with ecosystem support — target markets: {', '.join(target_markets)}",
            "reasoning": (
                f"{startup.get('name', 'The startup')} is pursuing {query}. "
                f"With a {startup.get('stage', 'early')} stage profile in {startup.get('industry', 'technology')}, "
                "the NexusOS ecosystem can provide mentor matching, grant access, and programme connections "
                "to accelerate this objective. Key success factors include securing non-dilutive funding, "
                "engaging market-specialist mentors, and leveraging Malaysia's innovation infrastructure."
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
