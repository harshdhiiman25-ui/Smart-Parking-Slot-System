import React, { useState, useEffect } from 'react';
import {
  ParkingSlot,
  ParkingRecord,
  Reservation,
  EVSession,
  TariffRate,
  SystemNotification,
  UserSession,
  VehicleType
} from './types';
import {
  INITIAL_SLOTS,
  INITIAL_RECORDS,
  INITIAL_RATES,
  INITIAL_RESERVATIONS,
  INITIAL_EV_SESSIONS,
  INITIAL_NOTIFICATIONS
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { ArrowLeft } from 'lucide-react';
import { DashboardView } from './components/DashboardView';
import { VehicleEntryModal } from './components/VehicleEntryModal';
import { VehicleExitModal } from './components/VehicleExitModal';
import { EVChargingView } from './components/EVChargingView';
import { ReservationsView } from './components/ReservationsView';
import { ParkingHistoryView } from './components/ParkingHistoryView';
import { ReportsView } from './components/ReportsView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { PythonProjectStudio } from './components/PythonProjectStudio';
import { LoginPage } from './components/LoginPage';

// Load stored session if any
const getStoredSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem('smart_parking_auth');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
};

export default function App() {
  const [slots, setSlots] = useState<ParkingSlot[]>(INITIAL_SLOTS);
  const [records, setRecords] = useState<ParkingRecord[]>(INITIAL_RECORDS);
  const [rates, setRates] = useState<Record<string, TariffRate>>(INITIAL_RATES);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [evSessions, setEvSessions] = useState<EVSession[]>(INITIAL_EV_SESSIONS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    return getStoredSession() || {
      id: 1,
      username: 'admin',
      full_name: 'Administrator',
      role: 'admin',
      email: 'admin@smartparking.com'
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return getStoredSession() !== null;
  });

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('smart_parking_auth');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Modals state
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [preselectedSlot, setPreselectedSlot] = useState<string | undefined>(undefined);
  const [defaultVehicleType, setDefaultVehicleType] = useState<VehicleType>('Car');
  const [exitInitialQuery, setExitInitialQuery] = useState('');

  // Keyboard shortcut listener (Ctrl+E for Entry, Ctrl+X for Exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setEntryModalOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        setExitModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Handlers ---

  const handleOpenEntry = (slotNumber?: string, slotType?: VehicleType) => {
    setPreselectedSlot(slotNumber);
    if (slotType) setDefaultVehicleType(slotType);
    setEntryModalOpen(true);
  };

  const handleOpenExit = (vehicleNumber?: string) => {
    setExitInitialQuery(vehicleNumber || '');
    setExitModalOpen(true);
  };

  const handleAddRecord = (newRecord: ParkingRecord) => {
    setRecords([newRecord, ...records]);
    // Add notification
    const newNotif: SystemNotification = {
      id: Date.now(),
      title: 'Vehicle Inward Entry',
      message: `${newRecord.vehicle_number} checked into Slot ${newRecord.slot_number}. Ticket: ${newRecord.ticket_id}`,
      type: 'info',
      created_at: new Date().toLocaleTimeString(),
      is_read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleUpdateSlotStatus = (slotNumber: string, status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance') => {
    setSlots(prev =>
      prev.map(s => (s.slot_number === slotNumber ? { ...s, status } : s))
    );
  };

  const handleToggleMaintenance = (slotNumber: string) => {
    setSlots(prev =>
      prev.map(s => {
        if (s.slot_number === slotNumber) {
          const nextStatus = s.status === 'Maintenance' ? 'Available' : 'Maintenance';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleCompleteExit = (updatedRecord: ParkingRecord) => {
    setRecords(prev =>
      prev.map(r => (r.ticket_id === updatedRecord.ticket_id ? updatedRecord : r))
    );
    // Notification
    const newNotif: SystemNotification = {
      id: Date.now(),
      title: 'Vehicle Outward Exit',
      message: `${updatedRecord.vehicle_number} exited Slot ${updatedRecord.slot_number}. Total Billed: ₹${updatedRecord.total_amount.toFixed(2)}`,
      type: 'success',
      created_at: new Date().toLocaleTimeString(),
      is_read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleStartEVSession = (slotNumber: string, vehicleNumber: string) => {
    const newSession: EVSession = {
      id: Date.now(),
      slot_number: slotNumber,
      vehicle_number: vehicleNumber,
      start_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      units_kwh: 0,
      rate_per_kwh: 9.50,
      total_charging_fee: 0,
      status: 'Charging'
    };
    setEvSessions([newSession, ...evSessions]);
    handleUpdateSlotStatus(slotNumber, 'Occupied');
  };

  const handleStopEVSession = (sessionId: number, units: number) => {
    const fee = Math.round(units * 9.50 * 100) / 100;
    setEvSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? {
              ...s,
              end_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
              units_kwh: units,
              total_charging_fee: fee,
              status: 'Completed'
            }
          : s
      )
    );
  };

  const handleAddReservation = (res: Reservation) => {
    setReservations([res, ...reservations]);
    // If today, mark slot reserved
    const today = new Date().toISOString().slice(0, 10);
    if (res.reservation_date === today) {
      handleUpdateSlotStatus(res.slot_number, 'Reserved');
    }
  };

  const handleCancelReservation = (code: string) => {
    const res = reservations.find(r => r.reservation_code === code);
    if (res) {
      handleUpdateSlotStatus(res.slot_number, 'Available');
    }
    setReservations(prev =>
      prev.map(r => (r.reservation_code === code ? { ...r, status: 'Cancelled' } : r))
    );
  };

  const handleAddSlot = (newSlot: ParkingSlot) => {
    setSlots([...slots, newSlot]);
  };

  const handleDeleteSlot = (slotNumber: string) => {
    setSlots(slots.filter(s => s.slot_number !== slotNumber));
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        notifications={notifications}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Universal Back Navigation Bar across all pages */}
        {activeTab !== 'dashboard' && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:-translate-x-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Dashboard & Bay Map</span>
            </button>

            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <span className="hidden sm:inline">Current View:</span>
              <span className="capitalize px-3 py-1 rounded-lg bg-slate-800 text-blue-300 font-bold border border-slate-700">
                {activeTab === 'ev'
                  ? 'EV Charging Station'
                  : activeTab === 'exit'
                  ? 'Vehicle Outward Exit & Billing'
                  : activeTab === 'entry'
                  ? 'Vehicle Inward Entry'
                  : activeTab === 'history'
                  ? 'Parking History & Logs'
                  : activeTab === 'analytics'
                  ? 'Analytics & Reports'
                  : activeTab === 'admin'
                  ? 'Admin Settings & Tariff'
                  : activeTab}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            slots={slots}
            records={records}
            rates={rates}
            onOpenEntry={handleOpenEntry}
            onOpenExit={handleOpenExit}
            onToggleMaintenance={handleToggleMaintenance}
            onRefreshData={() => {
              // Simulated sensor refresh
              setSlots([...slots]);
            }}
          />
        )}

        {activeTab === 'entry' && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => handleOpenEntry()}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2"
            >
              <span>🚗 Open Vehicle Inward Gate Pass Dialog</span>
            </button>
            <div className="mt-6">
              <DashboardView
                slots={slots}
                records={records}
                rates={rates}
                onOpenEntry={handleOpenEntry}
                onOpenExit={handleOpenExit}
                onToggleMaintenance={handleToggleMaintenance}
                onRefreshData={() => setSlots([...slots])}
              />
            </div>
          </div>
        )}

        {activeTab === 'exit' && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => handleOpenExit()}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2"
            >
              <span>💳 Open Outward Checkout & Billing Dialog</span>
            </button>
            <div className="mt-6">
              <ParkingHistoryView records={records} onSelectExit={handleOpenExit} />
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <ReservationsView
            reservations={reservations}
            slots={slots}
            onAddReservation={handleAddReservation}
            onCancelReservation={handleCancelReservation}
          />
        )}

        {activeTab === 'ev' && (
          <EVChargingView
            evSessions={evSessions}
            slots={slots}
            records={records}
            onStartSession={handleStartEVSession}
            onStopSession={handleStopEVSession}
          />
        )}

        {activeTab === 'history' && (
          <ParkingHistoryView records={records} onSelectExit={handleOpenExit} />
        )}

        {activeTab === 'analytics' && (
          <ReportsView records={records} slots={slots} />
        )}

        {activeTab === 'admin' && (
          <AdminSettingsView
            rates={rates}
            onUpdateRates={setRates}
            slots={slots}
            onAddSlot={handleAddSlot}
            onDeleteSlot={handleDeleteSlot}
            onToggleMaintenance={handleToggleMaintenance}
          />
        )}

        {activeTab === 'python' && <PythonProjectStudio />}
      </main>

      {/* Vehicle Entry Modal */}
      <VehicleEntryModal
        isOpen={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        slots={slots}
        records={records}
        onAddRecord={handleAddRecord}
        onUpdateSlotStatus={handleUpdateSlotStatus}
        preselectedSlot={preselectedSlot}
        defaultType={defaultVehicleType}
      />

      {/* Vehicle Exit Modal */}
      <VehicleExitModal
        isOpen={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        records={records}
        slots={slots}
        rates={rates}
        onCompleteExit={handleCompleteExit}
        onUpdateSlotStatus={handleUpdateSlotStatus}
        initialQuery={exitInitialQuery}
      />
    </div>
  );
}
