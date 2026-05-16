from fastapi import APIRouter
from datetime import datetime
from app.models.schemas import HealthResponse
from app.services.gemini_service import gemini_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="operational",
        version="1.0.0",
        agents=[
            "Startup Intelligence Agent",
            "Mentor Intelligence Agent",
            "Programme Intelligence Agent",
            "Relationship Memory Agent",
            "Governance Agent",
            "Master Orchestrator",
        ],
        timestamp=datetime.utcnow().isoformat(),
    )
