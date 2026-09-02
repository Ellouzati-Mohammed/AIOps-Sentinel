
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
    JSON
)
from datetime import datetime

from sqlalchemy.orm import relationship

from app.database import Base


# ==========================================================
# MODEL DE PREDICTION
# ==========================================================

class Model(Base):

    __tablename__ = "models"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False,
        unique=True
    )

    version = Column(
        String,
        nullable=True
    )

    description = Column(
        String,
        nullable=True
    )

    model_type = Column(
        String,
        nullable=False
    )

    framework = Column(
        String,
        nullable=True
    )

    model_path = Column(
        String,
        nullable=False
    )

    input_features = Column(
        JSON,
        nullable=True
    )

    threshold = Column(
        Float,
        nullable=True
    )

    is_active = Column(
            Boolean,
            default=True,
            nullable=False
        )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


    # Relation avec les séquences HDFS
    sequences = relationship(
        "HDFSSequence",
        back_populates="model"
    )


# ==========================================================
# SEQUENCE HDFS / BLOCK
# ==========================================================

class HDFSSequence(Base):

    __tablename__ = "hdfs_sequences"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ------------------------------------------------------
    # Identification du block
    # ------------------------------------------------------

    block_id = Column(
        String,
        nullable=False,
        unique=True,
        index=True
    )

    # ------------------------------------------------------
    # Séquence d'EventId
    # Exemple :
    # ["E5", "E13", "E13"]
    # ------------------------------------------------------

    event_sequence = Column(
        JSON,
        nullable=False
    )

    # ------------------------------------------------------
    # Features
    # ------------------------------------------------------

    num_events = Column(
        Integer,
        nullable=False
    )

    duration = Column(
        Float,
        nullable=False
    )

    num_info = Column(
        Integer,
        nullable=False
    )

    num_warn = Column(
        Integer,
        nullable=False
    )

    # ------------------------------------------------------
    # Résultat de la prédiction
    # ------------------------------------------------------

    prediction = Column(
        String,
        nullable=False
    )

    score = Column(
        Float,
        nullable=False
    )

    # ------------------------------------------------------
    # FOREIGN KEY vers models
    # ------------------------------------------------------

    model_id = Column(
        Integer,
        ForeignKey(
            "models.id"
        ),
        nullable=False
    )

    completed_at = Column(
            DateTime,
            nullable=True
        )
    
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    # ------------------------------------------------------
    # Relation avec Model
    # ------------------------------------------------------

    model = relationship(
        "Model",
        back_populates="sequences"
    )
    
class HDFSTemplate(Base):

    __tablename__ = "hdfs_templates"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    event_id = Column(
        String(20),
        unique=True,
        nullable=False
    )


    template = Column(
        Text,
        nullable=False
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================================================
# SYSTEM METRICS
# ==========================================================

class SystemMetrics(Base):

    __tablename__ = "system_metrics"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    logs_received = Column(
        Integer,
        nullable=False,
        default=0
    )

    blocks_completed = Column(
        Integer,
        nullable=False,
        default=0
    )

    normal_predictions = Column(
        Integer,
        nullable=False,
        default=0
    )

    anomaly_predictions = Column(
        Integer,
        nullable=False,
        default=0
    )

    total_predictions = Column(
        Integer,
        nullable=False,
        default=0
    )

    anomaly_rate = Column(
        Float,
        nullable=False,
        default=0.0
    )

    normal_rate = Column(
        Float,
        nullable=False,
        default=0.0
    )

    avg_score = Column(
        Float,
        nullable=True
    )

    max_score = Column(
        Float,
        nullable=True
    )

    min_score = Column(
        Float,
        nullable=True
    )

    avg_block_duration = Column(
        Float,
        nullable=True
    )

    max_block_duration = Column(
        Float,
        nullable=True
    )

    min_block_duration = Column(
        Float,
        nullable=True
    )

    avg_events_per_block = Column(
        Float,
        nullable=True
    )

    max_events_per_block = Column(
        Integer,
        nullable=True
    )

    info_logs = Column(
        Integer,
        nullable=False,
        default=0
    )

    warn_logs = Column(
        Integer,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )