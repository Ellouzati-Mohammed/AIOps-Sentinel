from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/logs", tags=["logs"])


class LogEvent(BaseModel):
    message: str


@router.post("")
async def receive_logs(logs: list[LogEvent]):

    print(f"Batch reçu : {len(logs)} logs")

    return {
        "status": "received",
        "count": len(logs)
    }