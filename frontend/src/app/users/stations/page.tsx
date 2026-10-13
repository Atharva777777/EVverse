"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { BrandLogo } from "@/components/BrandLogo";
import { useLiveData } from "@/hooks/useLiveData";
import { CITY_CONFIGS } from "@/components/CountryCitySelector";
import type { LiveStation } from "@/types/api";
import {
  Search,
  Navigation,
  Car,
  Zap,
  MapPin,
  Clock,
  ArrowRight,
  X,
  Heart,
  Share2,
  ChevronRight,
  Maximize2,
  Minimize2,
  BatteryCharging,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  Activity,
  Lock,
  Unlock,
  TrendingUp,
  Gauge,
  Thermometer,
  SunMedium,
  Cpu,
} from "lucide-react";

const DriverMobileMap = dynamic(
  () => import("@/components/DriverMobileMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F7F8F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#86868b",
          fontSize: "13px",
        }}
      >
        Loading EV Map…
      </div>
    ),
  }
);

// Distance helper
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Pre-defined vehicle garage models
const GARAGE_VEHICLES = [
  {
    id: "porsche",
    make: "Porsche",
    model: "Taycan GTS",
    year: 2025,
    image: "/images/car-porsche.png",
    batteryKwh: 93.4,
    currentBatteryPct: 78,
    wltpRangeKm: 504,
    currentRangeKm: 392,
    maxDcSpeedKw: 270,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    accentColor: "#151817",
  },
  {
    id: "bmw",
    make: "BMW",
    model: "i7 xDrive60",
    year: 2025,
    image: "/images/car-bmw.png",
    batteryKwh: 101.7,
    currentBatteryPct: 62,
    wltpRangeKm: 625,
    currentRangeKm: 388,
    maxDcSpeedKw: 195,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    accentColor: "#4072b8",
  },
  {
    id: "mercedes",
    make: "Mercedes-Benz",
    model: "EQS 580 4MATIC",
    year: 2025,
    image: "/images/car-sclass.png",
    batteryKwh: 107.8,
    currentBatteryPct: 85,
    wltpRangeKm: 770,
    currentRangeKm: 654,
    maxDcSpeedKw: 200,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    accentColor: "#151817",
  },
  {
    id: "rangerover",
    make: "Range Rover",
    model: "Electric Autobiography",
    year: 2026,
    image: "/images/car-rangerover.png",
    batteryKwh: 110.0,
    currentBatteryPct: 54,
    wltpRangeKm: 520,
    currentRangeKm: 280,
    maxDcSpeedKw: 220,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    accentColor: "#151817",
  },
];

export default function EVVerseDriverPage() {
  // Five persistent navigation destinations
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "journeys" | "charging" | "garage">("explore");

  // Mobile device frame view toggle for desktop users
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Selected city & live data
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const cityConfig = CITY_CONFIGS[selectedCity] || CITY_CONFIGS["Mumbai"];

  // Active Vehicle
  const [activeVehicleId, setActiveVehicleId] = useState("porsche");
  const activeVehicle = GARAGE_VEHICLES.find((v) => v.id === activeVehicleId) || GARAGE_VEHICLES[0];

  // User Location (slightly offset from city centroid)
  const [userLocation, setUserLocation] = useState<[number, number]>([
    cityConfig.lat + 0.008,
    cityConfig.lng - 0.006,
  ]);

  // Live stations from backend API
  const { data: liveData, loading, isLive, stationCount } = useLiveData(selectedCity);

  // Explore Map State
  const [mapCenter, setMapCenter] = useState<[number, number]>([cityConfig.lat, cityConfig.lng]);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedStation, setSelectedStation] = useState<LiveStation | null>(null);
  const [isStationDetailOpen, setIsStationDetailOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "ultra" | "fast" | "available" | "ccs">("all");
  const [savedStations, setSavedStations] = useState<Set<string>>(new Set());

  // Navigation mode state
  const [navStation, setNavStation] = useState<LiveStation | null>(null);
  const [navProgress, setNavProgress] = useState(0.2);
  const [isNavigating, setIsNavigating] = useState(false);
  const navIntervalRef = useRef<any>(null);

  // Charging session state
  const [isCharging, setIsCharging] = useState(false);
  const [chargeBattery, setChargeBattery] = useState(64);
  const [energyDelivered, setEnergyDelivered] = useState(18.4);
  const [chargeCost, setChargeCost] = useState(331.2);
  const chargeIntervalRef = useRef<any>(null);

  // Neural Co-Pilot state (Range Reality & Stall Reservation)
  const [rangeMode, setRangeMode] = useState<"reality" | "nominal">("reality");
  const [isStallReserved, setIsStallReserved] = useState(false);
  const [reservedStallNumber, setReservedStallNumber] = useState(3);
  const [reserveTimeLeft, setReserveTimeLeft] = useState(882); // 14 mins 42s
  const [smart80Cutoff, setSmart80Cutoff] = useState(true);

  // V2G Energy Arbitrage state (Bidirectional Flow)
  const [chargeMode, setChargeMode] = useState<"charge" | "v2g">("charge");
  const [v2gDepartureFloor, setV2gDepartureFloor] = useState(75);
  const [v2gDischargedKwh, setV2gDischargedKwh] = useState(8.2);
  const [v2gEarnedUsd, setV2gEarnedUsd] = useState(38.4);

  // Neural Energy Synapse & Cell Telemetry state
  const [synapseFluxMode, setSynapseFluxMode] = useState<"v2g" | "ultra" | "solar">("v2g");
  const [cellTelemetryOpen, setCellTelemetryOpen] = useState(false);
  const [preconditionActive, setPreconditionActive] = useState(false);
  const [smartBarrierState, setSmartBarrierState] = useState<"locked" | "lowering" | "lowered">("locked");
  const [waypointKm, setWaypointKm] = useState(54);

  // Journey planner state
  const [journeyDest, setJourneyDest] = useState("Pune Expressway Hub");
  const [journeyRouteReady, setJourneyRouteReady] = useState(true);

  // Synchronize city change
  useEffect(() => {
    const cfg = CITY_CONFIGS[selectedCity];
    if (cfg) {
      setMapCenter([cfg.lat, cfg.lng]);
      setUserLocation([cfg.lat + 0.008, cfg.lng - 0.006]);
      setSelectedStation(null);
      setIsStationDetailOpen(false);
      setNavStation(null);
      setIsNavigating(false);
    }
  }, [selectedCity]);

  // Compute stations with real distance
  const stationsWithDistance = useMemo(() => {
    if (!liveData?.stations) return [];
    return liveData.stations.map((st) => ({
      ...st,
      distanceKm: haversineKm(userLocation[0], userLocation[1], st.latitude, st.longitude),
    }));
  }, [liveData, userLocation]);

  // Filtered stations
  const filteredStations = useMemo(() => {
    return stationsWithDistance.filter((st) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = st.name.toLowerCase().includes(q);
        const matchOp = st.operator?.toLowerCase().includes(q);
        if (!matchName && !matchOp) return false;
      }
      if (filterType === "ultra") {
        if (!st.power_kw || st.power_kw < 150) return false;
      } else if (filterType === "fast") {
        if (!st.power_kw || st.power_kw < 50) return false;
      } else if (filterType === "available") {
        if (!st.is_operational) return false;
      } else if (filterType === "ccs") {
        if (!st.connector_types || !st.connector_types.some((c) => c.toLowerCase().includes("ccs"))) return false;
      }
      return true;
    });
  }, [stationsWithDistance, searchQuery, filterType]);

  // Smooth simulated drive along route
  const startNavigation = (station: LiveStation) => {
    setNavStation(station);
    setIsNavigating(true);
    setNavProgress(0.05);
    setActiveTab("explore");
    setIsStationDetailOpen(false);

    if (navIntervalRef.current) clearInterval(navIntervalRef.current);
    navIntervalRef.current = setInterval(() => {
      setNavProgress((prev) => {
        if (prev >= 1) {
          clearInterval(navIntervalRef.current);
          return 1;
        }
        return prev + 0.02;
      });
    }, 400);
  };

  const cancelNavigation = () => {
    if (navIntervalRef.current) clearInterval(navIntervalRef.current);
    setIsNavigating(false);
    setNavStation(null);
  };

  // Simulated live charging and V2G tick
  useEffect(() => {
    if (isCharging) {
      chargeIntervalRef.current = setInterval(() => {
        if (chargeMode === "charge") {
          setChargeBattery((b) => (b < 100 ? b + 1 : 100));
          setEnergyDelivered((e) => +(e + 0.35).toFixed(1));
          setChargeCost((c) => +(c + 6.3).toFixed(1));
        } else {
          // V2G Bidirectional Arbitrage: Car -> Grid
          setChargeBattery((b) => (b > v2gDepartureFloor ? b - 1 : b));
          setV2gDischargedKwh((k) => +(k + 0.3).toFixed(1));
          setV2gEarnedUsd((u) => +(u + 0.45).toFixed(2));
        }
      }, 2500);
    } else {
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    }
    return () => {
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    };
  }, [isCharging, chargeMode, v2gDepartureFloor]);

  // Stall reservation active countdown
  useEffect(() => {
    if (!isStallReserved) return;
    const timer = setInterval(() => {
      setReserveTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isStallReserved]);

  const toggleFavorite = (id: string) => {
    setSavedStations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EBECE8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
        color: "#151817",
        padding: isPhoneFrame ? "24px 16px" : "0",
      }}
    >
      {/* ── TOP CONTROL BAR (DESKTOP CONTROLS) ────────────────────── */}
      <div
        style={{
          width: isPhoneFrame ? "420px" : "100%",
          maxWidth: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
          padding: "0 8px",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#151817",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <BrandLogo />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Knowledge Hub button */}
          <Link href="/users/knowledge" style={{ textDecoration: "none" }}>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                background: "#ffffff",
                color: "#151817",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <span>📖</span>
              <span>EV Knowledge Hub</span>
            </button>
          </Link>

          {/* Toggle Device Frame Button */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 10px",
              borderRadius: "999px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              background: "#ffffff",
              color: "#151817",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
            title={isPhoneFrame ? "Expand to Full Window" : "View in Phone Frame"}
          >
            {isPhoneFrame ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            <span>{isPhoneFrame ? "Full Width" : "Phone Frame"}</span>
          </button>
        </div>
      </div>

      {/* ── PHONE SHELL CONTAINER ─────────────────────────────────── */}
      <div
        style={{
          width: isPhoneFrame ? "414px" : "100%",
          height: isPhoneFrame ? "852px" : "100vh",
          maxWidth: "100%",
          background: "#F7F8F6",
          borderRadius: isPhoneFrame ? "48px" : "0",
          boxShadow: isPhoneFrame
            ? "0 28px 60px rgba(0, 0, 0, 0.16), 0 0 0 12px #151817, 0 0 0 14px #33383B"
            : "none",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          border: isPhoneFrame ? "1px solid rgba(255,255,255,0.4)" : "none",
        }}
      >
        {/* Dynamic Island (Decorative on phone frame) */}
        {isPhoneFrame && (
          <div
            style={{
              position: "absolute",
              top: "11px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "124px",
              height: "30px",
              background: "#151817",
              borderRadius: "20px",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              color: "#ffffff",
            }}
          >
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#C9F36A" }} />
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#C9F36A", letterSpacing: "0.02em" }}>
              {isCharging ? `${chargeBattery}% ⚡` : "EV VERSE"}
            </div>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#33383B" }} />
          </div>
        )}

        {/* ── STATUS BAR ────────────────────────────────────────────── */}
        <div
          style={{
            height: "44px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "0 24px 8px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#151817",
            zIndex: 1200,
            background: activeTab === "explore" ? "transparent" : "#F7F8F6",
          }}
        >
          <span>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#047857" }}>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* ── MAIN TAB VIEWPORT ─────────────────────────────────────── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          
          {/* ══════════════════════════════════════════════════════════
              TAB 1: NEURAL ENERGY SYNAPSE (CYBERNETIC ENERGY CORE)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "home" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px 88px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Header with City Selector */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b" }}>
                      EV·OS SYNAPSE
                    </span>
                    <span style={{ fontSize: "9.5px", fontWeight: 700, padding: "1px 6px", borderRadius: "999px", background: "#f1f5f9", color: "#334155" }}>
                      v2026.1
                    </span>
                  </div>
                  <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#0f172a", margin: "2px 0 0", letterSpacing: "-0.02em" }}>
                    {activeVehicle.make} {activeVehicle.model}
                  </h1>
                </div>

                {/* City Picker */}
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: "999px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: "#0f172a",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {Object.keys(CITY_CONFIGS).map((city) => (
                    <option key={city} value={city}>
                      📍 {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── LIVING ENERGY SYNAPSE HERO CARD ─────────────────────── */}
              <div
                style={{
                  background: "radial-gradient(120% 120% at 50% 0%, #172033 0%, #0c1017 100%)",
                  borderRadius: "26px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "20px 18px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "14px",
                  boxShadow: "0 18px 48px rgba(10, 16, 26, 0.28)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Mode Badges Bar */}
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: synapseFluxMode === "v2g" ? "#38bdf8" : synapseFluxMode === "ultra" ? "#10b981" : "#fbbf24",
                        boxShadow: `0 0 10px ${synapseFluxMode === "v2g" ? "#38bdf8" : synapseFluxMode === "ultra" ? "#10b981" : "#fbbf24"}`,
                      }}
                    />
                    <span style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a3b8" }}>
                      {synapseFluxMode === "v2g" ? "V2G Bidirectional Grid Link" : synapseFluxMode === "ultra" ? "Hyper-DC Flash Ingestion" : "Helios Clean Solar Sync"}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#f8fafc",
                    }}
                  >
                    98.4% SOH
                  </span>
                </div>

                {/* Animated Cybernetic Energy Ring */}
                <div style={{ position: "relative", width: "164px", height: "164px", margin: "4px 0" }}>
                  <svg width="164" height="164" viewBox="0 0 164 164" style={{ transform: "rotate(-90deg)" }}>
                    {/* Background Track */}
                    <circle cx="82" cy="82" r="68" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="9" />
                    {/* Active Glowing Energy Arch */}
                    <circle
                      cx="82"
                      cy="82"
                      r="68"
                      fill="none"
                      stroke={synapseFluxMode === "v2g" ? "#38bdf8" : synapseFluxMode === "ultra" ? "#10b981" : "#fbbf24"}
                      strokeWidth="9"
                      strokeDasharray={2 * Math.PI * 68}
                      strokeDashoffset={2 * Math.PI * 68 * (1 - (isCharging ? chargeBattery : activeVehicle.currentBatteryPct) / 100)}
                      strokeLinecap="round"
                      style={{
                        transition: "all 0.8s ease",
                        filter: `drop-shadow(0 0 8px ${synapseFluxMode === "v2g" ? "rgba(56,189,248,0.6)" : synapseFluxMode === "ultra" ? "rgba(16,185,129,0.6)" : "rgba(251,191,36,0.6)"})`,
                      }}
                    />
                  </svg>

                  {/* Inner Holographic Readout */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Times New Roman, Georgia, serif",
                        fontSize: "36px",
                        fontWeight: 700,
                        color: "#ffffff",
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                      }}
                    >
                      {isCharging ? chargeBattery : activeVehicle.currentBatteryPct}%
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#94a3b8",
                        marginTop: "4px",
                      }}
                    >
                      364 km Reality
                    </span>
                  </div>
                </div>

                {/* Live Energy Flux Telemetry Bar */}
                <div
                  style={{
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "14px",
                    padding: "8px 12px",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Zap size={14} color={synapseFluxMode === "v2g" ? "#38bdf8" : synapseFluxMode === "ultra" ? "#10b981" : "#fbbf24"} />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#f8fafc" }}>
                      {synapseFluxMode === "v2g"
                        ? "+18.4 kW Export · $0.48/kWh Peak"
                        : synapseFluxMode === "ultra"
                        ? "210 kW Ingestion · 28.5°C Optimal"
                        : "4.8 kW Solar Flow · 100% Clean"}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      color: synapseFluxMode === "v2g" ? "#38bdf8" : synapseFluxMode === "ultra" ? "#10b981" : "#fbbf24",
                    }}
                  >
                    {synapseFluxMode === "v2g" ? "+$38.40 USD" : synapseFluxMode === "ultra" ? "+180 km / 10m" : "Zero Cost"}
                  </span>
                </div>

                {/* Flux Mode Selector (Quiet Luxury 3-Way Switch) */}
                <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  <button
                    onClick={() => {
                      setSynapseFluxMode("v2g");
                      setChargeMode("v2g");
                    }}
                    style={{
                      padding: "7px 4px",
                      borderRadius: "10px",
                      border: "none",
                      background: synapseFluxMode === "v2g" ? "rgba(56, 189, 248, 0.18)" : "rgba(255, 255, 255, 0.06)",
                      color: synapseFluxMode === "v2g" ? "#38bdf8" : "#94a3b8",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: synapseFluxMode === "v2g" ? "#38bdf8" : "transparent",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>🔄</span>
                    <span>V2G Arbitrage</span>
                  </button>

                  <button
                    onClick={() => {
                      setSynapseFluxMode("ultra");
                      setChargeMode("charge");
                    }}
                    style={{
                      padding: "7px 4px",
                      borderRadius: "10px",
                      border: "none",
                      background: synapseFluxMode === "ultra" ? "rgba(16, 185, 129, 0.18)" : "rgba(255, 255, 255, 0.06)",
                      color: synapseFluxMode === "ultra" ? "#10b981" : "#94a3b8",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: synapseFluxMode === "ultra" ? "#10b981" : "transparent",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>⚡</span>
                    <span>270kW Flash</span>
                  </button>

                  <button
                    onClick={() => setSynapseFluxMode("solar")}
                    style={{
                      padding: "7px 4px",
                      borderRadius: "10px",
                      border: "none",
                      background: synapseFluxMode === "solar" ? "rgba(251, 191, 36, 0.18)" : "rgba(255, 255, 255, 0.06)",
                      color: synapseFluxMode === "solar" ? "#fbbf24" : "#94a3b8",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: synapseFluxMode === "solar" ? "#fbbf24" : "transparent",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>☀️</span>
                    <span>Helios Solar</span>
                  </button>
                </div>

                {/* Passive Yield Financial Ticker */}
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "12px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>Weekly Arbitrage</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#38bdf8", marginTop: "1px" }}>
                      +$42.80 USD
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>Departure Floor</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc", marginTop: "1px" }}>
                      75% Min Guard
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>CO₂ Offset</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#10b981", marginTop: "1px" }}>
                      114 kg Averted
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CELL-LEVEL THERMAL FORENSICS (PILLAR 3 UPGRADE) ─────── */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #e2e8f0",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                      Battery Chemistry Forensics
                    </span>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "1px 0 0" }}>
                      Cell Thermal Matrix (396 Cells)
                    </h3>
                  </div>

                  <button
                    onClick={() => setCellTelemetryOpen(!cellTelemetryOpen)}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    {cellTelemetryOpen ? "Hide" : "Inspect"}
                  </button>
                </div>

                {/* 4 Quick Cell Metric Tiles */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "10.5px", color: "#64748b" }}>Pack Temp</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#059669", marginTop: "2px" }}>
                      24.2°C <span style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>(Optimal)</span>
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "10.5px", color: "#64748b" }}>Dendrite Risk</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#059669", marginTop: "2px" }}>
                      0.00% <span style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>(Zero Stress)</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Diagnostic Drawer */}
                {cellTelemetryOpen && (
                  <div
                    className="anim-fade-up"
                    style={{
                      background: "#f8fafc",
                      borderRadius: "12px",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "11.5px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                      <span>Internal Impedance:</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>18.4 mΩ (Factory Grade)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                      <span>Equivalent Full Cycles:</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>242 / 3,000 (8.1% used)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                      <span>State of Health (SOH):</span>
                      <span style={{ fontWeight: 700, color: "#059669" }}>98.4% (Grade A+)</span>
                    </div>
                  </div>
                )}

                {/* Pre-Conditioning Actuator Button */}
                <button
                  onClick={() => setPreconditionActive(!preconditionActive)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "none",
                    background: preconditionActive ? "rgba(16, 185, 129, 0.12)" : "#0f172a",
                    color: preconditionActive ? "#047857" : "#ffffff",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  {preconditionActive ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Thermal Conditioning Active · 28°C Target in 12m</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>Pre-Condition Pack for 350kW DC Flash</span>
                    </>
                  )}
                </button>
              </div>

              {/* ── ULTRASONIC STATION DISPATCH RADAR ────────────────────── */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    Ultrasonic Smart Bay Locks · {selectedCity}
                  </h3>
                  <button
                    onClick={() => setActiveTab("explore")}
                    style={{ background: "none", border: "none", color: "#059669", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                  >
                    View Map ({stationCount}) →
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {filteredStations.slice(0, 3).map((st, idx) => (
                    <div
                      key={st.station_id}
                      onClick={() => {
                        setSelectedStation(st);
                        setMapCenter([st.latitude, st.longitude]);
                        setIsStationDetailOpen(true);
                        setActiveTab("explore");
                      }}
                      style={{
                        background: "#ffffff",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "10px",
                            background: idx === 0 ? "rgba(16, 185, 129, 0.12)" : "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: idx === 0 ? "#059669" : "#0f172a",
                            fontWeight: 700,
                            fontSize: "12px",
                          }}
                        >
                          ⚡
                        </div>
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0f172a" }}>{st.name}</div>
                          <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                            {st.distanceKm ? `${st.distanceKm.toFixed(1)} km away` : st.operator || "Public"} · {st.power_kw ? `${st.power_kw} kW` : "Standard"}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: "999px",
                            background: idx === 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(2, 132, 199, 0.1)",
                            color: idx === 0 ? "#059669" : "#0284c7",
                          }}
                        >
                          {idx === 0 ? "🔒 Stall #03 Locked" : "🟢 4/6 Stalls Free"}
                        </span>
                        <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>Proximity Ready</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: EXPLORE (SIGNATURE MAP SCREEN)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "explore" && (
            <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
              {/* The Full Map Viewport */}
              <DriverMobileMap
                center={mapCenter}
                zoom={mapZoom}
                userLocation={userLocation}
                stations={filteredStations}
                selectedStation={selectedStation}
                onStationSelect={(st) => {
                  setSelectedStation(st);
                  setIsStationDetailOpen(true);
                }}
                navigationStation={navStation}
                isNavigating={isNavigating}
                navProgress={navProgress}
              />

              {/* Floating Top Search Bar & Filters */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "14px",
                  right: "14px",
                  zIndex: 1100,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {/* Search Input Box */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "18px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <Search size={16} color="#86868b" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${selectedCity} chargers…`}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: "13px",
                      color: "#151817",
                      flex: 1,
                      fontWeight: 500,
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <X size={15} color="#86868b" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
                  {[
                    { key: "all", label: "All" },
                    { key: "ultra", label: "⚡ 150kW+ Ultra" },
                    { key: "fast", label: "⚡ 50kW+ Fast" },
                    { key: "ccs", label: "🔌 CCS2" },
                    { key: "available", label: "🟢 Available" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilterType(f.key as any)}
                      style={{
                        padding: "5px 11px",
                        borderRadius: "999px",
                        border: filterType === f.key ? "1.5px solid #151817" : "1px solid rgba(0, 0, 0, 0.08)",
                        background: filterType === f.key ? "#151817" : "rgba(255, 255, 255, 0.9)",
                        color: filterType === f.key ? "#C9F36A" : "#151817",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Active Bar Banner */}
              {isNavigating && navStation && (
                <div
                  style={{
                    position: "absolute",
                    top: "112px",
                    left: "14px",
                    right: "14px",
                    zIndex: 1100,
                    background: "#151817",
                    color: "#ffffff",
                    borderRadius: "18px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 8px 24px rgba(21, 24, 23, 0.3)",
                    border: "1px solid #C9F36A",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Navigation size={18} style={{ color: "#C9F36A" }} />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                        Navigating to {navStation.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#C9F36A" }}>
                        {((1 - navProgress) * 4.2).toFixed(1)} km remaining · Arriving in ~{Math.max(1, Math.round((1 - navProgress) * 9))} min
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={cancelNavigation}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    End
                  </button>
                </div>
              )}

              {/* Bottom Station Details Sheet / Preview */}
              {selectedStation && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "76px",
                    left: "12px",
                    right: "12px",
                    zIndex: 1150,
                    background: "#ffffff",
                    borderRadius: "24px",
                    border: "1px solid #E2E5DF",
                    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.14)",
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {/* Station Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: "4px",
                            background: selectedStation.is_operational ? "#EDF8DE" : "#FEE2E2",
                            color: selectedStation.is_operational ? "#3F6212" : "#991B1B",
                          }}
                        >
                          {selectedStation.is_operational ? "VERIFIED ONLINE" : "OFFLINE"}
                        </span>
                        <span style={{ fontSize: "11px", color: "#86868b", fontWeight: 600 }}>
                          {selectedStation.operator || "Public Station"}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#151817", margin: 0 }}>
                        {selectedStation.name}
                      </h3>
                      <div style={{ fontSize: "12px", color: "#86868b", marginTop: "2px" }}>
                        {selectedStation.address || `${selectedCity} Central Hub`}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFavorite(selectedStation.station_id)}
                      style={{
                        background: "#F7F8F6",
                        border: "none",
                        borderRadius: "50%",
                        width: "34px",
                        height: "34px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Heart
                        size={17}
                        fill={savedStations.has(selectedStation.station_id) ? "#ef4444" : "none"}
                        color={savedStations.has(selectedStation.station_id) ? "#ef4444" : "#151817"}
                      />
                    </button>
                  </div>

                  {/* Specs Ribbon */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#F7F8F6",
                      borderRadius: "14px",
                      padding: "10px 14px",
                      border: "1px solid #EBECE8",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ position: "relative", width: "32px", height: "32px" }}>
                        <Image src="/images/plug-ccs2.png" alt="CCS2" fill style={{ objectFit: "contain" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#86868b", fontWeight: 500 }}>Connector</div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#151817" }}>
                          {selectedStation.connector_types?.[0] || "CCS2 Combo"}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: "#86868b", fontWeight: 500 }}>Power Rating</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#10b981" }}>
                        {selectedStation.power_kw ? `${selectedStation.power_kw} kW Ultra` : "Standard DC"}
                      </div>
                    </div>
                  </div>

                  {/* Ultrasonic Smart Bay Barrier Status */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "14px",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Lock size={13} color={smartBarrierState === "lowered" ? "#059669" : "#dc2626"} />
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>
                          Stall #03 Ground Barrier Lock
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: smartBarrierState === "lowered" ? "#edf8de" : "#fee2e2",
                          color: smartBarrierState === "lowered" ? "#3f6212" : "#991b1b",
                        }}
                      >
                        {smartBarrierState === "lowered" ? "BARRIER LOWERED" : "BARRIER RAISED"}
                      </span>
                    </div>

                    <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                      Ultrasonic Radar: Zero ICE vehicle obstruction detected. Physical barrier active.
                    </div>

                    <button
                      onClick={() => {
                        if (smartBarrierState === "locked") {
                          setSmartBarrierState("lowering");
                          setTimeout(() => setSmartBarrierState("lowered"), 1000);
                        } else {
                          setSmartBarrierState("locked");
                        }
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {smartBarrierState === "lowering" ? (
                        <span>Actuating Hydraulic Barrier…</span>
                      ) : smartBarrierState === "lowered" ? (
                        <>
                          <Lock size={12} />
                          <span>Raise Physical Ground Barrier</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={12} />
                          <span>Drop Ground Barrier on Proximity Arrival</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => startNavigation(selectedStation)}
                      style={{
                        flex: 1,
                        background: "#151817",
                        color: "#C9F36A",
                        border: "none",
                        borderRadius: "14px",
                        padding: "12px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Navigation size={14} />
                      Start Navigation
                    </button>

                    <button
                      onClick={() => {
                        setIsCharging(true);
                        setActiveTab("charging");
                      }}
                      style={{
                        flex: 1,
                        background: "#C9F36A",
                        color: "#151817",
                        border: "none",
                        borderRadius: "14px",
                        padding: "12px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Zap size={14} />
                      Start Charge
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 3: NEURAL CO-PILOT (RANGE REALITY & STALL RESERVATION)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "journeys" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 88px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                  NEURAL CO-PILOT · PILLAR 3
                </span>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#151817", margin: "2px 0 0" }}>
                  Energy & Range Forensics
                </h1>
              </div>

              {/* Range Reality vs Nominal Switch */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #E2E5DF",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Battery Range Forensics
                  </div>
                  <div style={{ display: "flex", background: "#F1F5F9", borderRadius: "8px", padding: "2px" }}>
                    <button
                      onClick={() => setRangeMode("reality")}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        background: rangeMode === "reality" ? "#0f172a" : "transparent",
                        color: rangeMode === "reality" ? "#ffffff" : "#64748b",
                      }}
                    >
                      Range Reality
                    </button>
                    <button
                      onClick={() => setRangeMode("nominal")}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        background: rangeMode === "nominal" ? "#0f172a" : "transparent",
                        color: rangeMode === "nominal" ? "#ffffff" : "#64748b",
                      }}
                    >
                      WLTP Nominal
                    </button>
                  </div>
                </div>

                {/* Range Numbers */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "38px", fontWeight: 800, color: "#151817", letterSpacing: "-0.03em" }}>
                    {rangeMode === "reality" ? "364" : activeVehicle.currentRangeKm}
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "#64748b" }}>km</span>
                  {rangeMode === "reality" && (
                    <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#059669", marginLeft: "auto" }}>
                      ● 99.2% Arrival Guarantee
                    </span>
                  )}
                </div>

                {/* Reality Range Deductions Breakdown */}
                {rangeMode === "reality" && (
                  <div
                    style={{
                      background: "#F8FAFC",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      fontSize: "11.5px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                      <span>Terrain Incline (+420m elevation climb):</span>
                      <span style={{ fontWeight: 600, color: "#dc2626" }}>-18 km</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                      <span>Thermal AC Load (28°C ambient weather):</span>
                      <span style={{ fontWeight: 600, color: "#dc2626" }}>-10 km</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#059669", fontWeight: 600, borderTop: "1px solid #E2E8F0", paddingTop: "4px" }}>
                      <span>Forensic True Range Buffer:</span>
                      <span>364 km Confirmed</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Waypoint Gravitational & Kinetic Energy Profile Scrubber */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #e2e8f0",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                      Gravitational Energy Forensics
                    </span>
                    <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a", margin: "1px 0 0" }}>
                      Mumbai ➔ Pune Expressway Corridor
                    </h3>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669" }}>
                    120 km Total
                  </span>
                </div>

                {/* Scrubber Slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    <span>Route Waypoint: <strong style={{ color: "#0f172a" }}>{waypointKm} km</strong></span>
                    <span>
                      {waypointKm < 40
                        ? "Sea Level Coastal Highway"
                        : waypointKm < 75
                        ? "▲ Khandala Ghats Peak (+520m)"
                        : waypointKm < 95
                        ? "▼ Gravitational Regen Descent"
                        : "✓ Deccan Plateau Ingress"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={waypointKm}
                    onChange={(e) => setWaypointKm(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#0f172a", cursor: "pointer" }}
                  />
                </div>

                {/* Waypoint Forensics Result Tile */}
                {(() => {
                  let waypointSoc = 78;
                  let waypointAlt = 14;
                  let regenHarvest = 0;
                  if (waypointKm <= 40) {
                    waypointSoc = Math.round(78 - waypointKm * 0.35);
                    waypointAlt = Math.round(14 + waypointKm * 2);
                  } else if (waypointKm <= 75) {
                    waypointSoc = Math.round(64 - (waypointKm - 40) * 0.45);
                    waypointAlt = Math.round(94 + (waypointKm - 40) * 12);
                  } else if (waypointKm <= 95) {
                    regenHarvest = Math.round((waypointKm - 75) * 0.2);
                    waypointSoc = Math.round(48 + regenHarvest);
                    waypointAlt = Math.round(514 - (waypointKm - 75) * 16);
                  } else {
                    waypointSoc = Math.round(52 - (waypointKm - 95) * 0.32);
                    waypointAlt = 560;
                  }

                  return (
                    <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "10px 12px", border: "1px solid #e2e8f0", fontSize: "11.5px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                        <span style={{ color: "#64748b" }}>Projected SOC at {waypointKm} km:</span>
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>{waypointSoc}% Battery</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                        <span style={{ color: "#64748b" }}>Terrain Altitude:</span>
                        <span style={{ fontWeight: 600, color: "#475569" }}>{waypointAlt}m Above Sea Level</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "4px" }}>
                        <span style={{ color: "#059669", fontWeight: 600 }}>Kinetic Energy Balance:</span>
                        <span style={{ fontWeight: 700, color: "#059669" }}>
                          {waypointKm > 75 && waypointKm <= 95 ? `+${regenHarvest} kWh Gravitational Harvest!` : "Nominal Aerodynamic Load"}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Guaranteed Stall Reservation Card */}
              <div
                style={{
                  background: isStallReserved ? "rgba(16, 185, 129, 0.06)" : "#ffffff",
                  borderRadius: "20px",
                  border: isStallReserved ? "1.5px solid #059669" : "1px solid #E2E5DF",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Autonomous Stall Reservation
                  </div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: isStallReserved ? "#059669" : "#EDF8DE",
                      color: isStallReserved ? "#ffffff" : "#3F6212",
                    }}
                  >
                    {isStallReserved ? "RESERVED & LOCKED" : "STALL AVAILABLE"}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#151817", margin: 0 }}>
                    Expressway Superhub · Stall #{reservedStallNumber}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    350 kW Ultra-Fast CCS2 · Bandra-Worli Transit Corridor
                  </div>
                </div>

                {isStallReserved ? (
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "12px",
                      padding: "12px",
                      border: "1px solid #CBD5E1",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#065f46" }}>
                        🔒 Physical Barrier Locked for {activeVehicle.model}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                        {Math.floor(reserveTimeLeft / 60)}:{String(reserveTimeLeft % 60).padStart(2, "0")}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Stall is reserved exclusively for your vehicle. Unlocks automatically on arrival handshake.
                    </div>
                    <button
                      onClick={() => setIsStallReserved(false)}
                      style={{
                        padding: "6px",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Release Reservation
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsStallReserved(true);
                      setReserveTimeLeft(900);
                    }}
                    style={{
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
                    }}
                  >
                    <span>🔒 Lock & Hold Stall #{reservedStallNumber} (15 Min Guarantee)</span>
                  </button>
                )}
              </div>

              {/* Battery Longevity & Health Forensics Card */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #E2E5DF",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Battery Pack Forensics
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669" }}>
                    98.4% SOH (Grade A+)
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#151817" }}>Smart 80% Fast-Charge Cap</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Preserves cathode life and saves 35m dwell</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smart80Cutoff}
                    onChange={(e) => setSmart80Cutoff(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#059669", cursor: "pointer" }}
                  />
                </div>
              </div>

              {/* Start Guided Navigation CTA */}
              <button
                onClick={() => {
                  if (filteredStations[0]) startNavigation(filteredStations[0]);
                }}
                style={{
                  background: "#0f172a",
                  color: "#C9F36A",
                  border: "none",
                  borderRadius: "16px",
                  padding: "15px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                }}
              >
                <Navigation size={16} />
                <span>Launch Neural Route Navigation</span>
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 4: CHARGING & V2G ENERGY EQUILIBRIUM COCKPIT
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "charging" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 88px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                    BIDIRECTIONAL ENERGY COCKPIT · PILLAR 1
                  </span>
                  <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#151817", margin: "2px 0 0" }}>
                    Energy Session
                  </h1>
                </div>

                {/* Mode Switch: Ultra Charge vs V2G Arbitrage */}
                <div style={{ display: "flex", background: "#F1F5F9", borderRadius: "8px", padding: "2px" }}>
                  <button
                    onClick={() => setChargeMode("charge")}
                    style={{
                      padding: "4px 9px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: chargeMode === "charge" ? "#0f172a" : "transparent",
                      color: chargeMode === "charge" ? "#ffffff" : "#64748b",
                    }}
                  >
                    ⚡ Fast Charge
                  </button>
                  <button
                    onClick={() => setChargeMode("v2g")}
                    style={{
                      padding: "4px 9px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: chargeMode === "v2g" ? "#059669" : "transparent",
                      color: chargeMode === "v2g" ? "#ffffff" : "#64748b",
                    }}
                  >
                    🔄 V2G Arbitrage
                  </button>
                </div>
              </div>

              {/* Progress Wheel Graphic */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  border: "1px solid #E2E5DF",
                  padding: "26px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "14px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                  position: "relative",
                }}
              >
                <div style={{ position: "relative", width: "160px", height: "160px" }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="85" cy="85" r="66" fill="none" stroke="#EBECE8" strokeWidth="11" />
                    <circle
                      cx="85"
                      cy="85"
                      r="66"
                      fill="none"
                      stroke={chargeMode === "v2g" ? "#059669" : "#C9F36A"}
                      strokeWidth="11"
                      strokeDasharray={2 * Math.PI * 66}
                      strokeDashoffset={2 * Math.PI * 66 * (1 - chargeBattery / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 85 85)"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                  </svg>

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "34px", fontWeight: 800, color: "#151817", letterSpacing: "-0.03em" }}>
                      {chargeBattery}%
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: chargeMode === "v2g" ? "#059669" : "#047857" }}>
                      {chargeMode === "v2g" ? "🔄 Feeding Grid" : isCharging ? "+120 km / 10 min" : "Connected"}
                    </span>
                  </div>
                </div>

                {/* Telemetry Grid */}
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    borderTop: "1px solid #EBECE8",
                    paddingTop: "14px",
                  }}
                >
                  {chargeMode === "v2g" ? (
                    <>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Discharged to Grid</div>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                          {v2gDischargedKwh} kWh
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Grid Spot Rate</div>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "#059669" }}>
                          $0.48 / kWh
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Arbitrage Earned</div>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "#059669" }}>
                          +${v2gEarnedUsd.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Departure Reserve</div>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                          {v2gDepartureFloor}% Floor
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Delivered Energy</div>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "#151817" }}>
                          {energyDelivered} kWh
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Charging Rate</div>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "#10b981" }}>
                          {isCharging ? "150 kW DC" : "0 kW"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Session Cost</div>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "#151817" }}>
                          ${(chargeCost * 0.012).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Time to 80%</div>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "#151817" }}>
                          {isCharging ? "12 mins" : "—"}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* V2G Minimum Departure Buffer Slider */}
                {chargeMode === "v2g" && (
                  <div style={{ width: "100%", background: "#F8FAFC", borderRadius: "12px", padding: "10px 12px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "4px" }}>
                      <span style={{ color: "#64748b" }}>Minimum Departure Reserve Floor:</span>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{v2gDepartureFloor}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      value={v2gDepartureFloor}
                      onChange={(e) => setV2gDepartureFloor(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#059669", cursor: "pointer" }}
                    />
                    <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px" }}>
                      System halts discharge automatically if battery reaches {v2gDepartureFloor}%.
                    </div>
                  </div>
                )}

                {/* Toggle Charging / Arbitrage Button */}
                <button
                  onClick={() => setIsCharging(!isCharging)}
                  style={{
                    width: "100%",
                    background: isCharging ? "#FEE2E2" : chargeMode === "v2g" ? "#059669" : "#0f172a",
                    color: isCharging ? "#991B1B" : "#ffffff",
                    border: "none",
                    borderRadius: "14px",
                    padding: "13px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Zap size={15} />
                  {isCharging
                    ? "Halt Active Session"
                    : chargeMode === "v2g"
                    ? "Activate V2G Grid Dispatch"
                    : "Start 350kW Fast Charge"}
                </button>
              </div>

              {/* Wholesale Electricity Spot Price Curve & Arbitrage Scheduler */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #e2e8f0",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                      Grid Spot Price Arbitrage
                    </span>
                    <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a", margin: "1px 0 0" }}>
                      24-Hour Municipal Power Tariff
                    </h3>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669" }}>
                    +$0.40/kWh Spread
                  </span>
                </div>

                {/* Micro Price Bar Visualizer */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px", alignItems: "flex-end", height: "48px", paddingTop: "8px" }}>
                  {[
                    { time: "02:00", price: "$0.08", h: "20%", isLow: true },
                    { time: "06:00", price: "$0.14", h: "35%", isLow: true },
                    { time: "11:00", price: "$0.22", h: "50%", isLow: false },
                    { time: "15:00", price: "$0.31", h: "70%", isLow: false },
                    { time: "19:00", price: "$0.48", h: "100%", isPeak: true },
                    { time: "23:00", price: "$0.16", h: "40%", isLow: false },
                  ].map((p) => (
                    <div key={p.time} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          width: "100%",
                          height: p.h,
                          borderRadius: "4px",
                          background: p.isPeak ? "#059669" : p.isLow ? "#38bdf8" : "#cbd5e1",
                          transition: "height 0.3s ease",
                        }}
                      />
                      <span style={{ fontSize: "9px", color: "#64748b", marginTop: "3px" }}>{p.time}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "8px 10px", fontSize: "11px", color: "#475569", border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>⚡ Autonomous Buy Cycle:</span>
                    <span style={{ fontWeight: 600, color: "#0284c7" }}>02:00–05:00 ($0.08/kWh off-peak wind)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                    <span>🔄 Autonomous Sell Back:</span>
                    <span style={{ fontWeight: 600, color: "#059669" }}>18:30–20:30 ($0.48/kWh peak grid export)</span>
                  </div>
                </div>
              </div>

              {/* Verified Hardware Handshake Card */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  border: "1px solid #E2E5DF",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ position: "relative", width: "36px", height: "36px" }}>
                    <Image src="/images/plug-ccs2.png" alt="CCS2" fill style={{ objectFit: "contain" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#151817" }}>CCS2 Bidirectional Handshake</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>ISO 15118-20 Verified · 800V Architecture</div>
                  </div>
                </div>
                <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "3px 8px", borderRadius: "99px" }}>
                  SYNCED
                </span>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 5: GARAGE (VEHICLE PROFILES)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "garage" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 88px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#86868b" }}>
                  DIGITAL VEHICLE HUB
                </span>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#151817", margin: "2px 0 0" }}>
                  Vehicle Garage
                </h1>
              </div>

              {/* Select Active Car */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {GARAGE_VEHICLES.map((veh) => {
                  const isActive = veh.id === activeVehicleId;
                  return (
                    <div
                      key={veh.id}
                      onClick={() => setActiveVehicleId(veh.id)}
                      style={{
                        background: "#ffffff",
                        borderRadius: "22px",
                        border: isActive ? "2px solid #151817" : "1px solid #E2E5DF",
                        padding: "18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        cursor: "pointer",
                        boxShadow: isActive ? "0 8px 24px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: 700, color: "#151817" }}>
                            {veh.make} {veh.model}
                          </div>
                          <div style={{ fontSize: "12px", color: "#86868b" }}>
                            {veh.year} · {veh.batteryKwh} kWh Pack · {veh.maxDcSpeedKw} kW Max DC
                          </div>
                        </div>

                        {isActive && (
                          <span
                            style={{
                              background: "#C9F36A",
                              color: "#151817",
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: "999px",
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {/* Transparent Vehicle Silhouette */}
                      <div style={{ position: "relative", width: "100%", height: "100px", margin: "-4px 0" }}>
                        <Image src={veh.image} alt={veh.model} fill sizes="340px" style={{ objectFit: "contain" }} />
                      </div>

                      {/* Vehicle Key Metrics */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          borderTop: "1px solid #EBECE8",
                          paddingTop: "10px",
                          color: "#6e6e73",
                        }}
                      >
                        <span>WLTP Range: {veh.wltpRangeKm} km</span>
                        <span>Connector: {veh.plugType}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connector Compatibility Reference */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #E2E5DF",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#151817", margin: 0 }}>
                  Supported Standards
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#F7F8F6", padding: "10px", borderRadius: "12px" }}>
                    <div style={{ position: "relative", width: "28px", height: "28px" }}>
                      <Image src="/images/plug-ccs2.png" alt="CCS2" fill style={{ objectFit: "contain" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700 }}>CCS2 DC</div>
                      <div style={{ fontSize: "10px", color: "#86868b" }}>Up to 350 kW</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#F7F8F6", padding: "10px", borderRadius: "12px" }}>
                    <div style={{ position: "relative", width: "28px", height: "28px" }}>
                      <Image src="/images/plug-type2.png" alt="Type 2" fill style={{ objectFit: "contain" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700 }}>Type 2 AC</div>
                      <div style={{ fontSize: "10px", color: "#86868b" }}>Up to 22 kW</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ISO 15118 Cryptographic Plug & Charge Card */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #e2e8f0",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "11.5px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ShieldCheck size={14} color="#059669" />
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>ISO 15118 Cryptographic Identity</span>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#059669", background: "rgba(16, 185, 129, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                    AUTHENTICATED
                  </span>
                </div>

                <div style={{ color: "#64748b" }}>
                  Public Key: <span style={{ fontFamily: "monospace", color: "#0f172a" }}>0x892a…4f1b</span> · Automated Plug & Charge handshake active across all EV Verse superhubs. Zero apps or cards required.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── PERSISTENT BOTTOM NAVIGATION (5 TABS) ────────────────── */}
        <nav
          style={{
            height: "72px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            padding: "0 8px 6px",
            zIndex: 1200,
          }}
        >
          {/* Tab 1: Synapse */}
          <button
            onClick={() => setActiveTab("home")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "home" ? "#0f172a" : "#64748b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <Activity size={19} strokeWidth={activeTab === "home" ? 2.5 : 1.8} color={activeTab === "home" ? "#0f172a" : "#64748b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "home" ? 700 : 500 }}>Synapse</span>
          </button>

          {/* Tab 2: Perimeter */}
          <button
            onClick={() => setActiveTab("explore")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "explore" ? "#0f172a" : "#64748b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <MapPin size={19} strokeWidth={activeTab === "explore" ? 2.5 : 1.8} color={activeTab === "explore" ? "#0f172a" : "#64748b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "explore" ? 700 : 500 }}>Perimeter</span>
          </button>

          {/* Tab 3: Horizon */}
          <button
            onClick={() => setActiveTab("journeys")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "journeys" ? "#0f172a" : "#64748b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <Navigation size={19} strokeWidth={activeTab === "journeys" ? 2.5 : 1.8} color={activeTab === "journeys" ? "#0f172a" : "#64748b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "journeys" ? 700 : 500 }}>Horizon</span>
          </button>

          {/* Tab 4: Arbitrage */}
          <button
            onClick={() => setActiveTab("charging")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "charging" ? "#0f172a" : "#64748b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              position: "relative",
              transition: "all 0.15s ease",
            }}
          >
            <Zap size={19} strokeWidth={activeTab === "charging" ? 2.5 : 1.8} color={activeTab === "charging" ? "#059669" : "#64748b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "charging" ? 700 : 500 }}>Arbitrage</span>
            {isCharging && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "12px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#059669",
                  boxShadow: "0 0 6px #059669",
                }}
              />
            )}
          </button>

          {/* Tab 5: Garage */}
          <button
            onClick={() => setActiveTab("garage")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "garage" ? "#0f172a" : "#64748b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <Car size={19} strokeWidth={activeTab === "garage" ? 2.5 : 1.8} color={activeTab === "garage" ? "#0f172a" : "#64748b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "garage" ? 700 : 500 }}>Garage</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
