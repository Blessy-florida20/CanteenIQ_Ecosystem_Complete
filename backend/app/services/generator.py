"""
CanteenIQ Synthetic Canteen Data Generator ("Canteen World Simulator")
Generates realistic, configurable, reproducible institutional canteen transaction data
with calendar effects, weather patterns, customer loyalty, basket co-purchases,
injected edge cases, and ground-truth event tracking.
"""

import os
import json
import hashlib
import random
import datetime
from typing import Dict, List, Any, Tuple, Optional
import numpy as np
import pandas as pd

# Catalog definition with deliberate analytical "stories"
PRODUCT_CATALOG: List[Dict[str, Any]] = [
    # Breakfast
    {
        "product_id": "PRD_BF_01",
        "product_name": "Masala Dosa",
        "category": "Breakfast",
        "unit_price": 60.0,
        "unit_cost": 28.0,
        "base_popularity": 1.2,
        "peak_time_affinity": "breakfast",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 0.9,
        "shelf_life_hours": 3,
        "prep_unit": "Plate",
        "is_veg": True,
        "story": "High morning volume anchor item"
    },
    {
        "product_id": "PRD_BF_02",
        "product_name": "Idli Sambar (2 pcs)",
        "category": "Breakfast",
        "unit_price": 40.0,
        "unit_cost": 16.0,
        "base_popularity": 1.1,
        "peak_time_affinity": "breakfast",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 0.9,
        "shelf_life_hours": 4,
        "prep_unit": "Plate",
        "is_veg": True,
        "story": "Stable low-cost breakfast staple"
    },
    {
        "product_id": "PRD_BF_03",
        "product_name": "Poha",
        "category": "Breakfast",
        "unit_price": 35.0,
        "unit_cost": 14.0,
        "base_popularity": 0.8,
        "peak_time_affinity": "breakfast",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 0.8,
        "shelf_life_hours": 4,
        "prep_unit": "Bowl",
        "is_veg": True,
        "story": "Quick breakfast snack"
    },
    # Snacks
    {
        "product_id": "PRD_SN_01",
        "product_name": "Samosa (2 pcs)",
        "category": "Snacks",
        "unit_price": 30.0,
        "unit_cost": 12.0,
        "base_popularity": 1.5,
        "peak_time_affinity": "evening",
        "weather_sensitivity": "rain",
        "exam_sensitivity": 1.3,
        "shelf_life_hours": 6,
        "prep_unit": "Pair",
        "is_veg": True,
        "story": "Elevated co-purchase with Masala Chai"
    },
    {
        "product_id": "PRD_SN_02",
        "product_name": "Veg Puff",
        "category": "Snacks",
        "unit_price": 25.0,
        "unit_cost": 10.0,
        "base_popularity": 1.0,
        "peak_time_affinity": "evening",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 1.2,
        "shelf_life_hours": 8,
        "prep_unit": "Piece",
        "is_veg": True,
        "story": "Consistent afternoon grab-and-go"
    },
    {
        "product_id": "PRD_SN_03",
        "product_name": "Paneer Kathi Roll",
        "category": "Snacks",
        "unit_price": 80.0,
        "unit_cost": 42.0,
        "base_popularity": 0.9,
        "peak_time_affinity": "evening",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 1.1,
        "shelf_life_hours": 4,
        "prep_unit": "Roll",
        "is_veg": True,
        "story": "High-margin premium snack"
    },
    {
        "product_id": "PRD_SN_04",
        "product_name": "French Fries",
        "category": "Snacks",
        "unit_price": 60.0,
        "unit_cost": 24.0,
        "base_popularity": 0.7,
        "peak_time_affinity": "evening",
        "weather_sensitivity": "rain",
        "exam_sensitivity": 1.2,
        "shelf_life_hours": 2,
        "prep_unit": "Basket",
        "is_veg": True,
        "story": "Popular youth snack"
    },
    # Meals
    {
        "product_id": "PRD_ML_01",
        "product_name": "South Indian Thali",
        "category": "Meals",
        "unit_price": 110.0,
        "unit_cost": 55.0,
        "base_popularity": 1.4,
        "peak_time_affinity": "lunch",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 0.7,
        "shelf_life_hours": 3,
        "prep_unit": "Thali",
        "is_veg": True,
        "story": "Heavy lunch volume cornerstone"
    },
    {
        "product_id": "PRD_ML_02",
        "product_name": "Rajma Chawal",
        "category": "Meals",
        "unit_price": 85.0,
        "unit_cost": 38.0,
        "base_popularity": 1.1,
        "peak_time_affinity": "lunch",
        "weather_sensitivity": "cold",
        "exam_sensitivity": 0.8,
        "shelf_life_hours": 4,
        "prep_unit": "Plate",
        "is_veg": True,
        "story": "Popular comfort meal"
    },
    {
        "product_id": "PRD_ML_03",
        "product_name": "Veg Biryani",
        "category": "Meals",
        "unit_price": 120.0,
        "unit_cost": 58.0,
        "base_popularity": 1.2,
        "peak_time_affinity": "lunch",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 0.9,
        "shelf_life_hours": 4,
        "prep_unit": "Bowl",
        "is_veg": True,
        "story": "High-revenue specialty lunch"
    },
    {
        "product_id": "PRD_ML_04",
        "product_name": "Mini Lunch",
        "category": "Meals",
        "unit_price": 70.0,
        "unit_cost": 32.0,
        "base_popularity": 0.8,
        "peak_time_affinity": "lunch",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 0.8,
        "shelf_life_hours": 3,
        "prep_unit": "Combo",
        "is_veg": True,
        "story": "Budget-friendly student meal"
    },
    # Beverages
    {
        "product_id": "PRD_BV_01",
        "product_name": "Masala Chai",
        "category": "Beverages",
        "unit_price": 15.0,
        "unit_cost": 5.0,
        "base_popularity": 1.8,
        "peak_time_affinity": "all_day",
        "weather_sensitivity": "rain",
        "exam_sensitivity": 1.6,
        "shelf_life_hours": 2,
        "prep_unit": "Cup",
        "is_veg": True,
        "story": "All-day high-frequency driver, strong exam surge"
    },
    {
        "product_id": "PRD_BV_02",
        "product_name": "Filter Coffee",
        "category": "Beverages",
        "unit_price": 25.0,
        "unit_cost": 9.0,
        "base_popularity": 1.3,
        "peak_time_affinity": "all_day",
        "weather_sensitivity": "cold",
        "exam_sensitivity": 1.5,
        "shelf_life_hours": 2,
        "prep_unit": "Cup",
        "is_veg": True,
        "story": "High exam affinity and evening study beverage"
    },
    {
        "product_id": "PRD_BV_03",
        "product_name": "Cold Coffee",
        "category": "Beverages",
        "unit_price": 60.0,
        "unit_cost": 25.0,
        "base_popularity": 0.9,
        "peak_time_affinity": "all_day",
        "weather_sensitivity": "hot",
        "exam_sensitivity": 1.3,
        "shelf_life_hours": 6,
        "prep_unit": "Glass",
        "is_veg": True,
        "story": "Price-sensitive item; surges in hot months"
    },
    {
        "product_id": "PRD_BV_04",
        "product_name": "Fresh Lime Soda",
        "category": "Beverages",
        "unit_price": 35.0,
        "unit_cost": 12.0,
        "base_popularity": 0.8,
        "peak_time_affinity": "lunch",
        "weather_sensitivity": "hot",
        "exam_sensitivity": 1.0,
        "shelf_life_hours": 1,
        "prep_unit": "Glass",
        "is_veg": True,
        "story": "Weather-sensitive afternoon cooler"
    },
    # Desserts
    {
        "product_id": "PRD_DS_01",
        "product_name": "Gulab Jamun (2 pcs)",
        "category": "Desserts",
        "unit_price": 40.0,
        "unit_cost": 18.0,
        "base_popularity": 0.8,
        "peak_time_affinity": "lunch",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 0.7,
        "shelf_life_hours": 24,
        "prep_unit": "Bowl",
        "is_veg": True,
        "story": "Traditional meal add-on"
    },
    {
        "product_id": "PRD_DS_02",
        "product_name": "Chocolate Brownie",
        "category": "Desserts",
        "unit_price": 65.0,
        "unit_cost": 30.0,
        "base_popularity": 0.7,
        "peak_time_affinity": "evening",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 1.2,
        "shelf_life_hours": 48,
        "prep_unit": "Piece",
        "is_veg": True,
        "story": "Exam stress-reliever treat"
    },
    {
        "product_id": "PRD_DS_03",
        "product_name": "Fruit Custard",
        "category": "Desserts",
        "unit_price": 45.0,
        "unit_cost": 22.0,
        "base_popularity": 0.6,
        "peak_time_affinity": "lunch",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 0.5,
        "shelf_life_hours": 6,
        "prep_unit": "Cup",
        "is_veg": True,
        "story": "Declining item: demand fades over the year"
    },
    # Healthy Options
    {
        "product_id": "PRD_HL_01",
        "product_name": "Sprouted Salad",
        "category": "Healthy",
        "unit_price": 50.0,
        "unit_cost": 20.0,
        "base_popularity": 0.6,
        "peak_time_affinity": "breakfast",
        "weather_sensitivity": "neutral",
        "exam_sensitivity": 1.0,
        "shelf_life_hours": 4,
        "prep_unit": "Bowl",
        "is_veg": True,
        "story": "Rising star: growing wellness trend over the year"
    },
    {
        "product_id": "PRD_HL_02",
        "product_name": "Fresh Fruit Bowl",
        "category": "Healthy",
        "unit_price": 60.0,
        "unit_cost": 28.0,
        "base_popularity": 0.7,
        "peak_time_affinity": "breakfast",
        "weather_sensitivity": "hot",
        "exam_sensitivity": 0.9,
        "shelf_life_hours": 3,
        "prep_unit": "Bowl",
        "is_veg": True,
        "story": "Premium morning healthy choice"
    },
    {
        "product_id": "PRD_HL_03",
        "product_name": "Green Tea",
        "category": "Healthy",
        "unit_price": 20.0,
        "unit_cost": 6.0,
        "base_popularity": 0.5,
        "peak_time_affinity": "all_day",
        "weather_sensitivity": "cold",
        "exam_sensitivity": 1.4,
        "shelf_life_hours": 1,
        "prep_unit": "Cup",
        "is_veg": True,
        "story": "Health-conscious beverage alternative"
    }
]


class CanteenDataGenerator:
    """Configurable synthetic institutional canteen transaction generator."""

    def __init__(
        self,
        start_date: str = "2025-01-01",
        end_date: str = "2025-12-31",
        target_orders: int = 16000,
        random_seed: int = 42,
        currency: str = "INR",
        inject_anomalies: bool = True,
        inject_quality_issues: bool = False,
        academic_calendar: bool = True,
        weather_effects: bool = True
    ):
        self.start_date = datetime.date.fromisoformat(start_date)
        self.end_date = datetime.date.fromisoformat(end_date)
        self.target_orders = target_orders
        self.seed = random_seed
        self.currency = currency
        self.inject_anomalies = inject_anomalies
        self.inject_quality_issues = inject_quality_issues
        self.academic_calendar = academic_calendar
        self.weather_effects = weather_effects

        self.rng = np.random.default_rng(self.seed)
        random.seed(self.seed)

        self.products = PRODUCT_CATALOG
        self.product_lookup = {p["product_id"]: p for p in self.products}

        # Simulated customer pool (approx 450 pseudonymous regular students/staff)
        self.customer_ids = [f"CUST_{i:04d}" for i in range(1, 451)]
        # Customer loyalty weights: power-law distribution
        self.customer_weights = 1.0 / (np.arange(1, len(self.customer_ids) + 1) ** 0.6)
        self.customer_weights /= self.customer_weights.sum()

    def _get_calendar_metadata(self, date: datetime.date) -> Dict[str, Any]:
        """Classifies date according to college academic calendar."""
        day_of_week = date.weekday() # 0 = Mon, 6 = Sun
        month = date.month
        day = date.day

        # Institutional calendar rules:
        # Holidays / Vacation:
        # Winter break: Jan 1 - Jan 7
        # Summer break: May 15 - June 30 (very low canteen volume)
        # Diwali / Autumn break: Oct 20 - Oct 27
        # Mid-Term Exams: March 10 - March 22, and October 6 - October 18
        # Final Exams: April 25 - May 10, and November 24 - December 10
        # College Fest: February 20 - February 22 (demand surge!)

        is_sunday = (day_of_week == 6)
        is_saturday = (day_of_week == 5)

        is_winter_break = (month == 1 and day <= 7)
        is_summer_break = (month == 5 and day >= 15) or (month == 6)
        is_autumn_break = (month == 10 and 20 <= day <= 27)

        is_fest = (month == 2 and 20 <= day <= 22)

        is_midterm = (month == 3 and 10 <= day <= 22) or (month == 10 and 6 <= day <= 18)
        is_finals = (month == 4 and day >= 25) or (month == 5 and day <= 10) or (month == 11 and day >= 24) or (month == 12 and day <= 10)

        is_exam = is_midterm or is_finals
        is_vacation = is_winter_break or is_summer_break or is_autumn_break

        # Base day traffic multiplier
        if is_sunday:
            day_multiplier = 0.05 if not is_vacation else 0.0
        elif is_saturday:
            day_multiplier = 0.40
        else:
            day_multiplier = 1.0

        if is_vacation:
            day_multiplier *= 0.15
        elif is_fest:
            day_multiplier *= 2.2
        elif is_exam:
            day_multiplier *= 1.25

        return {
            "is_weekend": day_of_week >= 5,
            "is_sunday": is_sunday,
            "is_vacation": is_vacation,
            "is_exam": is_exam,
            "is_fest": is_fest,
            "day_multiplier": day_multiplier
        }

    def _get_weather(self, date: datetime.date) -> Dict[str, Any]:
        """Simulates seasonal weather in an Indian institutional climate."""
        month = date.month
        # Jan-Feb: Cool/Mild (temp 15-24 C)
        # Mar-May: Hot (temp 32-42 C)
        # Jun-Sep: Monsoon Rain
        # Oct-Dec: Post-monsoon / Cool
        if month in [3, 4, 5]:
            condition = self.rng.choice(["hot", "sunny"], p=[0.7, 0.3])
            temp_c = int(self.rng.uniform(32, 42))
        elif month in [6, 7, 8, 9]:
            condition = self.rng.choice(["rain", "cloudy", "hot"], p=[0.55, 0.30, 0.15])
            temp_c = int(self.rng.uniform(26, 33))
        elif month in [12, 1]:
            condition = self.rng.choice(["cold", "mild"], p=[0.6, 0.4])
            temp_c = int(self.rng.uniform(12, 22))
        else:
            condition = self.rng.choice(["pleasant", "warm"], p=[0.7, 0.3])
            temp_c = int(self.rng.uniform(22, 29))

        return {"condition": condition, "temp_c": temp_c}

    def generate(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
        """
        Executes generation producing:
        1. transactions_df
        2. products_df
        3. ground_truth_events_df
        4. generation_manifest
        """
        all_dates = []
        curr = self.start_date
        while curr <= self.end_date:
            all_dates.append(curr)
            curr += datetime.timedelta(days=1)

        total_days = len(all_dates)
        base_orders_per_day = self.target_orders / max(1, total_days * 0.75) # normal weekdays handle most

        ground_truth_events = []
        orders_list = []
        transaction_rows = []

        order_counter = 1
        transaction_counter = 1

        # Specific deliberate calendar anomalies for ground-truth tracking
        deliberate_spikes = {
            datetime.date(2025, 2, 21): "Annual Cultural Fest Day 2",
            datetime.date(2025, 9, 15): "Engineers Day Celebration Food Fair",
        }
        deliberate_drops = {
            datetime.date(2025, 7, 24): "Campus Heavy Flood & Power Outage",
            datetime.date(2025, 11, 4): "Unscheduled Institution Closure",
        }

        # Progress tracking
        for date_idx, date in enumerate(all_dates):
            cal = self._get_calendar_metadata(date) if self.academic_calendar else {"day_multiplier": 1.0, "is_exam": False, "is_fest": False}
            weather = self._get_weather(date) if self.weather_effects else {"condition": "pleasant", "temp_c": 25}

            # Check deliberate ground truth events
            anomaly_factor = 1.0
            anomaly_label = "Normal"
            if self.inject_anomalies:
                if date in deliberate_spikes:
                    anomaly_factor = 2.4
                    anomaly_label = f"Spike: {deliberate_spikes[date]}"
                    ground_truth_events.append({
                        "date": date.isoformat(),
                        "event_type": "Anomaly_Spike",
                        "description": deliberate_spikes[date],
                        "expected_direction": "up",
                        "ground_truth_flag": True
                    })
                elif date in deliberate_drops:
                    anomaly_factor = 0.12
                    anomaly_label = f"Drop: {deliberate_drops[date]}"
                    ground_truth_events.append({
                        "date": date.isoformat(),
                        "event_type": "Anomaly_Drop",
                        "description": deliberate_drops[date],
                        "expected_direction": "down",
                        "ground_truth_flag": True
                    })

            # Calculate day order volume
            day_volume = int(self.rng.normal(base_orders_per_day, base_orders_per_day * 0.12) * cal["day_multiplier"] * anomaly_factor)
            day_volume = max(0, day_volume)

            # Year progress for trends (Sprouted salad rising, Fruit Custard declining)
            year_progress = date_idx / total_days # 0.0 to 1.0

            # Generate each order in the day
            for _ in range(day_volume):
                order_id = f"ORD_{order_counter:07d}"
                order_counter += 1

                # Customer selection: 80% repeat customers from pool, 20% guest / new
                if self.rng.random() < 0.82:
                    cust_id = self.rng.choice(self.customer_ids, p=self.customer_weights)
                else:
                    cust_id = f"GUEST_{self.rng.integers(1000, 9999)}"

                # Time of day distribution
                # Peaks: Breakfast (8:00 - 10:30), Lunch (12:00 - 14:30), Evening (16:30 - 18:30)
                time_slot = self.rng.choice(
                    ["breakfast", "lunch", "evening", "other"],
                    p=[0.28, 0.40, 0.24, 0.08]
                )

                if time_slot == "breakfast":
                    hour = self.rng.choice([8, 9, 10])
                    minute = self.rng.integers(0, 60)
                elif time_slot == "lunch":
                    hour = self.rng.choice([12, 13, 14])
                    minute = self.rng.integers(0, 60)
                elif time_slot == "evening":
                    hour = self.rng.choice([16, 17, 18])
                    minute = self.rng.integers(0, 60)
                else:
                    hour = self.rng.choice([11, 15, 19])
                    minute = self.rng.integers(0, 60)

                order_time = f"{hour:02d}:{minute:02d}:{self.rng.integers(0, 60):02d}"

                # Payment method preference
                payment_method = self.rng.choice(
                    ["UPI", "College Card", "Cash", "Card"],
                    p=[0.62, 0.22, 0.12, 0.04]
                )

                # Basket size: majority 1-2 items, some groups up to 4 items
                basket_size = self.rng.choice([1, 2, 3, 4], p=[0.48, 0.36, 0.12, 0.04])

                # Determine product probabilities for this time slot, weather, and calendar
                prod_weights = []
                for p in self.products:
                    w = p["base_popularity"]

                    # Peak time affinity
                    if p["peak_time_affinity"] == time_slot:
                        w *= 2.5
                    elif p["peak_time_affinity"] != "all_day" and time_slot in ["breakfast", "lunch", "evening"]:
                        w *= 0.25

                    # Weather affinity
                    if weather["condition"] == "rain" and p["weather_sensitivity"] == "rain":
                        w *= 2.2
                    elif weather["condition"] == "hot" and p["weather_sensitivity"] == "hot":
                        w *= 2.3
                    elif weather["condition"] == "cold" and p["weather_sensitivity"] == "cold":
                        w *= 2.0

                    # Exam affinity
                    if cal.get("is_exam", False):
                        w *= p["exam_sensitivity"]

                    # Specific product trends ("stories")
                    if p["product_id"] == "PRD_HL_01": # Sprouted Salad rising
                        w *= (0.4 + 1.2 * year_progress)
                    elif p["product_id"] == "PRD_DS_03": # Fruit Custard declining
                        w *= (1.4 - 0.9 * year_progress)

                    prod_weights.append(max(0.01, w))

                prod_weights = np.array(prod_weights)
                prod_weights /= prod_weights.sum()

                # Choose primary item
                primary_idx = self.rng.choice(len(self.products), p=prod_weights)
                chosen_products = [self.products[primary_idx]]

                # Deliberate combo pair story: If Samosa is chosen, high chance of Masala Chai
                if chosen_products[0]["product_id"] == "PRD_SN_01" and basket_size > 1:
                    # Co-purchase Samosa + Masala Chai with 75% affinity
                    if self.rng.random() < 0.75:
                        chai = self.product_lookup["PRD_BV_01"]
                        if chai not in chosen_products:
                            chosen_products.append(chai)

                # Fill remaining items in basket
                while len(chosen_products) < basket_size:
                    candidate = self.products[self.rng.choice(len(self.products), p=prod_weights)]
                    if candidate not in chosen_products:
                        chosen_products.append(candidate)
                    else:
                        break

                # Create line items for each chosen product in the basket
                for prod in chosen_products:
                    qty = int(self.rng.choice([1, 2, 3], p=[0.82, 0.15, 0.03]))
                    price = prod["unit_price"]
                    cost = prod["unit_cost"]

                    # Occasional discount: 8% of transactions have promotional ₹5 or ₹10 off
                    discount = 0.0
                    if self.rng.random() < 0.08:
                        discount = float(self.rng.choice([5.0, 10.0]))
                        # Ensure discount does not exceed total line revenue
                        discount = min(discount, price * qty * 0.3)

                    transaction_rows.append({
                        "transaction_id": f"TXN_{transaction_counter:08d}",
                        "order_id": order_id,
                        "customer_id": cust_id,
                        "transaction_date": date.isoformat(),
                        "transaction_time": order_time,
                        "product_id": prod["product_id"],
                        "product_name": prod["product_name"],
                        "category": prod["category"],
                        "quantity": qty,
                        "unit_price": round(price, 2),
                        "discount": round(discount, 2),
                        "unit_cost": round(cost, 2),
                        "payment_method": payment_method
                    })
                    transaction_counter += 1

        df_transactions = pd.DataFrame(transaction_rows)
        df_products = pd.DataFrame(self.products)
        df_ground_truth = pd.DataFrame(ground_truth_events)

        # Injected edge cases if requested (for dirty demo dataset)
        if self.inject_quality_issues:
            df_transactions = self._inject_quality_anomalies(df_transactions)

        manifest = self._build_manifest(df_transactions, df_products, df_ground_truth)

        return df_transactions, df_products, df_ground_truth, manifest

    def _inject_quality_anomalies(self, df: pd.DataFrame) -> pd.DataFrame:
        """Injects controlled data quality defects for the Data Studio cleaning lab."""
        df = df.copy()
        n = len(df)

        # 1. Missing values: 1.5% missing customer_id, 0.5% missing category
        missing_cust_indices = self.rng.choice(n, size=int(n * 0.015), replace=False)
        df.loc[missing_cust_indices, "customer_id"] = np.nan

        missing_cat_indices = self.rng.choice(n, size=int(n * 0.005), replace=False)
        df.loc[missing_cat_indices, "category"] = np.nan

        # 2. Invalid values: negative quantity (0.2%) and zero unit_price (0.2%)
        neg_qty_indices = self.rng.choice(n, size=int(n * 0.002), replace=False)
        df.loc[neg_qty_indices, "quantity"] = -1

        zero_price_indices = self.rng.choice(n, size=int(n * 0.002), replace=False)
        df.loc[zero_price_indices, "unit_price"] = 0.0

        # 3. Duplicate rows (0.8% of rows duplicated)
        dup_indices = self.rng.choice(n, size=int(n * 0.008), replace=False)
        duplicates = df.iloc[dup_indices].copy()
        df = pd.concat([df, duplicates], ignore_index=True)

        return df

    def generate_inventory_scenarios(self, df_transactions: pd.DataFrame) -> pd.DataFrame:
        """
        Generates simulated inventory, preparation, and waste scenario dataset.
        Clearly labeled as simulated planning data.
        """
        # Aggregate daily sales per product
        daily_sales = df_transactions.groupby(["transaction_date", "product_id", "product_name"]).agg(
            units_sold=("quantity", "sum")
        ).reset_index()

        scenarios = []
        for _, row in daily_sales.iterrows():
            sold = row["units_sold"]
            prod = self.product_lookup[row["product_id"]]

            # Simulated planning: canteen planned base + random variance
            # Sometimes over-prepared, sometimes under-prepared (stock-out)
            prep_error = self.rng.normal(0.08, 0.15) # slightly overprepares on average
            units_prepared = max(int(round(sold * (1.0 + prep_error))), 1)

            actual_sold = min(sold, units_prepared)
            units_leftover = max(0, units_prepared - actual_sold)
            stockout_unmet_demand = max(0, sold - units_prepared)

            cost_per_unit = prod["unit_cost"]
            price_per_unit = prod["unit_price"]

            scenarios.append({
                "date": row["transaction_date"],
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "category": prod["category"],
                "units_prepared": units_prepared,
                "units_sold": actual_sold,
                "units_leftover": units_leftover,
                "unmet_demand_stockout": stockout_unmet_demand,
                "estimated_waste_cost": round(units_leftover * cost_per_unit, 2),
                "potential_lost_revenue": round(stockout_unmet_demand * price_per_unit, 2),
                "shelf_life_hours": prod["shelf_life_hours"],
                "simulation_label": "Simulated Planning Data (Not Measured Real Waste)"
            })

        return pd.DataFrame(scenarios)

    def _build_manifest(
        self,
        df_tx: pd.DataFrame,
        df_prod: pd.DataFrame,
        df_gt: pd.DataFrame
    ) -> Dict[str, Any]:
        """Constructs a cryptographic hash and metadata manifest for auditability."""
        config_dict = {
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "target_orders": self.target_orders,
            "seed": self.seed,
            "currency": self.currency,
            "academic_calendar": self.academic_calendar,
            "weather_effects": self.weather_effects,
            "inject_anomalies": self.inject_anomalies,
            "inject_quality_issues": self.inject_quality_issues
        }
        config_json = json.dumps(config_dict, sort_keys=True)
        config_hash = hashlib.sha256(config_json.encode("utf-8")).hexdigest()

        return {
            "dataset_name": "CanteenIQ Institutional Benchmark Dataset",
            "generated_timestamp": datetime.datetime.now().isoformat(),
            "seed": self.seed,
            "config_hash": config_hash,
            "config": config_dict,
            "row_counts": {
                "transactions": len(df_tx),
                "unique_orders": int(df_tx["order_id"].nunique()),
                "unique_products": len(df_prod),
                "unique_customers": int(df_tx["customer_id"].dropna().nunique()),
                "ground_truth_events": len(df_gt)
            },
            "date_range": {
                "start": self.start_date.isoformat(),
                "end": self.end_date.isoformat()
            },
            "synthetic_disclaimer": "Simulated data. Not actual canteen performance."
        }


def generate_all_datasets(output_dir: str, seed: int = 42):
    """Utility function to generate both clean and dirty demo datasets with manifests."""
    os.makedirs(output_dir, exist_ok=True)

    # 1. Clean Benchmark Dataset
    gen_clean = CanteenDataGenerator(
        start_date="2025-01-01",
        end_date="2025-12-31",
        target_orders=16000,
        random_seed=seed,
        inject_anomalies=True,
        inject_quality_issues=False
    )
    df_tx_clean, df_prod, df_gt, manifest_clean = gen_clean.generate()
    df_inv_clean = gen_clean.generate_inventory_scenarios(df_tx_clean)

    df_tx_clean.to_csv(os.path.join(output_dir, "synthetic_transactions.csv"), index=False)
    df_prod.to_csv(os.path.join(output_dir, "synthetic_products.csv"), index=False)
    df_gt.to_csv(os.path.join(output_dir, "synthetic_ground_truth_events.csv"), index=False)
    df_inv_clean.to_csv(os.path.join(output_dir, "synthetic_inventory_scenarios.csv"), index=False)

    with open(os.path.join(output_dir, "dataset_manifest.json"), "w") as f:
        json.dump(manifest_clean, f, indent=2)

    with open(os.path.join(output_dir, "generation_config.json"), "w") as f:
        json.dump(manifest_clean["config"], f, indent=2)

    # 2. Quality Challenge (Dirty) Dataset for Data Studio testing
    gen_dirty = CanteenDataGenerator(
        start_date="2025-01-01",
        end_date="2025-12-31",
        target_orders=16000,
        random_seed=seed,
        inject_anomalies=True,
        inject_quality_issues=True
    )
    df_tx_dirty, _, _, manifest_dirty = gen_dirty.generate()
    df_tx_dirty.to_csv(os.path.join(output_dir, "synthetic_transactions_dirty.csv"), index=False)
    with open(os.path.join(output_dir, "dataset_manifest_dirty.json"), "w") as f:
        json.dump(manifest_dirty, f, indent=2)

    # 3. Data Dictionary
    data_dict = [
        {"column_name": "transaction_id", "data_type": "string", "description": "Unique transaction line identifier (e.g. TXN_00000001)"},
        {"column_name": "order_id", "data_type": "string", "description": "Basket/receipt identifier grouping items purchased together"},
        {"column_name": "customer_id", "data_type": "string", "description": "Pseudonymous customer code (e.g. CUST_0042) or GUEST_XXXX"},
        {"column_name": "transaction_date", "data_type": "date", "description": "Date of transaction (YYYY-MM-DD)"},
        {"column_name": "transaction_time", "data_type": "time", "description": "Timestamp of sale (HH:MM:SS)"},
        {"column_name": "product_id", "data_type": "string", "description": "Product catalog ID (e.g. PRD_SN_01)"},
        {"column_name": "product_name", "data_type": "string", "description": "Plain name of item (e.g. Samosa (2 pcs))"},
        {"column_name": "category", "data_type": "string", "description": "Product category: Breakfast, Snacks, Meals, Beverages, Desserts, Healthy"},
        {"column_name": "quantity", "data_type": "integer", "description": "Quantity purchased in transaction"},
        {"column_name": "unit_price", "data_type": "float", "description": "Gross menu unit price in INR (₹)"},
        {"column_name": "discount", "data_type": "float", "description": "Promotional discount applied in INR (₹)"},
        {"column_name": "unit_cost", "data_type": "float", "description": "Estimated cost of goods sold per unit in INR (₹)"},
        {"column_name": "payment_method", "data_type": "string", "description": "Payment tender: UPI, College Card, Cash, Card"}
    ]
    pd.DataFrame(data_dict).to_csv(os.path.join(output_dir, "data_dictionary.csv"), index=False)

    print(f"Dataset generation complete in {output_dir}:")
    print(f"- Clean transactions: {len(df_tx_clean)} rows across {df_tx_clean['order_id'].nunique()} orders")
    print(f"- Dirty transactions: {len(df_tx_dirty)} rows")
    print(f"- Products catalog: {len(df_prod)} items")
    print(f"- Ground truth events: {len(df_gt)} events logged")
    print(f"- Inventory scenario rows: {len(df_inv_clean)} items")


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "synthetic")
    generate_all_datasets(out)
