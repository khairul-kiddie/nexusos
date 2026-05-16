from fastapi import APIRouter, HTTPException
from app.models.schemas import OrchestrationRequest, OrchestrationResult
from app.agents.orchestrator import MasterOrchestrator

router = APIRouter()
orchestrator = MasterOrchestrator()


@router.post("/orchestrate", response_model=OrchestrationResult)
async def orchestrate(request: OrchestrationRequest):
    try:
        result = await orchestrator.orchestrate({
            "query": request.query,
            "startup_profile": request.startup_profile.model_dump() if request.startup_profile else None,
            "context": request.context or {},
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
