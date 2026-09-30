import React, { useState, useEffect } from 'react';
import { ParkingSlot, ParkingRecord, VehicleType } from '../types';
import {
  Car,
  Bike,
  Zap,
  Crown,
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Printer,
  X,
  Sparkles,
  PlusCircle,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VehicleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: ParkingSlot[];
  records: ParkingRecord[];
  onAddRecord: (newRecord: ParkingRecord) => void;
  onUpdateSlotStatus: (slotNumber: string, status: 'Occupied') => void;
  preselectedSlot?: string;
  defaultType?: VehicleType;
}

export const VehicleEntryModal: React.FC<VehicleEntryModalProps> = ({
  isOpen,
  onClose,
  slots,
  records,
  onAddRecord,
  onUpdateSlotStatus,
  preselectedSlot,
  defaultType = 'Car',
}) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(defaultType);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string>(preselectedSlot || 'AUTO');
  const [vehicleColor, setVehicleColor] = useState('');
  const [remarks, setRemarks] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [generatedTicket, setGeneratedTicket] = useState<ParkingRecord | null>(null);

  // Reset form and ticket state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setVehicleNumber('');
      setVehicleType(defaultType || 'Car');
      setOwnerName('');
      setOwnerPhone('');
      setSelectedSlot(preselectedSlot || 'AUTO');
      setVehicleColor('');
      setRemarks('');
      setErrorMsg('');
      setGeneratedTicket(null);
    }
  }, [isOpen, preselectedSlot, defaultType]);

  const handleModalClose = () => {
    setGeneratedTicket(null);
    setVehicleNumber('');
    setOwnerName('');
    setOwnerPhone('');
    setVehicleColor('');
    setRemarks('');
    setErrorMsg('');
    onClose();
  };

  const handleNewCheckIn = () => {
    setGeneratedTicket(null);
    setVehicleNumber('');
    setOwnerName('');
    setOwnerPhone('');
    setVehicleColor('');
    setRemarks('');
    setErrorMsg('');
    setSelectedSlot('AUTO');
  };

  // Support Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter available slots
  const availableSlots = slots.filter(s => s.status === 'Available');

  // Automatic Slot Allocation Algorithm
  const findOptimalSlot = (type: VehicleType): string | null => {
    // 1. Try exact slot match
    const exactSlot = availableSlots.find(s => s.slot_type === type);
    if (exactSlot) return exactSlot.slot_number;

    // 2. Fallbacks
    if (type === 'Accessible') {
      const carSlot = availableSlots.find(s => s.slot_type === 'Car');
      if (carSlot) return carSlot.slot_number;
    }

    if (type === 'VIP') {
      const carSlot = availableSlots.find(s => s.slot_type === 'Car');
      if (carSlot) return carSlot.slot_number;
    }

    // Standard Car slot fallback if available
    const generalSlot = availableSlots.find(s => s.slot_type === 'Car');
    if (generalSlot) return generalSlot.slot_number;

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanNum = vehicleNumber.trim().toUpperCase().replace(/[\s\-]/g, '');
    if (!cleanNum || cleanNum.length < 4) {
      setErrorMsg('Please enter a valid vehicle license plate number.');
      return;
    }

    // Check duplicate active vehicle
    const alreadyParked = records.find(r => r.vehicle_number === cleanNum && r.status === 'Active');
    if (alreadyParked) {
      setErrorMsg(`Vehicle ${cleanNum} is already parked at Slot ${alreadyParked.slot_number} (Ticket: ${alreadyParked.ticket_id})!`);
      return;
    }

    // Determine target slot
    let targetSlot = selectedSlot;
    if (targetSlot === 'AUTO') {
      const allocated = findOptimalSlot(vehicleType);
      if (!allocated) {
        setErrorMsg(`No available parking bays found for category '${vehicleType}'. Parking Full!`);
        return;
      }
      targetSlot = allocated;
    } else {
      const bay = slots.find(s => s.slot_number === targetSlot);
      if (!bay || bay.status !== 'Available') {
        setErrorMsg(`Selected slot ${targetSlot} is no longer available.`);
        return;
      }
      if (bay.slot_type === 'Accessible' && vehicleType !== 'Accessible') {
        setErrorMsg(`Slot ${targetSlot} is reserved strictly for Accessible/Disabled vehicles.`);
        return;
      }
    }

    // Generate unique Ticket ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(100 + Math.random() * 900);
    const ticketId = `TKT-${dateStr}-${randPart}`;

    const now = new Date();
    const formattedTime = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');

    const newRecord: ParkingRecord = {
      id: Date.now(),
      ticket_id: ticketId,
      vehicle_number: cleanNum,
      slot_number: targetSlot,
      vehicle_type: vehicleType,
      owner_name: ownerName.trim() || 'Visitor Guest',
      owner_phone: ownerPhone.trim() || '',
      entry_time: formattedTime,
      parking_fee: 0,
      ev_fee: vehicleType === 'EV' ? 0 : 0,
      total_amount: 0,
      payment_status: 'Pending',
      status: 'Active',
      created_by: 'staff',
      color: vehicleColor,
      remarks: remarks
    };

    onAddRecord(newRecord);
    onUpdateSlotStatus(targetSlot, 'Occupied');
    setGeneratedTicket(newRecord);

    // Confetti burst
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-20 shrink-0 flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => {
                if (generatedTicket) {
                  setGeneratedTicket(null);
                } else {
                  handleModalClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 flex items-center space-x-1.5 text-xs font-bold transition-all shadow-sm"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back</span>
            </button>
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Vehicle Inward Gate Entry</h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">Automated bay assignment & gate pass creation</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {generatedTicket ? (
            /* Ticket Confirmation View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 relative">
                <div className="absolute top-3 right-3">
                  <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-950" />
                  </div>
                </div>

                <div className="text-center font-bold text-sm text-blue-400 border-b border-dashed border-slate-700 pb-2 mb-3">
                  SMART PARKING ENTRY PASS
                </div>

                <div className="space-y-1.5 pr-16">
                  <div>
                    <span className="text-slate-500">TICKET: </span>
                    <strong className="text-white">{generatedTicket.ticket_id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">PLATE: </span>
                    <strong className="text-amber-400 text-sm">{generatedTicket.vehicle_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">CATEGORY: </span>
                    <span>{generatedTicket.vehicle_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">ASSIGNED BAY: </span>
                    <strong className="text-emerald-400 text-base">{generatedTicket.slot_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">TIME: </span>
                    <span>{generatedTicket.entry_time}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">GUEST: </span>
                    <span>{generatedTicket.owner_name}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-dashed border-slate-700 text-center text-[10px] text-slate-500">
                  Keep ticket safely • First 15 min free grace period • Powered by Smart Parking System
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleNewCheckIn}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>🚗 Check-in Another Vehicle (New Gate Pass)</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setGeneratedTicket(null)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center space-x-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Gate Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
                  >
                    Done / Boom Barrier Opened
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Vehicle Entry Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Vehicle License Plate *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL01AB1234, MH12DE1432, CAR-101"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold tracking-wider placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Vehicle Category *
                  </label>
                  <select
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Car">🚗 Car (Sedan / SUV)</option>
                    <option value="Bike">🏍️ Bike (Two-Wheeler)</option>
                    <option value="EV">⚡ EV (Electric Vehicle)</option>
                    <option value="VIP">👑 VIP Reserved</option>
                    <option value="Accessible">♿ Accessible / Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Slot Assignment *
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={e => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="AUTO">⚡ Auto-Allocate Nearest Bay</option>
                    {availableSlots.map(s => (
                      <option key={s.slot_number} value={s.slot_number}>
                        {s.slot_number} ({s.slot_type} - {s.floor_level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Owner Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Malhotra"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={ownerPhone}
                    onChange={e => setOwnerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Vehicle Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Silver, White, Black"
                    value={vehicleColor}
                    onChange={e => setVehicleColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Remarks / Gate Note
                  </label>
                  <input
                    type="text"
                    placeholder="Optional gate notes"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Issue Parking Pass & Open Boom Barrier</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sticky Bottom Bar */}
        <div className="sticky bottom-0 z-20 shrink-0 bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>← Return to Dashboard</span>
          </button>
          <span className="text-[11px] text-slate-500 font-mono">Press Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
