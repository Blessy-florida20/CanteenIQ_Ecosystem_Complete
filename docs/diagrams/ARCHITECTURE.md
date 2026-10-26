# CanteenIQ System Architecture & Data Flow Specification

## 1. High-Level Architecture Overview

The CanteenIQ ecosystem is built around an offline, decoupled client-server architecture designed for zero operating costs, full determinism, and strict local privacy.

```mermaid
graph TD
    User([Canteen Manager / Evaluator]) -->|UI Navigation & Filters| Frontend[React + Vite + TypeScript Frontend]
    Frontend -->|REST API Requests :5173 /api| API[FastAPI Gateway :8000]
    
    subgraph FastAPI Backend Layer
        API --> Routers[API Routers: Datasets, Analytics, Models, Planner, Simulator, Novelty, Reports]
        Routers --> Schemas[Pydantic v2 Request/Response Schemas]
        Routers --> Services[Analytics & ML Services Layer]
        Routers --> DB[(SQLite Metadata Database)]
    end

    subgraph Analytical Core Services
        Services --> MetricsSvc[Metrics Engine - Single Source of Truth]
        Services --> EDASvc[EDA & Time-Series Decomposition]
        Services --> StatsSvc[Statistical Lab & Assumption Advisor]
        Services --> ForecastSvc[Rolling Backtest Forecasting Engine]
        Services --> AssocsSvc[Apriori / FP-Growth Market Basket Mining]
        Services --> AnomalySvc[Multi-Detector Anomaly Engine]
        Services --> PlannerSvc[Newsvendor Batch Preparation Planner]
        Services --> SimSvc[What-If Elasticity & Discrete-Event Queue Sim]
        Services --> AssistantSvc[Deterministic Offline NLP Assistant]
        Services --> DriftSvc[KS Two-Sample Drift Monitor]
    end

    subgraph Data & Storage Persistence
        Services --> SyntheticGen[Synthetic World Simulator]
        SyntheticGen --> RawData[(data/synthetic/*.csv)]
        Services --> ProcessedData[(data/processed/*.csv)]
        Services --> Artifacts[(outputs/reports: xlsx, pdf, docx, pptx)]
    end
```

---

## 2. The Closed Decision Loop

CanteenIQ implements an end-to-end feedback loop connecting raw POS transactions directly into operational interventions.

```mermaid
flowchart LR
    A[1. Ingest Data] --> B[2. Audit Quality]
    B --> C[3. Diagnostic Insights]
    C --> D[4. Demand Forecast]
    D --> E[5. Newsvendor Plan]
    E --> F[6. Queue Simulation]
    F --> G[7. Prescriptive Recomms]
    G --> H[8. Implement Decision]
    H --> I[9. Track Impact]
    I -->|Feedback & Retraining| D
```

---

## 3. Data Lineage and Cleaning Architecture

```mermaid
graph TD
    RawCSV[Raw Transaction CSV / Generator] --> SchemaVal{Schema Validation}
    SchemaVal -->|Missing Columns / Invalid Types| ErrorLog[Rejection Log]
    SchemaVal -->|Valid Schema| CleanPass[Cleaning Pipeline]
    
    CleanPass --> DupCheck{Duplicate Check}
    DupCheck -->|Duplicate ID| Quarantine[Quarantine Review Table]
    DupCheck -->|Unique| ValCheck{Value Validation: Qty > 0, Price > 0}
    
    ValCheck -->|Invalid Range| Quarantine
    ValCheck -->|Valid| OutlierCheck{IQR Outlier Detection}
    
    OutlierCheck -->|Extreme Value| FlaggedSet[Cleaned with Outlier Tag]
    OutlierCheck -->|Standard| CleanDF[Processed Dataset: data/processed]
    
    CleanDF --> Analytics[Analytics & Modeling Engine]
    Quarantine --> AuditReport[Data Quality Audit Score]
```

---

## 4. Forecasting Studio: No-Leakage Backtest Architecture

```mermaid
sequenceDiagram
    participant User as Canteen Operator
    participant API as /api/models/forecast
    participant Engine as Forecasting Engine
    participant DB as Experiment Registry (SQLite)

    User->>API: POST {target: net_sales, horizon: 14, folds: 3}
    API->>Engine: Initiate Rolling Walk-Forward Split
    loop Chronological Folds
        Engine->>Engine: Split Train (t=0..N) & Test (t=N..N+h)
        Note over Engine: Strict assert max(train) < min(test) (No Future Leakage)
        Engine->>Engine: Train Baselines (Seasonal Naive, MA-7)
        Engine->>Engine: Train ETS / Holt-Winters & ML Regressors
        Engine->>Engine: Evaluate MAE, RMSE, sMAPE, Bias
    end
    Engine->>Engine: Rank Leaderboard & Select Lowest-RMSE Winner
    Engine->>Engine: Compute Residual-Based Prediction Intervals
    Engine->>DB: Store Model Run Metadata & Model Card
    Engine-->>API: Return Leaderboard, Predictions, Model Cards
    API-->>User: Render Interactive Visual Leaderboard & Forecast
```
