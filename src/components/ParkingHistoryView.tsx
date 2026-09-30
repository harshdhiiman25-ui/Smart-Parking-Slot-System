import React, { useState } from 'react';
import { ParkingRecord } from '../types';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';

interface ParkingHistoryViewProps {
  records: ParkingRecord[];
  onSelectExit: (vehicleNumber: string) => void;
}

export const ParkingHistoryView: React.FC<ParkingHistoryViewProps> = ({
  records,
  onSelectExit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Completed'>('all');

  const filtered = records.filter(r => {
    // Search query
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.ticket_id.toLowerCase().includes(term) ||
      r.vehicle_number.toLowerCase().includes(term) ||
      r.owner_name.toLowerCase().includes(term) ||
      (r.owner_phone && r.owner_phone.includes(term)) ||
      r.slot_number.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;

    // Period filter
    if (periodFilter === 'today') {
      return r.entry_time.startsWith('2026-09-29');
    }
    if (periodFilter === 'yesterday') {
      return r.entry_time.startsWith('2026-09-28');
    }
    if (periodFilter === 'week') {
      return r.entry_time.startsWith('2026-09');
    }

    return true;
  });

  const exportCSV = () => {
    const headers = [
      'Ticket ID',
      'Vehicle Number',
      'Category',
      'Slot',
      'Owner Name',
      'Phone',
      'Entry Time',
      'Exit Time',
      'Duration (Mins)',
      'Parking Fee (INR)',
      'EV Fee (INR)',
      'Total Amount (INR)',
      'Payment Status',
      'Payment Method',
      'Status'
    ];

    const rows = filtered.map(r => [
      r.ticket_id,
      r.vehicle_number,
      r.vehicle_type,
      r.slot_number,
      `"${r.owner_name}"`,
      r.owner_phone || '',
      r.entry_time,
      r.exit_time || '',
      r.duration_minutes || 0,
      r.parking_fee || 0,
      r.ev_fee || 0,
      r.total_amount || 0,
      r.payment_status,
      r.payment_method || '',
      r.status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_parking_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
              <History className="w-3.5 h-3.5" />
              <span>Full Ledger Audit</span>
            </span>
            <span className="text-xs text-slate-400">Indexed SQLite3 Records</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            Parking History & Search Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Query gate passes, historical vehicle billing, durations, and payment logs with CSV export.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shrink-0 flex items-center justify-center space-x-2 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Records (.CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Plate, Ticket ID, Owner, Slot..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Period Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today's Transactions</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Past 7 Days</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Currently Parked (Active)</option>
              <option value="Completed">Exited & Settled (Completed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <span className="text-xs text-slate-400 font-medium">
            Found <strong className="text-white font-mono">{filtered.length}</strong> matching transaction records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Vehicle Plate</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Slot</th>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-3">Inward Time</th>
                <th className="py-2.5 px-3">Outward Time</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Billed Fee</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(r => (
                <tr key={r.ticket_id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-blue-400">{r.ticket_id}</td>
                  <td className="py-2.5 px-3 font-bold text-white text-sm">{r.vehicle_number}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.vehicle_type}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-400">{r.slot_number}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">{r.owner_name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.entry_time}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.exit_time || '--'}</td>
                  <td className="py-2.5 px-3">
                    {r.duration_minutes ? `${Math.floor(r.duration_minutes / 60)}h ${r.duration_minutes % 60}m` : '--'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">
                    ₹{(r.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400 uppercase">
                    {r.payment_method || '--'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'Active'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {r.status === 'Active' ? (
                      <button
                        onClick={() => onSelectExit(r.vehicle_number)}
                        className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold"
                      >
                        Exit
                      </button>
                    ) : (
                      <button
                        onClick={() => window.print()}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Print Voucher"
                      >
                        <Printer className="w-3.5 h-3.5 inline" />
                      </button>
                    )}
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
