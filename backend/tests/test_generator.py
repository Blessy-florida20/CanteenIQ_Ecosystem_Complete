"""
Unit tests for the CanteenDataGenerator service.
Verifies reproducibility, schema adherence, calendar sensitivity,
combo co-purchase elevation, and edge-case injections.
"""

import pytest
import numpy as np
import pandas as pd
from app.services.generator import CanteenDataGenerator, PRODUCT_CATALOG

REQUIRED_COLUMNS = [
    "transaction_id",
    "order_id",
    "customer_id",
    "transaction_date",
    "transaction_time",
    "product_id",
    "product_name",
    "category",
    "quantity",
    "unit_price",
    "discount",
    "unit_cost",
    "payment_method"
]

def test_generator_reproducibility():
    """Verifies that identical seed and config produces identical outputs."""
    gen1 = CanteenDataGenerator(start_date="2025-01-01", end_date="2025-01-31", target_orders=500, random_seed=42)
    df1, _, _, manifest1 = gen1.generate()

    gen2 = CanteenDataGenerator(start_date="2025-01-01", end_date="2025-01-31", target_orders=500, random_seed=42)
    df2, _, _, manifest2 = gen2.generate()

    assert manifest1["config_hash"] == manifest2["config_hash"]
    assert len(df1) == len(df2)
    pd.testing.assert_frame_equal(df1, df2)

def test_generator_schema():
    """Asserts that all required columns are present with valid data types."""
    gen = CanteenDataGenerator(start_date="2025-01-01", end_date="2025-01-15", target_orders=300, random_seed=123)
    df, df_prod, df_gt, manifest = gen.generate()

    for col in REQUIRED_COLUMNS:
        assert col in df.columns, f"Missing required column: {col}"

    assert (df["quantity"] > 0).all()
    assert (df["unit_price"] > 0).all()
    assert (df["unit_cost"] > 0).all()
    assert (df["discount"] >= 0).all()
    assert manifest["synthetic_disclaimer"] == "Simulated data. Not actual canteen performance."

def test_calendar_and_weekday_effects():
    """Checks that institutional Sunday volume is significantly lower than weekday volume."""
    gen = CanteenDataGenerator(start_date="2025-02-01", end_date="2025-02-28", target_orders=1500, random_seed=99)
    df, _, _, _ = gen.generate()

    df["dt"] = pd.to_datetime(df["transaction_date"])
    df["dow"] = df["dt"].dt.day_name()

    daily_orders = df.groupby(["transaction_date", "dow"])["order_id"].nunique().reset_index()
    sunday_avg = daily_orders[daily_orders["dow"] == "Sunday"]["order_id"].mean()
    weekday_avg = daily_orders[daily_orders["dow"].isin(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])]["order_id"].mean()

    assert sunday_avg < weekday_avg * 0.25, f"Sunday orders ({sunday_avg}) should be < 25% of weekday ({weekday_avg})"

def test_combo_co_purchase_affinity():
    """Checks that Samosa orders exhibit elevated Masala Chai co-occurrence."""
    gen = CanteenDataGenerator(start_date="2025-01-01", end_date="2025-03-31", target_orders=3000, random_seed=42)
    df, _, _, _ = gen.generate()

    # Find orders that have Samosa
    samosa_orders = df[df["product_id"] == "PRD_SN_01"]["order_id"].unique()
    # Check what proportion of multi-item samosa orders contain Masala Chai
    multi_item_orders = df[df["order_id"].isin(samosa_orders)].groupby("order_id")["product_id"].nunique()
    multi_item_order_ids = multi_item_orders[multi_item_orders > 1].index

    orders_with_both = df[(df["order_id"].isin(multi_item_order_ids)) & (df["product_id"] == "PRD_BV_01")]["order_id"].nunique()
    co_occurrence_rate = orders_with_both / len(multi_item_order_ids)

    assert co_occurrence_rate > 0.50, f"Expected > 50% co-occurrence of Samosa + Chai, got {co_occurrence_rate:.2%}"

def test_quality_anomalies_injection():
    """Verifies that dirty dataset contains injected missing values, duplicates, and invalid numbers."""
    gen = CanteenDataGenerator(start_date="2025-01-01", end_date="2025-01-31", target_orders=1000, random_seed=42, inject_quality_issues=True)
    df, _, _, _ = gen.generate()

    has_missing = df["customer_id"].isna().sum() > 0 or df["category"].isna().sum() > 0
    has_negative_qty = (df["quantity"] < 0).sum() > 0
    has_zero_price = (df["unit_price"] == 0).sum() > 0
    has_duplicates = df.duplicated().sum() > 0

    assert has_missing, "Expected missing values in dirty dataset"
    assert has_negative_qty, "Expected negative quantities in dirty dataset"
    assert has_zero_price, "Expected zero unit price in dirty dataset"
    assert has_duplicates, "Expected duplicated rows in dirty dataset"

def test_inventory_scenarios_labeling():
    """Asserts that simulated inventory file has strict simulation disclaimers."""
    gen = CanteenDataGenerator(start_date="2025-01-01", end_date="2025-01-10", target_orders=200, random_seed=42)
    df_tx, _, _, _ = gen.generate()
    df_inv = gen.generate_inventory_scenarios(df_tx)

    assert "simulation_label" in df_inv.columns
    assert (df_inv["simulation_label"] == "Simulated Planning Data (Not Measured Real Waste)").all()
    assert (df_inv["units_prepared"] >= 0).all()
    assert (df_inv["units_leftover"] >= 0).all()
