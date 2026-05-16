import type { OrchestrationResult, EcosystemMetrics } from "./types";

export const DEMO_METRICS: EcosystemMetrics = {
  total_startups: 247,
  active_mentors: 89,
  programmes_available: 34,
  connections_formed: 1847,
  grants_disbursed: 62,
  successful_exits: 14,
};

export const DEMO_QUERY = "Find ecosystem support for an AI healthcare startup expanding into Indonesia.";

export const DEMO_RESULT: OrchestrationResult = {
  orchestration_id: "orch-demo-001",
  query: DEMO_QUERY,
  ecosystem_health_score: 72.4,
  total_execution_time_ms: 3847,
  timestamp: new Date().toISOString(),
  master_reasoning: `## NexusOS Master Intelligence Report

**Query:** Find ecosystem support for an AI healthcare startup expanding into Indonesia.

### Executive Summary
HealthAI Solutions is well-positioned for Indonesia market entry with a readiness score of 78.5/100. The NexusOS orchestration has identified a comprehensive support pathway combining mentorship, grants, and government programmes that collectively address all major expansion risks.

### Strategic Orchestration
**Phase 1 — Immediate (0-60 days):** Engage Ahmad Fauzi for BPOM pre-submission consultation. Apply for MaGIC Global Accelerator (deadline: Aug 15). This dual-track de-risks the regulatory timeline while building the Indonesia network in parallel.

**Phase 2 — Foundation (60-180 days):** Submit MDEC GAIN Grant application with clinical outcome data. Initiate Kemenkes relationship through Ahmad Fauzi. Begin hospital partnership sequencing using Dr. Chen's proven methodology.

**Phase 3 — Market Entry (180-365 days):** Apply for Indonesia Digital Health Initiative programme. Launch pilot with 2-3 private hospital groups. Prepare Series A fundraising materials with Priya Menon's guidance.

### Ecosystem Memory Intelligence
Historical analysis of 3 similar companies confirms this playbook. Most critical insight: Ahmad Fauzi's BPOM pre-consultation approach saves an average of 7 months in regulatory approval. HealthAI's FHIR/HL7 expertise is a rare differentiator that accelerates hospital procurement.

### Risk Mitigation
Primary risk (BPOM timeline) is mitigated by immediate Fauzi engagement. Secondary risk (PDP Law compliance) addressed through UI Jakarta research partnership. Governance note: Dr. Chen is at mentor capacity — early engagement recommended before waitlist forms.

### Funding Pathway
Total non-dilutive funding available: MYR 1.15M across 4 programmes. Recommended sequence prevents grant stacking conflicts and maximises approval probability. Combined with Series A trajectory (projected 12-18 months), HealthAI has a clear 24-month runway strategy.

**Ecosystem Confidence Score: 87.3%**`,
  agent_outputs: [
    {
      agent_name: "Relationship Memory Agent",
      status: "completed",
      output: { memory_confidence: 0.93 },
      reasoning: "Retrieved 4 highly relevant historical precedents with 93% confidence",
      execution_time_ms: 521,
      timestamp: new Date().toISOString(),
    },
    {
      agent_name: "Startup Intelligence Agent",
      status: "completed",
      output: { readiness_score: 78.5 },
      reasoning: "Startup demonstrates strong PMF with 40% error reduction. Indonesia market is high-opportunity with regulatory challenges.",
      execution_time_ms: 892,
      timestamp: new Date().toISOString(),
    },
    {
      agent_name: "Governance Agent",
      status: "completed",
      output: { ecosystem_health_score: 72.4 },
      reasoning: "Ecosystem health at 72.4/100. Mentor overload risk detected. 4 governance alerts generated.",
      execution_time_ms: 644,
      timestamp: new Date().toISOString(),
    },
    {
      agent_name: "Mentor Intelligence Agent",
      status: "completed",
      output: { mentors_matched: 3 },
      reasoning: "Top 3 mentors provide complementary coverage: strategy, regulatory, and capital.",
      execution_time_ms: 718,
      timestamp: new Date().toISOString(),
    },
    {
      agent_name: "Programme Intelligence Agent",
      status: "completed",
      output: { total_available_funding: 1150000 },
      reasoning: "MYR 1.15M in non-dilutive funding identified across 4 programmes with sequenced application strategy.",
      execution_time_ms: 672,
      timestamp: new Date().toISOString(),
    },
  ],
  ecosystem_graph: {
    nodes: [
      { id: "startup-healthai-001", type: "startup", label: "HealthAI Solutions", data: { type: "startup" }, position: { x: 400, y: 300 } },
      { id: "mentor-001", type: "mentor", label: "Dr. Sarah Chen", data: { type: "mentor" }, position: { x: 700, y: 150 } },
      { id: "mentor-002", type: "mentor", label: "Ahmad Fauzi", data: { type: "mentor" }, position: { x: 700, y: 300 } },
      { id: "mentor-003", type: "mentor", label: "Priya Menon", data: { type: "mentor" }, position: { x: 700, y: 450 } },
      { id: "prog-001", type: "programme", label: "MDEC GAIN Grant", data: { type: "programme" }, position: { x: 150, y: 150 } },
      { id: "prog-002", type: "programme", label: "MaGIC Accelerator", data: { type: "programme" }, position: { x: 150, y: 280 } },
      { id: "prog-004", type: "programme", label: "Indonesia Digital Health", data: { type: "programme" }, position: { x: 150, y: 420 } },
      { id: "agency-001", type: "agency", label: "MDEC", data: { type: "agency" }, position: { x: -50, y: 100 } },
      { id: "agency-002", type: "agency", label: "Kemenkes Indonesia", data: { type: "agency" }, position: { x: -50, y: 350 } },
      { id: "agency-003", type: "agency", label: "MaGIC", data: { type: "agency" }, position: { x: -50, y: 230 } },
      { id: "investor-001", type: "investor", label: "Openspace Ventures", data: { type: "investor" }, position: { x: 930, y: 200 } },
      { id: "investor-002", type: "investor", label: "KV Asia Capital", data: { type: "investor" }, position: { x: 930, y: 380 } },
      { id: "uni-001", type: "university", label: "Universiti Malaya", data: { type: "university" }, position: { x: 400, y: 540 } },
      { id: "uni-002", type: "university", label: "UI Jakarta", data: { type: "university" }, position: { x: 200, y: 540 } },
    ],
    edges: [
      { id: "e1", source: "startup-healthai-001", target: "mentor-001", type: "MATCHED_WITH", label: "MATCHED WITH", weight: 0.96 },
      { id: "e2", source: "startup-healthai-001", target: "mentor-002", type: "MATCHED_WITH", label: "MATCHED WITH", weight: 0.91 },
      { id: "e3", source: "startup-healthai-001", target: "mentor-003", type: "MATCHED_WITH", label: "MATCHED WITH", weight: 0.88 },
      { id: "e4", source: "startup-healthai-001", target: "prog-001", type: "ELIGIBLE_FOR", label: "ELIGIBLE FOR", weight: 0.95 },
      { id: "e5", source: "startup-healthai-001", target: "prog-002", type: "ELIGIBLE_FOR", label: "ELIGIBLE FOR", weight: 0.87 },
      { id: "e6", source: "startup-healthai-001", target: "prog-004", type: "ELIGIBLE_FOR", label: "ELIGIBLE FOR", weight: 0.82 },
      { id: "e7", source: "prog-001", target: "agency-001", type: "SUPPORTED_BY", label: "SUPPORTED BY", weight: 1.0 },
      { id: "e8", source: "prog-004", target: "agency-002", type: "SUPPORTED_BY", label: "SUPPORTED BY", weight: 1.0 },
      { id: "e9", source: "prog-002", target: "agency-003", type: "SUPPORTED_BY", label: "SUPPORTED BY", weight: 1.0 },
      { id: "e10", source: "mentor-003", target: "investor-001", type: "CONNECTED_TO", label: "CONNECTED TO", weight: 0.85 },
      { id: "e11", source: "startup-healthai-001", target: "investor-002", type: "CONNECTED_TO", label: "CONNECTED TO", weight: 0.60 },
      { id: "e12", source: "startup-healthai-001", target: "uni-001", type: "CONNECTED_TO", label: "CONNECTED TO", weight: 0.72 },
      { id: "e13", source: "startup-healthai-001", target: "uni-002", type: "CONNECTED_TO", label: "CONNECTED TO", weight: 0.65 },
      { id: "e14", source: "mentor-002", target: "agency-002", type: "CONNECTED_TO", label: "CONNECTED TO", weight: 0.90 },
    ],
  },
};

export const ACTIVITY_FEED = [
  { id: 1, type: "match", message: "HealthAI Solutions matched with Dr. Sarah Chen (96% compatibility)", time: "2s ago", icon: "🧠" },
  { id: 2, type: "grant", message: "MDEC GAIN Grant eligibility confirmed — MYR 500K available", time: "5s ago", icon: "💰" },
  { id: 3, type: "memory", message: "Ecosystem memory retrieved: 3 similar successful expansions found", time: "8s ago", icon: "💾" },
  { id: 4, type: "alert", message: "Governance alert: BPOM regulatory timeline risk identified", time: "12s ago", icon: "⚠️" },
  { id: 5, type: "connection", message: "New edge created: Ahmad Fauzi → Kemenkes Indonesia pathway", time: "15s ago", icon: "🔗" },
  { id: 6, type: "programme", message: "MaGIC Global Accelerator deadline: 91 days remaining", time: "18s ago", icon: "🎯" },
  { id: 7, type: "insight", message: "Ahmad Fauzi BPOM pre-consultation saves avg 7 months", time: "22s ago", icon: "✨" },
  { id: 8, type: "graph", message: "Ecosystem graph updated: 14 nodes, 14 edges rendered", time: "25s ago", icon: "🕸️" },
];
