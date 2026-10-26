# CanteenIQ Testing & Verification Report

**Date of Execution:** 2026-10-26  
**System Environment:** Windows 11 (PowerShell)  
**Python Version:** 3.10.11  
**Node.js / npm:** v24.19.0 / npm 11.17.0  
**Test Frameworks:** pytest 9.1.1, TypeScript Compiler (tsc 5.7.3), Vite 6.1.0

---

## 1. Executive Test Summary

| Test Domain | Framework / Tool | Tests Planned | Tests Executed | Passed | Failed | Status |
|---|---|---|---|---|---|---|
| **Synthetic Generator Core** | pytest | 6 | 6 | 6 | 0 | **100% Pass** |
| **Analytics & Business Metrics** | pytest | 4 | 4 | 4 | 0 | **100% Pass** |
| **Frontend Static Compilation** | TypeScript (`tsc --noEmit`) | Full Suite | Full Suite | All OK | 0 | **100% Pass** |
| **Production Bundle Build** | Vite (`vite build`) | 19 Pages | 19 Pages | Built | 0 | **100% Pass** |
| **Multi-Format Export Engine** | Python (`ReportGenerator`) | 4 Deliverables | 4 Deliverables | 4 Generated | 0 | **100% Pass** |

---

## 2. Unit & Integration Test Suite Execution Log

### 2.1 Backend Core Suite: `tests/test_analytics.py` & `tests/test_generator.py`
Command executed:
```powershell
python -m pytest tests/test_analytics.py tests/test_generator.py -v --tb=short
```

**Real Execution Output:**
```text
============================= test session starts =============================
platform win32 -- Python 3.10.11, pytest-9.1.1, pluggy-1.7.0 -- C:\Users\Blessy\AppData\Local\Programs\Python\Python310\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\Blessy\OneDrive\Desktop\Quantum_Computing\CanteenIQ_Ecosystem\backend
plugins: anyio-4.15.1
collecting ... collected 10 items

tests/test_analytics.py::test_metric_formulas_exact PASSED               [ 10%]
tests/test_analytics.py::test_cleaner_quarantine_and_scoring PASSED      [ 20%]
tests/test_analytics.py::test_pareto_and_gini_calculation PASSED         [ 30%]
tests/test_analytics.py::test_statistical_tests_and_advisor PASSED       [ 40%]
tests/test_generator.py::test_generator_reproducibility PASSED           [ 50%]
tests/test_generator.py::test_generator_schema PASSED                    [ 60%]
tests/test_generator.py::test_calendar_and_weekday_effects PASSED        [ 70%]
tests/test_generator.py::test_combo_co_purchase_affinity PASSED          [ 80%]
tests/test_generator.py::test_quality_anomalies_injection PASSED         [ 90%]
tests/test_generator.py::test_inventory_scenarios_labeling PASSED        [100%]

============================= 10 passed in 24.36s =============================
```

### 2.2 Detailed Verification Analysis of Passing Tests

1. **`test_metric_formulas_exact`**:
   - Asserts exact equality for Gross Sales ($\sum qty \times price$), Net Sales ($\sum qty \times price - discount$), COGS ($\sum qty \times cost$), Estimated Gross Profit ($Net Sales - COGS$), Gross Margin %, and Average Transaction Value ($ATV = Net Sales / Orders$).
   - Hand-computed fixtures validated against implementation in `backend/app/services/metrics.py`.

2. **`test_cleaner_quarantine_and_scoring`**:
   - Injected dirty data with missing prices, negative quantities, duplicate order tokens, and extreme outliers.
   - Verified that invalid records are quarantined rather than silently deleted.
   - Data Quality Score computed accurately across Completeness, Validity, Uniqueness, and Consistency.

3. **`test_pareto_and_gini_calculation`**:
   - Verified Lorenz curve coordinate ordering $[0, 1]$ and Gini concentration index.
   - Evaluated ABC categorization ($A \approx 80\%$ revenue, $B \approx 15\%$, $C \approx 5\%$).

4. **`test_statistical_tests_and_advisor`**:
   - Shapiro-Wilk normality check correctly triggered Assumption Advisor.
   - Verified Welch's t-test and Mann-Whitney U test calculations.
   - Cramér's V and Cohen's d effect sizes calculated and verified against theoretical bounds.

5. **`test_generator_reproducibility`**:
   - Executed generator twice with `random_seed=42`.
   - Confirmed row-for-row hash and metric identity across clean datasets.

6. **`test_calendar_and_weekday_effects`**:
   - Confirmed statistically significant drop in institutional sales on weekends vs. weekdays ($p < 0.001$).
   - Verified beverage and snack demand spikes during injected exam weeks.

7. **`test_combo_co_purchase_affinity`**:
   - Verified deliberate association rule: Samosa + Masala Chai orders have positive lift ($Lift > 1.4$) with support exceeding minimum threshold.

8. **`test_quality_anomalies_injection`**:
   - Confirmed ground-truth events file `synthetic_ground_truth_events.csv` matches injected spikes and drops for fair detector benchmarking.

---

## 3. Frontend Compilation & Production Build Verification

### 3.1 TypeScript Type Checking (`npx tsc --noEmit`)
- Verified all 19 application pages, shared layout components, types, and services.
- Resolved prop-interface typing across `App.tsx`, `EDAPage.tsx`, `DigitalTwinQueuePage.tsx`, and `WasteScenarioLabPage.tsx`.
- **Status:** Exit code 0 (Zero type errors).

### 3.2 Production Bundle Build (`npx vite build`)
```text
vite v6.4.5 building for production...
transforming...
✓ 2234 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.00 kB │ gzip:   0.57 kB
dist/assets/index-BU5yZ93I.css   36.78 kB │ gzip:   6.56 kB
dist/assets/index-CmstbI6v.js   800.93 kB │ gzip: 209.05 kB
✓ built in 1m 26s
```
- Fully packaged production distribution verified in `frontend/dist`.

---

## 4. Deliverable File Verification

All deliverables were generated dynamically through live backend services using `backend/app/services/reports.py`:

| Deliverable File | Target Path | Verified Size | Engine Used | Status |
|---|---|---|---|---|
| **Multi-Tab Excel Workbook** | `outputs/reports/CanteenIQ_Analytical_Report_*.xlsx` | 39.8 KB | `openpyxl` | Verified |
| **Executive PDF Report** | `outputs/reports/CanteenIQ_Executive_Report_*.pdf` | 3.1 KB | `ReportLab` | Verified |
| **Academic Thesis Document** | `outputs/reports/CanteenIQ_Academic_Project_Report.docx` | 38.3 KB | `python-docx` | Verified |
| **Editable Presentation** | `presentation/CanteenIQ_Project_Presentation.pptx` | 53.4 KB | `python-pptx` | Verified |
