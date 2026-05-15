# FINAL: Analytics Pipeline & Workflow

## 🔄 End-to-End Execution Flow

### 1. Dataset Upload & Validation
*   The clinician uploads a longitudinal CSV health record.
*   The system validates the schema and normalizes biometric inputs (HRV, Sleep, Cortisol, Light).

### 2. Backend Processing & Ingestion
*   The `LiveAnalyticsEngine` clears previous user history.
*   Vectorized ML inference is performed on the backfilled data (up to 300+ records).
*   Prediction records, CII trends, and RL interventions are bulk-persisted to the database.

### 3. Analytics Computation & Caching
*   The system computes heavy analytics modules (SHAP, Patient Journey, CII Timeline).
*   Results are stored in the `AnalyticsCache` table to prevent redundant recomputation.

### 4. Global State Synchronization
*   The frontend receives a "Processing Complete" signal.
*   The `AnalyticsProvider` triggers `refreshAll()`, fetching all core results in parallel.
*   Data is stored in the persistent `AnalyticsContext` for the duration of the session.

### 5. Dashboard Rendering & Intelligence
*   **AI Dashboard**: Real-time KPI summaries and risk alerts.
*   **Explainability**: SHAP-based feature contribution analysis.
*   **RL Simulation**: Policy evaluation and intervention rewards.
*   **Patient Journey**: Temporal biomarker evolution and recovery curves.

## ⚡ Performance Strategy
*   **Persistence**: Analytics survive tab navigation and route changes.
*   **Speed**: Caching reduces SHAP load times from seconds to milliseconds.
*   **Reliability**: Recomputation only occurs on **New Upload**, ensuring stable sessions.
