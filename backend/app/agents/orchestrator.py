import asyncio
import uuid
from datetime import datetime
from typing import Any, Dict, List
from app.agents.startup_agent import StartupIntelligenceAgent
from app.agents.mentor_agent import MentorIntelligenceAgent
from app.agents.programme_agent import ProgrammeIntelligenceAgent
from app.agents.memory_agent import RelationshipMemoryAgent
from app.agents.governance_agent import GovernanceAgent
from app.models.schemas import (
    OrchestrationResult, AgentOutput, AgentStatus,
    EcosystemGraph, GraphNode, GraphEdge, NodeType, EdgeType
)
from app.data.mock_data import (
    DEMO_STARTUP, GRAPH_NODES_TEMPLATE, GRAPH_EDGES_TEMPLATE
)
from app.services.gemini_service import gemini_service


class MasterOrchestrator:
    def __init__(self):
        self.startup_agent = StartupIntelligenceAgent()
        self.mentor_agent = MentorIntelligenceAgent()
        self.programme_agent = ProgrammeIntelligenceAgent()
        self.memory_agent = RelationshipMemoryAgent()
        self.governance_agent = GovernanceAgent()

    async def orchestrate(self, request: Dict[str, Any]) -> OrchestrationResult:
        orchestration_id = str(uuid.uuid4())
        start_time = datetime.utcnow()

        startup_profile = request.get("startup_profile", DEMO_STARTUP.model_dump())
        query = request.get("query", "Find ecosystem support for an AI healthcare startup expanding into Indonesia.")

        context = {
            "startup_profile": startup_profile,
            "query": query,
            "orchestration_id": orchestration_id,
        }

        # Phase 1: Memory retrieval runs first to inform other agents
        memory_output = await self.memory_agent.execute(context)

        # Phase 2: Parallel analysis — startup, governance (independent)
        startup_output, governance_output = await asyncio.gather(
            self.startup_agent.execute(context),
            self.governance_agent.execute(context),
        )

        # Phase 3: Mentor and programme matching use startup analysis context
        enriched_context = {
            **context,
            "startup_analysis": startup_output.output,
            "ecosystem_memory": memory_output.output,
        }
        mentor_output, programme_output = await asyncio.gather(
            self.mentor_agent.execute(enriched_context),
            self.programme_agent.execute(enriched_context),
        )

        # Phase 4: Generate master reasoning
        master_reasoning = await self._generate_master_reasoning(
            query, startup_output, mentor_output, programme_output,
            memory_output, governance_output
        )

        # Build ecosystem graph
        ecosystem_graph = self._build_ecosystem_graph()

        # Compute health score
        health_score = governance_output.output.get("ecosystem_health_score", 72.4)

        total_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        return OrchestrationResult(
            orchestration_id=orchestration_id,
            query=query,
            agent_outputs=[
                memory_output,
                startup_output,
                governance_output,
                mentor_output,
                programme_output,
            ],
            ecosystem_graph=ecosystem_graph,
            master_reasoning=master_reasoning,
            ecosystem_health_score=health_score,
            total_execution_time_ms=total_time,
        )

    async def _generate_master_reasoning(
        self,
        query: str,
        startup_out: AgentOutput,
        mentor_out: AgentOutput,
        programme_out: AgentOutput,
        memory_out: AgentOutput,
        governance_out: AgentOutput,
    ) -> str:
        fallback = (
            "## NexusOS Master Intelligence Report\n\n"
            "**Query:** Find ecosystem support for an AI healthcare startup expanding into Indonesia.\n\n"
            "### Executive Summary\n"
            "HealthAI Solutions is well-positioned for Indonesia market entry with a readiness score of 78.5/100. "
            "The NexusOS orchestration has identified a comprehensive support pathway combining mentorship, grants, "
            "and government programmes that collectively address all major expansion risks.\n\n"
            "### Strategic Orchestration\n"
            "**Phase 1 — Immediate (0-60 days):** Engage Ahmad Fauzi for BPOM pre-submission consultation. "
            "Apply for MaGIC Global Accelerator (deadline: Aug 15). This dual-track de-risks the regulatory "
            "timeline while building the Indonesia network in parallel.\n\n"
            "**Phase 2 — Foundation (60-180 days):** Submit MDEC GAIN Grant application with clinical outcome "
            "data. Initiate Kemenkes relationship through Ahmad Fauzi. Begin hospital partnership sequencing "
            "using Dr. Chen's proven methodology.\n\n"
            "**Phase 3 — Market Entry (180-365 days):** Apply for Indonesia Digital Health Initiative programme. "
            "Launch pilot with 2-3 private hospital groups. Prepare Series A fundraising materials with "
            "Priya Menon's guidance.\n\n"
            "### Ecosystem Memory Intelligence\n"
            "Historical analysis of 3 similar companies confirms this playbook. Most critical insight: "
            "Ahmad Fauzi's BPOM pre-consultation approach saves an average of 7 months in regulatory approval. "
            "HealthAI's FHIR/HL7 expertise is a rare differentiator that accelerates hospital procurement.\n\n"
            "### Risk Mitigation\n"
            "Primary risk (BPOM timeline) is mitigated by immediate Fauzi engagement. "
            "Secondary risk (PDP Law compliance) addressed through UI Jakarta research partnership. "
            "Governance note: Dr. Chen is at mentor capacity — early engagement recommended before waitlist forms.\n\n"
            "### Funding Pathway\n"
            "Total non-dilutive funding available: MYR 1.15M across 4 programmes. "
            "Recommended sequence prevents grant stacking conflicts and maximises approval probability. "
            "Combined with Series A trajectory (projected 12-18 months), HealthAI has a clear 24-month runway strategy.\n\n"
            "**Ecosystem Confidence Score: 87.3%**"
        )

        reasoning = await gemini_service.generate_reasoning(
            prompt=f"""You are the Master Orchestrator in NexusOS AI Operating System.
Synthesize the outputs of all 5 specialist agents into a coherent strategic briefing.

Query: {query}
Startup Analysis: {startup_out.output.get('reasoning', '')}
Mentor Matches: {mentor_out.output.get('reasoning', '')}
Programmes: {programme_out.output.get('reasoning', '')}
Ecosystem Memory: {memory_out.output.get('reasoning', '')}
Governance: {governance_out.output.get('reasoning', '')}

Generate a structured master intelligence report with: Executive Summary, Strategic Orchestration (3 phases),
Ecosystem Memory Intelligence, Risk Mitigation, Funding Pathway, and overall Ecosystem Confidence Score.
Be specific, actionable, and reference the concrete data from each agent.""",
            fallback_reasoning=fallback,
        )
        return reasoning

    def _build_ecosystem_graph(self) -> EcosystemGraph:
        nodes = []
        for n in GRAPH_NODES_TEMPLATE:
            nodes.append(GraphNode(
                id=n["id"],
                type=NodeType(n["type"]),
                label=n["label"],
                data={"type": n["type"]},
                position={"x": float(n["x"]), "y": float(n["y"])},
            ))

        edges = []
        for e in GRAPH_EDGES_TEMPLATE:
            edges.append(GraphEdge(
                id=e["id"],
                source=e["source"],
                target=e["target"],
                type=EdgeType(e["type"]),
                label=e["type"].replace("_", " "),
                weight=e["weight"],
            ))

        return EcosystemGraph(nodes=nodes, edges=edges)
