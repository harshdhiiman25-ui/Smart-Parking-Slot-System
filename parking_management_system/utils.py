"""
Smart Parking Slot Management System
Utilities Module
Provides validation, date-time calculations, currency formatting, fee logic, and export utilities.
"""

import re
import math
import shutil
import csv
from datetime import datetime, timedelta
from typing import Tuple, Dict, Any, Optional

from config import (
    GRACE_PERIOD_MINUTES,
    DEFAULT_HOURLY_RATES,
    DEFAULT_DAILY_MAX_RATES,
    TYPE_CAR,
    BACKUP_DIR,
    DB_PATH
)

def format_currency(amount: float) -> str:
    """Format float into Indian Rupee representation."""
    return f"₹{amount:,.2f}"

def validate_vehicle_number(vehicle_number: str) -> Tuple[bool, str]:
    """
    Validate vehicle registration plate.
    Supports standard Indian plates (e.g. DL 01 AB 1234, MH12DE1432)
    as well as standard alphanumeric project formats (e.g. CAR-101, VIP-01).
    """
    if not vehicle_number or not isinstance(vehicle_number, str):
        return False, "Vehicle number cannot be empty."

    cleaned = re.sub(r'[\s\-]', '', vehicle_number).upper()

    if len(cleaned) < 4 or len(cleaned) > 15:
        return False, "Vehicle number must be between 4 and 15 alphanumeric characters."

    if not re.match(r'^[A-Z0-9]+$', cleaned):
        return False, "Vehicle number can only contain uppercase letters and numbers."

    return True, cleaned

def validate_phone_number(phone: str) -> Tuple[bool, str]:
    """Validate 10-digit mobile number."""
    if not phone:
        return True, ""  # Phone is optional in some entry flows
    cleaned = re.sub(r'[\s\-\+]', '', phone)
    if cleaned.startswith("91") and len(cleaned) == 12:
        cleaned = cleaned[2:]
    if re.match(r'^[6-9]\d{9}$', cleaned):
        return True, cleaned
    if re.match(r'^\d{10}$', cleaned):
        return True, cleaned
    return False, "Please enter a valid 10-digit mobile number."

def generate_ticket_id(prefix: str = "TKT") -> str:
    """Generate a unique sequential-style ticket code with timestamp and random digits."""
    import random
    now = datetime.now()
    date_part = now.strftime("%Y%m%d%H%M")
    rand_part = random.randint(100, 999)
    return f"{prefix}-{date_part}-{rand_part}"

def calculate_duration(entry_time_str: str, exit_time_str: Optional[str] = None) -> Tuple[int, int, str]:
    """
    Calculate hours, minutes, and formatted string from entry to exit time.
    Returns: (total_minutes, billable_hours, human_readable_duration)
    """
    date_formats = ["%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S"]
    entry_dt = None
    for fmt in date_formats:
        try:
            entry_dt = datetime.strptime(entry_time_str.split(".")[0], fmt)
            break
        except Exception:
            continue

    if not entry_dt:
        entry_dt = datetime.now()

    if exit_time_str:
        exit_dt = None
        for fmt in date_formats:
            try:
                exit_dt = datetime.strptime(exit_time_str.split(".")[0], fmt)
                break
            except Exception:
                continue
        if not exit_dt:
            exit_dt = datetime.now()
    else:
        exit_dt = datetime.now()

    delta = exit_dt - entry_dt
    total_seconds = max(0, int(delta.total_seconds()))
    total_minutes = math.ceil(total_seconds / 60)

    hours = total_minutes // 60
    mins = total_minutes % 60

    # Billable hours: ceiling of hours (e.g., 65 mins = 2 billable hours)
    billable_hours = math.ceil(total_minutes / 60) if total_minutes > 0 else 1

    human_str = f"{hours}h {mins}m" if hours > 0 else f"{mins}m"
    return total_minutes, billable_hours, human_str

def calculate_parking_fee(
    vehicle_type: str,
    total_minutes: int,
    custom_hourly_rates: Optional[Dict[str, float]] = None,
    custom_daily_max: Optional[Dict[str, float]] = None,
    grace_period_mins: int = GRACE_PERIOD_MINUTES,
    ev_addon_charge: float = 0.0
) -> Dict[str, Any]:
    """
    Calculate parking fee based on vehicle type, duration, grace period, and daily cap.
    Rule:
    - If total_minutes <= grace_period_mins: ₹0 (Grace Period Exemption)
    - If duration <= 60 mins: base rate for 1 hour
    - Additional hours billed at hourly rate
    - 24-hour cycle capped at daily maximum cap
    """
    rates = custom_hourly_rates or DEFAULT_HOURLY_RATES
    daily_caps = custom_daily_max or DEFAULT_DAILY_MAX_RATES

    hourly_rate = rates.get(vehicle_type, rates.get(TYPE_CAR, 40.0))
    daily_cap = daily_caps.get(vehicle_type, 300.0)

    is_grace = total_minutes <= grace_period_mins

    if is_grace:
        base_fee = 0.0
        billable_hours = 0
    else:
        billable_hours = max(1, math.ceil(total_minutes / 60))
        days = total_minutes // (24 * 60)
        remaining_mins = total_minutes % (24 * 60)
        remaining_hours = math.ceil(remaining_mins / 60) if remaining_mins > 0 else 0

        # Calculate capped fee per day
        days_fee = days * daily_cap
        day_rem_fee = min(remaining_hours * hourly_rate, daily_cap)
        base_fee = float(days_fee + day_rem_fee)

    total_amount = round(base_fee + ev_addon_charge, 2)

    return {
        "is_grace": is_grace,
        "total_minutes": total_minutes,
        "billable_hours": billable_hours,
        "hourly_rate": hourly_rate,
        "base_parking_fee": round(base_fee, 2),
        "ev_addon_charge": round(ev_addon_charge, 2),
        "total_amount": total_amount,
        "daily_cap": daily_cap
    }

def backup_database() -> Tuple[bool, str]:
    """Create a timestamped backup copy of parking.db in backups/ directory."""
    try:
        if not DB_PATH.exists():
            return False, "Database file does not exist yet."
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = BACKUP_DIR / f"parking_backup_{timestamp}.db"
        shutil.copy2(DB_PATH, backup_file)
        return True, str(backup_file)
    except Exception as e:
        return False, str(e)

def export_to_csv(data: list, fieldnames: list, file_path: str) -> Tuple[bool, str]:
    """Export arbitrary record list of dicts to CSV."""
    try:
        with open(file_path, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for row in data:
                writer.writerow(row)
        return True, file_path
    except Exception as e:
        return False, str(e)
