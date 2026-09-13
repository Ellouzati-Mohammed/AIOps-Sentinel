from datetime import datetime

import os

from elasticsearch import Elasticsearch
from sqlalchemy import case, func
from app.database import SessionLocal
from app.models import HDFSSequence, SystemMetrics


# ============================================================
# Elasticsearch configuration
# ============================================================

ELASTICSEARCH_URL = os.getenv(
    "ELASTICSEARCH_URL",
    "http://localhost:9200"
)

ELASTICSEARCH_INDEX = "hdfs-raw-logs"

es = Elasticsearch(ELASTICSEARCH_URL)


# ============================================================
# PostgreSQL metrics
# ============================================================

def get_hdfs_sequence_metrics(db, start_time, end_time) -> dict:
    """
    Calculate metrics from completed HDFS blocks
    stored in PostgreSQL.
    """

    query = (
        db.query(
            func.count(HDFSSequence.id).label("blocks_completed"),

            func.sum(
                case(
                    (HDFSSequence.prediction == "NORMAL", 1),
                    else_=0
                )
            ).label("normal_predictions"),

            func.sum(
                case(
                    (HDFSSequence.prediction == "ANOMALY", 1),
                    else_=0
                )
            ).label("anomaly_predictions"),

            func.avg(HDFSSequence.score).label("avg_score"),
            func.max(HDFSSequence.score).label("max_score"),
            func.min(HDFSSequence.score).label("min_score"),

            func.avg(HDFSSequence.duration).label("avg_block_duration"),
            func.max(HDFSSequence.duration).label("max_block_duration"),
            func.min(HDFSSequence.duration).label("min_block_duration"),

            func.avg(HDFSSequence.num_events).label(
                "avg_events_per_block"
            ),
            func.max(HDFSSequence.num_events).label(
                "max_events_per_block"
            )
        )
        .filter(
            HDFSSequence.completed_at >= start_time,
            HDFSSequence.completed_at < end_time
        )
    )

    result = query.one()

    # --------------------------------------------------------
    # Prediction counts
    # --------------------------------------------------------

    blocks_completed = result.blocks_completed or 0

    normal_predictions = int(
        result.normal_predictions or 0
    )

    anomaly_predictions = int(
        result.anomaly_predictions or 0
    )

    total_predictions = (
        normal_predictions +
        anomaly_predictions
    )

    # --------------------------------------------------------
    # Prediction rates
    # --------------------------------------------------------

    if total_predictions > 0:

        anomaly_rate = (
            anomaly_predictions /
            total_predictions
        ) * 100

        normal_rate = (
            normal_predictions /
            total_predictions
        ) * 100

    else:

        anomaly_rate = 0.0
        normal_rate = 0.0

    # --------------------------------------------------------
    # Return metrics
    # --------------------------------------------------------

    return {
        "blocks_completed": int(blocks_completed),

        "normal_predictions": normal_predictions,

        "anomaly_predictions": anomaly_predictions,

        "total_predictions": total_predictions,

        "anomaly_rate": anomaly_rate,

        "normal_rate": normal_rate,

        "avg_score": (
            float(result.avg_score)
            if result.avg_score is not None
            else None
        ),

        "max_score": (
            float(result.max_score)
            if result.max_score is not None
            else None
        ),

        "min_score": (
            float(result.min_score)
            if result.min_score is not None
            else None
        ),

        "avg_block_duration": (
            float(result.avg_block_duration)
            if result.avg_block_duration is not None
            else None
        ),

        "max_block_duration": (
            float(result.max_block_duration)
            if result.max_block_duration is not None
            else None
        ),

        "min_block_duration": (
            float(result.min_block_duration)
            if result.min_block_duration is not None
            else None
        ),

        "avg_events_per_block": (
            float(result.avg_events_per_block)
            if result.avg_events_per_block is not None
            else None
        ),

        "max_events_per_block": (
            int(result.max_events_per_block)
            if result.max_events_per_block is not None
            else None
        ),
    }


# ============================================================
# Elasticsearch metrics
# ============================================================

def get_elasticsearch_metrics(start_time, end_time) -> dict:
    """
    Calculate raw log metrics from Elasticsearch.

    Elasticsearch index:
        hdfs-raw-logs

    Fields used:
        @timestamp
        message.keyword
    """

    # --------------------------------------------------------
    # Time filter
    # --------------------------------------------------------

    time_filter = {
        "range": {
            "@timestamp": {
                "gte": start_time.isoformat(),
                "lt": end_time.isoformat()
            }
        }
    }

    # --------------------------------------------------------
    # Total logs
    # --------------------------------------------------------

    total_response = es.count(
        index=ELASTICSEARCH_INDEX,
        query={
            "bool": {
                "filter": [
                    time_filter
                ]
            }
        }
    )

    logs_received = total_response["count"]

    # --------------------------------------------------------
    # INFO logs
    # --------------------------------------------------------

    info_response = es.count(
        index=ELASTICSEARCH_INDEX,
        query={
            "bool": {
                "filter": [
                    time_filter,
                    {
                        "regexp": {
                            "message.keyword": ".* INFO .*"
                        }
                    }
                ]
            }
        }
    )

    info_logs = info_response["count"]

    # --------------------------------------------------------
    # WARN logs
    # --------------------------------------------------------

    warn_response = es.count(
        index=ELASTICSEARCH_INDEX,
        query={
            "bool": {
                "filter": [
                    time_filter,
                    {
                        "regexp": {
                            "message.keyword": ".* WARN .*"
                        }
                    }
                ]
            }
        }
    )

    warn_logs = warn_response["count"]

    # --------------------------------------------------------
    # Return metrics
    # --------------------------------------------------------

    return {
        "logs_received": logs_received,
        "info_logs": info_logs,
        "warn_logs": warn_logs
    }


# ============================================================
# Create metrics snapshot
# ============================================================

def create_metrics_snapshot(
    db,
    start_time,
    end_time
) -> SystemMetrics:
    """
    Create one metrics snapshot for the given period.

    PostgreSQL:
        completed blocks and predictions

    Elasticsearch:
        raw logs, INFO logs and WARN logs
    """

    # --------------------------------------------------------
    # Get PostgreSQL metrics
    # --------------------------------------------------------

    hdfs_metrics = get_hdfs_sequence_metrics(
        db,
        start_time,
        end_time
    )

    # --------------------------------------------------------
    # Get Elasticsearch metrics
    # --------------------------------------------------------

    elastic_metrics = get_elasticsearch_metrics(
        start_time,
        end_time
    )

    # --------------------------------------------------------
    # Create SystemMetrics object
    # --------------------------------------------------------

    snapshot = SystemMetrics(

        # Elasticsearch metrics
        logs_received=elastic_metrics["logs_received"],

        info_logs=elastic_metrics["info_logs"],

        warn_logs=elastic_metrics["warn_logs"],

        # PostgreSQL metrics
        blocks_completed=hdfs_metrics["blocks_completed"],

        normal_predictions=hdfs_metrics[
            "normal_predictions"
        ],

        anomaly_predictions=hdfs_metrics[
            "anomaly_predictions"
        ],

        total_predictions=hdfs_metrics[
            "total_predictions"
        ],

        anomaly_rate=hdfs_metrics[
            "anomaly_rate"
        ],

        normal_rate=hdfs_metrics[
            "normal_rate"
        ],

        avg_score=hdfs_metrics[
            "avg_score"
        ],

        max_score=hdfs_metrics[
            "max_score"
        ],

        min_score=hdfs_metrics[
            "min_score"
        ],

        avg_block_duration=hdfs_metrics[
            "avg_block_duration"
        ],

        max_block_duration=hdfs_metrics[
            "max_block_duration"
        ],

        min_block_duration=hdfs_metrics[
            "min_block_duration"
        ],

        avg_events_per_block=hdfs_metrics[
            "avg_events_per_block"
        ],

        max_events_per_block=hdfs_metrics[
            "max_events_per_block"
        ],

        # Snapshot creation time
        created_at=datetime.utcnow()
    )

    return snapshot


# ============================================================
# Save hourly snapshot
# ============================================================

def save_hourly_snapshot(
    start_time,
    end_time
) -> SystemMetrics:
    """
    Calculate and save one hourly metrics snapshot
    into PostgreSQL.
    """

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # Create snapshot
        # ----------------------------------------------------

        snapshot = create_metrics_snapshot(
            db,
            start_time,
            end_time
        )

        # ----------------------------------------------------
        # Save to database
        # ----------------------------------------------------

       # db.add(snapshot)

        #db.commit()

        db.refresh(snapshot)

        print(
            f"[Metrics] Snapshot sauvegardé : "
            f"id={snapshot.id}"
        )

        return snapshot

    except Exception as error:

        db.rollback()

        print(
            f"[Metrics] Erreur sauvegarde snapshot : "
            f"{error}"
        )

        raise

    finally:

        db.close()