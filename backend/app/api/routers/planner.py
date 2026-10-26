from fastapi import APIRouter, HTTPException, Body, Query
import pandas as pd

from app.core.config import SYNTHETIC_DATA_DIR
from app.services.planner import PreparationPlanner
from app.schemas.schemas import NewsvendorRequest, NewsvendorResponse

router = APIRouter(prefix="/planner", tags=["Planner"])


def get_products_dataframe() -> pd.DataFrame:
    p_path = SYNTHETIC_DATA_DIR / "synthetic_products.csv"
    if p_path.exists():
        return pd.read_csv(p_path)
    return pd.DataFrame()


@router.post("/prepare", response_model=NewsvendorResponse)
def plan_preparation(req: NewsvendorRequest = Body(...)):
    """Computes critical-ratio Newsvendor optimization and Monte Carlo stockout/surplus risks."""
    prods = get_products_dataframe()
    if prods.empty:
        raise HTTPException(status_code=500, detail="Products catalog unavailable")

    planner = PreparationPlanner(prods)
    return planner.plan_single_product(
        product_id=req.product_id,
        forecast_demand=req.forecast_demand,
        usable_stock=req.usable_stock,
        safety_buffer_pct=req.safety_buffer_pct,
        min_batch_size=req.min_batch_size,
        max_capacity=req.max_capacity
    )


@router.post("/batch")
def batch_menu_plan(
    target_date: str = Query("2025-06-01"),
    forecast_multiplier: float = Query(1.0, ge=0.5, le=3.0),
    safety_buffer_pct: float = Query(0.15, ge=0.0, le=0.5)
):
    """Generates whole-menu kitchen batch preparation sheet for specified date."""
    prods = get_products_dataframe()
    if prods.empty:
        raise HTTPException(status_code=500, detail="Products catalog unavailable")

    planner = PreparationPlanner(prods)
    return planner.generate_menu_batch_sheet(
        target_date=target_date,
        forecast_multiplier=forecast_multiplier,
        safety_buffer_pct=safety_buffer_pct
    )
