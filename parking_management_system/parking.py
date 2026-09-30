"""
Smart Parking Slot Management System
Parking Slot & Parking Operations Module
Implements ParkingSlot model and ParkingManager for vehicle entry, exit, fee calculation, and automated allocation.
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

from database import DatabaseManager
from config import (
    STATUS_AVAILABLE,
    STATUS_OCCUPIED,
    STATUS_RESERVED,
    STATUS_MAINTENANCE,
    TYPE_CAR,
    TYPE_BIKE,
    TYPE_EV,
    TYPE_VIP,
    TYPE_ACCESSIBLE,
    SLOT_TYPES,
    GRACE_PERIOD_MINUTES,
    PAYMENT_CASH
)
from utils import (
    generate_ticket_id,
    calculate_duration,
    calculate_parking_fee,
    validate_vehicle_number,
    validate_phone_number
)

class ParkingSlot:
    """Represents a physical parking bay in the facility."""

    def __init__(
        self,
        slot_number: str,
        slot_type: str = TYPE_CAR,
        status: str = STATUS_AVAILABLE,
        floor_level: str = "Ground",
        remarks: str = ""
    ):
        self.slot_number = slot_number.upper().strip()
        self.slot_type = slot_type
        self.status = status
        self.floor_level = floor_level
        self.remarks = remarks

    def is_available(self) -> bool:
        return self.status == STATUS_AVAILABLE

    def to_dict(self) -> Dict[str, Any]:
        return {
            "slot_number": self.slot_number,
            "slot_type": self.slot_type,
            "status": self.status,
            "floor_level": self.floor_level,
            "remarks": self.remarks
        }

    def __repr__(self) -> str:
        return f"<Slot {self.slot_number} [{self.slot_type}] - {self.status}>"


class ParkingManager:
    """High-level manager orchestrating slot allocation, vehicle check-in, check-out, and billing."""

    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db = db_manager or DatabaseManager()

    def get_all_slots(self) -> List[Dict[str, Any]]:
        """Return all parking slots with their current status."""
        return self.db.get_all_slots()

    def get_slot(self, slot_number: str) -> Optional[Dict[str, Any]]:
        """Get slot details by slot number."""
        return self.db.get_slot_by_number(slot_number)

    def allocate_slot(self, vehicle_type: str) -> Optional[str]:
        """Find the best available slot for the vehicle type."""
        return self.db.allocate_slot_for_vehicle(vehicle_type)

    def check_in_vehicle(
        self,
        vehicle_number: str,
        vehicle_type: str,
        owner_name: str,
        owner_phone: str = "",
        slot_number: Optional[str] = None,
        color: str = "",
        remarks: str = "",
        created_by: str = "staff"
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Processes a vehicle entry:
        1. Validates vehicle number and phone.
        2. Ensures vehicle is not already parked inside.
        3. Assigns slot (auto-allocates if not provided).
        4. Validates special rules (Accessible/VIP).
        5. Generates unique Ticket ID and stores record.
        """
        # Validate vehicle number
        is_valid_v, clean_v = validate_vehicle_number(vehicle_number)
        if not is_valid_v:
            return False, clean_v, None

        # Validate phone if provided
        is_valid_p, clean_p = validate_phone_number(owner_phone)
        if not is_valid_p:
            return False, clean_p, None

        # Check duplicate active vehicle
        existing = self.db.check_active_vehicle(clean_v)
        if existing:
            return False, f"Vehicle {clean_v} is already parked at slot {existing['slot_number']} (Ticket: {existing['ticket_id']}).", None

        # Determine slot
        target_slot = slot_number
        if not target_slot:
            target_slot = self.allocate_slot(vehicle_type)
            if not target_slot:
                return False, f"No available parking slots found for vehicle type '{vehicle_type}'. Parking full!", None
        else:
            target_slot = target_slot.upper().strip()
            slot_info = self.db.get_slot_by_number(target_slot)
            if not slot_info:
                return False, f"Selected slot '{target_slot}' does not exist.", None
            if slot_info["status"] != STATUS_AVAILABLE:
                return False, f"Slot '{target_slot}' is currently {slot_info['status']}. Please select an available slot.", None

            # Check accessible rule
            if slot_info["slot_type"] == TYPE_ACCESSIBLE and vehicle_type != TYPE_ACCESSIBLE:
                return False, f"Slot {target_slot} is reserved strictly for Accessible/Disabled vehicles.", None

        # Generate ticket
        ticket_id = generate_ticket_id()
        success, msg = self.db.insert_entry_record(
            ticket_id=ticket_id,
            vehicle_number=clean_v,
            slot_number=target_slot,
            vehicle_type=vehicle_type,
            owner_name=owner_name or "Visitor",
            owner_phone=clean_p,
            created_by=created_by,
            color=color,
            remarks=remarks
        )

        if not success:
            return False, msg, None

        # Auto-start EV charging session if parked at an EV slot
        slot_data = self.db.get_slot_by_number(target_slot)
        if slot_data and slot_data.get("slot_type") == TYPE_EV:
            self.db.start_ev_charging(target_slot, clean_v, ticket_id)

        ticket_details = {
            "ticket_id": ticket_id,
            "vehicle_number": clean_v,
            "vehicle_type": vehicle_type,
            "slot_number": target_slot,
            "owner_name": owner_name or "Visitor",
            "owner_phone": clean_p,
            "entry_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "Active"
        }

        # Check occupancy alert
        summary = self.db.get_dashboard_summary()
        if summary["available_slots"] <= 3:
            self.db.add_notification(
                "Low Parking Capacity",
                f"Only {summary['available_slots']} parking slots remain available in the facility.",
                "warning"
            )

        return True, "Vehicle checked in successfully!", ticket_details

    def calculate_exit_bill(self, ticket_or_plate: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Calculates preliminary exit bill for a vehicle without closing the ticket.
        """
        record = self.db.get_record_by_ticket_or_plate(ticket_or_plate)
        if not record:
            return False, f"No active parking ticket found for '{ticket_or_plate}'.", None

        if record["status"] != "Active":
            return False, f"Ticket {record['ticket_id']} has already been completed.", None

        exit_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        total_mins, billable_hrs, human_dur = calculate_duration(record["entry_time"], exit_time)

        # Get configured rates
        rates_map = self.db.get_rates()
        hourly_rates = {k: v["hourly_rate"] for k, v in rates_map.items()}
        daily_caps = {k: v["daily_max"] for k, v in rates_map.items()}

        # Check if EV charging occurred
        ev_charge_addon = float(record.get("ev_fee", 0.0))
        # If active session exists, estimate EV units
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT units_kwh, rate_per_kwh, total_charging_fee FROM ev_charging WHERE ticket_id = ?;", (record["ticket_id"],))
            ev_row = cursor.fetchone()
            if ev_row:
                ev_charge_addon = float(ev_row["total_charging_fee"] or (ev_row["units_kwh"] * ev_row["rate_per_kwh"]))

        fee_calc = calculate_parking_fee(
            vehicle_type=record["vehicle_type"],
            total_minutes=total_mins,
            custom_hourly_rates=hourly_rates,
            custom_daily_max=daily_caps,
            grace_period_mins=GRACE_PERIOD_MINUTES,
            ev_addon_charge=ev_charge_addon
        )

        bill_info = {
            "ticket_id": record["ticket_id"],
            "vehicle_number": record["vehicle_number"],
            "owner_name": record["owner_name"],
            "owner_phone": record["owner_phone"],
            "vehicle_type": record["vehicle_type"],
            "slot_number": record["slot_number"],
            "entry_time": record["entry_time"],
            "exit_time": exit_time,
            "duration_str": human_dur,
            "duration_minutes": total_mins,
            "billable_hours": fee_calc["billable_hours"],
            "hourly_rate": fee_calc["hourly_rate"],
            "is_grace": fee_calc["is_grace"],
            "parking_fee": fee_calc["base_parking_fee"],
            "ev_fee": fee_calc["ev_addon_charge"],
            "total_amount": fee_calc["total_amount"]
        }

        return True, "Bill calculated successfully.", bill_info

    def check_out_vehicle(
        self,
        ticket_or_plate: str,
        payment_method: str = PAYMENT_CASH,
        transaction_id: str = ""
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Completes vehicle exit:
        Calculates final bill, releases the parking slot, commits payment, and returns receipt data.
        """
        ok, msg, bill = self.calculate_exit_bill(ticket_or_plate)
        if not ok or not bill:
            return False, msg, None

        import random
        tx_id = transaction_id.strip() or f"TXN-{random.randint(100000, 999999)}"

        success, err = self.db.complete_exit_record(
            ticket_id=bill["ticket_id"],
            exit_time=bill["exit_time"],
            duration_minutes=bill["duration_minutes"],
            parking_fee=bill["parking_fee"],
            ev_fee=bill["ev_fee"],
            total_amount=bill["total_amount"],
            payment_method=payment_method,
            transaction_id=tx_id
        )

        if not success:
            return False, err, None

        bill["payment_method"] = payment_method
        bill["transaction_id"] = tx_id
        bill["payment_status"] = "Paid"

        return True, "Vehicle exit and billing completed successfully!", bill
