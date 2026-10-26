# CanteenIQ Presentation — 10 to 12 Minute Speaker Notes

## Slide 1: Title & Introduction (0:00 - 0:45)
- **Title:** CanteenIQ: An Intelligent Canteen Sales Analytics, Demand Forecasting, Simulation and Decision Support Ecosystem.
- **Presenter:** [Student Name]
- **Opening:** "Good morning respected evaluators. Today I present CanteenIQ, an end-to-end intelligent decision-support platform designed to transform institutional canteen operations from reactive guesswork into an empirical, closed decision loop."

## Slide 2: Executive Overview & Problem Context (0:45 - 1:30)
- "Most university and institutional canteens face severe operational dilemmas daily: balancing food perishability against peak-hour stockouts. Unsold portions turn directly into monetary loss and food waste, while under-preparing during rush periods leads to student dissatisfaction and lost revenue."
- "Off-the-shelf POS systems merely record transactions as passive receipts. There is no active intelligence connecting raw data back into day-to-day kitchen planning."

## Slide 3: The Innovation Thesis — The Closed Decision Loop (1:30 - 2:30)
- "The core novelty of CanteenIQ is our closed decision loop:
  `Data → Quality → Insight → Forecast → Plan → Simulate → Recommend → Decide → Track → Learn`"
- "Unlike dashboards that stop at charts, CanteenIQ:
  1. Validates and quarantines poor data
  2. Diagnoses historical patterns
  3. Projects future demand without data leakage
  4. Prescribes preparation quantities using operations research (Newsvendor model)
  5. Simulates queuing dynamics with a Digital Twin
  6. Tracks decisions with strict causal honesty."

## Slide 4: System Architecture (2:30 - 3:30)
- "Our architecture is divided into clear decoupled layers:
  - **Frontend:** React 18, Vite, TypeScript, and Tailwind CSS with Recharts for BI-grade visual analytics. Includes global cross-page state, an on-demand Evidence Drawer, and responsive design.
  - **Backend:** Python FastAPI providing structured OpenAPI endpoints, Pydantic v2 data validation, and clean service layers.
  - **Data Science Core:** pandas, NumPy, SciPy, statsmodels, and scikit-learn.
  - **Deliverable Engine:** Automated generation of Excel workbooks, ReportLab PDFs, python-docx academic reports, and editable python-pptx presentations."

## Slide 5: Synthetic World Simulation & Reproducibility (3:30 - 4:30)
- "Due to privacy constraints and the necessity of rigorous detector evaluation, we built a fully configurable, deterministic World Simulator.
- With 24,572 transactions across 15,177 orders and 21 items:
  - Incorporates weekday/weekend patterns and breakfast/lunch/evening rushes
  - Injects academic calendars (exam weeks, semester beginnings)
  - Models weather sensitivity and deliberate co-purchase combos (e.g., Samosa + Masala Chai)
  - Includes isolated ground-truth anomaly logs for objective precision/recall validation."

## Slide 6: Data Studio & Quality Assurance (4:30 - 5:15)
- "In the Data Studio, we uphold data lineage. Records with missing fields, negative prices, or extreme outliers are not silently dropped—they are quarantined into transparent audit tables.
- A composite Data Quality Score (0-100) measures Completeness, Validity, Uniqueness, and Consistency."

## Slide 7: Exploratory & Diagnostic Analytics (5:15 - 6:00)
- "Our EDA Studio provides:
  - Pareto ABC classification and Lorenz curves with Gini coefficient calculation (showing revenue concentration)
  - Hour × Weekday footfall heatmaps identifying dual lunch/evening surges
  - Time-series decomposition isolating true growth trends from cyclical seasonal patterns
  - CUSUM statistical change-point detection identifying operational regime shifts."

## Slide 8: Statistical Hypothesis Testing Laboratory (6:00 - 6:45)
- "Rather than computing superficial statistics, our Laboratory features an automated **Assumption Advisor**:
  - Automatically verifies normality (Shapiro-Wilk) to decide between Welch's t-test and Mann-Whitney U for weekday vs. weekend velocity
  - Runs Chi-square tests of independence for categories vs. payment methods
  - Always pairs p-values with standardized effect sizes (Cohen's d, Cramér's V) and limitation disclaimers to prevent statistical misinterpretation."

## Slide 9: Demand Forecasting Studio (6:45 - 7:45)
- "Forecasting follows strict scientific rigor:
  - Rolling-origin (walk-forward) backtesting across multiple folds
  - Strict chronological splits: no data shuffling, zero data leakage
  - Model Leaderboard evaluating Seasonal Naive baselines, Moving Averages, Holt-Winters ETS, and ML Gradient Boosting
  - Prediction intervals and individual Model Cards documenting hyperparameters and limitations."

## Slide 10: Prescriptive Operations: Newsvendor Preparation Planner (7:45 - 8:30)
- "In our Preparation Planner, we implement the classic **Newsvendor Model** from Operations Research:
  - Balances underage cost ($C_u$, profit margin lost on stockout) against overage cost ($C_o$, portion cost lost to spoilage)
  - Calculates the exact Critical Ratio: $CR = \frac{C_u}{C_u + C_o}$
  - Runs Monte Carlo simulations to quantify stockout vs. surplus risk distributions."

## Slide 11: What-If Simulator & Market Basket Mining (8:30 - 9:15)
- "Our What-If Simulator models price elasticity via log-log regression, tornado sensitivity charts, and break-even thresholds.
- Association mining via Apriori/FP-Growth extracts high-lift item combinations (e.g., Samosa + Chai, Lift: 1.8+) with a bundle margin simulator and minimum-support guards."

## Slide 12: Canteen Digital Twin, Offline Assistant & Drift Monitor (9:15 - 10:15)
- "Our advanced modules include:
  - **Digital Twin:** Discrete-event queue simulation applying M/M/c queueing theory to recommend optimal hourly counter staffing
  - **Ask CanteenIQ:** A 100% offline, deterministic intent-based natural language assistant requiring zero cloud LLMs or paid APIs
  - **Drift Monitor:** Two-sample Kolmogorov-Smirnov distribution tests flagging when operational shifts necessitate model retraining."

## Slide 13: Decision Tracker & Deliverables (10:15 - 11:00)
- "The Decision Tracker enforces causal modesty: before/after comparisons always state clearly that correlation is not proof of causality.
- All live analytical tables and reports export seamlessly into multi-tab Excel workbooks, executive PDFs, academic DOCX theses, and PowerPoint presentations."

## Slide 14: Conclusion & Viva Readiness (11:00 - 11:45)
- "In conclusion, CanteenIQ demonstrates how modern full-stack web technologies and rigorous data science can solve real operational challenges through explainability, reproducibility, and ethical transparency.
- The system is fully tested with unit and integration suites, comprehensive documentation, and 70 viva defense questions. Thank you, and I welcome your questions."
