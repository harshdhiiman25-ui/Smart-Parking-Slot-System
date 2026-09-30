# Smart Parking Slot Management System
### A Complete B.Tech Computer Science & Engineering Capstone Project
**Technology Stack:** Python 3, Tkinter GUI, SQLite3 Database, Matplotlib Analytics, OOP Architecture

---

## 📌 1. Project Overview & Abstract

The **Smart Parking Slot Management System** is an enterprise-grade desktop and analytical solution designed to automate vehicle tracking, dynamic slot allocation, multi-tariff fee calculation, electric vehicle (EV) charging telemetry, and advance reservations in commercial parking facilities, malls, tech parks, and airports.

Conventional parking systems rely on manual ticketing, causing traffic congestion, parking spot hoarding, manual billing errors, and revenue leakages. This project solves these issues through a visual interactive slot layout, automatic nearest-slot allocation algorithms, cryptographic user authentication, real-time metrics, and automated receipt generation.

---

## 🏗️ 2. Architectural Design & Class Hierarchy (OOP)

The application is structured into clean, modular Object-Oriented components:

| Class Name | Module | Responsibility |
| :--- | :--- | :--- |
| `DatabaseManager` | `database.py` | Connection pooling, schema creation, indexed queries, transactions, seed data. |
| `LoginManager` | `login.py` | Role-Based Access Control (RBAC), salted SHA-256 password hashing. |
| `ParkingSlot` | `parking.py` | Slot domain entity with status states (`Available`, `Occupied`, `Reserved`, `Maintenance`). |
| `Vehicle` | `vehicles.py` | Vehicle entity with license plate normalization and category classification. |
| `ParkingManager` | `parking.py` | Business logic for vehicle entry, auto-allocation, exit checkout, fee computation. |
| `ReservationManager`| `reservations.py` | Conflict-free reservation scheduler and double-booking prevention. |
| `PaymentManager` | `payments.py` | Cash, UPI QR, and Card transaction processing with unique reference IDs. |
| `EVChargingManager` | `ev_charging.py` | EV dispenser meter tracking (kWh consumed × tariff) + combined billing. |
| `ReportManager` | `reports.py` | Matplotlib statistical visualization (revenue trends, vehicle mix, peak hours). |
| `ReceiptManager` | `receipt.py` | Thermal slip and ASCII/HTML printable invoice generation. |
| `DashboardView` | `dashboard.py` | Tkinter visual parking bay map, summary cards, and live clock. |
| `ParkingApp` | `main.py` | Master GUI window, sidebar navigation, keyboard shortcuts, CLI mode. |

---

## 🗄️ 3. Database Schema (SQLite3)

The database utilizes foreign keys, constraints, and B-tree indexes for low-latency queries:

```sql
-- 1. Users Table (Authentication)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'staff')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Parking Slots Table (Bay Management)
CREATE TABLE parking_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_number TEXT UNIQUE NOT NULL,
    slot_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available' CHECK(status IN ('Available', 'Occupied', 'Reserved', 'Maintenance')),
    floor_level TEXT DEFAULT 'Ground',
    remarks TEXT DEFAULT ''
);

-- 3. Parking Records (Active & Historical Tickets)
CREATE TABLE parking_records (
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

-- 4. Reservations Table (Booking Engine)
CREATE TABLE reservations (
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

-- 5. EV Charging Stations
CREATE TABLE ev_charging (
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
```

---

## ⚡ 4. Core Algorithms

### A. Automated Slot Allocation
- Queries parking bays matching vehicle category (`Bike`, `Car`, `EV`, `VIP`, `Accessible`).
- Filters `status = 'Available'` ordered by bay proximity (e.g. `A01`, `A02`...).
- If an Accessible vehicle enters and dedicated Accessible bays are full, safely assigns standard Car bays.

### B. Dynamic Fee Calculation with Grace Period
- **Grace Period (15 Minutes):** Exits within 15 minutes are free (`₹0.00`).
- **Base Tariff:** First hour charged at vehicle hourly rate (Car: ₹40, Bike: ₹20, EV: ₹30, VIP: ₹60).
- **Pro-rata / Additional Hours:** Every additional hour billed up to the 24-hour daily cap.
- **EV Combined Surcharge:** Total = Parking Base Fee + (kWh Consumed × ₹9.50/kWh).

### C. Conflict-Free Reservation Logic
- Checks for overlapping intervals `NOT (end_time <= requested_start OR start_time >= requested_end)` on the same date for the requested slot.

---

## 🚀 5. How to Run the Application

### Prerequisites:
- Python 3.8+ installed on your computer.
- Standard libraries: `tkinter`, `sqlite3` (pre-installed with official Python installer).

### Step 1: Install Requirements
```bash
pip install -r requirements.txt
```

### Step 2: Launch the System
```bash
# Launch GUI Desktop Application:
python main.py

# Or run Headless CLI / Verification Diagnostic Mode:
python main.py --cli
```

### Default Credentials:
- **Administrator:** Username: `admin` | Password: `admin123`
- **Parking Staff:** Username: `staff` | Password: `staff123`

---

## 🎓 6. Top Viva Voce Questions & Answers (College Defense)

**Q1: Why did you choose SQLite over MySQL or PostgreSQL for this desktop project?**
> *Answer:* SQLite is a serverless, self-contained, ACID-compliant relational engine stored as a single file. It eliminates external database server overhead, enables instantaneous installation on client machines, and provides high transaction throughput for single-facility operations.

**Q2: How do you prevent SQL Injection attacks?**
> *Answer:* All database queries strictly use parameterized SQL statements (`?` placeholders) executed via `cursor.execute(query, params)`. Raw string concatenation or f-strings in queries are prohibited.

**Q3: How are passwords secured in the database?**
> *Answer:* Passwords are never stored in plain text. We generate a unique 16-byte cryptographic salt per user (`secrets.token_hex(16)`) and hash the concatenated string using `hashlib.sha256()`. Verification uses `secrets.compare_digest()` to prevent timing attacks.

**Q4: How does the visual slot map refresh in real time?**
> *Answer:* The Tkinter GUI leverages asynchronous event polling via `root.after(1000, callback)`. When a slot status updates in SQLite, the grid triggers a re-render mapping the new status color dynamically.

---

## 📈 7. Future Scope
1. Integration with OpenCV for Automatic Number Plate Recognition (ANPR).
2. IoT Ultrasonic/Infrared hardware sensors connected via ESP32/Arduino MQTT broker.
3. Automated FASTag RFID payment deduction at the exit boom barrier.
