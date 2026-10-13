"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { BrandLogo } from "@/components/BrandLogo";
import { useLiveData } from "@/hooks/useLiveData";
import { CITY_CONFIGS } from "@/components/CountryCitySelector";
import type { LiveStation } from "@/types/api";

// Driver Mobile Components
import { DriverNav, DriverTab } from "@/components/driver/DriverNav";
import { VehicleCockpit, EVVehicle } from "@/components/driver/VehicleCockpit";
import { JourneyPlanner, TripDestination } from "@/components/driver/JourneyPlanner";
import { ChargingConsole } from "@/components/driver/ChargingConsole";
import { GarageFleet } from "@/components/driver/GarageFleet";
import {
  LoadingSkeleton,
  EmptyState,
  ErrorState,
  OfflineNotice,
} from "@/components/driver/StatusStates";

import {
  Search,
  Navigation,
  MapPin,
  Clock,
  ArrowRight,
  X,
  Heart,
  ChevronRight,
  BatteryCharging,
  SlidersHorizontal,
  ExternalLink,
  Zap,
} from "lucide-react";

// Dynamic Leaflet Map Component
const DriverMobileMap = dynamic(
  () => import("@/components/DriverMobileMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF9F6] text-[#8C938E]">
        <div className="w-6 h-6 border-2 border-[#111312] border-t-transparent rounded-full animate-spin mb-2" />
        <span className="text-xs font-mono">Loading Navigation Viewport...</span>
      </div>
    ),
  }
);

export interface DriverStation extends LiveStation {
  distanceKm?: number;
}

// ── Production EV Models Fleet ──────────────────────────────────────────────
const GARAGE_VEHICLES: EVVehicle[] = [
  {
    id: "porsche",
    make: "Porsche",
    model: "Taycan GTS",
    year: 2025,
    image: "/images/car-porsche.png",
    batteryKwh: 93.4,
    usableKwh: 83.7,
    currentBatteryPct: 68,
    wltpRangeKm: 504,
    efficiencyKwh100km: 20.3,
    maxDcSpeedKw: 270,
    maxAcSpeedKw: 22,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    vin: "WP0AA2Y15PSA92811",
    sohPct: 98.4,
  },
  {
    id: "bmw",
    make: "BMW",
    model: "i7 xDrive60",
    year: 2025,
    image: "/images/car-bmw.png",
    batteryKwh: 105.7,
    usableKwh: 101.7,
    currentBatteryPct: 82,
    wltpRangeKm: 625,
    efficiencyKwh100km: 19.6,
    maxDcSpeedKw: 195,
    maxAcSpeedKw: 22,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    vin: "WBA53EJ04PCH18204",
    sohPct: 99.1,
  },
  {
    id: "mercedes",
    make: "Mercedes-Benz",
    model: "EQS 450+ Sedan",
    year: 2025,
    image: "/images/car-sclass.png",
    batteryKwh: 118.0,
    usableKwh: 108.4,
    currentBatteryPct: 74,
    wltpRangeKm: 750,
    efficiencyKwh100km: 16.2,
    maxDcSpeedKw: 200,
    maxAcSpeedKw: 11,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    vin: "W1K2971241A049182",
    sohPct: 97.9,
  },
  {
    id: "rangerover",
    make: "Range Rover",
    model: "Electric Autobiography",
    year: 2026,
    image: "/images/car-rangerover.png",
    batteryKwh: 118.5,
    usableKwh: 110.0,
    currentBatteryPct: 55,
    wltpRangeKm: 510,
    efficiencyKwh100km: 24.1,
    maxDcSpeedKw: 350,
    maxAcSpeedKw: 22,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    vin: "SALWR2V45RA091244",
    sohPct: 98.8,
  },
  {
    id: "lucid",
    make: "Lucid",
    model: "Air Grand Touring",
    year: 2025,
    image: "/images/car-model.png",
    batteryKwh: 118.0,
    usableKwh: 112.0,
    currentBatteryPct: 70,
    wltpRangeKm: 825,
    efficiencyKwh100km: 14.8,
    maxDcSpeedKw: 300,
    maxAcSpeedKw: 22,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    vin: "7P1EA1E83PA004128",
    sohPct: 99.2,
  },
];

// Helper: Haversine distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(1);
}

export default function EVVerseDriverPage() {
  // Navigation tabs: home, explore, journeys, charging, garage
  const [activeTab, setActiveTab] = useState<DriverTab>("home");

  // Desktop Studio Frame Controls: "frame" (iPhone 16 Pro mockup), "fluid" (clean mobile column), "expanded" (wide responsive cockpit)
  const [viewMode, setViewMode] = useState<"frame" | "fluid" | "expanded">("frame");
  const [scale, setScale] = useState<number>(0.92);

  // Selected city & live data
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const cityConfig = CITY_CONFIGS[selectedCity] || CITY_CONFIGS["Mumbai"];

  // Active Vehicle & Driving Modes
  const [activeVehicleId, setActiveVehicleId] = useState("porsche");
  const activeVehicle = GARAGE_VEHICLES.find((v) => v.id === activeVehicleId) || GARAGE_VEHICLES[0];
  const [currentBatteryPct, setCurrentBatteryPct] = useState(activeVehicle.currentBatteryPct);
  const [driveMode, setDriveMode] = useState<"normal" | "eco" | "sport">("normal");
  const [hvacActive, setHvacActive] = useState(true);
  const [doorsLocked, setDoorsLocked] = useState(true);
  const [isPreconditioning, setIsPreconditioning] = useState(false);

  // User Location (centered relative to selected city)
  const [userLocation, setUserLocation] = useState<[number, number]>([
    cityConfig.lat + 0.008,
    cityConfig.lng - 0.006,
  ]);

  // Live stations from backend API
  const { data: liveData, loading, error, isLive, stationCount, source } = useLiveData(selectedCity);

  // Explore Map State
  const [mapCenter, setMapCenter] = useState<[number, number]>([cityConfig.lat, cityConfig.lng]);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedStation, setSelectedStation] = useState<DriverStation | null>(null);
  const [isStationDetailOpen, setIsStationDetailOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [speedFilter, setSpeedFilter] = useState<"all" | "ultra" | "fast" | "ac">("all");
  const [connectorFilter, setConnectorFilter] = useState<string>("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyCompatible, setOnlyCompatible] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  const [savedStationIds, setSavedStationIds] = useState<Set<string>>(new Set());

  // In-app Navigation State
  const [navStation, setNavStation] = useState<DriverStation | null>(null);
  const [navProgress, setNavProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const navIntervalRef = useRef<any>(null);

  // Charging Session State
  const [isCharging, setIsCharging] = useState(false);
  const [chargeStation, setChargeStation] = useState<DriverStation | null>(null);
  const [chargeTargetLimit, setChargeTargetLimit] = useState(80);
  const [chargeElapsedSeconds, setChargeElapsedSeconds] = useState(0);
  const [chargeKwhDelivered, setChargeKwhDelivered] = useState(0);
  const [chargeCurrentKw, setChargeCurrentKw] = useState(0);
  const [chargeCost, setChargeCost] = useState(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const chargeIntervalRef = useRef<any>(null);

  // Trip Energy Planner State
  const [tripDestIndex, setTripDestIndex] = useState(0);

  // Pre-configured real corridor destinations per city
  const cityTripDestinations = useMemo<TripDestination[]>(() => {
    if (selectedCity === "Mumbai") {
      return [
        { name: "Pune Expressway Superhub", distanceKm: 118, elevationGainM: 540 },
        { name: "Lonavala Transit Station", distanceKm: 84, elevationGainM: 620 },
        { name: "Navi Mumbai Tech Park", distanceKm: 32, elevationGainM: 40 },
        { name: "Thane Viviana Mall Charger", distanceKm: 28, elevationGainM: 30 },
      ];
    }
    if (selectedCity === "San Francisco") {
      return [
        { name: "Silicon Valley Tech Corridor (Palo Alto)", distanceKm: 52, elevationGainM: 80 },
        { name: "Napa Valley Destination Charger", distanceKm: 88, elevationGainM: 140 },
        { name: "San Jose Diridon Supercharger", distanceKm: 76, elevationGainM: 60 },
        { name: "Oakland City Center", distanceKm: 19, elevationGainM: 20 },
      ];
    }
    return [
      { name: "Metropolitan Airport Hub", distanceKm: 38, elevationGainM: 40 },
      { name: "Intercity Expressway Node", distanceKm: 92, elevationGainM: 320 },
      { name: "Downtown Business District", distanceKm: 14, elevationGainM: 20 },
    ];
  }, [selectedCity]);

  // Center map on city change
  useEffect(() => {
    setMapCenter([cityConfig.lat, cityConfig.lng]);
    setUserLocation([cityConfig.lat + 0.008, cityConfig.lng - 0.006]);
  }, [selectedCity, cityConfig.lat, cityConfig.lng]);

  // Update battery percentage when vehicle changes
  useEffect(() => {
    setCurrentBatteryPct(activeVehicle.currentBatteryPct);
  }, [activeVehicleId, activeVehicle.currentBatteryPct]);

  // Compute stations with real Haversine distance from driver
  const stationsWithDistance = useMemo<DriverStation[]>(() => {
    if (!liveData?.stations) return [];
    return liveData.stations.map((st) => ({
      ...st,
      distanceKm: haversineKm(userLocation[0], userLocation[1], st.latitude, st.longitude),
    }));
  }, [liveData, userLocation]);

  // Filter stations based on driver inputs
  const filteredStations = useMemo(() => {
    return stationsWithDistance.filter((st) => {
      // 1. Text Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = st.name.toLowerCase().includes(q);
        const opMatch = (st.operator || "").toLowerCase().includes(q);
        const addrMatch = (st.address || "").toLowerCase().includes(q);
        if (!nameMatch && !opMatch && !addrMatch) return false;
      }

      // 2. Power Speed Filter
      if (speedFilter === "ultra") {
        if (!st.power_kw || st.power_kw < 150) return false;
      } else if (speedFilter === "fast") {
        if (!st.power_kw || st.power_kw < 50 || st.power_kw >= 150) return false;
      } else if (speedFilter === "ac") {
        if (st.power_kw && st.power_kw >= 50) return false;
      }

      // 3. Connector Filter
      if (connectorFilter !== "all") {
        if (!st.connector_types || !st.connector_types.some((c) => c.toLowerCase().includes(connectorFilter.toLowerCase()))) {
          return false;
        }
      }

      // 4. Availability Filter
      if (onlyAvailable && !st.is_operational) {
        return false;
      }

      // 5. Vehicle Compatibility Filter
      if (onlyCompatible) {
        const plugClean = activeVehicle.plugType.toLowerCase().split(" ")[0];
        const isMatched = st.connector_types.some((c) => c.toLowerCase().includes(plugClean));
        if (!isMatched) return false;
      }

      // 6. Saved Bookmarks Filter
      if (onlySaved) {
        if (!savedStationIds.has(st.station_id)) return false;
      }

      return true;
    });
  }, [
    stationsWithDistance,
    searchQuery,
    speedFilter,
    connectorFilter,
    onlyAvailable,
    onlyCompatible,
    onlySaved,
    savedStationIds,
    activeVehicle.plugType,
  ]);

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setSpeedFilter("all");
    setConnectorFilter("all");
    setOnlyAvailable(false);
    setOnlyCompatible(false);
    setOnlySaved(false);
  };

  // Nearest Ultra Charger for quick-action
  const nearestUltraStation = useMemo(() => {
    const ultraStations = stationsWithDistance
      .filter((s) => s.power_kw && s.power_kw >= 150)
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    if (ultraStations.length > 0) {
      return {
        name: ultraStations[0].name,
        distanceKm: ultraStations[0].distanceKm || 2.4,
        powerKw: ultraStations[0].power_kw || 150,
        raw: ultraStations[0],
      };
    }
    return null;
  }, [stationsWithDistance]);

  // Automotive range calculation physics formula:
  // Range (km) = (Usable Battery kWh * (SoC / 100)) / (Efficiency kWh/100km / 100) * DriveModeFactor * HvacFactor
  const calibratedRangeKm = useMemo(() => {
    const energyAvailableKwh = activeVehicle.usableKwh * (currentBatteryPct / 100);
    const baseKm = energyAvailableKwh / (activeVehicle.efficiencyKwh100km / 100);

    let driveFactor = 1.0;
    if (driveMode === "eco") driveFactor = 1.12;
    if (driveMode === "sport") driveFactor = 0.86;

    const hvacFactor = hvacActive ? 0.92 : 1.0;
    return Math.round(baseKm * driveFactor * hvacFactor);
  }, [activeVehicle, currentBatteryPct, driveMode, hvacActive]);

  // Toggle Save Station
  const toggleSaveStation = (stationId: string) => {
    setSavedStationIds((prev) => {
      const next = new Set(prev);
      if (next.has(stationId)) next.delete(stationId);
      else next.add(stationId);
      return next;
    });
  };

  // Launch in-app navigation
  const startNavigation = (station: DriverStation) => {
    setNavStation(station);
    setIsNavigating(true);
    setNavProgress(0);
    setActiveTab("explore");
    setIsStationDetailOpen(false);

    if (navIntervalRef.current) clearInterval(navIntervalRef.current);
    navIntervalRef.current = setInterval(() => {
      setNavProgress((prev) => {
        if (prev >= 1) {
          clearInterval(navIntervalRef.current);
          return 1;
        }
        return prev + 0.03;
      });
    }, 500);
  };

  // Cancel in-app navigation
  const cancelNavigation = () => {
    if (navIntervalRef.current) clearInterval(navIntervalRef.current);
    setIsNavigating(false);
    setNavStation(null);
    setNavProgress(0);
  };

  // Start Charging Session
  const startChargingSession = (station?: DriverStation) => {
    const target = station || selectedStation || filteredStations[0];
    if (!target) return;

    setChargeStation(target);
    setIsCharging(true);
    setChargeElapsedSeconds(0);
    setChargeKwhDelivered(0);

    const maxKw = Math.min(activeVehicle.maxDcSpeedKw, target.power_kw || 150);
    setChargeCurrentKw(maxKw);
    setActiveTab("charging");
    setIsStationDetailOpen(false);
  };

  // Stop Charging Session
  const stopChargingSession = () => {
    if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    setIsCharging(false);
    setShowReceiptModal(true);
  };

  // Live Charging Simulation Timer
  useEffect(() => {
    if (isCharging) {
      chargeIntervalRef.current = setInterval(() => {
        setChargeElapsedSeconds((prev) => prev + 1);

        setChargeKwhDelivered((prev) => {
          const increment = +(chargeCurrentKw / 3600).toFixed(4);
          const nextKwh = +(prev + increment).toFixed(3);
          setChargeCost(+(nextKwh * 0.28).toFixed(2));
          return nextKwh;
        });

        setCurrentBatteryPct((prev) => {
          if (prev >= chargeTargetLimit) {
            stopChargingSession();
            return chargeTargetLimit;
          }
          return prev + 0.1 > chargeTargetLimit ? chargeTargetLimit : +(prev + 0.05).toFixed(1);
        });
      }, 1000);
    } else {
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    }

    return () => {
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    };
  }, [isCharging, chargeCurrentKw, chargeTargetLimit]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center selection:bg-[#111312] selection:text-white transition-colors duration-300 ${
        viewMode === "frame"
          ? "bg-[#0C0E0D] text-[#111312]"
          : "bg-[#FAF9F6] text-[#111312]"
      }`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      }}
    >
      {/* ── Studio Toolbar (visible on desktop) ── */}
      <div className="hidden md:flex w-full max-w-5xl items-center justify-between px-6 py-3 border-b border-[rgba(255,255,255,0.08)] text-xs text-[#8C938E] z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C8F369]" />
            <span className="font-bold text-white tracking-tight">EV VERSE MOBILE DRIVER APP</span>
          </div>
          <span className="text-[11px] bg-white/10 text-white/80 px-2 py-0.5 rounded-md font-mono">
            Port 3001
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#1A1D1B] p-1 rounded-xl border border-[rgba(255,255,255,0.08)]">
          <button
            onClick={() => setViewMode("frame")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "frame" ? "bg-[#C8F369] text-[#111312] shadow-xs" : "text-[#8C938E] hover:text-white"
            }`}
          >
            <span>📱</span> iPhone 16 Pro Frame
          </button>
          <button
            onClick={() => setViewMode("fluid")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "fluid" ? "bg-white text-[#111312] shadow-xs" : "text-[#8C938E] hover:text-white"
            }`}
          >
            <span>↔️</span> Mobile Column
          </button>
          <button
            onClick={() => setViewMode("expanded")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "expanded" ? "bg-white text-[#111312] shadow-xs" : "text-[#8C938E] hover:text-white"
            }`}
          >
            <span>🖥️</span> Expanded View
          </button>
        </div>

        {/* Scale Controls for iPhone Frame */}
        {viewMode === "frame" && (
          <div className="flex items-center gap-1 bg-[#1A1D1B] px-2 py-1 rounded-xl border border-[rgba(255,255,255,0.08)]">
            <span className="text-[10px] text-[#8C938E] uppercase font-mono mr-1">Scale:</span>
            {[1.0, 0.92, 0.82].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-colors ${
                  scale === s ? "bg-[#C8F369] text-[#111312]" : "text-[#8C938E] hover:text-white"
                }`}
              >
                {Math.round(s * 100)}%
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Outer Mobile Container Shell ── */}
      <div
        className={`w-full flex-1 flex items-center justify-center ${
          viewMode === "frame"
            ? "py-6 px-4"
            : viewMode === "expanded"
            ? "py-4 px-4 max-w-5xl"
            : "py-0 px-0 max-w-[430px]"
        }`}
        style={
          viewMode === "frame"
            ? {
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }
            : undefined
        }
      >
        {/* Hardware Frame or Standard Container */}
        <div
          className={
            viewMode === "frame"
              ? "relative w-[424px] h-[866px] rounded-[56px] p-[10px] flex flex-col select-none"
              : viewMode === "expanded"
              ? "w-full max-w-5xl min-h-screen flex flex-col relative bg-[#FAF9F6] shadow-xl rounded-3xl border border-[rgba(17,19,18,0.08)] overflow-hidden"
              : "w-full max-w-[430px] min-h-screen flex flex-col relative bg-[#FAF9F6] shadow-2xl border-x border-[rgba(17,19,18,0.06)]"
          }
          style={
            viewMode === "frame"
              ? {
                  background:
                    "linear-gradient(145deg, #383B39 0%, #1D1F1E 30%, #303331 60%, #151716 100%)",
                  boxShadow:
                    "0 45px 120px -20px rgba(0,0,0,0.95), 0 25px 60px -15px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 2px rgba(255,255,255,0.25)",
                }
              : undefined
          }
        >
          {/* Physical Hardware Buttons (Left & Right) */}
          {viewMode === "frame" && (
            <>
              {/* Left: Action Button */}
              <div
                className="absolute -left-[5px] top-28 w-[5px] h-8 rounded-l-xs"
                style={{
                  background: "linear-gradient(to right, #242625, #444845)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2)",
                }}
              />
              {/* Left: Volume Up */}
              <div
                className="absolute -left-[5px] top-40 w-[5px] h-12 rounded-l-xs"
                style={{
                  background: "linear-gradient(to right, #242625, #444845)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2)",
                }}
              />
              {/* Left: Volume Down */}
              <div
                className="absolute -left-[5px] top-56 w-[5px] h-12 rounded-l-xs"
                style={{
                  background: "linear-gradient(to right, #242625, #444845)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2)",
                }}
              />
              {/* Right: Power / Siri Button */}
              <div
                className="absolute -right-[5px] top-36 w-[5px] h-16 rounded-r-xs"
                style={{
                  background: "linear-gradient(to left, #242625, #444845)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2)",
                }}
              />
              {/* Right: Camera Control Touch Groove */}
              <div
                className="absolute -right-[4.5px] top-64 w-[4.5px] h-14 rounded-r-xs opacity-75"
                style={{
                  background: "linear-gradient(to left, #1A1C1B, #333634)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
                }}
              />
            </>
          )}

          {/* Inner OLED Glass Bezel */}
          <div
            className={
              viewMode === "frame"
                ? "w-full h-full rounded-[48px] bg-[#0A0C0B] p-[8px] flex flex-col relative overflow-hidden"
                : "w-full h-full flex flex-col"
            }
          >
            {/* Specular Diagonal Glass Highlight Sheen */}
            {viewMode === "frame" && (
              <div
                className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full z-50 opacity-40"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 70%)",
                }}
              />
            )}

            {/* iOS Dynamic Island & Status Bar (in frame mode) */}
            {viewMode === "frame" && (
              <div className="h-11 w-full flex items-center justify-between px-6 shrink-0 z-40 bg-[#FAF9F6] border-b border-black/[0.04] select-none">
                {/* iOS Time */}
                <span className="text-[13px] font-semibold text-[#111312] font-mono tracking-tight">
                  9:41
                </span>

                {/* Hyperrealistic Dynamic Island with Live Activity Expansion */}
                <div
                  className={`transition-all duration-300 h-7 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md ${
                    isCharging
                      ? "w-48 bg-black text-[#C8F369]"
                      : isNavigating
                      ? "w-44 bg-black text-white"
                      : "w-24 bg-black"
                  }`}
                >
                  {isCharging ? (
                    <>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                        <Zap size={11} className="text-[#C8F369] animate-pulse" />
                        <span>+{chargeCurrentKw} kW</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono font-bold text-white">
                          {currentBatteryPct}%
                        </span>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] border border-black" />
                      </div>
                    </>
                  ) : isNavigating && navStation ? (
                    <>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#C8F369]">
                        <Navigation size={11} />
                        <span>{Math.round((1 - navProgress) * (navStation.distanceKm || 4.2) * 10) / 10} km</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[#C8F369] animate-pulse" />
                    </>
                  ) : (
                    <>
                      {/* True sapphire lens reflection & sensor */}
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0D1527] border border-[#233554] shadow-inner" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0A0E17] border border-[#162136]" />
                    </>
                  )}
                </div>

                {/* iOS Status Indicators (Cellular Bars, 5G, Wi-Fi, Battery) */}
                <div className="flex items-center gap-1.5 text-[#111312]">
                  {/* Cellular 4-Bars SVG */}
                  <svg className="w-3.5 h-2.5 fill-current" viewBox="0 0 17 12">
                    <rect x="0" y="9" width="2.5" height="3" rx="0.5" />
                    <rect x="4.5" y="6" width="2.5" height="6" rx="0.5" />
                    <rect x="9" y="3" width="2.5" height="9" rx="0.5" />
                    <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" />
                  </svg>

                  {/* 5G Badge */}
                  <span className="text-[10.5px] font-mono font-bold">5G</span>

                  {/* Wi-Fi Arcs SVG */}
                  <svg className="w-3.5 h-2.5 fill-current" viewBox="0 0 16 12">
                    <path d="M8 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4.24-2.83a6 6 0 018.48 0l-1.06 1.06a4.5 4.5 0 00-6.36 0L3.76 7.67zm-2.83-2.83a10 10 0 0114.14 0l-1.06 1.06a8.5 8.5 0 00-12.02 0L.93 4.84z" />
                  </svg>

                  {/* iOS Battery Cylinder with Fill */}
                  <div className="relative w-5 h-2.5 border-[1.5px] border-[#111312] rounded-[3px] p-[1px] flex items-center">
                    <div
                      className="h-full bg-[#111312] rounded-[1px] transition-all"
                      style={{ width: `${Math.max(10, currentBatteryPct)}%` }}
                    />
                    <div className="absolute -right-[3px] top-[2px] w-[1.5px] h-1 bg-[#111312] rounded-r-[1px]" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Screen Wrapper ── */}
            <div className="w-full flex-1 flex flex-col overflow-y-auto no-scrollbar bg-[#FAF9F6] relative rounded-b-[40px]">
            {/* ── Top Driver Status Header ─────────────────────────────────────── */}
            <header
              className="sticky top-0 z-40 px-4 py-3 border-b flex items-center justify-between"
              style={{
                background: "rgba(250, 249, 246, 0.96)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderColor: "rgba(17, 19, 18, 0.07)",
              }}
            >
              {/* Brand Logo & Model */}
              <div className="flex items-center gap-2.5">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-7 h-7 rounded-lg bg-[#111312] flex items-center justify-center text-[#C8F369] font-bold text-xs">
                    EV
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-tight text-[#111312] block leading-none">
                      EV VERSE
                    </span>
                    <span className="text-[9.5px] font-mono text-[#8C938E] leading-none mt-0.5 block">
                      {activeVehicle.make} {activeVehicle.model}
                    </span>
                  </div>
                </Link>
              </div>

              {/* City Selector Dropdown */}
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="text-xs font-semibold bg-white border border-[rgba(17,19,18,0.08)] text-[#111312] rounded-xl px-2.5 py-1.5 focus:outline-hidden cursor-pointer shadow-2xs hover:bg-[#F5F4EF] transition-colors"
                >
                  {Object.keys(CITY_CONFIGS).map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>

                {/* Offline / Live Status Indicator */}
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isLive ? "bg-[#16A34A]" : "bg-[#EAB308]"
                  }`}
                  title={isLive ? "Open Charge Map Live" : "Verified Regional Baseline"}
                />
              </div>
            </header>

            {/* ── Main Viewport Content ────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col relative overflow-y-auto">
              
              {/* ═════════ TAB 1: HOME (Cockpit) ═════════ */}
              {activeTab === "home" && (
                <div className="p-4 flex-1">
                  <OfflineNotice source={source} />
                  <VehicleCockpit
                    vehicle={activeVehicle}
                    currentBatteryPct={currentBatteryPct}
                    calibratedRangeKm={calibratedRangeKm}
                    driveMode={driveMode}
                    setDriveMode={setDriveMode}
                    hvacActive={hvacActive}
                    setHvacActive={setHvacActive}
                    doorsLocked={doorsLocked}
                    setDoorsLocked={setDoorsLocked}
                    isPreconditioning={isPreconditioning}
                    setIsPreconditioning={setIsPreconditioning}
                    nearestUltraStation={nearestUltraStation}
                    onNavigateToNearest={() => {
                      if (nearestUltraStation?.raw) {
                        startNavigation(nearestUltraStation.raw);
                      }
                    }}
                    onOpenGarage={() => setActiveTab("garage")}
                  />
                </div>
              )}

              {/* ═════════ TAB 2: EXPLORE (Charging Map) ═════════ */}
              {activeTab === "explore" && (
                <div className="flex-1 flex flex-col relative w-full h-[620px] min-h-[500px]">
                  {/* Interactive Leaflet Map Viewport */}
                  <div className="flex-1 relative w-full h-full">
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

                {/* Floating Top Controls (Search & Quick Filters) */}
                <div className="absolute top-3 left-3 right-3 z-30 space-y-2 pointer-events-auto">
                  {/* Search Bar */}
                  <div className="relative w-full">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C938E]"
                    />
                    <input
                      type="text"
                      placeholder={`Search charging hubs in ${selectedCity}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-[rgba(17,19,18,0.1)] text-xs font-medium text-[#111312] placeholder-[#8C938E] shadow-sm focus:outline-hidden focus:ring-1 focus:ring-[#111312]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C938E] hover:text-[#111312]"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {(
                      [
                        { id: "all", label: "All Speeds" },
                        { id: "ultra", label: "⚡ Ultra (150kW+)" },
                        { id: "fast", label: "Fast (50kW+)" },
                        { id: "ac", label: "AC Standard" },
                      ] as const
                    ).map((f) => {
                      const isActive = speedFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setSpeedFilter(f.id)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shadow-2xs active:scale-95 ${
                            isActive
                              ? "bg-[#111312] text-white"
                              : "bg-white/95 backdrop-blur-md text-[#525854] border border-[rgba(17,19,18,0.08)] hover:bg-[#F3F2ED]"
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}

                    {/* Connector Match Toggle */}
                    <button
                      onClick={() => setOnlyCompatible(!onlyCompatible)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shadow-2xs active:scale-95 ${
                        onlyCompatible
                          ? "bg-[#111312] text-[#C8F369]"
                          : "bg-white/95 backdrop-blur-md text-[#525854] border border-[rgba(17,19,18,0.08)] hover:bg-[#F3F2ED]"
                      }`}
                    >
                      🔌 Match {activeVehicle.make}
                    </button>

                    {/* Saved Bookmarks Filter */}
                    {savedStationIds.size > 0 && (
                      <button
                        onClick={() => setOnlySaved(!onlySaved)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shadow-2xs active:scale-95 ${
                          onlySaved
                            ? "bg-[#EF4444] text-white"
                            : "bg-white/95 backdrop-blur-md text-[#EF4444] border border-[#FCA5A5]"
                        }`}
                      >
                        ♥ Saved ({savedStationIds.size})
                      </button>
                    )}
                  </div>
                </div>

                {/* In-app Navigation HUD Banner */}
                {isNavigating && navStation && (
                  <div className="absolute top-28 left-3 right-3 z-30 bg-[#111312] text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between border border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[rgba(200,243,105,0.2)] flex items-center justify-center text-[#C8F369]">
                        <Navigation size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#C8F369] font-bold">
                          NAVIGATING ({Math.round((1 - navProgress) * (navStation.distanceKm || 4.2) * 10) / 10} km)
                        </div>
                        <div className="text-xs font-bold text-white truncate max-w-[180px]">
                          {navStation.name}
                        </div>
                        <div className="text-[10px] text-[#9CA3AF]">
                          Arrival SoC: ~{Math.max(10, currentBatteryPct - Math.round(((navStation.distanceKm || 4) / activeVehicle.wltpRangeKm) * 100))}%
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={cancelNavigation}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      Exit
                    </button>
                  </div>
                )}

                {/* Empty State Overlay when 0 stations found */}
                {filteredStations.length === 0 && !loading && (
                  <div className="absolute inset-x-3 bottom-20 z-30">
                    <EmptyState onReset={handleResetFilters} />
                  </div>
                )}

                {/* Bottom Quick Hubs Drawer / Peek Card */}
                {!isStationDetailOpen && filteredStations.length > 0 && (
                  <div className="absolute bottom-16 left-3 right-3 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[rgba(17,19,18,0.08)] shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C938E] font-semibold">
                        {filteredStations.length} Verified Charging Hubs
                      </span>
                      <span className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                        Active Grid
                      </span>
                    </div>

                    {/* First Station Preview Card */}
                    {filteredStations[0] && (
                      <div
                        onClick={() => {
                          setSelectedStation(filteredStations[0]);
                          setIsStationDetailOpen(true);
                        }}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="pr-3 truncate">
                          <div className="text-xs font-bold text-[#111312] group-hover:text-[#16A34A] transition-colors truncate">
                            {filteredStations[0].name}
                          </div>
                          <div className="text-[10.5px] text-[#525854] font-mono mt-0.5">
                            {filteredStations[0].distanceKm ? `${filteredStations[0].distanceKm.toFixed(1)} km` : "Nearby"} • {filteredStations[0].power_kw || 120} kW DC • {filteredStations[0].bays} Bays
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startNavigation(filteredStations[0]);
                          }}
                          className="px-3 py-1.5 bg-[#111312] text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-[#252826] active:scale-95 shrink-0"
                        >
                          <Navigation size={12} className="text-[#C8F369]" />
                          Route
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Station Detail Sheet Modal */}
                {isStationDetailOpen && selectedStation && (
                  <div className="absolute inset-x-0 bottom-14 z-40 bg-white rounded-t-3xl p-5 border-t border-[rgba(17,19,18,0.1)] shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
                    {/* Drawer Header */}
                    <div className="flex items-start justify-between">
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9.5px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold ${
                              selectedStation.is_operational
                                ? "bg-[#DCFCE7] text-[#15803D]"
                                : "bg-[#FEE2E2] text-[#991B1B]"
                            }`}
                          >
                            {selectedStation.is_operational ? "OPERATIONAL" : "OFFLINE"}
                          </span>
                          <span className="text-[10px] text-[#8C938E] font-mono">
                            {selectedStation.operator || "Public Network"}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#111312] mt-1">
                          {selectedStation.name}
                        </h3>
                        <div className="text-xs text-[#525854] mt-0.5">
                          {selectedStation.address || `${selectedCity} Hub`}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Bookmark Button */}
                        <button
                          onClick={() => toggleSaveStation(selectedStation.station_id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                            savedStationIds.has(selectedStation.station_id)
                              ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#EF4444]"
                              : "bg-[#F4F3EE] border-[rgba(17,19,18,0.06)] text-[#525854]"
                          }`}
                        >
                          <Heart
                            size={16}
                            fill={savedStationIds.has(selectedStation.station_id) ? "#EF4444" : "none"}
                          />
                        </button>

                        {/* Close Sheet */}
                        <button
                          onClick={() => setIsStationDetailOpen(false)}
                          className="w-8 h-8 rounded-full bg-[#F4F3EE] flex items-center justify-center text-[#525854] hover:bg-[#EAE8E2]"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-[#FAF9F6] rounded-2xl border border-[rgba(17,19,18,0.06)] text-center">
                      <div>
                        <div className="text-[9.5px] font-mono uppercase text-[#8C938E]">Distance</div>
                        <div className="text-xs font-bold text-[#111312] font-mono mt-0.5">
                          {selectedStation.distanceKm ? `${selectedStation.distanceKm.toFixed(1)} km` : "Nearby"}
                        </div>
                        <div className="text-[9.5px] text-[#525854]">
                          ~{Math.round((selectedStation.distanceKm || 3) * 2.2)} mins
                        </div>
                      </div>

                      <div className="border-x border-[rgba(17,19,18,0.06)]">
                        <div className="text-[9.5px] font-mono uppercase text-[#8C938E]">Speed</div>
                        <div className="text-xs font-bold text-[#16A34A] font-mono mt-0.5">
                          {selectedStation.power_kw ? `${selectedStation.power_kw} kW` : "Standard AC"}
                        </div>
                        <div className="text-[9.5px] text-[#525854]">
                          {selectedStation.bays} Bay{selectedStation.bays > 1 ? "s" : ""}
                        </div>
                      </div>

                      <div>
                        <div className="text-[9.5px] font-mono uppercase text-[#8C938E]">Arrival SoC</div>
                        <div className="text-xs font-bold text-[#111312] font-mono mt-0.5">
                          ~{Math.max(5, currentBatteryPct - Math.round(((selectedStation.distanceKm || 3) / activeVehicle.wltpRangeKm) * 100))}%
                        </div>
                        <div className="text-[9.5px] text-[#16A34A] font-semibold">Safe Reserve</div>
                      </div>
                    </div>

                    {/* Connectors Row */}
                    <div className="text-xs text-[#525854] flex items-center gap-2">
                      <span className="font-semibold text-[#111312]">Connectors:</span>
                      <span className="bg-[#F4F3EE] px-2.5 py-1 rounded-lg font-mono text-[11px] text-[#111312]">
                        {selectedStation.connector_types && selectedStation.connector_types.length > 0
                          ? selectedStation.connector_types.join(", ")
                          : "CCS2 Combo (Standard Fast)"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => startNavigation(selectedStation)}
                        className="py-3 bg-[#111312] text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#252826] active:scale-98 transition-all shadow-xs"
                      >
                        <Navigation size={13} className="text-[#C8F369]" />
                        Start Navigation
                      </button>

                      <button
                        onClick={() => startChargingSession(selectedStation)}
                        className="py-3 bg-[#C8F369] text-[#111312] border border-[#111312] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#BCE95D] active:scale-98 transition-all shadow-xs"
                      >
                        <Zap size={13} />
                        Start Session
                      </button>
                    </div>

                    {/* Google Maps External Link */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#525854] flex items-center justify-center gap-1 hover:underline pt-1"
                    >
                      <span>Open in External Google Maps</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═════════ TAB 3: JOURNEYS (Corridor Planner) ═════════ */}
          {activeTab === "journeys" && (
            <div className="p-4 flex-1">
              <JourneyPlanner
                destinations={cityTripDestinations}
                selectedDestIndex={tripDestIndex}
                onSelectDestIndex={setTripDestIndex}
                activeVehicle={activeVehicle}
                currentBatteryPct={currentBatteryPct}
                onStartTripNavigation={(dest) => {
                  // Synthesize corridor target location
                  const destStation: DriverStation = {
                    station_id: `CORRIDOR-${dest.name.replace(/\s+/g, "-")}`,
                    name: dest.name,
                    latitude: cityConfig.lat + (dest.distanceKm / 111) * 0.7,
                    longitude: cityConfig.lng + (dest.distanceKm / 111) * 0.7,
                    address: `${dest.name} Corridor, ${selectedCity}`,
                    operator: "QuantEV Superhub Network",
                    status: "Operational",
                    is_operational: true,
                    power_kw: 250,
                    bays: 8,
                    connector_types: ["CCS2", "Type 2"],
                    usage_cost: "$0.28/kWh",
                    source: "kaggle_baseline",
                    distanceKm: dest.distanceKm,
                  };
                  startNavigation(destStation);
                }}
              />
            </div>
          )}

          {/* ═════════ TAB 4: CHARGING (Session Console) ═════════ */}
          {activeTab === "charging" && (
            <div className="p-4 flex-1">
              <ChargingConsole
                isCharging={isCharging}
                vehicle={activeVehicle}
                currentBatteryPct={currentBatteryPct}
                chargeStation={chargeStation}
                targetLimit={chargeTargetLimit}
                setTargetLimit={setChargeTargetLimit}
                elapsedSeconds={chargeElapsedSeconds}
                kwhDelivered={chargeKwhDelivered}
                currentKw={chargeCurrentKw}
                chargeCost={chargeCost}
                onStartCharge={() => startChargingSession()}
                onStopCharge={stopChargingSession}
                showReceiptModal={showReceiptModal}
                onCloseReceiptModal={() => setShowReceiptModal(false)}
              />
            </div>
          )}

          {/* ═════════ TAB 5: GARAGE (Fleet Registry) ═════════ */}
          {activeTab === "garage" && (
            <div className="p-4 flex-1">
              <GarageFleet
                vehicles={GARAGE_VEHICLES}
                activeVehicleId={activeVehicleId}
                onSelectVehicle={(id) => {
                  setActiveVehicleId(id);
                }}
              />
            </div>
          )}
        </main>

        {/* ── Fixed Bottom Navigation Bar ──────────────────────────────────── */}
        <DriverNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCharging={isCharging}
        />
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
