"""
Smart Parking Slot Management System
Reports & Analytics Module
Generates analytical charts using Matplotlib and data export summaries.
"""

from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
from database import DatabaseManager
from config import REPORTS_DIR

# Configure Matplotlib backend safely
try:
    import matplotlib
    matplotlib.use('Agg')  # Headless-safe backend
    import matplotlib.pyplot as plt
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False

class ReportManager:
    """Creates visual business intelligence charts and performance reports."""

    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db = db_manager or DatabaseManager()

    def generate_charts(self) -> Dict[str, str]:
        """
        Renders Matplotlib charts and saves image files in reports/ folder.
        Returns paths to generated image files.
        """
        if not HAS_MATPLOTLIB:
            return {"error": "Matplotlib is not installed. Please install via 'pip install matplotlib'."}

        analytics = self.db.get_analytics_data()
        chart_files = {}

        # 1. Vehicle Type Distribution (Pie Chart)
        types_data = analytics.get("type_distribution", {})
        if types_data:
            plt.figure(figsize=(6, 5), facecolor='#f8fafc')
            labels = list(types_data.keys())
            sizes = list(types_data.values())
            colors = ['#3b82f6', '#f97316', '#10b981', '#a855f7', '#06b6d4'][:len(labels)]

            plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140, colors=colors,
                    wedgeprops={'edgecolor': 'white', 'linewidth': 2})
            plt.title("Vehicle Type Distribution", fontsize=14, fontweight='bold', pad=15)
            pie_path = REPORTS_DIR / "vehicle_distribution.png"
            plt.tight_layout()
            plt.savefig(pie_path, dpi=120)
            plt.close()
            chart_files["vehicle_distribution"] = str(pie_path)

        # 2. Daily Revenue (Bar Chart)
        rev_data = analytics.get("daily_revenue", {})
        if rev_data:
            plt.figure(figsize=(7, 4.5), facecolor='#f8fafc')
            dates = list(rev_data.keys())[::-1]
            amounts = [rev_data[d] for d in dates]

            bars = plt.bar(dates, amounts, color='#2563eb', width=0.5, edgecolor='#1d4ed8')
            plt.title("Daily Revenue Overview (INR)", fontsize=14, fontweight='bold', pad=15)
            plt.xlabel("Date", fontsize=11)
            plt.ylabel("Revenue (₹)", fontsize=11)
            plt.xticks(rotation=25)
            plt.grid(axis='y', linestyle='--', alpha=0.5)

            for bar in bars:
                yval = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2, yval + 5, f"₹{yval:.0f}", ha='center', va='bottom', fontsize=9)

            bar_path = REPORTS_DIR / "daily_revenue.png"
            plt.tight_layout()
            plt.savefig(bar_path, dpi=120)
            plt.close()
            chart_files["daily_revenue"] = str(bar_path)

        # 3. Peak Parking Entry Hours (Line Chart)
        hours_data = analytics.get("peak_hours", {})
        if hours_data:
            plt.figure(figsize=(7, 4.5), facecolor='#f8fafc')
            hrs = list(hours_data.keys())
            counts = list(hours_data.values())

            plt.plot(hrs, counts, marker='o', color='#10b981', linewidth=2.5, markersize=6)
            plt.title("Peak Entry Traffic by Hour", fontsize=14, fontweight='bold', pad=15)
            plt.xlabel("Hour of Day", fontsize=11)
            plt.ylabel("Vehicles Entered", fontsize=11)
            plt.grid(True, linestyle='--', alpha=0.5)

            line_path = REPORTS_DIR / "peak_hours.png"
            plt.tight_layout()
            plt.savefig(line_path, dpi=120)
            plt.close()
            chart_files["peak_hours"] = str(line_path)

        return chart_files
