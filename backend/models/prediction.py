from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    stress_score = Column(Float, nullable=False)
    sleep_score = Column(Float, nullable=False)
    cii_score = Column(Float, nullable=False)
    fatigue_score = Column(Float, nullable=False)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="predictions")
