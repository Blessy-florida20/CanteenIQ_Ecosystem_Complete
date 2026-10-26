"""
CanteenIQ Dataset Manager & Filter Engine
Loads, caches, and filters datasets based on global application parameters.
"""

import os
from pathlib import Path
from typing import Optional, Tuple
import pandas as pd
from app.core.config import SYNTHETIC_DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR

_DATASET_CACHE = {}


def get_dataset_path(dataset_id: str) -> Path:
    """Resolves dataset path across synthetic, processed, and raw folders."""
    # Check synthetic dir first
    p1 = SYNTHETIC_DATA_DIR / dataset_id
    if p1.exists():
        return p1
    # Check processed dir
    p2 = PROCESSED_DATA_DIR / dataset_id
    if p2.exists():
        return p2
    # Check raw dir
    p3 = RAW_DATA_DIR / dataset_id
    if p3.exists():
        return p3
    # Default fallback to synthetic_transactions.csv
    return SYNTHETIC_DATA_DIR / "synthetic_transactions.csv"


def load_dataset(dataset_id: str = "synthetic_transactions.csv") -> pd.DataFrame:
    """Loads CSV dataset with in-memory caching."""
    path = get_dataset_path(dataset_id)
    str_path = str(path)

    if not path.exists():
        # Fallback to generating or empty dataframe
        return pd.DataFrame()

    mtime = os.path.getmtime(str_path)
    if str_path in _DATASET_CACHE:
        cached_mtime, cached_df = _DATASET_CACHE[str_path]
        if cached_mtime == mtime:
            return cached_df.copy()

    df = pd.read_csv(str_path)
    _DATASET_CACHE[str_path] = (mtime, df)
    return df.copy()


def apply_filters(
    df: pd.DataFrame,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    product_id: Optional[str] = None
) -> pd.DataFrame:
    """Applies global filters uniformly across all analytics modules."""
    if df is None or len(df) == 0:
        return pd.DataFrame()

    filtered = df.copy()

    if start_date and "transaction_date" in filtered.columns:
        filtered = filtered[filtered["transaction_date"] >= start_date]

    if end_date and "transaction_date" in filtered.columns:
        filtered = filtered[filtered["transaction_date"] <= end_date]

    if category and category.lower() != "all" and "category" in filtered.columns:
        filtered = filtered[filtered["category"] == category]

    if product_id and product_id.lower() != "all" and "product_id" in filtered.columns:
        filtered = filtered[filtered["product_id"] == product_id]

    return filtered.reset_index(drop=True)
