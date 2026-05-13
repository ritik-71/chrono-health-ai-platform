from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class RLIntervention(Base):
    __tablename__ = "rl_interventions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    intervention_type = Column(String, nullable=False) # e.g., 'Bright Light Therapy', 'Melatonin', 'CBT-I Session'
    reward_score = Column(Float, nullable=False) # The reward received from this intervention
    recommendation = Column(String, nullable=True) # Full text of the recommendation
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="rl_interventions")
