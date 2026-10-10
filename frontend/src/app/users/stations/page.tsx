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
  SlidersHorizontal,
  Navigation,
  Car,
  Zap,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  X,
  Heart,
  Share2,
  ChevronRight,
  Maximize2,
  Minimize2,
  BatteryCharging,
  Radio,
  CheckCircle2,
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

export default function EVVerseDriverPage() {
  // Mobile app tab navigation: 'explore' | 'route' | 'garage' | 'charge'
  const [activeTab, setActiveTab] = useState<"explore" | "route" | "garage" | "charge">("explore");
  
  // Frame toggle for desktop users
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Selected city & live data
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const cityConfig = CITY_CONFIGS[selectedCity] || CITY_CONFIGS["Mumbai"];

  // Simulated User Location (center of city with slight offset)
  const [userLocation, setUserLocation] = useState<[number, number]>([
    cityConfig.lat + 0.008,
    cityConfig.lng - 0.006,
  ]);

  // Fetch real stations from backend / Open Charge Map
  const { data: liveData, loading, isLive } = useLiveData(selectedCity);

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([cityConfig.lat, cityConfig.lng]);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedStation, setSelectedStation] = useState<LiveStation | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "fast" | "available" | "ccs">("all");
  const [isSaved, setIsSaved] = useState(false);

  // Navigation mode state
  const [navStation, setNavStation] = useState<LiveStation | null>(null);
  const [navProgress, setNavProgress] = useState(0.2); // 0 to 1
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(false);

  // Charging session state
  const [isCharging, setIsCharging] = useState(false);
  const [chargeBattery, setChargeBattery] = useState(42);
  const [energyDelivered, setEnergyDelivered] = useState(16.8);
  const [chargeCost, setChargeCost] = useState(243.6);

  // Update map center when city changes
  useEffect(() => {
    const cfg = CITY_CONFIGS[selectedCity];
    if (cfg) {
      setMapCenter([cfg.lat, cfg.lng]);
      setUserLocation([cfg.lat + 0.008, cfg.lng - 0.006]);
      setSelectedStation(null);
      setNavStation(null);
    }
  }, [selectedCity]);

  // Stations with real distance from user
  const stationsWithDistance = useMemo(() => {
    if (!liveData?.stations) return [];
    return liveData.stations.map((st) => {
      const distance = haversineKm(
        userLocation[0],
        userLocation[1],
        st.latitude,
        st.longitude
      );
      return {
        ...st,
        distanceKm: distance,
        driveMinutes: Math.max(2, Math.round(distance * 3)),
      };
    });
  }, [liveData, userLocation]);

  // Filtered & sorted stations (closest first)
  const sortedStations = useMemo(() => {
    let list = [...stationsWithDistance];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.address && s.address.toLowerCase().includes(q)) ||
          (s.operator && s.operator.toLowerCase().includes(q))
      );
    }

    if (filterType === "fast") {
      list = list.filter((s) => (s.power_kw ?? 0) >= 50);
    } else if (filterType === "available") {
      list = list.filter((s) => s.is_operational);
    } else if (filterType === "ccs") {
      list = list.filter(
        (s) =>
          s.connector_types &&
          s.connector_types.some((c) => c.toLowerCase().includes("ccs"))
      );
    }

    return list.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [stationsWithDistance, searchQuery, filterType]);

  // Nearest station
  const closestStation = sortedStations[0] || null;

  // Auto-select closest station initially if none selected
  useEffect(() => {
    if (!selectedStation && closestStation) {
      setSelectedStation(closestStation);
    }
  }, [closestStation, selectedStation]);

  // Handler to locate and highlight closest station
  const handleFindClosest = () => {
    if (closestStation) {
      setSelectedStation(closestStation);
      setMapCenter([closestStation.latitude, closestStation.longitude]);
      setMapZoom(14.5);
    }
  };

  // Launch route navigation to a station
  const handleStartRoute = (st: LiveStation) => {
    setNavStation(st);
    setActiveTab("route");
    setNavProgress(0.15);
  };

  // Simulate Drive along route
  useEffect(() => {
    let interval: any = null;
    if (isSimulatingDrive) {
      interval = setInterval(() => {
        setNavProgress((prev) => {
          if (prev >= 0.98) {
            setIsSimulatingDrive(false);
            return 1;
          }
          return prev + 0.05;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isSimulatingDrive]);

  // Simulate active charging tick
  useEffect(() => {
    let interval: any = null;
    if (isCharging) {
      interval = setInterval(() => {
        setChargeBattery((b) => Math.min(100, b + 1));
        setEnergyDelivered((e) => Number((e + 0.4).toFixed(1)));
        setChargeCost((c) => Number((c + 5.8).toFixed(1)));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isCharging]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0f12",
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
      {/* ── TOP CONTROLS (DESKTOP MODE TOGGLE & EXIT) ───────── */}
      <div
        style={{
          width: "100%",
          maxWidth: isPhoneFrame ? "420px" : "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px 14px",
          color: "#9ca3af",
          fontSize: "12px",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#9ca3af",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          ← Exit to Portal
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/users/knowledge"
            style={{
              textDecoration: "none",
              color: "#C9F36A",
              background: "rgba(201, 243, 106, 0.12)",
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>📖</span>
            <span>Knowledge Hub</span>
          </Link>

          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#ffffff",
              padding: "4px 8px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
            }}
            title={isPhoneFrame ? "Switch to Fullscreen" : "Switch to Mobile Phone View"}
          >
            {isPhoneFrame ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            <span>{isPhoneFrame ? "Expand" : "Phone Frame"}</span>
          </button>
        </div>
      </div>

      {/* ── MOBILE DEVICE CONTAINER ─────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: isPhoneFrame ? "414px" : "100%",
          height: isPhoneFrame ? "852px" : "100vh",
          background: "#F7F8F6",
          borderRadius: isPhoneFrame ? "48px" : "0",
          boxShadow: isPhoneFrame
            ? "0 28px 80px rgba(0, 0, 0, 0.6), 0 0 0 12px #262a30, 0 0 0 14px rgba(255,255,255,0.1)"
            : "none",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Dynamic Island / Speaker Notch (Phone frame only) */}
        {isPhoneFrame && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "120px",
              height: "32px",
              background: "#000000",
              borderRadius: "20px",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
            }}
          >
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: "#0e1116",
                border: "1.5px solid #1a1e24",
              }}
            />
            {isCharging && (
              <span
                style={{
                  fontSize: "10px",
                  color: "#C9F36A",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                ⚡ {chargeBattery}%
              </span>
            )}
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: "#059669",
              }}
            />
          </div>
        )}

        {/* ── SCREEN 1: EXPLORE / MAP VIEW ──────────────────── */}
        {activeTab === "explore" && (
          <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
            {/* Top Floating Search & Filter Bar */}
            <div
              style={{
                position: "absolute",
                top: isPhoneFrame ? "54px" : "20px",
                left: "16px",
                right: "16px",
                zIndex: 40,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {/* Search Box */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  borderRadius: "18px",
                  padding: "6px 14px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  gap: "10px",
                }}
              >
                <Search size={18} color="#86868b" />
                <input
                  type="text"
                  placeholder="Search charging station or address…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "14px",
                    color: "#151817",
                    fontWeight: 500,
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                  >
                    <X size={15} color="#86868b" />
                  </button>
                )}
                <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }} />
                <button
                  onClick={handleFindClosest}
                  style={{
                    background: "#151817",
                    border: "none",
                    color: "#C9F36A",
                    padding: "6px 10px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="Find nearest station"
                >
                  <Navigation size={12} />
                  Nearest
                </button>
              </div>

              {/* City & Category Filter Chips */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                  scrollbarWidth: "none",
                }}
              >
                {/* City Picker Dropdown Pill */}
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{
                    background: "rgba(21, 24, 23, 0.9)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    outline: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <option value="Mumbai">🇮🇳 Mumbai</option>
                  <option value="Pune">🇮🇳 Pune</option>
                  <option value="Shenzhen">🇨🇳 Shenzhen</option>
                  <option value="San Francisco">🇺🇸 San Francisco</option>
                </select>

                <button
                  onClick={() => setFilterType("all")}
                  style={{
                    background: filterType === "all" ? "#C9F36A" : "rgba(255, 255, 255, 0.92)",
                    color: filterType === "all" ? "#151817" : "#6e6e73",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  All ({sortedStations.length})
                </button>

                <button
                  onClick={() => setFilterType("fast")}
                  style={{
                    background: filterType === "fast" ? "#C9F36A" : "rgba(255, 255, 255, 0.92)",
                    color: filterType === "fast" ? "#151817" : "#6e6e73",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  ⚡ DC Fast
                </button>

                <button
                  onClick={() => setFilterType("ccs")}
                  style={{
                    background: filterType === "ccs" ? "#C9F36A" : "rgba(255, 255, 255, 0.92)",
                    color: filterType === "ccs" ? "#151817" : "#6e6e73",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  CCS 2
                </button>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <DriverMobileMap
              center={mapCenter}
              zoom={mapZoom}
              userLocation={userLocation}
              stations={sortedStations}
              selectedStation={selectedStation}
              onStationSelect={(st) => {
                setSelectedStation(st);
                setMapCenter([st.latitude, st.longitude]);
              }}
              navigationStation={navStation}
              isNavigating={false}
              navProgress={0}
            />

            {/* Floating Nearest Station Badge Pill */}
            {closestStation && (
              <div
                onClick={handleFindClosest}
                style={{
                  position: "absolute",
                  top: isPhoneFrame ? "160px" : "120px",
                  left: "16px",
                  zIndex: 35,
                  background: "rgba(21, 24, 23, 0.88)",
                  backdropFilter: "blur(16px)",
                  color: "#ffffff",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9F36A" }} />
                <span>Closest: {closestStation.name} · {closestStation.distanceKm.toFixed(1)} km</span>
              </div>
            )}

            {/* Bottom Station Card (Matching Reference Images 1 & 3) */}
            {selectedStation && (
              <div
                style={{
                  position: "absolute",
                  bottom: "96px",
                  left: "16px",
                  right: "16px",
                  zIndex: 40,
                  background: "rgba(255, 255, 255, 0.96)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  borderRadius: "26px",
                  padding: "20px 22px",
                  boxShadow: "0 18px 48px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Station Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, paddingRight: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: "#EBFCE8",
                          color: "#15803d",
                        }}
                      >
                        {selectedStation.is_operational ? "Available" : "Busy"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#86868b" }}>
                        ★ 4.8 · {selectedStation.operator || "Independent"}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#151817",
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {selectedStation.name}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#6e6e73", margin: "2px 0 0" }}>
                      {selectedStation.address || `${selectedCity} Fast Charging Corridor`}
                    </p>
                  </div>

                  {/* Bookmark heart */}
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: "50%",
                      color: isSaved ? "#ef4444" : "#86868b",
                    }}
                  >
                    <Heart size={20} fill={isSaved ? "#ef4444" : "none"} />
                  </button>
                </div>

                {/* Connector Types Pills with visual icon */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {(selectedStation.connector_types && selectedStation.connector_types.length > 0
                    ? selectedStation.connector_types
                    : ["Type 2", "CCS 2", "GB/T"]
                  ).map((plug, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 10px",
                        borderRadius: "10px",
                        background: "#F2F4F2",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        color: "#151817",
                      }}
                    >
                      <span>🔌</span>
                      <span>{plug}</span>
                    </div>
                  ))}
                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: "10px",
                      background: "#EBFCE8",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      color: "#15803d",
                    }}
                  >
                    ⚡ {selectedStation.power_kw ? `${selectedStation.power_kw} kW` : "150 kW DC"}
                  </div>
                </div>

                {/* Distance & Let's Go Button (Matching Reference Image 1) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "10px",
                    borderTop: "1px solid rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", color: "#86868b", display: "block" }}>Estimated Reach</span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#151817" }}>
                      {selectedStation.distanceKm.toFixed(1)} km · ~{selectedStation.driveMinutes} min
                    </span>
                  </div>

                  <button
                    onClick={() => handleStartRoute(selectedStation)}
                    style={{
                      background: "#151817",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "16px",
                      padding: "12px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <span>Let&apos;s go</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SCREEN 2: ROUTE NAVIGATION (RIGHT SCREEN IN IMAGES 1 & 3) */}
        {activeTab === "route" && (
          <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
            {/* Top Route Card */}
            <div
              style={{
                position: "absolute",
                top: isPhoneFrame ? "54px" : "20px",
                left: "16px",
                right: "16px",
                zIndex: 40,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(24px)",
                borderRadius: "22px",
                padding: "16px 18px",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#6e6e73" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#9ca3af" }} />
                  <span>Your Current Location</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, color: "#151817" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                  <span>{navStation?.name || "EV Green Fast Station"}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("explore")}
                style={{
                  background: "#F2F4F2",
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
                <X size={16} color="#151817" />
              </button>
            </div>

            {/* Map showing Route Line */}
            <DriverMobileMap
              center={mapCenter}
              zoom={14}
              userLocation={userLocation}
              stations={navStation ? [navStation] : sortedStations}
              selectedStation={navStation}
              onStationSelect={() => {}}
              navigationStation={navStation}
              isNavigating={true}
              navProgress={navProgress}
            />

            {/* Bottom Route Progress Slider & Action (Matching Reference Images) */}
            <div
              style={{
                position: "absolute",
                bottom: "96px",
                left: "16px",
                right: "16px",
                zIndex: 40,
                background: "rgba(255, 255, 255, 0.96)",
                backdropFilter: "blur(24px)",
                borderRadius: "26px",
                padding: "20px 22px",
                boxShadow: "0 18px 48px rgba(0, 0, 0, 0.14)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {/* Progress track with moving car */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#151817" }}>
                <span>{((navStation?.distanceKm ?? 2.4) * (1 - navProgress)).toFixed(1)} km</span>
                <span style={{ color: "#10b981" }}>
                  {Math.max(1, Math.round((navStation?.driveMinutes ?? 6) * (1 - navProgress)))} min
                </span>
              </div>

              {/* Visual Route Bar */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "8px",
                  background: "#e5e7eb",
                  borderRadius: "999px",
                  overflow: "visible",
                }}
              >
                <div
                  style={{
                    width: `${navProgress * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #10b981 0%, #C9F36A 100%)",
                    borderRadius: "999px",
                    transition: "width 0.4s ease",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${navProgress * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: "20px",
                    height: "20px",
                    background: "#151817",
                    border: "2px solid #C9F36A",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ fontSize: "10px" }}>🏎️</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  onClick={() => setIsSimulatingDrive(!isSimulatingDrive)}
                  style={{
                    flex: 1,
                    background: isSimulatingDrive ? "#C9F36A" : "#F2F4F2",
                    color: "#151817",
                    border: "none",
                    borderRadius: "16px",
                    padding: "12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isSimulatingDrive ? "⏸ Pause Drive" : "▶ Simulate Drive"}
                </button>

                <button
                  onClick={() => {
                    setActiveTab("charge");
                    setIsCharging(true);
                  }}
                  style={{
                    flex: 1.2,
                    background: "#151817",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "16px",
                    padding: "12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span>⚡ Plug In & Charge</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SCREEN 3: GARAGE / VEHICLE (LEFT SCREEN IN IMAGES 1 & 3) */}
        {activeTab === "garage" && (
          <div
            style={{
              flex: 1,
              padding: isPhoneFrame ? "54px 20px 100px" : "32px 24px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em", color: "#151817" }}>
                  Model 3
                </h1>
                <span style={{ fontSize: "14px", color: "#86868b", fontWeight: 500 }}>
                  Tesla · Dual Motor AWD · 2024
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "#EBFCE8",
                  color: "#15803d",
                }}
              >
                Connected
              </span>
            </div>

            {/* 3D Car Perspective Image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "180px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "4px 0",
              }}
            >
              <Image
                src="/images/car-model.png"
                alt="Connected EV Model 3"
                width={360}
                height={170}
                style={{
                  objectFit: "contain",
                  filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.12))",
                }}
              />
            </div>

            {/* Battery & Range Two-Card Grid (Matching Reference Images) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {/* Card 1: Battery Energy (Volt Lime Tint) */}
              <div
                style={{
                  background: "#EBFCE8",
                  borderRadius: "22px",
                  padding: "20px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  border: "1px solid rgba(201, 243, 106, 0.4)",
                }}
              >
                <span style={{ fontSize: "12px", color: "#4b5563", fontWeight: 500 }}>
                  Battery energy
                </span>
                <div style={{ fontSize: "36px", fontWeight: 800, color: "#151817", letterSpacing: "-0.03em" }}>
                  72<span style={{ fontSize: "22px", fontWeight: 600 }}>%</span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#15803d",
                    background: "rgba(255, 255, 255, 0.7)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    width: "fit-content",
                    marginTop: "auto",
                  }}
                >
                  Fast charging ready
                </div>
              </div>

              {/* Card 2: Remaining Distance & Time (Porcelain White) */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "22px",
                  padding: "20px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
                }}
              >
                <span style={{ fontSize: "12px", color: "#86868b", fontWeight: 500 }}>
                  Remaining range
                </span>
                <div style={{ fontSize: "36px", fontWeight: 800, color: "#151817", letterSpacing: "-0.03em" }}>
                  342 <span style={{ fontSize: "18px", fontWeight: 600 }}>km</span>
                </div>
                <span style={{ fontSize: "12px", color: "#86868b", fontWeight: 500, marginTop: "auto" }}>
                  ~ 4h 15m driving
                </span>
              </div>
            </div>

            {/* Card 3: Charging Port & Compatibility */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "22px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div>
                <span style={{ fontSize: "12px", color: "#86868b", display: "block" }}>Charging Port</span>
                <h4 style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0 4px", color: "#151817" }}>
                  CCS 2 / Type 2
                </h4>
                <span style={{ fontSize: "12px", color: "#6e6e73" }}>
                  Max DC rate: 150 kW · AC 22 kW
                </span>
              </div>

              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "#F7F8F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                🔌
              </div>
            </div>

            {/* Quick Action: Find Closest Charger */}
            <button
              onClick={() => {
                setActiveTab("explore");
                handleFindClosest();
              }}
              style={{
                background: "#151817",
                color: "#ffffff",
                border: "none",
                borderRadius: "18px",
                padding: "16px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "auto",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              }}
            >
              <span>Find Closest Charger Now</span>
              <ArrowRight size={17} color="#C9F36A" />
            </button>
          </div>
        )}

        {/* ── SCREEN 4: LIVE CHARGING SESSION ───────────────── */}
        {activeTab === "charge" && (
          <div
            style={{
              flex: 1,
              padding: isPhoneFrame ? "54px 24px 100px" : "32px 24px 100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: isCharging ? "#EBFCE8" : "#F2F4F2",
                  color: isCharging ? "#15803d" : "#6e6e73",
                }}
              >
                {isCharging ? "● Ultra-Fast Charging Active" : "Session Paused"}
              </span>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "12px 0 2px", color: "#151817" }}>
                {navStation?.name || selectedStation?.name || "BKC Fast Charging Hub"}
              </h2>
              <span style={{ fontSize: "13px", color: "#86868b" }}>Bay 02 · CCS 2 DC Fast</span>
            </div>

            {/* Circular Charging Ring */}
            <div
              style={{
                position: "relative",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                background: "conic-gradient(#C9F36A 0% 78%, #e5e7eb 78% 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 40px rgba(201, 243, 106, 0.35)",
              }}
            >
              <div
                style={{
                  width: "186px",
                  height: "186px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                }}
              >
                <Zap size={26} color="#15803d" fill="#C9F36A" />
                <div style={{ fontSize: "44px", fontWeight: 800, color: "#151817", letterSpacing: "-0.03em" }}>
                  {chargeBattery}%
                </div>
                <span style={{ fontSize: "12px", color: "#86868b", fontWeight: 600 }}>
                  ~14 min to 80%
                </span>
              </div>
            </div>

            {/* Real Telemetry Stats Strip */}
            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "10px",
                background: "#ffffff",
                padding: "16px 12px",
                borderRadius: "20px",
                border: "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#86868b", display: "block" }}>Power Rate</span>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#151817" }}>120 kW</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#86868b", display: "block" }}>Delivered</span>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#151817" }}>{energyDelivered} kWh</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#86868b", display: "block" }}>Session Cost</span>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#15803d" }}>₹{chargeCost}</span>
              </div>
            </div>

            {/* Start / Stop Toggle */}
            <button
              onClick={() => setIsCharging(!isCharging)}
              style={{
                width: "100%",
                background: isCharging ? "#151817" : "#C9F36A",
                color: isCharging ? "#ffffff" : "#151817",
                border: "none",
                borderRadius: "18px",
                padding: "16px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {isCharging ? "Stop Charging & Get Receipt" : "Resume Charging"}
            </button>
          </div>
        )}

        {/* ── PERSISTENT MATTE OBSIDIAN BOTTOM NAV BAR (MATCHING IMAGES) */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 48px)",
            maxWidth: "340px",
            height: "64px",
            background: "#151817",
            borderRadius: "999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            padding: "0 12px",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
            zIndex: 60,
          }}
        >
          {/* Tab 1: Explore Map */}
          <button
            onClick={() => setActiveTab("explore")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "explore" ? "#C9F36A" : "#86868b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "color 0.2s ease",
            }}
          >
            <Compass size={20} strokeWidth={activeTab === "explore" ? 2.5 : 2} />
            <span style={{ fontSize: "10px", fontWeight: 600 }}>Explore</span>
          </button>

          {/* Tab 2: Route Navigation */}
          <button
            onClick={() => {
              if (selectedStation) setNavStation(selectedStation);
              setActiveTab("route");
            }}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "route" ? "#C9F36A" : "#86868b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "color 0.2s ease",
            }}
          >
            <Navigation size={20} strokeWidth={activeTab === "route" ? 2.5 : 2} />
            <span style={{ fontSize: "10px", fontWeight: 600 }}>Route</span>
          </button>

          {/* Tab 3: Vehicle Garage */}
          <button
            onClick={() => setActiveTab("garage")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "garage" ? "#C9F36A" : "#86868b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              transition: "color 0.2s ease",
            }}
          >
            <Car size={20} strokeWidth={activeTab === "garage" ? 2.5 : 2} />
            <span style={{ fontSize: "10px", fontWeight: 600 }}>Garage</span>
          </button>

          {/* Tab 4: Live Charge */}
          <button
            onClick={() => setActiveTab("charge")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "charge" ? "#C9F36A" : "#86868b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px",
              position: "relative",
              transition: "color 0.2s ease",
            }}
          >
            <Zap size={20} strokeWidth={activeTab === "charge" ? 2.5 : 2} />
            <span style={{ fontSize: "10px", fontWeight: 600 }}>Charge</span>
            {isCharging && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "6px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#C9F36A",
                  boxShadow: "0 0 6px #C9F36A",
                }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
