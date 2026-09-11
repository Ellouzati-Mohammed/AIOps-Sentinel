from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from contextlib import asynccontextmanager

from app.scheduler.metrics_scheduler import metrics_scheduler

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
@asynccontextmanager
async def lifespan(app: FastAPI):

    scheduler_task = asyncio.create_task(
        metrics_scheduler()
    )

    yield

    scheduler_task.cancel()

    try:
        await scheduler_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="AIOps Sentinel API",
    description="API for HDFS Logs Anomaly Detection",
    version="1.0.0",
    lifespan=lifespan
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