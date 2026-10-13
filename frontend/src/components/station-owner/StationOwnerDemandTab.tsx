'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Zap,
  Users,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

interface HourlyDataPoint {
  hour: string;
  loadPct: number;
  isPeak?: boolean;
}

const hourlyDemand: HourlyDataPoint[] = [
  { hour: '06:00', loadPct: 24 },
  { hour: '08:00', loadPct: 78, isPeak: true },
  { hour: '10:00', loadPct: 62 },
  { hour: '12:00', loadPct: 54 },
  { hour: '14:00', loadPct: 48 },
  { hour: '16:00', loadPct: 70 },
  { hour: '18:00', loadPct: 94, isPeak: true },
  { hour: '20:00', loadPct: 86, isPeak: true },
  { hour: '22:00', loadPct: 42 },
];

export function StationOwnerDemandTab() {
  const [selectedRange, setSelectedRange] = useState<'today' | 'week'>('today');

  return (
    <div className="space-y-4">
      {/* Live Occupancy Hero Card */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-black/[0.06]">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase text-black/60">Live Bay Occupancy</span>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#111312] text-[#C8F369]">
            Active
          </span>
        </div>

        <div className="pt-4 flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-[#111312]">5</span>
              <span className="text-sm text-black/40 font-medium">/ 6 bays occupied</span>
            </div>
            <p className="text-xs text-black/60 mt-1">1 CCS2 Fast bay open right now</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-600">83%</span>
            <p className="text-[11px] text-black/40">Utilization</p>
          </div>
        </div>

        {/* Bays Visual Bar */}
        <div className="grid grid-cols-6 gap-1.5 mt-4">
          {[
            { id: 1, type: 'CCS2 180kW', status: 'charging' },
            { id: 2, type: 'CCS2 180kW', status: 'charging' },
            { id: 3, type: 'Type 2 22kW', status: 'charging' },
            { id: 4, type: 'Type 2 22kW', status: 'charging' },
            { id: 5, type: 'CCS2 120kW', status: 'charging' },
            { id: 6, type: 'CCS2 120kW', status: 'available' },
          ].map((bay) => (
            <div
              key={bay.id}
              className={`h-9 rounded-lg flex flex-col items-center justify-center border text-[10px] font-semibold transition-all ${
                bay.status === 'charging'
                  ? 'bg-[#111312] text-white border-black'
                  : 'bg-[#C8F369]/30 text-black border-[#C8F369]'
              }`}
            >
              <span>Bay {bay.id}</span>
              <span className={`text-[8px] font-medium ${bay.status === 'charging' ? 'text-white/60' : 'text-black/70'}`}>
                {bay.status === 'charging' ? 'Busy' : 'Free'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Demand Curve Chart */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-black/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111312]">Daily Demand Profile</h3>
            <p className="text-xs text-black/50">Driver arrival volume across 24h</p>
          </div>
          <div className="flex items-center gap-1 bg-black/[0.04] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedRange('today')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                selectedRange === 'today' ? 'bg-white text-black shadow-sm' : 'text-black/50 hover:text-black'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('week')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                selectedRange === 'week' ? 'bg-white text-black shadow-sm' : 'text-black/50 hover:text-black'
              }`}
            >
              7 Days
            </button>
          </div>
        </div>

        {/* Minimal Bar Chart */}
        <div className="h-36 flex items-end justify-between gap-1 pt-6 px-1 border-b border-black/[0.06] pb-2">
          {hourlyDemand.map((item) => (
            <div key={item.hour} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[9px] font-mono font-medium text-black/40 group-hover:text-black transition-colors">
                {item.loadPct}%
              </span>
              <div className="w-full max-w-[22px] bg-black/[0.06] rounded-t-md h-24 flex items-end">
                <div
                  style={{ height: `${item.loadPct}%` }}
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    item.isPeak ? 'bg-[#111312]' : 'bg-[#111312]/30 group-hover:bg-[#111312]/60'
                  }`}
                />
              </div>
              <span className="text-[9px] text-black/50 font-mono mt-1">{item.hour}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-black/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#111312]" />
            <span>Peak slots (6 PM – 9 PM)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#111312]/30" />
            <span>Standard load</span>
          </div>
        </div>
      </div>

      {/* Surrounding Corridor Deficit / Market Opportunity */}
      <div className="rounded-2xl bg-gradient-to-br from-[#111312] to-[#202521] text-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-[#C8F369] font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#C8F369]" />
            Regional Deficit Signal
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/80">
            5 km Corridor
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">+38%</span>
          <span className="text-xs text-white/70">unmet driver charging demand</span>
        </div>
        <p className="text-xs text-white/60 mt-1 leading-relaxed">
          Over 42 EV drivers searched for charging near this corridor during peak evening hours while all nearby plugs were fully booked.
        </p>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-white/80 font-medium">Suggested Expansion</span>
          <span className="text-[#C8F369] font-semibold flex items-center gap-1">
            Add 1x 120kW Bay
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Driver Queue & Wait Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 border border-black/[0.06] shadow-sm">
          <div className="flex items-center gap-2 text-black/50 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Avg Wait Time</span>
          </div>
          <p className="text-xl font-bold text-[#111312] mt-1.5">0 min</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Smooth flow</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-black/[0.06] shadow-sm">
          <div className="flex items-center gap-2 text-black/50 text-xs">
            <Users className="w-3.5 h-3.5" />
            <span>Daily Visits</span>
          </div>
          <p className="text-xl font-bold text-[#111312] mt-1.5">38 EVs</p>
          <p className="text-[11px] text-black/50 font-medium mt-0.5">+14% vs yesterday</p>
        </div>
      </div>
    </div>
  );
}
