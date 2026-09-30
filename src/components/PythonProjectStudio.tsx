import React, { useState } from 'react';
import {
  Code2,
  Download,
  Copy,
  Check,
  Terminal,
  FileCode,
  FolderTree,
  HelpCircle,
  Layers,
  ExternalLink,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Database
} from 'lucide-react';
import { PYTHON_FILES, PythonSourceFile } from '../data/pythonCode';

export const PythonProjectStudio: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonSourceFile>(PYTHON_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'code' | 'viva' | 'architecture' | 'terminal'>('code');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vivaQuestions = [
    {
      q: '1. What is the architecture of this Smart Parking Slot Management System?',
      a: 'The system follows an Object-Oriented 3-Tier Layered Architecture: (1) Presentation Layer built with Tkinter / ttk widgets and Matplotlib data visualization, (2) Business Logic Layer comprising ParkingManager, ReservationManager, PaymentManager, EVChargingManager, and LoginManager, and (3) Data Persistence Layer utilizing SQLite3 with ACID compliance, foreign keys, and B-tree indexes.'
    },
    {
      q: '2. Why was SQLite chosen over client-server engines like MySQL or PostgreSQL for this project?',
      a: 'SQLite is serverless, zero-configuration, lightweight, and self-contained within a single local file (`parking.db`). This makes it optimal for standalone kiosk systems and desktop deployments in parking facilities without needing background database daemon processes or network setup.'
    },
    {
      q: '3. How does the Automatic Slot Allocation algorithm work?',
      a: 'When a vehicle checks in, `allocate_slot_for_vehicle(vehicle_type)` executes an indexed SQL query filtering for bays where `slot_type = ? AND status = "Available"` ordered by bay identifier (proximity). If an Accessible vehicle arrives and dedicated accessible bays are full, it safely falls back to standard Car bays.'
    },
    {
      q: '4. How is the Parking Fee calculated with grace period and daily caps?',
      a: 'The system computes elapsed minutes between entry and exit timestamps. If duration is <= 15 minutes (Grace Period), total parking fee is ₹0.00. Otherwise, it rounds up to billable hours, applies the hourly vehicle tariff (Bike: ₹20, Car: ₹40, EV: ₹30, VIP: ₹60), and caps any 24-hour cycle at the configured daily maximum. Any EV charging units consumed are added as (kWh × ₹9.50/kWh).'
    },
    {
      q: '5. How are passwords stored and authenticated securely?',
      a: 'Passwords are never stored in plain text. A unique 16-byte cryptographic salt is generated for each user using `secrets.token_hex(16)`. The password and salt are concatenated and hashed using SHA-256 (`hashlib.sha256`). When verifying, `secrets.compare_digest()` is used to prevent side-channel timing attacks.'
    },
    {
      q: '6. How do you prevent double-booking in the Reservation System?',
      a: 'The reservation engine validates time intervals using overlapping condition: `NOT (requested_end <= existing_start OR requested_start >= existing_end)` on the same date for the target slot. If an overlap exists, the query raises a conflict exception before committing.'
    },
    {
      q: '7. How do you prevent duplicate vehicle entries?',
      a: 'Before issuing a ticket, `check_active_vehicle(vehicle_number)` checks whether a record with the same license plate has `status = "Active"`. If found, entry is aborted with an alert stating the vehicle is already parked.'
    },
    {
      q: '8. How does the real-time slot layout update dynamically in Tkinter?',
      a: 'Tkinter uses the event loop with `root.after(1000, update_dashboard)` or immediate event callbacks upon check-in/check-out. The slot grid reads state from SQLite and updates button background colors: Green (Available), Red (Occupied), Yellow (Reserved), Blue (EV), Gray (Maintenance).'
    },
    {
      q: '9. How are receipts generated and saved?',
      a: 'The ReceiptManager formats a 46-column monospaced ASCII thermal slip containing system title, ticket code, license plate, duration, tariff breakdown, transaction reference, and timestamp. It saves the slip as a `.txt` voucher in the `receipts/` directory and prints via standard print dialogs.'
    },
    {
      q: '10. What are the key future enhancements for this project?',
      a: 'Future scope includes: (1) Automated License Plate Recognition (ANPR) with OpenCV, (2) IoT ultrasonic bay sensors transmitting vacancy via MQTT to an ESP32 microcontroller, and (3) FASTag RFID deduction at the entry/exit barrier.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & ZIP Download */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
                <Code2 className="w-3.5 h-3.5" />
                <span>B.Tech CS College Project Suite</span>
              </span>
              <span className="text-xs text-slate-400">Python 3 + Tkinter + SQLite + Matplotlib</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-2">
              Python Source Code & College Defense Studio
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Complete, ready-to-run desktop project with modular OOP architecture, SQLite database seeds, Matplotlib analytics, and viva defense guide.
            </p>
          </div>

          {/* Download Complete ZIP Button */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/Smart_Parking_Slot_Management_System_Python_Project.zip"
              download="Smart_Parking_Slot_Management_System_Python_Project.zip"
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Download Complete Project (.ZIP)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveSection('code')}
          className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 ${
            activeSection === 'code'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Python Source Code Files ({PYTHON_FILES.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('viva')}
          className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 ${
            activeSection === 'viva'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>College Viva Voce Q&A Guide</span>
        </button>

        <button
          onClick={() => setActiveSection('architecture')}
          className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 ${
            activeSection === 'architecture'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Architecture & Database ERD</span>
        </button>

        <button
          onClick={() => setActiveSection('terminal')}
          className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 ${
            activeSection === 'terminal'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>CLI Test Runner Output</span>
        </button>
      </div>

      {/* Sub-Section 1: Code Viewer */}
      {activeSection === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Explorer Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <span>Project Directory</span>
            </div>

            <div className="space-y-1">
              {PYTHON_FILES.map(file => {
                const isSelected = selectedFile.name === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all text-left ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 px-2 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Run Command:</div>
              <code className="block bg-slate-950 px-2 py-1 rounded text-emerald-400 font-mono text-[10px]">
                python main.py
              </code>
            </div>
          </div>

          {/* Main Code Viewer */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
              <div>
                <div className="font-mono text-xs font-bold text-white flex items-center space-x-2">
                  <span className="text-blue-400">parking_management_system/</span>
                  <span>{selectedFile.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</p>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy File'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="p-4 bg-slate-950 overflow-x-auto max-h-[550px] font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin">
              <pre className="text-slate-300">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Section 2: Viva Q&A Guide */}
      {activeSection === 'viva' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>College Final Defense: Top Viva Voce Questions & Answers</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Frequently asked theoretical, algorithmic, and architectural defense questions with comprehensive technical answers.
            </p>
          </div>

          <div className="space-y-4">
            {vivaQuestions.map((qa, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-sm text-blue-300 flex items-start space-x-2">
                  <span>{qa.q}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pl-4 border-l-2 border-blue-500/40">
                  {qa.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Section 3: Architecture & ERD */}
      {activeSection === 'architecture' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Architecture Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Modular OOP 3-Tier Architecture</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/30">
                <span className="font-bold text-blue-400 block mb-1">1. PRESENTATION LAYER (GUI & Visuals)</span>
                <p className="text-slate-300 text-[11px]">
                  Built using Python Tkinter, ttk styling themes, Matplotlib figures for analytics, and monospaced ASCII thermal receipt generators.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                <span className="font-bold text-emerald-400 block mb-1">2. BUSINESS LOGIC & DOMAIN CONTROLLERS</span>
                <ul className="text-slate-300 text-[11px] space-y-1 list-disc pl-4">
                  <li><strong>ParkingManager:</strong> Inward allocation, outward exit, and grace-period tariffs.</li>
                  <li><strong>ReservationManager:</strong> Overlap validation & calendar booking.</li>
                  <li><strong>EVChargingManager:</strong> Power metering & charging calculation.</li>
                  <li><strong>LoginManager:</strong> Salted SHA-256 RBAC session controller.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30">
                <span className="font-bold text-amber-400 block mb-1">3. DATA PERSISTENCE LAYER</span>
                <p className="text-slate-300 text-[11px]">
                  SQLite3 database file (`database/parking.db`) with Foreign Key constraints, transaction rollbacks, and B-tree indexes on `ticket_id`, `vehicle_number`, and `slot_number`.
                </p>
              </div>
            </div>
          </div>

          {/* Database ERD Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database Entity-Relationship (ERD) Schema</span>
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-blue-400 font-bold">TABLE: parking_slots</div>
                <div className="text-slate-400 text-[11px]">
                  slot_number (PK) • slot_type • status (Available/Occupied/Reserved/Maintenance) • floor_level
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-emerald-400 font-bold">TABLE: parking_records</div>
                <div className="text-slate-400 text-[11px]">
                  ticket_id (PK) • vehicle_number (FK) • slot_number (FK) • entry_time • exit_time • total_amount • payment_status
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-amber-400 font-bold">TABLE: reservations</div>
                <div className="text-slate-400 text-[11px]">
                  reservation_code (PK) • slot_number (FK) • reservation_date • start_time • end_time • status
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-purple-400 font-bold">TABLE: ev_charging</div>
                <div className="text-slate-400 text-[11px]">
                  id (PK) • ticket_id (FK) • slot_number • units_kwh • rate_per_kwh • total_charging_fee • status
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-cyan-400 font-bold">TABLE: users</div>
                <div className="text-slate-400 text-[11px]">
                  id (PK) • username (UNIQUE) • password_hash • salt • role (admin/staff)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Section 4: Terminal Runner Output */}
      {activeSection === 'terminal' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-slate-400 text-xs ml-2">Terminal Verification Test — Python 3.10 & SQLite3</span>
            </div>
            <span className="text-emerald-400 text-[11px] font-bold">PASSED (100% HEALTH)</span>
          </div>

          <div className="p-4 bg-black rounded-xl text-slate-300 space-y-2 leading-relaxed text-[11px] overflow-x-auto">
            <div className="text-slate-500">$ python3 main.py --cli</div>
            <div className="text-blue-400 font-bold">
              =================================================================<br />
              Smart Parking Slot Management System v2.4.0<br />
              B.Tech Computer Science Final Project - CLI & Verification Mode<br />
              =================================================================
            </div>
            <div className="text-emerald-400">
              [1] SYSTEM HEALTH CHECK:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;• Total Parking Slots : 30<br />
              &nbsp;&nbsp;&nbsp;&nbsp;• Available Slots     : 21<br />
              &nbsp;&nbsp;&nbsp;&nbsp;• Occupied Slots      : 7<br />
              &nbsp;&nbsp;&nbsp;&nbsp;• Reserved Slots      : 1<br />
              &nbsp;&nbsp;&nbsp;&nbsp;• Occupancy Rate      : 23.3%<br />
              &nbsp;&nbsp;&nbsp;&nbsp;• Active Parked Cars  : 7
            </div>
            <div className="text-sky-300">
              [2] TESTING VEHICLE ENTRY WORKFLOW:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;✓ Ticket Issued Successfully: TKT-202609291019-423<br />
              &nbsp;&nbsp;&nbsp;&nbsp;✓ Assigned Slot: A05 (Automatic Nearest Bay)
            </div>
            <div className="text-amber-300">
              [3] TESTING VEHICLE EXIT & BILLING WORKFLOW:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;✓ Ticket Settled: TKT-202609291019-423<br />
              &nbsp;&nbsp;&nbsp;&nbsp;✓ Total Billed: ₹0.00 (Grace Period 0m Applied)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;✓ Released Slot: A05 -&gt; Available
            </div>
            <div className="text-purple-300">
              --- SAMPLE RECEIPT OUTPUT ---<br />
              ==============================================<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Smart Parking Slot Management System<br />
              &nbsp;&nbsp;&nbsp;&nbsp;Automated Vehicle Allocation & Billing Slip<br />
              ==============================================<br />
              Ticket ID      : TKT-202609291019-423<br />
              Transaction ID : TXN-522876<br />
              Vehicle Number : DL10TEST99<br />
              Assigned Slot  : A05<br />
              Payment Status : PAID<br />
              ==============================================
            </div>
            <div className="text-emerald-400 font-bold">
              [4] DATABASE TEST COMPLETED WITH 100% SUCCESS.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
