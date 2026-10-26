"""
CanteenIQ Smart Preparation Planner (Newsvendor-Enhanced)
Optimizes institutional food preparation using critical ratio economics
and Monte Carlo risk simulation to balance waste and stock-outs.
"""

from typing import Dict, List, Any, Optional
import math
import numpy as np
import pandas as pd
from scipy.stats import norm


class PreparationPlanner:
    """Computes daily food prep recommendations and batch prep sheets."""

    def __init__(self, products_df: pd.DataFrame):
        self.products = products_df.set_index("product_id").to_dict(orient="index")

    def plan_single_product(
        self,
        product_id: str,
        forecast_demand: float,
        usable_stock: float = 0.0,
        safety_buffer_pct: float = 0.15,
        min_batch_size: int = 5,
        max_capacity: int = 500
    ) -> Dict[str, Any]:
        """
        Calculates preparation recommendation using both:
        1. Heuristic Buffer Model
        2. Classical Newsvendor Model
        plus Monte Carlo risk profile.
        """
        prod = self.products.get(product_id, {
            "product_name": product_id,
            "unit_price": 50.0,
            "unit_cost": 25.0,
            "shelf_life_hours": 4
        })

        price = float(prod.get("unit_price", 50.0))
        cost = float(prod.get("unit_cost", 25.0))
        p_name = prod.get("product_name", product_id)

        # 1. Base Heuristic Plan
        net_needed = max(0.0, (forecast_demand * (1.0 + safety_buffer_pct)) - usable_stock)
        # Round up to batch size
        batches = math.ceil(net_needed / min_batch_size) if min_batch_size > 0 else net_needed
        base_prep = int(min(max_capacity, batches * min_batch_size))

        # 2. Advanced Newsvendor Model
        # Underage cost: lost profit per unmet unit
        c_u = max(1.0, price - cost)
        # Overage cost: loss from preparing an unsold unit
        c_o = max(1.0, cost)

        # Critical Ratio CR = c_u / (c_u + c_o)
        critical_ratio = c_u / (c_u + c_o)

        # Demand distribution assumption: normal with std = 20% of forecast
        sigma = max(2.0, forecast_demand * 0.20)
        z_crit = norm.ppf(critical_ratio)
        newsvendor_optimal = forecast_demand + (z_crit * sigma) - usable_stock
        nv_batches = math.ceil(max(0.0, newsvendor_optimal) / min_batch_size)
        optimal_nv_prep = int(min(max_capacity, nv_batches * min_batch_size))

        # Recommended quantity blends buffer safety with economic critical ratio
        recommended = optimal_nv_prep

        # 3. Monte Carlo Risk Simulation (2,000 iterations)
        rng = np.random.default_rng(42)
        sim_demand = np.maximum(0.0, rng.normal(forecast_demand, sigma, size=2000))

        shortage_occurrences = sim_demand > (recommended + usable_stock)
        surplus_occurrences = sim_demand < (recommended + usable_stock)

        shortage_risk_pct = float(np.mean(shortage_occurrences) * 100.0)
        surplus_risk_pct = float(np.mean(surplus_occurrences) * 100.0)

        expected_leftovers = float(np.mean(np.maximum(0.0, (recommended + usable_stock) - sim_demand)))
        expected_shortages = float(np.mean(np.maximum(0.0, sim_demand - (recommended + usable_stock))))

        explanation = (
            f"For '{p_name}', forecast demand is {forecast_demand:.0f} units. With profit margin ₹{c_u:.0f} and overage cost ₹{c_o:.0f}, "
            f"the critical ratio is {critical_ratio:.2f}. Recommended prep is {recommended} units (batch-rounded), giving "
            f"{shortage_risk_pct:.1f}% stock-out risk and ~{expected_leftovers:.1f} expected leftover units."
        )

        return {
            "product_id": product_id,
            "product_name": p_name,
            "forecast_demand": round(forecast_demand, 1),
            "base_planned_quantity": base_prep,
            "optimal_newsvendor_quantity": optimal_nv_prep,
            "recommended_quantity": recommended,
            "critical_ratio": round(critical_ratio, 3),
            "shortage_risk_pct": round(shortage_risk_pct, 1),
            "surplus_risk_pct": round(surplus_risk_pct, 1),
            "expected_leftover_units": round(expected_leftovers, 1),
            "expected_shortage_units": round(expected_shortages, 1),
            "underage_cost_margin": round(c_u, 2),
            "overage_cost": round(c_o, 2),
            "shelf_life_hours": prod.get("shelf_life_hours", 4),
            "plain_explanation": explanation
        }

    def generate_menu_batch_sheet(
        self,
        target_date: str,
        forecast_multiplier: float = 1.0,
        safety_buffer_pct: float = 0.15
    ) -> List[Dict[str, Any]]:
        """Generates comprehensive batch preparation sheet for entire canteen menu."""
        sheet = []
        for p_id, prod in self.products.items():
            # Baseline typical daily volume estimate
            base_vol = prod.get("base_popularity", 1.0) * 80.0 * forecast_multiplier
            plan = self.plan_single_product(
                product_id=p_id,
                forecast_demand=base_vol,
                safety_buffer_pct=safety_buffer_pct
            )
            sheet.append({
                **plan,
                "target_date": target_date,
                "category": prod.get("category", "General"),
                "prep_unit": prod.get("prep_unit", "Portion")
            })

        sheet.sort(key=lambda x: x["recommended_quantity"], reverse=True)
        return sheet
