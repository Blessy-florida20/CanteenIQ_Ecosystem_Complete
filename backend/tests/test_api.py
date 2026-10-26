"""
Comprehensive API integration tests for CanteenIQ FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_datasets_endpoints():
    response = client.get("/api/datasets")
    assert response.status_code == 200
    datasets = response.json()
    assert len(datasets) > 0
    assert any(d["id"] == "synthetic_transactions.csv" for d in datasets)

    # Test preview
    preview_resp = client.get("/api/datasets/synthetic_transactions.csv/preview?page=1&page_size=10")
    assert preview_resp.status_code == 200
    p_data = preview_resp.json()
    assert len(p_data["rows"]) == 10
    assert len(p_data["schema"]) > 0


def test_analytics_summary():
    response = client.get("/api/analytics/summary?dataset_id=synthetic_transactions.csv")
    assert response.status_code == 200
    data = response.json()
    assert data["net_sales"] > 0
    assert data["units_sold"] > 0
    assert "health_score" in data
    assert 0 <= data["health_score"]["overall_score"] <= 100


def test_analytics_trends():
    response = client.get("/api/analytics/trends?freq=D&dataset_id=synthetic_transactions.csv")
    assert response.status_code == 200
    data = response.json()
    assert len(data["records"]) > 0
    assert "takeaway" in data


def test_analytics_categories():
    response = client.get("/api/analytics/categories?dataset_id=synthetic_transactions.csv")
    assert response.status_code == 200
    data = response.json()
    assert len(data["categories"]) > 0


def test_analytics_statistics():
    response = client.post("/api/analytics/statistics?dataset_id=synthetic_transactions.csv")
    assert response.status_code == 200
    data = response.json()
    assert "descriptive" in data
    assert "weekday_vs_weekend_test" in data
    assert "category_payment_test" in data


def test_models_forecast():
    payload = {
        "dataset_id": "synthetic_transactions.csv",
        "target": "net_sales",
        "horizon": 7,
        "backtest_folds": 2
    }
    response = client.post("/api/models/forecast", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "leaderboard" in data
    assert len(data["leaderboard"]) > 0
    assert "winner_model" in data
    assert len(data["predictions"]) == 7


def test_models_associations():
    payload = {
        "dataset_id": "synthetic_transactions.csv",
        "min_support": 0.01,
        "min_confidence": 0.15,
        "min_lift": 1.05
    }
    response = client.post("/api/models/associations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "rules" in data
    assert "network_nodes" in data


def test_models_anomalies():
    response = client.post("/api/models/anomalies?dataset_id=synthetic_transactions.csv")
    assert response.status_code == 200
    data = response.json()
    assert "anomalies" in data
    assert "takeaway" in data


def test_planner_prepare():
    payload = {
        "product_id": "PRD_SN_01",
        "target_date": "2025-06-01",
        "forecast_demand": 120.0,
        "usable_stock": 10.0,
        "safety_buffer_pct": 0.15
    }
    response = client.post("/api/planner/prepare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_quantity"] > 0
    assert 0.0 <= data["critical_ratio"] <= 1.0


def test_simulator_scenario():
    payload = {
        "price_change_pct": 5.0,
        "demand_multiplier": 1.0,
        "discount_rate_pct": 0.0,
        "cost_change_pct": 0.0
    }
    response = client.post("/api/simulator/scenario?dataset_id=synthetic_transactions.csv", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "scenario" in data
    assert "delta" in data
    assert "tornado_sensitivity" in data


def test_assistant_ask():
    payload = {"query": "What are the top 5 products by revenue?"}
    response = client.post("/api/assistant/ask?dataset_id=synthetic_transactions.csv", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "top_products"
    assert len(data["text_answer"]) > 0


def test_reports_generation():
    response = client.post("/api/reports/generate?report_type=excel&dataset_id=synthetic_transactions.csv")
    assert response.status_code == 200
    data = response.json()
    assert "filename" in data
    assert data["filename"].endswith(".xlsx")
