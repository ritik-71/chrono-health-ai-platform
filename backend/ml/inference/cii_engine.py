import numpy as np
import pandas as pd
from scipy.stats import pearsonr

class CircadianInteractionEngine:
    def __init__(self, alpha=0.4, beta=0.35, gamma=0.25):
        """
        Real CII Calculation Engine.
        Formula: CII(t) = α·ρ(S,C)(t) + β·|dC/dt| + γ·Σwi·fi(t)
        """
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma

    def calculate_rho(self, stress_array: np.ndarray, circadian_array: np.ndarray) -> float:
        """
        Calculates ρ(S,C)(t): The rolling Pearson correlation between Stress and Circadian Phase.
        """
        if len(stress_array) < 2 or np.std(stress_array) == 0 or np.std(circadian_array) == 0:
            return 0.5 # Default fallback correlation
        correlation, _ = pearsonr(stress_array, circadian_array)
        # We take the absolute value or map it since negative correlation might also imply dysregulation
        return abs(correlation)

    def calculate_phase_drift(self, current_phase: float, previous_phase: float, time_delta_hours: float) -> float:
        """
        Calculates |dC/dt|: The absolute rate of change of the circadian phase over time.
        """
        if time_delta_hours == 0:
            return 0.0
        return abs(current_phase - previous_phase) / time_delta_hours

    def calculate_zeitgeber_features(self, features: dict, weights: dict) -> float:
        """
        Calculates γ·Σwi·fi(t): The weighted sum of external zeitgebers (light exposure, meals, activity).
        """
        score = 0.0
        for feature_name, value in features.items():
            weight = weights.get(feature_name, 0.0)
            # Normalize feature value on a 0-1 scale before multiplying
            score += weight * value
        return score

    def compute_live_cii(self, historical_data: pd.DataFrame, current_metrics: dict) -> dict:
        """
        Main execution loop for real-time CII computation.
        historical_data must contain 'stress_level' and 'circadian_marker' columns.
        """
        # 1. Stress-Sleep Correlation α·ρ(S,C)(t)
        if historical_data is not None and not historical_data.empty:
            rho = self.calculate_rho(
                historical_data['stress_level'].values, 
                historical_data['circadian_marker'].values
            )
        else:
            rho = 0.7 # Simulated fallback if no history
            
        component_1 = self.alpha * rho * 100 
        
        # 2. Phase Shift Rate β·|dC/dt|
        # Simulate previous phase from history or use a static shift
        dc_dt = self.calculate_phase_drift(current_metrics.get('phase', 7.0), current_metrics.get('prev_phase', 6.0), 24.0)
        component_2 = self.beta * dc_dt * 100 # Scaled for index
        
        # 3. External Features γ·Σwi·fi(t)
        features = {'light': current_metrics.get('light_norm', 0.5), 'activity': current_metrics.get('activity_norm', 0.6)}
        weights = {'light': 0.6, 'activity': 0.4}
        feature_sum = self.calculate_zeitgeber_features(features, weights)
        component_3 = self.gamma * feature_sum * 100
        
        # Final CII
        cii_val = component_1 + component_2 + component_3
        cii_val = round(min(100.0, max(0.0, cii_val)), 1)
        
        # Risk Categorization
        if cii_val < 40:
            risk = "Low Risk"
            interpretation = "Circadian rhythms are stable and highly synchronized with environmental cues."
        elif cii_val < 70:
            risk = "Moderate Risk"
            interpretation = "Mild misalignment detected. Phase delay may be occurring due to evening stress or light exposure."
        else:
            risk = "High Risk"
            interpretation = "Severe circadian disruption. High stress correlation indicates a self-perpetuating feedback loop of insomnia and hyperarousal."
            
        return {
            "current_cii": cii_val,
            "trend_direction": "upward" if cii_val > 60 else "stable",
            "risk_category": risk,
            "interpretation": interpretation,
            "components": {
                "stress_sleep_correlation": round(component_1, 1),
                "phase_shift_rate": round(component_2, 1),
                "external_zeitgebers": round(component_3, 1)
            },
            "formula_weights": {
                "alpha": self.alpha,
                "beta": self.beta,
                "gamma": self.gamma
            }
        }

cii_engine_instance = CircadianInteractionEngine()
