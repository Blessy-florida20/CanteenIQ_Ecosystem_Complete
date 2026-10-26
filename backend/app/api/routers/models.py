import json
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Body

from app.services.dataset_manager import load_dataset, get_dataset_path
from app.services.forecasting import DemandForecaster
from app.services.associations import AssociationMiner
from app.services.anomalies import AnomalyDetector
from app.core.config import SYNTHETIC_DATA_DIR
from app.database.db import save_model_run, list_model_runs, update_anomaly_status
from app.schemas.schemas import (
    ForecastRequest, ForecastResponse,
    AssociationRequest, AssociationResponse,
    AnomalyResponse, AnomalyReviewUpdate
)
import pandas as pd

router = APIRouter(tags=["Models"])


@router.post("/models/forecast", response_model=ForecastResponse)
def run_forecast(req: ForecastRequest = Body(...)):
    """Runs walk-forward backtesting, evaluates model leaderboard, and returns forecasts."""
    df = load_dataset(req.dataset_id or "synthetic_transactions.csv")
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")

    forecaster = DemandForecaster(df, target=req.target)
    results = forecaster.run_walk_forward_backtest(horizon=req.horizon, n_folds=req.backtest_folds)

    if "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])

    # Persist winner run into SQLite experiment registry
    winner_item = [m for m in results["leaderboard"] if m["is_winner"]][0]
    run_id = f"RUN_{uuid.uuid4().hex[:8].upper()}"
    save_model_run({
        "run_id": run_id,
        "dataset_id": req.dataset_id or "synthetic_transactions.csv",
        "model_type": winner_item["model_name"],
        "target_metric": req.target,
        "horizon": req.horizon,
        "mae": winner_item["mae"],
        "rmse": winner_item["rmse"],
        "smape": winner_item["smape_pct"],
        "is_winner": True,
        "model_card_json": json.dumps(winner_item["model_card"]),
        "created_at": datetime.now().isoformat()
    })

    return results


@router.get("/models/runs")
def get_model_runs():
    """Lists saved experiment registry runs and model cards."""
    return list_model_runs()


@router.post("/models/associations", response_model=AssociationResponse)
def run_associations(req: AssociationRequest = Body(...)):
    """Runs Apriori association mining on multi-item baskets."""
    df = load_dataset(req.dataset_id or "synthetic_transactions.csv")
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")

    miner = AssociationMiner(df)
    return miner.mine_rules(
        min_support=req.min_support,
        min_confidence=req.min_confidence,
        min_lift=req.min_lift,
        time_of_day=req.time_of_day or "all"
    )


@router.post("/models/anomalies", response_model=AnomalyResponse)
def run_anomalies(dataset_id: str = Query("synthetic_transactions.csv")):
    """Detects sales surges and drops, benchmarked against ground truth events."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Load ground truth if available
    gt_path = SYNTHETIC_DATA_DIR / "synthetic_ground_truth_events.csv"
    gt_df = pd.read_csv(gt_path) if gt_path.exists() else None

    detector = AnomalyDetector(df, ground_truth_df=gt_df)
    return detector.detect_anomalies()


@router.patch("/anomalies/{anomaly_id}/status")
def review_anomaly(anomaly_id: str, update: AnomalyReviewUpdate = Body(...)):
    """Updates review status of an unusual observation in SQLite."""
    update_anomaly_status(anomaly_id, update.status, update.notes)
    return {
        "anomaly_id": anomaly_id,
        "status": update.status,
        "message": "Anomaly review status persisted successfully."
    }
