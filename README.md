# CanteenIQ Ecosystem — Complete README

> **Intelligent Canteen Sales Analytics, Demand Forecasting, Simulation and Decision Support Ecosystem**

---

## 🎯 Project Summary

CanteenIQ is a full-stack AI-powered analytics platform for institutional canteens. It demonstrates a **closed decision loop**:

```
Data → Quality → Insight → Forecast → Plan → Simulate → Recommend → Decide → Track → Learn
```

It combines descriptive, diagnostic, predictive, prescriptive and simulation analytics in one explainable system, built entirely offline with no paid APIs or cloud services.

---

## ⚡ Quick Start (Windows)

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or pnpm

### One-command Setup
```powershell
cd CanteenIQ_Ecosystem
.\scripts\setup.ps1
```

### Run the App
```powershell
.\scripts\run_all.ps1
```

Then open:
- 🌐 **Frontend:** http://localhost:5173
- 🔧 **Backend API:** http://localhost:8000
- 📚 **API Docs (Swagger):** http://localhost:8000/docs

---

## 🛠️ Manual Setup

### Backend
```powershell
cd backend
pip install -r requirements.txt
cd ..
python scripts/generate_data.py
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

---

## 🗂️ Project Structure

```
CanteenIQ_Ecosystem/
├── PROJECT_STATE.md          # Phase tracker & state
├── README.md                 # This file
├── .gitignore
│
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint
│   │   ├── api/routers/      # Thin HTTP handlers (9 routers)
│   │   ├── services/         # Business logic (14 modules)
│   │   ├── schemas/          # Pydantic v2 schemas
│   │   ├── database/         # SQLite init & models
│   │   └── core/             # Config, logging, errors
│   ├── tests/                # pytest test suite (23 tests)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # 19 application pages
│   │   ├── components/       # Shared components (Navbar, Sidebar, etc.)
│   │   ├── services/api.ts   # Typed API client
│   │   └── types/api.ts      # Shared TypeScript types
│   ├── package.json
│   └── vite.config.ts        # Dev proxy → backend:8000
│
├── data/
│   ├── synthetic/            # Generated datasets (CSV, JSON)
│   └── processed/            # Cleaned datasets
│
├── models/                   # Saved forecast model artifacts (joblib)
├── outputs/
│   ├── reports/              # Generated Excel, PDF, DOCX, PPTX
│   └── charts/               # Static chart images
│
├── docs/
│   ├── technical/            # Architecture, API docs, testing report
│   ├── viva/                 # 60+ Q&A, glossary
│   └── diagrams/             # Mermaid architecture diagrams
│
├── presentation/
│   ├── CanteenIQ_Presentation.pptx
│   └── speaker_notes.md
│
└── scripts/
    ├── generate_data.py      # Synthetic data generator
    ├── setup.ps1             # One-time setup
    ├── run_all.ps1           # Start both servers
    └── reset_demo.py         # Reset to demo state
```

---

## 📊 Application Pages (19 Total)

| # | Page | Key Features |
|---|------|-------------|
| 1 | Executive Dashboard | KPIs, trends, health score, category breakdown |
| 2 | Data Studio | Generator, upload, cleaner, lineage, quality score |
| 3 | EDA Studio | Pareto/ABC, heatmap, decomposition, change-points |
| 4 | Statistical Lab | Tests (t-test, ANOVA, chi-square), effect sizes, assumption advisor |
| 5 | Forecasting Studio | SARIMA, ETS, ML models, backtesting, leaderboard, model cards |
| 6 | Association Mining | Apriori/FP-Growth, network graph, bundle simulator |
| 7 | Anomaly Detection | IQR, MAD, Isolation Forest, precision/recall vs ground truth |
| 8 | Preparation Planner | Newsvendor model, Monte Carlo, batch planning |
| 9 | What-If Simulator | Price elasticity, tornado chart, Monte Carlo bands |
| 10 | Recommendations | Deterministic rules, priority scores, evidence links |
| 11 | Decision Tracker | Log decisions, before/after comparison, causal caveats |
| 12 | Menu Engineering | Stars/Plowhorses/Puzzles/Dogs matrix, ABC/XYZ |
| 13 | Customer Insights | RFM, K-Means segments, retention cohort heatmap |
| 14 | Digital Twin | Discrete-event queue simulation, staffing recommendations |
| 15 | Ask CanteenIQ | Offline NL assistant (keyword/intent-based) |
| 16 | Drift Monitor | KS test, category mix shift, retraining alerts |
| 17 | Waste Scenario Lab | Policy comparison simulation, Monte Carlo |
| 18 | Reports & Exports | Excel, PDF, DOCX, PPTX generation |
| 19 | Methodology Info | Architecture diagrams, data dictionary, ethics |

---

## 🧪 Testing

### Backend (pytest)
```powershell
cd backend
python -m pytest tests/ -v
```

Expected: **23 tests** across generator, analytics, and API.

### Frontend
```powershell
cd frontend
npm test
```

---

## 📐 Architecture Overview

```
Browser (React + Vite + TypeScript)
    ↕ REST API (port 5173 → proxy → 8000)
FastAPI (Python 3.10)
    ├── Analytics Services (pandas, NumPy, SciPy, statsmodels)
    ├── ML Services (scikit-learn: forecasting, clustering, Isolation Forest)
    ├── Association Mining (mlxtend: Apriori/FP-Growth)
    └── SQLite (metadata, runs, decisions, reports)
```

---

## ⚖️ Ethics & Honesty Statement

- All data is **synthetic** unless you upload your own CSV.
- Results show how methods behave on **simulated data**, not validated canteen performance.
- Forecasts are uncertain. Anomalies are not accusations. Recommendations are decision support.
- Simulation outputs are **hypotheticals**. Before/after comparisons do **not** prove causation.
- Customer data is **pseudonymous** (CUST_XXXX tokens) and minimized.

---

## 📋 Dependency Versions

| Component | Version |
|-----------|---------|
| Python | 3.10.11 |
| FastAPI | ≥0.110 |
| Pydantic | ≥2.0 |
| scikit-learn | ≥1.3 |
| statsmodels | ≥0.14 |
| mlxtend | ≥0.23 |
| pandas | ≥2.0 |
| React | 18.3.1 |
| Vite | 6.x |
| Tailwind CSS | 3.x |
| TypeScript | 5.x |

---

## 🎓 Academic Context

This project was developed as part of a final-year data science academic project demonstrating:
- Full data science lifecycle (CRISP-DM adapted)
- Integration of descriptive, diagnostic, predictive, and prescriptive analytics
- Reproducible ML with chronological backtesting and no data leakage
- Explainable AI with evidence-linked recommendations
- Ethical AI with honest disclaimers and privacy-by-design

---

*CanteenIQ v2.0 — Academic Project — Synthetic Data Only*
