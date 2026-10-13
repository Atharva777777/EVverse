"use client";

import React from "react";
import {
  Zap,
  Clock,
  DollarSign,
  Sliders,
  CheckCircle2,
  X,
  BatteryCharging,
  ShieldCheck,
  Power,
  RotateCcw,
} from "lucide-react";
import type { EVVehicle } from "./VehicleCockpit";
import type { DriverStation } from "@/app/users/stations/page";

interface ChargingConsoleProps {
  isCharging: boolean;
  vehicle: EVVehicle;
  currentBatteryPct: number;
  chargeStation: DriverStation | null;
  targetLimit: number;
  setTargetLimit: (limit: number) => void;
  elapsedSeconds: number;
  kwhDelivered: number;
  currentKw: number;
  chargeCost: number;
  onStartCharge: () => void;
  onStopCharge: () => void;
  showReceiptModal: boolean;
  onCloseReceiptModal: () => void;
}

export function ChargingConsole({
  isCharging,
  vehicle,
  currentBatteryPct,
  chargeStation,
  targetLimit,
  setTargetLimit,
  elapsedSeconds,
  kwhDelivered,
  currentKw,
  chargeCost,
  onStartCharge,
  onStopCharge,
  showReceiptModal,
  onCloseReceiptModal,
}: ChargingConsoleProps) {
  // Format elapsed time MM:SS
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  // Time to reach target estimate
  const remainingKwh = Math.max(0, (vehicle.usableKwh * ((targetLimit - currentBatteryPct) / 100)));
  const effectiveKw = isCharging ? currentKw : Math.min(vehicle.maxDcSpeedKw, chargeStation?.power_kw || 150);
  const estimatedMinsRemaining = Math.max(1, Math.round((remainingKwh / (effectiveKw || 100)) * 60));

  return (
    <div className="space-y-4 pb-20">
      {/* ── Main Charging Console Card ──────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-[rgba(17,19,18,0.07)] shadow-xs relative overflow-hidden text-center space-y-5">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8C938E] font-semibold">
              Power Telemetry
            </div>
            <div className="text-sm font-bold text-[#111312] mt-0.5">
              {chargeStation?.name || "Connected Superhub"}
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
              isCharging
                ? "bg-[#111312] text-[#C8F369] border border-[#111312]"
                : "bg-[#F4F3EE] text-[#525854] border border-[rgba(17,19,18,0.05)]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCharging ? "bg-[#C8F369] animate-pulse" : "bg-[#9CA3AF]"
              }`}
            />
            {isCharging ? "FAST CHARGING" : "STANDBY READY"}
          </div>
        </div>

        {/* Pulsating Visual Gauge */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-2">
          {/* Subtle Outer Glow */}
          {isCharging && (
            <div className="absolute inset-0 rounded-full bg-[rgba(200,243,105,0.2)] blur-xl animate-pulse" />
          )}

          {/* Background SVG Circle */}
          <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              className="text-[#F3F2ED]"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              strokeWidth="7"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - currentBatteryPct / 100)}
              strokeLinecap="round"
              stroke={isCharging ? "#111312" : "#525854"}
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center Readout */}
          <div className="absolute flex flex-col items-center justify-center">
            <div className="flex items-center gap-1">
              <span className="text-4xl font-bold tracking-tight text-[#111312] font-mono">
                {currentBatteryPct}
              </span>
              <span className="text-lg font-bold text-[#525854] font-mono">%</span>
            </div>
            <div className="text-[11px] font-mono text-[#8C938E] mt-0.5">
              Target: {targetLimit}%
            </div>
            {isCharging && (
              <div className="text-[10.5px] font-bold text-[#16A34A] mt-1 bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#DCFCE7]">
                +{currentKw} kW DC
              </div>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[rgba(17,19,18,0.06)]">
          <div className="bg-[#FAF9F6] p-2.5 rounded-2xl border border-[rgba(17,19,18,0.05)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
              Delivered
            </div>
            <div className="text-sm font-bold text-[#111312] font-mono mt-0.5">
              {kwhDelivered.toFixed(2)}
            </div>
            <div className="text-[10px] text-[#525854]">kWh</div>
          </div>

          <div className="bg-[#FAF9F6] p-2.5 rounded-2xl border border-[rgba(17,19,18,0.05)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
              Rate / Speed
            </div>
            <div className="text-sm font-bold text-[#111312] font-mono mt-0.5">
              {isCharging ? `${currentKw} kW` : "Ready"}
            </div>
            <div className="text-[10px] text-[#525854]">DC Fast</div>
          </div>

          <div className="bg-[#FAF9F6] p-2.5 rounded-2xl border border-[rgba(17,19,18,0.05)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
              Est. Session Cost
            </div>
            <div className="text-sm font-bold text-[#111312] font-mono mt-0.5">
              ${chargeCost.toFixed(2)}
            </div>
            <div className="text-[10px] text-[#525854]">@ $0.28/kWh</div>
          </div>
        </div>

        {/* Target Battery Slider Control */}
        <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[rgba(17,19,18,0.06)] text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#111312]">
            <span>Target SoC Limit</span>
            <span className="font-mono text-sm bg-white px-2 py-0.5 rounded-lg border border-[rgba(17,19,18,0.08)]">
              {targetLimit}%
            </span>
          </div>

          <input
            type="range"
            min={50}
            max={100}
            step={5}
            value={targetLimit}
            onChange={(e) => setTargetLimit(Number(e.target.value))}
            className="w-full accent-[#111312] cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10.5px] text-[#8C938E]">
            <span>50% Min</span>
            <span>80% Recommended for cell health</span>
            <span>100% Full Trip</span>
          </div>
        </div>

        {/* Primary Action Button */}
        {isCharging ? (
          <button
            onClick={onStopCharge}
            className="w-full py-4 bg-[#EF4444] text-white text-xs font-bold rounded-2xl hover:bg-[#DC2626] active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Power size={15} />
            Stop Session & View Receipt ({timeFormatted})
          </button>
        ) : (
          <button
            onClick={onStartCharge}
            className="w-full py-4 bg-[#111312] text-white text-xs font-bold rounded-2xl hover:bg-[#252826] active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Zap size={15} className="text-[#C8F369]" />
            Simulate Live Charging Session (Up to {vehicle.maxDcSpeedKw} kW)
          </button>
        )}
      </div>

      {/* ── Itemized Receipt Summary Modal ──────────────────────────── */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[rgba(17,19,18,0.1)] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(17,19,18,0.06)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#16A34A]">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111312]">Charging Summary</h4>
                  <div className="text-[10px] text-[#8C938E] font-mono">Invoice #EV-{Date.now().toString().slice(-6)}</div>
                </div>
              </div>
              <button
                onClick={onCloseReceiptModal}
                className="w-8 h-8 rounded-full bg-[#F4F3EE] flex items-center justify-center text-[#525854] hover:bg-[#EAE8E2]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[rgba(17,19,18,0.04)]">
                <span className="text-[#525854]">Charging Hub</span>
                <span className="font-semibold text-[#111312]">{chargeStation?.name || "QuantEV Fast Hub"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[rgba(17,19,18,0.04)]">
                <span className="text-[#525854]">Energy Delivered</span>
                <span className="font-mono font-bold text-[#111312]">{kwhDelivered.toFixed(2)} kWh</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[rgba(17,19,18,0.04)]">
                <span className="text-[#525854]">Peak Inverter Rate</span>
                <span className="font-mono font-semibold text-[#111312]">{currentKw} kW DC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[rgba(17,19,18,0.04)]">
                <span className="text-[#525854]">Session Duration</span>
                <span className="font-mono font-semibold text-[#111312]">{timeFormatted} mins</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[rgba(17,19,18,0.04)]">
                <span className="text-[#525854]">Standard Energy Tariff</span>
                <span className="text-[#525854]">$0.28 / kWh</span>
              </div>
              <div className="flex justify-between py-2 pt-3 border-t border-[rgba(17,19,18,0.08)] text-sm font-bold">
                <span className="text-[#111312]">Total Amount Charged</span>
                <span className="font-mono text-[#111312]">${chargeCost.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCloseReceiptModal}
              className="w-full py-3 bg-[#111312] text-white text-xs font-semibold rounded-2xl hover:bg-[#252826] active:scale-98 transition-all"
            >
              Done & Return to Cockpit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
