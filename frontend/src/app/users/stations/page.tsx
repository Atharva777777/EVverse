"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useRef, useCallback } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useLiveData } from "@/hooks/useLiveData";
import { CountryCitySelector } from "@/components/CountryCitySelector";
import type { ChargingMapHandle } from "@/components/ChargingMap";
import type { LiveStation } from "@/types/api";

const ChargingMap = dynamic(
  () => import("@/components/ChargingMap"),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: "100%", height: "100%", background: "#dde4ed" }} className="skeleton" />
    ),
  }
);

export default function EVUsersDashboard() {
  const mapRef = useRef<ChargingMapHandle>(null);
  
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [selectedStation, setSelectedStation] = useState<LiveStation | null>(null);

  const {
    data: liveData,
    loading,
    error,
    isLive,
    stationCount,
  } = useLiveData(selectedCity);

  const handleCountrySelect = useCallback((country: string) => {
    setSelectedCountry(country);
  }, []);

  const handleCitySelect = useCallback(
    (city: string, country: string, lat: number, lng: number) => {
      setSelectedCity(city);
      setSelectedCountry(country);
      setSelectedStation(null);
      mapRef.current?.setUserLocation(lat, lng);
    },
    []
  );

  const handleStationClick = useCallback((station: LiveStation) => {
    setSelectedStation(station);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-canvas)" }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="glass"
        style={{ position: "sticky", top: 0, zIndex: 50, height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/users" style={{ textDecoration: "none", color: "var(--color-ink-3)", fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
            ← Back
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <BrandLogo suffix="Users" />
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Data source status badge */}
          {loading && (
            <div style={{ fontFamily: "Times New Roman, serif", fontSize: "12px", color: "var(--color-ink-4)", padding: "6px 12px" }}>
              Loading stations…
            </div>
          )}
          {!loading && liveData && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: isLive
                  ? "1px solid rgba(16, 185, 129, 0.4)"
                  : "1px solid var(--color-border)",
                background: isLive
                  ? "rgba(16, 185, 129, 0.08)"
                  : "rgba(243, 244, 246, 0.7)",
                color: isLive ? "#047857" : "var(--color-ink-3)",
                fontFamily: "Times New Roman, serif",
                fontSize: "12px",
                letterSpacing: "0.02em",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: isLive ? "#10b981" : "#9ca3af",
                  display: "inline-block",
                }}
              />
              <span style={{ fontWeight: 700, textTransform: "uppercase" as const }}>
                {isLive ? "LIVE" : "BASELINE"}
              </span>
              <span style={{ color: isLive ? "rgba(4,120,87,0.7)" : "var(--color-ink-4)", fontSize: "11px" }}>
                {stationCount} stations
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ── BACKEND ERROR BANNER ────────────────────────────── */}
      {error && !loading && (
        <div
          style={{
            background: "rgba(243, 244, 246, 0.9)",
            borderBottom: "1px solid var(--color-border)",
            padding: "10px 32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#9ca3af", flexShrink: 0 }} />
          <p style={{ fontFamily: "Times New Roman, serif", fontSize: "13px", color: "var(--color-ink-3)", margin: 0 }}>
            Live station data is currently unavailable. Showing baseline dataset.
            {" "}
            <span style={{ color: "var(--color-ink-4)", fontSize: "12px" }}>Backend: {error}</span>
          </p>
        </div>
      )}

      {/* ── MAP & SIDEBAR ──────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "row", flexWrap: "wrap", position: "relative" }}>
        
        {/* SIDEBAR */}
        <div style={{ flex: "1 1 350px", maxWidth: "420px", background: "white", borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column", zIndex: 10, boxShadow: "4px 0 24px rgba(10,22,40,0.02)" }}>
          
          <div style={{ padding: "24px", borderBottom: "1px solid var(--color-border-subtle)" }}>
            <h1 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-ink)", marginBottom: "8px", letterSpacing: "-0.01em" }}>
              Station Discovery
            </h1>
            <p style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-3)", marginBottom: "24px", lineHeight: 1.5 }}>
              Find charging stations across the global network. View operational status, supported connectors, and location details.
            </p>

            <div style={{ fontFamily: "Times New Roman, serif", fontSize: "12px", color: "var(--color-ink-4)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Search Region
            </div>
            <CountryCitySelector
              selectedCountry={selectedCountry}
              selectedCity={selectedCity}
              onCountrySelect={handleCountrySelect}
              onCitySelect={handleCitySelect}
            />
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {!selectedStation ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--color-ink-4)", textAlign: "center", gap: "12px", paddingTop: "40px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <div style={{ fontFamily: "Times New Roman, serif", fontSize: "15px" }}>
                  Select a station on the map
                </div>
                <div style={{ fontFamily: "Times New Roman, serif", fontSize: "13px", color: "var(--color-ink-4)", maxWidth: "240px", lineHeight: 1.5 }}>
                  {loading ? "Loading station data…" : liveData ? `${stationCount} stations in ${selectedCity}` : "Station data unavailable for this region"}
                </div>
              </div>
            ) : (
              <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 8px", borderRadius: "4px", background: selectedStation.is_operational ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)", color: selectedStation.is_operational ? "#047857" : "#b91c1c", fontWeight: 700 }}>
                      {selectedStation.status}
                    </span>
                    <span style={{ fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 8px", borderRadius: "4px", background: "var(--color-canvas)", color: "var(--color-ink-3)", border: "1px solid var(--color-border-subtle)" }}>
                      {selectedStation.source === "open_charge_map" ? "Open Charge Map" : "Baseline Data"}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "22px", color: "var(--color-ink)", marginBottom: "8px", lineHeight: 1.2 }}>
                    {selectedStation.name}
                  </h2>
                  <p style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-3)", margin: 0, lineHeight: 1.5 }}>
                    {selectedStation.address || "No address provided."}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--color-border-subtle)", paddingTop: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <span style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-4)" }}>Operator</span>
                    <span style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink)", fontWeight: 600 }}>{selectedStation.operator || "Independent"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <span style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-4)" }}>Total Bays</span>
                    <span style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink)", fontWeight: 600 }}>{selectedStation.bays} bays</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <span style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-4)" }}>Power Capacity</span>
                    <span style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink)", fontWeight: 600 }}>{selectedStation.power_kw ? `${selectedStation.power_kw} kW` : "Standard AC/DC"}</span>
                  </div>
                  {selectedStation.connector_types && selectedStation.connector_types.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "12px", borderBottom: "1px solid var(--color-border-subtle)" }}>
                      <span style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-4)" }}>Plugs</span>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        {selectedStation.connector_types.map((plug, i) => (
                          <span key={i} style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink)", fontWeight: 600 }}>{plug}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedStation.usage_cost && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "12px" }}>
                      <span style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-4)" }}>Usage Cost</span>
                      <span style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink)", textAlign: "right", maxWidth: "60%" }}>{selectedStation.usage_cost}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "auto", padding: "16px", background: "var(--color-canvas)", borderRadius: "8px", border: "1px solid var(--color-border-subtle)" }}>
                  <div style={{ fontFamily: "Times New Roman, serif", fontSize: "12px", color: "var(--color-ink-4)", marginBottom: "4px" }}>
                    Source Reliability
                  </div>
                  <p style={{ fontFamily: "Times New Roman, serif", fontSize: "12px", color: "var(--color-ink-3)", margin: 0, lineHeight: 1.5 }}>
                    {selectedStation.source === "open_charge_map" 
                      ? "This data is aggregated from Open Charge Map (OCM) and may not reflect real-time live availability."
                      : "This is baseline dataset information. Live telemetry is currently unavailable for this region."
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MAP */}
        <div style={{ flex: "1 1 400px", minWidth: 0, position: "relative", zIndex: 0, minHeight: "400px" }}>
          <ChargingMap
            ref={mapRef}
            liveStations={liveData?.stations}
            onStationClick={handleStationClick}
            selectedStationId={selectedStation?.station_id}
          />
        </div>
      </div>
    </div>
  );
}
