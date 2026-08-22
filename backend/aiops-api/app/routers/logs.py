from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path



router = APIRouter(prefix="/api/logs", tags=["logs"])

BASE_DIR = Path(__file__).resolve().parent.parent

TEMPLATE_FILE = (
    BASE_DIR
    / "data"
    / "event_templates_drain3.csv"
)



class LogEvent(BaseModel):
    message: str


@router.post("")
async def receive_logs(logs: list[LogEvent]):

    print(f"Batch reçu : {len(logs)} logs")

    return {
        "status": "received",
        "count": len(logs)
    }