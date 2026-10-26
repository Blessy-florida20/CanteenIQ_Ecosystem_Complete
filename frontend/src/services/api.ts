import {
  DatasetInfo,
  KPISummary,
  TrendRecord,
  CategoryRecord,
  ProductRanking,
  ParetoData,
  HeatmapData,
  StatisticalTestResult,
  ForecastResponse,
  AssociationRule,
  AnomalyItem,
  NewsvendorPlan,
  WhatIfScenarioResult,
  Recommendation,
  Decision,
  GlobalFilters
} from '../types/api';

const API_BASE = '/api';

function buildQuery(filters: Partial<GlobalFilters>, extra: Record<string, any> = {}): string {
  const params = new URLSearchParams();
  if (filters.datasetId) params.append('dataset_id', filters.datasetId);
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters.productId && filters.productId !== 'all') params.append('product_id', filters.productId);

  for (const [k, v] of Object.entries(extra)) {
    if (v !== undefined && v !== null) params.append(k, String(v));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// 1. Health
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

// 2. Datasets
export async function fetchDatasets(): Promise<DatasetInfo[]> {
  const res = await fetch(`${API_BASE}/datasets`);
  if (!res.ok) throw new Error('Failed to load datasets');
  return res.json();
}

export async function fetchDatasetPreview(datasetId: string, page = 1, pageSize = 25) {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/preview?page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error('Failed to preview dataset');
  return res.json();
}

export async function cleanDataset(datasetId: string) {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/clean`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to clean dataset');
  return res.json();
}

export async function fetchDataLineage(datasetId: string) {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/lineage`);
  if (!res.ok) throw new Error('Failed to load lineage');
  return res.json();
}

// 3. Analytics
export async function fetchKPISummary(filters: GlobalFilters): Promise<KPISummary> {
  const res = await fetch(`${API_BASE}/analytics/summary${buildQuery(filters)}`);
  if (!res.ok) throw new Error('Failed to load KPI summary');
  return res.json();
}

export async function fetchTrends(filters: GlobalFilters, freq = 'D'): Promise<{ records: TrendRecord[]; takeaway: string }> {
  const res = await fetch(`${API_BASE}/analytics/trends${buildQuery(filters, { freq })}`);
  if (!res.ok) throw new Error('Failed to load trends');
  return res.json();
}

export async function fetchCategories(filters: GlobalFilters): Promise<{ categories: CategoryRecord[]; takeaway: string }> {
  const res = await fetch(`${API_BASE}/analytics/categories${buildQuery(filters)}`);
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function fetchProducts(filters: GlobalFilters, topN = 15): Promise<{ top_by_revenue: ProductRanking[]; top_by_quantity: ProductRanking[]; takeaway: string }> {
  const res = await fetch(`${API_BASE}/analytics/products${buildQuery(filters, { top_n: topN })}`);
  if (!res.ok) throw new Error('Failed to load product rankings');
  return res.json();
}

export async function fetchHeatmap(filters: GlobalFilters): Promise<HeatmapData> {
  const res = await fetch(`${API_BASE}/analytics/peak-hours${buildQuery(filters)}`);
  if (!res.ok) throw new Error('Failed to load peak hours');
  return res.json();
}

export async function fetchPareto(filters: GlobalFilters): Promise<ParetoData> {
  const res = await fetch(`${API_BASE}/analytics/pareto${buildQuery(filters)}`);
  if (!res.ok) throw new Error('Failed to load Pareto analysis');
  return res.json();
}

export async function fetchDecomposition(datasetId: string) {
  const res = await fetch(`${API_BASE}/analytics/decomposition?dataset_id=${datasetId}`);
  if (!res.ok) throw new Error('Failed to load decomposition');
  return res.json();
}

export async function fetchChangepoints(datasetId: string, threshold = 2.5) {
  const res = await fetch(`${API_BASE}/analytics/changepoints?dataset_id=${datasetId}&threshold_std=${threshold}`);
  if (!res.ok) throw new Error('Failed to detect change points');
  return res.json();
}

export async function runStatistics(filters: GlobalFilters): Promise<{
  descriptive: any;
  weekday_vs_weekend_test: StatisticalTestResult;
  category_payment_test: StatisticalTestResult;
  stationarity_adf_test: StatisticalTestResult;
}> {
  const res = await fetch(`${API_BASE}/analytics/statistics${buildQuery(filters)}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run statistical tests');
  return res.json();
}

// 4. Models
export async function runForecast(payload: {
  dataset_id: string;
  target: string;
  horizon: number;
  backtest_folds: number;
}): Promise<ForecastResponse> {
  const res = await fetch(`${API_BASE}/models/forecast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to compute forecast');
  return res.json();
}

export async function fetchModelRuns() {
  const res = await fetch(`${API_BASE}/models/runs`);
  if (!res.ok) throw new Error('Failed to load experiment registry');
  return res.json();
}

export async function mineAssociations(payload: {
  dataset_id: string;
  min_support: number;
  min_confidence: number;
  min_lift: number;
  time_of_day: string;
}): Promise<{ rules: AssociationRule[]; network_nodes: any[]; network_links: any[]; takeaway: string }> {
  const res = await fetch(`${API_BASE}/models/associations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to mine associations');
  return res.json();
}

export async function detectAnomalies(datasetId: string): Promise<{ anomalies: AnomalyItem[]; evaluation: any; takeaway: string }> {
  const res = await fetch(`${API_BASE}/models/anomalies?dataset_id=${datasetId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to detect anomalies');
  return res.json();
}

export async function updateAnomalyStatus(anomalyId: string, status: string, notes?: string) {
  const res = await fetch(`${API_BASE}/anomalies/${anomalyId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

// 5. Planner
export async function planPreparation(payload: {
  product_id: string;
  target_date: string;
  forecast_demand: number;
  usable_stock: number;
  safety_buffer_pct: number;
}): Promise<NewsvendorPlan> {
  const res = await fetch(`${API_BASE}/planner/prepare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to plan preparation');
  return res.json();
}

export async function generateBatchPlan(targetDate: string, forecastMultiplier = 1.0, safetyBuffer = 0.15): Promise<NewsvendorPlan[]> {
  const res = await fetch(`${API_BASE}/planner/batch?target_date=${targetDate}&forecast_multiplier=${forecastMultiplier}&safety_buffer_pct=${safetyBuffer}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to generate batch plan');
  return res.json();
}

// 6. Simulator
export async function runWhatIfScenario(payload: {
  price_change_pct: number;
  demand_multiplier: number;
  discount_rate_pct: number;
  cost_change_pct: number;
}, datasetId: string): Promise<WhatIfScenarioResult> {
  const res = await fetch(`${API_BASE}/simulator/scenario?dataset_id=${datasetId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to simulate scenario');
  return res.json();
}

export async function runQueueSimulation(counters = 3, serviceSec = 45.0) {
  const res = await fetch(`${API_BASE}/simulator/queue?num_counters=${counters}&avg_service_time_seconds=${serviceSec}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to run queue simulation');
  return res.json();
}

// 7. Novelty
export async function fetchMenuEngineering(datasetId: string) {
  const res = await fetch(`${API_BASE}/menu-engineering?dataset_id=${datasetId}`);
  if (!res.ok) throw new Error('Failed to load menu engineering matrix');
  return res.json();
}

export async function fetchCustomerSegments(datasetId: string) {
  const res = await fetch(`${API_BASE}/customers/segments?dataset_id=${datasetId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to load customer segments');
  return res.json();
}

export async function fetchRetentionCohorts(datasetId: string) {
  const res = await fetch(`${API_BASE}/customers/cohorts?dataset_id=${datasetId}`);
  if (!res.ok) throw new Error('Failed to load retention cohorts');
  return res.json();
}

export async function askAssistant(query: string, datasetId: string) {
  const res = await fetch(`${API_BASE}/assistant/ask?dataset_id=${datasetId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Failed to query assistant');
  return res.json();
}

export async function checkDrift(datasetId: string) {
  const res = await fetch(`${API_BASE}/monitor/drift?dataset_id=${datasetId}`);
  if (!res.ok) throw new Error('Failed to check drift');
  return res.json();
}

export async function simulateWasteLab() {
  const res = await fetch(`${API_BASE}/waste-lab/simulate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to simulate waste lab');
  return res.json();
}

// 8. Decisions & Recommendations
export async function fetchRecommendations(datasetId: string): Promise<Recommendation[]> {
  const res = await fetch(`${API_BASE}/recommendations?dataset_id=${datasetId}`);
  if (!res.ok) throw new Error('Failed to load recommendations');
  return res.json();
}

export async function fetchDecisions(): Promise<Decision[]> {
  const res = await fetch(`${API_BASE}/decisions`);
  if (!res.ok) throw new Error('Failed to load decisions');
  return res.json();
}

export async function logDecision(payload: {
  title: string;
  recommendation_id?: string;
  category: string;
  action_taken: string;
  baseline_metric: number;
  notes?: string;
}): Promise<Decision> {
  const res = await fetch(`${API_BASE}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to record decision');
  return res.json();
}

// 9. Reports
export async function generateReport(type: 'excel' | 'pdf' | 'docx' | 'pptx', datasetId: string) {
  const res = await fetch(`${API_BASE}/reports/generate?report_type=${type}&dataset_id=${datasetId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to generate report');
  return res.json();
}

export async function listReports() {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to list reports');
  return res.json();
}
