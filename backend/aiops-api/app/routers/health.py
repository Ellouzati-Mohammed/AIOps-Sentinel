from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine


router = APIRouter(
    prefix="/health",
    tags=["Health"]
)


# ============================
# Vérifier que l'API fonctionne
# ============================

@router.get("")
def health_check():

    return {
        "status": "ok",
        "service": "aiops-api"
    }



# ============================
# Vérifier la connexion DB
# ============================

@router.get("/db")
def database_health():

    try:

        with engine.connect() as connection:

            connection.execute(
                text("SELECT 1")
            )


        return {
            "status": "ok",
            "database": "connected"
        }


    except Exception as e:

        return {
            "status": "error",
            "database": "disconnected",
            "detail": str(e)
        }