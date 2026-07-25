from fastapi import FastAPI

from app.database import engine, Base
from app import models


# Création des tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AIOps Sentinel API",
    version="1.0"
)


@app.get("/")
def root():
    return {
        "message": "AIOps Sentinel API running"
    }