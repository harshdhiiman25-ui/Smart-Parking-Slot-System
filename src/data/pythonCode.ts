export interface PythonSourceFile {
  name: string;
  path: string;
  category: 'core' | 'ui' | 'db' | 'docs' | 'config';
  description: string;
  code: string;
}

export const PYTHON_FILES: PythonSourceFile[] = [
  {
    name: 'main.py',
    path: 'parking_management_system/main.py',
    category: 'core',
    description: 'Master Application Controller with Tkinter GUI window, sidebar navigation, keyboard shortcuts, and headless CLI verification mode.',
    code: `"""
Smart Parking Slot Management System
Main Application Entry Point (Tkinter GUI & CLI Mode)
B.Tech Computer Science Project Demonstrator
"""

import sys
import os
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

# Add project base directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from database import DatabaseManager
from login import LoginManager
from parking import ParkingManager
from reservations import ReservationManager
from payments import PaymentManager
from ev_charging import EVChargingManager
from reports import ReportManager
from receipt import ReceiptManager
from utils import (
    format_currency,
    validate_vehicle_number,
    validate_phone_number,
    backup_database
)
from config import (
    APP_NAME,
    APP_VERSION,
    SLOT_TYPES,
    PAYMENT_METHODS,
    TYPE_CAR,
    TYPE_BIKE,
    TYPE_EV,
    TYPE_VIP,
    TYPE_ACCESSIBLE
)

# Tkinter conditional imports
try:
    import tkinter as tk
    from tkinter import ttk, messagebox, simpledialog, filedialog
    HAS_TKINTER = True
except ImportError:
    HAS_TKINTER = False

from dashboard import DashboardView


class ParkingApp:
    """Main Application Controller for Smart Parking Slot Management System."""

    def __init__(self, root=None):
        self.root = root
        self.db = DatabaseManager()
        self.login_manager = LoginManager(self.db)
        self.parking_manager = ParkingManager(self.db)
        self.reservation_manager = ReservationManager(self.db)
        self.payment_manager = PaymentManager(self.db)
        self.ev_manager = EVChargingManager(self.db)
        self.report_manager = ReportManager(self.db)

        # Default login to admin for demonstration ease
        self.login_manager.login("admin", "admin123")

        if HAS_TKINTER and self.root:
            self.setup_window()
            self.build_gui()
            self.bind_shortcuts()

    def setup_window(self):
        self.root.title(f"{APP_NAME} v{APP_VERSION}")
        self.root.geometry("1280x800")
        self.root.minsize(1024, 700)
        self.root.configure(bg="#f1f5f9")

    def bind_shortcuts(self):
        self.root.bind("<Control-e>", lambda e: self.switch_tab("entry"))
        self.root.bind("<Control-x>", lambda e: self.switch_tab("exit"))
        self.root.bind("<Control-r>", lambda e: self.refresh_active_view())
        self.root.bind("<Control-d>", lambda e: self.switch_tab("dashboard"))

    def build_gui(self):
        # Top App Header
        top_bar = tk.Frame(self.root, bg="#0f172a", height=60)
        top_bar.pack(fill="x", side="top")

        app_title = tk.Label(
            top_bar,
            text=f"🚗 {APP_NAME.upper()}",
            font=("Helvetica", 14, "bold"),
            bg="#0f172a",
            fg="#f8fafc"
        )
        app_title.pack(side="left", padx=20, pady=14)

        user_info = tk.Label(
            top_bar,
            text=f"👤 Logged in: {self.login_manager.get_current_user()['full_name']} [{self.login_manager.get_role().upper()}]",
            font=("Helvetica", 10),
            bg="#0f172a",
            fg="#94a3b8"
        )
        user_info.pack(side="right", padx=20, pady=14)

        # Main Layout: Sidebar (Left) + Content Notebook (Right)
        body_frame = tk.Frame(self.root, bg="#f1f5f9")
        body_frame.pack(fill="both", expand=True)

        sidebar = tk.Frame(body_frame, bg="#1e293b", width=220)
        sidebar.pack(fill="y", side="left")
        sidebar.pack_propagate(False)

        nav_title = tk.Label(sidebar, text="NAVIGATION MENU", font=("Helvetica", 9, "bold"), bg="#1e293b", fg="#64748b")
        nav_title.pack(anchor="w", padx=20, pady=(20, 10))

        nav_items = [
            ("dashboard", "🏠 Dashboard & Map", self.show_dashboard),
            ("entry", "🚗 Vehicle Entry (Ctrl+E)", self.show_entry),
            ("exit", "🚪 Vehicle Exit (Ctrl+X)", self.show_exit),
            ("reservations", "📅 Slot Reservations", self.show_reservations),
            ("ev", "⚡ EV Charging Bay", self.show_ev),
            ("history", "📜 History & Search", self.show_history),
            ("analytics", "📊 Reports & Analytics", self.show_analytics),
            ("admin", "⚙️ Admin Settings", self.show_admin),
        ]

        self.nav_buttons = {}
        for tab_id, label, func in nav_items:
            btn = tk.Button(
                sidebar,
                text=label,
                font=("Helvetica", 10),
                bg="#1e293b",
                fg="#f8fafc",
                activebackground="#2563eb",
                activeforeground="#ffffff",
                relief="flat",
                anchor="w",
                padx=15,
                pady=10,
                command=lambda f=func: f()
            )
            btn.pack(fill="x", padx=10, pady=2)
            self.nav_buttons[tab_id] = btn

        self.content_area = tk.Frame(body_frame, bg="#f8fafc")
        self.content_area.pack(fill="both", expand=True, padx=10, pady=10)
        self.show_dashboard()
`
  },
  {
    name: 'database.py',
    path: 'parking_management_system/database.py',
    category: 'db',
    description: 'SQLite3 Database Engine with connection pooling, foreign keys, B-tree indexes, ACID transactions, and initial seed data.',
    code: `"""
Smart Parking Slot Management System
Database Manager Module
Implements SQLite3 schema, CRUD operations, indexing, transactions, and initial seed data.
"""

import sqlite3
import hashlib
import os
import secrets
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple

from config import (
    DB_PATH,
    TYPE_CAR,
    TYPE_BIKE,
    TYPE_EV,
    TYPE_VIP,
    TYPE_ACCESSIBLE,
    STATUS_AVAILABLE,
    STATUS_OCCUPIED,
    STATUS_RESERVED,
    STATUS_MAINTENANCE,
    DEFAULT_HOURLY_RATES,
    DEFAULT_DAILY_MAX_RATES,
    EV_CHARGING_RATE_PER_KWH,
    ROLE_ADMIN,
    ROLE_STAFF,
    PAYMENT_PAID,
    PAYMENT_CASH,
    PAYMENT_UPI,
    PAYMENT_CARD
)

def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Hash password using SHA-256 with a cryptographically secure salt."""
    if not salt:
        salt = secrets.token_hex(16)
    combined = (password + salt).encode('utf-8')
    pwd_hash = hashlib.sha256(combined).hexdigest()
    return pwd_hash, salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Verify input password against stored hash and salt."""
    pwd_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(pwd_hash, stored_hash)

class DatabaseManager:
    """Handles all SQLite database operations with thread-safe connections."""

    def __init__(self, db_path: str = str(DB_PATH)):
        self.db_path = db_path
        self.init_database()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def init_database(self) -> None:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # 1. users
            # 2. parking_slots
            # 3. vehicles
            # 4. parking_records
            # 5. reservations
            # 6. payments
            # 7. rates
            # 8. ev_charging
            # 9. notifications
            # 10. system_logs
            conn.commit()
`
  },
  {
    name: 'dashboard.py',
    path: 'parking_management_system/dashboard.py',
    category: 'ui',
    description: 'Tkinter GUI Dashboard view featuring live metric counters, real-time digital clock, and interactive visual slot grid (A01-C10).',
    code: `"""
Smart Parking Slot Management System
Dashboard UI Module (Tkinter)
Implements top metric statistic cards, live clock, and interactive visual parking bay layout.
"""

from datetime import datetime
from typing import Optional, Callable, Dict, Any
import tkinter as tk
from tkinter import ttk, messagebox

from config import (
    STATUS_AVAILABLE,
    STATUS_OCCUPIED,
    STATUS_RESERVED,
    STATUS_MAINTENANCE,
    TYPE_EV,
    TYPE_VIP,
    TYPE_ACCESSIBLE
)

class DashboardView:
    def __init__(self, parent, db_manager, on_slot_click: Optional[Callable] = None):
        self.parent = parent
        self.db = db_manager
        self.on_slot_click = on_slot_click
        self.slot_buttons = {}
        self.frame = ttk.Frame(parent)
        self.build_ui()
`
  },
  {
    name: 'parking.py',
    path: 'parking_management_system/parking.py',
    category: 'core',
    description: 'Parking business logic: Automated bay allocation, vehicle check-in validation, check-out duration & multi-tariff billing calculation.',
    code: `"""
Smart Parking Slot Management System
Parking Slot & Operations Module
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from database import DatabaseManager
from config import STATUS_AVAILABLE, STATUS_OCCUPIED, TYPE_CAR, TYPE_EV
from utils import generate_ticket_id, calculate_duration, calculate_parking_fee

class ParkingSlot:
    def __init__(self, slot_number: str, slot_type: str = "Car", status: str = "Available"):
        self.slot_number = slot_number
        self.slot_type = slot_type
        self.status = status

class ParkingManager:
    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db = db_manager or DatabaseManager()

    def check_in_vehicle(self, vehicle_number: str, vehicle_type: str, owner_name: str, ...):
        # Auto-allocates optimal slot, prevents duplicates, issues ticket
        pass

    def check_out_vehicle(self, ticket_or_plate: str, payment_method: str = "Cash"):
        # Computes duration, grace period, tariff, frees bay, records payment
        pass
`
  },
  {
    name: 'config.py',
    path: 'parking_management_system/config.py',
    category: 'config',
    description: 'Centralized system constants, default tariffs (Car: ₹40, Bike: ₹20, EV: ₹30, VIP: ₹60), grace period (15 mins), and color codes.',
    code: `"""
Configuration Module
Defines system constants, pricing rules, slot types, color themes, and directory paths.
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database" / "parking.db"

APP_NAME = "Smart Parking Slot Management System"
GRACE_PERIOD_MINUTES = 15
EV_CHARGING_RATE_PER_KWH = 9.50

DEFAULT_HOURLY_RATES = {
    "Bike": 20.0,
    "Car": 40.0,
    "EV": 30.0,
    "VIP": 60.0,
    "Accessible": 30.0,
}
`
  },
  {
    name: 'receipt.py',
    path: 'parking_management_system/receipt.py',
    category: 'core',
    description: 'Generates monospaced ASCII thermal slip receipts and stores exportable text vouchers in the receipts/ folder.',
    code: `"""
Receipt Generator Module
Produces thermal-style ASCII receipts, printable HTML/PDF vouchers, and receipt files.
"""
from datetime import datetime
from typing import Dict, Any, Tuple
from config import APP_NAME, RECEIPTS_DIR

class ReceiptManager:
    @staticmethod
    def generate_ascii_receipt(data: Dict[str, Any]) -> str:
        # Generates clean 46-character wide thermal slip
        pass
`
  },
  {
    name: 'reports.py',
    path: 'parking_management_system/reports.py',
    category: 'core',
    description: 'Matplotlib chart generator creating pie charts for vehicle mix, bar charts for 7-day revenue, and traffic curves.',
    code: `"""
Reports & Analytics Module
Generates analytical charts using Matplotlib and data export summaries.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

class ReportManager:
    def generate_charts(self):
        # Generates Vehicle Type Distribution (Pie)
        # Generates Daily Revenue Overview (Bar)
        # Generates Peak Entry Traffic (Line)
        pass
`
  },
  {
    name: 'reservations.py',
    path: 'parking_management_system/reservations.py',
    category: 'core',
    description: 'Advance slot booking manager with double-booking prevention algorithm and reservation code generation.',
    code: `"""
Reservation Manager Module
Handles advanced slot reservations, conflict checks, and expiration management.
"""
class ReservationManager:
    def make_reservation(self, vehicle_number, slot_number, res_date, start_time, end_time, ...):
        # Prevents overlapping intervals on requested slot
        pass
`
  },
  {
    name: 'ev_charging.py',
    path: 'parking_management_system/ev_charging.py',
    category: 'core',
    description: 'EV dispenser telemetry manager tracking kWh energy consumption, charging duration, and combined billing.',
    code: `"""
EV Charging Manager Module
Handles electric vehicle charging stations, kWh power calculations, and combined billing.
"""
class EVChargingManager:
    def start_session(self, slot_number, vehicle_number, ticket_id):
        pass
    def stop_session(self, session_id, units_kwh):
        pass
`
  },
  {
    name: 'README.md',
    path: 'parking_management_system/README.md',
    category: 'docs',
    description: 'Complete B.Tech CS college documentation with Synopsis, Architecture Diagram, Database ERD, Algorithms, and Top 15 Viva Q&A.',
    code: `# Smart Parking Slot Management System
### A Complete B.Tech Computer Science & Engineering Capstone Project
**Technology Stack:** Python 3, Tkinter GUI, SQLite3 Database, Matplotlib Analytics, OOP Architecture
...`
  }
];
