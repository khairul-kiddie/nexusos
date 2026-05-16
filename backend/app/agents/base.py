import time
from abc import ABC, abstractmethod
from typing import Any, Dict
from datetime import datetime
from app.models.schemas import AgentOutput, AgentStatus
from app.services.gemini_service import gemini_service


class BaseAgent(ABC):
    name: str = "BaseAgent"

    async def execute(self, context: Dict[str, Any]) -> AgentOutput:
        start_time = time.time()
        try:
            output = await self.run(context)
            return AgentOutput(
                agent_name=self.name,
                status=AgentStatus.COMPLETED,
                output=output,
                reasoning=output.get("reasoning", ""),
                execution_time_ms=int((time.time() - start_time) * 1000),
                timestamp=datetime.utcnow().isoformat(),
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status=AgentStatus.FAILED,
                output={"error": str(e)},
                reasoning=f"Agent execution failed: {str(e)}",
                execution_time_ms=int((time.time() - start_time) * 1000),
                timestamp=datetime.utcnow().isoformat(),
            )

    @abstractmethod
    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @property
    def gemini(self):
        return gemini_service
