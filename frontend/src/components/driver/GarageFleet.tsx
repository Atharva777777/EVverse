"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Zap, Car, Shield, Gauge, Sliders, ChevronRight } from "lucide-react";
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
  const [suspensionMap, setSuspensionMap] = useState<Record<string, "aero" | "normal" | "high">>({});

  return (
    <div className="space-y-3.5 pb-20">
      {/* ── Fleet Registry Header ───────────────────────────────────── */}
      <div className="bg-white rounded-[28px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#767D78] font-medium">
            Automotive Fleet Registry
          </span>
        </div>
        <h3 className="text-lg font-bold text-[#111312] mt-0.5">
          Driver Fleet Showroom
        </h3>
        <p className="text-xs text-[#525854]">
          Telemetry, DC charging curves, and range physics dynamically bind to your selected electric vehicle.
        </p>
      </div>

      {/* ── Vehicle Cards List ──────────────────────────────────────── */}
      <div className="space-y-3">
        {vehicles.map((v) => {
          const isActive = v.id === activeVehicleId;
          const currentSuspension = suspensionMap[v.id] || "normal";

          return (
            <div
              key={v.id}
              onClick={() => onSelectVehicle(v.id)}
              className={`bg-white rounded-[28px] p-5 border transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? "border-[#111312] shadow-[0_4px_20px_rgba(0,0,0,0.06)] ring-1 ring-[#111312]"
                  : "border-black/[0.06] hover:border-black/[0.15] shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
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
                <div className="text-[9.5px] font-mono uppercase tracking-wider text-[#767D78]">
                  {v.year} Model • {v.plugType}
                </div>
                <h4 className="text-base font-bold text-[#111312] mt-0.5">
                  {v.make} {v.model}
                </h4>
                <div className="text-[9.5px] text-[#767D78] font-mono mt-0.5">
                  VIN: {v.vin}
                </div>
              </div>

              {/* Vehicle Image with Contact Shadow */}
              <div className="relative w-full h-36 my-1 flex flex-col items-center justify-center">
                <div className="relative w-full h-32">
                  <Image
                    src={v.image}
                    alt={`${v.make} ${v.model}`}
                    fill
                    className="object-contain drop-shadow-xs select-none"
                  />
                </div>
                {/* Contact Shadow */}
                <div
                  className="w-3/5 h-2 -mt-1 rounded-full pointer-events-none opacity-60"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(17,19,18,0.5) 0%, rgba(17,19,18,0.15) 50%, rgba(17,19,18,0) 80%)",
                    filter: "blur(2px)",
                  }}
                />
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-black/[0.06] text-center text-xs">
                <div className="bg-[#FAF9F6] p-2 rounded-xl border border-black/[0.04]">
                  <div className="text-[9px] font-mono text-[#767D78]">Usable</div>
                  <div className="font-bold text-[#111312] font-mono mt-0.5">
                    {v.usableKwh}
                  </div>
                  <div className="text-[8.5px] text-[#525854]">kWh</div>
                </div>

                <div className="bg-[#FAF9F6] p-2 rounded-xl border border-black/[0.04]">
                  <div className="text-[9px] font-mono text-[#767D78]">WLTP</div>
                  <div className="font-bold text-[#111312] font-mono mt-0.5">
                    {v.wltpRangeKm}
                  </div>
                  <div className="text-[8.5px] text-[#525854]">km</div>
                </div>

                <div className="bg-[#FAF9F6] p-2 rounded-xl border border-black/[0.04]">
                  <div className="text-[9px] font-mono text-[#767D78]">Max DC</div>
                  <div className="font-bold text-[#111312] font-mono mt-0.5">
                    {v.maxDcSpeedKw}
                  </div>
                  <div className="text-[8.5px] text-[#525854]">kW</div>
                </div>

                <div className="bg-[#FAF9F6] p-2 rounded-xl border border-black/[0.04]">
                  <div className="text-[9px] font-mono text-[#767D78]">Health</div>
                  <div className="font-bold text-[#16A34A] font-mono mt-0.5">
                    {v.sohPct}%
                  </div>
                  <div className="text-[8.5px] text-[#16A34A]">Optimal</div>
                </div>
              </div>

              {/* Air Suspension Ride Height Controls */}
              {isActive && (
                <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#767D78]">
                    <Sliders size={12} />
                    <span>Chassis Air Suspension:</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: "aero", label: "Low Aero" },
                        { id: "normal", label: "Standard" },
                        { id: "high", label: "Lifted" },
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSuspensionMap((prev) => ({ ...prev, [v.id]: mode.id }));
                        }}
                        className={`text-[9.5px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                          currentSuspension === mode.id
                            ? "bg-[#111312] text-[#C8F369]"
                            : "bg-[#F4F3EE] text-[#525854] hover:bg-[#EAE8E2]"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Set Active Button if not active */}
              {!isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVehicle(v.id);
                  }}
                  className="w-full mt-3 py-2.5 bg-[#F4F3EE] hover:bg-[#EAE8E2] text-[#111312] text-xs font-semibold rounded-xl active:scale-98 transition-all border border-black/[0.05]"
                >
                  Select as Active Driver EV
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
