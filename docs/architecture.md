# NexusOS Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 15)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Dashboard   │  │ Orchestrate  │  │  Graph  │  Governance  │ │
│  └──────────────┘  └──────┬───────┘  └─────────┴──────────────┘ │
│                           │ HTTP/REST                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                         FASTAPI BACKEND                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Master Orchestrator                        │ │
│  │  (LangGraph-style multi-agent coordination)                  │ │
│  └──┬──────────┬────────────┬──────────┬──────────┬────────────┘ │
│     │          │            │          │          │              │
│  ┌──▼──┐ ┌────▼───┐ ┌──────▼──┐ ┌────▼──┐ ┌────▼──────────┐  │
│  │Start│ │ Mentor │ │Programme│ │Memory │ │  Governance   │  │
│  │Agent│ │ Agent  │ │  Agent  │ │ Agent │ │    Agent      │  │
│  └──┬──┘ └────┬───┘ └──────┬──┘ └────┬──┘ └────┬──────────┘  │
│     └─────────┴────────────┴─────────┴─────────┘              │
│                            │                                    │
│  ┌─────────────────────────▼────────────────────────────────┐  │
│  │                   Gemini Service                          │  │
│  │  (Abstraction layer: real API or deterministic fallback)  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐  ┌─────────▼──────┐  ┌────────▼───────┐
│  PostgreSQL   │  │     Neo4j      │  │  Gemini API    │
│  (Schema)     │  │  (Graph DB)    │  │  (AI Layer)    │
└──────────────┘  └────────────────┘  └────────────────┘
```

## Orchestration Flow

```
Query Input
    │
    ▼
┌─────────────────┐
│ Phase 1: Memory │ ← Retrieve historical collaboration data
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Phase 2: Parallel Analysis           │
│   ├── Startup Intelligence Agent     │
│   └── Governance Agent               │
└────────────────────┬─────────────────┘
                     │
                     ▼
┌──────────────────────────────────────┐
│ Phase 3: Parallel Matching           │
│   ├── Mentor Intelligence Agent      │
│   └── Programme Intelligence Agent  │
└────────────────────┬─────────────────┘
                     │
                     ▼
┌─────────────────────────┐
│ Phase 4: Synthesis      │
│   Master Orchestrator   │ ← Aggregates all outputs
└─────────────────────────┘
                     │
                     ▼
            Structured Result
            (JSON + Graph)
```

## Data Model

### PostgreSQL (Relational)
```sql
users (id, email, role, created_at)
startups (id, name, industry, stage, profile_json)
programmes (id, name, type, provider, funding_amount)
orchestration_logs (id, query, result_json, execution_ms, created_at)
recommendations (id, orchestration_id, entity_type, entity_id, score)
governance_reports (id, health_score, alerts_json, created_at)
```

### Neo4j (Graph)
```cypher
(:Startup)-[:MATCHED_WITH {score: 0.96}]->(:Mentor)
(:Startup)-[:ELIGIBLE_FOR {score: 0.95}]->(:Programme)
(:Programme)-[:SUPPORTED_BY]->(:Agency)
(:Mentor)-[:CONNECTED_TO]->(:Investor)
(:Startup)-[:CONNECTED_TO]->(:University)
(:Mentor)-[:MENTORED {quality: 0.92}]->(:Startup)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | System health check |
| POST | /api/orchestrate | Run full orchestration |
| POST | /api/demo | Run pre-configured demo |
| GET | /api/demo/startup | Get demo startup profile |
| GET | /api/demo/query | Get demo query |
| GET | /docs | Swagger UI |

## Agent Execution Timing (Demo)

| Phase | Agent | Duration |
|-------|-------|----------|
| 1 | Relationship Memory | ~520ms |
| 2a | Startup Intelligence | ~890ms |
| 2b | Governance | ~640ms |
| 3a | Mentor Intelligence | ~720ms |
| 3b | Programme Intelligence | ~670ms |
| 4 | Master Orchestrator | ~400ms |
| **Total** | | **~3.8s** |

## Frontend Component Architecture

```
app/
├── layout.tsx              # Root layout with Sidebar
├── page.tsx                # Dashboard
├── orchestrate/page.tsx    # Orchestration Command Center
├── graph/page.tsx          # Ecosystem Graph (dynamic import)
└── governance/page.tsx     # Governance Dashboard

components/
├── layout/
│   └── Sidebar.tsx         # Navigation + live metrics
├── ui/
│   ├── MetricCard.tsx      # Animated counter cards
│   ├── Badge.tsx           # Status badges
│   └── Button.tsx          # Consistent button component
├── orchestration/
│   ├── AgentCard.tsx       # Agent status with animations
│   ├── ActivityFeed.tsx    # Live event stream
│   └── ReasoningPanel.tsx  # Explainable AI output
└── graph/
    └── EcosystemGraph.tsx  # React Flow canvas (SSR-disabled)
```

## Gemini Prompt Architecture

Each agent has:
1. **System prompt** — role definition and task scope
2. **User prompt** — dynamic context injection
3. **Fallback data** — deterministic response when API unavailable
4. **Structured output** — JSON schema enforced via `response_mime_type`

## Security Notes

- CORS configured for local development (restrict in production)
- No authentication implemented (hackathon scope)
- API keys via environment variables only
- No user data persisted in demo mode
