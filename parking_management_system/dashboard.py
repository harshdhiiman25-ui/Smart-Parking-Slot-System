"""
Smart Parking Slot Management System
Dashboard UI Module (Tkinter)
Implements top metric statistic cards, live clock, and interactive visual parking bay layout.
"""

from datetime import datetime
from typing import Optional, Callable, Dict, Any

try:
    import tkinter as tk
    from tkinter import ttk, messagebox
    HAS_TKINTER = True
except ImportError:
    HAS_TKINTER = False
    # Mock fallback classes for headless validation
    class tk:
        class Frame: pass
        class Label: pass
        class Button: pass
    class ttk:
        class Frame: pass
        class Label: pass
        class Button: pass

from config import (
    STATUS_AVAILABLE,
    STATUS_OCCUPIED,
    STATUS_RESERVED,
    STATUS_MAINTENANCE,
    TYPE_EV,
    TYPE_VIP,
    TYPE_ACCESSIBLE,
    STATUS_COLORS,
    TYPE_COLORS
)

class DashboardView:
    """Dashboard Frame displaying live metrics and visual slot grid."""

    def __init__(self, parent, db_manager, on_slot_click: Optional[Callable] = None):
        self.parent = parent
        self.db = db_manager
        self.on_slot_click = on_slot_click
        self.slot_buttons: Dict[str, Any] = {}

        if HAS_TKINTER:
            self.frame = ttk.Frame(parent)
            self.build_ui()
        else:
            self.frame = None

    def build_ui(self):
        # Header with Real-Time Clock
        header_frame = tk.Frame(self.frame, bg="#ffffff", bd=1, relief="solid")
        header_frame.pack(fill="x", padx=15, pady=(15, 10))

        title_lbl = tk.Label(
            header_frame,
            text="🅿️ Smart Parking Command Dashboard",
            font=("Helvetica", 16, "bold"),
            bg="#ffffff",
            fg="#0f172a"
        )
        title_lbl.pack(side="left", padx=15, pady=12)

        self.clock_lbl = tk.Label(
            header_frame,
            text="",
            font=("Consolas", 12, "bold"),
            bg="#ffffff",
            fg="#2563eb"
        )
        self.clock_lbl.pack(side="right", padx=15, pady=12)
        self.update_clock()

        # Metrics Card Row
        self.cards_frame = tk.Frame(self.frame, bg="#f8fafc")
        self.cards_frame.pack(fill="x", padx=15, pady=5)
        self.render_stat_cards()

        # Visual Parking Slot Map Frame
        map_container = tk.LabelFrame(
            self.frame,
            text="📍 Real-Time Parking Slot Map Layout",
            font=("Helvetica", 12, "bold"),
            bg="#ffffff",
            fg="#0f172a",
            padx=15,
            pady=15
        )
        map_container.pack(fill="both", expand=True, padx=15, pady=10)

        # Entrance Banner
        ent_lbl = tk.Label(
            map_container,
            text="⬇️ FACILITY ENTRANCE / BOOM BARRIER ⬇️",
            font=("Helvetica", 10, "bold"),
            bg="#dcfce7",
            fg="#15803d",
            pady=4
        )
        ent_lbl.pack(fill="x", pady=(0, 10))

        # Grid of Slots
        self.grid_frame = tk.Frame(map_container, bg="#ffffff")
        self.grid_frame.pack(fill="both", expand=True, pady=5)
        self.render_slot_grid()

        # Exit Banner
        exit_lbl = tk.Label(
            map_container,
            text="⬆️ FACILITY EXIT & BILLING COUNTER ⬆️",
            font=("Helvetica", 10, "bold"),
            bg="#fee2e2",
            fg="#b91c1c",
            pady=4
        )
        exit_lbl.pack(fill="x", pady=(10, 0))

        # Color Legend Footer
        legend_frame = tk.Frame(map_container, bg="#ffffff")
        legend_frame.pack(fill="x", pady=(12, 0))

        legends = [
            ("Available", "#22c55e", "#ffffff"),
            ("Occupied", "#ef4444", "#ffffff"),
            ("Reserved", "#eab308", "#000000"),
            ("EV Station", "#3b82f6", "#ffffff"),
            ("VIP Slot", "#a855f7", "#ffffff"),
            ("Accessible", "#06b6d4", "#ffffff"),
            ("Maintenance", "#6b7280", "#ffffff"),
        ]

        for text, bg, fg in legends:
            box = tk.Label(legend_frame, text=f"  {text}  ", bg=bg, fg=fg, font=("Helvetica", 9, "bold"), padx=6, pady=2)
            box.pack(side="left", padx=5)

    def update_clock(self):
        if not HAS_TKINTER or not hasattr(self, 'clock_lbl'):
            return
        now_str = datetime.now().strftime("%A, %d %b %Y | %H:%M:%S")
        self.clock_lbl.config(text=now_str)
        self.parent.after(1000, self.update_clock)

    def render_stat_cards(self):
        # Clear existing
        for child in self.cards_frame.winfo_children():
            child.destroy()

        summary = self.db.get_dashboard_summary()

        card_data = [
            ("TOTAL SLOTS", str(summary["total_slots"]), "#3b82f6", "🅿️"),
            ("AVAILABLE", str(summary["available_slots"]), "#22c55e", "✅"),
            ("OCCUPIED", str(summary["occupied_slots"]), "#ef4444", "🚗"),
            ("RESERVED", str(summary["reserved_slots"]), "#eab308", "📅"),
            ("OCCUPANCY", f"{summary['occupancy_percentage']}%", "#8b5cf6", "📊"),
            ("TODAY'S REVENUE", f"₹{summary['today_revenue']:,.0f}", "#059669", "💰"),
            ("TODAY ENTRIES", str(summary["today_entries"]), "#0ea5e9", "📥"),
            ("TODAY EXITS", str(summary["today_exits"]), "#f97316", "📤"),
        ]

        for i, (label, val, color, icon) in enumerate(card_data):
            c_box = tk.Frame(self.cards_frame, bg="#ffffff", bd=1, relief="solid")
            c_box.grid(row=0, column=i, padx=5, pady=5, sticky="nsew")
            self.cards_frame.grid_columnconfigure(i, weight=1)

            t_lbl = tk.Label(c_box, text=f"{icon} {label}", font=("Helvetica", 8, "bold"), bg="#ffffff", fg="#64748b")
            t_lbl.pack(anchor="w", padx=10, pady=(8, 2))

            v_lbl = tk.Label(c_box, text=val, font=("Helvetica", 14, "bold"), bg="#ffffff", fg=color)
            v_lbl.pack(anchor="w", padx=10, pady=(0, 8))

    def render_slot_grid(self):
        for child in self.grid_frame.winfo_children():
            child.destroy()

        slots = self.db.get_all_slots()
        slots_by_number = {s["slot_number"]: s for s in slots}

        # Render rows: Section A (Row 0), Section B (Row 1), Section C (Row 2)
        sections = [("A", "Section A (Car & VIP)"), ("B", "Section B (Bike & EV)"), ("C", "Section C (Floor 1)")]

        for row_idx, (sec_code, sec_name) in enumerate(sections):
            sec_lbl = tk.Label(self.grid_frame, text=sec_name, font=("Helvetica", 10, "bold"), bg="#ffffff", fg="#334155")
            sec_lbl.grid(row=row_idx*2, column=0, columnspan=10, sticky="w", pady=(8, 2))

            for col_idx in range(1, 11):
                slot_num = f"{sec_code}{col_idx:02d}"
                slot_info = slots_by_number.get(slot_num, {
                    "slot_number": slot_num,
                    "slot_type": "Car",
                    "status": STATUS_AVAILABLE
                })

                status = slot_info["status"]
                slot_type = slot_info["slot_type"]

                # Determine card color
                if status == STATUS_MAINTENANCE:
                    bg_color = "#6b7280"
                    fg_color = "#ffffff"
                elif status == STATUS_RESERVED:
                    bg_color = "#eab308"
                    fg_color = "#000000"
                elif status == STATUS_OCCUPIED:
                    bg_color = "#ef4444"
                    fg_color = "#ffffff"
                else: # Available
                    if slot_type == TYPE_EV:
                        bg_color = "#3b82f6"
                        fg_color = "#ffffff"
                    elif slot_type == TYPE_VIP:
                        bg_color = "#a855f7"
                        fg_color = "#ffffff"
                    elif slot_type == TYPE_ACCESSIBLE:
                        bg_color = "#06b6d4"
                        fg_color = "#ffffff"
                    else:
                        bg_color = "#22c55e"
                        fg_color = "#ffffff"

                btn_text = f"{slot_num}\n{slot_type}\n[{status[:3]}]"

                btn = tk.Button(
                    self.grid_frame,
                    text=btn_text,
                    font=("Helvetica", 9, "bold"),
                    bg=bg_color,
                    fg=fg_color,
                    width=8,
                    height=3,
                    relief="raised",
                    command=lambda s=slot_num: self.handle_slot_click(s)
                )
                btn.grid(row=row_idx*2 + 1, column=col_idx - 1, padx=4, pady=4, sticky="nsew")
                self.grid_frame.grid_columnconfigure(col_idx - 1, weight=1)
                self.slot_buttons[slot_num] = btn

    def handle_slot_click(self, slot_num: str):
        if self.on_slot_click:
            self.on_slot_click(slot_num)
        else:
            slot_info = self.db.get_slot_by_number(slot_num)
            if not slot_info:
                return

            msg = f"Slot: {slot_num}\nType: {slot_info['slot_type']}\nStatus: {slot_info['status']}\nLevel: {slot_info.get('floor_level', 'Ground')}"
            if slot_info["status"] == STATUS_OCCUPIED:
                with self.db.get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute("SELECT * FROM parking_records WHERE slot_number = ? AND status = 'Active';", (slot_num,))
                    rec = cursor.fetchone()
                    if rec:
                        msg += f"\n\nVehicle: {rec['vehicle_number']}\nOwner: {rec['owner_name']}\nCheck-in: {rec['entry_time']}\nTicket: {rec['ticket_id']}"

            if HAS_TKINTER:
                messagebox.showinfo(f"Parking Bay {slot_num} Details", msg)

    def refresh(self):
        """Reload all metrics and slot states from DB."""
        if HAS_TKINTER and self.frame:
            self.render_stat_cards()
            self.render_slot_grid()
