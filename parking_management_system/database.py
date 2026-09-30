"""
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
        """Returns SQLite connection with row_factory set to sqlite3.Row."""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def init_database(self) -> None:
        """Create tables, indexes, and seed default baseline if newly created."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Users Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('admin', 'staff')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 2. Parking Slots Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS parking_slots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slot_number TEXT UNIQUE NOT NULL,
                slot_type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Available' CHECK(status IN ('Available', 'Occupied', 'Reserved', 'Maintenance')),
                floor_level TEXT DEFAULT 'Ground',
                remarks TEXT DEFAULT ''
            );
            """)

            # 3. Vehicles Registry Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_number TEXT UNIQUE NOT NULL,
                vehicle_type TEXT NOT NULL,
                owner_name TEXT NOT NULL,
                owner_phone TEXT,
                color TEXT,
                remarks TEXT,
                registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 4. Parking Records / Tickets Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS parking_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id TEXT UNIQUE NOT NULL,
                vehicle_number TEXT NOT NULL,
                slot_number TEXT NOT NULL,
                vehicle_type TEXT NOT NULL,
                owner_name TEXT NOT NULL,
                owner_phone TEXT,
                entry_time DATETIME NOT NULL,
                exit_time DATETIME,
                duration_minutes INTEGER DEFAULT 0,
                parking_fee REAL DEFAULT 0.0,
                ev_fee REAL DEFAULT 0.0,
                total_amount REAL DEFAULT 0.0,
                payment_status TEXT DEFAULT 'Pending' CHECK(payment_status IN ('Paid', 'Pending')),
                payment_method TEXT,
                transaction_id TEXT,
                status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Completed', 'Cancelled')),
                created_by TEXT DEFAULT 'system'
            );
            """)

            # 5. Reservations Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS reservations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reservation_code TEXT UNIQUE NOT NULL,
                vehicle_number TEXT NOT NULL,
                owner_name TEXT NOT NULL,
                phone_number TEXT NOT NULL,
                vehicle_type TEXT NOT NULL,
                slot_number TEXT NOT NULL,
                reservation_date TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                status TEXT DEFAULT 'Confirmed' CHECK(status IN ('Confirmed', 'Completed', 'Cancelled', 'Expired')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 6. Payments Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id TEXT NOT NULL,
                vehicle_number TEXT NOT NULL,
                payment_method TEXT NOT NULL,
                amount REAL NOT NULL,
                payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                transaction_id TEXT NOT NULL,
                status TEXT DEFAULT 'Success'
            );
            """)

            # 7. Parking Rates Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS rates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_type TEXT UNIQUE NOT NULL,
                hourly_rate REAL NOT NULL,
                daily_max REAL NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 8. EV Charging Sessions Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS ev_charging (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id TEXT,
                slot_number TEXT NOT NULL,
                vehicle_number TEXT NOT NULL,
                start_time DATETIME NOT NULL,
                end_time DATETIME,
                units_kwh REAL DEFAULT 0.0,
                rate_per_kwh REAL DEFAULT 9.50,
                total_charging_fee REAL DEFAULT 0.0,
                status TEXT DEFAULT 'Charging' CHECK(status IN ('Charging', 'Completed', 'Idle'))
            );
            """)

            # 9. Notifications Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'info' CHECK(type IN ('info', 'warning', 'success', 'danger')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_read INTEGER DEFAULT 0
            );
            """)

            # 10. System Logs Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                performed_by TEXT NOT NULL,
                details TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Indexes for optimal query performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_slots_type_status ON parking_slots(slot_type, status);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_ticket ON parking_records(ticket_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_vehicle ON parking_records(vehicle_number);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_status ON parking_records(status);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_entry ON parking_records(entry_time);")

            conn.commit()

        # Seed initial data if tables are empty
        self.seed_sample_data_if_needed()

    def seed_sample_data_if_needed(self) -> None:
        """Seed initial users, rates, 30 slots, active parking entries, and sample history."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Seed Users
            cursor.execute("SELECT COUNT(*) FROM users;")
            if cursor.fetchone()[0] == 0:
                admin_hash, admin_salt = hash_password("admin123")
                staff_hash, staff_salt = hash_password("staff123")

                cursor.executemany("""
                INSERT INTO users (username, password_hash, salt, full_name, role)
                VALUES (?, ?, ?, ?, ?)
                """, [
                    ("admin", admin_hash, admin_salt, "System Administrator", ROLE_ADMIN),
                    ("staff", staff_hash, staff_salt, "Parking Staff Operator", ROLE_STAFF),
                ])

            # 2. Seed Rates
            cursor.execute("SELECT COUNT(*) FROM rates;")
            if cursor.fetchone()[0] == 0:
                rates_data = [
                    (v_type, DEFAULT_HOURLY_RATES[v_type], DEFAULT_DAILY_MAX_RATES[v_type])
                    for v_type in DEFAULT_HOURLY_RATES
                ]
                cursor.executemany("""
                INSERT INTO rates (vehicle_type, hourly_rate, daily_max)
                VALUES (?, ?, ?)
                """, rates_data)

            # 3. Seed 30 Parking Slots
            cursor.execute("SELECT COUNT(*) FROM parking_slots;")
            if cursor.fetchone()[0] == 0:
                slots = []
                # Section A: Slots A01-A10 (Car & VIP)
                for i in range(1, 11):
                    slot_num = f"A{i:02d}"
                    if i in [1, 2]:
                        slot_type = TYPE_VIP
                    elif i == 10:
                        slot_type = TYPE_ACCESSIBLE
                    else:
                        slot_type = TYPE_CAR
                    slots.append((slot_num, slot_type, STATUS_AVAILABLE, "Ground", f"Section A - {slot_type}"))

                # Section B: Slots B01-B10 (Bikes & EV)
                for i in range(1, 11):
                    slot_num = f"B{i:02d}"
                    if i in [1, 2, 3]:
                        slot_type = TYPE_EV
                    elif i == 10:
                        slot_type = TYPE_ACCESSIBLE
                    else:
                        slot_type = TYPE_BIKE
                    slots.append((slot_num, slot_type, STATUS_AVAILABLE, "Ground", f"Section B - {slot_type}"))

                # Section C: Slots C01-C10 (Car & Mixed)
                for i in range(1, 11):
                    slot_num = f"C{i:02d}"
                    if i in [1, 2]:
                        slot_type = TYPE_BIKE
                    else:
                        slot_type = TYPE_CAR
                    slots.append((slot_num, slot_type, STATUS_AVAILABLE, "Floor 1", f"Section C - {slot_type}"))

                cursor.executemany("""
                INSERT INTO parking_slots (slot_number, slot_type, status, floor_level, remarks)
                VALUES (?, ?, ?, ?, ?)
                """, slots)

                # Set a few specific slots to demonstrate realistic states:
                # C05 = Maintenance
                cursor.execute("UPDATE parking_slots SET status = ? WHERE slot_number = 'C05';", (STATUS_MAINTENANCE,))
                # A02 = Reserved
                cursor.execute("UPDATE parking_slots SET status = ? WHERE slot_number = 'A02';", (STATUS_RESERVED,))

            # 4. Seed Vehicles and Active / Historical Records if needed
            cursor.execute("SELECT COUNT(*) FROM parking_records;")
            if cursor.fetchone()[0] == 0:
                now = datetime.now()
                # Active Parked Vehicles (Occupied slots)
                active_data = [
                    ("TKT-20260929-101", "DL01AB1234", "A01", TYPE_VIP, "Vikram Malhotra", "9876543210",
                     (now - timedelta(hours=2, minutes=15)).strftime("%Y-%m-%d %H:%M:%S")),
                    ("TKT-20260929-102", "MH12DE1432", "A03", TYPE_CAR, "Aditi Sharma", "9811223344",
                     (now - timedelta(hours=1, minutes=40)).strftime("%Y-%m-%d %H:%M:%S")),
                    ("TKT-20260929-103", "KA05MB9999", "A04", TYPE_CAR, "Rahul Verma", "9722334455",
                     (now - timedelta(minutes=45)).strftime("%Y-%m-%d %H:%M:%S")),
                    ("TKT-20260929-104", "DL08CY5521", "B01", TYPE_EV, "Pooja Hegde", "9988776655",
                     (now - timedelta(hours=1, minutes=20)).strftime("%Y-%m-%d %H:%M:%S")),
                    ("TKT-20260929-105", "HR26DK4321", "B04", TYPE_BIKE, "Rohan Das", "9655443322",
                     (now - timedelta(hours=3, minutes=10)).strftime("%Y-%m-%d %H:%M:%S")),
                    ("TKT-20260929-106", "UP16BZ7890", "C01", TYPE_BIKE, "Amitabh Sen", "9123456780",
                     (now - timedelta(minutes=25)).strftime("%Y-%m-%d %H:%M:%S")),
                    ("TKT-20260929-107", "DL03TC8812", "C03", TYPE_CAR, "Siddharth Rao", "9876512345",
                     (now - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S")),
                ]

                for item in active_data:
                    ticket_id, v_num, slot_num, v_type, owner, phone, entry_t = item
                    cursor.execute("""
                    INSERT INTO parking_records (
                        ticket_id, vehicle_number, slot_number, vehicle_type,
                        owner_name, owner_phone, entry_time, payment_status, status, created_by
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', 'Active', 'admin')
                    """, (ticket_id, v_num, slot_num, v_type, owner, phone, entry_t))

                    # Mark slot as Occupied
                    cursor.execute("UPDATE parking_slots SET status = 'Occupied' WHERE slot_number = ?;", (slot_num,))

                    # Save to vehicles table
                    cursor.execute("""
                    INSERT OR IGNORE INTO vehicles (vehicle_number, vehicle_type, owner_name, owner_phone)
                    VALUES (?, ?, ?, ?)
                    """, (v_num, v_type, owner, phone))

                # Also seed an active EV Charging session for B01
                cursor.execute("""
                INSERT INTO ev_charging (ticket_id, slot_number, vehicle_number, start_time, units_kwh, rate_per_kwh, total_charging_fee, status)
                VALUES (?, 'B01', 'DL08CY5521', ?, 14.5, 9.50, 137.75, 'Charging')
                """, ("TKT-20260929-104", (now - timedelta(hours=1, minutes=20)).strftime("%Y-%m-%d %H:%M:%S")))

                # Seed sample Reservation for A02
                cursor.execute("""
                INSERT INTO reservations (reservation_code, vehicle_number, owner_name, phone_number, vehicle_type, slot_number, reservation_date, start_time, end_time, status)
                VALUES ('RES-8921', 'DL04XY9000', 'Rajesh Khanna', '9899112233', 'VIP', 'A02', ?, '14:00', '18:00', 'Confirmed')
                """, (now.strftime("%Y-%m-%d"),))

                # Seed Historical Completed Records for Reporting
                hist_data = [
                    ("TKT-20260928-001", "DL05AQ1111", "A05", TYPE_CAR, "Karan Johar", "9810101010",
                     (now - timedelta(days=1, hours=6)).strftime("%Y-%m-%d %H:%M:%S"),
                     (now - timedelta(days=1, hours=3)).strftime("%Y-%m-%d %H:%M:%S"),
                     180, 120.0, 0.0, 120.0, PAYMENT_PAID, PAYMENT_UPI, "UPI-REF-9021"),
                    ("TKT-20260928-002", "MH01AB2222", "B05", TYPE_BIKE, "Sunil Grover", "9820202020",
                     (now - timedelta(days=1, hours=4)).strftime("%Y-%m-%d %H:%M:%S"),
                     (now - timedelta(days=1, hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
                     120, 40.0, 0.0, 40.0, PAYMENT_PAID, PAYMENT_CASH, "CASH-8831"),
                    ("TKT-20260928-003", "KA01EV3333", "B02", TYPE_EV, "Neha Kakkar", "9830303030",
                     (now - timedelta(days=1, hours=5)).strftime("%Y-%m-%d %H:%M:%S"),
                     (now - timedelta(days=1, hours=1)).strftime("%Y-%m-%d %H:%M:%S"),
                     240, 120.0, 190.0, 310.0, PAYMENT_PAID, PAYMENT_CARD, "CARD-TXN-4411"),
                    ("TKT-20260927-001", "UP32CC4444", "A06", TYPE_CAR, "Anil Kapoor", "9840404040",
                     (now - timedelta(days=2, hours=8)).strftime("%Y-%m-%d %H:%M:%S"),
                     (now - timedelta(days=2, hours=4)).strftime("%Y-%m-%d %H:%M:%S"),
                     240, 160.0, 0.0, 160.0, PAYMENT_PAID, PAYMENT_UPI, "UPI-REF-7721"),
                    ("TKT-20260926-001", "DL09DD5555", "B06", TYPE_BIKE, "Deepak Joshi", "9850505050",
                     (now - timedelta(days=3, hours=5)).strftime("%Y-%m-%d %H:%M:%S"),
                     (now - timedelta(days=3, hours=1)).strftime("%Y-%m-%d %H:%M:%S"),
                     240, 80.0, 0.0, 80.0, PAYMENT_PAID, PAYMENT_CASH, "CASH-1123"),
                    ("TKT-20260925-001", "CH01VIP01", "A01", TYPE_VIP, "Jaspreet Bumrah", "9860606060",
                     (now - timedelta(days=4, hours=6)).strftime("%Y-%m-%d %H:%M:%S"),
                     (now - timedelta(days=4, hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
                     240, 240.0, 0.0, 240.0, PAYMENT_PAID, PAYMENT_CARD, "CARD-TXN-9090"),
                ]

                for row in hist_data:
                    t_id, v_num, slot_num, v_type, owner, phone, en_t, ex_t, dur, p_fee, ev_fee, tot, p_stat, p_mth, tx_id = row
                    cursor.execute("""
                    INSERT INTO parking_records (
                        ticket_id, vehicle_number, slot_number, vehicle_type,
                        owner_name, owner_phone, entry_time, exit_time,
                        duration_minutes, parking_fee, ev_fee, total_amount,
                        payment_status, payment_method, transaction_id, status, created_by
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed', 'staff')
                    """, (t_id, v_num, slot_num, v_type, owner, phone, en_t, ex_t, dur, p_fee, ev_fee, tot, p_stat, p_mth, tx_id))

                    cursor.execute("""
                    INSERT INTO payments (ticket_id, vehicle_number, payment_method, amount, payment_date, transaction_id, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'Success')
                    """, (t_id, v_num, p_mth, tot, ex_t, tx_id))

                # Seed Notifications
                cursor.execute("""
                INSERT INTO notifications (title, message, type)
                VALUES
                ('System Initialized', 'Smart Parking Slot Management System database initialized successfully.', 'success'),
                ('Slot C05 Inactive', 'Slot C05 has been marked under Maintenance for sensor testing.', 'warning'),
                ('EV Station Active', 'EV Charging Unit at Slot B01 currently dispensing power.', 'info');
                """)

            conn.commit()

    # --- User Authentication Queries ---

    def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Validate user credentials against database."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE username = ?;", (username,))
            user = cursor.fetchone()
            if not user:
                return None
            if verify_password(password, user["password_hash"], user["salt"]):
                return dict(user)
            return None

    def get_users(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, username, full_name, role, created_at FROM users ORDER BY id ASC;")
            return [dict(r) for r in cursor.fetchall()]

    def add_user(self, username: str, password: str, full_name: str, role: str) -> Tuple[bool, str]:
        try:
            pwd_hash, salt = hash_password(password)
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO users (username, password_hash, salt, full_name, role)
                VALUES (?, ?, ?, ?, ?)
                """, (username, pwd_hash, salt, full_name, role))
                conn.commit()
            return True, "User registered successfully."
        except sqlite3.IntegrityError:
            return False, "Username already exists."
        except Exception as e:
            return False, str(e)

    def delete_user(self, user_id: int) -> Tuple[bool, str]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM users WHERE id = ?;", (user_id,))
                conn.commit()
            return True, "User removed successfully."
        except Exception as e:
            return False, str(e)

    # --- Parking Slot Operations ---

    def get_all_slots(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM parking_slots ORDER BY slot_number ASC;")
            return [dict(r) for r in cursor.fetchall()]

    def get_slot_by_number(self, slot_number: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM parking_slots WHERE slot_number = ?;", (slot_number,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_slot_status(self, slot_number: str, new_status: str) -> bool:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE parking_slots SET status = ? WHERE slot_number = ?;", (new_status, slot_number))
            conn.commit()
            return cursor.rowcount > 0

    def add_slot(self, slot_number: str, slot_type: str, floor_level: str = "Ground", remarks: str = "") -> Tuple[bool, str]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO parking_slots (slot_number, slot_type, status, floor_level, remarks)
                VALUES (?, ?, 'Available', ?, ?)
                """, (slot_number.upper(), slot_type, floor_level, remarks))
                conn.commit()
            return True, f"Slot {slot_number.upper()} created."
        except sqlite3.IntegrityError:
            return False, f"Slot number {slot_number} already exists."
        except Exception as e:
            return False, str(e)

    def update_slot(self, slot_number: str, slot_type: str, status: str, floor_level: str, remarks: str) -> Tuple[bool, str]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                UPDATE parking_slots
                SET slot_type = ?, status = ?, floor_level = ?, remarks = ?
                WHERE slot_number = ?;
                """, (slot_type, status, floor_level, remarks, slot_number))
                conn.commit()
            return True, f"Slot {slot_number} updated."
        except Exception as e:
            return False, str(e)

    def delete_slot(self, slot_number: str) -> Tuple[bool, str]:
        try:
            slot = self.get_slot_by_number(slot_number)
            if not slot:
                return False, "Slot not found."
            if slot["status"] == STATUS_OCCUPIED:
                return False, "Cannot delete an occupied parking slot. Exit vehicle first."
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM parking_slots WHERE slot_number = ?;", (slot_number,))
                conn.commit()
            return True, f"Slot {slot_number} deleted."
        except Exception as e:
            return False, str(e)

    # --- Slot Allocation Algorithm ---

    def allocate_slot_for_vehicle(self, vehicle_type: str) -> Optional[str]:
        """
        Finds the optimal available parking slot for the specified vehicle type.
        Prioritizes exact type match, followed by Car slots for general vehicles if needed.
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # 1. Exact match search
            cursor.execute("""
            SELECT slot_number FROM parking_slots
            WHERE slot_type = ? AND status = 'Available'
            ORDER BY slot_number ASC LIMIT 1;
            """, (vehicle_type,))
            row = cursor.fetchone()
            if row:
                return row[0]

            # 2. If Car slot requested and none available, no fallback.
            # If Accessible vehicle and no accessible slot, fallback to Car slot
            if vehicle_type == TYPE_ACCESSIBLE:
                cursor.execute("""
                SELECT slot_number FROM parking_slots
                WHERE slot_type = 'Car' AND status = 'Available'
                ORDER BY slot_number ASC LIMIT 1;
                """)
                fb_row = cursor.fetchone()
                if fb_row:
                    return fb_row[0]

            return None

    # --- Vehicle Records & Entry/Exit Operations ---

    def check_active_vehicle(self, vehicle_number: str) -> Optional[Dict[str, Any]]:
        """Check if vehicle is already parked inside the facility."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT * FROM parking_records
            WHERE vehicle_number = ? AND status = 'Active';
            """, (vehicle_number,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def insert_entry_record(
        self,
        ticket_id: str,
        vehicle_number: str,
        slot_number: str,
        vehicle_type: str,
        owner_name: str,
        owner_phone: str,
        created_by: str = "staff",
        color: str = "",
        remarks: str = ""
    ) -> Tuple[bool, str]:
        """Atomically record vehicle entry and mark slot as Occupied."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()

                # Verify slot is indeed available
                cursor.execute("SELECT status FROM parking_slots WHERE slot_number = ?;", (slot_number,))
                slot_row = cursor.fetchone()
                if not slot_row:
                    return False, f"Slot {slot_number} does not exist."
                if slot_row["status"] != STATUS_AVAILABLE:
                    return False, f"Slot {slot_number} is currently {slot_row['status']}."

                entry_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                # Insert Parking Record
                cursor.execute("""
                INSERT INTO parking_records (
                    ticket_id, vehicle_number, slot_number, vehicle_type,
                    owner_name, owner_phone, entry_time, payment_status, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', 'Active', ?)
                """, (ticket_id, vehicle_number, slot_number, vehicle_type,
                      owner_name, owner_phone, entry_time, created_by))

                # Mark slot as Occupied
                cursor.execute("UPDATE parking_slots SET status = 'Occupied' WHERE slot_number = ?;", (slot_number,))

                # Upsert vehicle directory
                cursor.execute("""
                INSERT INTO vehicles (vehicle_number, vehicle_type, owner_name, owner_phone, color, remarks)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(vehicle_number) DO UPDATE SET
                    owner_name=excluded.owner_name,
                    owner_phone=excluded.owner_phone,
                    color=excluded.color,
                    remarks=excluded.remarks;
                """, (vehicle_number, vehicle_type, owner_name, owner_phone, color, remarks))

                conn.commit()
            return True, "Vehicle entry recorded successfully."
        except Exception as e:
            return False, str(e)

    def get_record_by_ticket_or_plate(self, query: str) -> Optional[Dict[str, Any]]:
        """Search active record by ticket_id or vehicle_number."""
        clean_q = query.strip().upper()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT * FROM parking_records
            WHERE (ticket_id = ? OR vehicle_number = ?) AND status = 'Active'
            LIMIT 1;
            """, (clean_q, clean_q))
            row = cursor.fetchone()
            if row:
                return dict(row)

            # Check completed records if not found in active
            cursor.execute("""
            SELECT * FROM parking_records
            WHERE ticket_id = ? OR vehicle_number = ?
            ORDER BY id DESC LIMIT 1;
            """, (clean_q, clean_q))
            row = cursor.fetchone()
            return dict(row) if row else None

    def complete_exit_record(
        self,
        ticket_id: str,
        exit_time: str,
        duration_minutes: int,
        parking_fee: float,
        ev_fee: float,
        total_amount: float,
        payment_method: str,
        transaction_id: str
    ) -> Tuple[bool, str]:
        """Atomically complete vehicle exit, free parking slot, and log payment."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()

                # Get record
                cursor.execute("SELECT * FROM parking_records WHERE ticket_id = ? AND status = 'Active';", (ticket_id,))
                rec = cursor.fetchone()
                if not rec:
                    return False, "Active ticket record not found or already completed."

                slot_num = rec["slot_number"]
                vehicle_num = rec["vehicle_number"]

                # Update record
                cursor.execute("""
                UPDATE parking_records
                SET exit_time = ?,
                    duration_minutes = ?,
                    parking_fee = ?,
                    ev_fee = ?,
                    total_amount = ?,
                    payment_status = 'Paid',
                    payment_method = ?,
                    transaction_id = ?,
                    status = 'Completed'
                WHERE ticket_id = ?;
                """, (exit_time, duration_minutes, parking_fee, ev_fee, total_amount,
                      payment_method, transaction_id, ticket_id))

                # Free the slot
                cursor.execute("UPDATE parking_slots SET status = 'Available' WHERE slot_number = ?;", (slot_num,))

                # Record Payment
                cursor.execute("""
                INSERT INTO payments (ticket_id, vehicle_number, payment_method, amount, payment_date, transaction_id, status)
                VALUES (?, ?, ?, ?, ?, ?, 'Success');
                """, (ticket_id, vehicle_num, payment_method, total_amount, exit_time, transaction_id))

                # Complete any active EV charging session for this ticket
                cursor.execute("""
                UPDATE ev_charging
                SET status = 'Completed', end_time = ?
                WHERE ticket_id = ? AND status = 'Charging';
                """, (exit_time, ticket_id))

                conn.commit()
            return True, "Vehicle exit processed successfully."
        except Exception as e:
            return False, str(e)

    # --- EV Charging Module ---

    def start_ev_charging(self, slot_number: str, vehicle_number: str, ticket_id: Optional[str] = None) -> Tuple[bool, str]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                start_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cursor.execute("""
                INSERT INTO ev_charging (ticket_id, slot_number, vehicle_number, start_time, units_kwh, rate_per_kwh, total_charging_fee, status)
                VALUES (?, ?, ?, ?, 0.0, ?, 0.0, 'Charging');
                """, (ticket_id, slot_number, vehicle_number, start_time, EV_CHARGING_RATE_PER_KWH))
                conn.commit()
            return True, "EV charging session started."
        except Exception as e:
            return False, str(e)

    def stop_ev_charging(self, charging_id: int, units_kwh: float) -> Tuple[bool, str]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM ev_charging WHERE id = ?;", (charging_id,))
                sess = cursor.fetchone()
                if not sess:
                    return False, "EV charging session not found."

                end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                rate = sess["rate_per_kwh"]
                total_fee = round(units_kwh * rate, 2)

                cursor.execute("""
                UPDATE ev_charging
                SET end_time = ?, units_kwh = ?, total_charging_fee = ?, status = 'Completed'
                WHERE id = ?;
                """, (end_time, units_kwh, total_fee, charging_id))

                # If tied to a ticket, update ev_fee in parking_records
                if sess["ticket_id"]:
                    cursor.execute("""
                    UPDATE parking_records
                    SET ev_fee = ?
                    WHERE ticket_id = ?;
                    """, (total_fee, sess["ticket_id"]))

                conn.commit()
            return True, f"Charging session stopped. Total: ₹{total_fee:.2f}"
        except Exception as e:
            return False, str(e)

    def get_ev_sessions(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM ev_charging ORDER BY id DESC;")
            return [dict(r) for r in cursor.fetchall()]

    # --- Reservations Module ---

    def create_reservation(
        self,
        vehicle_number: str,
        owner_name: str,
        phone: str,
        vehicle_type: str,
        slot_number: str,
        res_date: str,
        start_time: str,
        end_time: str
    ) -> Tuple[bool, str]:
        """Reserve slot preventing double booking."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()

                # Verify slot exists
                cursor.execute("SELECT * FROM parking_slots WHERE slot_number = ?;", (slot_number,))
                slot = cursor.fetchone()
                if not slot:
                    return False, f"Slot {slot_number} does not exist."

                # Check conflict
                cursor.execute("""
                SELECT * FROM reservations
                WHERE slot_number = ? AND reservation_date = ? AND status = 'Confirmed'
                AND NOT (end_time <= ? OR start_time >= ?);
                """, (slot_number, res_date, start_time, end_time))
                conflict = cursor.fetchone()
                if conflict:
                    return False, f"Slot {slot_number} is already booked on {res_date} from {conflict['start_time']} to {conflict['end_time']}."

                import random
                res_code = f"RES-{random.randint(1000, 9999)}"

                cursor.execute("""
                INSERT INTO reservations (
                    reservation_code, vehicle_number, owner_name, phone_number,
                    vehicle_type, slot_number, reservation_date, start_time, end_time, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
                """, (res_code, vehicle_number, owner_name, phone, vehicle_type, slot_number, res_date, start_time, end_time))

                # Mark slot as Reserved if for today
                today_str = datetime.now().strftime("%Y-%m-%d")
                if res_date == today_str:
                    cursor.execute("UPDATE parking_slots SET status = 'Reserved' WHERE slot_number = ? AND status = 'Available';", (slot_number,))

                conn.commit()
            return True, f"Reservation confirmed! Code: {res_code}"
        except Exception as e:
            return False, str(e)

    def cancel_reservation(self, res_code: str) -> Tuple[bool, str]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT slot_number FROM reservations WHERE reservation_code = ?;", (res_code,))
                row = cursor.fetchone()
                if not row:
                    return False, "Reservation not found."
                slot_num = row[0]

                cursor.execute("UPDATE reservations SET status = 'Cancelled' WHERE reservation_code = ?;", (res_code,))
                # Revert slot status if no other active reservation today
                cursor.execute("""
                SELECT COUNT(*) FROM reservations
                WHERE slot_number = ? AND status = 'Confirmed';
                """, (slot_num,))
                if cursor.fetchone()[0] == 0:
                    cursor.execute("UPDATE parking_slots SET status = 'Available' WHERE slot_number = ? AND status = 'Reserved';", (slot_num,))

                conn.commit()
            return True, "Reservation cancelled."
        except Exception as e:
            return False, str(e)

    def get_reservations(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM reservations ORDER BY reservation_date DESC, start_time ASC;")
            return [dict(r) for r in cursor.fetchall()]

    # --- Rates Configuration ---

    def get_rates(self) -> Dict[str, Dict[str, float]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT vehicle_type, hourly_rate, daily_max FROM rates;")
            return {r["vehicle_type"]: {"hourly_rate": r["hourly_rate"], "daily_max": r["daily_max"]} for r in cursor.fetchall()}

    def update_rate(self, vehicle_type: str, hourly_rate: float, daily_max: float) -> Tuple[bool, str]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO rates (vehicle_type, hourly_rate, daily_max, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(vehicle_type) DO UPDATE SET
                    hourly_rate=excluded.hourly_rate,
                    daily_max=excluded.daily_max,
                    updated_at=CURRENT_TIMESTAMP;
                """, (vehicle_type, hourly_rate, daily_max))
                conn.commit()
            return True, f"Rate for {vehicle_type} updated successfully."
        except Exception as e:
            return False, str(e)

    # --- Analytics & Dashboard Aggregates ---

    def get_dashboard_summary(self) -> Dict[str, Any]:
        """Aggregate all real-time stats for the GUI Dashboard."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Slots Breakdown
            cursor.execute("SELECT status, COUNT(*) as cnt FROM parking_slots GROUP BY status;")
            status_counts = {r["status"]: r["cnt"] for r in cursor.fetchall()}
            total_slots = sum(status_counts.values()) or 30
            available_slots = status_counts.get(STATUS_AVAILABLE, 0)
            occupied_slots = status_counts.get(STATUS_OCCUPIED, 0)
            reserved_slots = status_counts.get(STATUS_RESERVED, 0)
            maintenance_slots = status_counts.get(STATUS_MAINTENANCE, 0)

            occupancy_pct = round((occupied_slots / total_slots) * 100, 1) if total_slots > 0 else 0.0

            # Today's Dates
            today_start = datetime.now().strftime("%Y-%m-%d 00:00:00")
            today_end = datetime.now().strftime("%Y-%m-%d 23:59:59")

            # Today's Entries
            cursor.execute("SELECT COUNT(*) FROM parking_records WHERE entry_time >= ? AND entry_time <= ?;", (today_start, today_end))
            today_entries = cursor.fetchone()[0]

            # Today's Exits
            cursor.execute("SELECT COUNT(*) FROM parking_records WHERE exit_time >= ? AND exit_time <= ?;", (today_start, today_end))
            today_exits = cursor.fetchone()[0]

            # Today's Total Revenue
            cursor.execute("SELECT COALESCE(SUM(amount), 0.0) FROM payments WHERE payment_date >= ? AND payment_date <= ?;", (today_start, today_end))
            today_revenue = cursor.fetchone()[0]

            # Total vehicles currently parked inside
            cursor.execute("SELECT COUNT(*) FROM parking_records WHERE status = 'Active';")
            current_parked = cursor.fetchone()[0]

            return {
                "total_slots": total_slots,
                "available_slots": available_slots,
                "occupied_slots": occupied_slots,
                "reserved_slots": reserved_slots,
                "maintenance_slots": maintenance_slots,
                "current_parked": current_parked,
                "occupancy_percentage": occupancy_pct,
                "today_entries": today_entries,
                "today_exits": today_exits,
                "today_revenue": round(today_revenue, 2)
            }

    def get_parking_history(self, filter_period: str = "all", search_query: str = "") -> List[Dict[str, Any]]:
        """Query parking history with date and keyword filters."""
        query = "SELECT * FROM parking_records WHERE 1=1"
        params = []

        now = datetime.now()
        if filter_period == "today":
            query += " AND entry_time >= ?"
            params.append(now.strftime("%Y-%m-%d 00:00:00"))
        elif filter_period == "yesterday":
            yest = now - timedelta(days=1)
            query += " AND entry_time >= ? AND entry_time < ?"
            params.append(yest.strftime("%Y-%m-%d 00:00:00"))
            params.append(now.strftime("%Y-%m-%d 00:00:00"))
        elif filter_period == "week":
            week_ago = now - timedelta(days=7)
            query += " AND entry_time >= ?"
            params.append(week_ago.strftime("%Y-%m-%d 00:00:00"))
        elif filter_period == "month":
            month_ago = now - timedelta(days=30)
            query += " AND entry_time >= ?"
            params.append(month_ago.strftime("%Y-%m-%d 00:00:00"))

        if search_query:
            q = f"%{search_query.strip()}%"
            query += " AND (ticket_id LIKE ? OR vehicle_number LIKE ? OR owner_name LIKE ? OR owner_phone LIKE ? OR slot_number LIKE ?)"
            params.extend([q, q, q, q, q])

        query += " ORDER BY id DESC LIMIT 100;"

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            return [dict(r) for r in cursor.fetchall()]

    def get_analytics_data(self) -> Dict[str, Any]:
        """Aggregate statistical data for Matplotlib charts and reports."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Vehicle Type Distribution
            cursor.execute("SELECT vehicle_type, COUNT(*) as cnt FROM parking_records GROUP BY vehicle_type;")
            type_distribution = {r["vehicle_type"]: r["cnt"] for r in cursor.fetchall()}

            # 2. Daily Revenue (Last 7 Days)
            cursor.execute("""
            SELECT DATE(payment_date) as pay_date, SUM(amount) as rev
            FROM payments
            GROUP BY DATE(payment_date)
            ORDER BY pay_date DESC LIMIT 7;
            """)
            daily_rev = {r["pay_date"]: round(r["rev"], 2) for r in cursor.fetchall()}

            # 3. Peak Parking Entry Hours
            cursor.execute("""
            SELECT strftime('%H', entry_time) as hr, COUNT(*) as cnt
            FROM parking_records
            GROUP BY hr
            ORDER BY hr ASC;
            """)
            peak_hours = {f"{int(r['hr']):02d}:00": r["cnt"] for r in cursor.fetchall() if r["hr"] is not None}

            # 4. Most Used Slots
            cursor.execute("""
            SELECT slot_number, COUNT(*) as cnt
            FROM parking_records
            GROUP BY slot_number
            ORDER BY cnt DESC LIMIT 6;
            """)
            top_slots = {r["slot_number"]: r["cnt"] for r in cursor.fetchall()}

            return {
                "type_distribution": type_distribution,
                "daily_revenue": daily_rev,
                "peak_hours": peak_hours,
                "top_slots": top_slots
            }

    def get_notifications(self, unread_only: bool = False) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if unread_only:
                cursor.execute("SELECT * FROM notifications WHERE is_read = 0 ORDER BY id DESC LIMIT 20;")
            else:
                cursor.execute("SELECT * FROM notifications ORDER BY id DESC LIMIT 30;")
            return [dict(r) for r in cursor.fetchall()]

    def add_notification(self, title: str, message: str, notif_type: str = "info") -> None:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO notifications (title, message, type)
            VALUES (?, ?, ?);
            """, (title, message, notif_type))
            conn.commit()
