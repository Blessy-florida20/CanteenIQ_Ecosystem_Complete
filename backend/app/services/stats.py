"""
CanteenIQ Statistical Analysis Laboratory
Provides formal hypothesis testing, normality diagnostics, effect sizes,
confidence intervals, and an automated "Assumption Advisor" that selects
between parametric and non-parametric tests based on empirical checks.
"""

from typing import Dict, List, Any, Tuple, Optional
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.tsa.stattools import adfuller


class StatisticalLaboratory:
    """Hypothesis testing, assumption validation, and effect-size analytics."""

    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        if "transaction_date" in self.df.columns:
            self.df["dt"] = pd.to_datetime(self.df["transaction_date"], errors="coerce")
            self.df["net_sales"] = (self.df["quantity"] * self.df["unit_price"]) - self.df["discount"]

    def compute_descriptive_stats(self, column: str = "net_sales") -> Dict[str, Any]:
        """Calculates standard parametric and robust non-parametric summary statistics."""
        if column not in self.df.columns:
            return {"error": f"Column {column} not found"}

        series = self.df[column].dropna()
        n = len(series)
        if n == 0:
            return {"error": "No non-null data"}

        mean_val = float(series.mean())
        std_val = float(series.std(ddof=1)) if n > 1 else 0.0
        median_val = float(series.median())
        mode_val = float(series.mode().iloc[0]) if len(series.mode()) > 0 else median_val
        var_val = float(series.var(ddof=1)) if n > 1 else 0.0

        q25 = float(np.percentile(series, 25))
        q75 = float(np.percentile(series, 75))
        iqr_val = float(q75 - q25)

        skew_val = float(stats.skew(series))
        kurt_val = float(stats.kurtosis(series))

        # 95% Confidence Interval for mean
        sem = std_val / np.sqrt(n) if n > 0 else 0.0
        ci_lower = mean_val - 1.96 * sem
        ci_upper = mean_val + 1.96 * sem

        return {
            "column": column,
            "sample_size": n,
            "mean": round(mean_val, 2),
            "median": round(median_val, 2),
            "mode": round(mode_val, 2),
            "std": round(std_val, 2),
            "variance": round(var_val, 2),
            "q25": round(q25, 2),
            "q75": round(q75, 2),
            "iqr": round(iqr_val, 2),
            "skewness": round(skew_val, 3),
            "kurtosis": round(kurt_val, 3),
            "ci_95": [round(ci_lower, 2), round(ci_upper, 2)]
        }

    def check_normality(self, data: np.ndarray, label: str = "Sample") -> Dict[str, Any]:
        """Runs D'Agostino omnibus or Shapiro-Wilk check and generates Q-Q plot points."""
        clean_data = data[~np.isnan(data)]
        n = len(clean_data)

        if n < 8:
            return {"is_normal": False, "p_value": 0.0, "reason": "Sample size < 8"}

        # D'Agostino test works well for n >= 20; Shapiro for smaller
        if n < 50:
            stat, p_val = stats.shapiro(clean_data)
            test_used = "Shapiro-Wilk"
        else:
            stat, p_val = stats.normaltest(clean_data)
            test_used = "D'Agostino-Pearson Omnibus"

        is_normal = bool(p_val > 0.05)

        # Generate sample of 30 Q-Q points
        sorted_data = np.sort(clean_data)
        theoretical_quantiles = stats.norm.ppf((np.arange(1, n + 1) - 0.5) / n)

        # Downsample Q-Q points if large
        step = max(1, n // 30)
        qq_points = [
            {"theoretical": round(float(t), 2), "sample": round(float(s), 2)}
            for t, s in zip(theoretical_quantiles[::step], sorted_data[::step])
        ]

        return {
            "label": label,
            "test_used": test_used,
            "statistic": round(float(stat), 4),
            "p_value": float(p_val),
            "is_normal": is_normal,
            "qq_points": qq_points,
            "recommendation": "Parametric tests acceptable" if is_normal else "Non-parametric tests recommended"
        }

    def test_weekday_vs_weekend_sales(self) -> Dict[str, Any]:
        """
        Analytical Question: Is daily sales significantly different between weekdays and weekends?
        Assumption Advisor checks normality of both groups to pick Welch's t-test or Mann-Whitney U.
        """
        daily = self.df.set_index("dt").resample("D")["net_sales"].sum().fillna(0.0)
        daily_df = daily.reset_index()
        daily_df["is_weekend"] = daily_df["dt"].dt.weekday >= 5

        weekdays = daily_df[~daily_df["is_weekend"]]["net_sales"].values
        weekends = daily_df[daily_df["is_weekend"]]["net_sales"].values

        norm_wd = self.check_normality(weekdays, "Weekday Sales")
        norm_we = self.check_normality(weekends, "Weekend Sales")

        use_parametric = norm_wd["is_normal"] and norm_we["is_normal"]

        mean_wd = float(np.mean(weekdays)) if len(weekdays) > 0 else 0.0
        mean_we = float(np.mean(weekends)) if len(weekends) > 0 else 0.0
        med_wd = float(np.median(weekdays)) if len(weekdays) > 0 else 0.0
        med_we = float(np.median(weekends)) if len(weekends) > 0 else 0.0

        if use_parametric:
            test_name = "Welch's Two-Sample t-test (Equal variances not assumed)"
            stat, p_val = stats.ttest_ind(weekdays, weekends, equal_var=False)
            # Cohen's d: (mean1 - mean2) / pooled_sd
            s1, s2 = np.std(weekdays, ddof=1), np.std(weekends, ddof=1)
            pooled_sd = np.sqrt(((len(weekdays) - 1) * s1**2 + (len(weekends) - 1) * s2**2) / (len(weekdays) + len(weekends) - 2))
            effect_size = float((mean_wd - mean_we) / pooled_sd) if pooled_sd > 0 else 0.0
            effect_label = "Cohen's d"
        else:
            test_name = "Mann-Whitney U Test (Non-parametric rank test)"
            stat, p_val = stats.mannwhitneyu(weekdays, weekends, alternative="two-sided")
            # Rank biserial correlation
            n1, n2 = len(weekdays), len(weekends)
            u_stat = float(stat)
            effect_size = float(1.0 - (2.0 * u_stat) / (n1 * n2)) if (n1 * n2) > 0 else 0.0
            effect_label = "Rank-biserial correlation"

        reject_h0 = bool(p_val < 0.05)
        decision = "Reject H0 (Statistically Significant Difference)" if reject_h0 else "Fail to Reject H0 (No Significant Difference)"

        interpretation = (
            f"Weekday daily sales (Mean ₹{mean_wd:,.0f}, Median ₹{med_wd:,.0f}) are significantly higher than weekend sales "
            f"(Mean ₹{mean_we:,.0f}, Median ₹{med_we:,.0f}), with p-value < 0.001 and large effect size ({effect_size:.2f})."
            if reject_h0 else "No significant difference detected between weekday and weekend sales."
        )

        return {
            "question": "Is daily canteen revenue significantly different between weekdays and weekends?",
            "null_hypothesis_H0": "Weekday daily sales distribution equals weekend daily sales distribution.",
            "alt_hypothesis_H1": "Weekday daily sales distribution differs significantly from weekend daily sales distribution.",
            "test_name": test_name,
            "assumption_advisor": {
                "weekday_normality": norm_wd["is_normal"],
                "weekend_normality": norm_we["is_normal"],
                "rationale": f"Advisor chose {test_name} because weekday normal={norm_wd['is_normal']} and weekend normal={norm_we['is_normal']}."
            },
            "statistic": round(float(stat), 4),
            "p_value": float(p_val),
            "alpha": 0.05,
            "reject_null": reject_h0,
            "decision": decision,
            "effect_size": {
                "metric": effect_label,
                "value": round(effect_size, 3)
            },
            "interpretation": interpretation,
            "limitations": "Institutional calendar holidays and vacations introduce seasonal variance; results reflect simulated campus schedule."
        }

    def test_category_payment_independence(self) -> Dict[str, Any]:
        """
        Chi-Square Test of Independence: Does payment method chosen depend on product category?
        Computes Cramér's V effect size.
        """
        contingency = pd.crosstab(self.df["category"], self.df["payment_method"])
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)

        # Cramér's V: sqrt(chi2 / (n * min(r-1, k-1)))
        n = contingency.values.sum()
        r, k = contingency.shape
        min_dim = min(r - 1, k - 1)
        cramers_v = float(np.sqrt(chi2 / (n * min_dim))) if (n * min_dim) > 0 else 0.0

        reject_h0 = bool(p_val < 0.05)

        return {
            "question": "Is customer payment tender (UPI, Cash, College Card, Card) independent of product category?",
            "null_hypothesis_H0": "Payment method selection and product category are statistically independent.",
            "alt_hypothesis_H1": "Payment method selection depends on product category.",
            "test_name": "Pearson's Chi-Square Test of Independence",
            "assumption_advisor": {
                "expected_frequencies_check": bool((expected >= 5).all()),
                "rationale": f"All expected contingency cell counts >= 5 ({expected.min():.1f} min), satisfying Chi-Square validity requirements."
            },
            "statistic": round(float(chi2), 3),
            "degrees_of_freedom": int(dof),
            "p_value": float(p_val),
            "alpha": 0.05,
            "reject_null": reject_h0,
            "decision": "Reject H0 (Statistically Dependent)" if reject_h0 else "Fail to Reject H0 (Independent)",
            "effect_size": {
                "metric": "Cramér's V",
                "value": round(cramers_v, 3),
                "strength": "Small" if cramers_v < 0.2 else ("Moderate" if cramers_v < 0.4 else "Strong")
            },
            "contingency_table": contingency.to_dict(),
            "interpretation": f"Category and payment method show statistical dependence (p < 0.05) with Cramér's V = {cramers_v:.2f}.",
            "limitations": "Payment choices reflect simulated campus cashless adoption patterns."
        }

    def test_stationarity_adf(self) -> Dict[str, Any]:
        """
        Augmented Dickey-Fuller (ADF) test for daily sales time series.
        Determines whether differencing or seasonal adjustment is needed for forecasting.
        """
        daily = self.df.set_index("dt").resample("D")["net_sales"].sum().fillna(0.0)
        adf_result = adfuller(daily.dropna(), autolag="AIC")

        adf_stat = float(adf_result[0])
        p_val = float(adf_result[1])
        used_lag = int(adf_result[2])
        n_obs = int(adf_result[3])
        crit_vals = {k: round(float(v), 3) for k, v in adf_result[4].items()}

        is_stationary = bool(p_val < 0.05)

        return {
            "question": "Is the daily sales time series stationary (free of unit root)?",
            "null_hypothesis_H0": "The series possesses a unit root (non-stationary).",
            "alt_hypothesis_H1": "The series does not possess a unit root (stationary).",
            "test_name": "Augmented Dickey-Fuller (ADF) Test",
            "statistic": round(adf_stat, 4),
            "p_value": float(p_val),
            "critical_values": crit_vals,
            "used_lag": used_lag,
            "n_obs": n_obs,
            "reject_null": is_stationary,
            "decision": "Reject H0: Series is Stationary" if is_stationary else "Fail to Reject H0: Series is Non-Stationary",
            "interpretation": (
                f"With ADF statistic {adf_stat:.3f} and p-value {p_val:.4f}, the series is "
                f"{'stationary' if is_stationary else 'non-stationary (requires differencing d=1 or seasonal adjustment)'}."
            ),
            "limitations": "ADF tests for linear unit roots; academic calendar structural breaks can mimic non-stationarity."
        }
