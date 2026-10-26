from typing import Optional
from fastapi import APIRouter, Query
import pandas as pd

from app.services.dataset_manager import load_dataset, apply_filters
from app.services.metrics import compute_kpis, compute_canteen_health_score
from app.services.eda import EDAService
from app.services.stats import StatisticalLaboratory
from app.schemas.schemas import KPISummaryResponse, TrendResponse, CategoryResponse, ProductRankingResponse, ParetoResponse, HeatmapResponse, StatisticsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=KPISummaryResponse)
def get_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    product_id: Optional[str] = Query(None),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Computes executive KPI summary with growth and health score."""
    raw_df = load_dataset(dataset_id)
    df = apply_filters(raw_df, start_date, end_date, category, product_id)

    kpis = compute_kpis(df)
    health = compute_canteen_health_score(kpis)

    return {**kpis, "health_score": health}


@router.get("/trends", response_model=TrendResponse)
def get_trends(
    freq: str = Query("D", pattern="^(D|W|M)$"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    product_id: Optional[str] = Query(None),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Returns daily/weekly/monthly trends with takeaway caption."""
    raw_df = load_dataset(dataset_id)
    df = apply_filters(raw_df, start_date, end_date, category, product_id)
    eda = EDAService(df)
    return eda.get_time_trends(freq=freq)


@router.get("/categories", response_model=CategoryResponse)
def get_categories(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    product_id: Optional[str] = Query(None),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Returns category revenue, margin, and volume metrics."""
    raw_df = load_dataset(dataset_id)
    df = apply_filters(raw_df, start_date, end_date, category, product_id)
    eda = EDAService(df)
    return eda.get_category_breakdown()


@router.get("/products", response_model=ProductRankingResponse)
def get_products(
    top_n: int = Query(15, ge=1, le=50),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    product_id: Optional[str] = Query(None),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Returns top products by revenue and quantity."""
    raw_df = load_dataset(dataset_id)
    df = apply_filters(raw_df, start_date, end_date, category, product_id)
    eda = EDAService(df)
    return eda.get_product_rankings(top_n=top_n)


@router.get("/peak-hours", response_model=HeatmapResponse)
def get_peak_hours(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    product_id: Optional[str] = Query(None),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Returns Hour x Weekday heatmap matrix."""
    raw_df = load_dataset(dataset_id)
    df = apply_filters(raw_df, start_date, end_date, category, product_id)
    eda = EDAService(df)
    return eda.get_hour_weekday_heatmap()


@router.get("/pareto", response_model=ParetoResponse)
def get_pareto(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    product_id: Optional[str] = Query(None),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Returns ABC Pareto analysis, Gini coefficient, and Lorenz curve."""
    raw_df = load_dataset(dataset_id)
    df = apply_filters(raw_df, start_date, end_date, category, product_id)
    eda = EDAService(df)
    return eda.get_pareto_concentration()


@router.get("/decomposition")
def get_decomposition(
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Returns additive time-series decomposition into Trend, Seasonal, Residual."""
    df = load_dataset(dataset_id)
    eda = EDAService(df)
    return eda.get_seasonal_decomposition()


@router.get("/changepoints")
def get_changepoints(
    threshold_std: float = Query(2.5, ge=1.0, le=5.0),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Returns detected structural shift points in daily sales."""
    df = load_dataset(dataset_id)
    eda = EDAService(df)
    return eda.detect_change_points(threshold_std=threshold_std)


@router.post("/statistics", response_model=StatisticsResponse)
def run_statistics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    product_id: Optional[str] = Query(None),
    dataset_id: str = Query("synthetic_transactions.csv")
):
    """Runs descriptive stats, hypothesis tests, and assumption advisor."""
    raw_df = load_dataset(dataset_id)
    df = apply_filters(raw_df, start_date, end_date, category, product_id)

    lab = StatisticalLaboratory(df)
    desc = lab.compute_descriptive_stats("net_sales")
    test_wd = lab.test_weekday_vs_weekend_sales()
    test_cat = lab.test_category_payment_independence()
    test_adf = lab.test_stationarity_adf()

    return {
        "descriptive": desc,
        "weekday_vs_weekend_test": test_wd,
        "category_payment_test": test_cat,
        "stationarity_adf_test": test_adf
    }
