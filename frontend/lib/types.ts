export type AgentStatus = "pending" | "running" | "completed" | "failed";

export type NodeType = "startup" | "mentor" | "investor" | "programme" | "agency" | "university";

export type EdgeType =
  | "MATCHED_WITH"
  | "ELIGIBLE_FOR"
  | "FUNDED_BY"
  | "CONNECTED_TO"
  | "SUPPORTED_BY"
  | "MENTORED_BY";

export interface StartupProfile {
  id: string;
  name: string;
  industry: string;
  stage: string;
  description: string;
  target_markets: string[];
  tech_stack: string[];
  funding_raised?: number;
  team_size: number;
  founded_year: number;
}

export interface AgentOutput {
  agent_name: string;
  status: AgentStatus;
  output: Record<string, unknown>;
  reasoning: string;
  execution_time_ms: number;
  timestamp: string;
}

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  data: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label: string;
  weight: number;
}

export interface EcosystemGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GovernanceAlert {
  alert_id: string;
  type: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  affected_entities: string[];
  recommendation: string;
  impact_score: number;
}

export interface OrchestrationResult {
  orchestration_id: string;
  query: string;
  agent_outputs: AgentOutput[];
  ecosystem_graph?: EcosystemGraph;
  master_reasoning: string;
  ecosystem_health_score: number;
  total_execution_time_ms: number;
  timestamp: string;
}

export interface OrchestrationRequest {
  query: string;
  startup_profile?: StartupProfile;
  context?: Record<string, unknown>;
}

export interface EcosystemMetrics {
  total_startups: number;
  active_mentors: number;
  programmes_available: number;
  connections_formed: number;
  grants_disbursed: number;
  successful_exits: number;
}
