# NexusOS — AI Operating System for Innovation Ecosystems

> **Automating ecosystem linkages instead of manual coordination.**

[![Status](https://img.shields.io/badge/status-hackathon--ready-brightgreen)]()
[![Stack](https://img.shields.io/badge/stack-Next.js%2015%20%2B%20FastAPI%20%2B%20Gemini-blue)]()
[![Agents](https://img.shields.io/badge/agents-6%20active-purple)]()

---

## What is NexusOS?

NexusOS is an AI-powered operating system for innovation ecosystems. It replaces months of manual coordination between **startups, mentors, investors, government agencies, universities, and accelerators** with seconds of intelligent multi-agent orchestration.

**Core Demo:** *"Find ecosystem support for an AI healthcare startup expanding into Indonesia."*

In ~4 seconds, 6 AI agents analyze, match, and synthesize:
- Startup readiness score: **78.5/100**
- 3 mentor matches with **87–96% compatibility**
- **MYR 1.15M** in non-dilutive funding identified
- 4 governance alerts surfaced
- Full ecosystem graph with 14 nodes, 14 edges

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, Framer Motion, React Flow |
| Backend | FastAPI, Python 3.11, Pydantic v2 |
| AI | Google Gemini 2.5 Pro, Multi-agent orchestration |
| Graph | React Flow (UI), Neo4j-ready architecture |
| Database | PostgreSQL (schema-ready) |
| Infra | Docker, docker-compose |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- (Optional) Google Gemini API key

### 1. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add GEMINI_API_KEY to .env (optional — works without it)
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### 3. Docker (Full Stack)
```bash
cp backend/.env.example .env
docker-compose up --build
```

### Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Neo4j Browser:** http://localhost:7474

---

## Project Structure

```
nexusos/
├── frontend/              # Next.js 15 app
│   ├── app/
│   │   ├── page.tsx       # Dashboard
│   │   ├── orchestrate/   # Orchestration Command Center
│   │   ├── graph/         # Ecosystem Graph
│   │   └── governance/    # Governance Dashboard
│   ├── components/
│   │   ├── graph/         # React Flow ecosystem graph
│   │   ├── orchestration/ # Agent cards, activity feed, reasoning
│   │   └── ui/            # Shared UI components
│   └── lib/               # Types, API client, utilities
├── backend/               # FastAPI app
│   └── app/
│       ├── agents/        # 6 AI agents
│       ├── services/      # Gemini abstraction
│       ├── data/          # Mock data
│       └── api/routes/    # REST endpoints
├── docs/                  # Documentation
└── docker-compose.yml
```

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Ecosystem metrics, quick navigation, live activity |
| Orchestration | `/orchestrate` | Multi-agent command center with live execution |
| Graph | `/graph` | Interactive ecosystem relationship graph |
| Governance | `/governance` | Health monitoring, alerts, sector coverage |

---

## Agent Architecture

### 1. Startup Intelligence Agent
Analyzes startup profiles → readiness score, market readiness, strategic pathways.

### 2. Mentor Intelligence Agent
Trust-weighted matching → ranked mentors with compatibility reasoning.

### 3. Programme Intelligence Agent
Grant discovery → eligibility scoring, funding sequence planning.

### 4. Relationship Memory Agent ⭐ Key Innovation
Ecosystem memory → historical collaboration patterns, trust trajectories, proven playbooks.

### 5. Governance Agent
Ecosystem monitoring → mentor overload detection, sector gaps, bottlenecks.

### 6. Master Orchestrator
LangGraph-style coordination → aggregates all agents into master intelligence report.

---

## Gemini Integration

When `GEMINI_API_KEY` is set:
- Uses Gemini 2.5 Pro with structured JSON outputs
- Each agent gets purpose-built prompts
- Responses are validated and typed

When no API key:
- Falls back to deterministic, high-quality demo data
- Same interface, same structure
- Fully functional for demos

---

## Demo Flow

1. Navigate to `/orchestrate`
2. The demo query is pre-filled: *"Find ecosystem support for an AI healthcare startup expanding into Indonesia."*
3. Click **Run**
4. Watch 6 agents execute in sequence with live animations
5. Review mentor matches, programme recommendations, and master reasoning
6. Visit `/graph` to explore the ecosystem relationship graph
7. Visit `/governance` to review ecosystem health alerts

---

## Key Design Decisions

- **No black-box outputs**: Every recommendation includes explicit reasoning
- **Ecosystem memory**: Historical collaboration data informs current recommendations
- **Trust-weighted matching**: Mentor scores reflect verified collaboration quality
- **Neo4j-ready**: Graph architecture mirrors Neo4j schema for production deployment
- **Graceful degradation**: Works without API keys or databases for demo purposes

---

## Hackathon Pitch

> "Today, a startup founder spends 3-6 months finding the right mentor, grant, and government support — manually, through networks and luck.
>
> NexusOS does it in 4 seconds.
>
> Not just search. Not just recommendations. **Orchestration.**
>
> We don't just show you options — we show you the playbook, the sequence, the reasoning, and the ecosystem memory that proves it works."

---

*Built for Google Hackathon Malaysia 2025.*
