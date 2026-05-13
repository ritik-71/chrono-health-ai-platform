from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class UploadedDataset(Base):
    __tablename__ = "uploaded_datasets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    dataset_type = Column(String, nullable=False) # e.g., 'clinical', 'wearable', 'sensor'
    upload_time = Column(DateTime(timezone=True), server_default=func.now())
    row_count = Column(Integer, default=0)
    
    # New metadata fields
    column_names = Column(JSON, nullable=True)
    missing_values_count = Column(JSON, nullable=True)
    completeness_score = Column(Float, default=0.0)
    quality_score = Column(Integer, default=0)
    preview_data = Column(JSON, nullable=True)

    # Relationships
    user = relationship("User", back_populates="datasets")

    # Optimized indexes for clinical data lookups
    __table_args__ = (
        Index("ix_dataset_user_type", "user_id", "dataset_type"),
    )
