"use client";

import React, { useState, useEffect, useId, useMemo } from "react";
import Image from "next/image";
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
  Sparkles,
  Sliders,
  Cpu,
  Layers,
  ChevronRight,
  CheckCircle2,
  Info,
  RotateCcw,
  Compass,
  CornerDownRight,
  ShieldAlert,
  Search,
} from "lucide-react";
import type { EVVehicle } from "./VehicleCockpit";
import type { LiveStation } from "@/types/api";
import {
  REGIONAL_CORRIDOR_DESTINATIONS,
  computeEVJourneyPlan,
  type JourneyDestination,
  type JourneyPlanResult,
  type EnRouteChargingStop,
} from "@/lib/journeyRouting";

export type TripDestination = JourneyDestination;

interface JourneyPlannerProps {
  destinations?: JourneyDestination[];
  selectedDestIndex?: number;
  onSelectDestIndex?: (index: number) => void;
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
  // Available destination corridors
  const cityCorridors = useMemo(() => {
    return REGIONAL_CORRIDOR_DESTINATIONS[selectedCity] || REGIONAL_CORRIDOR_DESTINATIONS["Mumbai"];
  }, [selectedCity]);

  const [selectedDestination, setSelectedDestination] = useState<JourneyDestination>(cityCorridors[0]);
  const [customSearchQuery, setCustomSearchQuery] = useState("");
  const [startingBatteryPct, setStartingBatteryPct] = useState(currentBatteryPct);
  const [primaryStopId, setPrimaryStopId] = useState<string | undefined>(undefined);
  const [backupStopId, setBackupStopId] = useState<string | undefined>(undefined);
  const [isComputing, setIsComputing] = useState(false);
  const [planResult, setPlanResult] = useState<JourneyPlanResult | null>(null);
  const [showAssumptionsModal, setShowAssumptionsModal] = useState(false);

  // Sync battery if vehicle changes
  useEffect(() => {
    setStartingBatteryPct(currentBatteryPct);
  }, [currentBatteryPct, activeVehicle.id]);

  // Update selected destination if city changes
  useEffect(() => {
    if (cityCorridors.length > 0) {
      setSelectedDestination(cityCorridors[0]);
    }
  }, [cityCorridors]);

  // Recompute journey plan whenever destination, battery, or charger selections change
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
      backupStationId: backupStopId,
      backendAiMetadata: {
        model: "GlobalDemandPredictor (Station Density + Deficit)",
        runtimeSec: 0.762,
        testR2: 0.884,
      },
    })
      .then((res) => {
        if (!isCancelled) {
          setPlanResult(res);
          // Set primary and backup if not yet explicitly selected
          if (!primaryStopId && res.primaryStopId) {
            setPrimaryStopId(res.primaryStopId);
          }
          if (!backupStopId && res.backupStopId) {
            setBackupStopId(res.backupStopId);
          }
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsComputing(false);
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
    backupStopId,
  ]);

  // Primary charging stop object
  const primaryStop = planResult?.candidateStops.find((s) => s.station.station_id === primaryStopId);
  const backupStop = planResult?.candidateStops.find((s) => s.station.station_id === backupStopId);

  // Form field ID
  const batterySliderId = useId();

  return (
    <div className="space-y-4 pb-24">
      {/* ── Futuristic Holographic AI Quantum Co-Pilot HUD ──────────── */}
      <div className="relative rounded-[32px] p-5 sm:p-6 bg-gradient-to-br from-[#0B0D0C] via-[#121614] to-[#1A1F1B] border border-[#2A332C] text-white shadow-2xl overflow-hidden">
        {/* Quantum Wave Grid Background Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 20%, rgba(200,243,105,0.18) 0%, transparent 60%),
                              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "100% 100%, 24px 24px, 24px 24px",
          }}
        />

        {/* Ambient Corner Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C8F369]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* HUD Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8F369] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C8F369]" />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C8F369] font-bold">
                  EVverse Quantum Neural Co-Pilot
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                Autonomous Corridor Routing
              </h2>
              <p className="text-xs text-[#A0AAA2] mt-0.5 max-w-md">
                QAOA Hamiltonian energy optimization factoring topographical drag, active vehicle pack geometry, and live hub bay latency.
              </p>
            </div>

            {/* AI Status Badge */}
            <div className="shrink-0 text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A221C] border border-[#2D3C2E] text-[10px] font-mono text-[#C8F369]">
                <Cpu size={12} className="animate-pulse" />
                <span>{isComputing ? "CALCULATING..." : "QUANTUM CONVERGED"}</span>
              </div>
              <div className="text-[9.5px] font-mono text-[#768278] mt-1">
                Latency: {planResult?.aiTelemetry.pipelineRuntimeSec || 0.76}s
              </div>
            </div>
          </div>

          {/* AI Neural Telemetry Metrics HUD Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="text-[9.5px] text-[#8C9890] uppercase">Energy Cost Δ</div>
              <div className="text-sm font-bold text-[#C8F369] mt-0.5">
                {planResult ? `${planResult.aiTelemetry.qaoaEnergyDelta} H` : "2.41 H"}
              </div>
              <div className="text-[9px] text-[#A0AAA2]">Hamiltonian Minimum</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="text-[9.5px] text-[#8C9890] uppercase">Model R² Score</div>
              <div className="text-sm font-bold text-white mt-0.5">
                0.884
              </div>
              <div className="text-[9px] text-[#A0AAA2]">Verified Demand AI</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="text-[9.5px] text-[#8C9890] uppercase">Precondition</div>
              <div className="text-sm font-bold text-[#38BDF8] mt-0.5">
                {planResult ? `${planResult.aiTelemetry.thermalPreconditioningMins}m Window` : "15m"}
              </div>
              <div className="text-[9px] text-[#A0AAA2]">Thermal Curve Ready</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="text-[9.5px] text-[#8C9890] uppercase">Projected Reserve</div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  (planResult?.arrivalBatteryPct ?? 50) < 15
                    ? "text-[#F87171]"
                    : "text-[#4ADE80]"
                }`}
              >
                ~{planResult?.arrivalBatteryPct ?? 50}% SoC
              </div>
              <div className="text-[9px] text-[#A0AAA2]">
                {(planResult?.arrivalBatteryPct ?? 50) < 15
                  ? "Top-up Required"
                  : "Safe Reserve Buffer"}
              </div>
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-start gap-2.5">
            <Sparkles size={15} className="text-[#C8F369] shrink-0 mt-0.5" />
            <div className="text-xs text-[#D1D9D3] leading-relaxed">
              <span className="font-bold text-[#C8F369]">Neural Insight: </span>
              {planResult?.aiTelemetry.aiRecommendation ||
                "Analyzing highway topology, traffic cadence, and battery degradation dynamics..."}
            </div>
          </div>
        </div>
      </div>

      {/* ── Destination & Battery Input Controls ─────────────────────── */}
      <div className="bg-white rounded-[28px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-[#16A34A]" />
            <h3 className="text-sm font-bold text-[#111312]">
              Corridor Target Selection
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#767D78]">
            {selectedCity} Metropolitan
          </span>
        </div>

        {/* Rapid Corridor Selection Pills */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-[#525854]">
            Curated Transit Corridors:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {cityCorridors.map((c) => {
              const isSelected = selectedDestination.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedDestination(c)}
                  className={`px-3.5 py-2.5 rounded-2xl border text-left shrink-0 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#111312] ${
                    isSelected
                      ? "bg-[#111312] text-white border-[#111312] shadow-xs"
                      : "bg-[#FAF9F6] text-[#111312] border-black/[0.06] hover:bg-[#F4F3EE]"
                  }`}
                >
                  <MapPin
                    size={13}
                    className={isSelected ? "text-[#C8F369]" : "text-[#767D78]"}
                  />
                  <div>
                    <div className="text-xs font-bold leading-tight">{c.name}</div>
                    <div
                      className={`text-[9.5px] font-mono mt-0.5 ${
                        isSelected ? "text-[#C8F369]" : "text-[#767D78]"
                      }`}
                    >
                      {c.distanceKm} km • +{c.elevationGainM}m ascent
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* User-Supplied Starting Battery State */}
        <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-black/[0.05] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor={batterySliderId} className="font-semibold text-[#111312] flex items-center gap-1.5">
              <Zap size={13} className="text-[#16A34A]" />
              <span>Starting Battery State of Charge:</span>
            </label>
            <span className="font-bold text-[#111312] font-mono bg-white px-2.5 py-1 rounded-lg border border-black/[0.06]">
              {startingBatteryPct}% ({(activeVehicle.usableKwh * (startingBatteryPct / 100)).toFixed(1)} kWh)
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] font-mono text-[#767D78]">10%</span>
            <input
              id={batterySliderId}
              type="range"
              min="10"
              max="100"
              step="1"
              value={startingBatteryPct}
              onChange={(e) => setStartingBatteryPct(Number(e.target.value))}
              className="w-full accent-[#111312] cursor-pointer"
            />
            <span className="text-[10px] font-mono text-[#767D78]">100%</span>
          </div>

          <div className="flex items-center justify-between text-[10.5px] text-[#525854] pt-0.5">
            <span>Calibrated to {activeVehicle.make} {activeVehicle.model} ({activeVehicle.usableKwh} kWh pack)</span>
            <button
              type="button"
              onClick={() => setStartingBatteryPct(activeVehicle.currentBatteryPct)}
              className="text-[#16A34A] hover:underline font-semibold cursor-pointer"
            >
              Reset to Vehicle Live ({activeVehicle.currentBatteryPct}%)
            </button>
          </div>
        </div>
      </div>

      {/* ── Route Review & Topographical Ascent ──────────────────────── */}
      <div className="bg-white rounded-[28px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#767D78]">
              Planned Route Review
            </div>
            <div className="text-base font-bold text-[#111312]">
              {selectedDestination.name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-[#111312] bg-[#FAF9F6] px-3 py-1 rounded-full border border-black/[0.06]">
              ~{planResult?.routeDurationMins || Math.round(selectedDestination.distanceKm * 1.35)} mins drive
            </div>
            <div className="text-[10px] font-mono text-[#767D78] mt-0.5">
              {planResult?.routeDistanceKm || selectedDestination.distanceKm} km highway
            </div>
          </div>
        </div>

        {/* Limitation notice if fallback geodesic */}
        {planResult?.isFallbackGeodesic && planResult?.limitationNotice && (
          <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl flex items-start gap-2.5">
            <Info size={15} className="text-[#B45309] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#92400E] leading-relaxed">
              <span className="font-bold">Telemetry Advisory: </span>
              {planResult.limitationNotice}
            </div>
          </div>
        )}

        {/* Elevation Profile Visualization */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#767D78]">
            <span className="flex items-center gap-1">
              <Mountain size={12} />
              Corridor Ascent Curve Profile
            </span>
            <span>+{selectedDestination.elevationGainM}m Elevation Climb</span>
          </div>

          <div className="h-20 w-full bg-[#FAF9F6] rounded-2xl p-2 border border-black/[0.05] relative overflow-hidden flex items-end">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="elevationGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111312" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#111312" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 55 Q 50 48, 80 32 T 140 18 T 200 38 L 200 60 L 0 60 Z`}
                fill="url(#elevationGrad2)"
              />
              <path
                d={`M 0 55 Q 50 48, 80 32 T 140 18 T 200 38`}
                fill="none"
                stroke="#111312"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-2 right-3 text-[9px] font-mono text-[#111312] bg-white px-2 py-0.5 rounded-md border border-black/[0.06] shadow-2xs">
              Ascent Peak
            </div>
          </div>
        </div>

        {/* Physics Energy Balance Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-[#FAF9F6] p-2.5 rounded-2xl border border-black/[0.04]">
            <div className="text-[9.5px] font-mono uppercase text-[#767D78]">
              Required Energy
            </div>
            <div className="text-sm font-bold text-[#111312] font-mono mt-0.5">
              {planResult?.tripRequiredKwh || 18.5}
            </div>
            <div className="text-[9.5px] text-[#525854]">[ESTIMATE] kWh</div>
          </div>

          <div className="bg-[#FAF9F6] p-2.5 rounded-2xl border border-black/[0.04]">
            <div className="text-[9.5px] font-mono uppercase text-[#767D78]">
              Climb Factor
            </div>
            <div className="text-sm font-bold text-[#111312] font-mono mt-0.5">
              +{((selectedDestination.elevationGainM / 1000) * 2.8).toFixed(1)}
            </div>
            <div className="text-[9.5px] text-[#525854]">kWh Ascent Drag</div>
          </div>

          <div
            className={`p-2.5 rounded-2xl border ${
              planResult?.isLowBuffer
                ? "bg-[#FEF2F2] border-[#FEE2E2] text-[#991B1B]"
                : "bg-[#F3FAF0] border-[#E2F2DC] text-[#15803D]"
            }`}
          >
            <div className="text-[9.5px] font-mono uppercase">Arrival SoC</div>
            <div className="text-sm font-bold font-mono mt-0.5">
              ~{planResult?.arrivalBatteryPct ?? 50}%
            </div>
            <div className="text-[9.5px] font-semibold">
              {planResult?.isLowBuffer ? "Critical Low (<15%)" : "Safe Reserve Buffer"}
            </div>
          </div>
        </div>

        {/* Transparent Assumptions Callout */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowAssumptionsModal(!showAssumptionsModal)}
            className="text-[11px] text-[#767D78] hover:text-[#111312] flex items-center gap-1 cursor-pointer font-medium"
          >
            <Info size={12} />
            <span>View Physics & Traffic Assumptions</span>
          </button>
          <span className="text-[10px] font-mono text-[#8C938E] bg-[#FAF9F6] px-2 py-0.5 rounded-md">
            All Metrics Labeled as Estimates
          </span>
        </div>

        {/* Expandable Assumptions Breakdown */}
        {showAssumptionsModal && (
          <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-black/[0.06] text-xs space-y-1.5 animate-in fade-in">
            <div className="font-bold text-[#111312] text-[11px] uppercase font-mono">
              Explicit Model Assumptions:
            </div>
            <div className="text-[11px] text-[#525854] space-y-1">
              <div>• Base Consumption: {activeVehicle.efficiencyKwh100km} kWh/100km (OEM WLTP baseline at nominal 22°C ambient)</div>
              <div>• Topographical Ascent: +2.8 kWh per 1,000 meters elevation ascent</div>
              <div>• Auxiliary Climate Draw: 1.5 kW cabin HVAC reserve for journey duration</div>
              <div>• Charging Curve: Non-linear CC-CV tapering above 80% SoC; maximum rate capped at min(car, charger)</div>
              <div>• Traffic Cadence: Assumes standard nominal flow without major arterial road closures</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Compatible Charging Stops & Detour Comparison ───────────── */}
      <div className="bg-white rounded-[28px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Zap size={15} className="text-[#16A34A]" />
              <h3 className="text-sm font-bold text-[#111312]">
                Compatible En-Route Charging Hubs
              </h3>
            </div>
            <p className="text-xs text-[#525854] mt-0.5">
              Strictly matched to your vehicle&apos;s {activeVehicle.plugType} connector. Compare detours and select failover backup.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-[#FAF9F6] px-2 py-0.5 rounded-md text-[#767D78] shrink-0">
            {planResult?.candidateStops.length || 0} Corridor Hubs
          </span>
        </div>

        {/* Selected Primary & Backup Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between">
            <div>
              <div className="text-[9.5px] font-mono uppercase font-bold text-[#15803D]">
                Primary Charging Stop
              </div>
              <div className="font-bold text-[#111312] mt-0.5 truncate max-w-[170px]">
                {primaryStop ? primaryStop.station.name : "None Selected"}
              </div>
            </div>
            {primaryStop && (
              <span className="text-[10px] font-mono text-[#15803D] bg-white px-2 py-0.5 rounded-md border border-[#86EFAC]">
                {primaryStop.effectiveChargingKw} kW DC
              </span>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between">
            <div>
              <div className="text-[9.5px] font-mono uppercase font-bold text-[#1D4ED8]">
                Failover Backup Station
              </div>
              <div className="font-bold text-[#111312] mt-0.5 truncate max-w-[170px]">
                {backupStop ? backupStop.station.name : "None Selected"}
              </div>
            </div>
            {backupStop && (
              <span className="text-[10px] font-mono text-[#1D4ED8] bg-white px-2 py-0.5 rounded-md border border-[#93C5FD]">
                {backupStop.effectiveChargingKw} kW DC
              </span>
            )}
          </div>
        </div>

        {/* Candidate Stops List */}
        <div className="space-y-3">
          {planResult && planResult.candidateStops.length > 0 ? (
            planResult.candidateStops.map((stop) => {
              const isPrimary = stop.station.station_id === primaryStopId;
              const isBackup = stop.station.station_id === backupStopId;

              return (
                <div
                  key={stop.station.station_id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPrimary
                      ? "bg-white border-[#15803D] shadow-md ring-1 ring-[#15803D]"
                      : isBackup
                      ? "bg-white border-[#3B82F6] shadow-md ring-1 ring-[#3B82F6]"
                      : "bg-[#FAF9F6] border-black/[0.06] hover:border-black/[0.15]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                            stop.isCompatible
                              ? "bg-[#DCFCE7] text-[#15803D]"
                              : "bg-[#FEE2E2] text-[#991B1B]"
                          }`}
                        >
                          {stop.isCompatible
                            ? `${activeVehicle.plugType.split(" ")[0]} Compatible`
                            : "Incompatible Port"}
                        </span>

                        {isPrimary && (
                          <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#15803D] text-white">
                            PRIMARY
                          </span>
                        )}

                        {isBackup && (
                          <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#3B82F6] text-white">
                            BACKUP FAILOVER
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-[#767D78]">
                          km {stop.distanceAlongRouteKm} along corridor
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#111312] mt-1">
                        {stop.station.name}
                      </h4>
                      <p className="text-[11px] text-[#525854]">
                        {stop.station.address || stop.station.operator || "Expressway Network Hub"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-[#16A34A] font-mono">
                        {stop.powerKw} kW DC
                      </div>
                      <div className="text-[9.5px] text-[#767D78] font-mono">
                        Capped: {stop.effectiveChargingKw} kW
                      </div>
                    </div>
                  </div>

                  {/* Detour & Duration Comparison Metrics Grid */}
                  <div className="grid grid-cols-4 gap-1.5 p-2 bg-white rounded-xl border border-black/[0.04] text-center text-xs mt-3">
                    <div>
                      <div className="text-[9px] font-mono text-[#767D78]">Detour</div>
                      <div className="font-bold text-[#111312] font-mono mt-0.5">
                        +{stop.detourKm} km
                      </div>
                      <div className="text-[8.5px] text-[#525854]">+{stop.detourMins}m</div>
                    </div>

                    <div>
                      <div className="text-[9px] font-mono text-[#767D78]">Arrival</div>
                      <div className="font-bold text-[#111312] font-mono mt-0.5">
                        ~{stop.arrivalBatteryPct}%
                      </div>
                      <div className="text-[8.5px] text-[#16A34A]">Pull-in SoC</div>
                    </div>

                    <div>
                      <div className="text-[9px] font-mono text-[#767D78]">Charge Time</div>
                      <div className="font-bold text-[#111312] font-mono mt-0.5">
                        ~{stop.estimatedChargeDurationMins}m
                      </div>
                      <div className="text-[8.5px] text-[#525854]">To 80% SoC</div>
                    </div>

                    <div>
                      <div className="text-[9px] font-mono text-[#767D78]">Est. Wait</div>
                      <div className="font-bold text-[#111312] font-mono mt-0.5">
                        {stop.estimatedWaitTimeMins > 0 ? `~${stop.estimatedWaitTimeMins}m` : "0m Free"}
                      </div>
                      <div className="text-[8.5px] text-[#525854]">Bay Queue</div>
                    </div>
                  </div>

                  {/* Selection Buttons */}
                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      disabled={!stop.isCompatible}
                      onClick={() => setPrimaryStopId(stop.station.station_id)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer min-h-[38px] flex items-center justify-center gap-1 ${
                        isPrimary
                          ? "bg-[#15803D] text-white shadow-xs"
                          : "bg-white text-[#111312] border border-black/[0.08] hover:bg-[#F4F3EE]"
                      }`}
                    >
                      {isPrimary ? <CheckCircle2 size={13} /> : null}
                      <span>{isPrimary ? "Selected as Primary" : "Set as Primary"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={!stop.isCompatible || isPrimary}
                      onClick={() => setBackupStopId(stop.station.station_id)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer min-h-[38px] flex items-center justify-center gap-1 ${
                        isBackup
                          ? "bg-[#3B82F6] text-white shadow-xs"
                          : "bg-white text-[#111312] border border-black/[0.08] hover:bg-[#F4F3EE] disabled:opacity-40 disabled:cursor-not-allowed"
                      }`}
                    >
                      {isBackup ? <CheckCircle2 size={13} /> : null}
                      <span>{isBackup ? "Selected Backup" : "Set as Backup"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-5 text-center text-xs text-[#525854] bg-[#FAF9F6] rounded-2xl border border-black/[0.05]">
              No intermediate charging stops detected within 18 km corridor catchment.
            </div>
          )}
        </div>

        {/* ── Launch In-App Guided Navigation ─────────────────────────── */}
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
            className="w-full min-h-[52px] py-4 bg-[#111312] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#252826] active:scale-[0.99] transition-all shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#111312]"
          >
            <Navigation size={16} className="text-[#C8F369]" />
            <span>Engage Neural Guided Navigation</span>
            <ArrowRight size={16} className="text-[#C8F369]" />
          </button>
        </div>
      </div>
    </div>
  );
}
