"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useRef, useCallback, useMemo } from "react";
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

  // Workspace layout states
  const [showStationsLayer, setShowStationsLayer] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConnector, setSelectedConnector] = useState("");
  const [selectedPower, setSelectedPower] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");

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
      // reset filters on city change
      setSearchQuery("");
      setSelectedConnector("");
      setSelectedPower("");
      setSelectedOperator("");
      mapRef.current?.setUserLocation(lat, lng);
    },
    []
  );

  const handleStationClick = useCallback((station: LiveStation) => {
    setSelectedStation(station);
    setRightOpen(true); // Open details panel when a station is clicked
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedConnector("");
    setSelectedPower("");
    setSelectedOperator("");
  };

  const operators = useMemo(() => {
    if (!liveData?.stations) return [];
    const ops = new Set(liveData.stations.map(s => s.operator).filter(Boolean));
    return Array.from(ops).sort() as string[];
  }, [liveData]);

  const connectors = useMemo(() => {
    if (!liveData?.stations) return [];
    const conns = new Set<string>();
    liveData.stations.forEach(s => {
       if (s.connector_types) s.connector_types.forEach(c => conns.add(c));
    });
    return Array.from(conns).sort();
  }, [liveData]);

  const filteredStations = useMemo(() => {
    if (!liveData?.stations) return [];
    return liveData.stations.filter(st => {
       if (searchQuery && !st.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
       if (selectedOperator && st.operator !== selectedOperator) return false;
       if (selectedConnector && (!st.connector_types || !st.connector_types.includes(selectedConnector))) return false;
       if (selectedPower) {
         if (selectedPower === "Level 2") {
            if (!st.power_kw || st.power_kw > 22) return false;
         } else if (selectedPower === "DC Fast") {
            if (!st.power_kw || st.power_kw <= 22 || st.power_kw > 150) return false;
         } else if (selectedPower === "Ultra Fast") {
            if (!st.power_kw || st.power_kw <= 150) return false;
         }
       }
       return true;
    });
  }, [liveData, searchQuery, selectedOperator, selectedConnector, selectedPower]);

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

      {/* ── WORKSPACE ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row relative lg:overflow-hidden">
        
        {/* LEFT PANEL: Location, Layers, Station List */}
        <div 
          className={`bg-white z-10 flex-col shadow-[4px_0_24px_rgba(10,22,40,0.02)] transition-all duration-300 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] ${leftOpen ? 'flex w-full lg:w-[360px] lg:min-w-[320px]' : 'hidden lg:flex lg:w-0 lg:min-w-0 lg:overflow-hidden lg:border-r-0'}`}
        >
          <div className="p-6 border-b border-[var(--color-border-subtle)] shrink-0 min-w-[320px] overflow-y-auto max-h-[50vh] lg:max-h-[60vh]">
            <h1 className="font-serif text-[24px] text-[var(--color-ink)] mb-2 tracking-tight">
              Station Discovery
            </h1>
            <p className="font-serif text-[14px] text-[var(--color-ink-3)] mb-6 leading-relaxed">
              Find charging stations across the global network. View operational status, supported connectors, and location details.
            </p>

            <div className="font-serif text-[12px] text-[var(--color-ink-4)] mb-2 uppercase tracking-wider">
              Search Region
            </div>
            <CountryCitySelector
              selectedCountry={selectedCountry}
              selectedCity={selectedCity}
              onCountrySelect={handleCountrySelect}
              onCitySelect={handleCitySelect}
            />

            {/* FILTERS */}
            <div className="mt-6 pt-5 border-t border-[var(--color-border-subtle)]">
              <div className="flex justify-between items-center mb-3">
                <div className="font-serif text-[12px] text-[var(--color-ink-4)] uppercase tracking-wider">
                  Filters
                </div>
                {(searchQuery || selectedConnector || selectedPower || selectedOperator) && (
                  <button onClick={clearFilters} className="text-[11px] text-[var(--color-navy-600)] hover:text-[var(--color-navy-900)] font-serif cursor-pointer">
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Search station name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md font-serif text-[14px] text-[var(--color-ink)] placeholder-[var(--color-ink-4)] outline-none focus:border-[var(--color-navy-500)] focus:ring-1 focus:ring-[var(--color-navy-500)]"
                />
                
                <select 
                  value={selectedConnector} 
                  onChange={(e) => setSelectedConnector(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md font-serif text-[14px] text-[var(--color-ink)] bg-white outline-none focus:border-[var(--color-navy-500)]"
                >
                  <option value="">All Connectors</option>
                  {connectors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select 
                  value={selectedPower} 
                  onChange={(e) => setSelectedPower(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md font-serif text-[14px] text-[var(--color-ink)] bg-white outline-none focus:border-[var(--color-navy-500)]"
                >
                  <option value="">All Power Levels</option>
                  <option value="Level 2">Level 2 (≤22kW)</option>
                  <option value="DC Fast">DC Fast (22kW - 150kW)</option>
                  <option value="Ultra Fast">Ultra Fast (&gt;150kW)</option>
                </select>

                <select 
                  value={selectedOperator} 
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md font-serif text-[14px] text-[var(--color-ink)] bg-white outline-none focus:border-[var(--color-navy-500)]"
                >
                  <option value="">All Operators</option>
                  {operators.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--color-border-subtle)]">
              <div className="font-serif text-[12px] text-[var(--color-ink-4)] mb-3 uppercase tracking-wider">
                Map Layers
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-serif text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">
                <input 
                  type="checkbox" 
                  checked={showStationsLayer} 
                  onChange={(e) => setShowStationsLayer(e.target.checked)} 
                  className="w-4 h-4 cursor-pointer accent-[var(--color-navy-900)]"
                />
                Charging Stations
              </label>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-w-[320px] bg-[var(--color-fog)]">
            <div className="px-6 py-3 border-b border-[var(--color-border-subtle)] bg-white flex justify-between items-center sticky top-0 z-10">
              <span className="font-serif text-[13px] text-[var(--color-ink-3)]">
                {selectedCity}
              </span>
              <span className="font-serif text-[13px] font-semibold text-[var(--color-navy-700)]">
                {filteredStations.length} Results
              </span>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-[var(--color-ink-4)] font-serif text-[14px]">
                Loading stations…
              </div>
            ) : (!liveData?.stations || liveData.stations.length === 0) ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-[var(--color-border-subtle)] mb-4 text-[var(--color-ink-4)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 21v-8a2 2 0 0 0-2-2H4" />
                    <path d="M14 21v-8a2 2 0 0 1 2-2h4" />
                    <circle cx="12" cy="7" r="3" />
                  </svg>
                </div>
                <div className="font-serif text-[16px] text-[var(--color-ink)] mb-1">No stations found</div>
                <div className="font-serif text-[13px] text-[var(--color-ink-3)] max-w-[250px] leading-relaxed">
                  There are no documented charging stations for this region in the current dataset.
                </div>
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-[var(--color-border-subtle)] mb-4 text-[var(--color-ink-4)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <div className="font-serif text-[16px] text-[var(--color-ink)] mb-1">No matches found</div>
                <div className="font-serif text-[13px] text-[var(--color-ink-3)] max-w-[250px] leading-relaxed mb-4">
                  Adjust your filters to see more stations in {selectedCity}.
                </div>
                <button onClick={clearFilters} className="px-4 py-2 bg-white border border-[var(--color-border)] rounded-md font-serif text-[13px] text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-colors cursor-pointer">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col bg-white">
                {filteredStations.map((station) => {
                  const isSelected = selectedStation?.station_id === station.station_id;
                  return (
                    <div 
                      key={station.station_id}
                      onClick={() => handleStationClick(station)}
                      className="p-4 px-6 border-b border-[var(--color-border-subtle)] cursor-pointer transition-colors"
                      style={{ 
                        background: isSelected ? "rgba(10,22,40,0.03)" : "transparent",
                        borderLeft: isSelected ? "3px solid var(--color-navy-800)" : "3px solid transparent",
                      }}
                    >
                      <div className={`font-serif text-[15px] mb-1 ${isSelected ? 'font-semibold text-[var(--color-ink)]' : 'font-normal text-[var(--color-ink-2)]'}`}>
                        {station.name}
                      </div>
                      <div className="font-serif text-[13px] text-[var(--color-ink-3)] mb-3 truncate">
                        {station.address || "No address provided."}
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-[4px] font-bold"
                          style={{
                            background: station.is_operational ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)",
                            color: station.is_operational ? "#047857" : "#b91c1c",
                          }}
                        >
                          {station.status}
                        </span>
                        <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-[4px] font-semibold bg-[var(--color-canvas)] text-[var(--color-ink-3)] border border-[var(--color-border-subtle)]">
                          {station.power_kw ? `${station.power_kw} kW` : "Standard"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* LEFT TOGGLE */}
        <div 
          className="hidden lg:block absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-300"
          style={{ left: leftOpen ? "360px" : "0" }}
        >
          <button 
            onClick={() => setLeftOpen(!leftOpen)}
            className="bg-white border border-[var(--color-border)] border-l-0 py-4 px-2 rounded-r-lg cursor-pointer shadow-[4px_0_12px_rgba(10,22,40,0.05)] text-[var(--color-ink-3)] flex items-center justify-center hover:text-[var(--color-ink)] transition-colors"
            title={leftOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={leftOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
            </svg>
          </button>
        </div>

        {/* CENTER: MAP */}
        <div className="flex-1 relative z-0 h-[400px] lg:h-auto min-h-[400px]">
          <ChargingMap
            ref={mapRef}
            liveStations={filteredStations}
            onStationClick={handleStationClick}
            selectedStationId={selectedStation?.station_id}
            showLiveStationsOverride={showStationsLayer}
            hideInternalLayerControls={true}
          />
        </div>

        {/* RIGHT TOGGLE */}
        {selectedStation && (
          <div 
            className="hidden lg:block absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-300"
            style={{ right: rightOpen ? "360px" : "0" }}
          >
            <button 
              onClick={() => setRightOpen(!rightOpen)}
              className="bg-white border border-[var(--color-border)] border-r-0 py-4 px-2 rounded-l-lg cursor-pointer shadow-[-4px_0_12px_rgba(10,22,40,0.05)] text-[var(--color-ink-3)] flex items-center justify-center hover:text-[var(--color-ink)] transition-colors"
              title={rightOpen ? "Collapse details" : "Expand details"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={rightOpen ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
              </svg>
            </button>
          </div>
        )}

        {/* RIGHT PANEL: Station Details */}
        <div 
          className={`bg-white z-10 flex-col shadow-[-4px_0_24px_rgba(10,22,40,0.02)] transition-all duration-300 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] ${rightOpen && selectedStation ? 'flex w-full lg:w-[360px] lg:min-w-[320px]' : 'hidden lg:flex lg:w-0 lg:min-w-0 lg:overflow-hidden lg:border-l-0'}`}
        >
          <div className="flex-1 overflow-y-auto p-6 min-w-[320px] flex flex-col">
            {selectedStation ? (
              <div className="anim-fade-in flex flex-col gap-6 flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span 
                      className="text-[11px] tracking-wider uppercase px-2 py-1 rounded-[4px] font-bold"
                      style={{
                        background: selectedStation.is_operational ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)",
                        color: selectedStation.is_operational ? "#047857" : "#b91c1c",
                      }}
                    >
                      {selectedStation.status}
                    </span>
                    <span className="text-[11px] tracking-wider uppercase px-2 py-1 rounded-[4px] bg-[var(--color-canvas)] text-[var(--color-ink-3)] border border-[var(--color-border-subtle)]">
                      {selectedStation.source === "open_charge_map" ? "Open Charge Map" : "Baseline Data"}
                    </span>
                  </div>
                  <h2 className="font-serif text-[22px] text-[var(--color-ink)] mb-2 leading-tight">
                    {selectedStation.name}
                  </h2>
                  <p className="font-serif text-[14px] text-[var(--color-ink-3)] m-0 leading-relaxed">
                    {selectedStation.address || "No address provided."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-[var(--color-border-subtle)] pt-6">
                  <div className="flex justify-between items-center pb-3 border-b border-[var(--color-border-subtle)]">
                    <span className="font-serif text-[14px] text-[var(--color-ink-4)]">Operator</span>
                    <span className="font-serif text-[15px] text-[var(--color-ink)] font-semibold">{selectedStation.operator || "Independent"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-[var(--color-border-subtle)]">
                    <span className="font-serif text-[14px] text-[var(--color-ink-4)]">Total Bays</span>
                    <span className="font-serif text-[15px] text-[var(--color-ink)] font-semibold">{selectedStation.bays} bays</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-[var(--color-border-subtle)]">
                    <span className="font-serif text-[14px] text-[var(--color-ink-4)]">Power Capacity</span>
                    <span className="font-serif text-[15px] text-[var(--color-ink)] font-semibold">{selectedStation.power_kw ? `${selectedStation.power_kw} kW` : "Standard AC/DC"}</span>
                  </div>
                  {selectedStation.connector_types && selectedStation.connector_types.length > 0 && (
                    <div className="flex justify-between items-start pb-3 border-b border-[var(--color-border-subtle)]">
                      <span className="font-serif text-[14px] text-[var(--color-ink-4)]">Plugs</span>
                      <div className="flex flex-col items-end gap-1">
                        {selectedStation.connector_types.map((plug, i) => (
                          <span key={i} className="font-serif text-[14px] text-[var(--color-ink)] font-semibold">{plug}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start pb-3">
                    <span className="font-serif text-[14px] text-[var(--color-ink-4)]">Usage Cost</span>
                    <span className={`font-serif text-[14px] text-right ${selectedStation.usage_cost ? 'text-[var(--color-ink)] max-w-[60%]' : 'text-[var(--color-ink-3)]'}`}>
                      {selectedStation.usage_cost || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto p-4 bg-[var(--color-canvas)] rounded-lg border border-[var(--color-border-subtle)]">
                  <div className="font-serif text-[12px] text-[var(--color-ink-4)] mb-1">
                    Source Reliability
                  </div>
                  <p className="font-serif text-[12px] text-[var(--color-ink-3)] m-0 leading-relaxed">
                    {selectedStation.source === "open_charge_map" 
                      ? "This data is aggregated from Open Charge Map (OCM) and may not reflect real-time live availability."
                      : "This is baseline dataset information. Live telemetry is currently unavailable for this region."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--color-ink-4)] gap-3 opacity-60">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div className="font-serif text-[15px]">Select a station to view details</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
