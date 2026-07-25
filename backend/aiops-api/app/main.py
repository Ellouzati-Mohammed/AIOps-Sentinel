from fastapi import FastAPI

from app.routers import (
    health,
    hdfs_sequences,
    hdfs_templates,
    predictions,
    models
)


# ============================
# Création application FastAPI
# ============================

app = FastAPI(
    title="AIOps Sentinel API",
    description="API for HDFS Logs Anomaly Detection",
    version="1.0.0"
)


# ============================
# Inclusion des routes
# ============================

app.include_router(
    health.router
)

app.include_router(
    hdfs_sequences.router
)

app.include_router(
    hdfs_templates.router
)

app.include_router(
    predictions.router
)

app.include_router(
    models.router
)


# ============================
# Root endpoint
# ============================

@app.get("/")
def root():

    return {
        "application": "AIOps Sentinel",
        "status": "running",
        "version": "1.0.0"
    }