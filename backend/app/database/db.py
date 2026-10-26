"""
CanteenIQ SQLite Database Layer
Stores metadata, experiment registry, model cards, anomaly reviews,
saved scenarios, and decision tracking logs.
"""

import sqlite3
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from app.core.config import DB_PATH


def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with row factory configured."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes schema tables if not present."""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Datasets table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            is_synthetic BOOLEAN NOT NULL DEFAULT 1,
            row_count INTEGER NOT NULL,
            config_hash TEXT,
            created_at TEXT NOT NULL
        )
        """)

        # Experiment Registry & Model Runs
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS model_runs (
            run_id TEXT PRIMARY KEY,
            dataset_id TEXT NOT NULL,
            model_type TEXT NOT NULL,
            target_metric TEXT NOT NULL,
            horizon INTEGER NOT NULL,
            mae REAL NOT NULL,
            rmse REAL NOT NULL,
            smape REAL NOT NULL,
            is_winner BOOLEAN DEFAULT 0,
            model_card_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        # Anomaly Reviews Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS anomaly_reviews (
            anomaly_id TEXT PRIMARY KEY,
            transaction_date TEXT NOT NULL,
            product_name TEXT,
            observed_value REAL,
            expected_value REAL,
            severity TEXT,
            status TEXT NOT NULL DEFAULT 'New',
            notes TEXT,
            updated_at TEXT NOT NULL
        )
        """)

        # Scenarios Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS scenarios (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            baseline_profit REAL NOT NULL,
            scenario_profit REAL NOT NULL,
            delta_profit REAL NOT NULL,
            params_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        # Decision Impact Tracker Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS decisions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            recommendation_id TEXT,
            category TEXT NOT NULL,
            action_taken TEXT NOT NULL,
            baseline_metric REAL NOT NULL,
            observed_metric REAL,
            status TEXT NOT NULL DEFAULT 'Accepted',
            control_window_notes TEXT,
            causal_warning TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)

        # Generated Reports Registry
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            report_type TEXT NOT NULL,
            title TEXT NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        conn.commit()


# Helper query methods
def list_datasets() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM datasets ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]


def save_dataset_metadata(meta: Dict[str, Any]):
    with get_db_connection() as conn:
        conn.execute("""
        INSERT OR REPLACE INTO datasets (id, name, filename, filepath, is_synthetic, row_count, config_hash, created_at)
        VALUES (:id, :name, :filename, :filepath, :is_synthetic, :row_count, :config_hash, :created_at)
        """, meta)
        conn.commit()


def save_model_run(run_data: Dict[str, Any]):
    with get_db_connection() as conn:
        conn.execute("""
        INSERT OR REPLACE INTO model_runs (run_id, dataset_id, model_type, target_metric, horizon, mae, rmse, smape, is_winner, model_card_json, created_at)
        VALUES (:run_id, :dataset_id, :model_type, :target_metric, :horizon, :mae, :rmse, :smape, :is_winner, :model_card_json, :created_at)
        """, run_data)
        conn.commit()


def list_model_runs() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM model_runs ORDER BY created_at DESC").fetchall()
        results = []
        for r in rows:
            d = dict(r)
            d["model_card"] = json.loads(d["model_card_json"]) if d.get("model_card_json") else {}
            results.append(d)
        return results


def update_anomaly_status(anomaly_id: str, status: str, notes: Optional[str] = None):
    with get_db_connection() as conn:
        now = datetime.now().isoformat()
        conn.execute("""
        INSERT INTO anomaly_reviews (anomaly_id, transaction_date, status, notes, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(anomaly_id) DO UPDATE SET
            status = excluded.status,
            notes = coalesce(excluded.notes, anomaly_reviews.notes),
            updated_at = excluded.updated_at
        """, (anomaly_id, now[:10], status, notes, now))
        conn.commit()


def list_anomaly_reviews() -> Dict[str, Any]:
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM anomaly_reviews").fetchall()
        return {r["anomaly_id"]: dict(r) for r in rows}


def save_decision(decision: Dict[str, Any]):
    with get_db_connection() as conn:
        conn.execute("""
        INSERT OR REPLACE INTO decisions (id, title, recommendation_id, category, action_taken, baseline_metric, observed_metric, status, control_window_notes, causal_warning, created_at, updated_at)
        VALUES (:id, :title, :recommendation_id, :category, :action_taken, :baseline_metric, :observed_metric, :status, :control_window_notes, :causal_warning, :created_at, :updated_at)
        """, decision)
        conn.commit()


def list_decisions() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM decisions ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]
