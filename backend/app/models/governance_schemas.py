from __future__ import annotations

from enum import Enum
from typing import Dict, List

from pydantic import BaseModel, Field


class AlertSeverity(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AlertType(str, Enum):
    MENTOR_OVERLOAD = "mentor_overload"
    SECTOR_GAP = "sector_gap"
    GEOGRAPHIC_IMBALANCE = "geographic_imbalance"
    FUNDING_BOTTLENECK = "funding_bottleneck"


class GovernanceAlertItem(BaseModel):
    alert_id: str = ""
    type: AlertType
    severity: AlertSeverity
    title: str
    description: str
    affected_entities: List[str]
    recommendation: str
    impact_score: float = Field(ge=0.0, le=1.0)


class HealthBreakdown(BaseModel):
    mentor_availability: float = Field(ge=0.0, le=100.0)
    programme_coverage: float = Field(ge=0.0, le=100.0)
    funding_flow: float = Field(ge=0.0, le=100.0)
    sector_diversity: float = Field(ge=0.0, le=100.0)
    geographic_balance: float = Field(ge=0.0, le=100.0)
    outcome_quality: float = Field(ge=0.0, le=100.0)


class MonthlyTrends(BaseModel):
    new_startups_registered: int = Field(ge=0)
    mentor_sessions_completed: int = Field(ge=0)
    grants_disbursed: int = Field(ge=0)
    successful_market_entries: int = Field(ge=0)
    ecosystem_connections_formed: int = Field(ge=0)


class GovernanceOutput(BaseModel):
    ecosystem_health_score: float = Field(ge=0.0, le=100.0)
    health_breakdown: HealthBreakdown
    governance_alerts: List[GovernanceAlertItem]
    ecosystem_bottlenecks: List[str]
    sector_coverage: Dict[str, float]
    monthly_trends: MonthlyTrends
    recommendations_for_operators: List[str]
    reasoning: str
