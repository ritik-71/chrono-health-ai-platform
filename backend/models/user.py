from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    datasets = relationship("UploadedDataset", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("PredictionHistory", back_populates="user", cascade="all, delete-orphan")
    cii_history = relationship("CIIHistory", back_populates="user", cascade="all, delete-orphan")
    rl_interventions = relationship("RLIntervention", back_populates="user", cascade="all, delete-orphan")

    # Explicit indexes for performance on high-frequency clinical queries
    __table_args__ = (
        Index("ix_users_email_name", "email", "name"),
    )
