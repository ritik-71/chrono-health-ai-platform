import pandas as pd
import numpy as np

class DataPreprocessor:
    def __init__(self):
        # In production, load the saved scaler here: self.scaler = joblib.load('models/scaler.pkl')
        pass

    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handles missing values and outliers based on the Capstone notebook logic."""
        # Median imputation for numerical columns to handle NaNs gracefully
        for col in df.select_dtypes(include=[np.number]).columns:
            df[col] = df[col].fillna(df[col].median())
        return df

    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extracts chronobiological and stress features."""
        # Example feature engineering from the research paper
        if 'sleep_duration' in df.columns and 'sleep_quality' in df.columns:
            df['sleep_efficiency_index'] = df['sleep_duration'] * df['sleep_quality']
        return df

    def preprocess(self, data: dict) -> np.ndarray:
        """Full preprocessing pipeline for inference."""
        df = pd.DataFrame([data])
        df = self.clean_data(df)
        df = self.extract_features(df)
        
        numeric_data = df.select_dtypes(include=[np.number]).values
        return numeric_data
