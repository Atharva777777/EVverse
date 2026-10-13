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
  // Elevation penalty = (elevationGain / 1000) * 2.8 kWh per 1000m climb
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
    <div className="space-y-4 pb-20">
      {/* ── Journey Header & Corridor Selector ──────────────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-[rgba(17,19,18,0.07)] shadow-xs space-y-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8C938E] font-semibold">
            Route Energy Computer
          </div>
          <h3 className="text-lg font-bold text-[#111312] mt-0.5">
            Regional Transit Corridors
          </h3>
          <p className="text-xs text-[#525854]">
            Physics-calibrated battery consumption accounting for topography & elevation.
          </p>
        </div>

        {/* Destination List */}
        <div className="space-y-2 pt-1">
          {destinations.map((dest, idx) => {
            const isSelected = selectedDestIndex === idx;
            return (
              <button
                key={dest.name}
                onClick={() => onSelectDestIndex(idx)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all active:scale-98 flex items-center justify-between ${
                  isSelected
                    ? "bg-[#111312] text-white border-[#111312] shadow-xs"
                    : "bg-[#F9F8F5] text-[#111312] border-[rgba(17,19,18,0.06)] hover:bg-[#F3F2ED]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#C8F369] text-[#111312]"
                        : "bg-white text-[#525854] border border-[rgba(17,19,18,0.06)]"
                    }`}
                  >
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-snug">{dest.name}</div>
                    <div
                      className={`text-[10.5px] font-mono ${
                        isSelected ? "text-[#C8F369]" : "text-[#8C938E]"
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
                        : "bg-white text-[#525854] border border-[rgba(17,19,18,0.06)]"
                    }`}
                  >
                    Select
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Real-Time Energy Analysis Card ──────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-[rgba(17,19,18,0.07)] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(17,19,18,0.06)] pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
              Selected Destination
            </span>
            <div className="text-base font-bold text-[#111312]">{currentDest.name}</div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#111312] bg-[#F4F3EE] px-3 py-1.5 rounded-full">
            <Clock size={13} className="text-[#525854]" />
            ~{driveTimeMins} mins
          </div>
        </div>

        {/* Energy Balance Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[rgba(17,19,18,0.05)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
              Required
            </div>
            <div className="text-base font-bold text-[#111312] font-mono mt-0.5">
              {tripRequiredKwh}
            </div>
            <div className="text-[10px] text-[#525854] font-medium">kWh</div>
          </div>

          <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[rgba(17,19,18,0.05)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
              Climb Delta
            </div>
            <div className="text-base font-bold text-[#111312] font-mono mt-0.5">
              +{currentDest.elevationGainM}m
            </div>
            <div className="text-[10px] text-[#525854] font-medium">Gradual Climb</div>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isLowBuffer
                ? "bg-[#FEF2F2] border-[#FEE2E2] text-[#991B1B]"
                : "bg-[#F3FAF0] border-[#E2F2DC] text-[#15803D]"
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider">Arrival SoC</div>
            <div className="text-base font-bold font-mono mt-0.5">
              ~{arrivalBatteryPct}%
            </div>
            <div className="text-[10px] font-semibold">
              {isLowBuffer ? "Low Buffer" : "Safe Reserve"}
            </div>
          </div>
        </div>

        {/* Low Buffer Warning or Safe Clearance Banner */}
        {isLowBuffer ? (
          <div className="p-3.5 bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-[#D97706] shrink-0 mt-0.5" />
            <div className="text-xs text-[#92400E]">
              <span className="font-bold">Caution: Arrival buffer below 15%.</span> We recommend an intermediate 15-minute top-up stop at a high-speed DC hub along the corridor.
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#F9F8F5] border border-[rgba(17,19,18,0.05)] rounded-2xl flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#16A34A] shrink-0" />
            <span className="text-xs text-[#525854]">
              Ample safety margin: Arrival battery maintains &gt;15% reserve.
            </span>
          </div>
        )}

        {/* CTA: Initiate Route in App */}
        <button
          onClick={() => onStartTripNavigation(currentDest)}
          className="w-full py-3.5 bg-[#111312] text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#252826] active:scale-98 transition-all shadow-xs"
        >
          <Navigation size={14} className="text-[#C8F369]" />
          Launch In-App Navigation for this Corridor
        </button>
      </div>
    </div>
  );
}
