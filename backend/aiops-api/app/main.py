from fastapi import FastAPI

from app.database import engine, Base
from app import models


from app.routers import (
    health,
    sequences,
    predictions,
    models as models_router
)



Base.metadata.create_all(
    bind=engine
)


app = FastAPI(
    title="AIOps Sentinel API",
    version="1.0"
)



app.include_router(
    health.router
)

app.include_router(
    sequences.router
)

app.include_router(
    predictions.router
)

app.include_router(
    models_router.router
)



@app.get("/")
def root():

    return {
        "message": "AIOps Sentinel running"
    }