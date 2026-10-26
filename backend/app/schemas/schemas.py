"""
CanteenIQ Pydantic v2 Schemas
Defines strictly typed request and response contracts for all API routers.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class FilterParams(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    category: Optional[str] = None
    product_id: Optional[str] = None
    dataset_id: Optional[str] = "synthetic_transactions.csv"


class DatasetResponse(BaseModel):
    id: str
    name: str
    filename: str
    is_synthetic: bool
    row_count: int
    config_hash: Optional[str] = None
    created_at: str


class KPISummaryResponse(BaseModel):
    gross_sales: float
    net_sales: float
    cogs: float
    estimated_gross_profit: float
    gross_margin_pct: float
    units_sold: int
    unique_transactions: int
    unique_orders: int
    unique_customers: int
    average_transaction_value: float
    average_items_per_order: float
    active_products: int
    growth: Optional[Dict[str, Any]] = None
    health_score: Dict[str, Any]
    currency: str = "INR"
    currency_symbol: str = "₹"
    is_simulated: bool = True


class TrendResponse(BaseModel):
    records: List[Dict[str, Any]]
    takeaway: str


class CategoryResponse(BaseModel):
    categories: List[Dict[str, Any]]
    takeaway: str


class ProductRankingResponse(BaseModel):
    top_by_revenue: List[Dict[str, Any]]
    top_by_quantity: List[Dict[str, Any]]
    takeaway: str


class ParetoResponse(BaseModel):
    items: List[Dict[str, Any]]
    gini_coefficient: float
    lorenz_curve: List[Dict[str, Any]]
    class_summary: Dict[str, int]
    takeaway: str


class HeatmapResponse(BaseModel):
    matrix: List[Dict[str, Any]]
    hours: List[int]
    days: List[str]
    takeaway: str


class StatisticsResponse(BaseModel):
    descriptive: Dict[str, Any]
    weekday_vs_weekend_test: Dict[str, Any]
    category_payment_test: Dict[str, Any]
    stationarity_adf_test: Dict[str, Any]


class ForecastRequest(BaseModel):
    dataset_id: Optional[str] = "synthetic_transactions.csv"
    target: str = "net_sales" # "net_sales" or "units_sold"
    horizon: int = 14
    product_id: Optional[str] = None
    models: Optional[List[str]] = Field(default=["Seasonal_Naive", "Holt_Winters", "Random_Forest"])
    backtest_folds: int = 3


class ForecastPredictionPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    forecast: float
    lower_bound: float
    upper_bound: float


class ModelLeaderboardItem(BaseModel):
    model_name: str
    mae: float
    rmse: float
    smape_pct: float
    bias: float
    improvement_vs_baseline_pct: float
    is_winner: bool
    model_card: Dict[str, Any]


class ForecastResponse(BaseModel):
    target: str
    horizon: int
    winner_model: str
    leaderboard: List[ModelLeaderboardItem]
    predictions: List[ForecastPredictionPoint]
    historical: List[Dict[str, Any]]
    coverage_rate_pct: float
    disclaimer: str = "Forecasts based on synthetic institutional demand patterns. Uncertainty intervals represent statistical variance."


class AssociationRequest(BaseModel):
    dataset_id: Optional[str] = "synthetic_transactions.csv"
    min_support: float = 0.015
    min_confidence: float = 0.20
    min_lift: float = 1.1
    time_of_day: Optional[str] = "all" # "all", "breakfast", "lunch", "evening"


class AssociationRuleItem(BaseModel):
    antecedents: List[str]
    consequents: List[str]
    support: float
    confidence: float
    lift: float
    leverage: float
    conviction: float
    time_slot: str
    plain_language: str


class AssociationResponse(BaseModel):
    rules: List[AssociationRuleItem]
    network_nodes: List[Dict[str, Any]]
    network_links: List[Dict[str, Any]]
    takeaway: str


class AnomalyResponse(BaseModel):
    anomalies: List[Dict[str, Any]]
    evaluation: Optional[Dict[str, Any]] = None
    takeaway: str


class AnomalyReviewUpdate(BaseModel):
    status: str # "New", "Reviewed", "Explained", "Dismissed"
    notes: Optional[str] = None


class NewsvendorRequest(BaseModel):
    product_id: str
    target_date: str
    forecast_demand: float
    usable_stock: float = 0.0
    safety_buffer_pct: float = 0.15
    min_batch_size: int = 5
    max_capacity: int = 500


class NewsvendorResponse(BaseModel):
    product_id: str
    product_name: str
    forecast_demand: float
    base_planned_quantity: int
    optimal_newsvendor_quantity: int
    recommended_quantity: int
    critical_ratio: float
    shortage_risk_pct: float
    surplus_risk_pct: float
    expected_leftover_units: float
    expected_shortage_units: float
    underage_cost_margin: float
    overage_cost: float
    plain_explanation: str


class WhatIfRequest(BaseModel):
    price_change_pct: float = 0.0
    demand_multiplier: float = 1.0
    discount_rate_pct: float = 0.0
    cost_change_pct: float = 0.0
    safety_buffer_pct: float = 0.15


class WhatIfResponse(BaseModel):
    baseline: Dict[str, Any]
    scenario: Dict[str, Any]
    delta: Dict[str, Any]
    elasticity_estimate: Dict[str, Any]
    break_even_units: int
    tornado_sensitivity: List[Dict[str, Any]]
    monte_carlo_bands: Dict[str, Any]
    disclaimer: str = "Simulation output based on economic models and synthetic historical elasticity."


class AssistantRequest(BaseModel):
    query: str


class AssistantResponse(BaseModel):
    query: str
    intent: str
    text_answer: str
    table_data: Optional[List[Dict[str, Any]]] = None
    chart_type: Optional[str] = None
    filters_applied: Dict[str, Any]
    formula_used: str
    supported_examples: List[str]


class DecisionCreate(BaseModel):
    title: str
    recommendation_id: Optional[str] = None
    category: str
    action_taken: str
    baseline_metric: float
    notes: Optional[str] = None


class DecisionResponse(BaseModel):
    id: str
    title: str
    category: str
    action_taken: str
    baseline_metric: float
    observed_metric: Optional[float] = None
    status: str
    causal_warning: str
    created_at: str
    updated_at: str
