from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import SystemMetrics


router = APIRouter(
    prefix="/api/system-metrics",
    tags=["system_metrics"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def to_dict(instance: SystemMetrics) -> dict[str, Any]:
    return {
        column.name: getattr(instance, column.name)
        for column in instance.__table__.columns
    }


def payload_to_dict(payload: BaseModel, exclude_unset: bool = False) -> dict[str, Any]:
    if hasattr(payload, "model_dump"):
        return payload.model_dump(exclude_unset=exclude_unset)
    return payload.dict(exclude_unset=exclude_unset)


class SystemMetricsCreate(BaseModel):
    logs_received: int = 0
    logs_processed: int = 0
    logs_invalid: int = 0
    blocks_active: int = 0
    blocks_completed: int = 0
    normal_predictions: int = 0
    anomaly_predictions: int = 0
    total_predictions: int = 0
    anomaly_rate: float = 0.0
    normal_rate: float = 0.0
    avg_score: float | None = None
    max_score: float | None = None
    min_score: float | None = None
    avg_block_duration: float | None = None
    max_block_duration: float | None = None
    min_block_duration: float | None = None
    avg_events_per_block: float | None = None
    max_events_per_block: int | None = None
    info_logs: int = 0
    warn_logs: int = 0
    created_at: datetime | None = None


class SystemMetricsUpdate(BaseModel):
    logs_received: int | None = None
    logs_processed: int | None = None
    logs_invalid: int | None = None
    blocks_active: int | None = None
    blocks_completed: int | None = None
    normal_predictions: int | None = None
    anomaly_predictions: int | None = None
    total_predictions: int | None = None
    anomaly_rate: float | None = None
    normal_rate: float | None = None
    avg_score: float | None = None
    max_score: float | None = None
    min_score: float | None = None
    avg_block_duration: float | None = None
    max_block_duration: float | None = None
    min_block_duration: float | None = None
    avg_events_per_block: float | None = None
    max_events_per_block: int | None = None
    info_logs: int | None = None
    warn_logs: int | None = None
    created_at: datetime | None = None


@router.post("")
def create_system_metrics(payload: SystemMetricsCreate, db: Session = Depends(get_db)):
    db_item = SystemMetrics(**payload_to_dict(payload, exclude_unset=True))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return to_dict(db_item)


@router.get("")
def list_system_metrics(db: Session = Depends(get_db)):
    items = db.query(SystemMetrics).all()
    return [to_dict(item) for item in items]


@router.get("/{metrics_id}")
def get_system_metrics(metrics_id: int, db: Session = Depends(get_db)):
    item = db.query(SystemMetrics).filter(SystemMetrics.id == metrics_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="System metrics not found")
    return to_dict(item)


@router.put("/{metrics_id}")
def update_system_metrics(metrics_id: int, payload: SystemMetricsUpdate, db: Session = Depends(get_db)):
    item = db.query(SystemMetrics).filter(SystemMetrics.id == metrics_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="System metrics not found")

    update_data = payload_to_dict(payload, exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return to_dict(item)


@router.delete("/{metrics_id}")
def delete_system_metrics(metrics_id: int, db: Session = Depends(get_db)):
    item = db.query(SystemMetrics).filter(SystemMetrics.id == metrics_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="System metrics not found")

    db.delete(item)
    db.commit()

    return {"status": "deleted", "id": metrics_id}
