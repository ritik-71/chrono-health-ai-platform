from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import pandas as pd
import io
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from core.database import get_db
from models.dataset import UploadedDataset
from models.user import User

router = APIRouter()

@router.post("")
async def upload_dataset(
    file: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db)
):
    """
    Handles CSV, JSON, and Excel file ingestion, calculates metadata, and saves to Neon.
    """
    try:
        # Check if any user exists, if not create a demo user
        user_result = await db.execute(select(User))
        first_user = user_result.scalars().first()
        
        if not first_user:
            # Create a demo user so the foreign key constraint doesn't fail
            demo_user = User(
                name="Clinical Researcher",
                email="researcher@chronohealth.ai",
                hashed_password="hashed_placeholder_for_demo"
            )
            db.add(demo_user)
            await db.commit()
            await db.refresh(demo_user)
            user_id = demo_user.id
        else:
            user_id = first_user.id

        contents = await file.read()
        filename = file.filename.lower()
        
        # Parse based on file type
        if filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        elif filename.endswith('.json'):
            df = pd.read_json(io.BytesIO(contents))
        elif filename.endswith('.xlsx') or filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
        
        total_rows = len(df)
        columns = df.columns.tolist()
        
        # Calculate Metadata
        missing_values = df.isnull().sum().to_dict()
        # Convert int64 to int for JSON serialization
        missing_values = {k: int(v) for k, v in missing_values.items()}
        
        total_cells = df.size
        total_missing = sum(missing_values.values())
        completeness = ((total_cells - total_missing) / total_cells) * 100 if total_cells > 0 else 0
        
        # Quality score logic (heuristic)
        quality_score = int(completeness * 0.9 + (10 if len(columns) > 8 else 5))
        quality_score = min(100, quality_score)
        
        preview = df.head(5).to_dict(orient="records")
        # Ensure values are JSON serializable (handle NaN/Inf)
        import numpy as np
        def clean_val(v):
            if isinstance(v, (float, np.float64)) and (np.isnan(v) or np.isinf(v)):
                return None
            return v
        
        preview = [{k: clean_val(v) for k, v in row.items()} for row in preview]

        # Save to Neon PostgreSQL
        new_dataset = UploadedDataset(
            user_id=user_id,
            file_name=file.filename,
            dataset_type="clinical" if "clinical" in filename else "sensor",
            row_count=total_rows,
            column_names=columns,
            missing_values_count=missing_values,
            completeness_score=completeness,
            quality_score=quality_score,
            preview_data=preview
        )
        
        db.add(new_dataset)
        await db.commit()
        await db.refresh(new_dataset)
        
        # ── REAL-TIME ANALYTICS RECOMPUTATION ────────────────────────────
        from services.live_analytics_engine import live_analytics_engine
        recomputed_count = 0
        try:
            recomputed_count = await live_analytics_engine.process_and_backfill(df, user_id, db)
        except Exception as analytics_err:
            print(f"Live analytics recomputation failed: {analytics_err}")

        # Generate insights for the frontend
        insights = [
            f"Successfully parsed {total_rows} rows and {len(columns)} feature columns.",
            f"Overall data integrity is {completeness:.1f}%.",
            f"Automatically recomputed {recomputed_count} clinical analytics data points.",
        ]
        if "timestamp" in [c.lower() for c in columns]:
            insights.append("Temporal index identified; ready for time-series forecasting.")

        return {
            "id": new_dataset.id,
            "filename": new_dataset.file_name,
            "status": "success",
            "rows": new_dataset.row_count,
            "columns": columns,
            "completeness": completeness,
            "quality_score": quality_score,
            "missing_values": missing_values,
            "preview": preview,
            "insights": insights,
            "upload_time": new_dataset.upload_time
        }
    except Exception as e:
        await db.rollback()
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/history")
async def get_upload_history(db: AsyncSession = Depends(get_db)):
    """
    Fetches the history of all uploaded datasets from Neon.
    """
    try:
        result = await db.execute(
            select(UploadedDataset).order_by(UploadedDataset.upload_time.desc())
        )
        datasets = result.scalars().all()
        return [
            {
                "id": d.id,
                "filename": d.file_name,
                "type": d.dataset_type,
                "rows": d.row_count,
                "columns": d.column_names,
                "completeness": d.completeness_score,
                "quality_score": d.quality_score,
                "time": d.upload_time
            }
            for d in datasets
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")
