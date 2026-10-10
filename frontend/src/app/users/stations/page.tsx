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
  const [savedStations, setSavedStations] = useState<Set<number>>(new Set());

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

  // Simulated live charging tick
  useEffect(() => {
    if (isCharging) {
      chargeIntervalRef.current = setInterval(() => {
        setChargeBattery((b) => (b < 100 ? b + 1 : 100));
        setEnergyDelivered((e) => +(e + 0.35).toFixed(1));
        setChargeCost((c) => +(c + 6.3).toFixed(1));
      }, 2500);
    } else {
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    }
    return () => {
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    };
  }, [isCharging]);

  const toggleFavorite = (id: number) => {
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
            zIndex: 40,
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
              TAB 1: HOME SCREEN
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "home" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 88px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Header with City Selector */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6e6e73" }}>
                    EV VERSE DRIVER
                  </div>
                  <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#151817", margin: "2px 0 0", letterSpacing: "-0.02em" }}>
                    Welcome back
                  </h1>
                </div>

                {/* City Picker */}
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    border: "1px solid #E2E5DF",
                    background: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#151817",
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

              {/* Connected Vehicle Summary Card */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  border: "1px solid #E2E5DF",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#86868b" }}>
                      Connected Vehicle
                    </span>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#151817", margin: "2px 0 0" }}>
                      {activeVehicle.make} {activeVehicle.model}
                    </h2>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "#EDF8DE",
                      color: "#3F6212",
                      padding: "3px 9px",
                      borderRadius: "999px",
                      border: "1px solid #D9F1AA",
                    }}
                  >
                    SYNCED
                  </span>
                </div>

                {/* Realistic Car PNG */}
                <div style={{ position: "relative", width: "100%", height: "110px", margin: "-6px 0" }}>
                  <Image
                    src={activeVehicle.image}
                    alt={activeVehicle.model}
                    fill
                    sizes="360px"
                    style={{ objectFit: "contain" }}
                  />
                </div>

                {/* Battery & Range Stats Bar */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                    background: "#F7F8F6",
                    borderRadius: "16px",
                    padding: "12px",
                    border: "1px solid #EBECE8",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "#86868b", fontWeight: 500 }}>State of Charge</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#151817", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ color: "#10b981" }}>⚡</span>
                      {isCharging ? `${chargeBattery}%` : `${activeVehicle.currentBatteryPct}%`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#86868b", fontWeight: 500 }}>Est. Range</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#151817" }}>
                      {activeVehicle.currentRangeKm} km
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#86868b", fontWeight: 500 }}>Max DC Rate</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#151817" }}>
                      {activeVehicle.maxDcSpeedKw} kW
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions (Volt Lime Highlights) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <button
                  onClick={() => {
                    setFilterType("ultra");
                    setActiveTab("explore");
                  }}
                  style={{
                    background: "#151817",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "16px",
                    padding: "14px 10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(21, 24, 23, 0.15)",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>⚡</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#C9F36A" }}>150kW+ Fast</span>
                </button>

                <button
                  onClick={() => setActiveTab("journeys")}
                  style={{
                    background: "#ffffff",
                    color: "#151817",
                    border: "1px solid #E2E5DF",
                    borderRadius: "16px",
                    padding: "14px 10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <Navigation size={18} style={{ color: "#151817" }} />
                  <span style={{ fontSize: "11px", fontWeight: 600 }}>Plan Route</span>
                </button>

                <button
                  onClick={() => {
                    setIsCharging(true);
                    setActiveTab("charging");
                  }}
                  style={{
                    background: "#ffffff",
                    color: "#151817",
                    border: "1px solid #E2E5DF",
                    borderRadius: "16px",
                    padding: "14px 10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <BatteryCharging size={18} style={{ color: "#047857" }} />
                  <span style={{ fontSize: "11px", fontWeight: 600 }}>Charge Now</span>
                </button>
              </div>

              {/* Nearby Stations Preview */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#151817", margin: 0 }}>
                    Nearby Stations in {selectedCity}
                  </h3>
                  <button
                    onClick={() => setActiveTab("explore")}
                    style={{ background: "none", border: "none", color: "#047857", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    View All ({stationCount}) →
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredStations.slice(0, 3).map((st) => (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedStation(st);
                        setMapCenter([st.latitude, st.longitude]);
                        setIsStationDetailOpen(true);
                        setActiveTab("explore");
                      }}
                      style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        border: "1px solid #E2E5DF",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "12px",
                            background: (st.power_kw ?? 0) >= 100 ? "#151817" : "#F0F2EE",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: (st.power_kw ?? 0) >= 100 ? "#C9F36A" : "#151817",
                            fontWeight: 700,
                            fontSize: "12px",
                          }}
                        >
                          ⚡
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#151817" }}>{st.name}</div>
                          <div style={{ fontSize: "12px", color: "#86868b" }}>
                            {st.distanceKm ? `${st.distanceKm.toFixed(1)} km away` : st.operator || "Public"} · {st.power_kw ? `${st.power_kw} kW` : "Standard"}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} color="#86868b" />
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
                  zIndex: 30,
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
                    zIndex: 30,
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
                    zIndex: 35,
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
                      onClick={() => toggleFavorite(selectedStation.id)}
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
                        fill={savedStations.has(selectedStation.id) ? "#ef4444" : "none"}
                        color={savedStations.has(selectedStation.id) ? "#ef4444" : "#151817"}
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
              TAB 3: JOURNEYS (JOURNEY PLANNER)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "journeys" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 88px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#86868b" }}>
                  INTELLIGENT ROUTING
                </span>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#151817", margin: "2px 0 0" }}>
                  Journey Planner
                </h1>
              </div>

              {/* Destination Input Box */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #E2E5DF",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#0071e3" }} />
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#151817" }}>
                    Origin: Current Location ({selectedCity})
                  </div>
                </div>
                <div style={{ height: "1px", background: "#EBECE8", margin: "0 6px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
                  <input
                    type="text"
                    value={journeyDest}
                    onChange={(e) => setJourneyDest(e.target.value)}
                    placeholder="Enter destination…"
                    style={{
                      border: "none",
                      outline: "none",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#151817",
                      flex: 1,
                    }}
                  />
                </div>
              </div>

              {/* Route Forecast Card */}
              <div
                style={{
                  background: "#151817",
                  color: "#ffffff",
                  borderRadius: "24px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#C9F36A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Optimal Fast Route
                    </span>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "2px 0 0" }}>
                      148 km · 2 hr 15 min
                    </h3>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#C9F36A" }}>
                    Arrive @ 24% SOC
                  </span>
                </div>

                {/* Recommended Charging Stop Along Route */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    padding: "14px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#C9F36A",
                      color: "#151817",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "14px",
                    }}
                  >
                    ⚡
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                      Stop: Expressway Superhub
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.7)" }}>
                      18 min charge (+46 kWh) · 180 kW CCS2
                    </div>
                  </div>
                </div>

                {/* Summary numbers */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.7)", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px" }}>
                  <span>Est. Charging Cost: ₹ 414 ($5.20)</span>
                  <span>Vehicle: {activeVehicle.model}</span>
                </div>
              </div>

              {/* Start Trip CTA */}
              <button
                onClick={() => {
                  if (filteredStations[0]) startNavigation(filteredStations[0]);
                }}
                style={{
                  background: "#151817",
                  color: "#C9F36A",
                  border: "none",
                  borderRadius: "16px",
                  padding: "16px",
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
                Start Guided Navigation
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 4: CHARGING (LIVE CHARGING SESSION)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "charging" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 88px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#86868b" }}>
                    TELEMETRY & HARDWARE
                  </span>
                  <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#151817", margin: "2px 0 0" }}>
                    Charging Session
                  </h1>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: isCharging ? "#EDF8DE" : "#F0F2EE",
                    color: isCharging ? "#3F6212" : "#6e6e73",
                  }}
                >
                  {isCharging ? "ACTIVE CHARGE" : "STANDBY"}
                </span>
              </div>

              {/* Circular Battery Progress Graphic */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "28px",
                  border: "1px solid #E2E5DF",
                  padding: "32px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                  position: "relative",
                }}
              >
                {/* SVG Progress Circle */}
                <div style={{ position: "relative", width: "170px", height: "170px" }}>
                  <svg width="170" height="170" viewBox="0 0 170 170">
                    <circle cx="85" cy="85" r="70" fill="none" stroke="#EBECE8" strokeWidth="12" />
                    <circle
                      cx="85"
                      cy="85"
                      r="70"
                      fill="none"
                      stroke="#C9F36A"
                      strokeWidth="12"
                      strokeDasharray={2 * Math.PI * 70}
                      strokeDashoffset={2 * Math.PI * 70 * (1 - chargeBattery / 100)}
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
                    <span style={{ fontSize: "36px", fontWeight: 800, color: "#151817", letterSpacing: "-0.03em" }}>
                      {chargeBattery}%
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#047857" }}>
                      {isCharging ? "+120 km / 10 min" : "Ready"}
                    </span>
                  </div>
                </div>

                {/* Session Live Telemetry Counters */}
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    borderTop: "1px solid #EBECE8",
                    paddingTop: "16px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "#86868b", fontWeight: 500 }}>Delivered Energy</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: "#151817" }}>
                      {energyDelivered} kWh
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#86868b", fontWeight: 500 }}>Charging Rate</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: "#10b981" }}>
                      {isCharging ? "84.2 kW DC" : "0 kW"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#86868b", fontWeight: 500 }}>Session Cost</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: "#151817" }}>
                      ₹ {chargeCost}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#86868b", fontWeight: 500 }}>Time to 80%</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: "#151817" }}>
                      {isCharging ? "14 mins" : "—"}
                    </div>
                  </div>
                </div>

                {/* Toggle Charging Button */}
                <button
                  onClick={() => setIsCharging(!isCharging)}
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
                    transition: "all 0.2s ease",
                  }}
                >
                  <Zap size={15} />
                  {isCharging ? "Stop Charging Session" : "Start 350kW Fast Charge"}
                </button>
              </div>

              {/* Hardware Connector Profile */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #E2E5DF",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ position: "relative", width: "42px", height: "42px" }}>
                    <Image src="/images/plug-ccs2.png" alt="CCS2" fill style={{ objectFit: "contain" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#151817" }}>CCS Type 2 Combo</div>
                    <div style={{ fontSize: "12px", color: "#86868b" }}>Liquid-cooled cable · 500A peak</div>
                  </div>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#047857" }}>LOCKED</span>
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
            </div>
          )}
        </div>

        {/* ── PERSISTENT BOTTOM NAVIGATION (5 TABS) ────────────────── */}
        <nav
          style={{
            height: "72px",
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            padding: "0 8px 6px",
            zIndex: 50,
          }}
        >
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab("home")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "home" ? "#151817" : "#86868b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <Compass size={20} strokeWidth={activeTab === "home" ? 2.5 : 1.8} color={activeTab === "home" ? "#151817" : "#86868b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "home" ? 700 : 500 }}>Home</span>
          </button>

          {/* Tab 2: Explore */}
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
            <MapPin size={20} strokeWidth={activeTab === "explore" ? 2.5 : 1.8} color={activeTab === "explore" ? "#151817" : "#86868b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "explore" ? 700 : 500 }}>Explore</span>
          </button>

          {/* Tab 3: Journeys */}
          <button
            onClick={() => setActiveTab("journeys")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "journeys" ? "#151817" : "#86868b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <Navigation size={20} strokeWidth={activeTab === "journeys" ? 2.5 : 1.8} color={activeTab === "journeys" ? "#151817" : "#86868b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "journeys" ? 700 : 500 }}>Journeys</span>
          </button>

          {/* Tab 4: Charging */}
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
            <Zap size={20} strokeWidth={activeTab === "charging" ? 2.5 : 1.8} color={activeTab === "charging" ? "#10b981" : "#86868b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "charging" ? 700 : 500 }}>Charging</span>
            {isCharging && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "12px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#C9F36A",
                  boxShadow: "0 0 6px #C9F36A",
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
            <Car size={20} strokeWidth={activeTab === "garage" ? 2.5 : 1.8} color={activeTab === "garage" ? "#151817" : "#86868b"} />
            <span style={{ fontSize: "10px", fontWeight: activeTab === "garage" ? 700 : 500 }}>Garage</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
