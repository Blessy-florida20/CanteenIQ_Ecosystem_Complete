from fastapi import APIRouter, HTTPException, Body, Query
import pandas as pd

from app.services.dataset_manager import load_dataset
from app.services.novelty import (
    MenuEngineeringService,
    CustomerAnalyticsService,
    AskCanteenIQAssistant,
    DriftMonitorService,
    WasteScenarioLabService
)
from app.core.config import SYNTHETIC_DATA_DIR
from app.schemas.schemas import AssistantRequest, AssistantResponse

router = APIRouter(tags=["Novelty Modules"])


@router.get("/menu-engineering")
def get_menu_engineering(dataset_id: str = Query("synthetic_transactions.csv")):
    """Returns BCG-style Stars, Plowhorses, Puzzles, Dogs matrix."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")
    svc = MenuEngineeringService(df)
    return svc.get_matrix()


@router.post("/customers/segments")
def get_customer_segments(dataset_id: str = Query("synthetic_transactions.csv")):
    """Calculates RFM metrics and K-Means customer profiles."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")
    svc = CustomerAnalyticsService(df)
    return svc.get_rfm_segments()


@router.get("/customers/cohorts")
def get_retention_cohorts(dataset_id: str = Query("synthetic_transactions.csv")):
    """Generates monthly retention cohort heatmap."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")
    svc = CustomerAnalyticsService(df)
    return svc.get_retention_cohorts()


@router.post("/assistant/ask", response_model=AssistantResponse)
def ask_assistant(
    req: AssistantRequest = Body(...),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """100% Offline Rule/Intent Natural Language Query Assistant."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")
    assistant = AskCanteenIQAssistant(df)
    return assistant.ask(req.query)


@router.get("/monitor/drift")
def monitor_data_drift(dataset_id: str = Query("synthetic_transactions.csv")):
    """Evaluates distribution drift and category shifts between latest 30-day window and baseline."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")
    monitor = DriftMonitorService(df)
    return monitor.check_drift()


@router.post("/waste-lab/simulate")
def simulate_waste_policies():
    """Simulates hypothetical waste reduction comparing naive vs forecast prep policies."""
    inv_path = SYNTHETIC_DATA_DIR / "synthetic_inventory_scenarios.csv"
    if not inv_path.exists():
        raise HTTPException(status_code=404, detail="Inventory scenario file not found")
    inv_df = pd.read_csv(inv_path)
    lab = WasteScenarioLabService(inv_df)
    return lab.simulate_policies()
