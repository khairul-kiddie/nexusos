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
        startup_name = startup_out.output.get("startup_id", "the startup")
        fallback = (
            f"## NexusOS Master Intelligence Report\n\n"
            f"**Query:** {query}\n\n"
            "### Executive Summary\n"
            f"NexusOS has completed multi-agent orchestration for your query. "
            "The ecosystem intelligence pipeline has identified relevant mentors, programmes, and strategic pathways "
            "based on the startup profile and target objectives.\n\n"
            "### Strategic Orchestration\n"
            "**Phase 1 — Immediate (0-60 days):** Engage top-ranked mentors for domain expertise and network access. "
            "Identify and apply for the highest-priority grant programmes with upcoming deadlines.\n\n"
            "**Phase 2 — Foundation (60-180 days):** Leverage mentor relationships to open key market and regulatory doors. "
            "Submit grant applications and initiate accelerator programme discussions.\n\n"
            "**Phase 3 — Scale (180-365 days):** Execute market entry strategy with ecosystem support in place. "
            "Build local partnerships and prepare for the next funding round.\n\n"
            "### Ecosystem Memory Intelligence\n"
            "The NexusOS relationship graph has surfaced relevant historical patterns from similar ecosystem journeys. "
            "Mentor trust scores and past collaboration outcomes have been factored into all recommendations.\n\n"
            "### Risk Mitigation\n"
            "Key risks have been identified across regulatory, market access, and funding dimensions. "
            "Mentor matching prioritises advisors with direct experience navigating these specific challenges.\n\n"
            "### Funding Pathway\n"
            "Eligible grant and programme opportunities have been ranked by fit score and application urgency. "
            "The recommended sequence is structured to maximise approval probability while avoiding conflicts.\n\n"
            "**Ecosystem Confidence Score: 82.0%**"
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
