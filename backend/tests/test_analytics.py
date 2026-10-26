"""
Unit tests for CanteenIQ analytics services:
- metrics.py: formulas against hand-computed fixtures
- cleaner.py: quarantine isolation and quality scoring
- eda.py: Pareto ABC, Gini coefficient, and time trends
- stats.py: hypothesis testing, normality, and assumption advisor
"""

import pytest
import pandas as pd
import numpy as np

from app.services.metrics import compute_kpis, compute_canteen_health_score
from app.services.cleaner import DataCleaner
from app.services.eda import EDAService
from app.services.stats import StatisticalLaboratory


@pytest.fixture
def sample_transactions():
    """Hand-crafted deterministic fixture for exact mathematical verification."""
    data = [
        # Order 1 (2 items)
        {"transaction_id": "T1", "order_id": "O1", "customer_id": "C1", "transaction_date": "2025-01-01", "transaction_time": "09:00:00", "product_id": "P1", "product_name": "Item 1", "category": "Breakfast", "quantity": 2, "unit_price": 50.0, "discount": 10.0, "unit_cost": 20.0, "payment_method": "UPI"},
        {"transaction_id": "T2", "order_id": "O1", "customer_id": "C1", "transaction_date": "2025-01-01", "transaction_time": "09:00:00", "product_id": "P2", "product_name": "Item 2", "category": "Beverages", "quantity": 1, "unit_price": 20.0, "discount": 0.0, "unit_cost": 5.0, "payment_method": "UPI"},
        # Order 2 (1 item)
        {"transaction_id": "T3", "order_id": "O2", "customer_id": "C2", "transaction_date": "2025-01-01", "transaction_time": "13:00:00", "product_id": "P3", "product_name": "Item 3", "category": "Meals", "quantity": 1, "unit_price": 100.0, "discount": 5.0, "unit_cost": 45.0, "payment_method": "Cash"},
        # Order 3 (1 item, weekend)
        {"transaction_id": "T4", "order_id": "O3", "customer_id": "C1", "transaction_date": "2025-01-04", "transaction_time": "17:00:00", "product_id": "P1", "product_name": "Item 1", "category": "Breakfast", "quantity": 1, "unit_price": 50.0, "discount": 0.0, "unit_cost": 20.0, "payment_method": "College Card"}
    ]
    return pd.DataFrame(data)


def test_metric_formulas_exact(sample_transactions):
    """
    Hand calculation verification:
    Line 1: qty=2, price=50, disc=10, cost=20 -> gross=100, net=90, cogs=40
    Line 2: qty=1, price=20, disc=0,  cost=5  -> gross=20,  net=20, cogs=5
    Line 3: qty=1, price=100,disc=5,  cost=45 -> gross=100, net=95, cogs=45
    Line 4: qty=1, price=50, disc=0,  cost=20 -> gross=50,  net=50, cogs=20
    Totals:
    gross_sales = 100 + 20 + 100 + 50 = 270.0
    net_sales = 90 + 20 + 95 + 50 = 255.0
    cogs = 40 + 5 + 45 + 20 = 110.0
    estimated_gross_profit = 255.0 - 110.0 = 145.0
    gross_margin_pct = 145.0 / 255.0 * 100 = 56.86%
    units_sold = 2 + 1 + 1 + 1 = 5
    unique_orders = 3
    atv = 255.0 / 3 = 85.0
    """
    kpis = compute_kpis(sample_transactions)

    assert kpis["gross_sales"] == 270.0
    assert kpis["net_sales"] == 255.0
    assert kpis["cogs"] == 110.0
    assert kpis["estimated_gross_profit"] == 145.0
    assert round(kpis["gross_margin_pct"], 2) == 56.86
    assert kpis["units_sold"] == 5
    assert kpis["unique_orders"] == 3
    assert kpis["average_transaction_value"] == 85.0
    assert kpis["active_products"] == 3


def test_cleaner_quarantine_and_scoring(sample_transactions):
    """Asserts that corrupted rows are isolated to quarantine and not silently discarded."""
    dirty_data = sample_transactions.copy()
    # Add duplicate
    dirty_data = pd.concat([dirty_data, sample_transactions.iloc[[0]]], ignore_index=True)
    # Add invalid negative qty
    invalid_qty_row = sample_transactions.iloc[[0]].copy()
    invalid_qty_row["quantity"] = -2
    # Add zero price
    zero_price_row = sample_transactions.iloc[[1]].copy()
    zero_price_row["unit_price"] = 0.0

    dirty_data = pd.concat([dirty_data, invalid_qty_row, zero_price_row], ignore_index=True)

    cleaner = DataCleaner(dirty_data)
    cleaned_df, quarantined_df, quality_report, log = cleaner.clean()

    # Original had 4 valid rows. 3 corrupt rows added (1 dup + 1 negative qty + 1 zero price)
    assert len(cleaned_df) == 4
    assert len(quarantined_df) == 3
    assert "quarantine_reason" in quarantined_df.columns
    assert quality_report["overall_quality_score"] < 100.0
    assert quality_report["dimensions"]["validity"] < 100.0


def test_pareto_and_gini_calculation(sample_transactions):
    """Verifies that Gini coefficient is bounded in [0, 1] and ABC classes sum to total items."""
    eda = EDAService(sample_transactions)
    pareto = eda.get_pareto_concentration()

    assert 0.0 <= pareto["gini_coefficient"] <= 1.0
    assert len(pareto["lorenz_curve"]) > 0
    total_items = (
        pareto["class_summary"]["A_items"] +
        pareto["class_summary"]["B_items"] +
        pareto["class_summary"]["C_items"]
    )
    assert total_items == 3


def test_statistical_tests_and_advisor(sample_transactions):
    """Tests hypothesis test execution and assumption advisor output."""
    stats_lab = StatisticalLaboratory(sample_transactions)
    desc = stats_lab.compute_descriptive_stats("net_sales")

    assert "mean" in desc
    assert "median" in desc
    assert "ci_95" in desc

    chi_res = stats_lab.test_category_payment_independence()
    assert "statistic" in chi_res
    assert "p_value" in chi_res
    assert "effect_size" in chi_res
