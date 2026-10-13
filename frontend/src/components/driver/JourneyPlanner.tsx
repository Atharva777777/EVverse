"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Navigation,
  ArrowRight,
  Zap,
} from "lucide-react";
import type { EVVehicle } from "./VehicleCockpit";
import type { LiveStation } from "@/types/api";
import {
  REGIONAL_CORRIDOR_DESTINATIONS,
  computeEVJourneyPlan,
  type JourneyDestination,
  type JourneyPlanResult,
} from "@/lib/journeyRouting";

interface JourneyPlannerProps {
  activeVehicle: EVVehicle;
  currentBatteryPct: number;
  candidateStations: LiveStation[];
  userLocation: [number, number];
  selectedCity?: string;
  onStartTripNavigation: (dest: {
    name: string;
    latitude: number;
    longitude: number;
    primaryStation?: LiveStation;
  }) => void;
}

export function JourneyPlanner({
  activeVehicle,
  currentBatteryPct,
  candidateStations,
  userLocation,
  selectedCity = "Mumbai",
  onStartTripNavigation,
}: JourneyPlannerProps) {
  // Destination options for current city
  const cityCorridors = useMemo(() => {
    return (
      REGIONAL_CORRIDOR_DESTINATIONS[selectedCity] ||
      REGIONAL_CORRIDOR_DESTINATIONS["Mumbai"]
    );
  }, [selectedCity]);

  const [selectedDestination, setSelectedDestination] = useState<JourneyDestination>(
    cityCorridors[0]
  );

  // Sync destination if city changes
  useEffect(() => {
    setSelectedDestination(cityCorridors[0]);
  }, [cityCorridors]);

  // Selected charging stop & plan result
  const [primaryStopId, setPrimaryStopId] = useState<string | undefined>(undefined);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [planResult, setPlanResult] = useState<JourneyPlanResult | null>(null);

  // Compute journey plan using current battery and selected destination
  useEffect(() => {
    let isCancelled = false;
    setIsComputing(true);

    computeEVJourneyPlan({
      origin: userLocation,
      destination: selectedDestination,
      activeVehicle,
      startingBatteryPct: currentBatteryPct,
      candidateStations,
      primaryStationId: primaryStopId,
    })
      .then((res) => {
        if (!isCancelled) {
          setPlanResult(res);
          setIsComputing(false);
          if (!primaryStopId && res.primaryStopId) {
            setPrimaryStopId(res.primaryStopId);
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setIsComputing(false);
          console.warn("[QuantEV] Journey plan error:", err);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    userLocation,
    selectedDestination,
    activeVehicle,
    currentBatteryPct,
    candidateStations,
    primaryStopId,
  ]);

  const primaryStop = planResult?.candidateStops.find(
    (s) => s.station.station_id === primaryStopId
  );

  const arrivalPct = planResult?.arrivalBatteryPct ?? Math.max(10, currentBatteryPct - 25);
  const isLowArrival = arrivalPct < 15;

  return (
    <div className="w-full flex-1 flex flex-col justify-between gap-2.5 sm:gap-3 max-w-lg mx-auto h-full">
      {/* ── Top Header & Destination Selector ────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#111312] leading-none">
              Plan Trip
            </h2>
            <p className="text-[11px] text-[#525854] mt-0.5">
              {selectedCity} corridors
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold bg-[#FAF9F6] border border-black/[0.08] px-2.5 py-1 rounded-xl text-[#111312]">
            {activeVehicle.make} • {currentBatteryPct}%
          </span>
        </div>

        {/* Destination Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {cityCorridors.map((dest) => {
            const isSelected = selectedDestination.id === dest.id;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => {
                  setSelectedDestination(dest);
                  setPrimaryStopId(undefined);
                }}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#111312] text-white border-[#111312] shadow-xs"
                    : "bg-white text-[#111312] border-black/[0.08] hover:bg-[#F4F3EE]"
                }`}
              >
                <MapPin
                  size={13}
                  className={isSelected ? "text-[#C8F369]" : "text-[#767D78]"}
                />
                <div>
                  <div className="text-xs font-bold leading-tight">{dest.name}</div>
                  <div
                    className={`text-[9.5px] font-mono ${
                      isSelected ? "text-[#C8F369]" : "text-[#767D78]"
                    }`}
                  >
                    {dest.distanceKm} km
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Trip & Battery Overview Card ─────────────────────────── */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-black/[0.08] shadow-xs space-y-2.5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9.5px] font-mono uppercase tracking-wider text-[#767D78]">
              Route
            </div>
            <div className="text-sm font-bold text-[#111312] mt-0.5">
              {selectedDestination.name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-[#111312]">
              {isComputing
                ? "Calculating..."
                : planResult
                ? `~${planResult.routeDurationMins} min`
                : "Estimating..."}
            </div>
            <div className="text-[10px] font-mono text-[#767D78]">
              {planResult?.routeDistanceKm || selectedDestination.distanceKm} km
            </div>
          </div>
        </div>

        {/* Battery Prediction Bar */}
        <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-black/[0.05] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#525854] text-[11px] font-sans font-medium flex items-center gap-1">
              <Zap size={13} className="text-[#16A34A]" />
              Battery
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#111312]">{currentBatteryPct}%</span>
              <ArrowRight size={12} className="text-[#767D78]" />
              <span
                className={`font-bold ${
                  isLowArrival ? "text-[#DC2626]" : "text-[#16A34A]"
                }`}
              >
                ~{arrivalPct}%
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isLowArrival ? "bg-[#DC2626]" : "bg-[#16A34A]"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, arrivalPct))}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10.5px] text-[#767D78]">
          <span>Trip energy: ~{planResult?.tripRequiredKwh || 18} kWh</span>
          <span
            className={`font-semibold ${
              isLowArrival ? "text-[#DC2626]" : "text-[#15803D]"
            }`}
          >
            {isLowArrival ? "Charge Recommended" : "Plenty of Range"}
          </span>
        </div>
      </div>

      {/* ── Recommended Stop Section ──────────────────────────────── */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-black/[0.08] shadow-xs">
        <div className="text-[11px] font-semibold text-[#111312] flex items-center gap-1.5 mb-2">
          <Zap size={13} className="text-[#16A34A]" />
          <span>Recommended Stop</span>
        </div>

        {primaryStop ? (
          <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#111312] truncate">
                  {primaryStop.station.name}
                </div>
                <div className="text-[10px] text-[#525854] truncate mt-0.5">
                  {primaryStop.station.address || primaryStop.station.operator}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-[#15803D] font-mono">
                  {primaryStop.powerKw} kW DC
                </div>
                <div className="text-[9.5px] text-[#767D78]">
                  ~{primaryStop.estimatedChargeDurationMins}m charge
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#86EFAC]/40 text-[10px] text-[#15803D] font-medium">
              <span>{primaryStop.distanceAlongRouteKm} km into trip</span>
              <span>Arrive with ~{primaryStop.arrivalBatteryPct}%</span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-black/[0.05] text-center">
            <div className="text-xs font-semibold text-[#111312]">Direct Drive</div>
            <p className="text-[10.5px] text-[#525854] mt-0.5">
              No charging needed to reach {selectedDestination.name}.
            </p>
          </div>
        )}
      </div>

      {/* ── Start Navigation Button ──────────────────────────────── */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={() =>
            onStartTripNavigation({
              name: selectedDestination.name,
              latitude: selectedDestination.lat,
              longitude: selectedDestination.lng,
              primaryStation: primaryStop?.station,
            })
          }
          className="w-full min-h-[46px] py-3 bg-[#111312] text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#252826] active:scale-[0.99] transition-all shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-[#111312]"
        >
          <Navigation size={15} className="text-[#C8F369]" />
          <span>Start Navigation</span>
          <ArrowRight size={15} className="text-[#C8F369]" />
        </button>
      </div>
    </div>
  );
}
