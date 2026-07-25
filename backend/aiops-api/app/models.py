from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    JSON
)

from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base



# ==================================
# Table: hdfs_templates
# ==================================

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



# ==================================
# Table: hdfs_sequences
# ==================================

class HDFSSequence(Base):

    __tablename__ = "hdfs_sequences"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    block_id = Column(
        String(100),
        unique=True,
        nullable=False
    )


    # Exemple:
    # ["E1","E2","E1","E3"]

    event_sequence = Column(
        JSON,
        nullable=False
    )


    label = Column(
        String(20),
        nullable=False
    )


    num_events = Column(
        Integer,
        nullable=False
    )


    duration = Column(
        Float,
        nullable=True
    )


    num_info = Column(
        Integer,
        default=0
    )


    num_warn = Column(
        Integer,
        default=0
    )


    num_error = Column(
        Integer,
        default=0
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    predictions = relationship(
        "Prediction",
        back_populates="sequence"
    )



# ==================================
# Table: predictions
# ==================================

class Prediction(Base):

    __tablename__ = "predictions"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    sequence_id = Column(
        Integer,
        ForeignKey(
            "hdfs_sequences.id"
        ),
        nullable=False
    )


    model_name = Column(
        String(50),
        nullable=False
    )


    prediction = Column(
        String(20),
        nullable=False
    )


    anomaly_score = Column(
        Float,
        nullable=False
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    sequence = relationship(
        "HDFSSequence",
        back_populates="predictions"
    )



# ==================================
# Table: model_info
# ==================================

class ModelInfo(Base):

    __tablename__ = "model_info"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    name = Column(
        String(100),
        nullable=False
    )


    version = Column(
        String(20),
        nullable=False
    )


    algorithm = Column(
        String(50),
        nullable=False
    )


    f1_score = Column(
        Float,
        nullable=True
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )