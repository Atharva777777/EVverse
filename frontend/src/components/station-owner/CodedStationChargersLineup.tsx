"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Zap, CheckCircle2 } from "lucide-react";

export interface StationChargerHardware {
  id: string;
  name: string;
  modelCode: string;
  powerKw: number;
  type: string;
  tariff: string;
  status: "available" | "in_use" | "reserved";
  currentKw?: number;
  activeVehicle?: string;
  pillGradient: string;
}

interface CodedStationChargersLineupProps {
  stationName: string;
  chargers?: StationChargerHardware[];
}

const DEFAULT_CHARGERS: StationChargerHardware[] = [
  {
    id: "CHG-01",
    name: "Volt-DC 180",
    modelCode: "180 kW Turbo",
    powerKw: 180,
    type: "CCS2 Dual",
    tariff: "₹18.50/kWh",
    status: "in_use",
    currentKw: 148,
    activeVehicle: "Porsche Taycan",
    pillGradient: "linear-gradient(135deg, #CFE7FA 0%, #B2D8F7 100%)",
  },
  {
    id: "CHG-02",
    name: "Wall Connector",
    modelCode: "22 kW AC",
    powerKw: 22,
    type: "Type 2",
    tariff: "₹12.00/kWh",
    status: "in_use",
    currentKw: 22,
    activeVehicle: "MG ZS EV",
    pillGradient: "linear-gradient(135deg, #A8E6CF 0%, #DCEDC1 100%)",
  },
  {
    id: "CHG-03",
    name: "Dual Core 120",
    modelCode: "120 kW Fast",
    powerKw: 120,
    type: "CCS2 Dual",
    tariff: "₹16.00/kWh",
    status: "available",
    pillGradient: "linear-gradient(135deg, #FFEAA7 0%, #FDCB6E 100%)",
  },
];

export function CodedStationChargersLineup({
  stationName,
  chargers = DEFAULT_CHARGERS,
}: CodedStationChargersLineupProps) {
  const [selectedChargerId, setSelectedChargerId] = useState<string>(
    chargers[0]?.id || "CHG-01"
  );

  const selectedCharger =
    chargers.find((c) => c.id === selectedChargerId) || chargers[0];

  return (
    <div className="rounded-3xl overflow-hidden border border-black/[0.06] bg-white p-3.5 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-bold text-[#111312]">Charger Lineup</span>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
          All Online
        </span>
      </div>

      {/* Studio Hardware Photo */}
      <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-[#FAF9F6]">
        <Image
          src="/images/station-chargers-lineup.jpg"
          alt={`${stationName} hardware`}
          fill
          className="object-contain"
          sizes="(max-width: 480px) 100vw, 400px"
          priority
        />
      </div>

      {/* Hardware Capsule Selectors */}
      <div className="grid grid-cols-3 gap-2">
        {chargers.map((chg) => {
          const isSelected = chg.id === selectedChargerId;
          return (
            <button
              key={chg.id}
              type="button"
              onClick={() => setSelectedChargerId(chg.id)}
              className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[82px] ${
                isSelected
                  ? "border-[#111312] bg-[#FAF9F6] shadow-2xs"
                  : "border-black/[0.06] bg-white hover:bg-[#FAF9F6]"
              }`}
            >
              {/* Capsule Pill Background Graphic */}
              <div
                className="w-10 h-5 rounded-full flex items-center justify-center shadow-2xs mb-1"
                style={{ background: chg.pillGradient }}
              >
                <div className="w-2 h-2 rounded-full bg-[#111312]" />
              </div>

              <div>
                <p className="text-[11px] font-bold text-[#111312] leading-tight line-clamp-1">
                  {chg.name}
                </p>
                <p className="text-[9.5px] text-black/50 font-mono mt-0.5">
                  {chg.powerKw} kW
                </p>
              </div>

              <span className="text-[9.5px] font-bold text-emerald-600 mt-0.5">
                {chg.tariff}
              </span>
            </button>
          );
        })}
      </div>

      {/* Clean Selected Unit Info Row */}
      {selectedCharger && (
        <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                selectedCharger.status === "in_use"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-emerald-500"
              }`}
            />
            <span className="font-semibold text-[#111312]">
              {selectedCharger.name}
            </span>
            <span className="text-black/40 text-[11px]">
              • {selectedCharger.type}
            </span>
          </div>

          <div className="text-right">
            {selectedCharger.status === "in_use" && selectedCharger.currentKw ? (
              <span className="font-mono font-bold text-blue-600 text-[11px]">
                {selectedCharger.currentKw} kW in use
              </span>
            ) : (
              <span className="font-semibold text-emerald-600 text-[11px]">
                Available
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
