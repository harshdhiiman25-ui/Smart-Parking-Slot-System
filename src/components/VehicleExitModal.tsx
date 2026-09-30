import React, { useState, useEffect } from 'react';
import {
  ParkingRecord,
  ParkingSlot,
  TariffRate,
  PaymentMethod
} from '../types';
import {
  LogOut,
  Search,
  Clock,
  Car,
  QrCode,
  CreditCard,
  Banknote,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  X,
  Zap,
  Printer,
  PlusCircle,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VehicleExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: ParkingRecord[];
  slots: ParkingSlot[];
  rates: Record<string, TariffRate>;
  onCompleteExit: (updatedRecord: ParkingRecord) => void;
  onUpdateSlotStatus: (slotNumber: string, status: 'Available') => void;
  initialQuery?: string;
}

export const VehicleExitModal: React.FC<VehicleExitModalProps> = ({
  isOpen,
  onClose,
  records,
  slots,
  rates,
  onCompleteExit,
  onUpdateSlotStatus,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [showSettledReceipt, setShowSettledReceipt] = useState(false);
  const [settledData, setSettledData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Active parked records
  const activeRecords = records.filter(r => r.status === 'Active');

  const handleSearch = (query: string) => {
    setErrorMsg('');
    const cleanQ = query.trim().toUpperCase();
    if (!cleanQ) {
      setSelectedRecord(null);
      return;
    }

    const found = activeRecords.find(
      r => r.vehicle_number === cleanQ || r.ticket_id.toUpperCase() === cleanQ
    );

    if (found) {
      setSelectedRecord(found);
    } else {
      setSelectedRecord(null);
      setErrorMsg(`No active parked vehicle found matching '${cleanQ}'.`);
    }
  };

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setShowSettledReceipt(false);
      setSettledData(null);
      setErrorMsg('');
      if (initialQuery) {
        setSearchQuery(initialQuery);
        handleSearch(initialQuery);
      } else {
        setSearchQuery('');
        setSelectedRecord(null);
      }
    }
  }, [isOpen, initialQuery]);

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

  const handleModalClose = () => {
    setShowSettledReceipt(false);
    setSettledData(null);
    setSelectedRecord(null);
    setSearchQuery('');
    setErrorMsg('');
    onClose();
  };

  const handleNewExit = () => {
    setShowSettledReceipt(false);
    setSettledData(null);
    setSelectedRecord(null);
    setSearchQuery('');
    setErrorMsg('');
  };

  if (!isOpen) return null;

  // Billing calculation logic
  const calculateBill = (record: ParkingRecord) => {
    const entryDate = new Date(record.entry_time);
    const exitDate = new Date();

    const diffMs = Math.max(0, exitDate.getTime() - entryDate.getTime());
    const totalMinutes = Math.ceil(diffMs / (1000 * 60));

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    const tariff = rates[record.vehicle_type] || rates['Car'];
    const hourlyRate = tariff ? tariff.hourly_rate : 40;
    const dailyCap = tariff ? tariff.daily_max : 320;

    // Grace period: first 15 mins is free
    const isGrace = totalMinutes <= 15;
    let baseParkingFee = 0;
    let billableHours = 0;

    if (!isGrace) {
      billableHours = Math.max(1, Math.ceil(totalMinutes / 60));
      const days = Math.floor(totalMinutes / (24 * 60));
      const remHours = Math.ceil((totalMinutes % (24 * 60)) / 60);
      baseParkingFee = (days * dailyCap) + Math.min(remHours * hourlyRate, dailyCap);
    }

    const evFee = record.ev_fee || 0;
    const totalAmount = baseParkingFee + evFee;

    const formattedExitTime = exitDate.getFullYear() + '-' +
      String(exitDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(exitDate.getDate()).padStart(2, '0') + ' ' +
      String(exitDate.getHours()).padStart(2, '0') + ':' +
      String(exitDate.getMinutes()).padStart(2, '0') + ':' +
      String(exitDate.getSeconds()).padStart(2, '0');

    return {
      totalMinutes,
      billableHours,
      durationStr,
      hourlyRate,
      isGrace,
      baseParkingFee,
      evFee,
      totalAmount,
      formattedExitTime
    };
  };

  const handleCheckout = () => {
    if (!selectedRecord) return;

    const bill = calculateBill(selectedRecord);
    const txId = `${paymentMethod.toUpperCase()}-TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const updated: ParkingRecord = {
      ...selectedRecord,
      exit_time: bill.formattedExitTime,
      duration_minutes: bill.totalMinutes,
      parking_fee: bill.baseParkingFee,
      ev_fee: bill.evFee,
      total_amount: bill.totalAmount,
      payment_status: 'Paid',
      payment_method: paymentMethod,
      transaction_id: txId,
      status: 'Completed'
    };

    onCompleteExit(updated);
    onUpdateSlotStatus(selectedRecord.slot_number, 'Available');

    setSettledData({
      ...bill,
      ...updated
    });
    setShowSettledReceipt(true);

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

  const activeBill = selectedRecord ? calculateBill(selectedRecord) : null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95">
        {/* Header - Sticky & Always Visible */}
        <div className="sticky top-0 z-20 shrink-0 flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => {
                if (showSettledReceipt) {
                  setShowSettledReceipt(false);
                } else if (selectedRecord) {
                  setSelectedRecord(null);
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
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Vehicle Outward Exit & Billing</h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">Automated fee computation, payment settlement & gate release</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Close / Return to Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {showSettledReceipt && settledData ? (
            /* Official Receipt View */
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white text-slate-950 font-mono text-xs shadow-inner border border-slate-200">
                <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                  <h3 className="font-black text-sm tracking-tight">SMART PARKING MANAGEMENT</h3>
                  <p className="text-[10px] text-slate-600">Automated Vehicle Allocation & Billing Slip</p>
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5">GSTIN: 07AAACS1234F1Z5 • Counter Exit #01</p>
                </div>

                <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ticket ID:</span>
                    <span className="font-bold">{settledData.ticket_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transaction ID:</span>
                    <span className="font-bold">{settledData.transaction_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Vehicle Plate:</span>
                    <span className="font-bold text-sm bg-slate-100 px-1 rounded">{settledData.vehicle_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Category / Bay:</span>
                    <span>{settledData.vehicle_type} • Slot {settledData.slot_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Owner Name:</span>
                    <span>{settledData.owner_name}</span>
                  </div>
                </div>

                <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Entry Time:</span>
                    <span>{settledData.entry_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Exit Time:</span>
                    <span>{settledData.exit_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-bold">{settledData.durationStr} ({settledData.billableHours} billable hrs)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tariff Rate:</span>
                    <span>₹{settledData.hourlyRate}.00/hr</span>
                  </div>
                </div>

                <div className="py-3 border-b-2 border-slate-900 space-y-1 font-sans">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Parking Charge:</span>
                    <span>₹{settledData.parking_fee.toFixed(2)}</span>
                  </div>
                  {settledData.ev_fee > 0 && (
                    <div className="flex justify-between text-xs font-mono text-blue-700">
                      <span>EV Charging Surcharge:</span>
                      <span>₹{settledData.ev_fee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black pt-1 font-mono">
                    <span>TOTAL PAID:</span>
                    <span>₹{settledData.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-mono">
                    <span>Payment Mode:</span>
                    <span className="font-bold uppercase">{settledData.payment_method} [SETTLED]</span>
                  </div>
                </div>

                <div className="text-center pt-3 text-[10px] text-slate-500 font-sans">
                  Thank you for parking with us! Drive Safe.<br />
                  System generated digital invoice • No signature required
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleNewExit}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>💳 Settle Another Vehicle Outward Exit</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettledReceipt(false);
                      setSelectedRecord(null);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center space-x-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
                  >
                    Gate Opened / Done
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Vehicle Search & Checkout Panel */
            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Search Parked Vehicle
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter License Plate or Ticket ID (e.g. DL01AB1234)"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold tracking-wider placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Select from Active Parked Pills */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">Or quick-select parked vehicle:</span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {activeRecords.map(r => (
                    <button
                      key={r.ticket_id}
                      onClick={() => {
                        setSearchQuery(r.vehicle_number);
                        handleSearch(r.vehicle_number);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                        selectedRecord?.ticket_id === r.ticket_id
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {r.vehicle_number} ({r.slot_number})
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Calculated Bill Breakdown */}
              {selectedRecord && activeBill && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(null)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors shadow-sm"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                      <span>← Back to Vehicle List</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-700/60 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>✕ Close to Dashboard</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <div className="text-white font-mono font-bold text-sm">
                        {selectedRecord.vehicle_number}
                      </div>
                      <div className="text-xs text-slate-400">
                        {selectedRecord.owner_name} • Slot {selectedRecord.slot_number} ({selectedRecord.vehicle_type})
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                      {selectedRecord.ticket_id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-slate-400">
                      Entry Time: <strong className="text-slate-200 block font-mono">{selectedRecord.entry_time}</strong>
                    </div>
                    <div className="text-slate-400">
                      Duration Elapsed: <strong className="text-slate-200 block font-mono">{activeBill.durationStr}</strong>
                    </div>
                  </div>

                  {activeBill.isGrace && (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                      ✨ 15-Minute Grace Period Applied: Parking is free of charge!
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Base Parking Fee ({activeBill.billableHours} hrs @ ₹{activeBill.hourlyRate}/hr):</span>
                      <span className="font-mono text-slate-200">₹{activeBill.baseParkingFee.toFixed(2)}</span>
                    </div>

                    {activeBill.evFee > 0 && (
                      <div className="flex justify-between text-blue-400">
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3.5 h-3.5 inline" />
                          <span>EV Charging Station Surcharge:</span>
                        </span>
                        <span className="font-mono">₹{activeBill.evFee.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-black pt-1 text-white">
                      <span>Total Payable Amount:</span>
                      <span className="text-emerald-400 font-mono">₹{activeBill.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Payment Settlement Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Cash')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 text-xs font-bold transition-all ${
                          paymentMethod === 'Cash'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        <span>Cash</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 text-xs font-bold transition-all ${
                          paymentMethod === 'UPI'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span>UPI / QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Card')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 text-xs font-bold transition-all ${
                          paymentMethod === 'Card'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>POS Card</span>
                      </button>
                    </div>

                    {/* UPI QR Display if UPI selected */}
                    {paymentMethod === 'UPI' && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
                        <div className="w-14 h-14 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                          <QrCode className="w-12 h-12 text-slate-950" />
                        </div>
                        <div className="text-xs">
                          <div className="font-bold text-white">Scan & Pay via any UPI App</div>
                          <div className="text-slate-400 font-mono text-[10px]">smartparking@upi • GPay/PhonePe</div>
                          <div className="text-emerald-400 font-bold font-mono mt-0.5">Amount: ₹{activeBill.totalAmount.toFixed(2)}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checkout & Back Buttons */}
                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(null)}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-400" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Settle Payment (₹{activeBill.totalAmount.toFixed(2)}) & Open Gate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar */}
        <div className="sticky bottom-0 z-20 shrink-0 bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>← Return to Dashboard</span>
          </button>
          <span className="text-[11px] text-slate-500 font-mono">Press Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
