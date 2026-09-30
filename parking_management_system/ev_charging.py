"""
Smart Parking Slot Management System
EV Charging Manager Module
Handles electric vehicle charging stations, kWh power calculations, and combined billing.
"""

from typing import List, Dict, Any, Tuple, Optional
from database import DatabaseManager
from config import EV_CHARGING_RATE_PER_KWH

class EVChargingManager:
    """Manages EV charging ports, telemetry, and charging bills."""

    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db = db_manager or DatabaseManager()

    def start_session(self, slot_number: str, vehicle_number: str, ticket_id: Optional[str] = None) -> Tuple[bool, str]:
        return self.db.start_ev_charging(slot_number, vehicle_number, ticket_id)

    def stop_session(self, session_id: int, units_kwh: float) -> Tuple[bool, str]:
        if units_kwh < 0:
            return False, "Units consumed cannot be negative."
        return self.db.stop_ev_charging(session_id, units_kwh)

    def get_sessions(self) -> List[Dict[str, Any]]:
        return self.db.get_ev_sessions()

    def get_active_sessions(self) -> List[Dict[str, Any]]:
        sessions = self.db.get_ev_sessions()
        return [s for s in sessions if s.get("status") == "Charging"]
