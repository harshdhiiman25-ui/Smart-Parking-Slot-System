import React, { useState, useEffect } from 'react';
import { Reservation, ParkingSlot, VehicleType } from '../types';
import {
  Calendar,
  Clock,
  PlusCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  User,
  Car,
  Trash2,
  ArrowLeft
} from 'lucide-react';

interface ReservationsViewProps {
  reservations: Reservation[];
  slots: ParkingSlot[];
  onAddReservation: (res: Reservation) => void;
  onCancelReservation: (code: string) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  slots,
  onAddReservation,
  onCancelReservation,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [slotNumber, setSlotNumber] = useState(slots[0]?.slot_number || 'A02');
  const [resDate, setResDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [errorMsg, setErrorMsg] = useState('');

  // Support Escape key to close modal
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPlate = vehicleNumber.trim().toUpperCase().replace(/[\s\-]/g, '');
    if (!cleanPlate) {
      setErrorMsg('Please enter vehicle number.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg('Start time must precede end time.');
      return;
    }

    // Double booking check:
    const conflict = reservations.find(
      r =>
        r.slot_number === slotNumber &&
        r.reservation_date === resDate &&
        r.status === 'Confirmed' &&
        !(endTime <= r.start_time || startTime >= r.end_time)
    );

    if (conflict) {
      setErrorMsg(
        `Slot ${slotNumber} is already booked on ${resDate} between ${conflict.start_time} and ${conflict.end_time}!`
      );
      return;
    }

    const randCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRes: Reservation = {
      id: Date.now(),
      reservation_code: randCode,
      vehicle_number: cleanPlate,
      owner_name: ownerName.trim() || 'Reserved Guest',
      phone_number: phoneNumber.trim(),
      vehicle_type: vehicleType,
      slot_number: slotNumber,
      reservation_date: resDate,
      start_time: startTime,
      end_time: endTime,
      status: 'Confirmed'
    };

    onAddReservation(newRes);
    setShowModal(false);
    setVehicleNumber('');
    setOwnerName('');
    setPhoneNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Advance Slot Booking</span>
            </span>
            <span className="text-xs text-slate-400">Conflict-Free Scheduling Engine</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            Parking Slot Reservation Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Pre-book dedicated bays for VIP delegations, airport travelers, and special permits. Prevents double-booking conflicts automatically.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 shrink-0 flex items-center justify-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Reservations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="font-bold text-sm text-white mb-3">All Confirmed & Scheduled Bookings ({reservations.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Res. Code</th>
                <th className="py-2.5 px-3">Slot</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Time Window</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reservations.map(r => (
                <tr key={r.reservation_code} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-blue-400">{r.reservation_code}</td>
                  <td className="py-2.5 px-3 font-black text-amber-400">{r.slot_number}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{r.vehicle_number}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.vehicle_type}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">{r.owner_name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.phone_number || '--'}</td>
                  <td className="py-2.5 px-3">{r.reservation_date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-300">
                    {r.start_time} - {r.end_time}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'Confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {r.status === 'Confirmed' && (
                      <button
                        onClick={() => onCancelReservation(r.reservation_code)}
                        className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-600/30"
                        title="Cancel Booking"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reservation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={e => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in zoom-in-95">
            <div className="sticky top-0 z-10 shrink-0 flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-bold flex items-center space-x-1"
                  title="Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back</span>
                </button>
                <h3 className="font-bold text-sm text-white">Create Advance Slot Reservation</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {errorMsg && (
                <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Vehicle License Plate *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL04XY9000"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Owner Name</label>
                    <input
                      type="text"
                      placeholder="Guest Name"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Mobile</label>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Slot Choice</label>
                    <select
                      value={slotNumber}
                      onChange={e => setSlotNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                    >
                      {slots.map(s => (
                        <option key={s.slot_number} value={s.slot_number}>
                          {s.slot_number} ({s.slot_type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Category</label>
                    <select
                      value={vehicleType}
                      onChange={e => setVehicleType(e.target.value as VehicleType)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                    >
                      <option value="Car">Car</option>
                      <option value="VIP">VIP</option>
                      <option value="EV">EV</option>
                      <option value="Bike">Bike</option>
                      <option value="Accessible">Accessible</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">Reservation Date</label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={e => setResDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Start Time (24h)</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">End Time (24h)</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
                  >
                    Confirm Slot Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
