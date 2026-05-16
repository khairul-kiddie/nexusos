"""
Deterministic governance analytics for the Malaysian startup ecosystem.

Each function computes a specific governance signal from ecosystem data.
In production these functions would query a database or data warehouse;
for the hackathon they operate on representative mock metrics defined below.
The LLM's role is to interpret these outputs — not to invent them.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Simulated ecosystem data (stands in for real DB queries)
# ---------------------------------------------------------------------------

_MENTOR_LOADS: Dict[str, dict] = {
    "Dr. Sarah Chen": {"mentee_count": 7, "optimal_max": 5, "mentor_id": "mentor-001"},
    "Ahmad Fauzi":    {"mentee_count": 4, "optimal_max": 5, "mentor_id": "mentor-002"},
    "Priya Menon":    {"mentee_count": 3, "optimal_max": 5, "mentor_id": "mentor-003"},
    "Kevin Lim":      {"mentee_count": 2, "optimal_max": 4, "mentor_id": "mentor-004"},
}

# Each sector: share of total startups, mentor capacity, and programme funding
_SECTOR_METRICS: Dict[str, dict] = {
    "AI/ML":      {"startup_pct": 0.22, "mentor_pct": 0.30, "funding_pct": 0.28},
    "FinTech":    {"startup_pct": 0.18, "mentor_pct": 0.22, "funding_pct": 0.25},
    "HealthTech": {"startup_pct": 0.16, "mentor_pct": 0.18, "funding_pct": 0.17},
    "EdTech":     {"startup_pct": 0.12, "mentor_pct": 0.10, "funding_pct": 0.10},
    "CleanTech":  {"startup_pct": 0.09, "mentor_pct": 0.07, "funding_pct": 0.08},
    "AgriTech":   {"startup_pct": 0.12, "mentor_pct": 0.03, "funding_pct": 0.05},
    "LogiTech":   {"startup_pct": 0.06, "mentor_pct": 0.05, "funding_pct": 0.04},
    "PropTech":   {"startup_pct": 0.05, "mentor_pct": 0.05, "funding_pct": 0.03},
}

# Each region: share of total startups, mentorship hours, and grant funding
_GEO_DATA: Dict[str, dict] = {
    "Kuala Lumpur / Selangor": {"startup_pct": 0.62, "mentorship_pct": 0.73, "funding_pct": 0.70},
    "Penang":                  {"startup_pct": 0.12, "mentorship_pct": 0.11, "funding_pct": 0.12},
    "Johor":                   {"startup_pct": 0.07, "mentorship_pct": 0.06, "funding_pct": 0.06},
    "Sabah":                   {"startup_pct": 0.08, "mentorship_pct": 0.03, "funding_pct": 0.04},
    "Sarawak":                 {"startup_pct": 0.06, "mentorship_pct": 0.03, "funding_pct": 0.04},
    "Other":                   {"startup_pct": 0.05, "mentorship_pct": 0.04, "funding_pct": 0.04},
}

# Each funding stage: number of available support programmes
_FUNDING_STAGES: Dict[str, dict] = {
    "Pre-Seed": {"programmes_available": 8,  "avg_funding_myr": 150_000},
    "Seed":     {"programmes_available": 12, "avg_funding_myr": 500_000},
    "Series A": {"programmes_available": 5,  "avg_funding_myr": 3_000_000},
    "Series B": {"programmes_available": 0,  "avg_funding_myr": 0},
    "Growth":   {"programmes_available": 1,  "avg_funding_myr": 10_000_000},
}

_MONTHLY_TRENDS: dict = {
    "new_startups_registered": 23,
    "mentor_sessions_completed": 156,
    "grants_disbursed": 8,
    "successful_market_entries": 4,
    "ecosystem_connections_formed": 89,
}


# ---------------------------------------------------------------------------
# Internal result type
# ---------------------------------------------------------------------------

@dataclass
class DetectedIssue:
    type: str
    severity: str          # "high" | "medium" | "low"
    affected_entities: List[str]
    impact_score: float
    raw_data: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Analytics functions
# ---------------------------------------------------------------------------

def calculate_ecosystem_health_score(breakdown: Dict[str, float]) -> float:
    """Weighted average of health dimension scores (0-100)."""
    weights = {
        "mentor_availability": 0.25,
        "programme_coverage":  0.20,
        "funding_flow":        0.20,
        "sector_diversity":    0.15,
        "geographic_balance":  0.10,
        "outcome_quality":     0.10,
    }
    score = sum(breakdown.get(k, 0.0) * w for k, w in weights.items())
    return round(score, 1)


def detect_mentor_overload(
    mentor_loads: Optional[Dict[str, dict]] = None,
) -> List[DetectedIssue]:
    """Flag mentors whose active mentee count exceeds their optimal capacity."""
    loads = mentor_loads or _MENTOR_LOADS
    issues: List[DetectedIssue] = []

    for name, data in loads.items():
        count, optimal = data["mentee_count"], data["optimal_max"]
        if count <= optimal:
            continue
        overload_ratio = (count - optimal) / optimal
        severity = "high" if overload_ratio >= 0.4 else "medium"
        issues.append(DetectedIssue(
            type="mentor_overload",
            severity=severity,
            affected_entities=[name, f"{count - optimal} mentee(s) over optimal load"],
            impact_score=round(min(0.9, 0.5 + overload_ratio * 0.5), 2),
            raw_data={"mentor": name, "mentee_count": count, "optimal_max": optimal},
        ))

    return issues


def detect_sector_gaps(
    sector_metrics: Optional[Dict[str, dict]] = None,
) -> List[DetectedIssue]:
    """Identify sectors where mentor capacity or funding lags significantly behind startup share."""
    metrics = sector_metrics or _SECTOR_METRICS
    issues: List[DetectedIssue] = []

    for sector, data in metrics.items():
        mentor_gap = data["startup_pct"] - data["mentor_pct"]
        funding_gap = data["startup_pct"] - data["funding_pct"]
        max_gap = max(mentor_gap, funding_gap)
        if max_gap <= 0.05:
            continue
        severity = "high" if max_gap > 0.08 else "medium"
        issues.append(DetectedIssue(
            type="sector_gap",
            severity=severity,
            affected_entities=[f"{sector} Sector"],
            impact_score=round(min(0.9, max_gap * 5), 2),
            raw_data={
                "sector": sector,
                "startup_share": data["startup_pct"],
                "mentor_share": data["mentor_pct"],
                "funding_share": data["funding_pct"],
            },
        ))

    return issues


def detect_geographic_imbalance(
    geo_data: Optional[Dict[str, dict]] = None,
) -> List[DetectedIssue]:
    """Identify regions receiving disproportionately low mentorship or funding relative to startup density."""
    data = geo_data or _GEO_DATA
    issues: List[DetectedIssue] = []

    for region, metrics in data.items():
        mentorship_gap = metrics["startup_pct"] - metrics["mentorship_pct"]
        funding_gap = metrics["startup_pct"] - metrics["funding_pct"]
        max_gap = max(mentorship_gap, funding_gap)
        if max_gap <= 0.03:
            continue
        severity = "high" if max_gap > 0.05 else "medium"
        issues.append(DetectedIssue(
            type="geographic_imbalance",
            severity=severity,
            affected_entities=[region],
            impact_score=round(min(0.85, max_gap * 8), 2),
            raw_data={
                "region": region,
                "startup_share": metrics["startup_pct"],
                "mentorship_share": metrics["mentorship_pct"],
                "funding_share": metrics["funding_pct"],
            },
        ))

    return issues


def detect_funding_bottlenecks(
    funding_stages: Optional[Dict[str, dict]] = None,
) -> List[DetectedIssue]:
    """Identify funding stage gaps where no or very few support programmes exist."""
    stages = funding_stages or _FUNDING_STAGES
    issues: List[DetectedIssue] = []

    for stage, data in stages.items():
        programmes = data["programmes_available"]
        if programmes == 0:
            issues.append(DetectedIssue(
                type="funding_bottleneck",
                severity="high",
                affected_entities=[f"{stage} stage startups"],
                impact_score=0.78,
                raw_data={"stage": stage, "programmes_available": programmes},
            ))
        elif programmes <= 2:
            issues.append(DetectedIssue(
                type="funding_bottleneck",
                severity="low",
                affected_entities=[f"{stage} stage startups"],
                impact_score=0.45,
                raw_data={"stage": stage, "programmes_available": programmes},
            ))

    return issues


# ---------------------------------------------------------------------------
# Derived dimension scores
# ---------------------------------------------------------------------------

def _compute_health_breakdown() -> Dict[str, float]:
    """Derive health dimension scores (0-100) from underlying ecosystem metrics."""
    # Mentor availability: penalised for each overloaded mentor
    overloaded = sum(
        1 for d in _MENTOR_LOADS.values() if d["mentee_count"] > d["optimal_max"]
    )
    mentor_availability = round(100.0 * (1 - (overloaded / len(_MENTOR_LOADS)) * 0.5), 1)

    # Sector diversity: average coverage ratio across all sectors
    coverage_ratios = [
        min(1.0, d["mentor_pct"] / max(d["startup_pct"], 0.01))
        for d in _SECTOR_METRICS.values()
    ]
    sector_diversity = round(sum(coverage_ratios) / len(coverage_ratios) * 100.0, 1)

    # Geographic balance: penalised by total mentorship gap across regions
    total_gap = sum(
        max(0.0, m["startup_pct"] - m["mentorship_pct"])
        for m in _GEO_DATA.values()
    )
    geographic_balance = round(max(0.0, 100.0 * (1 - total_gap * 2)), 1)

    # Funding flow: share of stages with at least one programme
    covered = sum(1 for d in _FUNDING_STAGES.values() if d["programmes_available"] > 0)
    funding_flow = round(100.0 * covered / len(_FUNDING_STAGES), 1)

    return {
        "mentor_availability": max(0.0, min(100.0, mentor_availability)),
        "programme_coverage":  79.0,   # sourced from programme completion database
        "funding_flow":        max(0.0, min(100.0, funding_flow)),
        "sector_diversity":    max(0.0, min(100.0, sector_diversity)),
        "geographic_balance":  max(0.0, min(100.0, geographic_balance)),
        "outcome_quality":     82.0,   # sourced from programme outcome tracking
    }


def _compute_sector_coverage() -> Dict[str, float]:
    """Compute a 0-1 coverage score per sector (blend of mentor and funding ratios)."""
    coverage: Dict[str, float] = {}
    for sector, data in _SECTOR_METRICS.items():
        mentor_ratio = min(1.0, data["mentor_pct"] / max(data["startup_pct"], 0.01))
        funding_ratio = min(1.0, data["funding_pct"] / max(data["startup_pct"], 0.01))
        coverage[sector] = round(mentor_ratio * 0.6 + funding_ratio * 0.4, 2)
    return coverage


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def run_governance_analytics() -> dict:
    """
    Orchestrate all analytics passes and return a structured metrics dict.
    The governance agent feeds this dict into the LLM prompt so the model
    interprets real signals rather than inventing data.
    """
    health_breakdown = _compute_health_breakdown()
    health_score = calculate_ecosystem_health_score(health_breakdown)
    sector_coverage = _compute_sector_coverage()

    detected_issues = (
        detect_mentor_overload()
        + detect_sector_gaps()
        + detect_geographic_imbalance()
        + detect_funding_bottlenecks()
    )

    logger.info(
        "Governance analytics complete — score=%.1f detected_issues=%d",
        health_score,
        len(detected_issues),
    )

    return {
        "health_score": health_score,
        "health_breakdown": health_breakdown,
        "sector_coverage": sector_coverage,
        "monthly_trends": _MONTHLY_TRENDS,
        "detected_issues": [
            {
                "type": issue.type,
                "severity": issue.severity,
                "affected_entities": issue.affected_entities,
                "impact_score": issue.impact_score,
                "raw_data": issue.raw_data,
            }
            for issue in detected_issues
        ],
    }
