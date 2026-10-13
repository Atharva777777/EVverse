"use client";

import React from "react";
import Image from "next/image";
import {
  Zap,
  Lock,
  Unlock,
  Thermometer,
  ShieldCheck,
  ChevronRight,
  Navigation,
  Sparkles,
} from "lucide-react";

export interface EVVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  image: string;
  batteryKwh: number;
  usableKwh: number;
  currentBatteryPct: number;
  wltpRangeKm: number;
  efficiencyKwh100km: number;
  maxDcSpeedKw: number;
  maxAcSpeedKw: number;
  plugType: string;
  plugImage: string;
  vin: string;
  sohPct: number;
}

interface VehicleCockpitProps {
  vehicle: EVVehicle;
  currentBatteryPct: number;
  calibratedRangeKm: number;
  driveMode: "normal" | "eco" | "sport";
  setDriveMode: (mode: "normal" | "eco" | "sport") => void;
  hvacActive: boolean;
  setHvacActive: (active: boolean) => void;
  doorsLocked: boolean;
  setDoorsLocked: (locked: boolean) => void;
  isPreconditioning: boolean;
  setIsPreconditioning: (pre: boolean) => void;
  nearestUltraStation?: { name: string; distanceKm: number; powerKw: number } | null;
  onNavigateToNearest?: () => void;
  onOpenGarage?: () => void;
}

export function VehicleCockpit({
  vehicle,
  currentBatteryPct,
  calibratedRangeKm,
  driveMode,
  setDriveMode,
  hvacActive,
  setHvacActive,
  doorsLocked,
  setDoorsLocked,
  isPreconditioning,
  setIsPreconditioning,
  nearestUltraStation,
  onNavigateToNearest,
  onOpenGarage,
}: VehicleCockpitProps) {
  return (
    <div className="space-y-4 pb-20">
      {/* ── Vehicle Hero Card ────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-[rgba(17,19,18,0.07)] shadow-xs relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#8C938E] font-semibold">
              Connected Telemetry
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#111312] mt-0.5">
              {vehicle.make} {vehicle.model}
            </h2>
            <div className="text-xs text-[#525854] font-medium">
              Model Year {vehicle.year} • {vehicle.plugType}
            </div>
          </div>

          <button
            onClick={onOpenGarage}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#111312] bg-[#F4F3EE] hover:bg-[#EAE8E2] px-3 py-1.5 rounded-full transition-colors active:scale-95 border border-[rgba(17,19,18,0.05)]"
          >
            Switch EV
            <ChevronRight size={13} />
          </button>
        </div>

        {/* High-Resolution Vehicle Rendering */}
        <div className="relative w-full h-44 my-2 flex items-center justify-center">
          <Image
            src={vehicle.image}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-contain drop-shadow-md select-none transition-transform duration-300 hover:scale-[1.02]"
            priority
          />
        </div>

        {/* Battery & Calibrated Range Metrics */}
        <div className="pt-2 border-t border-[rgba(17,19,18,0.06)] grid grid-cols-2 gap-4 items-end">
          {/* Calibrated Range */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
              Dynamic Estimated Range
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-bold tracking-tight text-[#111312] font-mono">
                {calibratedRangeKm}
              </span>
              <span className="text-sm font-semibold text-[#525854]">km</span>
            </div>
            <div className="text-[11px] text-[#525854] mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111312]" />
              <span>Calibrated via driving mode & HVAC</span>
            </div>
          </div>

          {/* State of Charge (SoC) */}
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
              Usable Battery Level
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-3xl font-bold tracking-tight text-[#111312] font-mono">
                {currentBatteryPct}%
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#C8F369] border border-[#111312]" />
            </div>

            {/* Battery Progress Line */}
            <div className="w-full bg-[#F3F2ED] h-1.5 rounded-full mt-2 overflow-hidden border border-[rgba(17,19,18,0.04)]">
              <div
                className="h-full bg-[#111312] transition-all duration-500 rounded-full"
                style={{ width: `${currentBatteryPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Drive Mode Selector ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-[rgba(17,19,18,0.07)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#525854]">
            Drive Dynamics & Inverter Tuning
          </span>
          <span className="text-[10px] font-mono text-[#8C938E]">
            {driveMode === "eco" ? "+12% Range Gain" : driveMode === "sport" ? "-14% Output Mode" : "WLTP Standard"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1 bg-[#F5F4EF] rounded-2xl border border-[rgba(17,19,18,0.05)]">
          {(
            [
              { id: "eco", label: "Eco Range", desc: "Max Conservation" },
              { id: "normal", label: "Normal", desc: "Factory WLTP" },
              { id: "sport", label: "Sport Dynamic", desc: "Peak Power" },
            ] as const
          ).map((m) => {
            const isSelected = driveMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setDriveMode(m.id)}
                className={`py-2 px-1 rounded-xl text-center transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? "bg-[#111312] text-white shadow-xs"
                    : "text-[#525854] hover:text-[#111312]"
                }`}
              >
                <div className="text-xs font-semibold">{m.label}</div>
                <div className={`text-[9.5px] mt-0.5 ${isSelected ? "text-[#C8F369]" : "text-[#8C938E]"}`}>
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Direct Hardware Controls ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Climate HVAC */}
        <button
          onClick={() => setHvacActive(!hvacActive)}
          className={`p-3.5 rounded-2xl border transition-all text-left active:scale-95 flex flex-col justify-between ${
            hvacActive
              ? "bg-white border-[rgba(17,19,18,0.12)] text-[#111312] shadow-xs"
              : "bg-[#F7F6F1] border-[rgba(17,19,18,0.06)] text-[#8C938E]"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Thermometer size={18} className={hvacActive ? "text-[#111312]" : "text-[#8C938E]"} />
            <span
              className={`w-2 h-2 rounded-full ${
                hvacActive ? "bg-[#C8F369] border border-[#111312]" : "bg-[#D1D5DB]"
              }`}
            />
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold">A/C Climate</div>
            <div className="text-[10px] text-[#6B726D] font-mono">
              {hvacActive ? "21.5°C Active" : "Off (+18km)"}
            </div>
          </div>
        </button>

        {/* Security Doors */}
        <button
          onClick={() => setDoorsLocked(!doorsLocked)}
          className={`p-3.5 rounded-2xl border transition-all text-left active:scale-95 flex flex-col justify-between ${
            doorsLocked
              ? "bg-white border-[rgba(17,19,18,0.12)] text-[#111312] shadow-xs"
              : "bg-[#F7F6F1] border-[rgba(17,19,18,0.06)] text-[#8C938E]"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            {doorsLocked ? <Lock size={18} className="text-[#111312]" /> : <Unlock size={18} className="text-[#B91C1C]" />}
            <span
              className={`w-2 h-2 rounded-full ${
                doorsLocked ? "bg-[#111312]" : "bg-[#EF4444]"
              }`}
            />
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold">Chassis Locks</div>
            <div className="text-[10px] text-[#6B726D] font-mono">
              {doorsLocked ? "Secure" : "Unlocked"}
            </div>
          </div>
        </button>

        {/* Battery Pre-Conditioning */}
        <button
          onClick={() => setIsPreconditioning(!isPreconditioning)}
          className={`p-3.5 rounded-2xl border transition-all text-left active:scale-95 flex flex-col justify-between ${
            isPreconditioning
              ? "bg-[#111312] text-white border-[#111312] shadow-xs"
              : "bg-white border-[rgba(17,19,18,0.07)] text-[#111312]"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Zap size={18} className={isPreconditioning ? "text-[#C8F369]" : "text-[#111312]"} />
            <span
              className={`w-2 h-2 rounded-full ${
                isPreconditioning ? "bg-[#C8F369] animate-pulse" : "bg-[#E5E7EB]"
              }`}
            />
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold">Pre-Condition</div>
            <div className={`text-[10px] font-mono ${isPreconditioning ? "text-[#C8F369]" : "text-[#6B726D]"}`}>
              {isPreconditioning ? "Heating Cell" : "Ready"}
            </div>
          </div>
        </button>
      </div>

      {/* ── Quick Action: Nearest Ultra Charger ────────────────────── */}
      {nearestUltraStation && (
        <div className="bg-white rounded-3xl p-4 border border-[rgba(17,19,18,0.07)] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111312] flex items-center justify-center text-[#C8F369] shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E] font-semibold">
                Nearest DC Superhub • {nearestUltraStation.powerKw} kW
              </div>
              <div className="text-sm font-bold text-[#111312] leading-tight">
                {nearestUltraStation.name}
              </div>
              <div className="text-xs text-[#525854]">
                {nearestUltraStation.distanceKm.toFixed(1)} km away • ~{Math.round(nearestUltraStation.distanceKm * 2.2)} mins drive
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToNearest}
            className="px-3.5 py-2.5 bg-[#111312] text-white text-xs font-semibold rounded-2xl flex items-center gap-1.5 hover:bg-[#252826] active:scale-95 transition-all shadow-xs shrink-0"
          >
            <Navigation size={13} className="text-[#C8F369]" />
            Route
          </button>
        </div>
      )}

      {/* ── Factory Battery Health & Spec Highlights ─────────────────── */}
      <div className="bg-[#FAF9F6] rounded-3xl p-4 border border-[rgba(17,19,18,0.07)] grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
            Factory SOH
          </div>
          <div className="text-sm font-bold text-[#111312] font-mono mt-0.5">
            {vehicle.sohPct}%
          </div>
          <div className="text-[10px] text-[#16A34A] font-semibold mt-0.5">
            Optimal Cell
          </div>
        </div>

        <div className="border-x border-[rgba(17,19,18,0.07)]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
            Max DC Rate
          </div>
          <div className="text-sm font-bold text-[#111312] font-mono mt-0.5">
            {vehicle.maxDcSpeedKw} kW
          </div>
          <div className="text-[10px] text-[#525854] font-medium mt-0.5">
            800V Architecture
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
            Avg Efficiency
          </div>
          <div className="text-sm font-bold text-[#111312] font-mono mt-0.5">
            {vehicle.efficiencyKwh100km}
          </div>
          <div className="text-[10px] text-[#525854] font-medium mt-0.5">
            kWh/100km
          </div>
        </div>
      </div>
    </div>
  );
}
