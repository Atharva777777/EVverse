"use client";

import React, { useState, useEffect, useId, useMemo } from "react";
import {
  MapPin,
  Navigation,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
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

  // Starting battery state
  const [startingBatteryPct, setStartingBatteryPct] = useState<number>(currentBatteryPct);
  const [showBatteryAdjust, setShowBatteryAdjust] = useState<boolean>(false);
  const batterySliderId = useId();

  // Selected charging stop
  const [primaryStopId, setPrimaryStopId] = useState<string | undefined>(undefined);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [planResult, setPlanResult] = useState<JourneyPlanResult | null>(null);

  // Compute journey plan when destination, vehicle, or battery changes
  useEffect(() => {
    let isCancelled = false;
    setIsComputing(true);

    computeEVJourneyPlan({
      origin: userLocation,
      destination: selectedDestination,
      activeVehicle,
      startingBatteryPct,
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
    startingBatteryPct,
    candidateStations,
    primaryStopId,
  ]);

  const primaryStop = planResult?.candidateStops.find(
    (s) => s.station.station_id === primaryStopId
  );

  const arrivalPct = planResult?.arrivalBatteryPct ?? Math.max(10, startingBatteryPct - 25);
  const isLowArrival = arrivalPct < 20;

  return (
    <div className="space-y-4 pb-20 max-w-lg mx-auto">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="pt-1">
        <h2 className="text-xl font-bold tracking-tight text-[#111312]">
          Plan Trip
        </h2>
        <p className="text-xs text-[#525854] mt-0.5">
          Route and charging estimates for your {activeVehicle.make} {activeVehicle.model}.
        </p>
      </div>

      {/* ── Destination Selector ─────────────────────────────────── */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[#111312]">
          Select Destination ({selectedCity})
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                className={`min-h-[44px] px-3.5 py-2 rounded-2xl border text-left shrink-0 transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-[#111312] text-white border-[#111312] shadow-sm"
                    : "bg-white text-[#111312] border-black/[0.08] hover:bg-[#F4F3EE]"
                }`}
              >
                <MapPin
                  size={14}
                  className={isSelected ? "text-[#C8F369]" : "text-[#767D78]"}
                />
                <div>
                  <div className="text-xs font-bold leading-tight">{dest.name}</div>
                  <div
                    className={`text-[10px] font-mono mt-0.5 ${
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

      {/* ── Trip Overview Card ───────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-black/[0.08] shadow-sm space-y-4">
        {/* Destination & Key Stats */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#767D78] font-semibold">
              Destination
            </div>
            <div className="text-base font-bold text-[#111312] mt-0.5">
              {selectedDestination.name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-[#111312]">
              {planResult ? `~${planResult.routeDurationMins} min` : "Calculating..."}
            </div>
            <div className="text-[10px] font-mono text-[#767D78]">
              {planResult?.routeDistanceKm || selectedDestination.distanceKm} km
            </div>
          </div>
        </div>

        {/* Battery Prediction Bar */}
        <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-black/[0.05] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#525854] font-medium flex items-center gap-1.5">
              <Zap size={14} className="text-[#16A34A]" />
              Battery Projection
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isLowArrival
                  ? "bg-[#FEE2E2] text-[#991B1B]"
                  : "bg-[#DCFCE7] text-[#15803D]"
              }`}
            >
              {isLowArrival ? "Charge Recommended" : "Plenty of Range"}
            </span>
          </div>

          {/* Simple Before & After Visual */}
          <div className="flex items-center justify-between font-mono text-sm">
            <div>
              <div className="text-[10px] text-[#767D78] uppercase">Start</div>
              <div className="font-bold text-[#111312]">{startingBatteryPct}%</div>
            </div>
            <ArrowRight size={14} className="text-[#767D78]" />
            <div className="text-right">
              <div className="text-[10px] text-[#767D78] uppercase">On Arrival</div>
              <div
                className={`font-bold ${
                  isLowArrival ? "text-[#DC2626]" : "text-[#16A34A]"
                }`}
              >
                ~{arrivalPct}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-black/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isLowArrival ? "bg-[#DC2626]" : "bg-[#16A34A]"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, arrivalPct))}%` }}
            />
          </div>

          {/* Optional Battery Adjustment Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowBatteryAdjust(!showBatteryAdjust)}
              className="text-[11px] text-[#525854] hover:text-[#111312] flex items-center gap-1 font-medium cursor-pointer"
            >
              <SlidersHorizontal size={11} />
              <span>
                {showBatteryAdjust
                  ? "Hide battery slider"
                  : "Adjust starting battery"}
              </span>
            </button>

            {showBatteryAdjust && (
              <div className="pt-2.5 pb-1 space-y-1.5 animate-in fade-in">
                <div className="flex justify-between text-[11px] font-mono text-[#525854]">
                  <span>Starting Battery: {startingBatteryPct}%</span>
                  <button
                    type="button"
                    onClick={() => setStartingBatteryPct(currentBatteryPct)}
                    className="text-[#16A34A] underline font-semibold cursor-pointer"
                  >
                    Reset ({currentBatteryPct}%)
                  </button>
                </div>
                <input
                  id={batterySliderId}
                  type="range"
                  min="15"
                  max="100"
                  step="5"
                  value={startingBatteryPct}
                  onChange={(e) => setStartingBatteryPct(Number(e.target.value))}
                  className="w-full accent-[#111312] cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Energy Note */}
        <div className="text-[11px] text-[#767D78] flex items-center justify-between">
          <span>
            Estimated trip energy: ~{planResult?.tripRequiredKwh || 18} kWh
          </span>
          <span className="font-mono text-[10px]">
            {activeVehicle.plugType.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* ── Charging Stop Section ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-black/[0.08] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-[#111312] flex items-center gap-1.5">
            <Zap size={14} className="text-[#16A34A]" />
            <span>Recommended Charging Stop</span>
          </div>
          {planResult && planResult.candidateStops.length > 1 && (
            <span className="text-[10px] font-mono text-[#767D78]">
              {planResult.candidateStops.length} stops available
            </span>
          )}
        </div>

        {primaryStop ? (
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9.5px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-[#15803D] text-white">
                  Main Stop
                </span>
                <h4 className="text-sm font-bold text-[#111312] mt-1.5">
                  {primaryStop.station.name}
                </h4>
                <p className="text-[11px] text-[#525854] mt-0.5">
                  {primaryStop.station.address || primaryStop.station.operator}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-[#15803D] font-mono">
                  {primaryStop.powerKw} kW DC
                </div>
                <div className="text-[10px] text-[#767D78]">
                  ~{primaryStop.estimatedChargeDurationMins} min charge
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#86EFAC]/40 text-[11px] text-[#15803D] font-medium">
              <span>{primaryStop.distanceAlongRouteKm} km along route</span>
              <span>Arrive at ~{primaryStop.arrivalBatteryPct}% battery</span>
            </div>

            {/* If there are other candidate stops, allow switching */}
            {planResult && planResult.candidateStops.length > 1 && (
              <div className="pt-1">
                <label className="text-[10px] text-[#525854] block mb-1">
                  Choose a different stop along route:
                </label>
                <select
                  value={primaryStopId || ""}
                  onChange={(e) => setPrimaryStopId(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-black/[0.1] bg-white text-[#111312] cursor-pointer"
                >
                  {planResult.candidateStops.map((stop) => (
                    <option
                      key={stop.station.station_id}
                      value={stop.station.station_id}
                    >
                      {stop.station.name} ({stop.powerKw} kW • {stop.distanceAlongRouteKm} km)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-black/[0.05] text-center space-y-1">
            <div className="text-xs font-semibold text-[#111312]">
              Direct Drive Possible
            </div>
            <p className="text-[11px] text-[#525854]">
              You have enough battery to reach {selectedDestination.name} without stopping to charge.
            </p>
          </div>
        )}
      </div>

      {/* ── Start Navigation Button ──────────────────────────────── */}
      <div className="pt-2">
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
          className="w-full min-h-[52px] py-3.5 bg-[#111312] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#252826] active:scale-[0.99] transition-all shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#111312]"
        >
          <Navigation size={16} className="text-[#C8F369]" />
          <span>Start Navigation</span>
          <ArrowRight size={16} className="text-[#C8F369]" />
        </button>
      </div>
    </div>
  );
}
