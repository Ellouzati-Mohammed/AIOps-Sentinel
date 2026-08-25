from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Model


router = APIRouter(
    prefix="/api/models",
    tags=["models"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def to_dict(instance: Model) -> dict[str, Any]:
    return {
        column.name: getattr(instance, column.name)
        for column in instance.__table__.columns
    }


def payload_to_dict(payload: BaseModel, exclude_unset: bool = False) -> dict[str, Any]:
    if hasattr(payload, "model_dump"):
        return payload.model_dump(exclude_unset=exclude_unset)
    return payload.dict(exclude_unset=exclude_unset)


class ModelCreate(BaseModel):
    name: str
    version: str | None = None
    description: str | None = None
    model_type: str
    framework: str | None = None
    model_path: str
    input_features: list[str] | None = None
    threshold: float | None = None
    is_active: bool = True


class ModelUpdate(BaseModel):
    name: str | None = None
    version: str | None = None
    description: str | None = None
    model_type: str | None = None
    framework: str | None = None
    model_path: str | None = None
    input_features: list[str] | None = None
    threshold: float | None = None
    is_active: bool | None = None


@router.post("")
def create_model(payload: ModelCreate, db: Session = Depends(get_db)):
    db_item = Model(**payload_to_dict(payload))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return to_dict(db_item)


@router.get("")
def list_models(db: Session = Depends(get_db)):
    items = db.query(Model).all()
    return [to_dict(item) for item in items]


@router.get("/{model_id}")
def get_model(model_id: int, db: Session = Depends(get_db)):
    item = db.query(Model).filter(Model.id == model_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Model not found")
    return to_dict(item)


@router.put("/{model_id}")
def update_model(model_id: int, payload: ModelUpdate, db: Session = Depends(get_db)):
    item = db.query(Model).filter(Model.id == model_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Model not found")

    update_data = payload_to_dict(payload, exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return to_dict(item)


@router.delete("/{model_id}")
def delete_model(model_id: int, db: Session = Depends(get_db)):
    item = db.query(Model).filter(Model.id == model_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Model not found")

    db.delete(item)
    db.commit()

    return {"status": "deleted", "id": model_id}
