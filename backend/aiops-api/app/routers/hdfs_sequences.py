from datetime import datetime, timedelta
from math import ceil
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import HDFSSequence


router = APIRouter(
    prefix="/api/hdfs-sequences",
    tags=["hdfs_sequences"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def to_dict(instance: HDFSSequence) -> dict[str, Any]:
    return {
        column.name: getattr(instance, column.name)
        for column in instance.__table__.columns
    }


def payload_to_dict(payload: BaseModel, exclude_unset: bool = False) -> dict[str, Any]:
    if hasattr(payload, "model_dump"):
        return payload.model_dump(exclude_unset=exclude_unset)
    return payload.dict(exclude_unset=exclude_unset)


class HDFSSequenceCreate(BaseModel):
    block_id: str
    event_sequence: list[str]
    num_events: int
    duration: float
    num_info: int
    num_warn: int
    prediction: str
    score: float
    model_id: int
    completed_at: datetime | None = None


class HDFSSequenceUpdate(BaseModel):
    block_id: str | None = None
    event_sequence: list[str] | None = None
    num_events: int | None = None
    duration: float | None = None
    num_info: int | None = None
    num_warn: int | None = None
    prediction: str | None = None
    score: float | None = None
    model_id: int | None = None
    completed_at: datetime | None = None


@router.post("")
def create_hdfs_sequence(payload: HDFSSequenceCreate, db: Session = Depends(get_db)):
    db_item = HDFSSequence(**payload_to_dict(payload))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return to_dict(db_item)


@router.get("")
def list_hdfs_sequences(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    prediction: str | None = Query(None),
    sort_by: str = Query("completed_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    allowed_sort_fields = {
        "id": HDFSSequence.id,
        "block_id": HDFSSequence.block_id,
        "num_events": HDFSSequence.num_events,
        "duration": HDFSSequence.duration,
        "score": HDFSSequence.score,
        "model_id": HDFSSequence.model_id,
        "completed_at": HDFSSequence.completed_at,
        "created_at": HDFSSequence.created_at,
    }
    sort_column = allowed_sort_fields.get(sort_by, HDFSSequence.completed_at)
    query = db.query(HDFSSequence)
    if search and search.strip():
        query = query.filter(HDFSSequence.block_id.ilike(f"%{search.strip()}%"))
    if prediction and prediction != "All":
        query = query.filter(HDFSSequence.prediction == prediction.upper())

    total = query.count()
    items = (
        query.order_by(
            sort_column.asc() if sort_order == "asc" else sort_column.desc(),
            HDFSSequence.id.desc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": [to_dict(item) for item in items],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": ceil(total / page_size) if total else 0,
    }


@router.get("/anomalies/recent")
def list_recent_anomalies(
    hours: int = Query(24, gt=0),
    limit: int = Query(5, gt=0, le=100),
    db: Session = Depends(get_db),
):
    """Return the most recent anomalous HDFS blocks."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    items = (
        db.query(HDFSSequence)
        .filter(
            HDFSSequence.prediction == "ANOMALY",
            HDFSSequence.completed_at >= cutoff,
        )
        .order_by(HDFSSequence.completed_at.desc(), HDFSSequence.id.desc())
        .limit(limit)
        .all()
    )
    return [to_dict(item) for item in items]


@router.get("/prediction-stats")
def get_prediction_stats(db: Session = Depends(get_db)):
    """Return prediction totals and score buckets for the prediction page."""
    items = db.query(HDFSSequence.prediction, HDFSSequence.score).all()
    distribution = {
        "0.00-0.10": 0,
        "0.10-0.20": 0,
        "0.20-0.40": 0,
        "0.40-0.60": 0,
        "0.60-0.80": 0,
        "0.80-1.00": 0,
    }
    normal = 0
    anomaly = 0

    for prediction, score in items:
        if prediction == "NORMAL":
            normal += 1
        elif prediction == "ANOMALY":
            anomaly += 1

        if score < 0.10:
            distribution["0.00-0.10"] += 1
        elif score < 0.20:
            distribution["0.10-0.20"] += 1
        elif score < 0.40:
            distribution["0.20-0.40"] += 1
        elif score < 0.60:
            distribution["0.40-0.60"] += 1
        elif score < 0.80:
            distribution["0.60-0.80"] += 1
        else:
            distribution["0.80-1.00"] += 1

    return {
        "total_predictions": normal + anomaly,
        "normal_predictions": normal,
        "anomaly_predictions": anomaly,
        "score_distribution": [
            {"name": name, "value": value}
            for name, value in distribution.items()
        ],
    }


@router.get("/{sequence_id}")
def get_hdfs_sequence(sequence_id: int, db: Session = Depends(get_db)):
    item = db.query(HDFSSequence).filter(HDFSSequence.id == sequence_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="HDFS sequence not found")
    return to_dict(item)


@router.put("/{sequence_id}")
def update_hdfs_sequence(sequence_id: int, payload: HDFSSequenceUpdate, db: Session = Depends(get_db)):
    item = db.query(HDFSSequence).filter(HDFSSequence.id == sequence_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="HDFS sequence not found")

    update_data = payload_to_dict(payload, exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return to_dict(item)


@router.delete("/{sequence_id}")
def delete_hdfs_sequence(sequence_id: int, db: Session = Depends(get_db)):
    item = db.query(HDFSSequence).filter(HDFSSequence.id == sequence_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="HDFS sequence not found")

    db.delete(item)
    db.commit()

    return {"status": "deleted", "id": sequence_id}
