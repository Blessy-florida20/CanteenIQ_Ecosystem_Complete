import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Body, Query

from app.services.dataset_manager import load_dataset
from app.services.recommendations import RecommendationEngine, DecisionTrackerService
from app.database.db import save_decision, list_decisions
from app.schemas.schemas import DecisionCreate

router = APIRouter(tags=["Decisions & Recommendations"])


@router.get("/recommendations")
def get_recommendations(dataset_id: str = Query("synthetic_transactions.csv")):
    """Generates explainable, prioritized operational recommendations."""
    df = load_dataset(dataset_id)
    engine = RecommendationEngine(df)
    return engine.generate_recommendations()


@router.get("/decisions")
def get_decisions():
    """Returns logged decision impact records with causal validity warnings."""
    return list_decisions()


@router.post("/decisions")
def create_decision(dec: DecisionCreate = Body(...)):
    """Logs an accepted recommendation into the Decision Impact Tracker."""
    d_id = f"DEC_{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now().isoformat()
    record = {
        "id": d_id,
        "title": dec.title,
        "recommendation_id": dec.recommendation_id,
        "category": dec.category,
        "action_taken": dec.action_taken,
        "baseline_metric": dec.baseline_metric,
        "observed_metric": None,
        "status": "Accepted",
        "control_window_notes": "Control window: comparable weekday peer period (+2.1% campus trend proxy)",
        "causal_warning": "CAUTION: Before/after comparisons do not establish causal proof. Institutional events act as major confounders.",
        "created_at": now,
        "updated_at": now
    }
    save_decision(record)
    return record
