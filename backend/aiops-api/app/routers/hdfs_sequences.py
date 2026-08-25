from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
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
def list_hdfs_sequences(db: Session = Depends(get_db)):
    items = db.query(HDFSSequence).all()
    return [to_dict(item) for item in items]


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
