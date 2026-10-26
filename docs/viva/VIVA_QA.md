# CanteenIQ — Viva Q&A Guide (60+ Questions)

> Prepared for academic project defence/viva. Each question includes a concise, honest answer a student can explain.

---

## Section 1: Project Overview & Motivation

**Q1. What is CanteenIQ and what problem does it solve?**
> CanteenIQ is an intelligent canteen analytics ecosystem. The core problem is that most institutional canteens operate on guesswork — managers prepare food based on intuition, leading to overstocking (waste), understocking (lost sales), and inefficient staffing. CanteenIQ provides a data-driven closed decision loop: Data → Quality → Insight → Forecast → Plan → Simulate → Recommend → Decide → Track → Learn.

**Q2. What is the novelty of this project compared to a simple sales dashboard?**
> Standard dashboards only show what happened (descriptive). CanteenIQ adds:
> - *Diagnostic*: Why did sales change? (EDA, anomaly detection, change-point detection)
> - *Predictive*: What will happen? (Backtested forecasting with leaderboard)
> - *Prescriptive*: What should we do? (Newsvendor planner, recommendation engine)
> - *Simulation*: What if? (Digital twin, price elasticity, Monte Carlo scenarios)
> This is called an "analytics maturity pyramid" — most systems only reach the first level.

**Q3. Why did you build with synthetic data instead of real canteen data?**
> Two reasons: (1) No real canteen data was available that met privacy and consent requirements. (2) Synthetic data allows us to inject known patterns (anomalies, co-purchase combos, seasonal effects) and then verify that our analytics methods detect them correctly — giving us ground-truth evaluation, which is impossible with real data unless you know every truth in advance.

**Q4. What are the ethical considerations in this project?**
> - Synthetic data only, with a persistent banner so no one mistakes results for real performance.
> - Customer IDs are pseudonymous tokens (CUST_XXXX), never real names or PII.
> - We never say anomalies are "fraud" — only "unusual observations requiring review."
> - We explicitly warn that before/after comparisons do not prove causation.
> - All simulation outputs are labeled "hypothetical."

**Q5. What is the "closed decision loop" concept?**
> It means the system completes a full cycle: (1) Collect and clean data. (2) Analyse patterns. (3) Forecast future demand. (4) Plan preparation quantities. (5) Simulate what-if scenarios. (6) Generate recommendations. (7) Track decisions made and outcomes. (8) Learn from results to improve future forecasts. This creates a feedback loop rather than a one-off analysis.

---

## Section 2: Data & Synthetic Generator

**Q6. How does your synthetic data generator work?**
> It uses a configurable Canteen World Simulator. Given a random seed and config (date range, products, calendar settings), it generates 24,572 transactions across 15,177 orders and 21 products. The generator applies: (a) hourly/weekday demand patterns, (b) academic calendar effects (exam week, semester start, holidays), (c) weather effects, (d) product co-purchase affinities (deliberately elevated combo pairs), and (e) anomaly injection with ground-truth labeling.

**Q7. What is reproducibility and why does it matter?**
> Same seed + same config = identical dataset. This is critical for scientific integrity: anyone can reproduce your results exactly. We achieve this using Python's `random.seed()` and NumPy's `np.random.seed()`. We also store a SHA-256 hash of the config in a dataset manifest file.

**Q8. What fields does each transaction record contain?**
> `transaction_id`, `transaction_date`, `transaction_time`, `order_id` (groups rows into baskets), `product_id`, `product_name`, `category`, `quantity`, `unit_price`, `unit_cost`, `discount`, `payment_method`, `customer_id` (pseudonymous), and optionally a `weather` flag and `is_exam_week` flag.

**Q9. Why do you group multiple rows into orders (baskets)?**
> Association rule mining (Apriori/FP-Growth) requires basket-level data — it needs to know which items were purchased together in the same transaction. Without `order_id` grouping, you cannot reliably mine co-purchase patterns.

**Q10. What are the injected "product stories"?**
> Deliberately designed patterns: (1) A "rising healthy item" (Multigrain Sandwich) with increasing demand over months. (2) A "declining dessert" with falling popularity. (3) A combo pair — Samosa + Chai — with deliberately elevated co-purchase probability so the association miner can detect it. (4) A price-sensitive item whose demand visibly responds to simulated price changes.

**Q11. What is the ground-truth events file and how is it used?**
> `synthetic_ground_truth_events.csv` records every injected anomaly (date, product, type, expected effect). We use this to evaluate anomaly detectors: we check if the detector flagged the date when we injected a spike/drop. This gives precision, recall, and F1 — honest evaluation metrics rather than subjective claims.

---

## Section 3: Metrics & Business Logic

**Q12. How is "net sales" different from "gross sales"?**
> - **Gross sales** = Σ(quantity × unit_price) — total value before any discounts.
> - **Net sales** = Σ(quantity × unit_price − discount) — after subtracting line-level absolute discounts.
> - Net sales is the more accurate revenue figure for profitability analysis.

**Q13. How do you calculate gross profit margin?**
> Gross margin % = (net_sales − COGS) / net_sales × 100, where COGS = Σ(quantity × unit_cost). We guard against zero division when net_sales = 0.

**Q14. What is the Average Transaction Value (ATV)?**
> ATV = net_sales / count(unique order_ids). It measures how much revenue each customer order generates on average.

**Q15. What is the Canteen Health Score?**
> A composite score (0-100) with four documented weighted components:
> - Margin Health (30%): Based on gross margin % vs a benchmark.
> - Data Quality (25%): Completeness, validity, uniqueness scores.
> - Demand Stability (25%): Coefficient of variation of daily sales (lower = more stable).
> - Operational ATV (20%): ATV relative to menu average price.
> Each component is normalized and the weighted average gives the overall score. The formula, weights, and component scores are all shown in the UI.

---

## Section 4: Data Quality & Cleaning

**Q16. What data quality issues do you detect and handle?**
> - **Missing values**: NaN in critical fields → quarantined.
> - **Duplicates**: Identical transaction_id rows → flagged, one kept.
> - **Invalid values**: Negative quantity, zero/negative price → quarantined.
> - **Outliers**: Values > IQR × 3 threshold → flagged.
> Cleaned records go to the processed dataset; questionable ones go to a quarantine table for review.

**Q17. Why not silently drop bad records?**
> Because silent drops can skew analyses. If many records are dropped for the same product, its sales appear artificially low. The quarantine approach means: (a) we track exactly what was removed and why, (b) the user can review and decide, (c) we maintain data lineage (raw → cleaned).

**Q18. What is the data quality score?**
> A number 0-100 with four dimensions: Completeness (no missing values), Validity (values in expected ranges), Uniqueness (no duplicates), Consistency (cross-field checks e.g., unit_cost ≤ unit_price). Each is normalized and averaged.

---

## Section 5: EDA & Statistics

**Q19. What is Pareto / ABC analysis?**
> Based on the Pareto principle (80/20 rule): 80% of revenue typically comes from 20% of products. We rank products by revenue share and cumulative share:
> - **A-class**: top ~20% of products contributing ~80% of revenue.
> - **B-class**: next 30% contributing ~15%.
> - **C-class**: bottom 50% contributing ~5%.
> We also compute the Gini coefficient (0 = perfectly equal, 1 = one product has all revenue) and a Lorenz curve.

**Q20. What is the Gini coefficient in this context?**
> It measures revenue concentration. A Gini of 0.65 means revenue is moderately concentrated (a few top products drive most sales). In our synthetic data, we deliberately create some high-selling products to make this analysis interesting.

**Q21. What statistical tests do you run and why those specific tests?**
> - **Weekday vs Weekend Sales**: Welch's t-test (parametric) or Mann-Whitney U (non-parametric) after checking normality via Shapiro-Wilk. We use the Assumption Advisor to pick automatically.
> - **Category vs Payment Method**: Chi-square test of independence (both are categorical variables).
> - **Discount vs No-Discount Basket Value**: Mann-Whitney U (distribution is typically skewed).
> - **Stationarity for Forecasting**: ADF (Augmented Dickey-Fuller) test.

**Q22. What is an effect size and why do you report it?**
> A p-value only tells you if a result is statistically significant, not how large the difference is. Effect size quantifies the magnitude:
> - Cohen's d for t-tests: small=0.2, medium=0.5, large=0.8.
> - Cramér's V for chi-square: small=0.1, medium=0.3, large=0.5.
> With large datasets, even tiny meaningless differences can become significant. Effect sizes prevent over-interpreting trivial results.

**Q23. What is seasonal decomposition?**
> Decomposing a time series into three components using STL or additive decomposition:
> - **Trend**: Long-term direction (increasing/decreasing sales).
> - **Seasonal**: Repeating periodic patterns (weekly lunch peak, monthly patterns).
> - **Residual**: What remains after removing trend and seasonality — random noise.
> This helps identify true underlying growth vs seasonal artifacts.

**Q24. What is change-point detection?**
> An algorithm that identifies dates when the statistical properties of the time series changed significantly — for example, when a new product launched, a promotion ran, or exam season started. We use a CUSUM (Cumulative Sum) approach with a configurable threshold.

---

## Section 6: Demand Forecasting

**Q25. What forecasting models do you implement?**
> - **Seasonal Naive**: Baseline — repeat last week's sales (easy benchmark).
> - **Moving Average**: 7-day rolling average.
> - **Holt-Winters (ETS)**: Exponential smoothing with trend and seasonality components.
> - **SARIMA**: Seasonal ARIMA with academic calendar regressors.
> - **Gradient Boosting (scikit-learn)**: ML model with engineered lag/rolling/calendar features.
> - **Ensemble**: Simple average of top 2 models.

**Q26. How do you prevent data leakage in forecasting?**
> Strict chronological split with no shuffling:
> - Training data: days 1 to N.
> - Validation: days N+1 to N+horizon.
> - Test: days N+horizon+1 to end.
> Lag features (lag_7, lag_14) and rolling averages are computed only using dates *before* the current date — never future data. We assert this with a unit test: `assert max(train_index) < min(test_index)`.

**Q27. What is walk-forward (rolling-origin) backtesting?**
> Instead of one train/test split, we do multiple folds:
> - Fold 1: Train on months 1-6, test on month 7.
> - Fold 2: Train on months 1-7, test on month 8.
> - Fold 3: Train on months 1-8, test on month 9.
> This gives a more robust estimate of model performance across different time periods and reduces the chance of the test period being unusually easy or hard.

**Q28. What forecast evaluation metrics do you use?**
> - **MAE** (Mean Absolute Error): Average absolute error in original units. Easy to interpret.
> - **RMSE** (Root Mean Squared Error): Penalizes large errors more — important for planning.
> - **sMAPE** (Symmetric MAPE): Percentage error, symmetric between over/under-forecasting.
> - **Bias**: Average (forecast − actual) — positive means consistently over-forecasting.
> - **Improvement vs Baseline**: % improvement over Seasonal Naive — ensures ML model earns its complexity.

**Q29. What are prediction intervals and why are they important?**
> A forecast (e.g., "120 portions tomorrow") is a point estimate with uncertainty. Prediction intervals give a range (e.g., "85 to 155 portions with 80% confidence"). They're critical for planning: you prepare based on the upper bound to manage stock-out risk, or use the newsvendor formula to optimally trade off over/under-preparation costs.

**Q30. What is the model leaderboard?**
> A ranked table showing all tested models, their MAE/RMSE/sMAPE, bias, and improvement over baseline. The winner is selected based on lowest RMSE on the backtested holdout. A model card documents each run: data coverage, split dates, hyperparameters, metrics, and limitations.

---

## Section 7: Association Rule Mining

**Q31. How does Apriori / FP-Growth work?**
> Given a set of baskets (orders), these algorithms find item combinations that appear frequently together. The key measures are:
> - **Support**: P(A and B) — how often the pair appears in all orders.
> - **Confidence**: P(B | A) — given A is in the order, how often is B also there?
> - **Lift**: Confidence / P(B) — does A buying make B more likely than random? Lift > 1 means positive association.
> FP-Growth is typically faster than Apriori for large datasets.

**Q32. What are leverage and conviction?**
> - **Leverage**: support(A,B) - support(A) × support(B) — how much more often A and B appear together than expected if independent. Positive leverage = positive association.
> - **Conviction**: (1 - support(B)) / (1 - confidence(A→B)) — measures how much the rule would lose confidence if A and B were independent. High conviction = strong directional rule.

**Q33. Why do you need a minimum support guard?**
> Without a minimum support threshold, you can generate rules from just 2-3 orders (e.g., "on Tuesday 3 weeks ago, one person bought both X and Y"). Such rules have no statistical validity. We set min_support ≥ 0.01 (appears in at least 1% of orders) and warn when rules have very low support.

**Q34. What is the bundle simulator?**
> Given a discovered association rule (e.g., Samosa → Chai, lift=1.8), the bundle simulator estimates: "If we offer Samosa + Chai as a discounted combo at ₹35 (normally ₹40 together), what is the estimated margin impact?" It uses average unit margins and assumes the discount brings additional customers. The output is clearly labeled "hypothetical estimate."

---

## Section 8: Anomaly Detection

**Q35. What anomaly detection methods do you implement?**
> - **IQR (Interquartile Range)**: Flags daily sales outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR].
> - **Robust Z-Score (Median/MAD)**: Z = |x - median| / MAD — robust to outliers unlike standard Z-score.
> - **Rolling Baseline**: Compares each day to a 7-day rolling mean ± 2 standard deviations.
> - **Isolation Forest**: ML-based, works by randomly isolating data points — anomalies are isolated in fewer splits.

**Q36. How do you evaluate anomaly detectors honestly?**
> Because we injected anomalies with ground-truth labels, we can compute precision (of everything flagged as anomalous, what fraction actually is?), recall (of actual anomalies, what fraction did we catch?), and F1. This is only possible because we used synthetic data with known ground truth. We present this as "demonstration of detector behavior" — not claimed performance on real data.

**Q37. Why do you call them "unusual observations" rather than anomalies or fraud?**
> Statistical outliers have many benign explanations: a university event causing a sales spike, a campus holiday causing a drop, a system outage, or a catering order. We never call them "fraud" or "suspicious" because that requires human investigation and context. The system surfaces them for review, not accusation.

---

## Section 9: Preparation Planner

**Q38. What is the Newsvendor model?**
> A classic operations research model for products with uncertain demand and perishability (like food). Given:
> - Underage cost (Cu): profit margin lost per unit short (stock-out cost)
> - Overage cost (Co): cost per unit unsold/wasted
> The optimal quantity Q* satisfies: P(demand ≤ Q*) = Cu / (Cu + Co) = Critical Ratio.
> This balances the cost of ordering too little vs too much.

**Q39. Why is the newsvendor model appropriate for a canteen?**
> Because canteen food is: (1) perishable — unsold portions are wasted (overage cost), (2) in uncertain demand — you don't know exactly how many students will come, (3) ordered in advance — you prepare in the morning before the rush. These three conditions make it a classic newsvendor problem.

**Q40. What is the safety buffer in the basic planner formula?**
> `suggested_quantity = max(0, forecast × (1 + safety_buffer) − usable_stock)`, rounded to batch size. For example, if forecast = 100 portions and safety_buffer = 0.15, we plan for 115 to cover demand uncertainty. This is simpler than newsvendor but the UI offers both approaches.

**Q41. What is Monte Carlo simulation in the context of the planner?**
> We sample from the forecast's uncertainty distribution (using prediction interval as the range) many times (e.g., 1000 simulations) and for each sample compute: leftover units and shortage units. The distribution of these gives us: (1) probability of stock-out, (2) expected leftover units, (3) expected profit. This is more honest than a point estimate.

---

## Section 10: What-If Simulator

**Q42. How do you estimate price elasticity?**
> Using log-log regression: ln(quantity) = β₀ + β₁ × ln(price) + ε. The coefficient β₁ is the price elasticity. If β₁ = -1.2, a 10% price increase leads to ~12% demand decrease. We use variation in discounts across transactions as the "price" signal. We report the confidence interval and warn clearly that: (1) discount variation ≠ experimental price variation, (2) confounders exist (e.g., discounts happen on certain days), so this is an approximate estimate, not a precise measurement.

**Q43. What is a tornado chart?**
> A sensitivity analysis chart that shows which input assumption (price, demand, cost, discount) has the largest impact on profit. Each bar shows the profit range when that variable moves ±20% while others stay fixed. The longest bar is the most critical variable — the canteen manager should focus risk management there.

**Q44. What is break-even analysis?**
> At what sales volume does revenue cover total costs? Break-even units = Fixed Costs / (Price - Variable Cost per Unit). For a canteen, this tells the manager the minimum number of portions they must sell per day to not lose money on that item.

---

## Section 11: Menu Engineering & Customer Insights

**Q45. What is the Menu Engineering Matrix (BCG-style)?**
> Classifies products on two dimensions:
> - **Popularity**: Units sold share vs expected average share.
> - **Profitability**: Unit contribution margin vs menu average margin.
> Four quadrants:
> - **Stars**: High popularity + high margin → protect and maintain.
> - **Plowhorses**: High popularity + low margin → consider price adjustment or cost reduction.
> - **Puzzles**: Low popularity + high margin → promote more, offer combos.
> - **Dogs**: Low popularity + low margin → re-engineer or phase out.

**Q46. What is RFM analysis?**
> Customer segmentation using three dimensions:
> - **Recency (R)**: How recently did they purchase? (lower = more recent)
> - **Frequency (F)**: How many orders? (higher = more loyal)
> - **Monetary (M)**: How much did they spend? (higher = more valuable)
> Each customer gets an RFM score and K-Means clustering groups them into segments like "Daily Loyalists" or "At-Risk Lapsed."

**Q47. What is a retention cohort heatmap?**
> Groups customers by the month they first purchased (cohort). Then tracks what percentage return in each subsequent month. A healthy canteen shows high early retention (60%+ in Month 1). The heatmap visualizes this: rows are cohorts, columns are months since first purchase, values are retention rates.

---

## Section 12: Digital Twin & Queue Simulation

**Q48. What is a Digital Twin?**
> A computational model of a real system that can be simulated to test scenarios before implementing them in the real world. Our "Canteen Digital Twin" models the canteen as a queueing system: students arrive (Poisson arrivals estimated from hourly data), queue, get served (exponential service time), and leave.

**Q49. What is a discrete-event simulation?**
> A simulation that models the system as a sequence of events (e.g., "student arrives", "student starts being served", "student leaves"). Between events, nothing changes. This is more computationally efficient than continuous simulation and is standard for queueing problems (M/M/c queue theory).

**Q50. What is Little's Law?**
> L = λ × W, where L = average number in system, λ = arrival rate, W = average time in system. We use this to sanity-check our queue simulation: if λ=100/hour, W=0.02 hours, then L should ≈ 2. We assert this approximately holds in our test suite.

**Q51. What is service level and how do you optimize staffing?**
> Service level = P(wait time < target). For example, "90% of students wait less than 2 minutes." We simulate different numbers of staff/counters and find the minimum staffing that achieves the target service level. This gives "staffing recommendation by hour."

---

## Section 13: Ask CanteenIQ Assistant

**Q52. How does the offline NL assistant work without an LLM?**
> Through deterministic keyword/intent matching:
> 1. Lowercase and normalize the query.
> 2. Check for keyword patterns: "top products" → `top_products` intent, "category margin" → `category_profitability` intent, "peak hours" → `peak_hours` intent.
> 3. Route to the corresponding analytics function.
> 4. Return computed results + a natural language sentence + the exact formula used.
> If the query doesn't match any intent, show supported example queries rather than guessing.

**Q53. Why not use GPT or another LLM?**
> The project specification requires (1) offline operation, (2) no paid APIs, (3) explainability. LLMs are non-deterministic and can hallucinate wrong numbers. Our rule-based system always shows the exact formula and filters used — the user can verify every answer. This is more appropriate for a financial analytics tool.

---

## Section 14: Reports & Documentation

**Q54. What reports can CanteenIQ generate?**
> - **Excel Workbook**: Multi-tab (Executive Summary, Categories, Products, Transactions, Daily Trends, Anomalies).
> - **PDF Executive Report**: Professional formatted report with tables, computed KPIs, and methodology notes.
> - **DOCX Academic Report**: Full 43-chapter report with methodology, data dictionary, statistical results.
> - **PPTX Presentation**: 22-slide editable presentation with speaker notes.

**Q55. How do you ensure report numbers match what the app shows?**
> All reports are generated from the same backend service layer (`services/metrics.py`). Numbers are computed at report generation time from the actual data, not hardcoded. The report includes the dataset seed/config hash and generation timestamp for traceability.

---

## Section 15: Architecture & Technical

**Q56. Why did you choose FastAPI over Flask or Django?**
> FastAPI provides: (1) Auto-generated OpenAPI/Swagger docs at `/docs`. (2) Pydantic v2 validation — type-safe request/response schemas. (3) Async support for future scalability. (4) Native Python type hints integration. Flask lacks auto-validation; Django is heavier than needed for a pure API service.

**Q57. Why SQLite instead of PostgreSQL?**
> The project must run fully offline on a single machine without any database server installation. SQLite is a file-based database that requires zero setup. All metadata (dataset info, model runs, decisions, reports) is stored in SQLite; actual data is stored as CSV/Parquet files referenced by path.

**Q58. What is Pydantic v2 and why use it?**
> Pydantic is a data validation library using Python type annotations. Request bodies, query parameters, and API responses are defined as Pydantic models — FastAPI validates them automatically. V2 is significantly faster than V1 and uses Rust-based validation under the hood.

**Q59. How does the Vite proxy work?**
> In development, the Vite dev server (port 5173) proxies all `/api/*` requests to `localhost:8000`. This avoids CORS issues during development. In production (after `npm run build`), you'd serve the built `dist/` folder via a web server configured to proxy `/api` to the FastAPI backend.

**Q60. What is the data lineage view?**
> A visual representation of how data flows from raw to processed: Raw CSV → Schema validation → Missing value handling → Duplicate removal → Outlier flagging → Quarantine → Cleaned dataset. Each step records: rows in, rows out, rows quarantined, transformation applied. This is important for reproducibility and auditability.

---

## Section 16: Limitations & Future Work

**Q61. What are the main limitations of this project?**
> - All data is synthetic — real canteen performance may differ significantly.
> - Weather data is simulated, not actual weather API data.
> - Customer IDs are pseudonymous tokens; real customer analytics requires consent infrastructure.
> - Queue simulation uses assumed service times (configurable), not measured data.
> - Price elasticity estimation uses discount variation as a proxy for price variation — this has confounders.
> - Forecasting models are not retrained continuously — drift detection flags when retraining is needed.

**Q62. What would you add with more time?**
> - Real weather API integration (OpenWeatherMap).
> - Mobile app (React Native) for real-time data entry by canteen staff.
> - Continuous learning pipeline: automatic model retraining when drift detected.
> - Multi-canteen comparison across multiple campus locations.
> - Inventory tracking integration for actual waste measurement.
> - Reinforcement learning for dynamic pricing recommendation.

**Q63. What are "threats to validity" for this project?**
> - **Construct validity**: Do our metrics measure what we claim? (e.g., does our health score actually measure canteen health, or just data properties?)
> - **Internal validity**: On synthetic data, known patterns are detectable by design — doesn't prove the methods work on real data.
> - **External validity**: Results may not generalize to actual canteens with different demographics, menus, or cultural patterns.
> - **Statistical validity**: Some tests assume independence — basket-level purchases may violate this if the same customer always buys the same combo.

---

## Section 17: Quick-Fire Questions

**Q64. What is sMAPE?** Symmetric Mean Absolute Percentage Error = mean(|actual - forecast| / ((|actual| + |forecast|) / 2)) × 100. More stable than MAPE when actuals can be zero.

**Q65. What is MAD in the robust Z-score?** Median Absolute Deviation. More robust than standard deviation because it's resistant to extreme outliers.

**Q66. What is PSI in drift detection?** Population Stability Index — measures how much the distribution of a variable has shifted between two time windows. We use the KS test as an alternative.

**Q67. What is the critical ratio in the newsvendor model?** Cu / (Cu + Co), where Cu = underage cost, Co = overage cost. This is the optimal service level — the probability that demand will be below the chosen quantity.

**Q68. What is silhouette score in K-Means?** A measure of clustering quality: how similar each point is to its own cluster vs other clusters. Ranges from -1 to 1; higher is better. Used to select the optimal K.

**Q69. What is conformal prediction?** A framework for constructing prediction intervals with coverage guarantees. Instead of assuming a distribution, it uses empirical quantiles of past residuals. Our forecast uses a simplified version: interval = forecast ± z × std(residuals).

**Q70. What does CORS mean and why configure it?** Cross-Origin Resource Sharing. Browsers block requests from one origin (frontend: 5173) to another (backend: 8000) unless the backend explicitly allows it. We configure `allow_origins=["http://localhost:5173"]` in FastAPI middleware.

---

*CanteenIQ Viva Q&A — 70 Questions — Academic Project Defence*
