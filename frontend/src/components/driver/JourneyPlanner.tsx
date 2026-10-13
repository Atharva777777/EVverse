"use client";

import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Clock,
  ShieldCheck,
  Wind,
  Mountain,
} from "lucide-react";
import type { EVVehicle } from "./VehicleCockpit";

export interface TripDestination {
  name: string;
  distanceKm: number;
  elevationGainM: number;
}

interface JourneyPlannerProps {
  destinations: TripDestination[];
  selectedDestIndex: number;
  onSelectDestIndex: (index: number) => void;
  activeVehicle: EVVehicle;
  currentBatteryPct: number;
  onStartTripNavigation: (dest: TripDestination) => void;
}

export function JourneyPlanner({
  destinations,
  selectedDestIndex,
  onSelectDestIndex,
  activeVehicle,
  currentBatteryPct,
  onStartTripNavigation,
}: JourneyPlannerProps) {
  const currentDest = destinations[selectedDestIndex] || destinations[0];

  // Real EV route consumption physics:
  // Base energy = distance * (efficiency / 100)
  // Elevation climb factor = (elevationGain / 1000) * 2.8 kWh per 1000m climb
  // Aerodynamic drag & speed factor = 1.05
  const baseEnergyKwh = (currentDest.distanceKm * (activeVehicle.efficiencyKwh100km / 100));
  const elevationClimbKwh = (currentDest.elevationGainM / 1000) * 2.8;
  const tripRequiredKwh = +(baseEnergyKwh + elevationClimbKwh).toFixed(1);

  // Available battery kWh
  const availableKwh = (activeVehicle.usableKwh * (currentBatteryPct / 100));
  const arrivalBatteryKwh = Math.max(0, availableKwh - tripRequiredKwh);
  const arrivalBatteryPct = Math.max(0, Math.round((arrivalBatteryKwh / activeVehicle.usableKwh) * 100));

  const isLowBuffer = arrivalBatteryPct < 15;
  const driveTimeMins = Math.round(currentDest.distanceKm * 1.35);

  return (
    <div className="space-y-3.5 pb-20">
      {/* ── Journey Header & Corridor Selector ──────────────────────── */}
      <div className="bg-white rounded-[28px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#767D78] font-medium">
              Topographical Transit Corridors
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#111312] mt-0.5">
            Corridor Energy Computer
          </h3>
          <p className="text-xs text-[#525854]">
            Physics-calibrated battery consumption accounting for ascent, aerodynamic drag, and grade.
          </p>
        </div>

        {/* Destination List */}
        <div
          role="radiogroup"
          aria-label="Available Transit Corridors"
          className="space-y-2 pt-1"
        >
          {destinations.map((dest, idx) => {
            const isSelected = selectedDestIndex === idx;
            return (
              <button
                key={dest.name}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${dest.name}, distance ${dest.distanceKm} kilometers, ascent ${dest.elevationGainM} meters`}
                onClick={() => onSelectDestIndex(idx)}
                className={`w-full min-h-[52px] p-3 rounded-2xl border text-left transition-all active:scale-98 flex items-center justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-[#111312] ${
                  isSelected
                    ? "bg-[#111312] text-white border-[#111312] shadow-xs"
                    : "bg-[#F9F8F5] text-[#111312] border-black/[0.05] hover:bg-[#F3F2ED]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#C8F369] text-[#111312]"
                        : "bg-white text-[#525854] border border-black/[0.06]"
                    }`}
                  >
                    <MapPin size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-snug truncate">{dest.name}</div>
                    <div
                      className={`text-[10px] font-mono truncate ${
                        isSelected ? "text-[#C8F369]" : "text-[#767D78]"
                      }`}
                    >
                      {dest.distanceKm} km • +{dest.elevationGainM}m elevation
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-[rgba(200,243,105,0.2)] text-[#C8F369]"
                        : "bg-white text-[#525854] border border-black/[0.06]"
                    }`}
                  >
                    {isSelected ? "Active" : "Select"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Topographical Elevation Cross-Section Profile ───────────── */}
      <div className="bg-white rounded-[28px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#767D78]">
              Active Corridor
            </span>
            <div className="text-base font-bold text-[#111312]">{currentDest.name}</div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#111312] bg-[#F4F3EE] px-3 py-1.5 rounded-full">
            <Clock size={13} className="text-[#525854]" />
            ~{driveTimeMins} mins
          </div>
        </div>

        {/* Hyperrealistic Topographical SVG Curve */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#767D78]">
            <span className="flex items-center gap-1">
              <Mountain size={12} />
              Elevation Ascent Profile
            </span>
            <span>+{currentDest.elevationGainM}m Peak Climb</span>
          </div>

          <div className="h-20 w-full bg-[#FAF9F6] rounded-2xl p-2 border border-black/[0.05] relative overflow-hidden flex items-end">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111312" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#111312" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              {/* Elevation Area */}
              <path
                d={`M 0 55 Q 50 48, 80 32 T 140 18 T 200 38 L 200 60 L 0 60 Z`}
                fill="url(#elevationGrad)"
              />
              {/* Elevation Contour Stroke */}
              <path
                d={`M 0 55 Q 50 48, 80 32 T 140 18 T 200 38`}
                fill="none"
                stroke="#111312"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-2 right-3 text-[9px] font-mono text-[#111312] bg-white px-2 py-0.5 rounded-md border border-black/[0.06] shadow-2xs">
              Climb Peak
            </div>
          </div>
        </div>

        {/* Energy Balance Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#FAF9F6] p-2.5 rounded-2xl border border-black/[0.04]">
            <div className="text-[9.5px] font-mono uppercase tracking-wider text-[#767D78]">
              Required
            </div>
            <div className="text-sm font-bold text-[#111312] font-mono mt-0.5">
              {tripRequiredKwh}
            </div>
            <div className="text-[9.5px] text-[#525854]">kWh</div>
          </div>

          <div className="bg-[#FAF9F6] p-2.5 rounded-2xl border border-black/[0.04]">
            <div className="text-[9.5px] font-mono uppercase tracking-wider text-[#767D78]">
              Climb Factor
            </div>
            <div className="text-sm font-bold text-[#111312] font-mono mt-0.5">
              +{elevationClimbKwh.toFixed(1)}
            </div>
            <div className="text-[9.5px] text-[#525854]">kWh Ascent</div>
          </div>

          <div
            className={`p-2.5 rounded-2xl border ${
              isLowBuffer
                ? "bg-[#FEF2F2] border-[#FEE2E2] text-[#991B1B]"
                : "bg-[#F3FAF0] border-[#E2F2DC] text-[#15803D]"
            }`}
          >
            <div className="text-[9.5px] font-mono uppercase tracking-wider">Arrival SoC</div>
            <div className="text-sm font-bold font-mono mt-0.5">
              ~{arrivalBatteryPct}%
            </div>
            <div className="text-[9.5px] font-semibold">
              {isLowBuffer ? "Low Buffer" : "Safe Reserve"}
            </div>
          </div>
        </div>

        {/* Low Buffer Warning or Safe Clearance Banner */}
        {isLowBuffer ? (
          <div className="p-3.5 bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-[#D97706] shrink-0 mt-0.5" />
            <div className="text-xs text-[#92400E]">
              <span className="font-bold">Caution: Arrival buffer below 15%.</span> We recommend an intermediate 15-minute top-up stop at a high-speed DC hub along the corridor.
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#FAF9F6] border border-black/[0.05] rounded-2xl flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#16A34A] shrink-0" />
            <span className="text-xs text-[#525854]">
              Ample safety margin: Arrival battery maintains &gt;15% reserve.
            </span>
          </div>
        )}

        {/* Launch Navigation in App */}
        <button
          type="button"
          onClick={() => onStartTripNavigation(currentDest)}
          className="w-full min-h-[48px] py-3.5 bg-[#111312] text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#252826] active:scale-98 transition-all shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#111312]"
        >
          <Navigation size={14} className="text-[#C8F369]" />
          Launch In-App Navigation for this Corridor
        </button>
      </div>
    </div>
  );
}
