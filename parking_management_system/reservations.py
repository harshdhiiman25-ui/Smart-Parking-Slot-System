"""
Smart Parking Slot Management System
Reservation Manager Module
Handles advanced slot reservations, conflict checks, and expiration management.
"""

from datetime import datetime, date
from typing import List, Dict, Any, Tuple, Optional
from database import DatabaseManager
from config import TYPE_CAR, SLOT_TYPES
from utils import validate_vehicle_number, validate_phone_number

class ReservationManager:
    """Manages slot booking schedules and checks availability conflicts."""

    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db = db_manager or DatabaseManager()

    def make_reservation(
        self,
        vehicle_number: str,
        owner_name: str,
        phone_number: str,
        vehicle_type: str,
        slot_number: str,
        reservation_date: str,
        start_time: str,
        end_time: str
    ) -> Tuple[bool, str]:
        # Validate inputs
        ok_v, clean_v = validate_vehicle_number(vehicle_number)
        if not ok_v:
            return False, clean_v

        ok_p, clean_p = validate_phone_number(phone_number)
        if not ok_p:
            return False, clean_p

        if vehicle_type not in SLOT_TYPES:
            return False, f"Invalid vehicle type: {vehicle_type}"

        # Validate date format (YYYY-MM-DD)
        try:
            r_date = datetime.strptime(reservation_date, "%Y-%m-%d").date()
            if r_date < date.today():
                return False, "Reservation date cannot be in the past."
        except ValueError:
            return False, "Reservation date must be formatted as YYYY-MM-DD."

        # Validate time format (HH:MM)
        try:
            t_start = datetime.strptime(start_time, "%H:%M").time()
            t_end = datetime.strptime(end_time, "%H:%M").time()
            if t_start >= t_end:
                return False, "Start time must precede end time."
        except ValueError:
            return False, "Times must be in 24-hour HH:MM format (e.g. 14:00)."

        return self.db.create_reservation(
            vehicle_number=clean_v,
            owner_name=owner_name.strip() or "Reserved Guest",
            phone_number=clean_p,
            vehicle_type=vehicle_type,
            slot_number=slot_number.upper().strip(),
            res_date=reservation_date,
            start_time=start_time,
            end_time=end_time
        )

    def cancel_reservation(self, reservation_code: str) -> Tuple[bool, str]:
        return self.db.cancel_reservation(reservation_code)

    def list_reservations(self) -> List[Dict[str, Any]]:
        return self.db.get_reservations()
