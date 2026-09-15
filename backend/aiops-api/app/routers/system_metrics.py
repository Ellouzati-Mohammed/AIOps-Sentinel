from datetime import date, datetime, time, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
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


@router.get("/history")
def get_system_metrics_history(
    hours: int = Query(24, gt=0, description="Number of hours to retrieve"),
    interval_hours: int = Query(
        2,
        gt=0,
        description="Keep one latest snapshot per interval",
    ),
    selected_date: date | None = Query(
        None,
        alias="date",
        description="Optional UTC date, format YYYY-MM-DD",
    ),
    db: Session = Depends(get_db),
):
    """Return one latest snapshot per interval for a date or rolling period."""
    if interval_hours > hours:
        raise HTTPException(
            status_code=400,
            detail="interval_hours must be less than or equal to hours",
        )

    if selected_date is not None:
        start_time = datetime.combine(selected_date, time.min)
        end_time = start_time + timedelta(days=1)
        reference_time = start_time
        items = (
            db.query(SystemMetrics)
            .filter(
                SystemMetrics.created_at >= start_time,
                SystemMetrics.created_at < end_time,
            )
            .order_by(SystemMetrics.created_at.desc(), SystemMetrics.id.desc())
            .all()
        )
    else:
        reference_time = datetime.utcnow()
        cutoff = reference_time - timedelta(hours=hours)
        items = (
            db.query(SystemMetrics)
            .filter(SystemMetrics.created_at >= cutoff)
            .order_by(SystemMetrics.created_at.desc(), SystemMetrics.id.desc())
            .all()
        )

    selected_items = {}
    for item in items:
        elapsed_hours = (reference_time - item.created_at).total_seconds() / 3600
        bucket = int(elapsed_hours // interval_hours) if selected_date is None else int((item.created_at - reference_time).total_seconds() / 3600 // interval_hours)
        if bucket not in selected_items:
            selected_items[bucket] = item

    return [
        to_dict(item)
        for _, item in sorted(
            selected_items.items(),
            key=lambda entry: entry[1].created_at,
        )
    ]


@router.get("/latest")
def get_latest_system_metrics(db: Session = Depends(get_db)):
    """Return the newest metrics snapshot stored in the database."""
    item = (
        db.query(SystemMetrics)
        .order_by(SystemMetrics.created_at.desc(), SystemMetrics.id.desc())
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="No system metrics found",
        )

    return to_dict(item)


@router.get("/aggregate")
def get_aggregated_system_metrics(
    selected_date: date | None = Query(
        None,
        alias="date",
        description="Optional UTC date to aggregate, format YYYY-MM-DD",
    ),
    db: Session = Depends(get_db),
):
    """Aggregate all snapshots, or only snapshots from one UTC calendar day."""
    query = db.query(SystemMetrics)
    if selected_date is not None:
        start_time = datetime.combine(selected_date, time.min)
        end_time = start_time + timedelta(days=1)
        query = query.filter(
            SystemMetrics.created_at >= start_time,
            SystemMetrics.created_at < end_time,
        )

    items = query.order_by(SystemMetrics.created_at.asc(), SystemMetrics.id.asc()).all()

    if not items:
        raise HTTPException(status_code=404, detail="No system metrics found")

    total_predictions = sum(item.total_predictions or 0 for item in items)
    normal_predictions = sum(item.normal_predictions or 0 for item in items)
    anomaly_predictions = sum(item.anomaly_predictions or 0 for item in items)
    blocks_completed = sum(item.blocks_completed or 0 for item in items)

    score_values = [item.avg_score for item in items if item.avg_score is not None]
    duration_values = [item.avg_block_duration for item in items if item.avg_block_duration is not None]
    events_values = [item.avg_events_per_block for item in items if item.avg_events_per_block is not None]
    score_weight = sum((item.total_predictions or 0) for item in items if item.avg_score is not None)
    block_weight = sum((item.blocks_completed or 0) for item in items)

    return {
        "id": None,
        "logs_received": sum(item.logs_received or 0 for item in items),
        "blocks_completed": blocks_completed,
        "normal_predictions": normal_predictions,
        "anomaly_predictions": anomaly_predictions,
        "total_predictions": total_predictions,
        "anomaly_rate": round(anomaly_predictions / total_predictions * 100, 2) if total_predictions else 0.0,
        "normal_rate": round(normal_predictions / total_predictions * 100, 2) if total_predictions else 0.0,
        "avg_score": round(sum(item.avg_score * (item.total_predictions or 0) for item in items if item.avg_score is not None) / score_weight, 4) if score_weight else None,
        "max_score": max((item.max_score for item in items if item.max_score is not None), default=None),
        "min_score": min((item.min_score for item in items if item.min_score is not None), default=None),
        "avg_block_duration": round(sum(item.avg_block_duration * (item.blocks_completed or 0) for item in items if item.avg_block_duration is not None) / block_weight, 3) if block_weight and duration_values else None,
        "max_block_duration": max((item.max_block_duration for item in items if item.max_block_duration is not None), default=None),
        "min_block_duration": min((item.min_block_duration for item in items if item.min_block_duration is not None), default=None),
        "avg_events_per_block": round(sum(item.avg_events_per_block * (item.blocks_completed or 0) for item in items if item.avg_events_per_block is not None) / block_weight, 2) if block_weight and events_values else None,
        "max_events_per_block": max((item.max_events_per_block for item in items if item.max_events_per_block is not None), default=None),
        "info_logs": sum(item.info_logs or 0 for item in items),
        "warn_logs": sum(item.warn_logs or 0 for item in items),
        "created_at": items[-1].created_at,
        "snapshots_count": len(items),
        "aggregated_date": selected_date.isoformat() if selected_date else None,
    }


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
