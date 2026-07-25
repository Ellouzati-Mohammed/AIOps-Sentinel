from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import HDFSTemplate


router = APIRouter(
    prefix="/api/hdfs/templates",
    tags=["HDFS Templates"]
)


# Dependency DB
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



# =====================================================
# GET ALL TEMPLATES
# =====================================================

@router.get("/")
def get_templates(
    db: Session = Depends(get_db)
):

    templates = db.query(
        HDFSTemplate
    ).all()


    return templates


# =====================================================
# GET TEMPLATE BY ID
# =====================================================

@router.get("/{id}")
def get_template_by_event(
    id: str,
    db: Session = Depends(get_db)
):

    template = db.query(
        HDFSTemplate
    ).filter(
        HDFSTemplate.id == id
    ).first()


    if template is None:

        raise HTTPException(
            status_code=404,
            detail="Template not found"
        )


    return template

# =====================================================
# GET TEMPLATE BY EVENT ID
# =====================================================

@router.get("/event/{event_id}")
def get_template_by_event(
    event_id: str,
    db: Session = Depends(get_db)
):

    template = db.query(
        HDFSTemplate
    ).filter(
        HDFSTemplate.event_id == event_id
    ).first()


    if template is None:

        raise HTTPException(
            status_code=404,
            detail="Template not found"
        )


    return template



# =====================================================
# IMPORT TEMPLATES
# =====================================================

@router.post("/import")
def import_templates(
    db: Session = Depends(get_db)
):

    import pandas as pd


    FILE_PATH = (
        ""
    )


    df = pd.read_csv(FILE_PATH)



    for _, row in df.iterrows():

        template = HDFSTemplate(

            event_id=row["EventId"],

            template=row["EventTemplate"]

        )


        db.add(template)



    db.commit()


    return {
        "message": "Templates imported successfully",
        "count": len(df)
    }