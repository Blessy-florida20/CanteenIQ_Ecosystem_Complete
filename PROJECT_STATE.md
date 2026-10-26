# CanteenIQ: Project State Tracker

**System:** Windows 11 (PowerShell)  
**Python:** 3.10.11  
**Node.js:** v24.19.0  
**npm:** 11.17.0  
**Last Updated:** Phase 16 Complete Handover (2026-10-26)

---

## 1. Phase Checklist

- [x] **Phase 1: Workspace Inspection, Setup & Project State Tracker**
- [x] **Phase 2: Synthetic Data Generator ("Canteen World Simulator") & Ground Truth Tests**
- [x] **Phase 3: Core Metrics, Data Cleaning, EDA & Statistical Testing Engine**
- [x] **Phase 4: FastAPI Backend, SQLite Metadata Layer & API Routers**
- [x] **Phase 5: React + Vite + TS + Tailwind Frontend Shell, Filter Bar & Evidence Drawer**
- [x] **Phase 6: Core Analytics Pages (Executive Dashboard, Data Studio, EDA Studio)**
- [x] **Phase 7: Statistical Analysis Laboratory & Demand Forecasting Studio (Backtests & Cards)**
- [x] **Phase 8: Product Associations, Anomaly Detection & Newsvendor Smart Planner**
- [x] **Phase 9: What-If Simulator, Price Elasticity, Recommendation Engine & Decision Tracker**
- [x] **Phase 10: Novelty Modules (Menu Engineering, RFM Cohorts, Digital Twin Queue Sim, Ask CanteenIQ, Drift Monitor, Waste Lab)**
- [x] **Phase 11: Export Engine (Cleaned CSV, Multi-Tab Excel, ReportLab PDF, Editable DOCX & PPTX)**
- [x] **Phase 12: Technical Documentation, Viva Q&A (70 questions), Glossary & Architecture Diagrams**
- [x] **Phase 13: End-to-End System Integration & UI Build Verification**
- [x] **Phase 14: Academic Report & PPTX Slide Generation with Real Outputs & Presentation Notes**
- [x] **Phase 15: Automated Backend & Frontend Test Suite Execution & Verification (10/10 Core Tests Passed, Production Bundle Built)**
- [x] **Phase 16: Final Handover, Demo Script & Acceptance Verification**

---

## 2. Key Architecture & Design Decisions

1. **Isolation Strategy**: All project components live in `CanteenIQ_Ecosystem/` without altering or corrupting outside workspace files.
2. **Offline & Zero-Cost**: Fully local offline analytics, SQLite database, rule-based Ask CanteenIQ offline assistant requiring zero paid APIs or cloud dependencies.
3. **Single Source of Truth**: All financial, sales, margin, and volume metrics defined once in `backend/app/services/metrics.py` and reused across API routers and report engines.
4. **Reproducibility**: Seed-controlled generation with SHA-256 config hashing and explicit manifest outputs.
5. **Honesty & Disclaimers**: Explicit "Simulated data" banners on synthetic datasets, causal disclaimer on Decision Tracker, ground-truth evaluations for anomaly detectors.
6. **No-Leakage Protocol**: Chronological walk-forward rolling-origin backtesting for forecasting models.
7. **Prescriptive Newsvendor Model**: Optimal safety stock balancing underage stockout cost against overage spoilage cost.

---

## 3. Dependency Versions

| Component | Target Version / Installed | Status |
|---|---|---|
| Python | 3.10.11 | Verified |
| Node.js | v24.19.0 | Verified |
| npm | 11.17.0 | Verified |
| FastAPI | 0.162.0 | Installed & Configured |
| Pydantic | ≥2.0 | Installed & Validated |
| scikit-learn | 1.7.2 | Installed & Configured |
| statsmodels | 0.14.0 | Installed & Configured |
| mlxtend | 0.23.4 | Installed & Configured |
| python-docx | 1.2.0 | Installed & Deliverable Verified |
| python-pptx | 1.0.2 | Installed & Deliverable Verified |
| reportlab | 4.4.1 | Installed & Deliverable Verified |
| openpyxl / xlsxwriter | 3.1.5 | Installed & Deliverable Verified |
| pytest | 9.1.1 | 10/10 Passed on Core Suite |
| React / Vite / Tailwind | React 18.3.1, Vite 6.1.0, Tailwind 3.4.17 | Production Bundle Compiled (Zero Errors) |

---

## 4. Commands That Work

- **Setup Everything (One-Click):**
  ```powershell
  .\scripts\setup.ps1
  ```
- **Launch Full Ecosystem (Backend + Frontend):**
  ```powershell
  .\scripts\run_all.ps1
  ```
- **Run Backend Core Tests:**
  ```powershell
  cd backend; python -m pytest tests/test_analytics.py tests/test_generator.py -v
  ```
- **Build Frontend Production Bundle:**
  ```powershell
  cd frontend; npm run build
  ```
- **Generate Fresh Deliverables (Excel, PDF, DOCX, PPTX):**
  ```powershell
  cd backend; python -c "from app.services.reports import ReportGenerator; g = ReportGenerator(); g.generate_excel_workbook(); g.generate_pdf_report(); g.generate_docx_academic_report(); g.generate_pptx_presentation()"
  ```

---

## 5. Generated Deliverable Artifacts

- **Multi-Tab Excel Workbook:** `outputs/reports/CanteenIQ_Analytical_Report_20261026_105920.xlsx` (39.8 KB)
- **Executive PDF Report:** `outputs/reports/CanteenIQ_Executive_Report_20261026_105921.pdf` (3.1 KB)
- **Academic Thesis Document:** `outputs/reports/CanteenIQ_Academic_Project_Report.docx` (38.3 KB)
- **Presentation Slide Deck:** `presentation/CanteenIQ_Project_Presentation.pptx` (53.4 KB)
- **Viva Defense Guide:** `docs/viva/VIVA_QA.md` (70 Questions & Answers)
- **5-Minute Live Demo Script:** `docs/viva/DEMO_SCRIPT.md`
- **Technical Glossary:** `docs/viva/GLOSSARY.md`
- **System Architecture Diagrams:** `docs/diagrams/ARCHITECTURE.md`
- **Testing Verification Report:** `docs/technical/TESTING_REPORT.md`

---

## 6. Next Action

- Ready for Viva examination, demonstration, and evaluation. All 16 phases completed.
