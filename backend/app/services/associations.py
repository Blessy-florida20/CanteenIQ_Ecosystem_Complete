"""
CanteenIQ Product Association Mining Engine
Extracts order baskets and computes Apriori / FP-Growth association rules
(Support, Confidence, Lift, Leverage, Conviction) with network graph topology.
"""

from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules


class AssociationMiner:
    """Mines frequent itemsets and association rules from multi-item baskets."""

    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()

    def mine_rules(
        self,
        min_support: float = 0.015,
        min_confidence: float = 0.20,
        min_lift: float = 1.1,
        time_of_day: str = "all"
    ) -> Dict[str, Any]:
        """
        Extracts baskets, transforms into one-hot matrix, runs Apriori,
        and constructs association rules and network graph nodes/links.
        """
        df_filtered = self.df.copy()

        # Optional time of day filtering
        if time_of_day != "all" and "transaction_time" in df_filtered.columns:
            df_filtered["hour"] = pd.to_datetime(df_filtered["transaction_time"], format="%H:%M:%S", errors="coerce").dt.hour
            if time_of_day == "breakfast":
                df_filtered = df_filtered[df_filtered["hour"].between(8, 11)]
            elif time_of_day == "lunch":
                df_filtered = df_filtered[df_filtered["hour"].between(12, 15)]
            elif time_of_day == "evening":
                df_filtered = df_filtered[df_filtered["hour"].between(16, 19)]

        if len(df_filtered) == 0:
            return {"rules": [], "network_nodes": [], "network_links": [], "takeaway": "No transactions in selected filter"}

        # Group by order_id into itemsets
        baskets = df_filtered.groupby("order_id")["product_name"].apply(lambda s: list(set(s))).tolist()
        # Keep only baskets with >= 2 items for meaningful co-purchase mining
        multi_item_baskets = [b for b in baskets if len(b) >= 2]

        if len(multi_item_baskets) < 10:
            return {
                "rules": [],
                "network_nodes": [],
                "network_links": [],
                "takeaway": "Insufficient multi-item baskets to establish statistically reliable association rules."
            }

        # One-hot encode transactions
        te = TransactionEncoder()
        te_ary = te.fit(multi_item_baskets).transform(multi_item_baskets)
        basket_df = pd.DataFrame(te_ary, columns=te.columns_)

        # Mine frequent itemsets
        try:
            frequent_itemsets = apriori(basket_df, min_support=min_support, use_colnames=True)
            if frequent_itemsets.empty:
                return {"rules": [], "network_nodes": [], "network_links": [], "takeaway": "No itemsets satisfied minimum support threshold."}

            rules_df = association_rules(frequent_itemsets, metric="lift", min_threshold=min_lift)
            rules_df = rules_df[rules_df["confidence"] >= min_confidence]
        except Exception as e:
            return {"rules": [], "network_nodes": [], "network_links": [], "takeaway": f"Mining exception: {str(e)}"}

        if rules_df.empty:
            return {"rules": [], "network_nodes": [], "network_links": [], "takeaway": "No association rules met confidence and lift thresholds."}

        rules_list = []
        network_nodes = {}
        network_links = []

        rules_df = rules_df.sort_values("lift", ascending=False)

        for _, r in rules_df.iterrows():
            ant = list(r["antecedents"])
            con = list(r["consequents"])
            ant_str = ", ".join(ant)
            con_str = ", ".join(con)

            supp = round(float(r["support"]), 4)
            conf = round(float(r["confidence"]), 4)
            lift_val = round(float(r["lift"]), 2)
            leverage = round(float(r.get("leverage", 0.0)), 4)
            conviction = round(float(r.get("conviction", 1.0)), 2) if not np.isinf(r.get("conviction", 1.0)) else 99.0

            plain_msg = (
                f"When a customer orders '{ant_str}', they are {lift_val}x more likely to also purchase '{con_str}' "
                f"({conf * 100:.1f}% confidence, observed in {supp * 100:.1f}% of multi-item baskets)."
            )

            rules_list.append({
                "antecedents": ant,
                "consequents": con,
                "support": supp,
                "confidence": conf,
                "lift": lift_val,
                "leverage": leverage,
                "conviction": conviction,
                "time_slot": time_of_day,
                "plain_language": plain_msg
            })

            # Populate network topology
            for item in ant + con:
                if item not in network_nodes:
                    network_nodes[item] = {"id": item, "name": item, "degree": 0}
                network_nodes[item]["degree"] += 1

            network_links.append({
                "source": ant[0],
                "target": con[0],
                "lift": lift_val,
                "confidence": conf,
                "support": supp
            })

        top_rule = rules_list[0]
        caption = f"Strongest cross-sell rule: '{', '.join(top_rule['antecedents'])}' -> '{', '.join(top_rule['consequents'])}' with lift {top_rule['lift']}x."

        return {
            "rules": rules_list[:30],
            "network_nodes": list(network_nodes.values()),
            "network_links": network_links[:40],
            "takeaway": caption
        }
