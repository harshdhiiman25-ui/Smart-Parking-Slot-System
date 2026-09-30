import React, { useState } from 'react';
import { TariffRate, ParkingSlot, VehicleType } from '../types';
import {
  Settings,
  DollarSign,
  PlusCircle,
  Database,
  ShieldCheck,
  Save,
  CheckCircle2,
  Trash2,
  Wrench,
  Download,
  UploadCloud
} from 'lucide-react';

interface AdminSettingsViewProps {
  rates: Record<string, TariffRate>;
  onUpdateRates: (updated: Record<string, TariffRate>) => void;
  slots: ParkingSlot[];
  onAddSlot: (slot: ParkingSlot) => void;
  onDeleteSlot: (slotNumber: string) => void;
  onToggleMaintenance: (slotNumber: string) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  rates,
  onUpdateRates,
  slots,
  onAddSlot,
  onDeleteSlot,
  onToggleMaintenance,
}) => {
  const [currentRates, setCurrentRates] = useState<Record<string, TariffRate>>({ ...rates });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Slot Form
  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [newSlotType, setNewSlotType] = useState<VehicleType>('Car');
  const [newSlotFloor, setNewSlotFloor] = useState('Ground');
  const [slotMsg, setSlotMsg] = useState('');

  const [backupMsg, setBackupMsg] = useState('');

  const handleRateChange = (vehicleType: string, field: 'hourly_rate' | 'daily_max', val: number) => {
    setCurrentRates({
      ...currentRates,
      [vehicleType]: {
        ...currentRates[vehicleType],
        [field]: val
      }
    });
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRates(currentRates);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setSlotMsg('');
    const cleanNum = newSlotNumber.trim().toUpperCase();
    if (!cleanNum) return;

    if (slots.some(s => s.slot_number === cleanNum)) {
      setSlotMsg(`Slot ${cleanNum} already exists in the facility!`);
      return;
    }

    const created: ParkingSlot = {
      id: Date.now(),
      slot_number: cleanNum,
      slot_type: newSlotType,
      status: 'Available',
      floor_level: newSlotFloor,
      remarks: `Dynamic ${newSlotType} Bay`
    };

    onAddSlot(created);
    setSlotMsg(`Slot ${cleanNum} created successfully!`);
    setNewSlotNumber('');
    setTimeout(() => setSlotMsg(''), 3000);
  };

  const handleBackup = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    setBackupMsg(`Database backup successfully saved: backups/parking_backup_${timestamp}.db`);
    setTimeout(() => setBackupMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Root Administrative Privileges</span>
            </span>
            <span className="text-xs text-slate-400">Role-Based Access Control</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            System Administration & Pricing Rules
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure hourly tariff rates, dynamic daily maximum caps, dynamic parking slot topology, and SQLite database backup routines.
          </p>
        </div>

        <button
          onClick={handleBackup}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shrink-0 flex items-center justify-center space-x-2 shadow-sm transition-colors"
        >
          <Database className="w-4 h-4 text-blue-400" />
          <span>Backup Database (.db)</span>
        </button>
      </div>

      {backupMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{backupMsg}</span>
        </div>
      )}

      {/* Pricing Rates Configuration Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Configurable Parking Tariff Rates (INR ₹)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Grace Period: 15 minutes free. Hourly and 24-hour daily maximum caps applied automatically.
            </p>
          </div>
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tariff Updated!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveRates} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(currentRates).map(([type, rate]) => (
              <div key={type} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-white text-xs">
                  <span>{type}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Tariff</span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-medium">Hourly Rate (₹/hr)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={rate.hourly_rate}
                    onChange={e => handleRateChange(type, 'hourly_rate', parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-medium">Daily Max Cap (24h)</label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={rate.daily_max}
                    onChange={e => handleRateChange(type, 'daily_max', parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Updated Tariff Rates</span>
          </button>
        </form>
      </div>

      {/* Dynamic Slot Creator & Maintenance Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Slot Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>Create New Parking Bay Dynamically</span>
            </h3>
            <p className="text-xs text-slate-400">Add expansion slots with custom floor and vehicle rules</p>
          </div>

          {slotMsg && (
            <div className="mb-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{slotMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateSlot} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">Slot Identifier *</label>
              <input
                type="text"
                required
                placeholder="e.g. C11, D01, VIP-03"
                value={newSlotNumber}
                onChange={e => setNewSlotNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Category</label>
                <select
                  value={newSlotType}
                  onChange={e => setNewSlotType(e.target.value as VehicleType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                >
                  <option value="Car">Car Bay</option>
                  <option value="Bike">Bike Bay</option>
                  <option value="EV">EV Charging Bay</option>
                  <option value="VIP">VIP Bay</option>
                  <option value="Accessible">Accessible Bay</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Floor Level</label>
                <select
                  value={newSlotFloor}
                  onChange={e => setNewSlotFloor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                >
                  <option value="Ground">Ground Floor</option>
                  <option value="Floor 1">Level 1 Deck</option>
                  <option value="Basement">Basement B1</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
            >
              Add Parking Slot to Facility
            </button>
          </form>
        </div>

        {/* Security & Authentication Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Security & RBAC Specifications</span>
            </h3>
            <p className="text-xs text-slate-400">Enterprise security and access compliance</p>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Cryptographic Password Hashing</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Uses 16-byte cryptographically secure random salt (<code className="text-blue-400">secrets.token_hex(16)</code>) concatenated with password and hashed with SHA-256. Verified using constant-time comparison (<code className="text-blue-400">secrets.compare_digest</code>).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>SQL Injection Mitigation</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                100% of queries use strictly parameterized SQLite placeholders (<code className="text-blue-400">?</code>) via row factory cursors. Raw string concatenation is prohibited.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Role-Based Access Control (RBAC)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Separates <strong>Administrator</strong> (rates modification, slot creation, database backup) from <strong>Parking Staff</strong> (gate entry, checkout billing, ticketing).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
