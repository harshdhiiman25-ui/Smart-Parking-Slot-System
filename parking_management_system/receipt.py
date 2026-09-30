"""
Smart Parking Slot Management System
Receipt Generator Module
Produces thermal-style ASCII receipts, printable HTML/PDF vouchers, and receipt files.
"""

from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Tuple
from config import APP_NAME, RECEIPTS_DIR
from utils import format_currency

class ReceiptManager:
    """Generates official parking receipts and billing statements."""

    @staticmethod
    def generate_ascii_receipt(data: Dict[str, Any]) -> str:
        """Create clean monospaced thermal slip receipt."""
        divider = "=" * 46
        sub_div = "-" * 46

        lines = [
            divider,
            f"{APP_NAME:^46}",
            "Automated Vehicle Allocation & Billing Slip",
            divider,
            f"Ticket ID      : {data.get('ticket_id', 'N/A')}",
            f"Transaction ID : {data.get('transaction_id', 'N/A')}",
            f"Date / Time    : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            sub_div,
            f"Vehicle Number : {data.get('vehicle_number', 'N/A')}",
            f"Vehicle Type   : {data.get('vehicle_type', 'N/A')}",
            f"Owner Name     : {data.get('owner_name', 'Visitor')}",
            f"Assigned Slot  : {data.get('slot_number', 'N/A')}",
            sub_div,
            f"Entry Time     : {data.get('entry_time', 'N/A')}",
            f"Exit Time      : {data.get('exit_time', 'N/A')}",
            f"Total Duration : {data.get('duration_str', 'N/A')} ({data.get('billable_hours', 1)} billable hrs)",
            f"Hourly Rate    : {format_currency(data.get('hourly_rate', 0.0))}/hr",
            sub_div,
            f"Parking Charge : {format_currency(data.get('parking_fee', 0.0))}",
        ]

        if data.get("ev_fee", 0.0) > 0:
            lines.append(f"EV Charge Fee  : {format_currency(data.get('ev_fee', 0.0))}")

        lines.extend([
            sub_div,
            f"TOTAL AMOUNT   : {format_currency(data.get('total_amount', 0.0)):>29}",
            f"Payment Method : {data.get('payment_method', 'Cash'):>29}",
            f"Payment Status : {'PAID':>29}",
            divider,
            " Thank you for parking with us! Drive Safe.",
            "    Powered by Smart Parking Slot System",
            divider
        ])

        return "\n".join(lines)

    @staticmethod
    def save_receipt_file(data: Dict[str, Any]) -> Tuple[bool, str]:
        """Save receipt to text file in receipts directory."""
        try:
            receipt_text = ReceiptManager.generate_ascii_receipt(data)
            ticket_id = data.get("ticket_id", f"RCP_{int(datetime.now().timestamp())}")
            filename = RECEIPTS_DIR / f"{ticket_id}.txt"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(receipt_text)
            return True, str(filename)
        except Exception as e:
            return False, str(e)
