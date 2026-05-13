from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class CIIHistory(Base):
    __tablename__ = "cii_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    cii_value = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False) # e.g., 'Low Risk', 'Moderate Risk', 'High Risk'
    
    # Store components as well for better analytics
    stress_sleep_correlation = Column(Float, nullable=True)
    phase_shift_rate = Column(Float, nullable=True)
    zeitgeber_score = Column(Float, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="cii_history")
