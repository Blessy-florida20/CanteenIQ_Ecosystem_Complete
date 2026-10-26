from fastapi import APIRouter, HTTPException, Body, Query

from app.services.dataset_manager import load_dataset
from app.services.simulator import WhatIfSimulator, CanteenQueueDigitalTwin
from app.schemas.schemas import WhatIfRequest, WhatIfResponse

router = APIRouter(prefix="/simulator", tags=["Simulator"])


@router.post("/scenario", response_model=WhatIfResponse)
def run_scenario(
    req: WhatIfRequest = Body(...),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Calculates scenario financial impacts, price elasticity effects, and sensitivity tornado."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")

    sim = WhatIfSimulator(df)
    return sim.simulate_scenario(
        price_change_pct=req.price_change_pct,
        demand_multiplier=req.demand_multiplier,
        discount_rate_pct=req.discount_rate_pct,
        cost_change_pct=req.cost_change_pct
    )


@router.post("/elasticity")
def get_price_elasticity(dataset_id: str = Query("synthetic_transactions.csv")):
    """Calculates empirical log-log price elasticity with confidence intervals."""
    df = load_dataset(dataset_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")

    sim = WhatIfSimulator(df)
    return sim.estimate_price_elasticity()


@router.post("/queue")
def run_queue_simulation(
    num_counters: int = Query(3, ge=1, le=10),
    avg_service_time_seconds: float = Query(45.0, ge=15.0, le=180.0),
    target_sla_seconds: float = Query(180.0, ge=60.0, le=600.0)
):
    """Runs Canteen Digital Twin queue model and outputs hourly wait times and staffing needs."""
    twin = CanteenQueueDigitalTwin()
    return twin.simulate(
        num_counters=num_counters,
        avg_service_time_seconds=avg_service_time_seconds,
        target_max_wait_seconds=target_sla_seconds
    )
