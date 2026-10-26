"""
CanteenIQ Business Metric Definitions (Single Source of Truth)
All financial, volume, margin, and order metrics are defined here and reused across
the backend, reports, simulations, and decision tracking.
"""

from typing import Dict, Any, Optional
import pandas as pd
import numpy as np


def compute_kpis(df: pd.DataFrame, previous_df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
    """
    Computes standard business metrics over a transaction DataFrame.
    Guards against empty dataframes and division by zero.
    Optionally computes growth rates against a prior equivalent period.
    """
    if df is None or len(df) == 0:
        return {
            "gross_sales": 0.0,
            "net_sales": 0.0,
            "cogs": 0.0,
            "estimated_gross_profit": 0.0,
            "gross_margin_pct": 0.0,
            "units_sold": 0,
            "unique_transactions": 0,
            "unique_orders": 0,
            "unique_customers": 0,
            "average_transaction_value": 0.0,
            "average_items_per_order": 0.0,
            "active_products": 0,
            "growth": None,
            "currency": "INR",
            "currency_symbol": "₹",
            "is_simulated": True
        }

    # Gross sales: sum(quantity * unit_price)
    gross_sales = float((df["quantity"] * df["unit_price"]).sum())

    # Discount: sum(discount)
    total_discount = float(df["discount"].sum()) if "discount" in df.columns else 0.0

    # Net sales: sum(quantity * unit_price - discount)
    net_sales = max(0.0, gross_sales - total_discount)

    # Cost of goods sold: sum(quantity * unit_cost)
    cogs = float((df["quantity"] * df["unit_cost"]).sum()) if "unit_cost" in df.columns else 0.0

    # Estimated gross profit: net_sales - cogs
    estimated_gross_profit = net_sales - cogs

    # Gross margin %: estimated_gross_profit / net_sales (guard zero)
    gross_margin_pct = (estimated_gross_profit / net_sales * 100.0) if net_sales > 0 else 0.0

    # Units sold
    units_sold = int(df["quantity"].sum())

    # Unique orders & line transactions
    unique_orders = int(df["order_id"].nunique()) if "order_id" in df.columns else int(df["transaction_id"].nunique())
    unique_txns = int(df["transaction_id"].nunique())
    unique_custs = int(df["customer_id"].dropna().nunique()) if "customer_id" in df.columns else 0

    # Average transaction value (ATV): net_sales / unique_orders
    atv = (net_sales / unique_orders) if unique_orders > 0 else 0.0

    # Average items per basket/order
    avg_items_per_order = (units_sold / unique_orders) if unique_orders > 0 else 0.0

    # Active products
    active_products = int(df["product_id"].nunique())

    # Growth calculation if previous period DataFrame is provided
    growth = None
    if previous_df is not None and len(previous_df) > 0:
        prev_kpis = compute_kpis(previous_df)
        prev_net = prev_kpis["net_sales"]
        prev_units = prev_kpis["units_sold"]
        prev_orders = prev_kpis["unique_orders"]

        growth = {
            "net_sales_pct": round(((net_sales - prev_net) / prev_net * 100.0), 2) if prev_net > 0 else 0.0,
            "units_sold_pct": round(((units_sold - prev_units) / prev_units * 100.0), 2) if prev_units > 0 else 0.0,
            "orders_pct": round(((unique_orders - prev_orders) / prev_orders * 100.0), 2) if prev_orders > 0 else 0.0,
        }

    return {
        "gross_sales": round(gross_sales, 2),
        "net_sales": round(net_sales, 2),
        "cogs": round(cogs, 2),
        "estimated_gross_profit": round(estimated_gross_profit, 2),
        "gross_margin_pct": round(gross_margin_pct, 2),
        "units_sold": units_sold,
        "unique_transactions": unique_txns,
        "unique_orders": unique_orders,
        "unique_customers": unique_custs,
        "average_transaction_value": round(atv, 2),
        "average_items_per_order": round(avg_items_per_order, 2),
        "active_products": active_products,
        "growth": growth,
        "currency": "INR",
        "currency_symbol": "₹",
        "is_simulated": True
    }


def compute_canteen_health_score(kpis: Dict[str, Any], quality_score: float = 95.0, demand_cv: float = 0.25) -> Dict[str, Any]:
    """
    Computes an explainable, documented Canteen Health Score (0-100).
    Components:
    1. Margin Health (30% weight): score based on gross margin % (target >= 50%)
    2. Data Quality (25% weight): from Data Studio quality score (0-100)
    3. Volume Stability (25% weight): demand coefficient of variation (lower CV = higher stability)
    4. Revenue Consistency (20% weight): positive growth or steady transaction rate
    """
    # 1. Margin Score (0-100): 50% margin gives 100, 20% gives 40
    margin = kpis.get("gross_margin_pct", 0.0)
    margin_score = min(100.0, max(0.0, (margin / 50.0) * 100.0))

    # 2. Quality Score (0-100)
    q_score = min(100.0, max(0.0, quality_score))

    # 3. Stability Score (0-100): based on CV of daily demand (CV <= 0.2 gives 100, CV >= 0.8 gives 20)
    stability_score = min(100.0, max(10.0, (1.0 - min(demand_cv, 1.0)) * 100.0))

    # 4. Operations Score (0-100): based on active products and orders
    atv = kpis.get("average_transaction_value", 0.0)
    ops_score = min(100.0, max(20.0, (atv / 120.0) * 100.0))

    total_score = round(
        0.30 * margin_score +
        0.25 * q_score +
        0.25 * stability_score +
        0.20 * ops_score,
        1
    )

    grade = "A (Optimal)" if total_score >= 85 else ("B (Healthy)" if total_score >= 70 else ("C (Moderate Risk)" if total_score >= 50 else "D (Action Required)"))

    return {
        "overall_score": total_score,
        "grade": grade,
        "weights": {
            "margin_health_weight": 0.30,
            "data_quality_weight": 0.25,
            "demand_stability_weight": 0.25,
            "operational_efficiency_weight": 0.20
        },
        "components": {
            "margin_health_score": round(margin_score, 1),
            "data_quality_score": round(q_score, 1),
            "demand_stability_score": round(stability_score, 1),
            "operational_score": round(ops_score, 1)
        },
        "explanation": f"Health score is {total_score}/100 ({grade}) driven by {margin:.1f}% gross margin and {q_score:.1f}% data quality."
    }
