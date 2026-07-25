from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import HDFSSequence


router = APIRouter(
    prefix="/api/hdfs/sequences",
    tags=["HDFS Sequences"]
)


# ======================================
# Dependency : connexion PostgreSQL
# ======================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



# ======================================
# GET toutes les séquences
# ======================================

@router.get("")
def get_sequences(
    db: Session = Depends(get_db)
):

    sequences = db.query(
        HDFSSequence
    ).all()


    return sequences



# ======================================
# GET séquence par ID PostgreSQL
# ======================================

@router.get("/{id}")
def get_sequence_by_id(
    id: int,
    db: Session = Depends(get_db)
):

    sequence = db.query(
        HDFSSequence
    ).filter(
        HDFSSequence.id == id
    ).first()


    if sequence is None:

        raise HTTPException(
            status_code=404,
            detail="Sequence not found"
        )


    return sequence



# ======================================
# GET séquence par BlockId HDFS
# ======================================

@router.get("/block/{block_id}")
def get_sequence_by_block(
    block_id: str,
    db: Session = Depends(get_db)
):

    sequence = db.query(
        HDFSSequence
    ).filter(
        HDFSSequence.block_id == block_id
    ).first()


    if sequence is None:

        raise HTTPException(
            status_code=404,
            detail="Block not found"
        )


    return sequence



# ======================================
# POST importer CSV Drain3
# ======================================

@router.post("/import")
def import_sequences(
    db: Session = Depends(get_db)
):

    return {
        "message": "Import endpoint ready"
    }