"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Zap, Car, Shield, Gauge } from "lucide-react";
import type { EVVehicle } from "./VehicleCockpit";

interface GarageFleetProps {
  vehicles: EVVehicle[];
  activeVehicleId: string;
  onSelectVehicle: (id: string) => void;
}

export function GarageFleet({
  vehicles,
  activeVehicleId,
  onSelectVehicle,
}: GarageFleetProps) {
  return (
    <div className="space-y-4 pb-20">
      {/* ── Fleet Header ────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-[rgba(17,19,18,0.07)] shadow-xs">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#8C938E] font-semibold">
          Driver Fleet Registry
        </div>
        <h3 className="text-lg font-bold text-[#111312] mt-0.5">
          Select Active Electric Vehicle
        </h3>
        <p className="text-xs text-[#525854]">
          Telemetry, range physics, and connector matching dynamically sync with your selected EV.
        </p>
      </div>

      {/* ── Vehicle Cards List ──────────────────────────────────────── */}
      <div className="space-y-3">
        {vehicles.map((v) => {
          const isActive = v.id === activeVehicleId;

          return (
            <div
              key={v.id}
              onClick={() => onSelectVehicle(v.id)}
              className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? "border-[#111312] shadow-sm ring-1 ring-[#111312]"
                  : "border-[rgba(17,19,18,0.07)] hover:border-[rgba(17,19,18,0.15)] shadow-xs"
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111312] text-[#C8F369] text-[10.5px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8F369]" />
                  Active Driver Vehicle
                </div>
              )}

              {/* Title & Metadata */}
              <div className="pr-24">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E]">
                  {v.year} Model • {v.plugType}
                </div>
                <h4 className="text-base font-bold text-[#111312]">
                  {v.make} {v.model}
                </h4>
                <div className="text-[10px] text-[#6B726D] font-mono mt-0.5">
                  VIN: {v.vin}
                </div>
              </div>

              {/* Vehicle Image */}
              <div className="relative w-full h-36 my-2 flex items-center justify-center">
                <Image
                  src={v.image}
                  alt={`${v.make} ${v.model}`}
                  fill
                  className="object-contain drop-shadow-xs"
                />
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[rgba(17,19,18,0.06)] text-center text-xs">
                <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[rgba(17,19,18,0.04)]">
                  <div className="text-[9.5px] font-mono text-[#8C938E]">Battery</div>
                  <div className="font-bold text-[#111312] font-mono mt-0.5">
                    {v.usableKwh}
                  </div>
                  <div className="text-[9px] text-[#6B726D]">kWh</div>
                </div>

                <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[rgba(17,19,18,0.04)]">
                  <div className="text-[9.5px] font-mono text-[#8C938E]">WLTP</div>
                  <div className="font-bold text-[#111312] font-mono mt-0.5">
                    {v.wltpRangeKm}
                  </div>
                  <div className="text-[9px] text-[#6B726D]">km</div>
                </div>

                <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[rgba(17,19,18,0.04)]">
                  <div className="text-[9.5px] font-mono text-[#8C938E]">Max DC</div>
                  <div className="font-bold text-[#111312] font-mono mt-0.5">
                    {v.maxDcSpeedKw}
                  </div>
                  <div className="text-[9px] text-[#6B726D]">kW</div>
                </div>

                <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[rgba(17,19,18,0.04)]">
                  <div className="text-[9.5px] font-mono text-[#8C938E]">Cell SOH</div>
                  <div className="font-bold text-[#16A34A] font-mono mt-0.5">
                    {v.sohPct}%
                  </div>
                  <div className="text-[9px] text-[#16A34A]">Healthy</div>
                </div>
              </div>

              {/* Set Active Button if not active */}
              {!isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVehicle(v.id);
                  }}
                  className="w-full mt-3 py-2 bg-[#F4F3EE] hover:bg-[#EAE8E2] text-[#111312] text-xs font-semibold rounded-xl active:scale-98 transition-all border border-[rgba(17,19,18,0.05)]"
                >
                  Select as Active
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
