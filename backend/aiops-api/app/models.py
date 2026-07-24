from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime

from .database import Base


class Log(Base):

    __tablename__ = "logs"

    id = Column(Integer, primary_key=True)

    event_sequence = Column(String)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )



class Prediction(Base):

    __tablename__ = "predictions"


    id = Column(Integer, primary_key=True)

    log_id = Column(
        Integer,
        ForeignKey("logs.id")
    )

    prediction = Column(String)

    anomaly_score = Column(Float)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )