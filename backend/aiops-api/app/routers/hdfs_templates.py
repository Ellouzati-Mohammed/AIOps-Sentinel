from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import HDFSTemplate


router = APIRouter(
    prefix="/api/hdfs-templates",
    tags=["hdfs_templates"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def to_dict(instance: HDFSTemplate) -> dict[str, Any]:
    return {
        column.name: getattr(instance, column.name)
        for column in instance.__table__.columns
    }


def payload_to_dict(payload: BaseModel, exclude_unset: bool = False) -> dict[str, Any]:
    if hasattr(payload, "model_dump"):
        return payload.model_dump(exclude_unset=exclude_unset)
    return payload.dict(exclude_unset=exclude_unset)


class HDFSTemplateCreate(BaseModel):
    event_id: str
    template: str


class HDFSTemplateUpdate(BaseModel):
    event_id: str | None = None
    template: str | None = None


@router.post("")
def create_hdfs_template(payload: HDFSTemplateCreate, db: Session = Depends(get_db)):
    db_item = HDFSTemplate(**payload_to_dict(payload))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return to_dict(db_item)


@router.get("")
def list_hdfs_templates(
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    allowed_sort_fields = {
        "id": HDFSTemplate.id,
        "event_id": HDFSTemplate.event_id,
        "created_at": HDFSTemplate.created_at,
    }
    sort_column = allowed_sort_fields.get(sort_by, HDFSTemplate.created_at)
    items = db.query(HDFSTemplate).order_by(
        sort_column.asc() if sort_order == "asc" else sort_column.desc(),
        HDFSTemplate.id.desc(),
    ).all()
    return [to_dict(item) for item in items]


@router.get("/{template_id}")
def get_hdfs_template(template_id: int, db: Session = Depends(get_db)):
    item = db.query(HDFSTemplate).filter(HDFSTemplate.id == template_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="HDFS template not found")
    return to_dict(item)


@router.put("/{template_id}")
def update_hdfs_template(template_id: int, payload: HDFSTemplateUpdate, db: Session = Depends(get_db)):
    item = db.query(HDFSTemplate).filter(HDFSTemplate.id == template_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="HDFS template not found")

    update_data = payload_to_dict(payload, exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return to_dict(item)


@router.delete("/{template_id}")
def delete_hdfs_template(template_id: int, db: Session = Depends(get_db)):
    item = db.query(HDFSTemplate).filter(HDFSTemplate.id == template_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="HDFS template not found")

    db.delete(item)
    db.commit()

    return {"status": "deleted", "id": template_id}
