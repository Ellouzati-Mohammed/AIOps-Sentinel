from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models import (
    Model,
    HDFSSequence,
    HDFSTemplate,
    SystemMetrics,
)


# ==========================================================
# CREATE TABLES
# ==========================================================

print("Creating tables...")

Base.metadata.create_all(bind=engine)

print("Tables created successfully.")


# ==========================================================
# DATABASE SESSION
# ==========================================================

db = SessionLocal()


try:

    # ======================================================
    # CLEAN EXISTING TEST DATA
    # ======================================================

    print("Cleaning existing seed data...")

    db.query(HDFSSequence).delete()
    db.query(HDFSTemplate).delete()
    db.query(SystemMetrics).delete()
    db.query(Model).delete()

    db.commit()


    # ======================================================
    # MODELS
    # ======================================================

    print("Seeding models...")

    model = Model(
        name="BiLSTM-HDFS",
        version="1.0",
        description="Bidirectional LSTM model for HDFS anomaly detection",
        model_type="BiLSTM",
        framework="PyTorch",
        model_path="ml/best_bilstm_model.pth",
        input_features=[
            "event_sequence",
            "num_events",
            "duration",
            "num_info",
            "num_warn",
        ],
        threshold=0.5,
        is_active=True,
    )

    db.add(model)
    db.commit()
    db.refresh(model)


    # ======================================================
    # HDFS TEMPLATES
    # ======================================================

    print("Seeding HDFS templates...")

    templates = [
        HDFSTemplate(
            event_id="E5",
            template="Receiving block <*> src: <*> dest: <*>",
        ),

        HDFSTemplate(
            event_id="E13",
            template="BLOCK* <*> served by <*>",
        ),

        HDFSTemplate(
            event_id="E6",
            template="BLOCK* <*> is added to invalidSet",
        ),

        HDFSTemplate(
            event_id="E7",
            template="BLOCK* <*> is removed from invalidSet",
        ),

        HDFSTemplate(
            event_id="E8",
            template="BLOCK* <*> is added to pendingReplication",
        ),
    ]

    db.add_all(templates)
    db.commit()


    # ======================================================
    # HDFS SEQUENCES
    # ======================================================

    print("Seeding HDFS sequences...")

    now = datetime.utcnow()

    sequences = [

        HDFSSequence(
            block_id="blk_-100001",
            event_sequence=["E5", "E13", "E13"],
            num_events=3,
            duration=2.0,
            num_info=3,
            num_warn=0,
            prediction="NORMAL",
            score=0.03,
            model_id=model.id,
            completed_at=now - timedelta(minutes=50),
            created_at=now - timedelta(minutes=52),
        ),

        HDFSSequence(
            block_id="blk_-100002",
            event_sequence=["E5", "E13", "E13", "E13"],
            num_events=4,
            duration=2.5,
            num_info=4,
            num_warn=0,
            prediction="NORMAL",
            score=0.08,
            model_id=model.id,
            completed_at=now - timedelta(minutes=45),
            created_at=now - timedelta(minutes=48),
        ),

        HDFSSequence(
            block_id="blk_-100003",
            event_sequence=["E5", "E6", "E7", "E13"],
            num_events=4,
            duration=3.2,
            num_info=3,
            num_warn=1,
            prediction="ANOMALY",
            score=0.91,
            model_id=model.id,
            completed_at=now - timedelta(minutes=40),
            created_at=now - timedelta(minutes=44),
        ),

        HDFSSequence(
            block_id="blk_-100004",
            event_sequence=["E5", "E13", "E13", "E13", "E13"],
            num_events=5,
            duration=3.0,
            num_info=5,
            num_warn=0,
            prediction="NORMAL",
            score=0.12,
            model_id=model.id,
            completed_at=now - timedelta(minutes=30),
            created_at=now - timedelta(minutes=33),
        ),

        HDFSSequence(
            block_id="blk_-100005",
            event_sequence=["E5", "E6", "E6", "E7"],
            num_events=4,
            duration=4.5,
            num_info=2,
            num_warn=2,
            prediction="ANOMALY",
            score=0.87,
            model_id=model.id,
            completed_at=now - timedelta(minutes=20),
            created_at=now - timedelta(minutes=25),
        ),

        HDFSSequence(
            block_id="blk_-100006",
            event_sequence=["E5", "E13", "E13"],
            num_events=3,
            duration=1.8,
            num_info=3,
            num_warn=0,
            prediction="NORMAL",
            score=0.04,
            model_id=model.id,
            completed_at=now - timedelta(minutes=10),
            created_at=now - timedelta(minutes=12),
        ),

        HDFSSequence(
            block_id="blk_-100007",
            event_sequence=["E5", "E6", "E8", "E7"],
            num_events=4,
            duration=5.1,
            num_info=2,
            num_warn=2,
            prediction="ANOMALY",
            score=0.95,
            model_id=model.id,
            completed_at=now - timedelta(minutes=5),
            created_at=now - timedelta(minutes=10),
        ),
    ]

    db.add_all(sequences)
    db.commit()


    # ======================================================
    # SYSTEM METRICS
    # ======================================================

    print("Seeding system metrics...")

    metrics = [

        SystemMetrics(
            logs_received=850,
            logs_processed=830,
            logs_invalid=20,
            blocks_active=3,
            blocks_completed=120,
            normal_predictions=112,
            anomaly_predictions=8,
            total_predictions=120,
            anomaly_rate=6.67,
            normal_rate=93.33,
            avg_score=0.18,
            max_score=0.94,
            min_score=0.01,
            avg_block_duration=2.8,
            max_block_duration=5.6,
            min_block_duration=1.2,
            avg_events_per_block=4.2,
            max_events_per_block=9,
            info_logs=810,
            warn_logs=40,
            created_at=now - timedelta(hours=5),
        ),

        SystemMetrics(
            logs_received=1020,
            logs_processed=995,
            logs_invalid=25,
            blocks_active=4,
            blocks_completed=145,
            normal_predictions=135,
            anomaly_predictions=10,
            total_predictions=145,
            anomaly_rate=6.90,
            normal_rate=93.10,
            avg_score=0.21,
            max_score=0.96,
            min_score=0.01,
            avg_block_duration=2.9,
            max_block_duration=6.0,
            min_block_duration=1.1,
            avg_events_per_block=4.4,
            max_events_per_block=10,
            info_logs=970,
            warn_logs=50,
            created_at=now - timedelta(hours=4),
        ),

        SystemMetrics(
            logs_received=1180,
            logs_processed=1155,
            logs_invalid=25,
            blocks_active=5,
            blocks_completed=170,
            normal_predictions=158,
            anomaly_predictions=12,
            total_predictions=170,
            anomaly_rate=7.06,
            normal_rate=92.94,
            avg_score=0.23,
            max_score=0.97,
            min_score=0.02,
            avg_block_duration=3.0,
            max_block_duration=6.3,
            min_block_duration=1.0,
            avg_events_per_block=4.6,
            max_events_per_block=11,
            info_logs=1125,
            warn_logs=55,
            created_at=now - timedelta(hours=3),
        ),

        SystemMetrics(
            logs_received=1320,
            logs_processed=1290,
            logs_invalid=30,
            blocks_active=4,
            blocks_completed=198,
            normal_predictions=184,
            anomaly_predictions=14,
            total_predictions=198,
            anomaly_rate=7.07,
            normal_rate=92.93,
            avg_score=0.25,
            max_score=0.98,
            min_score=0.01,
            avg_block_duration=3.1,
            max_block_duration=6.8,
            min_block_duration=1.1,
            avg_events_per_block=4.8,
            max_events_per_block=12,
            info_logs=1250,
            warn_logs=70,
            created_at=now - timedelta(hours=2),
        ),

        SystemMetrics(
            logs_received=1480,
            logs_processed=1445,
            logs_invalid=35,
            blocks_active=6,
            blocks_completed=225,
            normal_predictions=207,
            anomaly_predictions=18,
            total_predictions=225,
            anomaly_rate=8.00,
            normal_rate=92.00,
            avg_score=0.27,
            max_score=0.99,
            min_score=0.01,
            avg_block_duration=3.2,
            max_block_duration=7.1,
            min_block_duration=1.0,
            avg_events_per_block=5.0,
            max_events_per_block=13,
            info_logs=1400,
            warn_logs=80,
            created_at=now - timedelta(hours=1),
        ),

        SystemMetrics(
            logs_received=1620,
            logs_processed=1580,
            logs_invalid=40,
            blocks_active=5,
            blocks_completed=250,
            normal_predictions=229,
            anomaly_predictions=21,
            total_predictions=250,
            anomaly_rate=8.40,
            normal_rate=91.60,
            avg_score=0.29,
            max_score=0.99,
            min_score=0.01,
            avg_block_duration=3.3,
            max_block_duration=7.5,
            min_block_duration=0.9,
            avg_events_per_block=5.1,
            max_events_per_block=14,
            info_logs=1520,
            warn_logs=100,
            created_at=now,
        ),
    ]

    db.add_all(metrics)
    db.commit()


    # ======================================================
    # SUMMARY
    # ======================================================

    print()
    print("==========================================")
    print("DATABASE SEED COMPLETED")
    print("==========================================")
    print(f"Models          : {db.query(Model).count()}")
    print(f"HDFS Templates  : {db.query(HDFSTemplate).count()}")
    print(f"HDFS Sequences  : {db.query(HDFSSequence).count()}")
    print(f"System Metrics  : {db.query(SystemMetrics).count()}")
    print("==========================================")


except Exception as e:

    db.rollback()

    print()
    print("ERROR DURING SEEDING")
    print(e)

    raise


finally:

    db.close()
