# CanteenIQ 5-Minute Live Viva Demo Script

**Objective:** Guide the student through a smooth, compelling 5-minute live demonstration of the CanteenIQ ecosystem in front of academic examiners.

---

## 🕒 Timing & Page Navigation Roadmap

```
[00:00 - 00:45] Intro & Executive Dashboard
[00:45 - 01:30] Data Studio: Lineage & Quality Auditing
[01:30 - 02:30] Diagnostic EDA & Statistical Hypothesis Lab
[02:30 - 03:30] Demand Forecasting Studio & Model Leaderboard
[03:30 - 04:15] Prescriptive Operations: Newsvendor Planner & What-If
[04:15 - 05:00] Novelty Modules & Live Report Export
```

---

## Step 1: Launch the Application (Prior to Demo)

Run in PowerShell:
```powershell
.\scripts\run_all.ps1
```
Open your browser to `http://localhost:5173`. Toggle into **Dark Mode** (or Light Mode based on room lighting) via the sun/moon icon on the top right.

---

## Step 2: [00:00 - 00:45] Executive Dashboard

1. **Point to the Header:**
   - *"Respected evaluators, this is CanteenIQ's Executive Dashboard. On top, notice our persistent ethical disclaimer: all active campus figures are evaluated on benchmark institutional data."*
2. **Highlight the Top KPIs:**
   - Point to **Net Revenue**, **Gross Profit & Margin %**, and **Portions Sold**.
   - Click the **"Eye" icon** on the Gross Margin card to open the **Evidence Drawer**.
   - *"Every single KPI in CanteenIQ is explainable. Clicking the Evidence Drawer displays the exact algebraic formula used, the sample size, and the row count."*
3. **Show the Canteen Health Score:**
   - Point to the **Health Score (e.g. 88 / 100)**:
   - *"Unlike opaque black-box indices, our Canteen Health Score exposes its exact weights: 30% margin health, 25% data quality, 25% demand stability, and 20% operational ATV."*

---

## Step 3: [00:45 - 01:30] Data Studio (Lineage & Cleaning Engine)

1. **Click "Data Studio" in the sidebar.**
2. **Explain the Lineage View:**
   - Show the dataset overview: 24,572 clean transactions, 21 items.
   - Switch to the **Data Quality** tab showing the breakdown (Completeness, Validity, Uniqueness, Consistency).
3. **Demonstrate Data Integrity:**
   - *"CanteenIQ enforces strict data governance. When processing dirty files, we never silently drop corrupted transactions. They are isolated into a reviewable Quarantine Table, preserving full data lineage."*

---

## Step 4: [01:30 - 02:30] EDA Studio & Statistical Lab

1. **Click "Exploratory EDA" in the sidebar:**
   - Point to the **Pareto (ABC) Curve** and the calculated **Gini coefficient**.
   - Point to the **Hour × Weekday Footfall Heatmap**: *"Notice the dual daily surges: Lunch between 12:00 and 14:00, and evening tea snacks between 16:30 and 18:00."*
2. **Navigate to "Statistical Lab":**
   - Scroll to the **Weekday vs. Weekend Sales Velocity Card**.
   - Point out the **Assumption Advisor**:
   - *"Notice our Assumption Advisor: it checks normality via Shapiro-Wilk. Because weekend variance diverges, it automatically selects Welch's t-test or Mann-Whitney U, and pairs the p-value with Cohen's d effect size so we do not over-interpret statistical significance."*

---

## Step 5: [02:30 - 03:30] Demand Forecasting Studio

1. **Click "Demand Forecasting" in the sidebar:**
   - Change the forecast horizon slider (e.g., to 14 days) and observe the interactive forecast graph with confidence bands.
2. **Explain the Evaluation Rigor:**
   - *"Our forecasting follows a strict no-leakage protocol: chronological rolling-origin (walk-forward) backtesting across multiple folds."*
3. **Show the Model Leaderboard:**
   - Highlight how models (Seasonal Naive baseline, Moving Average, Holt-Winters, Gradient Boosting) compete on holdout RMSE, MAE, and sMAPE.
   - Click **"View Model Card"** on the winning model to display its hyperparameters, split timestamps, and operational limitations.

---

## Step 6: [03:30 - 04:15] Operations: Newsvendor Planner & What-If Simulator

1. **Click "Preparation Planner":**
   - Select an item (e.g., Samosa or Veg Thali).
   - Point to the **Newsvendor Optimal Quantity**:
   - *"Here we transition from predictive to prescriptive analytics. Using the Newsvendor model from Operations Research, we balance the underage cost of stockout against the overage cost of food spoilage, computing the exact Critical Ratio."*
2. **Briefly click "What-If Simulator":**
   - Drag the Price Change slider (+5%) and show the resulting profit impact, price elasticity estimate, and tornado sensitivity chart.

---

## Step 7: [04:15 - 05:00] Novelty Modules & Live Export

1. **Click "Ask CanteenIQ":**
   - Click one of the pre-set query pills: *"What are the top 5 products by revenue?"*
   - Show the instant response: *"Notice this operates 100% offline with zero cloud LLMs, parsing user intent deterministically and showing the exact SQL/formula applied."*
2. **Click "Reports & Exports":**
   - Show the generated deliverable list: Excel, PDF, DOCX, and PPTX.
   - *"All deliverables are generated dynamically from live data using python-docx, ReportLab, and openpyxl, ensuring every number in the report matches what is displayed on the screen."*
3. **Closing Statement:**
   - *"Thank you. CanteenIQ demonstrates a complete, transparent, and reproducible decision ecosystem. I am now ready for your questions."*
