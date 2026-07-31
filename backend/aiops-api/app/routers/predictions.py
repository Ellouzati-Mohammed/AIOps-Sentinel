from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Prediction, HDFSSequence

from app.services.predictor import predict as predict_anomaly

router = APIRouter(
    prefix="/api/predictions",
    tags=["Predictions"]
)



# Connexion DB

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



# =====================================================
# POST /api/predictions/predict
# Faire une prédiction
# =====================================================
from fastapi import Body


@router.post("/predict")
def predict(

    event_sequence: list[str] = Body(...),

    num_events: int = Body(...),

    duration: float = Body(...),

    num_info: int = Body(...),

    num_warn: int = Body(...)

):


    anomaly_score, result = predict_anomaly(

        event_sequence,

        num_events,

        duration,

        num_info,

        num_warn

    )


    return {

        "prediction": result,

        "score": anomaly_score,

        "model": "BiLSTM-HDFS"

    }

# =====================================================
# GET /api/predictions
# Historique complet
# =====================================================

@router.get("/")
def get_predictions(
    db: Session = Depends(get_db)
):


    predictions = db.query(
        Prediction
    ).all()


    return predictions



# =====================================================
# GET /api/predictions/{block_id}
# Prédictions d'un block précis
# =====================================================

@router.get("/{block_id}")
def get_prediction_by_block(
    block_id: str,
    db: Session = Depends(get_db)
):


    prediction = (

        db.query(Prediction)

        .join(
            HDFSSequence
        )

        .filter(
            HDFSSequence.block_id == block_id
        )

        .order_by(
            Prediction.created_at.desc()
        )

        .first()

    )



    if prediction is None:

        raise HTTPException(
            status_code=404,
            detail="Prediction not found"
        )



    return prediction