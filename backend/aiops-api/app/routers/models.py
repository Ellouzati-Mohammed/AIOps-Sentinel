from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import ModelInfo


router = APIRouter(
    prefix="/api/models",
    tags=["Models"]
)



def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



# =========================================
# GET ALL MODELS
# =========================================

@router.get("/")
def get_models(
    db: Session = Depends(get_db)
):

    models = db.query(
        ModelInfo
    ).all()


    return models



# =========================================
# GET MODEL BY ID
# =========================================

@router.get("/{id}")
def get_model(
    id: int,
    db: Session = Depends(get_db)
):

    model = db.query(
        ModelInfo
    ).filter(
        ModelInfo.id == id
    ).first()



    if model is None:

        raise HTTPException(
            status_code=404,
            detail="Model not found"
        )


    return model



# =========================================
# REGISTER MODEL
# =========================================

@router.post("/register")
def register_model(
    name: str,
    version: str,
    algorithm: str,
    f1_score: float,
    db: Session = Depends(get_db)
):


    model = ModelInfo(

        name=name,

        version=version,

        algorithm=algorithm,

        f1_score=f1_score
    )


    db.add(model)

    db.commit()

    db.refresh(model)


    return {
        "message":"Model registered",
        "model":model
    }