from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class NodeType(str, Enum):
    STARTUP = "startup"
    MENTOR = "mentor"
    INVESTOR = "investor"
    PROGRAMME = "programme"
    AGENCY = "agency"
    UNIVERSITY = "university"


class EdgeType(str, Enum):
    MATCHED_WITH = "MATCHED_WITH"
    ELIGIBLE_FOR = "ELIGIBLE_FOR"
    FUNDED_BY = "FUNDED_BY"
    CONNECTED_TO = "CONNECTED_TO"
    SUPPORTED_BY = "SUPPORTED_BY"
    MENTORED_BY = "MENTORED_BY"


class StartupProfile(BaseModel):
    id: str
    name: str
    industry: str
    stage: str
    description: str
    target_markets: List[str]
    tech_stack: List[str]
    funding_raised: Optional[float] = None
    team_size: int
    founded_year: int


class MentorProfile(BaseModel):
    id: str
    name: str
    expertise: List[str]
    industries: List[str]
    markets: List[str]
    years_experience: int
    trust_score: float
    availability: str
    bio: str


class ProgrammeProfile(BaseModel):
    id: str
    name: str
    type: str
    provider: str
    funding_amount: Optional[float] = None
    eligible_stages: List[str]
    eligible_industries: List[str]
    eligible_markets: List[str]
    deadline: Optional[str] = None
    description: str


class StartupAnalysis(BaseModel):
    startup_id: str
    readiness_score: float
    industry_classification: str
    maturity_level: str
    ecosystem_pathways: List[str]
    strategic_insights: List[str]
    expansion_risks: List[str]
    reasoning: str


class MentorMatch(BaseModel):
    mentor: MentorProfile
    compatibility_score: float
    expertise_alignment: List[str]
    market_fit: List[str]
    reasoning: str
    trust_weighted_rank: int


class ProgrammeRecommendation(BaseModel):
    programme: ProgrammeProfile
    eligibility_score: float
    match_reasons: List[str]
    action_required: str
    reasoning: str


class GovernanceAlert(BaseModel):
    alert_type: str
    severity: str
    title: str
    description: str
    affected_entities: List[str]
    recommendation: str


class EcosystemMemory(BaseModel):
    memory_id: str
    entity_type: str
    entity_id: str
    event_type: str
    outcome: str
    timestamp: str
    trust_delta: float
    collaboration_quality: float


class GraphNode(BaseModel):
    id: str
    type: NodeType
    label: str
    data: Dict[str, Any]
    position: Optional[Dict[str, float]] = None


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: EdgeType
    label: str
    weight: float = 1.0


class EcosystemGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class AgentOutput(BaseModel):
    agent_name: str
    status: AgentStatus
    output: Dict[str, Any]
    reasoning: str
    execution_time_ms: int
    timestamp: str


class OrchestrationRequest(BaseModel):
    query: str
    startup_profile: Optional[StartupProfile] = None
    context: Optional[Dict[str, Any]] = None


class OrchestrationResult(BaseModel):
    orchestration_id: str
    query: str
    startup_analysis: Optional[StartupAnalysis] = None
    mentor_matches: List[MentorMatch] = []
    programme_recommendations: List[ProgrammeRecommendation] = []
    governance_alerts: List[GovernanceAlert] = []
    ecosystem_memory: List[EcosystemMemory] = []
    ecosystem_graph: Optional[EcosystemGraph] = None
    agent_outputs: List[AgentOutput] = []
    master_reasoning: str = ""
    ecosystem_health_score: float = 0.0
    total_execution_time_ms: int = 0
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class HealthResponse(BaseModel):
    status: str
    version: str
    agents: List[str]
    timestamp: str
