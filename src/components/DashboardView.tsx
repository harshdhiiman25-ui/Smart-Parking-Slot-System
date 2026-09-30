import React from 'react';
import {
  ParkingSlot,
  ParkingRecord,
  TariffRate,
  VehicleType
} from '../types';
import {
  Car,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  Zap,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { SlotMap } from './SlotMap';

interface DashboardViewProps {
  slots: ParkingSlot[];
  records: ParkingRecord[];
  rates: Record<string, TariffRate>;
  onOpenEntry: (slotNumber?: string, slotType?: VehicleType) => void;
  onOpenExit: (vehicleNumber?: string) => void;
  onToggleMaintenance: (slotNumber: string) => void;
  onRefreshData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  slots,
  records,
  rates,
  onOpenEntry,
  onOpenExit,
  onToggleMaintenance,
  onRefreshData,
}) => {
  // Aggregate Metrics
  const totalSlots = slots.length;
  const availableSlots = slots.filter(s => s.status === 'Available').length;
  const occupiedSlots = slots.filter(s => s.status === 'Occupied').length;
  const reservedSlots = slots.filter(s => s.status === 'Reserved').length;
  const maintenanceSlots = slots.filter(s => s.status === 'Maintenance').length;
  const occupancyPercentage = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  // Active parked vehicles
  const activeRecords = records.filter(r => r.status === 'Active');

  // Today's Revenue and counts (simulate based on today's records)
  const todayCompleted = records.filter(r => r.status === 'Completed');
  const todayRevenue = todayCompleted.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) + 470; // baseline seed + runtime
  const todayEntries = activeRecords.length + todayCompleted.length;
  const todayExits = todayCompleted.length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Automated Facility Online</span>
              </span>
              <span className="text-xs text-slate-400">Section A, B, C Operational</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-2">
              Smart Parking Real-Time Command Center
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Live automated vehicle slot allocation, sensor status monitoring, multi-tier tariff billing, and gate telemetry.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenEntry()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>🚗 Check-in Vehicle</span>
            </button>
            <button
              onClick={() => onOpenExit()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span>💳 Outward Billing</span>
            </button>
            <button
              onClick={onRefreshData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh Facility Sensors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Card 1: Total Slots */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>TOTAL SLOTS</span>
            <Car className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{totalSlots}</div>
          <div className="text-[10px] text-slate-400 mt-1">Ground + Level 1</div>
        </div>

        {/* Card 2: Available */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col justify-between shadow-sm bg-gradient-to-b from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>AVAILABLE</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">{availableSlots}</div>
          <div className="text-[10px] text-emerald-500/80 mt-1">Ready for Entry</div>
        </div>

        {/* Card 3: Occupied */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-3.5 flex flex-col justify-between shadow-sm bg-gradient-to-b from-rose-500/5 to-transparent">
          <div className="flex items-center justify-between text-rose-400 text-xs font-semibold">
            <span>OCCUPIED</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-400 font-mono">{occupiedSlots}</div>
          <div className="text-[10px] text-rose-500/80 mt-1">Vehicles Parked</div>
        </div>

        {/* Card 4: Reserved */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 flex flex-col justify-between shadow-sm bg-gradient-to-b from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>RESERVED</span>
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400 font-mono">{reservedSlots}</div>
          <div className="text-[10px] text-amber-500/80 mt-1">Pre-booked</div>
        </div>

        {/* Card 5: Occupancy % */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-purple-400 text-xs font-semibold">
            <span>OCCUPANCY</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-400 font-mono">{occupancyPercentage}%</div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${occupancyPercentage}%` }}></div>
          </div>
        </div>

        {/* Card 6: Today's Revenue */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>REVENUE</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-black text-emerald-400 font-mono">₹{todayRevenue}</div>
          <div className="text-[10px] text-slate-400 mt-1">Today's Collections</div>
        </div>

        {/* Card 7: Inward Entries */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-sky-400 text-xs font-semibold">
            <span>ENTRIES</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-sky-400 font-mono">{todayEntries}</div>
          <div className="text-[10px] text-slate-400 mt-1">Vehicles In</div>
        </div>

        {/* Card 8: Outward Exits */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-orange-400 text-xs font-semibold">
            <span>EXITS</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-orange-400 font-mono">{todayExits}</div>
          <div className="text-[10px] text-slate-400 mt-1">Vehicles Billed</div>
        </div>
      </div>

      {/* Main Interactive Slot Map */}
      <SlotMap
        slots={slots}
        records={records}
        onSelectSlotForEntry={onOpenEntry}
        onSelectVehicleForExit={onOpenExit}
        onToggleMaintenance={onToggleMaintenance}
      />

      {/* Active Parked Vehicles Quick Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <h2 className="font-bold text-sm text-slate-200">
              Currently Parked Vehicles Inside Facility ({activeRecords.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Click 'Outward Exit' on any vehicle to calculate bill
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Plate Number</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Bay</th>
                <th className="py-2.5 px-3">Owner Name</th>
                <th className="py-2.5 px-3">Check-in Time</th>
                <th className="py-2.5 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {activeRecords.map(rec => (
                <tr key={rec.ticket_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-blue-400 font-semibold">{rec.ticket_id}</td>
                  <td className="py-2 px-3 text-white font-bold">{rec.vehicle_number}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                      {rec.vehicle_type}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-amber-400">{rec.slot_number}</td>
                  <td className="py-2 px-3 font-sans text-slate-200">{rec.owner_name}</td>
                  <td className="py-2 px-3 text-slate-400">{rec.entry_time}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => onOpenExit(rec.vehicle_number)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                    >
                      Exit & Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
