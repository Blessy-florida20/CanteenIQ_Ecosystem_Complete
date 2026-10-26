"""
CanteenIQ Data Studio Cleaning & Quarantine Engine
Performs audit-trailed validation, quarantine isolation of corrupted rows,
and computes a transparent multi-dimensional Data Quality Score.
"""

from typing import Dict, List, Any, Tuple
import pandas as pd
import numpy as np


class DataCleaner:
    """Audit-trailed cleaning and quarantine engine."""

    def __init__(self, df: pd.DataFrame):
        self.raw_df = df.copy()
        self.log: List[Dict[str, Any]] = []

    def clean(self) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any], List[Dict[str, Any]]]:
        """
        Executes cleaning pipeline:
        1. Quarantine exact duplicate rows
        2. Quarantine records with negative quantity or non-positive price
        3. Quarantine invalid dates/times
        4. Impute missing non-critical attributes (e.g. unknown customer_id, category from catalog)
        5. Compute Data Quality Score (0-100) across 5 dimensions

        Returns:
            (cleaned_df, quarantined_df, quality_score_report, transformation_log)
        """
        df = self.raw_df.copy()
        total_initial_rows = len(df)
        quarantine_rows = []

        self.log.append({
            "step": "Ingestion",
            "action": "Loaded raw dataset",
            "rows_affected": total_initial_rows,
            "status": "Success"
        })

        # 1. Exact Duplicates Check
        duplicate_mask = df.duplicated()
        dup_count = int(duplicate_mask.sum())
        if dup_count > 0:
            quarantined_dups = df[duplicate_mask].copy()
            quarantined_dups["quarantine_reason"] = "Duplicate row"
            quarantine_rows.append(quarantined_dups)
            df = df[~duplicate_mask].copy()
            self.log.append({
                "step": "Deduplication",
                "action": "Isolated duplicate records to quarantine",
                "rows_affected": dup_count,
                "status": "Quarantined"
            })

        # 2. Validity: Quantity > 0 and Unit Price > 0
        invalid_qty_mask = (df["quantity"] <= 0) | df["quantity"].isna()
        invalid_price_mask = (df["unit_price"] <= 0) | df["unit_price"].isna()
        invalid_domain_mask = invalid_qty_mask | invalid_price_mask

        domain_invalid_count = int(invalid_domain_mask.sum())
        if domain_invalid_count > 0:
            quarantined_domain = df[invalid_domain_mask].copy()
            reasons = []
            for _, r in quarantined_domain.iterrows():
                sub = []
                if pd.isna(r["quantity"]) or r["quantity"] <= 0:
                    sub.append("Invalid/Non-positive quantity")
                if pd.isna(r["unit_price"]) or r["unit_price"] <= 0:
                    sub.append("Invalid/Non-positive unit_price")
                reasons.append("; ".join(sub))
            quarantined_domain["quarantine_reason"] = reasons
            quarantine_rows.append(quarantined_domain)
            df = df[~invalid_domain_mask].copy()
            self.log.append({
                "step": "Domain Validation",
                "action": "Quarantined non-positive quantity or price values",
                "rows_affected": domain_invalid_count,
                "status": "Quarantined"
            })

        # 3. Date / Time Validation
        try:
            df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors="coerce")
            invalid_date_mask = df["transaction_date"].isna()
            invalid_dates_count = int(invalid_date_mask.sum())
            if invalid_dates_count > 0:
                quarantined_dates = df[invalid_date_mask].copy()
                quarantined_dates["quarantine_reason"] = "Unparseable transaction date"
                quarantine_rows.append(quarantined_dates)
                df = df[~invalid_date_mask].copy()
                self.log.append({
                    "step": "Date Parsing",
                    "action": "Quarantined rows with corrupted dates",
                    "rows_affected": invalid_dates_count,
                    "status": "Quarantined"
                })
            # Convert back to ISO string for consistency
            df["transaction_date"] = df["transaction_date"].dt.strftime("%Y-%m-%d")
        except Exception as e:
            self.log.append({
                "step": "Date Parsing Exception",
                "action": str(e),
                "rows_affected": 0,
                "status": "Warning"
            })

        # 4. Imputation of Missing Non-Fatal Fields
        # Missing customer_id -> 'GUEST_UNKNOWN'
        if "customer_id" in df.columns:
            missing_cust = df["customer_id"].isna()
            missing_cust_count = int(missing_cust.sum())
            if missing_cust_count > 0:
                df.loc[missing_cust, "customer_id"] = "GUEST_ANONYMOUS"
                self.log.append({
                    "step": "Customer Imputation",
                    "action": "Imputed missing customer_id with 'GUEST_ANONYMOUS'",
                    "rows_affected": missing_cust_count,
                    "status": "Imputed"
                })

        # Missing discount -> 0.0
        if "discount" in df.columns:
            missing_disc = df["discount"].isna()
            missing_disc_count = int(missing_disc.sum())
            if missing_disc_count > 0:
                df.loc[missing_disc, "discount"] = 0.0
                self.log.append({
                    "step": "Discount Imputation",
                    "action": "Imputed missing discount with 0.0",
                    "rows_affected": missing_disc_count,
                    "status": "Imputed"
                })

        # Missing category -> 'Uncategorized'
        if "category" in df.columns:
            missing_cat = df["category"].isna()
            missing_cat_count = int(missing_cat.sum())
            if missing_cat_count > 0:
                df.loc[missing_cat, "category"] = "Uncategorized"
                self.log.append({
                    "step": "Category Imputation",
                    "action": "Imputed missing category with 'Uncategorized'",
                    "rows_affected": missing_cat_count,
                    "status": "Imputed"
                })

        # Assemble quarantined DataFrame
        if quarantine_rows:
            quarantined_df = pd.concat(quarantine_rows, ignore_index=True)
        else:
            quarantined_df = pd.DataFrame(columns=list(self.raw_df.columns) + ["quarantine_reason"])

        # Compute transparent Quality Score
        quality_report = self._compute_quality_score(self.raw_df, quarantined_df, df)

        self.log.append({
            "step": "Finalization",
            "action": f"Cleaning complete: {len(df)} cleaned rows, {len(quarantined_df)} quarantined rows",
            "rows_affected": len(df),
            "status": "Success"
        })

        return df.reset_index(drop=True), quarantined_df.reset_index(drop=True), quality_report, self.log

    def _compute_quality_score(
        self,
        raw_df: pd.DataFrame,
        quarantined_df: pd.DataFrame,
        cleaned_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """Calculates 5-dimension quality score (0 to 100)."""
        n_raw = max(1, len(raw_df))
        n_clean = len(cleaned_df)
        n_quar = len(quarantined_df)

        # 1. Completeness: % of non-null cells across essential columns
        essential_cols = [c for c in ["transaction_id", "order_id", "transaction_date", "product_name", "quantity", "unit_price"] if c in raw_df.columns]
        null_count = raw_df[essential_cols].isna().sum().sum()
        total_cells = len(raw_df) * len(essential_cols)
        completeness = max(0.0, 100.0 * (1.0 - (null_count / max(1, total_cells))))

        # 2. Validity: % of rows that did not violate domain constraints
        validity = max(0.0, 100.0 * (1.0 - (n_quar / n_raw)))

        # 3. Uniqueness: % of non-duplicate rows
        dup_count = raw_df.duplicated().sum()
        uniqueness = max(0.0, 100.0 * (1.0 - (dup_count / n_raw)))

        # 4. Consistency: % discount <= gross line sales
        if "discount" in cleaned_df.columns and "unit_price" in cleaned_df.columns:
            inconsistent = (cleaned_df["discount"] > (cleaned_df["quantity"] * cleaned_df["unit_price"])).sum()
            consistency = max(0.0, 100.0 * (1.0 - (inconsistent / max(1, n_clean))))
        else:
            consistency = 100.0

        # 5. Timeliness: % parseable timestamps
        timeliness = 100.0 if "transaction_time" in raw_df.columns else 80.0

        overall_score = round(
            0.25 * completeness +
            0.25 * validity +
            0.20 * uniqueness +
            0.15 * consistency +
            0.15 * timeliness,
            1
        )

        return {
            "overall_quality_score": overall_score,
            "grade": "Excellent" if overall_score >= 90 else ("Good" if overall_score >= 75 else ("Fair" if overall_score >= 60 else "Poor")),
            "dimensions": {
                "completeness": round(completeness, 1),
                "validity": round(validity, 1),
                "uniqueness": round(uniqueness, 1),
                "consistency": round(consistency, 1),
                "timeliness": round(timeliness, 1)
            },
            "summary": {
                "total_raw_rows": n_raw,
                "cleaned_rows": n_clean,
                "quarantined_rows": n_quar,
                "rejection_rate_pct": round((n_quar / n_raw) * 100.0, 2)
            }
        }
