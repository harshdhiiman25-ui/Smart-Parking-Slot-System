"""
Smart Parking Slot Management System
Payment Manager Module
Handles payment processing, transaction IDs, payment methods (Cash, UPI, Card), and audit logs.
"""

import random
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from database import DatabaseManager
from config import PAYMENT_CASH, PAYMENT_UPI, PAYMENT_CARD, PAYMENT_METHODS

class PaymentManager:
    """Processes financial transactions and maintains the payment ledger."""

    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db = db_manager or DatabaseManager()

    def generate_transaction_reference(self, method: str) -> str:
        """Create a realistic payment transaction reference."""
        prefix = {
            PAYMENT_CASH: "CSH",
            PAYMENT_UPI: "UPI",
            PAYMENT_CARD: "CRD"
        }.get(method, "TXN")
        rand = random.randint(100000, 999999)
        return f"{prefix}-{datetime.now().strftime('%m%d%H%M')}-{rand}"

    def record_payment(
        self,
        ticket_id: str,
        vehicle_number: str,
        payment_method: str,
        amount: float
    ) -> Tuple[bool, str, str]:
        """Record completed payment in SQLite."""
        if payment_method not in PAYMENT_METHODS:
            return False, f"Invalid payment method. Allowed: {PAYMENT_METHODS}", ""

        if amount < 0:
            return False, "Payment amount cannot be negative.", ""

        tx_id = self.generate_transaction_reference(payment_method)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO payments (ticket_id, vehicle_number, payment_method, amount, payment_date, transaction_id, status)
                VALUES (?, ?, ?, ?, ?, ?, 'Success');
                """, (ticket_id, vehicle_number, payment_method, amount, now_str, tx_id))
                conn.commit()
            return True, "Payment recorded successfully.", tx_id
        except Exception as e:
            return False, str(e), ""

    def get_all_payments(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM payments ORDER BY id DESC LIMIT 200;")
            return [dict(r) for r in cursor.fetchall()]
