"""
Smart Parking Slot Management System
Configuration Module
Defines system constants, pricing rules, slot types, color themes, and directory paths.
"""

import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
DATABASE_DIR = BASE_DIR / "database"
REPORTS_DIR = BASE_DIR / "reports"
RECEIPTS_DIR = BASE_DIR / "receipts"
BACKUP_DIR = BASE_DIR / "backups"

# Ensure runtime directories exist
for folder in [DATABASE_DIR, REPORTS_DIR, RECEIPTS_DIR, BACKUP_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

# Database file
DB_PATH = DATABASE_DIR / "parking.db"

# Application Metadata
APP_NAME = "Smart Parking Slot Management System"
APP_SUBTITLE = "Automated Vehicle Allocation & Billing Platform"
APP_VERSION = "2.4.0"
PROJECT_TYPE = "B.Tech Computer Science & Engineering Final Project"

# Parking Slot Statuses
STATUS_AVAILABLE = "Available"
STATUS_OCCUPIED = "Occupied"
STATUS_RESERVED = "Reserved"
STATUS_MAINTENANCE = "Maintenance"

# Vehicle & Slot Types
TYPE_BIKE = "Bike"
TYPE_CAR = "Car"
TYPE_EV = "EV"
TYPE_VIP = "VIP"
TYPE_ACCESSIBLE = "Accessible"

SLOT_TYPES = [TYPE_CAR, TYPE_BIKE, TYPE_EV, TYPE_VIP, TYPE_ACCESSIBLE]

# Color Palette for GUI & Visualization
STATUS_COLORS = {
    STATUS_AVAILABLE: "#22c55e",    # Green
    STATUS_OCCUPIED: "#ef4444",     # Red
    STATUS_RESERVED: "#eab308",     # Yellow
    STATUS_MAINTENANCE: "#6b7280",  # Gray
}

TYPE_COLORS = {
    TYPE_BIKE: "#f97316",        # Orange
    TYPE_CAR: "#3b82f6",         # Blue
    TYPE_EV: "#10b981",          # Emerald / EV Green
    TYPE_VIP: "#a855f7",         # Purple
    TYPE_ACCESSIBLE: "#06b6d4",  # Cyan
}

# Pricing Configuration (Default in INR ₹)
DEFAULT_HOURLY_RATES = {
    TYPE_BIKE: 20.0,
    TYPE_CAR: 40.0,
    TYPE_EV: 30.0,
    TYPE_VIP: 60.0,
    TYPE_ACCESSIBLE: 30.0,
}

# Maximum daily parking fee cap (24 hours)
DEFAULT_DAILY_MAX_RATES = {
    TYPE_BIKE: 160.0,
    TYPE_CAR: 320.0,
    TYPE_EV: 260.0,
    TYPE_VIP: 500.0,
    TYPE_ACCESSIBLE: 240.0,
}

# Grace period in minutes (free if exited within grace period)
GRACE_PERIOD_MINUTES = 15

# EV Charging Rate per kWh in INR ₹
EV_CHARGING_RATE_PER_KWH = 9.50

# Payment Methods
PAYMENT_CASH = "Cash"
PAYMENT_UPI = "UPI"
PAYMENT_CARD = "Card"
PAYMENT_METHODS = [PAYMENT_CASH, PAYMENT_UPI, PAYMENT_CARD]

# Payment Status
PAYMENT_PAID = "Paid"
PAYMENT_PENDING = "Pending"

# User Roles
ROLE_ADMIN = "admin"
ROLE_STAFF = "staff"

# Tkinter GUI Styling
GUI_THEMES = {
    "light": {
        "bg_primary": "#f8fafc",
        "bg_card": "#ffffff",
        "bg_sidebar": "#0f172a",
        "text_primary": "#0f172a",
        "text_secondary": "#64748b",
        "text_sidebar": "#f8fafc",
        "accent": "#2563eb",
        "accent_hover": "#1d4ed8",
        "border": "#e2e8f0",
        "card_shadow": "#cbd5e1"
    },
    "dark": {
        "bg_primary": "#0f172a",
        "bg_card": "#1e293b",
        "bg_sidebar": "#020617",
        "text_primary": "#f8fafc",
        "text_secondary": "#94a3b8",
        "text_sidebar": "#f1f5f9",
        "accent": "#3b82f6",
        "accent_hover": "#60a5fa",
        "border": "#334155",
        "card_shadow": "#090d16"
    }
}
