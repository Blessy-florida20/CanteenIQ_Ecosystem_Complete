export interface DatasetInfo {
  id: string;
  name: string;
  filename: string;
  is_synthetic: boolean;
  row_count: number;
  config_hash?: string;
  created_at: string;
}

export interface KPISummary {
  gross_sales: number;
  net_sales: number;
  cogs: number;
  estimated_gross_profit: number;
  gross_margin_pct: number;
  units_sold: number;
  unique_transactions: number;
  unique_orders: number;
  unique_customers: number;
  average_transaction_value: number;
  average_items_per_order: number;
  active_products: number;
  growth?: {
    net_sales_pct: number;
    units_sold_pct: number;
    orders_pct: number;
  };
  health_score: {
    overall_score: number;
    grade: string;
    weights: Record<string, number>;
    components: {
      margin_health_score: number;
      data_quality_score: number;
      demand_stability_score: number;
      operational_score: number;
    };
    explanation: string;
  };
  currency: string;
  currency_symbol: string;
  is_simulated: boolean;
}

export interface TrendRecord {
  period: string;
  net_sales: number;
  units_sold: number;
  orders: number;
  profit: number;
}

export interface CategoryRecord {
  category: string;
  net_sales: number;
  units_sold: number;
  profit: number;
  revenue_share_pct: number;
  gross_margin_pct: number;
}

export interface ProductRanking {
  product_id: string;
  product_name: string;
  category: string;
  net_sales: number;
  units_sold: number;
  profit: number;
  gross_margin_pct: number;
}

export interface ParetoData {
  items: Array<{
    product_id: string;
    product_name: string;
    category: string;
    revenue: number;
    units: number;
    revenue_share: number;
    cum_revenue_share: number;
    abc_class: string;
  }>;
  gini_coefficient: number;
  lorenz_curve: Array<{ item_pct: number; revenue_pct: number }>;
  class_summary: {
    A_items: number;
    B_items: number;
    C_items: number;
  };
  takeaway: string;
}

export interface HeatmapData {
  matrix: Array<{ day: string; hours: number[] }>;
  hours: number[];
  days: string[];
  takeaway: string;
}

export interface StatisticalTestResult {
  question: string;
  null_hypothesis_H0: string;
  alt_hypothesis_H1: string;
  test_name: string;
  statistic: number;
  p_value: number;
  alpha: number;
  reject_null: boolean;
  decision: string;
  effect_size: { metric: string; value: number; strength?: string };
  interpretation: string;
  limitations: string;
  assumption_advisor?: {
    weekday_normality?: boolean;
    weekend_normality?: boolean;
    expected_frequencies_check?: boolean;
    rationale: string;
  };
}

export interface ForecastResponse {
  target: string;
  horizon: number;
  winner_model: string;
  leaderboard: Array<{
    model_name: string;
    mae: number;
    rmse: number;
    smape_pct: number;
    bias: number;
    improvement_vs_baseline_pct: number;
    is_winner: boolean;
    model_card: any;
  }>;
  predictions: Array<{
    date: string;
    forecast: number;
    lower_bound: number;
    upper_bound: number;
  }>;
  historical: Array<{ date: string; actual: number }>;
  coverage_rate_pct: number;
  disclaimer: string;
}

export interface AssociationRule {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
  leverage: number;
  conviction: number;
  time_slot: string;
  plain_language: string;
}

export interface AnomalyItem {
  anomaly_id: string;
  date: string;
  observed_value: number;
  expected_value: number;
  deviation_pct: number;
  severity: string;
  direction: string;
  methods_triggered: {
    robust_mad: boolean;
    iqr: boolean;
    isolation_forest: boolean;
  };
  reason: string;
  status: string;
  notes?: string;
}

export interface NewsvendorPlan {
  product_id: string;
  product_name: string;
  forecast_demand: number;
  base_planned_quantity: number;
  optimal_newsvendor_quantity: number;
  recommended_quantity: number;
  critical_ratio: number;
  shortage_risk_pct: number;
  surplus_risk_pct: number;
  expected_leftover_units: number;
  expected_shortage_units: number;
  underage_cost_margin: number;
  overage_cost: number;
  shelf_life_hours: number;
  plain_explanation: string;
}

export interface WhatIfScenarioResult {
  baseline: {
    gross_sales: number;
    net_sales: number;
    cogs: number;
    profit: number;
    units: number;
    gross_margin_pct: number;
  };
  scenario: {
    gross_sales: number;
    net_sales: number;
    cogs: number;
    profit: number;
    units: number;
    gross_margin_pct: number;
  };
  delta: {
    net_sales: number;
    net_sales_pct: number;
    profit: number;
    profit_pct: number;
    units: number;
  };
  elasticity_estimate: {
    elasticity: number;
    p_value: number;
    r_squared: number;
    confidence_interval_95: number[];
    interpretation: string;
    caveats: string;
  };
  break_even_units: number;
  tornado_sensitivity: Array<{
    driver: string;
    low_profit: number;
    high_profit: number;
  }>;
  monte_carlo_bands: {
    p10_conservative: number;
    p50_expected: number;
    p90_optimistic: number;
  };
  disclaimer: string;
}

export interface Recommendation {
  id: string;
  title: string;
  category: string;
  priority_score: number;
  confidence_level: string;
  observed_pattern: string;
  evidence_metrics: string;
  proposed_action: string;
  expected_direction: string;
  source_link: string;
  status: string;
}

export interface Decision {
  id: string;
  title: string;
  recommendation_id?: string;
  category: string;
  action_taken: string;
  baseline_metric: number;
  observed_metric?: number;
  status: string;
  control_window_notes?: string;
  causal_warning: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalFilters {
  startDate?: string;
  endDate?: string;
  category: string;
  productId: string;
  datasetId: string;
}
