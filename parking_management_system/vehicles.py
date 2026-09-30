"""
Smart Parking Slot Management System
Vehicles Module
Defines Vehicle entity, type rules, validation, and data structures.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from utils import validate_vehicle_number, validate_phone_number
from config import TYPE_CAR, TYPE_BIKE, TYPE_EV, TYPE_VIP, TYPE_ACCESSIBLE, SLOT_TYPES

class Vehicle:
    """Represents a vehicle registered or parked in the facility."""

    def __init__(
        self,
        vehicle_number: str,
        vehicle_type: str = TYPE_CAR,
        owner_name: str = "Visitor",
        owner_phone: str = "",
        color: str = "",
        remarks: str = "",
        registered_at: Optional[str] = None
    ):
        is_valid, clean_num = validate_vehicle_number(vehicle_number)
        if not is_valid:
            raise ValueError(f"Invalid vehicle number: {vehicle_number}")

        if vehicle_type not in SLOT_TYPES:
            raise ValueError(f"Unknown vehicle type: {vehicle_type}. Allowed: {SLOT_TYPES}")

        self.vehicle_number = clean_num
        self.vehicle_type = vehicle_type
        self.owner_name = owner_name.strip() or "Visitor"
        self.owner_phone = owner_phone.strip()
        self.color = color.strip()
        self.remarks = remarks.strip()
        self.registered_at = registered_at or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def to_dict(self) -> Dict[str, Any]:
        """Convert Vehicle instance to dictionary representation."""
        return {
            "vehicle_number": self.vehicle_number,
            "vehicle_type": self.vehicle_type,
            "owner_name": self.owner_name,
            "owner_phone": self.owner_phone,
            "color": self.color,
            "remarks": self.remarks,
            "registered_at": self.registered_at
        }

    def __repr__(self) -> str:
        return f"<Vehicle {self.vehicle_number} ({self.vehicle_type}) Owner: {self.owner_name}>"
