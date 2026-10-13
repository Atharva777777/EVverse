"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { BrandLogo } from "@/components/BrandLogo";
import { useLiveData } from "@/hooks/useLiveData";
import { CITY_CONFIGS } from "@/components/CountryCitySelector";
import type { LiveStation } from "@/types/api";

export interface DriverStation extends LiveStation {
  distanceKm?: number;
}
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
  ChevronRight,
  Maximize2,
  Minimize2,
  BatteryCharging,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  RotateCw,
  ShieldCheck,
  Thermometer,
  ExternalLink,
  Lock,
  Unlock,
  AlertCircle,
  Filter,
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

// Distance helper (Haversine formula in km)
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

// Real-world production electric vehicles with verified specifications
const GARAGE_VEHICLES: EVVehicle[] = [
  {
    id: "porsche",
    make: "Porsche",
    model: "Taycan GTS",
    year: 2025,
    image: "/images/car-porsche.png",
    batteryKwh: 93.4,
    usableKwh: 83.7,
    currentBatteryPct: 78,
    wltpRangeKm: 504,
    efficiencyKwh100km: 18.6,
    maxDcSpeedKw: 270,
    maxAcSpeedKw: 22,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    vin: "WP0AB2Y15PSA92811",
    sohPct: 98.6,
  },
  {
    id: "bmw",
    make: "BMW",
    model: "i7 xDrive60",
    year: 2025,
    image: "/images/car-bmw.png",
    batteryKwh: 101.7,
    usableKwh: 101.7,
    currentBatteryPct: 64,
    wltpRangeKm: 625,
    efficiencyKwh100km: 19.6,
    maxDcSpeedKw: 195,
    maxAcSpeedKw: 22,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    vin: "WBA53EJ01PFP88124",
    sohPct: 99.1,
  },
  {
    id: "mercedes",
    make: "Mercedes-Benz",
    model: "EQS 580 4MATIC",
    year: 2025,
    image: "/images/car-sclass.png",
    batteryKwh: 107.8,
    usableKwh: 107.8,
    currentBatteryPct: 82,
    wltpRangeKm: 770,
    efficiencyKwh100km: 17.5,
    maxDcSpeedKw: 200,
    maxAcSpeedKw: 22,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    vin: "W1K2971231A049921",
    sohPct: 98.4,
  },
  {
    id: "rangerover",
    make: "Range Rover",
    model: "Electric Autobiography",
    year: 2026,
    image: "/images/car-rangerover.png",
    batteryKwh: 110.0,
    usableKwh: 102.0,
    currentBatteryPct: 52,
    wltpRangeKm: 520,
    efficiencyKwh100km: 23.5,
    maxDcSpeedKw: 220,
    maxAcSpeedKw: 22,
    plugType: "CCS2 Combo",
    plugImage: "/images/plug-ccs2.png",
    vin: "SALWR2V45RA812034",
    sohPct: 99.4,
  },
  {
    id: "model",
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

export default function EVVerseDriverPage() {
  // Navigation tabs: Explore (Map), Dashboard (Status), Trips (Planner), Charging (Session), Garage (Fleet)
  const [activeTab, setActiveTab] = useState<"explore" | "dashboard" | "trips" | "charging" | "garage">("explore");

  // Mobile device frame view toggle for desktop users
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

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

  // User Location (centered relative to city)
  const [userLocation, setUserLocation] = useState<[number, number]>([
    cityConfig.lat + 0.008,
    cityConfig.lng - 0.006,
  ]);

  // Live stations from backend API
  const { data: liveData, loading, isLive, stationCount, source } = useLiveData(selectedCity);

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
  const cityTripDestinations = useMemo(() => {
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
      setTripDestIndex(0);
    }
  }, [selectedCity]);

  // Update battery percentage when vehicle changes
  useEffect(() => {
    setCurrentBatteryPct(activeVehicle.currentBatteryPct);
  }, [activeVehicleId, activeVehicle.currentBatteryPct]);

  // Compute stations with real Haversine distance from driver
  const stationsWithDistance = useMemo(() => {
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
        const carPlug = activeVehicle.plugType.toLowerCase();
        const hasMatchingPlug = st.connector_types?.some((c) => {
          const type = c.toLowerCase();
          if (carPlug.includes("ccs") && type.includes("ccs")) return true;
          if (carPlug.includes("type 2") && type.includes("type 2")) return true;
          return false;
        });
        if (!hasMatchingPlug) return false;
      }

      // 6. Only Bookmarked Filter
      if (onlySaved && !savedStationIds.has(st.station_id)) {
        return false;
      }

      return true;
    });
  }, [stationsWithDistance, searchQuery, speedFilter, connectorFilter, onlyAvailable, onlyCompatible, onlySaved, savedStationIds, activeVehicle.plugType]);

  // Real-world range calculation based on driving mode and HVAC impact
  const calculatedRangeKm = useMemo(() => {
    const modeMultiplier = driveMode === "eco" ? 1.12 : driveMode === "sport" ? 0.86 : 1.0;
    const hvacMultiplier = hvacActive ? 0.94 : 1.0;
    const baseRange = (activeVehicle.wltpRangeKm * (currentBatteryPct / 100));
    return Math.round(baseRange * modeMultiplier * hvacMultiplier);
  }, [activeVehicle.wltpRangeKm, currentBatteryPct, driveMode, hvacActive]);

  // Toggle favorite saved station
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

    // Power delivered is min of station max and car max DC rate
    const maxKw = Math.min(activeVehicle.maxDcSpeedKw, target.power_kw || 150);
    setChargeCurrentKw(maxKw);
    setActiveTab("charging");
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
        setChargeElapsedSeconds((sec) => sec + 1);

        // Calculate energy increment per second (kW / 3600)
        const kw = chargeCurrentKw;
        const kwhIncrement = kw / 3600 * 1.5; // Slightly accelerated simulation

        setChargeKwhDelivered((prev) => {
          const nextKwh = +(prev + kwhIncrement).toFixed(2);
          // Update vehicle battery percentage
          const pctGain = (kwhIncrement / activeVehicle.usableKwh) * 100;
          setCurrentBatteryPct((prevPct) => {
            const nextPct = Math.min(100, Math.round(prevPct + pctGain));
            if (nextPct >= chargeTargetLimit) {
              // Target limit reached: gracefully stop session
              setTimeout(() => stopChargingSession(), 200);
            }
            return nextPct;
          });
          return nextKwh;
        });

        // Tariff cost calculation ($0.32 / kWh standard)
        setChargeCost((prev) => +(prev + kwhIncrement * 0.32).toFixed(2));
      }, 1000);
    } else {
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    }

    return () => {
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    };
  }, [isCharging, chargeCurrentKw, activeVehicle.usableKwh, chargeTargetLimit]);

  // Trip planner calculations for selected corridor destination
  const currentTripDest = cityTripDestinations[tripDestIndex] || cityTripDestinations[0];
  const tripRequiredKwh = +(currentTripDest.distanceKm * (activeVehicle.efficiencyKwh100km / 100) * 1.05).toFixed(1);
  const tripAvailableKwh = +(activeVehicle.usableKwh * (currentBatteryPct / 100)).toFixed(1);
  const tripArrivalPct = Math.max(0, Math.round(((tripAvailableKwh - tripRequiredKwh) / activeVehicle.usableKwh) * 100));
  const tripNeedsChargeStop = tripArrivalPct < 15;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F1F3EE",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
        color: "#151817",
        padding: isPhoneFrame ? "20px 16px" : "0",
      }}
    >
      {/* ── TOP CONTROL BAR (DESKTOP CONTROLS) ────────────────────── */}
      <div
        style={{
          width: isPhoneFrame ? "414px" : "100%",
          maxWidth: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
          padding: "0 6px",
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
          <span style={{ fontSize: "16px" }}>←</span>
          <span>EV Verse Overview</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
            title={isPhoneFrame ? "Expand to Full Window" : "View in Mobile Phone Frame"}
          >
            {isPhoneFrame ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            <span>{isPhoneFrame ? "Full Width" : "Phone Frame"}</span>
          </button>
        </div>
      </div>

      {/* ── MOBILE PHONE SHELL CONTAINER ──────────────────────────── */}
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
        {/* Dynamic Island on Phone Frame */}
        {isPhoneFrame && (
          <div
            style={{
              position: "absolute",
              top: "11px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "126px",
              height: "30px",
              background: "#151817",
              borderRadius: "20px",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              color: "#ffffff",
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isCharging ? "#10b981" : "#C9F36A" }} />
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.02em" }}>
              {isCharging ? `${currentBatteryPct}% ⚡` : isNavigating ? "NAVIGATING" : "EV VERSE"}
            </div>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#33383B" }} />
          </div>
        )}

        {/* ── SYSTEM STATUS BAR ─────────────────────────────────────── */}
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
            zIndex: 900,
            background: activeTab === "explore" ? "transparent" : "#F7F8F6",
          }}
        >
          <span>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: isLive ? "#047857" : "#64748b" }}>
              {isLive ? "5G LIVE" : "BASELINE"}
            </span>
            <span style={{ fontWeight: 700 }}>{currentBatteryPct}%</span>
          </div>
        </div>

        {/* ── TAB VIEWPORT ─────────────────────────────────────────── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* ══════════════════════════════════════════════════════════
              TAB 1: EXPLORE MAP & CHARGING DIRECTORY
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "explore" && (
            <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
              {/* Interactive Leaflet Map Viewport */}
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

              {/* Floating Top Search & Filters Bar */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "14px",
                  right: "14px",
                  zIndex: 800,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {/* Search Input Box */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.96)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "18px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${selectedCity} chargers, operator, street…`}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: "12.5px",
                      color: "#151817",
                      flex: 1,
                      fontWeight: 500,
                    }}
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <X size={15} color="#64748b" />
                    </button>
                  ) : (
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      style={{
                        border: "none",
                        background: "#F1F3EE",
                        borderRadius: "8px",
                        padding: "3px 6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#151817",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {Object.keys(CITY_CONFIGS).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Filter Pills */}
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none" }}>
                  <button
                    onClick={() => setSpeedFilter("all")}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "999px",
                      border: speedFilter === "all" ? "1.5px solid #151817" : "1px solid rgba(0,0,0,0.08)",
                      background: speedFilter === "all" ? "#151817" : "rgba(255,255,255,0.92)",
                      color: speedFilter === "all" ? "#C9F36A" : "#151817",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    All ({stationsWithDistance.length})
                  </button>

                  <button
                    onClick={() => setSpeedFilter(speedFilter === "ultra" ? "all" : "ultra")}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "999px",
                      border: speedFilter === "ultra" ? "1.5px solid #151817" : "1px solid rgba(0,0,0,0.08)",
                      background: speedFilter === "ultra" ? "#151817" : "rgba(255,255,255,0.92)",
                      color: speedFilter === "ultra" ? "#C9F36A" : "#151817",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⚡ 150kW+ Ultra
                  </button>

                  <button
                    onClick={() => setSpeedFilter(speedFilter === "fast" ? "all" : "fast")}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "999px",
                      border: speedFilter === "fast" ? "1.5px solid #151817" : "1px solid rgba(0,0,0,0.08)",
                      background: speedFilter === "fast" ? "#151817" : "rgba(255,255,255,0.92)",
                      color: speedFilter === "fast" ? "#C9F36A" : "#151817",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⚡ 50kW+ Fast
                  </button>

                  <button
                    onClick={() => setOnlyAvailable(!onlyAvailable)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "999px",
                      border: onlyAvailable ? "1.5px solid #059669" : "1px solid rgba(0,0,0,0.08)",
                      background: onlyAvailable ? "#059669" : "rgba(255,255,255,0.92)",
                      color: onlyAvailable ? "#ffffff" : "#151817",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🟢 Available Only
                  </button>

                  <button
                    onClick={() => setOnlyCompatible(!onlyCompatible)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "999px",
                      border: onlyCompatible ? "1.5px solid #151817" : "1px solid rgba(0,0,0,0.08)",
                      background: onlyCompatible ? "#151817" : "rgba(255,255,255,0.92)",
                      color: onlyCompatible ? "#C9F36A" : "#151817",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🔌 Match {activeVehicle.make}
                  </button>

                  {savedStationIds.size > 0 && (
                    <button
                      onClick={() => setOnlySaved(!onlySaved)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "999px",
                        border: onlySaved ? "1.5px solid #ef4444" : "1px solid rgba(0,0,0,0.08)",
                        background: onlySaved ? "#ef4444" : "rgba(255,255,255,0.92)",
                        color: onlySaved ? "#ffffff" : "#151817",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ♥ Saved ({savedStationIds.size})
                    </button>
                  )}
                </div>
              </div>

              {/* In-app Navigation HUD Banner */}
              {isNavigating && navStation && (
                <div
                  style={{
                    position: "absolute",
                    top: "108px",
                    left: "14px",
                    right: "14px",
                    zIndex: 850,
                    background: "#151817",
                    borderRadius: "18px",
                    color: "#ffffff",
                    padding: "14px 16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(201, 243, 106, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Navigation size={18} color="#C9F36A" />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#C9F36A", fontWeight: 700 }}>
                        NAVIGATING TO CHARGER ({Math.round((1 - navProgress) * (navStation.distanceKm || 4.2) * 10) / 10} km)
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                        {navStation.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        Arrival SoC: ~{Math.max(10, currentBatteryPct - Math.round(((navStation.distanceKm || 4) / activeVehicle.wltpRangeKm) * 100))}%
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={cancelNavigation}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#ef4444",
                      color: "#ffffff",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    End
                  </button>
                </div>
              )}

              {/* Station Detail Bottom Sheet Drawer */}
              {isStationDetailOpen && selectedStation && (
                <div
                  className="anim-fade-up"
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "12px",
                    right: "12px",
                    zIndex: 850,
                    background: "#ffffff",
                    borderRadius: "24px",
                    border: "1px solid #E2E5DF",
                    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.14)",
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {/* Header Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
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
                          {selectedStation.is_operational ? "VERIFIED OPERATIONAL" : "REPORTED OFFLINE"}
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                          {selectedStation.operator || "Public Station"}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#151817", margin: 0 }}>
                        {selectedStation.name}
                      </h3>
                      <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                        {selectedStation.address || `${selectedCity} Central Hub`}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => toggleSaveStation(selectedStation.station_id)}
                        style={{
                          background: "#F7F8F6",
                          border: "none",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Heart
                          size={16}
                          fill={savedStationIds.has(selectedStation.station_id) ? "#ef4444" : "none"}
                          color={savedStationIds.has(selectedStation.station_id) ? "#ef4444" : "#151817"}
                        />
                      </button>

                      <button
                        onClick={() => setIsStationDetailOpen(false)}
                        style={{
                          background: "#F7F8F6",
                          border: "none",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#64748b",
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Telemetry Metrics Row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "8px",
                      background: "#F7F8F6",
                      borderRadius: "14px",
                      padding: "10px 12px",
                      border: "1px solid #EBECE8",
                      fontSize: "11.5px",
                    }}
                  >
                    <div>
                      <div style={{ color: "#64748b", fontSize: "10.5px" }}>Distance</div>
                      <div style={{ fontWeight: 700, color: "#151817" }}>
                        {selectedStation.distanceKm ? `${selectedStation.distanceKm.toFixed(1)} km` : "Nearby"}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "10px" }}>
                        ~{Math.round((selectedStation.distanceKm || 3) * 2.2)} mins
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#64748b", fontSize: "10.5px" }}>Speed Rating</div>
                      <div style={{ fontWeight: 700, color: "#059669" }}>
                        {selectedStation.power_kw ? `${selectedStation.power_kw} kW DC` : "Standard AC"}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "10px" }}>
                        {selectedStation.bays} Bay{selectedStation.bays > 1 ? "s" : ""}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#64748b", fontSize: "10.5px" }}>Arrival SoC</div>
                      <div style={{ fontWeight: 700, color: "#151817" }}>
                        ~{Math.max(5, currentBatteryPct - Math.round(((selectedStation.distanceKm || 3) / activeVehicle.wltpRangeKm) * 100))}%
                      </div>
                      <div style={{ color: "#059669", fontSize: "10px", fontWeight: 600 }}>Safe Range</div>
                    </div>
                  </div>

                  {/* Connectors Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#475569" }}>
                    <span style={{ fontWeight: 600, color: "#151817" }}>Available Connectors:</span>
                    <span style={{ background: "#F1F5F9", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>
                      {selectedStation.connector_types && selectedStation.connector_types.length > 0
                        ? selectedStation.connector_types.join(", ")
                        : "CCS2 Combo (Standard Fast)"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "8px" }}>
                    <button
                      onClick={() => startNavigation(selectedStation)}
                      style={{
                        background: "#151817",
                        color: "#C9F36A",
                        border: "none",
                        borderRadius: "12px",
                        padding: "11px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Navigation size={14} />
                      <span>Start Navigation</span>
                    </button>

                    <button
                      onClick={() => startChargingSession(selectedStation)}
                      style={{
                        background: "#C9F36A",
                        color: "#151817",
                        border: "none",
                        borderRadius: "12px",
                        padding: "11px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Zap size={14} />
                      <span>Charge Here</span>
                    </button>
                  </div>

                  {/* External Google Maps Navigation Link */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textAlign: "center",
                      fontSize: "11px",
                      color: "#64748b",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      paddingTop: "2px",
                    }}
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: DASHBOARD (VEHICLE TELEMETRY & DRIVING MODES)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "dashboard" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 88px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                    VEHICLE TELEMETRY
                  </div>
                  <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#151817", margin: "1px 0 0" }}>
                    {activeVehicle.make} {activeVehicle.model}
                  </h1>
                </div>

                <button
                  onClick={() => setActiveTab("garage")}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #E2E5DF",
                    borderRadius: "999px",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Switch Car →
                </button>
              </div>

              {/* Connected Vehicle Visual Card */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  border: "1px solid #E2E5DF",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#065f46" }}>
                      CONNECTED & ONLINE
                    </span>
                  </div>

                  <button
                    onClick={() => setDoorsLocked(!doorsLocked)}
                    style={{
                      background: doorsLocked ? "#F1F5F9" : "#FEE2E2",
                      color: doorsLocked ? "#334155" : "#991B1B",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {doorsLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    <span>{doorsLocked ? "Doors Locked" : "Unlocked"}</span>
                  </button>
                </div>

                {/* Car Silhouette */}
                <div style={{ position: "relative", width: "100%", height: "115px", margin: "-2px 0" }}>
                  <Image
                    src={activeVehicle.image}
                    alt={activeVehicle.model}
                    fill
                    sizes="360px"
                    style={{ objectFit: "contain" }}
                  />
                </div>

                {/* Real-time SoC & Range Banner */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.1fr 1fr 1fr",
                    gap: "8px",
                    background: "#F7F8F6",
                    borderRadius: "16px",
                    padding: "12px 14px",
                    border: "1px solid #EBECE8",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Battery Level</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#151817", marginTop: "1px" }}>
                      {currentBatteryPct}%
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#059669", fontWeight: 600 }}>
                      {activeVehicle.sohPct}% Health
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Estimated Range</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#151817", marginTop: "1px" }}>
                      {calculatedRangeKm} km
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                      {driveMode.toUpperCase()} Mode
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Max DC Speed</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#151817", marginTop: "1px" }}>
                      {activeVehicle.maxDcSpeedKw} kW
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                      {activeVehicle.plugType}
                    </div>
                  </div>
                </div>
              </div>

              {/* Driving Mode Selector (Real-Time Range Adjustment) */}
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
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Drive Profile Calibration
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#059669" }}>
                    Impacts Estimated Range
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[
                    { key: "eco", label: "🌱 Eco Range", factor: "+12% Range" },
                    { key: "normal", label: "⚡ Normal", factor: "Baseline" },
                    { key: "sport", label: "🏁 Sport", factor: "-14% Range" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setDriveMode(m.key as any)}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "10px",
                        border: driveMode === m.key ? "1.5px solid #151817" : "1px solid #E2E8F0",
                        background: driveMode === m.key ? "#151817" : "#F8FAFC",
                        color: driveMode === m.key ? "#C9F36A" : "#334155",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <span>{m.label}</span>
                      <span style={{ fontSize: "9.5px", opacity: 0.8 }}>{m.factor}</span>
                    </button>
                  ))}
                </div>

                {/* HVAC AC Toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid #F1F5F9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Thermometer size={14} color="#64748b" />
                    <span style={{ fontSize: "12px", color: "#334155" }}>Cabin Climate Control (22°C A/C):</span>
                  </div>
                  <button
                    onClick={() => setHvacActive(!hvacActive)}
                    style={{
                      padding: "4px 9px",
                      borderRadius: "6px",
                      border: "none",
                      background: hvacActive ? "#EDF8DE" : "#F1F5F9",
                      color: hvacActive ? "#3F6212" : "#64748b",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {hvacActive ? "A/C ACTIVE (-6%)" : "A/C OFF"}
                  </button>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  onClick={() => {
                    setSpeedFilter("ultra");
                    setActiveTab("explore");
                  }}
                  style={{
                    background: "#151817",
                    color: "#ffffff",
                    borderRadius: "16px",
                    border: "none",
                    padding: "14px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(21, 24, 23, 0.15)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <Zap size={18} color="#C9F36A" />
                    <span style={{ fontSize: "10px", color: "#C9F36A", fontWeight: 700 }}>FIND FAST</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>Locate 150kW+ Hub</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>In {selectedCity} area</div>
                </button>

                <button
                  onClick={() => setIsPreconditioning(!isPreconditioning)}
                  style={{
                    background: "#ffffff",
                    color: "#151817",
                    borderRadius: "16px",
                    border: "1px solid #E2E5DF",
                    padding: "14px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <Thermometer size={18} color={isPreconditioning ? "#059669" : "#64748b"} />
                    <span style={{ fontSize: "10px", color: isPreconditioning ? "#059669" : "#64748b", fontWeight: 700 }}>
                      {isPreconditioning ? "ACTIVE" : "STANDBY"}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>Battery Conditioning</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    {isPreconditioning ? "Target 28°C in progress" : "Pre-heat for DC Fast"}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 3: TRIP PLANNER & ROUTE ENERGY FORENSICS
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "trips" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 88px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                  ENERGY FORENSICS
                </div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#151817", margin: "1px 0 0" }}>
                  Route Energy Planner
                </h1>
              </div>

              {/* Destination Selector */}
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
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Select Corridor Destination ({selectedCity})
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {cityTripDestinations.map((d, idx) => (
                    <div
                      key={d.name}
                      onClick={() => setTripDestIndex(idx)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "12px",
                        border: tripDestIndex === idx ? "1.5px solid #151817" : "1px solid #E2E8F0",
                        background: tripDestIndex === idx ? "#F8FAFC" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#151817" }}>{d.name}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          +{d.elevationGainM}m elevation climb
                        </div>
                      </div>
                      <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#059669" }}>
                        {d.distanceKm} km
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Energy Feasibility Outcome Box */}
              <div
                style={{
                  background: tripNeedsChargeStop ? "#FFFBEB" : "#F0FDF4",
                  borderRadius: "20px",
                  border: tripNeedsChargeStop ? "1px solid #FDE68A" : "1px solid #BBF7D0",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {tripNeedsChargeStop ? (
                    <AlertCircle size={18} color="#D97706" />
                  ) : (
                    <CheckCircle2 size={18} color="#059669" />
                  )}
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: tripNeedsChargeStop ? "#92400E" : "#166534", margin: 0 }}>
                    {tripNeedsChargeStop
                      ? "Charging Stop Required along Route"
                      : "Route Feasible without Intermediate Stop"}
                  </h3>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "10px 12px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    fontSize: "11.5px",
                  }}
                >
                  <div>
                    <div style={{ color: "#64748b", fontSize: "10.5px" }}>Energy Required</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#151817" }}>
                      {tripRequiredKwh} kWh
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "#64748b", fontSize: "10.5px" }}>Available in Pack</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#151817" }}>
                      {tripAvailableKwh} kWh
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "#64748b", fontSize: "10.5px" }}>Arrival SoC</div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: tripNeedsChargeStop ? "#D97706" : "#059669",
                      }}
                    >
                      ~{tripArrivalPct}%
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "11.5px", color: tripNeedsChargeStop ? "#92400E" : "#166534" }}>
                  {tripNeedsChargeStop
                    ? `Projected arrival buffer is under 15%. Recommend a 15-minute quick charge at ${filteredStations[0]?.name || "Corridor Superhub"}.`
                    : `Calculated with 5% weather/elevation margin. You will arrive with approximately ${tripArrivalPct}% battery remaining.`}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (filteredStations[0]) startNavigation(filteredStations[0]);
                }}
                style={{
                  background: "#151817",
                  color: "#C9F36A",
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
                  boxShadow: "0 4px 14px rgba(21, 24, 23, 0.15)",
                }}
              >
                <Navigation size={15} />
                <span>Navigate Corridor Route</span>
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 4: CHARGING SESSION CONTROLLER
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "charging" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 88px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                  SESSION MANAGER
                </div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#151817", margin: "1px 0 0" }}>
                  {isCharging ? "Charging Session Active" : "Charging Standby"}
                </h1>
              </div>

              {/* Progress Wheel Display */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  border: "1px solid #E2E5DF",
                  padding: "24px 20px",
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
                    <circle cx="80" cy="80" r="66" fill="none" stroke="#EBECE8" strokeWidth="11" />
                    <circle
                      cx="80"
                      cy="80"
                      r="66"
                      fill="none"
                      stroke={isCharging ? "#10b981" : "#151817"}
                      strokeWidth="11"
                      strokeDasharray={2 * Math.PI * 66}
                      strokeDashoffset={2 * Math.PI * 66 * (1 - currentBatteryPct / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
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
                    <span style={{ fontSize: "36px", fontWeight: 800, color: "#151817", letterSpacing: "-0.03em" }}>
                      {currentBatteryPct}%
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: isCharging ? "#059669" : "#64748b" }}>
                      {isCharging ? `${chargeCurrentKw} kW Active` : "Standby / Ready"}
                    </span>
                  </div>
                </div>

                {/* Live Session Telemetry Grid */}
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    borderTop: "1px solid #EBECE8",
                    paddingTop: "12px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Energy Delivered</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: "#151817" }}>
                      {chargeKwhDelivered} kWh
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Charging Rate</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: isCharging ? "#059669" : "#151817" }}>
                      {isCharging ? `${chargeCurrentKw} kW` : "0 kW"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Session Cost</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: "#151817" }}>
                      ${chargeCost.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Time to Limit ({chargeTargetLimit}%)</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: "#151817" }}>
                      {isCharging
                        ? `${Math.max(1, Math.round(((chargeTargetLimit - currentBatteryPct) * activeVehicle.usableKwh / 100) / (chargeCurrentKw / 60)))} mins`
                        : "—"}
                    </div>
                  </div>
                </div>

                {/* Target Charge Limit Slider */}
                <div style={{ width: "100%", background: "#F8FAFC", borderRadius: "12px", padding: "10px 12px", border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "4px" }}>
                    <span style={{ color: "#64748b" }}>Target Charge Limit:</span>
                    <span style={{ fontWeight: 700, color: "#151817" }}>{chargeTargetLimit}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={chargeTargetLimit}
                    onChange={(e) => setChargeTargetLimit(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#059669", cursor: "pointer" }}
                  />
                  <div style={{ fontSize: "10.5px", color: "#059669", marginTop: "2px", fontWeight: 600 }}>
                    80% limit recommended for daily battery cathode preservation.
                  </div>
                </div>

                {/* Session Start / Stop Button */}
                <button
                  onClick={() => {
                    if (isCharging) stopChargingSession();
                    else startChargingSession();
                  }}
                  style={{
                    width: "100%",
                    background: isCharging ? "#FEE2E2" : "#151817",
                    color: isCharging ? "#991B1B" : "#C9F36A",
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
                  <span>{isCharging ? "Stop Charging Session" : `Start ${activeVehicle.maxDcSpeedKw}kW Fast Charge`}</span>
                </button>
              </div>

              {/* Station Connected Status */}
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
                  <div style={{ position: "relative", width: "32px", height: "32px" }}>
                    <Image src="/images/plug-ccs2.png" alt="CCS2" fill style={{ objectFit: "contain" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#151817" }}>
                      {chargeStation ? chargeStation.name : `${selectedCity} Supercharger`}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {activeVehicle.plugType} · 800V Architecture Handshake
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "3px 8px", borderRadius: "99px" }}>
                  READY
                </span>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 5: GARAGE & VEHICLE FLEET MANAGEMENT
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "garage" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 88px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                  VEHICLE FLEET
                </div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#151817", margin: "1px 0 0" }}>
                  Driver Garage
                </h1>
              </div>

              {/* Car Selection Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {GARAGE_VEHICLES.map((v) => {
                  const isCurrent = v.id === activeVehicleId;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setActiveVehicleId(v.id)}
                      style={{
                        background: "#ffffff",
                        borderRadius: "20px",
                        border: isCurrent ? "2px solid #151817" : "1px solid #E2E5DF",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        cursor: "pointer",
                        boxShadow: isCurrent ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "#151817" }}>
                            {v.make} {v.model}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {v.year} · {v.batteryKwh} kWh Pack · {v.maxDcSpeedKw} kW Max DC
                          </div>
                        </div>

                        {isCurrent && (
                          <span style={{ fontSize: "10.5px", fontWeight: 700, background: "#151817", color: "#C9F36A", padding: "3px 8px", borderRadius: "999px" }}>
                            ACTIVE CAR
                          </span>
                        )}
                      </div>

                      <div style={{ position: "relative", width: "100%", height: "90px", margin: "-2px 0" }}>
                        <Image src={v.image} alt={v.model} fill sizes="340px" style={{ objectFit: "contain" }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", borderTop: "1px solid #F1F5F9", paddingTop: "8px" }}>
                        <span>WLTP Range: <strong>{v.wltpRangeKm} km</strong></span>
                        <span>Plug: <strong>{v.plugType}</strong></span>
                        <span>SOH: <strong style={{ color: "#059669" }}>{v.sohPct}%</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Vehicle Hardware Forensics Card */}
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
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Active Vehicle Specifications
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11.5px" }}>
                  <div style={{ background: "#F8FAFC", padding: "8px 10px", borderRadius: "10px" }}>
                    <div style={{ color: "#64748b", fontSize: "10.5px" }}>VIN Number</div>
                    <div style={{ fontWeight: 600, color: "#151817", fontFamily: "monospace", fontSize: "11px" }}>{activeVehicle.vin}</div>
                  </div>
                  <div style={{ background: "#F8FAFC", padding: "8px 10px", borderRadius: "10px" }}>
                    <div style={{ color: "#64748b", fontSize: "10.5px" }}>Battery Health</div>
                    <div style={{ fontWeight: 700, color: "#059669" }}>{activeVehicle.sohPct}% (Grade A+)</div>
                  </div>
                  <div style={{ background: "#F8FAFC", padding: "8px 10px", borderRadius: "10px" }}>
                    <div style={{ color: "#64748b", fontSize: "10.5px" }}>Usable Capacity</div>
                    <div style={{ fontWeight: 600, color: "#151817" }}>{activeVehicle.usableKwh} kWh</div>
                  </div>
                  <div style={{ background: "#F8FAFC", padding: "8px 10px", borderRadius: "10px" }}>
                    <div style={{ color: "#64748b", fontSize: "10.5px" }}>Avg Efficiency</div>
                    <div style={{ fontWeight: 600, color: "#151817" }}>{activeVehicle.efficiencyKwh100km} kWh/100km</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── PERSISTENT BOTTOM NAVIGATION BAR (5 TABS) ─────────────── */}
        <nav
          style={{
            height: "68px",
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            padding: "0 6px 4px",
            zIndex: 950,
          }}
        >
          {/* Tab 1: Explore Map */}
          <button
            onClick={() => setActiveTab("explore")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "explore" ? "#151817" : "#86868b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <MapPin size={19} strokeWidth={activeTab === "explore" ? 2.5 : 1.8} color={activeTab === "explore" ? "#151817" : "#86868b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "explore" ? 700 : 500 }}>Map</span>
          </button>

          {/* Tab 2: Dashboard */}
          <button
            onClick={() => setActiveTab("dashboard")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "dashboard" ? "#151817" : "#86868b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <Compass size={19} strokeWidth={activeTab === "dashboard" ? 2.5 : 1.8} color={activeTab === "dashboard" ? "#151817" : "#86868b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "dashboard" ? 700 : 500 }}>Vehicle</span>
          </button>

          {/* Tab 3: Trip Planner */}
          <button
            onClick={() => setActiveTab("trips")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "trips" ? "#151817" : "#86868b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <Navigation size={19} strokeWidth={activeTab === "trips" ? 2.5 : 1.8} color={activeTab === "trips" ? "#151817" : "#86868b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "trips" ? 700 : 500 }}>Planner</span>
          </button>

          {/* Tab 4: Charging Session */}
          <button
            onClick={() => setActiveTab("charging")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "charging" ? "#151817" : "#86868b",
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
            <Zap size={19} strokeWidth={activeTab === "charging" ? 2.5 : 1.8} color={activeTab === "charging" ? "#059669" : "#86868b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "charging" ? 700 : 500 }}>Charge</span>
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
              color: activeTab === "garage" ? "#151817" : "#86868b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <Car size={19} strokeWidth={activeTab === "garage" ? 2.5 : 1.8} color={activeTab === "garage" ? "#151817" : "#86868b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "garage" ? 700 : 500 }}>Garage</span>
          </button>
        </nav>
      </div>

      {/* ── CHARGE SESSION RECEIPT MODAL ───────────────────────────── */}
      {showReceiptModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowReceiptModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "24px",
              maxWidth: "360px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={18} color="#166534" />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Charging Session Summary</h3>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Completed at {chargeStation?.name || "EV Verse Fast Hub"}</div>
              </div>
            </div>

            <div style={{ background: "#F8FAFC", borderRadius: "14px", padding: "12px", border: "1px solid #E2E8F0", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Final Battery Level:</span>
                <span style={{ fontWeight: 700, color: "#059669" }}>{currentBatteryPct}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Energy Transferred:</span>
                <span style={{ fontWeight: 700 }}>{chargeKwhDelivered} kWh</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Session Duration:</span>
                <span style={{ fontWeight: 700 }}>{Math.floor(chargeElapsedSeconds / 60)}m {chargeElapsedSeconds % 60}s</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E2E8F0", paddingTop: "6px" }}>
                <span style={{ fontWeight: 700 }}>Total Billed Cost:</span>
                <span style={{ fontWeight: 800, color: "#151817" }}>${chargeCost.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowReceiptModal(false)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "#151817",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
