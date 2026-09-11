from datetime import datetime

from app.database import SessionLocal
from app.models import SystemMetrics
from app.services.metrics_service import (
    get_elasticsearch_metrics,
    get_hdfs_sequence_metrics,
    save_hourly_snapshot,
)


def test_elasticsearch_metrics_with_real_data():
    start_time = datetime(2026, 9, 4, 15, 0, 0)
    end_time = datetime(2026, 9, 4, 16, 0, 0)

    metrics = get_elasticsearch_metrics(
        start_time,
        end_time
    )

    print("\n=== Elasticsearch Metrics ===")
    print(f"Logs received : {metrics['logs_received']}")
    print(f"INFO logs     : {metrics['info_logs']}")
    print(f"WARN logs     : {metrics['warn_logs']}")

    assert metrics["logs_received"] > 0
    assert metrics["info_logs"] >= 0
    assert metrics["warn_logs"] >= 0


def test_hdfs_sequence_metrics_with_real_data():
    db = SessionLocal()

    try:
        start_time = datetime(2026, 9, 4, 15, 0, 0)
        end_time = datetime(2026, 9, 4, 16, 0, 0)

        metrics = get_hdfs_sequence_metrics(
            db,
            start_time,
            end_time
        )

        print("\n=== PostgreSQL Metrics ===")
        print(f"Blocks completed : {metrics['blocks_completed']}")
        print(f"Normal           : {metrics['normal_predictions']}")
        print(f"Anomaly          : {metrics['anomaly_predictions']}")
        print(f"Total            : {metrics['total_predictions']}")
        print(f"Anomaly rate     : {metrics['anomaly_rate']:.2f}%")
        print(f"Normal rate      : {metrics['normal_rate']:.2f}%")

        assert (
            metrics["normal_predictions"]
            + metrics["anomaly_predictions"]
            == metrics["total_predictions"]
        )

        assert 0 <= metrics["anomaly_rate"] <= 100
        assert 0 <= metrics["normal_rate"] <= 100

    finally:
        db.close()


def test_save_hourly_snapshot():
    """
    Test saving a complete hourly snapshot
    into the system_metrics table.
    """

    start_time = datetime(2026, 9, 4, 15, 0, 0)
    end_time = datetime(2026, 9, 4, 16, 0, 0)

    # Save snapshot
    snapshot = save_hourly_snapshot(
        start_time,
        end_time
    )

    print("\n=== Saved System Metrics Snapshot ===")
    print(f"ID                : {snapshot.id}")
    print(f"Logs received     : {snapshot.logs_received}")
    print(f"INFO logs         : {snapshot.info_logs}")
    print(f"WARN logs         : {snapshot.warn_logs}")
    print(f"Blocks completed  : {snapshot.blocks_completed}")
    print(f"Normal predictions: {snapshot.normal_predictions}")
    print(f"Anomaly predictions: {snapshot.anomaly_predictions}")
    print(f"Total predictions : {snapshot.total_predictions}")
    print(f"Anomaly rate      : {snapshot.anomaly_rate:.2f}%")
    print(f"Normal rate       : {snapshot.normal_rate:.2f}%")
    print(f"Created at        : {snapshot.created_at}")

    # Vérifications
    assert snapshot is not None
    assert snapshot.id is not None

    assert snapshot.logs_received >= 0
    assert snapshot.info_logs >= 0
    assert snapshot.warn_logs >= 0

    assert snapshot.blocks_completed >= 0
    assert snapshot.normal_predictions >= 0
    assert snapshot.anomaly_predictions >= 0

    assert (
        snapshot.normal_predictions
        + snapshot.anomaly_predictions
        == snapshot.total_predictions
    )

    assert 0 <= snapshot.anomaly_rate <= 100
    assert 0 <= snapshot.normal_rate <= 100

    # Vérifier que la ligne existe réellement en PostgreSQL
    db = SessionLocal()

    try:
        saved_snapshot = (
            db.query(SystemMetrics)
            .filter(SystemMetrics.id == snapshot.id)
            .first()
        )

        assert saved_snapshot is not None
        assert saved_snapshot.id == snapshot.id

    finally:
        db.close()