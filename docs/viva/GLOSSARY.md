# CanteenIQ: Technical Glossary

This glossary provides definitions, mathematical formulas, and contextual interpretations for key terminology across Data Science, Statistics, Operations Research, and Software Architecture used throughout the CanteenIQ ecosystem.

---

## 1. Business & Operational Metrics

- **Gross Sales:** The total nominal value of all products sold before any customer discounts or concessions are deducted.  
  $$\text{Gross Sales} = \sum_{i} (\text{Quantity}_i \times \text{Unit Price}_i)$$

- **Net Sales:** The actual realized revenue accrued to the canteen after line-item discounts have been subtracted.  
  $$\text{Net Sales} = \sum_{i} (\text{Quantity}_i \times \text{Unit Price}_i - \text{Discount}_i)$$

- **Cost of Goods Sold (COGS):** Direct expenditures attributed exclusively to the preparation of menu items (raw materials, ingredients, packaging). Operating expenses such as staff salaries, rent, and utility bills are explicitly excluded from this metric.  
  $$\text{COGS} = \sum_{i} (\text{Quantity}_i \times \text{Unit Cost}_i)$$

- **Estimated Gross Profit:** The monetary surplus remaining after recovering direct ingredient costs from net sales.  
  $$\text{Gross Profit} = \text{Net Sales} - \text{COGS}$$

- **Gross Profit Margin (%):** The efficiency metric indicating the fraction of net sales retained as gross margin. Zero-division guards are applied in software to ensure stability when revenue is zero.  
  $$\text{Gross Margin \%} = \frac{\text{Net Sales} - \text{COGS}}{\text{Net Sales}} \times 100$$

- **Average Transaction Value (ATV):** Also known as Average Order Value (AOV); the mean net expenditure per unique order identifier (basket).  
  $$\text{ATV} = \frac{\text{Net Sales}}{\text{Count of Unique Orders}}$$

- **Canteen Operational Health Score:** A normalized composite index ($0-100$) combining four weighted sub-scores: Margin Health ($30\%$), Data Quality ($25\%$), Demand Stability ($25\%$), and Operational ATV ($20\%$).

---

## 2. Statistical Analysis & Data Science

- **Pareto Principle (80/20 Rule):** The empirical observation that approximately $80\%$ of consequences stem from $20\%$ of causes. In CanteenIQ, it classifies menu items into:
  - **Class A:** Top items generating $\approx 80\%$ of total revenue.
  - **Class B:** Secondary items contributing $\approx 15\%$ of revenue.
  - **Class C:** Long-tail items accounting for the bottom $\approx 5\%$ of revenue.

- **Gini Coefficient:** A metric of statistical dispersion expressing the degree of concentration or inequality of a distribution (such as revenue across menu items). A value of $0$ expresses total equality, while $1$ expresses maximal concentration.

- **Lorenz Curve:** A graphical representation of the cumulative distribution function of revenue generated plotted against the cumulative percentage of products ranked by volume.

- **Shapiro-Wilk Test:** A statistical hypothesis test evaluating whether a sample $x_1, \dots, x_n$ came from a normally distributed population ($H_0$). Used by CanteenIQ's **Assumption Advisor** to choose between parametric (e.g., Welch's t-test) and non-parametric tests (e.g., Mann-Whitney U).

- **Welch's t-test:** An adaptation of Student's two-sample t-test that does not assume equal population variances (homoscedasticity). Used to test whether mean weekday sales differ from mean weekend sales.

- **Mann-Whitney U Test:** A non-parametric rank-sum test used to compare differences between two independent groups when the normality assumption is violated.

- **Cramér's V:** A standardized measure of nominal association between two categorical variables, yielding values between $0$ (no association) and $1$ (complete association). Calculated from the Chi-square statistic ($\chi^2$).

- **Cohen's d:** An effect size metric expressing the standardized difference between two means in units of pooled standard deviation ($d = \frac{\bar{x}_1 - \bar{x}_2}{s_{\text{pooled}}}$).

- **CUSUM (Cumulative Sum Control Chart):** A sequential analysis technique used for change-point detection to identify persistent shifts in the mean level of time-series sales velocity.

---

## 3. Demand Forecasting & Machine Learning

- **Walk-Forward (Rolling-Origin) Backtesting:** A time-series evaluation protocol where models are trained on past chronological data up to timestamp $t$ and evaluated on a forward horizon $[t+1, t+h]$, after which the origin rolls forward. This simulates real-world deployment and prevents look-ahead data leakage.

- **Data Leakage:** The inadvertent introduction of information from outside the training dataset (such as future actuals or whole-dataset global averages) into the model training pipeline.

- **Seasonal Naive Baseline:** A benchmark forecasting heuristic that projects future values by repeating the observed actual from the exact same seasonal period in the prior cycle ($y_{t} = y_{t - s}$, e.g., sales from seven days ago).

- **Holt-Winters Exponential Smoothing (ETS):** A time-series forecasting method that models level, trend, and multiplicative/additive seasonal components using exponential weighting parameters ($\alpha, \beta, \gamma$).

- **SARIMA (Seasonal Autoregressive Integrated Moving Average):** A classical linear time-series model denoted as $\text{SARIMA}(p,d,q) \times (P,D,Q)_s$ that captures autoregressive dynamics, differencing, and moving averages across non-seasonal and seasonal periods.

- **Mean Absolute Error (MAE):** The average magnitude of absolute forecast errors, expressed in the natural physical units of the target variable.  
  $$\text{MAE} = \frac{1}{n}\sum_{t=1}^n |y_t - \hat{y}_t|$$

- **Root Mean Squared Error (RMSE):** The square root of the mean squared errors, disproportionately penalizing large individual planning misses.  
  $$\text{RMSE} = \sqrt{\frac{1}{n}\sum_{t=1}^n (y_t - \hat{y}_t)^2}$$

- **sMAPE (Symmetric Mean Absolute Percentage Error):** An accuracy measure based on percentage errors bound between $0\%$ and $200\%$, providing numerical stability when actual quantities approach zero.

- **Prediction Interval:** A quantified range $[L_t, U_t]$ within which the future realization is expected to fall with a specified probability (e.g., $80\%$ or $95\%$), expressing model epistemic and aleatoric uncertainty.

---

## 4. Prescriptive Operations & Simulation

- **Newsvendor Model:** A foundational mathematical model in Operations Research determining the optimal stock quantity for a perishable item facing uncertain demand over a single period.

- **Critical Ratio ($CR$):** The service level quantile that minimizes total expected overage and underage costs:  
  $$CR = \frac{C_u}{C_u + C_o}$$  
  where $C_u$ is the underage cost (unrealized contribution margin per portion lost to stockout) and $C_o$ is the overage cost (cost per prepared portion spoiled/wasted).

- **Discrete-Event Simulation (DES):** A modeling methodology where the operation of a system is represented as a chronological sequence of distinct events, each occurring at an instantaneous point in time. In CanteenIQ, it models student arrivals, service queues, and counter staffing.

- **Little's Law:** A fundamental queueing theorem stating that the long-term average number of customers in a stationary queueing system ($L$) equals the long-term average effective arrival rate ($\lambda$) multiplied by the average time a customer spends in the system ($W$):  
  $$L = \lambda W$$

- **Price Elasticity of Demand:** A measure of the responsiveness of the quantity demanded of a good to a change in its price:  
  $$\epsilon = \frac{\% \Delta \text{Quantity}}{\% \Delta \text{Price}}$$  
  In CanteenIQ, estimated via log-log ordinary least squares regression.

- **Market Basket Mining (Apriori / FP-Growth):** Unsupervised rule-discovery algorithms identifying items frequently co-purchased in the same order basket:
  - **Support:** Proportion of transactions containing the itemset: $P(A \cap B)$.
  - **Confidence:** Conditional probability that item $B$ is present given item $A$: $P(B \mid A)$.
  - **Lift:** The ratio of observed co-occurrence to expected co-occurrence under independence: $\frac{P(B \mid A)}{P(B)}$. Lift values greater than $1.0$ indicate positive affinity.
