from fastapi import APIRouter
from app.models.schemas import OrchestrationResult
from app.agents.orchestrator import MasterOrchestrator
from app.data.mock_data import DEMO_STARTUP

router = APIRouter()
orchestrator = MasterOrchestrator()

DEMO_QUERY = "Find ecosystem support for an AI healthcare startup expanding into Indonesia."


@router.post("/demo", response_model=OrchestrationResult)
async def run_demo():
    """Run the pre-configured hackathon demo scenario."""
    return await orchestrator.orchestrate({
        "query": DEMO_QUERY,
        "startup_profile": DEMO_STARTUP.model_dump(),
        "context": {"demo_mode": True},
    })


@router.get("/demo/startup")
async def get_demo_startup():
    return DEMO_STARTUP.model_dump()


@router.get("/demo/query")
async def get_demo_query():
    return {"query": DEMO_QUERY}
