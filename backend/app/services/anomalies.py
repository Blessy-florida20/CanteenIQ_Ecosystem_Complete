"""
CanteenIQ Anomaly Detection Engine
Multi-method detector (Robust MAD, IQR, Isolation Forest) benchmarked
against synthetic injected ground-truth event labels (Precision, Recall, F1).
"""

from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from app.database.db import list_anomaly_reviews


class AnomalyDetector:
    """Detects sales surges and drops with severity scoring and review workflow."""

    def __init__(self, df: pd.DataFrame, ground_truth_df: Optional[pd.DataFrame] = None):
        self.df = df.copy()
        self.gt_df = ground_truth_df

        self.df["dt"] = pd.to_datetime(self.df["transaction_date"])
        self.df["net_sales"] = (self.df["quantity"] * self.df["unit_price"]) - self.df["discount"]
        self.daily = self.df.set_index("dt").resample("D").agg(
            net_sales=("net_sales", "sum"),
            orders=("order_id", "nunique"),
            units=("quantity", "sum")
        ).fillna(0.0)

    def detect_anomalies(self) -> Dict[str, Any]:
        """
        Runs multi-method detection on daily net sales:
        1. Robust MAD Z-Score
        2. IQR Method
        3. Isolation Forest
        """
        daily_sales = self.daily["net_sales"].values
        dates = self.daily.index
        n = len(daily_sales)

        if n < 14:
            return {"anomalies": [], "evaluation": None, "takeaway": "Insufficient data"}

        # 1. Robust Z-score (Median / MAD)
        median_sales = float(np.median(daily_sales))
        mad = float(np.median(np.abs(daily_sales - median_sales)))
        mad = max(1.0, mad) # guard division
        robust_z = 0.6745 * (daily_sales - median_sales) / mad

        # 2. IQR Bounds
        q25 = float(np.percentile(daily_sales, 25))
        q75 = float(np.percentile(daily_sales, 75))
        iqr = max(1.0, q75 - q25)
        lower_iqr = q25 - 1.5 * iqr
        upper_iqr = q75 + 1.5 * iqr

        # 3. Isolation Forest
        X = self.daily[["net_sales", "orders", "units"]].values
        iso = IsolationForest(contamination=0.04, random_state=42)
        iso_preds = iso.fit_predict(X) # -1 is anomaly

        # Persisted review statuses from SQLite
        persisted_reviews = list_anomaly_reviews()

        anomalies_list = []
        for i in range(n):
            d_str = dates[i].strftime("%Y-%m-%d")
            obs = float(daily_sales[i])
            z_score = float(robust_z[i])
            is_iqr = (obs < lower_iqr) or (obs > upper_iqr)
            is_iso = bool(iso_preds[i] == -1)
            is_mad = abs(z_score) > 2.5

            # If flagged by at least one robust method
            if is_mad or is_iqr or is_iso:
                severity = "High" if (is_mad and is_iqr) else ("Medium" if is_iso else "Low")
                direction = "Surge" if obs > median_sales else "Drop"
                anomaly_id = f"ANOM_{d_str.replace('-', '')}"

                # Review status from DB or default 'New'
                db_record = persisted_reviews.get(anomaly_id, {})
                status = db_record.get("status", "New")
                notes = db_record.get("notes", "")

                anomalies_list.append({
                    "anomaly_id": anomaly_id,
                    "date": d_str,
                    "observed_value": round(obs, 2),
                    "expected_value": round(median_sales, 2),
                    "deviation_pct": round(((obs - median_sales) / median_sales * 100.0), 1) if median_sales > 0 else 0.0,
                    "severity": severity,
                    "direction": direction,
                    "methods_triggered": {
                        "robust_mad": bool(is_mad),
                        "iqr": bool(is_iqr),
                        "isolation_forest": bool(is_iso)
                    },
                    "reason": f"Observed ₹{obs:,.0f} deviates significantly from expected baseline ₹{median_sales:,.0f} (Severity: {severity}).",
                    "status": status,
                    "notes": notes
                })

        # Benchmark against ground truth events if provided
        evaluation = None
        if self.gt_df is not None and not self.gt_df.empty:
            gt_dates = set(self.gt_df["date"].astype(str).tolist())
            detected_dates = set(a["date"] for a in anomalies_list if a["severity"] in ["High", "Medium"])

            true_positives = len(gt_dates.intersection(detected_dates))
            false_positives = len(detected_dates - gt_dates)
            false_negatives = len(gt_dates - detected_dates)

            precision = (true_positives / (true_positives + false_positives)) if (true_positives + false_positives) > 0 else 0.0
            recall = (true_positives / (true_positives + false_negatives)) if (true_positives + false_negatives) > 0 else 0.0
            f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

            evaluation = {
                "ground_truth_events_total": len(gt_dates),
                "true_positives": true_positives,
                "false_positives": false_positives,
                "false_negatives": false_negatives,
                "precision": round(precision, 3),
                "recall": round(recall, 3),
                "f1_score": round(f1, 3),
                "demonstration_note": "Evaluated objectively against injected ground-truth event labels on synthetic data."
            }

        caption = f"Identified {len(anomalies_list)} unusual observations requiring operational review. None represent fraud accusations."

        return {
            "anomalies": anomalies_list,
            "evaluation": evaluation,
            "takeaway": caption
        }
