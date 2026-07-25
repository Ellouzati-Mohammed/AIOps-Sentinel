from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Prediction, HDFSSequence


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

@router.post("/predict")
def predict(
    block_id: str,
    db: Session = Depends(get_db)
):


    # chercher la séquence HDFS

    sequence = db.query(
        HDFSSequence
    ).filter(
        HDFSSequence.block_id == block_id
    ).first()



    if sequence is None:

        raise HTTPException(
            status_code=404,
            detail="HDFS sequence not found"
        )


    # ===============================
    # Appel modèle IA
    # ===============================

    # Ici on appellera le modèle BiLSTM

    # Exemple temporaire

    anomaly_score = 0.05


    if anomaly_score > 0.5:

        result = "ANOMALY"

    else:

        result = "NORMAL"



    # sauvegarde résultat

    prediction = Prediction(

        sequence_id=sequence.id,

        model_name="BiLSTM-HDFS",

        prediction=result,

        anomaly_score=anomaly_score

    )


    db.add(prediction)

    db.commit()

    db.refresh(prediction)



    return {

        "block_id": block_id,

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