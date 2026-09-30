import React, { useState, useMemo, useEffect } from 'react';
import {
  ParkingSlot,
  ParkingRecord,
  SlotStatus,
  VehicleType
} from '../types';
import {
  Car,
  Bike,
  Zap,
  Crown,
  Accessibility,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Phone,
  Ticket,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  X,
  Filter,
  LayoutGrid,
  Columns
} from 'lucide-react';

interface SlotMapProps {
  slots: ParkingSlot[];
  records: ParkingRecord[];
  onSelectSlotForEntry: (slotNumber: string, slotType: VehicleType) => void;
  onSelectVehicleForExit: (vehicleNumber: string) => void;
  onToggleMaintenance: (slotNumber: string) => void;
}

export const SlotMap: React.FC<SlotMapProps> = ({
  slots,
  records,
  onSelectSlotForEntry,
  onSelectVehicleForExit,
  onToggleMaintenance,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | SlotStatus>('all');
  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'A' | 'B' | 'C'>('all');

  // Support Escape key to close slot inspector
  useEffect(() => {
    if (!selectedSlot) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSlot(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSlot]);

  // Active records lookup map
  const activeRecordMap = useMemo(() => {
    const map = new Map<string, ParkingRecord>();
    records.forEach(r => {
      if (r.status === 'Active') {
        map.set(r.slot_number, r);
      }
    });
    return map;
  }, [records]);

  // Group slots by section
  const sectionA = slots.filter(s => s.slot_number.startsWith('A'));
  const sectionB = slots.filter(s => s.slot_number.startsWith('B'));
  const sectionC = slots.filter(s => s.slot_number.startsWith('C'));

  // Helper icon for slot type
  const getTypeIcon = (type: VehicleType) => {
    switch (type) {
      case 'Bike': return <Bike className="w-3.5 h-3.5" />;
      case 'EV': return <Zap className="w-3.5 h-3.5" />;
      case 'VIP': return <Crown className="w-3.5 h-3.5" />;
      case 'Accessible': return <Accessibility className="w-3.5 h-3.5" />;
      default: return <Car className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (status: SlotStatus) => {
    switch (status) {
      case 'Occupied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Occupied
          </span>
        );
      case 'Reserved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Reserved
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Maint
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Available
          </span>
        );
    }
  };

  const getSlotCardBorder = (status: SlotStatus) => {
    switch (status) {
      case 'Occupied':
        return 'border-rose-500/40 hover:border-rose-500 bg-gradient-to-b from-rose-950/20 to-slate-900/90 shadow-sm hover:shadow-rose-500/10';
      case 'Reserved':
        return 'border-amber-500/40 hover:border-amber-500 bg-gradient-to-b from-amber-950/20 to-slate-900/90 shadow-sm hover:shadow-amber-500/10';
      case 'Maintenance':
        return 'border-slate-700/80 hover:border-slate-600 bg-slate-900/50 opacity-80';
      default:
        return 'border-slate-800 hover:border-emerald-500/60 bg-gradient-to-b from-slate-900 to-slate-900/95 shadow-sm hover:shadow-emerald-500/10';
    }
  };

  const renderSlotCard = (slot: ParkingSlot) => {
    const occupant = activeRecordMap.get(slot.slot_number);
    const borderClass = getSlotCardBorder(slot.status);
    const isFilteredOut = statusFilter !== 'all' && slot.status !== statusFilter;

    if (isFilteredOut) {
      return (
        <div
          key={slot.slot_number}
          className="p-3 rounded-xl border border-slate-800/40 bg-slate-950/40 opacity-25 flex flex-col justify-between text-left"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-xs text-slate-500">{slot.slot_number}</span>
            <span className="text-[10px] text-slate-600">{slot.status}</span>
          </div>
        </div>
      );
    }

    return (
      <button
        key={slot.slot_number}
        onClick={() => setSelectedSlot(slot)}
        className={`relative p-3 rounded-xl border flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group ${borderClass}`}
      >
        {/* Top Row: Slot ID + Status Pill */}
        <div className="flex items-center justify-between w-full gap-1.5 pb-2 border-b border-slate-800/60">
          <div className="flex items-center space-x-1.5">
            <span className="font-mono font-black text-sm text-white tracking-tight group-hover:text-blue-300 transition-colors">
              {slot.slot_number}
            </span>
            <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
              {getTypeIcon(slot.slot_type)}
            </span>
          </div>
          {getStatusBadge(slot.status)}
        </div>

        {/* Center Content */}
        <div className="py-2.5 min-h-[50px] flex flex-col justify-center">
          {occupant ? (
            <div className="space-y-1">
              <div className="inline-block px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700/80 font-mono font-bold text-xs text-amber-300 tracking-wider truncate max-w-full">
                {occupant.vehicle_number}
              </div>
              <div className="text-[11px] text-slate-300 truncate font-medium">
                {occupant.owner_name}
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1">
                <span>{slot.slot_type} Bay</span>
              </div>
              <div className="text-[11px] text-emerald-400/90 font-medium flex items-center space-x-1">
                <span>Ready to park</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono w-full">
          <span className="text-slate-400">{slot.floor_level}</span>
          <span className="text-slate-300">
            {occupant ? occupant.entry_time.slice(11, 16) : 'Empty'}
          </span>
        </div>
      </button>
    );
  };

  const activeOccupant = selectedSlot ? activeRecordMap.get(selectedSlot.slot_number) : undefined;

  return (
    <div className="space-y-4">
      {/* Visual Slot Layout Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        {/* Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Facility Real-Time Parking Deck</span>
            </h2>
            <span className="text-xs text-slate-400">({slots.length} Total Bays)</span>
          </div>

          {/* Section & Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Status Filter */}
            <span className="text-slate-400 text-[11px] mr-1 flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>
            {(['all', 'Available', 'Occupied', 'Reserved', 'Maintenance'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {st === 'all' ? 'All Bays' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Entrance Gate Indicator */}
        <div className="flex items-center justify-center space-x-2 py-2 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-5 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          <span>Facility Entrance & Automated Number Plate Recognition (ANPR Gate 1)</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </div>

        {/* Section A: Ground Floor VIP & Cars */}
        {(activeSectionTab === 'all' || activeSectionTab === 'A') && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                <span>Section A — Ground Floor (VIP & Premium Car Bays)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">10 Bays (A01 - A10)</span>
            </div>
            {/* 5 columns x 2 rows = spacious cards that never overflow */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {sectionA.map(renderSlotCard)}
            </div>
          </div>
        )}

        {/* Driveway Lane 1 */}
        <div className="py-2 my-5 border-y border-dashed border-amber-500/30 flex items-center justify-center text-[10px] font-mono text-amber-400/90 uppercase tracking-widest bg-slate-950/70 rounded-lg">
          ⮀ ⮀ Main Driveway — Ground Level Speed Limit 10 km/h ⮀ ⮀
        </div>

        {/* Section B: Ground Floor Bikes & EV */}
        {(activeSectionTab === 'all' || activeSectionTab === 'B') && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Section B — Ground Floor (Fast EV Chargers & Two-Wheeler Bays)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">10 Bays (B01 - B10)</span>
            </div>
            {/* 5 columns x 2 rows */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {sectionB.map(renderSlotCard)}
            </div>
          </div>
        )}

        {/* Driveway Lane 2 / Ramp */}
        <div className="py-2 my-5 border-y border-dashed border-sky-500/30 flex items-center justify-center text-[10px] font-mono text-sky-400/90 uppercase tracking-widest bg-slate-950/70 rounded-lg">
          ▲ ▲ Two-Way Ramp to Level 1 Parking Deck ▲ ▲
        </div>

        {/* Section C: Floor 1 Deck */}
        {(activeSectionTab === 'all' || activeSectionTab === 'C') && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                <span>Section C — Level 1 Parking Deck (Standard Sedans & Hatchbacks)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">10 Bays (C01 - C10)</span>
            </div>
            {/* 5 columns x 2 rows */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {sectionC.map(renderSlotCard)}
            </div>
          </div>
        )}

        {/* Exit Gate Indicator */}
        <div className="flex items-center justify-center space-x-2 py-2 px-4 bg-rose-500/10 border border-rose-500/20 rounded-xl mt-5 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Facility Exit & Automated Boom Barrier (Counter 1 & 2)</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </div>

        {/* Color Legend Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3.5 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 text-[11px]">Available</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="text-slate-300 text-[11px]">Occupied</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300 text-[11px]">Reserved</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Zap className="w-3 h-3 text-sky-400" />
            <span className="text-slate-300 text-[11px]">EV Fast Charger</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Crown className="w-3 h-3 text-purple-400" />
            <span className="text-slate-300 text-[11px]">VIP Bay</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Accessibility className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-300 text-[11px]">Accessible</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span className="text-slate-300 text-[11px]">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Selected Slot Inspector Modal */}
      {selectedSlot && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={e => {
            if (e.target === e.currentTarget) setSelectedSlot(null);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in zoom-in-95">
            {/* Header */}
            <div className="sticky top-0 z-10 shrink-0 flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-bold flex items-center space-x-1"
                  title="Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back</span>
                </button>
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold font-mono text-base">
                  {selectedSlot.slot_number}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    Slot {selectedSlot.slot_number} Inspector
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedSlot.floor_level} • {selectedSlot.slot_type} Bay
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {/* Current Status Badge */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400">Current Bay Status:</span>
                {getStatusBadge(selectedSlot.status)}
              </div>

              {/* If Occupied: Show Vehicle Details */}
              {activeOccupant ? (
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Car className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400">Vehicle Number:</span>
                    <span className="font-mono font-bold text-white text-sm">{activeOccupant.vehicle_number}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400">Owner Name:</span>
                    <span className="font-medium text-white">{activeOccupant.owner_name}</span>
                  </div>
                  {activeOccupant.owner_phone && (
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-mono text-slate-200">{activeOccupant.owner_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400">Check-in Time:</span>
                    <span className="font-mono text-slate-200">{activeOccupant.entry_time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Ticket className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400">Ticket ID:</span>
                    <span className="font-mono text-blue-300 font-semibold">{activeOccupant.ticket_id}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
                  This parking slot is currently empty and available for inward vehicle entry.
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-5 space-y-2">
                {selectedSlot.status === 'Available' && (
                  <button
                    onClick={() => {
                      const slotNum = selectedSlot.slot_number;
                      const slotType = selectedSlot.slot_type;
                      setSelectedSlot(null);
                      onSelectSlotForEntry(slotNum, slotType);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-colors shadow-lg shadow-blue-600/20"
                  >
                    🚗 Check-in Vehicle to Slot {selectedSlot.slot_number}
                  </button>
                )}

                {activeOccupant && (
                  <button
                    onClick={() => {
                      const vNum = activeOccupant.vehicle_number;
                      setSelectedSlot(null);
                      onSelectVehicleForExit(vNum);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    💳 Proceed to Vehicle Exit & Bill Settlement
                  </button>
                )}

                <button
                  onClick={() => {
                    onToggleMaintenance(selectedSlot.slot_number);
                    setSelectedSlot(null);
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>
                    {selectedSlot.status === 'Maintenance' ? 'Reactivate Slot' : 'Put Under Maintenance'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs text-slate-300 hover:text-white font-medium transition-colors flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Return to Bay Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
