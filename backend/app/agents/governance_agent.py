from typing import Any, Dict
from app.agents.base import BaseAgent


SYSTEM_PROMPT = """You are the Governance Agent in NexusOS.
Your role is to monitor ecosystem health, detect imbalances, identify underserved sectors,
surface bottlenecks, and provide governance intelligence to ecosystem operators."""


class GovernanceAgent(BaseAgent):
    name = "Governance Agent"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query = context.get("query", "")

        fallback = {
            "ecosystem_health_score": 72.4,
            "health_breakdown": {
                "mentor_availability": 68.0,
                "programme_coverage": 79.0,
                "funding_flow": 74.0,
                "sector_diversity": 71.0,
                "geographic_balance": 70.0,
                "outcome_quality": 82.0,
            },
            "governance_alerts": [
                {
                    "alert_id": "alert-001",
                    "type": "mentor_overload",
                    "severity": "high",
                    "title": "Dr. Sarah Chen — Mentor Overload Risk",
                    "description": "Dr. Chen is currently mentoring 7 startups. Her optimal load is 4-5. Quality degradation risk of 18% based on historical data.",
                    "affected_entities": ["Dr. Sarah Chen", "3 active mentees"],
                    "recommendation": "Redistribute 2-3 mentees to Kevin Lim or recruit new mentor from IHH Digital network",
                    "impact_score": 0.74,
                },
                {
                    "alert_id": "alert-002",
                    "type": "sector_gap",
                    "severity": "medium",
                    "title": "AgriTech Sector Severely Underserved",
                    "description": "AgriTech startups represent 12% of registered ecosystem companies but only 3% of mentor capacity and 5% of programme funding.",
                    "affected_entities": ["AgriTech Sector", "14 unmatched startups"],
                    "recommendation": "Launch targeted AgriTech mentor recruitment. Flag to MDEC for programme design consideration.",
                    "impact_score": 0.61,
                },
                {
                    "alert_id": "alert-003",
                    "type": "geographic_imbalance",
                    "severity": "medium",
                    "title": "East Malaysia Ecosystem Gap",
                    "description": "Sabah and Sarawak account for 11% of registered startups but receive only 4% of mentorship hours and 6% of grant funding.",
                    "affected_entities": ["Sabah startups (18)", "Sarawak startups (14)"],
                    "recommendation": "Create East Malaysia virtual mentorship cohort. Advocate for MDEC regional grant allocation.",
                    "impact_score": 0.58,
                },
                {
                    "alert_id": "alert-004",
                    "type": "funding_bottleneck",
                    "severity": "low",
                    "title": "Series B Funding Gap — No Local Bridge Capital",
                    "description": "0 local programmes support Series B rounds. Startups graduating from Series A face a 14-month average gap before international VC engagement.",
                    "affected_entities": ["7 Series A graduates", "Growth-stage startups"],
                    "recommendation": "Advocate for new Series B bridge programme with Khazanah or PNB partnership.",
                    "impact_score": 0.52,
                },
            ],
            "ecosystem_bottlenecks": [
                "BPOM approval timeline (avg 15 months) is single biggest expansion blocker for health-tech",
                "Mentor overconcentration: top 5 mentors handle 43% of all mentorship hours",
                "Programme application complexity deters Seed-stage founders with limited admin capacity",
            ],
            "sector_coverage": {
                "AI/ML": 0.88,
                "FinTech": 0.85,
                "HealthTech": 0.79,
                "EdTech": 0.72,
                "CleanTech": 0.65,
                "AgriTech": 0.31,
                "LogiTech": 0.58,
                "PropTech": 0.61,
            },
            "monthly_trends": {
                "new_startups_registered": 23,
                "mentor_sessions_completed": 156,
                "grants_disbursed": 8,
                "successful_market_entries": 4,
                "ecosystem_connections_formed": 89,
            },
            "recommendations_for_operators": [
                "Urgent: Recruit 3 new mentors in healthcare regulatory and AgriTech domains",
                "Design simplified grant application for Seed-stage companies (< 30-day process)",
                "Establish East Malaysia virtual mentorship programme in Q3 2025",
                "Create Series B bridge mechanism with GLCs",
                "Develop standardised BPOM navigation playbook to reduce expansion timeline",
            ],
            "reasoning": (
                "The ecosystem health score of 72.4 reflects a maturing but imbalanced ecosystem. "
                "Outcome quality (82.0) is strong — indicating good programme design — but mentor availability (68.0) "
                "is the critical constraint. The mentor overload pattern, if unaddressed, will degrade outcome quality "
                "within 6-9 months as the current cohort of high-performers reaches capacity. Geographic imbalance "
                "represents both an equity concern and an untapped opportunity — East Malaysia startups show above-average "
                "resilience metrics but receive disproportionately low support. Immediate governance priority: mentor recruitment."
            ),
        }

        result = await self.gemini.generate_structured(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=f"""Assess ecosystem governance health for context: {query}

Return JSON with: ecosystem_health_score (0-100), health_breakdown (dict of dimensions->score),
governance_alerts (list with alert_id, type, severity, title, description, affected_entities list,
recommendation, impact_score 0-1), ecosystem_bottlenecks list, sector_coverage (dict),
monthly_trends (dict), recommendations_for_operators list, reasoning.""",
            fallback_data=fallback,
        )

        return result
