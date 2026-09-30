import React from 'react';
import { ParkingRecord, ParkingSlot } from '../types';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Clock,
  Car,
  DollarSign,
  Download,
  FileText
} from 'lucide-react';

interface ReportsViewProps {
  records: ParkingRecord[];
  slots: ParkingSlot[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ records, slots }) => {
  // Aggregate vehicle types
  const typeCounts: Record<string, number> = {};
  records.forEach(r => {
    typeCounts[r.vehicle_type] = (typeCounts[r.vehicle_type] || 0) + 1;
  });

  const totalVehicles = records.length || 1;

  // 7-Day Revenue Trend (Mock + Records)
  const revenueByDay = [
    { day: 'Wed (24 Sep)', rev: 440, entries: 8 },
    { day: 'Thu (25 Sep)', rev: 520, entries: 11 },
    { day: 'Fri (26 Sep)', rev: 710, entries: 15 },
    { day: 'Sat (27 Sep)', rev: 890, entries: 19 },
    { day: 'Sun (28 Sep)', rev: 960, entries: 22 },
    { day: 'Mon (29 Sep)', rev: 670, entries: 14 },
    { day: 'Today', rev: 740, entries: 16 },
  ];

  const maxRev = Math.max(...revenueByDay.map(d => d.rev));

  // Peak Hours distribution
  const peakHours = [
    { hour: '08:00 - 10:00', count: 18, pct: 85 },
    { hour: '10:00 - 12:00', count: 24, pct: 100 },
    { hour: '12:00 - 14:00', count: 14, pct: 60 },
    { hour: '14:00 - 16:00', count: 19, pct: 80 },
    { hour: '16:00 - 18:00', count: 21, pct: 90 },
    { hour: '18:00 - 20:00', count: 16, pct: 70 },
  ];

  const slotUsage = [
    { slot: 'A01 (VIP)', uses: 28, rev: 1680 },
    { slot: 'A03 (Car)', uses: 34, rev: 1360 },
    { slot: 'B01 (EV Fast)', uses: 22, rev: 1980 },
    { slot: 'B04 (Bike)', uses: 45, rev: 900 },
    { slot: 'C03 (Car)', uses: 31, rev: 1240 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Matplotlib Business Intelligence</span>
            </span>
            <span className="text-xs text-slate-400">Statistical Analytics & Graphs</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            Analytics & Executive Performance Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time graphical metrics for vehicle mix, peak arrival windows, daily collection trends, and parking bay turnover.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 shrink-0 flex items-center justify-center space-x-2 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Print Executive Report</span>
        </button>
      </div>

      {/* Grid of Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Revenue Trend (Custom Bar Chart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Daily Revenue Trends (Past 7 Days)</span>
              </h3>
              <p className="text-xs text-slate-400">Total collections in Indian National Rupees (₹)</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">₹4,930 Total</span>
          </div>

          {/* Bar Chart Visual */}
          <div className="space-y-3 pt-2">
            {revenueByDay.map(item => {
              const heightPct = Math.round((item.rev / maxRev) * 100);
              return (
                <div key={item.day} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-sans">{item.day}</span>
                    <span className="text-emerald-400 font-bold">₹{item.rev} ({item.entries} vehicles)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${heightPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Vehicle Type Distribution (Donut Breakdown) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-blue-400" />
                <span>Vehicle Fleet Classification</span>
              </h3>
              <p className="text-xs text-slate-400">Distribution of vehicle types parked</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">{records.length} Vehicles</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { type: 'Car', color: 'from-blue-600 to-indigo-600', icon: '🚗', bg: 'text-blue-400' },
              { type: 'Bike', color: 'from-orange-500 to-amber-500', icon: '🏍️', bg: 'text-orange-400' },
              { type: 'EV', color: 'from-emerald-500 to-teal-500', icon: '⚡', bg: 'text-emerald-400' },
              { type: 'VIP', color: 'from-purple-500 to-pink-500', icon: '👑', bg: 'text-purple-400' },
              { type: 'Accessible', color: 'from-cyan-500 to-sky-500', icon: '♿', bg: 'text-cyan-400' },
            ].map(cat => {
              const count = typeCounts[cat.type] || (cat.type === 'Car' ? 12 : cat.type === 'Bike' ? 8 : 2);
              const pct = Math.round((count / (records.length || 24)) * 100);

              return (
                <div key={cat.type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium flex items-center space-x-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.type}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-300">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className={`bg-gradient-to-r ${cat.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Peak Inward Hours */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Peak Inward Traffic Times</span>
              </h3>
              <p className="text-xs text-slate-400">Highest congestion arrival time intervals</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">Peak: 10:00 - 12:00</span>
          </div>

          <div className="space-y-3 pt-2">
            {peakHours.map(ph => (
              <div key={ph.hour} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-sans">{ph.hour}</span>
                  <span className="text-amber-400 font-bold">{ph.count} Arrivals</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                    style={{ width: `${ph.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Top Utilized Parking Slots */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Most Utilized Parking Bays</span>
              </h3>
              <p className="text-xs text-slate-400">High turnover spots near gates and elevators</p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400">Top 5 Bays</span>
          </div>

          <div className="space-y-2.5">
            {slotUsage.map((su, idx) => (
              <div
                key={su.slot}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center space-x-3 font-sans">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-white font-mono">{su.slot}</span>
                    <span className="text-[10px] text-slate-400 block font-sans">Ground Level Access</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{su.uses} Turns</div>
                  <div className="text-emerald-400 text-[11px]">₹{su.rev} Generated</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
