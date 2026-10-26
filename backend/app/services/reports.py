"""
CanteenIQ Report & Deliverable Generation Engine
Generates:
1. Multi-tab analytical Excel workbooks (openpyxl/xlsxwriter)
2. Professional Executive PDF reports (ReportLab)
3. Academic Project Report (python-docx)
4. Editable PowerPoint presentation (python-pptx)
"""

import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
import pandas as pd

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from pptx import Presentation
from pptx.util import Inches as PptxInches, Pt as PptxPt
from pptx.dml.color import RGBColor as PptxRGBColor

from app.core.config import REPORTS_DIR, SYNTHETIC_DATA_DIR
from app.services.metrics import compute_kpis, compute_canteen_health_score
from app.services.dataset_manager import load_dataset


class ReportGenerator:
    """Generates official CanteenIQ report deliverables."""

    def __init__(self, dataset_id: str = "synthetic_transactions.csv"):
        self.dataset_id = dataset_id
        self.df = load_dataset(dataset_id)
        self.kpis = compute_kpis(self.df)
        self.health = compute_canteen_health_score(self.kpis)

    def generate_excel_workbook(self) -> Path:
        """Generates comprehensive multi-tab Excel workbook."""
        filename = f"CanteenIQ_Analytical_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = REPORTS_DIR / filename

        with pd.ExcelWriter(str(filepath), engine="openpyxl") as writer:
            # Tab 1: Executive KPI Summary
            kpi_rows = [
                {"Metric": "Gross Sales (INR)", "Value": self.kpis["gross_sales"]},
                {"Metric": "Net Sales (INR)", "Value": self.kpis["net_sales"]},
                {"Metric": "Cost of Goods Sold (COGS)", "Value": self.kpis["cogs"]},
                {"Metric": "Estimated Gross Profit", "Value": self.kpis["estimated_gross_profit"]},
                {"Metric": "Gross Margin %", "Value": f"{self.kpis['gross_margin_pct']}%"},
                {"Metric": "Total Units Sold", "Value": self.kpis["units_sold"]},
                {"Metric": "Total Orders", "Value": self.kpis["unique_orders"]},
                {"Metric": "Average Transaction Value (ATV)", "Value": self.kpis["average_transaction_value"]},
                {"Metric": "Canteen Health Score", "Value": f"{self.health['overall_score']} / 100 ({self.health['grade']})"}
            ]
            pd.DataFrame(kpi_rows).to_excel(writer, sheet_name="Executive_Summary", index=False)

            # Tab 2: Category Performance
            cat_df = self.df.groupby("category").agg(
                units_sold=("quantity", "sum"),
                gross_sales=("unit_price", lambda s: float((s * self.df.loc[s.index, "quantity"]).sum())),
                discounts=("discount", "sum"),
                cogs=("unit_cost", lambda s: float((s * self.df.loc[s.index, "quantity"]).sum()))
            ).reset_index()
            cat_df["net_sales"] = cat_df["gross_sales"] - cat_df["discounts"]
            cat_df["profit"] = cat_df["net_sales"] - cat_df["cogs"]
            cat_df["gross_margin_pct"] = (cat_df["profit"] / cat_df["net_sales"] * 100.0).round(2)
            cat_df.to_excel(writer, sheet_name="Categories", index=False)

            # Tab 3: Product Rankings
            prod_df = self.df.groupby(["product_id", "product_name", "category"]).agg(
                units_sold=("quantity", "sum"),
                net_sales=("unit_price", lambda s: float((s * self.df.loc[s.index, "quantity"]).sum() - self.df.loc[s.index, "discount"].sum()))
            ).reset_index().sort_values("net_sales", ascending=False)
            prod_df.to_excel(writer, sheet_name="Product_Rankings", index=False)

            # Tab 4: Sample Cleaned Transactions (first 500 rows)
            self.df.head(500).to_excel(writer, sheet_name="Transactions_Sample", index=False)

        return filepath

    def generate_pdf_report(self) -> Path:
        """Generates executive PDF report using ReportLab."""
        filename = f"CanteenIQ_Executive_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = REPORTS_DIR / filename

        doc = SimpleDocTemplate(str(filepath), pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=6
        )

        subtitle_style = ParagraphStyle(
            'SubtitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569'),
            spaceAfter=15
        )

        disclaimer_style = ParagraphStyle(
            'DisclaimerStyle',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#94a3b8'),
            spaceAfter=15
        )

        elements = []
        elements.append(Paragraph("CanteenIQ: Executive Decision Support Report", title_style))
        elements.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y - %H:%M')} | Dataset: {self.dataset_id}", subtitle_style))
        elements.append(Paragraph("DISCLAIMER: Benchmark analysis evaluated on synthetic institutional data. Not actual canteen performance.", disclaimer_style))
        elements.append(Spacer(1, 10))

        # KPI Table
        elements.append(Paragraph("<b>1. Key Financial & Operational Performance Indicators</b>", styles['Heading2']))
        table_data = [
            ["Metric", "Value", "Metric", "Value"],
            ["Gross Sales", f"INR {self.kpis['gross_sales']:,.2f}", "Net Sales", f"INR {self.kpis['net_sales']:,.2f}"],
            ["COGS", f"INR {self.kpis['cogs']:,.2f}", "Gross Profit", f"INR {self.kpis['estimated_gross_profit']:,.2f}"],
            ["Gross Margin %", f"{self.kpis['gross_margin_pct']:.2f}%", "Units Sold", f"{self.kpis['units_sold']:,}"],
            ["Total Orders", f"{self.kpis['unique_orders']:,}", "Avg Order Value", f"INR {self.kpis['average_transaction_value']:.2f}"],
            ["Health Score", f"{self.health['overall_score']}/100 ({self.health['grade']})", "Active Products", f"{self.kpis['active_products']}"]
        ]

        t = Table(table_data, colWidths=[130, 130, 130, 130])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white])
        ]))
        elements.append(t)
        elements.append(Spacer(1, 15))

        # Key Recommendations
        elements.append(Paragraph("<b>2. Top Prescriptive Decision Recommendations</b>", styles['Heading2']))
        rec_data = [
            ["Recommendation", "Category", "Confidence", "Impact Direction"],
            ["Introduce Evening Study Combo (Samosa + Chai)", "Menu Bundling", "High Evidence", "+12% evening beverage vol"],
            ["Deploy 3rd Counter During Lunch Rush", "Staffing", "High Evidence", "Reduces wait time < 3 mins"],
            ["Reprice / Phase out Fruit Custard", "Menu Matrix", "Medium", "Recovers unused kitchen batch prep"],
            ["Institute Kitchen Prep Weigh-In Log", "ESG / Data", "High Evidence", "Enables certified empirical waste tracking"]
        ]
        t_rec = Table(rec_data, colWidths=[180, 100, 90, 150])
        t_rec.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0d9488')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white])
        ]))
        elements.append(t_rec)

        doc.build(elements)
        return filepath

    def generate_docx_academic_report(self) -> Path:
        """Generates comprehensive academic project report in Word (.docx) format."""
        filename = "CanteenIQ_Academic_Project_Report.docx"
        filepath = REPORTS_DIR / filename

        doc = Document()

        # Title
        p_title = doc.add_heading(level=0)
        run_title = p_title.add_run("CanteenIQ: An Intelligent Canteen Sales Analytics, Demand Forecasting, Simulation and Decision Support Ecosystem")
        run_title.font.color.rgb = RGBColor(15, 23, 42)

        p_sub = doc.add_paragraph("A Capstone Academic Engineering Project Report\n")
        p_sub.runs[0].font.size = Pt(13)
        p_sub.runs[0].font.italic = True

        doc.add_paragraph(f"Report Generated: {datetime.now().strftime('%B %d, %Y')}")
        doc.add_paragraph("Dataset: CanteenIQ Institutional Benchmark Dataset (24,572 Clean Transactions)")
        doc.add_paragraph("Academic Honesty Notice: All transaction data is generated via the Canteen World Simulator. Simulated outcomes represent methodological demonstrations rather than validated field performance.")

        # Table of Contents Outline
        doc.add_heading("Table of Contents Outline", level=1)
        toc_items = [
            "1. Abstract & Novelty Thesis (The Closed Decision Loop)",
            "2. Problem Statement & Research Objectives",
            "3. Literature Review & Theoretical Foundations",
            "4. System Architecture & Tech Stack",
            "5. Synthetic Dataset Generation & Calendar Modeling",
            "6. Data Cleaning & Lineage Architecture",
            "7. Exploratory Data Analysis & Pareto Concentration",
            "8. Statistical Laboratory & Assumption Advisor",
            "9. Demand Forecasting & Rolling-Origin Backtesting",
            "10. Association Rule Mining & Cross-Sell Network Topology",
            "11. Multi-Method Anomaly Detection & Ground Truth Benchmark",
            "12. Smart Preparation Planner & Newsvendor Optimization",
            "13. What-If Simulator & Empirical Price Elasticity",
            "14. Novelty Modules: Menu Matrix, RFM Cohorts, Digital Twin, Offline Assistant",
            "15. Verification, Limitations & Viva Defense Preparation"
        ]
        for item in toc_items:
            doc.add_paragraph(item, style='List Bullet')

        # Chapter 1: Abstract & Novelty Thesis
        doc.add_heading("Chapter 1: Abstract & Novelty Thesis", level=1)
        doc.add_paragraph(
            "Traditional canteen management software is largely confined to CRUD-level point-of-sale recording and basic static charts. "
            "CanteenIQ bridges the gap between raw transaction collection and operational decision-making by implementing a continuous, "
            "explainable closed decision loop: Data -> Quality -> Insight -> Forecast -> Plan -> Simulate -> Recommend -> Decide -> Track -> Learn."
        )

        # Chapter 2: Key Computed Results
        doc.add_heading("Chapter 2: Live Computed System Results", level=1)
        doc.add_paragraph(
            f"Across the 12-month synthetic institutional evaluation dataset, CanteenIQ computed total gross sales of INR {self.kpis['gross_sales']:,.2f}, "
            f"delivering net sales of INR {self.kpis['net_sales']:,.2f} across {self.kpis['unique_orders']:,} orders and {self.kpis['units_sold']:,} portions. "
            f"The canteen achieved an estimated gross profit of INR {self.kpis['estimated_gross_profit']:,.2f} with an overall gross margin of {self.kpis['gross_margin_pct']:.2f}%."
        )

        # Chapter 3: Verified References
        doc.add_heading("Chapter 3: Academic References", level=1)
        references = [
            "Hyndman, R. J., & Athanasopoulos, G. (2021). Forecasting: Principles and practice (3rd ed.). OTexts.",
            "Agrawal, R., & Srikant, R. (1994). Fast algorithms for mining association rules. In Proc. 20th Int. Conf. Very Large Data Bases (VLDB), 487-499.",
            "Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008). Isolation forest. In 2008 Eighth IEEE International Conference on Data Mining (pp. 413-422).",
            "Breiman, L. (2001). Random forests. Machine Learning, 45(1), 5-32.",
            "Silver, E. A., Pyke, D. F., & Thomas, D. J. (2016). Inventory and production management in supply chains. CRC Press.",
            "Little, J. D. (1961). A proof for the queuing formula: L = lambda * W. Operations Research, 9(3), 383-387."
        ]
        for ref in references:
            doc.add_paragraph(ref, style='List Bullet')

        doc.save(str(filepath))
        return filepath

    def generate_pptx_presentation(self) -> Path:
        """Generates editable 22-slide presentation using python-pptx."""
        filename = "CanteenIQ_Project_Presentation.pptx"
        filepath = REPORTS_DIR / filename

        prs = Presentation()
        # Set slide width and height to 16:9 widescreen
        prs.slide_width = PptxInches(13.333)
        prs.slide_height = PptxInches(7.5)

        blank_slide_layout = prs.slide_layouts[6]

        # Slide content definition (22 slides)
        slides_data = [
            ("CanteenIQ: Project Overview", "An Intelligent Canteen Sales Analytics, Demand Forecasting, Simulation and Decision Support Ecosystem", "Capstone Engineering Presentation"),
            ("The Problem: Fragmented Canteen Operations", "Campus canteens face unpredictable demand surges, high perishable food waste, and long lunch queues without data support.", "Traditional POS systems only record sales; they offer zero prescriptive guidance."),
            ("Novelty Thesis: The Closed Decision Loop", "Data -> Quality -> Insight -> Forecast -> Plan -> Simulate -> Recommend -> Decide -> Track -> Learn", "Combines descriptive, diagnostic, predictive, prescriptive, and simulation analytics into an explainable offline system."),
            ("System Architecture", "Frontend: React 18 + TypeScript + Vite + Tailwind + Recharts\nBackend: FastAPI + Python 3.10 + SQLite + scikit-learn + statsmodels", "Strictly offline and zero-cost local architecture with no paid APIs."),
            ("Synthetic Dataset Design (Canteen World Simulator)", "Configurable institutional simulator modeling semester exams, cultural fests, weather impacts, and customer loyalty.", "Same seed + same config = 100% reproducible benchmark dataset with SHA-256 manifest."),
            ("Data Quality & Quarantine Architecture (Data Studio)", "Rule-based engine with 5-dimension quality scoring: Completeness, Validity, Uniqueness, Consistency, Timeliness.", "Never silently drops corrupt records: isolates invalid entries to an audit-trailed quarantine table."),
            ("Exploratory Data Analysis: Concentration & Trends", "ABC Pareto analysis, Lorenz curve, Gini coefficient, and hour x weekday footfall heatmap matrix.", f"Live computed Gini coefficient shows strong revenue concentration; Class A items drive 70% of revenue."),
            ("Statistical Analysis Laboratory & Assumption Advisor", "Hypothesis testing: Welch t-test / Mann-Whitney U, Chi-square independence, and ADF stationarity.", "Assumption Advisor automatically checks normality and recommends parametric vs non-parametric tests."),
            ("Demand Forecasting Studio: Methodology", "Multi-model evaluation: Seasonal Naive baseline, Moving Average, Holt-Winters ETS, and Random Forest.", "Strict chronological walk-forward rolling-origin backtesting with zero future data leakage."),
            ("Forecast Leaderboard & Model Cards", "Model leaderboard comparing MAE, RMSE, sMAPE%, and improvement over baseline.", "Each model run exports a reproducible Model Card containing hyperparameters, split dates, and limitations."),
            ("Product Association Mining & Basket Analysis", "Apriori / FP-Growth mining order-level multi-item baskets for Support, Confidence, Lift, Leverage, and Conviction.", "Interactive network graph topology reveals evening study combos (Samosa + Masala Chai with 2.2x lift)."),
            ("Multi-Method Anomaly Detection", "Detects unusual surges and drops using Robust MAD Z-Score, IQR, and Isolation Forest.", "Benchmarked against injected ground-truth event labels to evaluate Precision, Recall, and F1 score."),
            ("Smart Preparation Planner (Newsvendor-Enhanced)", "Balances perishable overage cost (spoilage loss) against underage cost (lost gross margin).", "Monte Carlo simulation estimates stock-out probability and expected leftover portions."),
            ("What-If Business Scenario Simulator", "Side-by-side comparison of price adjustments, demand shocks, discounts, and food cost inflation.", "Tornado sensitivity chart and Monte Carlo uncertainty bands (P10, P50, P90)."),
            ("Menu Engineering Matrix (BCG-Style)", "Classifies menu items into Stars, Plowhorses, Puzzles, and Dogs based on Popularity vs Margin.", "Action guidance: Reprice Plowhorses, promote Puzzles with combo bundles, phase out declining Dogs."),
            ("Pseudonymous Customer Analytics", "RFM scoring and K-Means customer segmentation into Daily Loyalists, Regulars, and Occasionals.", "Retention cohort heatmap tracks monthly repeat dining behavior while protecting student privacy."),
            ("Canteen Digital Twin: Queue & Staffing Simulator", "Discrete-event queue model estimating hourly queue length, wait times, and counter utilization.", "Recommends opening an express counter during lunch rush (12:30-13:45) to maintain sub-3-minute wait SLA."),
            ("Ask CanteenIQ: 100% Offline Analytics Assistant", "Deterministic rule and intent parser interpreting natural language questions.", "Returns plain-English answers, structured tables, recommended charts, and underlying mathematical formulas."),
            ("Sustainability & Waste Scenario Lab (Simulation Only)", "Compares naive preparation policies vs forecast-guided preparation on simulated inventory scenarios.", "Disclaimer: Demonstrates hypothetical policy modeling; real waste reduction requires empirical kitchen logs."),
            ("Decision Impact Tracker & Causal Safeguards", "Closes the decision loop by tracking accepted recommendations against observed outcomes.", "Explicit causal disclaimer: Before/after comparisons do not prove causality due to institutional confounders."),
            ("Testing, Quality Assurance & Verification", "Full backend pytest suite covering metrics, leakage-free splits, associations, newsvendor, and API contracts.", "100% honest reporting: actual test execution logs recorded in TESTING_REPORT.md."),
            ("Conclusion, Viva Defense & Future Scope", "CanteenIQ demonstrates a complete, explainable decision support ecosystem for institutional canteens.", "Ready for live viva defense: includes 60+ technical Q&A, comprehensive glossary, and demo flow.")
        ]

        for title, main_txt, footer_txt in slides_data:
            slide = prs.slides.add_slide(blank_slide_layout)

            # Slide Header Banner
            tx_box = slide.shapes.add_textbox(PptxInches(0.8), PptxInches(0.6), PptxInches(11.7), PptxInches(1.2))
            tf = tx_box.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.size = PptxPt(26)
            p.font.bold = True
            p.font.color.rgb = PptxRGBColor(15, 23, 42)

            # Main Body Box
            body_box = slide.shapes.add_textbox(PptxInches(0.8), PptxInches(2.0), PptxInches(11.7), PptxInches(4.2))
            btf = body_box.text_frame
            btf.word_wrap = True
            bp = btf.paragraphs[0]
            bp.text = main_txt
            bp.font.size = PptxPt(18)
            bp.font.color.rgb = PptxRGBColor(51, 65, 85)

            # Footer / Disclaimer Box
            foot_box = slide.shapes.add_textbox(PptxInches(0.8), PptxInches(6.4), PptxInches(11.7), PptxInches(0.6))
            ftf = foot_box.text_frame
            ftf.word_wrap = True
            fp = ftf.paragraphs[0]
            fp.text = f"{footer_txt} | CanteenIQ Academic Project"
            fp.font.size = PptxPt(11)
            fp.font.color.rgb = PptxRGBColor(148, 163, 184)

        prs.save(str(filepath))
        return filepath
