import React, { useState } from 'react';
import { EVSession, ParkingSlot, ParkingRecord } from '../types';
import {
  Zap,
  BatteryCharging,
  Clock,
  Play,
  Square,
  AlertCircle,
  CheckCircle2,
  Plug,
  Gauge
} from 'lucide-react';

interface EVChargingViewProps {
  evSessions: EVSession[];
  slots: ParkingSlot[];
  records: ParkingRecord[];
  onStartSession: (slotNumber: string, vehicleNumber: string) => void;
  onStopSession: (sessionId: number, units: number) => void;
}

export const EVChargingView: React.FC<EVChargingViewProps> = ({
  evSessions,
  slots,
  records,
  onStartSession,
  onStopSession,
}) => {
  const evSlots = slots.filter(s => s.slot_type === 'EV');
  const [targetSlot, setTargetSlot] = useState(evSlots[0]?.slot_number || 'B01');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [stopUnits, setStopUnits] = useState<Record<number, number>>({ 1: 18.5 });

  const activeSessions = evSessions.filter(s => s.status === 'Charging');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate) return;
    onStartSession(targetSlot, vehiclePlate.toUpperCase());
    setVehiclePlate('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-900/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Smart EV Grid Station</span>
              </span>
              <span className="text-xs text-slate-400">Tariff: ₹9.50 / kWh</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-2">
              Electric Vehicle Charging Telemetry
            </h1>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              High-speed 60kW DC Fast Chargers and Type-2 AC chargers with automated energy metering and ticket billing synchronization.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-700/60 rounded-xl p-3">
            <Gauge className="w-8 h-8 text-sky-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Total Energy Dispensed</div>
              <div className="text-lg font-bold text-white font-mono">148.5 kWh</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charging Ports Bay Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {evSlots.map(slot => {
          const activeSession = evSessions.find(
            s => s.slot_number === slot.slot_number && s.status === 'Charging'
          );

          return (
            <div
              key={slot.slot_number}
              className={`rounded-2xl border p-5 transition-all shadow-lg flex flex-col justify-between ${
                activeSession
                  ? 'bg-sky-950/40 border-sky-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold font-mono">
                      {slot.slot_number}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Port {slot.slot_number}</h3>
                      <span className="text-[11px] text-slate-400">{slot.remarks || 'Fast DC Charger'}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      activeSession
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {activeSession ? 'Dispensing' : 'Port Idle'}
                  </span>
                </div>

                {activeSession ? (
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vehicle:</span>
                      <strong className="text-amber-400 font-mono text-sm">{activeSession.vehicle_number}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Started:</span>
                      <span className="text-slate-300 font-mono">{activeSession.start_time.slice(11)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Power:</span>
                      <strong className="text-sky-300 font-mono">{activeSession.units_kwh} kWh</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Accrued Cost:</span>
                      <strong className="text-emerald-400 font-mono">₹{activeSession.total_charging_fee.toFixed(2)}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-1">
                    <Plug className="w-5 h-5 text-slate-600 mb-1" />
                    <span>Gun ready for docking</span>
                    <span className="text-[10px] text-slate-600">Rate: ₹9.50/kWh</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60">
                {activeSession ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Final Units (kWh)"
                        defaultValue={activeSession.units_kwh || 15}
                        onChange={e =>
                          setStopUnits({ ...stopUnits, [activeSession.id]: parseFloat(e.target.value) || 15 })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                      />
                      <button
                        onClick={() =>
                          onStopSession(activeSession.id, stopUnits[activeSession.id] || activeSession.units_kwh || 15)
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 flex items-center space-x-1"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTargetSlot(slot.slot_number);
                      const activeParkedAtSlot = records.find(
                        r => r.slot_number === slot.slot_number && r.status === 'Active'
                      );
                      if (activeParkedAtSlot) {
                        setVehiclePlate(activeParkedAtSlot.vehicle_number);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-sky-400" />
                    <span>Initialize Charging Port</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Quick Session Launcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="font-bold text-sm text-white mb-3 flex items-center space-x-2">
          <BatteryCharging className="w-4 h-4 text-sky-400" />
          <span>Launch Manual EV Charging Session</span>
        </h3>
        <form onSubmit={handleStart} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              required
              placeholder="Vehicle Plate (e.g. DL08CY5521)"
              value={vehiclePlate}
              onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="w-44">
            <select
              value={targetSlot}
              onChange={e => setTargetSlot(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              {evSlots.map(s => (
                <option key={s.slot_number} value={s.slot_number}>
                  Port {s.slot_number}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 shrink-0 flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Connect & Start Dispensing</span>
          </button>
        </form>
      </div>

      {/* EV Charging History Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="font-bold text-sm text-white mb-3">All EV Charging Logs & Metervalues</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Session ID</th>
                <th className="py-2.5 px-3">Port</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Start Time</th>
                <th className="py-2.5 px-3">Units (kWh)</th>
                <th className="py-2.5 px-3">Dispenser Fee</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {evSessions.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-sky-400">EV-00{s.id}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{s.slot_number}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-300">{s.vehicle_number}</td>
                  <td className="py-2.5 px-3 text-slate-400">{s.start_time}</td>
                  <td className="py-2.5 px-3 font-bold">{s.units_kwh.toFixed(1)} kWh</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">₹{s.total_charging_fee.toFixed(2)}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'Charging'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {s.status}
                    </span>
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
