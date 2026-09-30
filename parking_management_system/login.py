"""
Smart Parking Slot Management System
Login & Authentication Module
Implements user session management, password verification, and role-based access control.
"""

from typing import Optional, Dict, Any, Tuple
from database import DatabaseManager, verify_password, hash_password
from config import ROLE_ADMIN, ROLE_STAFF

class LoginManager:
    """Manages active user session, credential checks, and role enforcement."""

    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db = db_manager or DatabaseManager()
        self.current_user: Optional[Dict[str, Any]] = None

    def login(self, username: str, password: str) -> Tuple[bool, str]:
        """Authenticate user and establish session."""
        if not username or not password:
            return False, "Username and password cannot be empty."

        user = self.db.authenticate_user(username.strip(), password)
        if not user:
            return False, "Invalid username or password."

        self.current_user = {
            "id": user["id"],
            "username": user["username"],
            "full_name": user["full_name"],
            "role": user["role"]
        }
        return True, f"Welcome back, {user['full_name']} ({user['role'].capitalize()})!"

    def logout(self) -> None:
        """Clear the current user session."""
        self.current_user = None

    def is_authenticated(self) -> bool:
        """Check if any user is currently logged in."""
        return self.current_user is not None

    def is_admin(self) -> bool:
        """Check if logged in user holds admin privileges."""
        return self.is_authenticated() and self.current_user.get("role") == ROLE_ADMIN

    def get_current_user(self) -> Optional[Dict[str, Any]]:
        """Return details of logged in user."""
        return self.current_user

    def get_role(self) -> str:
        """Return active user role."""
        if not self.current_user:
            return "guest"
        return self.current_user.get("role", "staff")
