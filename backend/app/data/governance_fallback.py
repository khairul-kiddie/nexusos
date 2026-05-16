"""
Pre-written governance fallback data used when the LLM is unavailable or returns
invalid output. The narrative content here is Malaysian-ecosystem-specific.

Note: health_score, health_breakdown, sector_coverage, and monthly_trends are
always overwritten at runtime with deterministic analytics values — only the
narrative fields (alerts, bottlenecks, recommendations, reasoning) use this data.
"""

GOVERNANCE_FALLBACK: dict = {
    "ecosystem_health_score": 72.4,  # overwritten at runtime
    "health_breakdown": {            # overwritten at runtime
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
            "description": (
                "Dr. Chen is currently mentoring 7 startups, 2 above her optimal capacity of 5. "
                "Historical patterns indicate an 18% quality degradation risk at this load level, "
                "threatening outcome quality for her current mentees within the next quarter."
            ),
            "affected_entities": ["Dr. Sarah Chen", "2 over-capacity mentees"],
            "recommendation": (
                "Redistribute 2 mentees to Kevin Lim (currently at 50% capacity) or recruit "
                "a new mentor from the IHH Healthcare Digital alumni network."
            ),
            "impact_score": 0.74,
        },
        {
            "alert_id": "alert-002",
            "type": "sector_gap",
            "severity": "medium",
            "title": "AgriTech Sector Severely Underserved",
            "description": (
                "AgriTech startups represent 12% of registered ecosystem companies "
                "but receive only 3% of mentor capacity and 5% of programme funding. "
                "This structural gap is limiting growth potential in a high-priority national sector."
            ),
            "affected_entities": ["AgriTech Sector", "14 unmatched startups"],
            "recommendation": (
                "Launch targeted AgriTech mentor recruitment campaign. "
                "Flag to MDEC and MARDI for dedicated programme design consideration in the next policy cycle."
            ),
            "impact_score": 0.61,
        },
        {
            "alert_id": "alert-003",
            "type": "geographic_imbalance",
            "severity": "medium",
            "title": "East Malaysia Ecosystem Gap",
            "description": (
                "Sabah and Sarawak account for 14% of registered startups but receive only "
                "6% of mentorship hours and 8% of grant funding. "
                "This disparity limits ecosystem equity and leaves high-resilience East Malaysian "
                "founders without adequate support infrastructure."
            ),
            "affected_entities": ["Sabah (8% of startups)", "Sarawak (6% of startups)"],
            "recommendation": (
                "Establish a dedicated East Malaysia virtual mentorship cohort within Q3 2025. "
                "Advocate with MDEC and PUNB for regional grant allocation adjustments."
            ),
            "impact_score": 0.58,
        },
        {
            "alert_id": "alert-004",
            "type": "funding_bottleneck",
            "severity": "high",
            "title": "Series B Funding Gap — No Local Bridge Capital",
            "description": (
                "Zero local programmes currently support Series B financing rounds. "
                "Startups graduating from Series A face an average 14-month gap before "
                "international VC engagement, causing momentum loss and talent attrition."
            ),
            "affected_entities": ["Series B stage startups", "7 Series A graduates"],
            "recommendation": (
                "Advocate for a new Series B bridge co-investment programme through "
                "Khazanah Nasional or PNB partnership. Engage MAVCAP for deal structuring."
            ),
            "impact_score": 0.78,
        },
    ],
    "ecosystem_bottlenecks": [
        (
            "MDA/NPRA approval timelines averaging 12-15 months remain the single biggest "
            "expansion blocker for HealthTech startups pursuing Malaysian regulatory clearance"
        ),
        (
            "Mentor overconcentration: the top 5 mentors handle 43% of all mentorship hours, "
            "creating single points of failure in the ecosystem's advisory capacity"
        ),
        (
            "Programme application complexity deters Seed-stage founders — multi-stage "
            "evaluation processes averaging 90+ days exceed bandwidth for lean early-stage teams"
        ),
    ],
    "sector_coverage": {  # overwritten at runtime
        "AI/ML": 0.88,
        "FinTech": 0.85,
        "HealthTech": 0.79,
        "EdTech": 0.72,
        "CleanTech": 0.65,
        "AgriTech": 0.31,
        "LogiTech": 0.58,
        "PropTech": 0.61,
    },
    "monthly_trends": {  # overwritten at runtime
        "new_startups_registered": 23,
        "mentor_sessions_completed": 156,
        "grants_disbursed": 8,
        "successful_market_entries": 4,
        "ecosystem_connections_formed": 89,
    },
    "recommendations_for_operators": [
        "Urgent: Recruit 3 new mentors with expertise in healthcare regulatory affairs and AgriTech domains",
        "Design a simplified Seed-stage grant application targeting a 30-day end-to-end process",
        "Establish an East Malaysia virtual mentorship cohort by Q3 2025",
        "Create a Series B bridge co-investment mechanism via GLC partnership (Khazanah or PNB)",
        "Develop a standardised MDA/NPRA navigation playbook to reduce HealthTech approval timelines",
    ],
    "reasoning": (
        "The Malaysian startup ecosystem shows a health score of 72.4 — maturing but structurally imbalanced. "
        "Outcome quality (82.0) is a strong signal of good programme design, but mentor availability (68.0) "
        "is the critical bottleneck. The mentor overload pattern, if unaddressed, will degrade outcomes "
        "within 6-9 months as top-performing mentors reach saturation. "
        "Geographic imbalance represents both an equity concern and an untapped growth opportunity — "
        "East Malaysian startups demonstrate above-average resilience but receive disproportionately low support. "
        "The Series B funding gap is the most structurally dangerous bottleneck: without bridge capital, "
        "growth-stage startups stall or exit the ecosystem entirely. "
        "Immediate governance priority: mentor recruitment, AgriTech sector development, and Series B bridge activation."
    ),
}
