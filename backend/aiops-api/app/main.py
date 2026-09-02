from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    health,
    hdfs_sequences,
    hdfs_templates,
    models,
    system_metrics,
    logs
)



# ============================
# Création application FastAPI
# ============================

app = FastAPI(
    title="AIOps Sentinel API",
    description="API for HDFS Logs Anomaly Detection",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    models.router
)

app.include_router(
    system_metrics.router
)
app.include_router(
    logs.router
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