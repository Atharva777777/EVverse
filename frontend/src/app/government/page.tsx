"use client";

import Link from "next/link";
import React from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useLiveData } from "@/hooks/useLiveData";

function GovernmentCoverageIndicator({ city, policyGoal }: { city: string, policyGoal: string }) {
  const { loading, isLive, stationCount, source } = useLiveData(city);

  return (
    <div 
      className="anim-fade-up" 
      style={{ padding: "24px", borderRadius: "12px", border: "1px solid var(--color-border)", background: "white", display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h4 style={{ fontFamily: "Times New Roman, serif", fontSize: "20px", margin: 0, color: "var(--color-ink)" }}>{city} Jurisdiction</h4>
          <div style={{ fontSize: "13px", color: "var(--color-navy-600)", marginTop: "4px", fontWeight: 500 }}>Goal: {policyGoal}</div>
        </div>
        <span style={{ 
          fontSize: "11px", 
          padding: "4px 8px", 
          borderRadius: "4px", 
          fontWeight: 600, 
          background: isLive ? "var(--color-positive-bg)" : "var(--color-canvas)",
          color: isLive ? "var(--color-positive)" : "var(--color-ink-3)",
          border: "1px solid",
          borderColor: isLive ? "rgba(15,122,74,0.2)" : "var(--color-border-subtle)"
        }}>
          {isLive ? "LIVE DATA" : "MODELED"}
        </span>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--color-border-subtle)" }}>
        <div style={{ fontSize: "12px", color: "var(--color-ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recorded Public Stations</div>
        <div style={{ fontFamily: "Times New Roman, serif", fontSize: "32px", color: "var(--color-navy-900)", display: "flex", alignItems: "baseline", gap: "8px" }}>
          {loading ? "..." : (stationCount > 0 ? stationCount : "0")} 
          <span style={{ fontSize: "14px", color: "var(--color-ink-3)", fontFamily: "var(--font-sans)" }}>nodes identified</span>
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "var(--color-ink-4)", marginTop: "12px" }}>
        Telemetry: {loading ? "Fetching..." : (source === "open_charge_map" ? "OCM Live Network" : "Baseline Estimate")}
      </div>
    </div>
  );
}

export default function GovernmentDashboard() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-canvas)" }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="glass"
        style={{ position: "sticky", top: 0, zIndex: 50, height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <BrandLogo suffix="Government" />
          </Link>
        </div>
        
        <div>
          <Link href="/government/map" style={{ textDecoration: "none" }}>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "var(--color-navy-900)",
                color: "white",
                fontFamily: "Times New Roman, serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.2s ease",
                boxShadow: "0 2px 8px rgba(10,22,40,0.15)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              <span>Launch Territory Planner</span>
              <span>→</span>
            </button>
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main className="anim-fade-in" style={{ flex: 1, padding: "48px 32px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        
        <div style={{ marginBottom: "48px" }}>
          <h1 style={{ fontFamily: "Times New Roman, serif", fontSize: "42px", fontWeight: 400, color: "var(--color-ink)", marginBottom: "16px", letterSpacing: "-0.02em" }}>
            Public Infrastructure Planning
          </h1>
          <p style={{ fontFamily: "Times New Roman, serif", fontSize: "18px", color: "var(--color-ink-3)", maxWidth: "800px", lineHeight: 1.6, margin: 0 }}>
            Ensure equitable EV charging access across jurisdictions. Identify coverage gaps,
            model infrastructure rollout scenarios, and align private investment with public policy goals.
          </p>
        </div>

        {/* ── PUBLIC CHARGING INFRASTRUCTURE OVERVIEW (LIVE DATA) ──────────────── */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-ink)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <span>Live Regional Coverage Status</span>
            <span style={{ fontSize: "13px", color: "var(--color-ink-3)", fontFamily: "var(--font-sans)" }}>Aggregated from live telemetry</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
             <GovernmentCoverageIndicator city="Mumbai" policyGoal="Density matching" />
             <GovernmentCoverageIndicator city="Delhi" policyGoal="Corridor electrification" />
             <GovernmentCoverageIndicator city="Bengaluru" policyGoal="Equitable distribution" />
          </div>
        </section>

        {/* ── INFRASTRUCTURE INDICATORS ──────────────────────── */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-ink)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "24px" }}>
            Data Inputs & Policy Goals
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: "24px" }}>
            
            {[
              { label: "Tracked National Sites", value: "Coverage", sub: "Source: OCM / NREL API", status: "Aggregated" },
              { label: "Demand Proxy", value: "Density", sub: "Source: Census Datasets", status: "Modeled" },
              { label: "Grid Constraints", value: "Unverified", sub: "Status: Awaiting Utility GIS", status: "Scenario Input" },
              { label: "Equity Prioritization", value: "Spatial", sub: "Target: Distance-based access", status: "Policy Goal" }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className={`anim-fade-up d-${idx}`} 
                style={{ padding: "24px", borderRadius: "12px", border: "1px solid var(--color-border)", background: "white", transition: "all 0.2s ease", cursor: "default" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(10,22,40,0.06)"; e.currentTarget.style.borderColor = "var(--color-navy-200)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
              >
                <div style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                <div className="numeric" style={{ fontFamily: "Times New Roman, serif", fontSize: "36px", fontWeight: 400, color: "var(--color-navy-900)", marginBottom: "16px", letterSpacing: "-0.02em" }}>{stat.value}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border-subtle)", paddingTop: "12px" }}>
                  <div style={{ fontFamily: "Times New Roman, serif", fontSize: "13px", color: "var(--color-ink-3)" }}>{stat.sub}</div>
                  <div style={{ fontFamily: "Times New Roman, serif", fontSize: "11px", color: stat.status === "Policy Goal" ? "var(--color-navy-600)" : "var(--color-ink-3)", background: stat.status === "Policy Goal" ? "var(--color-navy-50)" : "var(--color-canvas)", padding: "4px 8px", borderRadius: "4px", border: "1px solid", borderColor: stat.status === "Policy Goal" ? "var(--color-navy-200)" : "var(--color-border-subtle)", fontWeight: 600, letterSpacing: "0.02em" }}>{stat.status}</div>
                </div>
              </div>
            ))}

          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: "48px", marginBottom: "48px", alignItems: "start" }}>
          
          {/* ── COVERAGE & PRIORITIES ───────────────────────────── */}
          <section>
            <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-ink)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "24px" }}>
              Coverage Gap Analysis
            </h2>
            <div style={{ padding: "32px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "white", height: "100%" }}>
              <p style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-2)", lineHeight: 1.6, marginBottom: "32px" }}>
                The placement algorithms identify spatial charging deserts by comparing existing supply against population density proxies. This helps direct planning attention toward underserved regions.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
                {[
                  { title: "Equitable Distribution", desc: "Optimizes for spatial coverage distance." },
                  { title: "Transit Corridors", desc: "Evaluates proximity to major road networks." },
                  { title: "Scenario Reports", desc: "Generates baseline coverage assessments." }
                ].map((item, idx) => (
                  <li key={idx} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ width: "4px", height: "16px", background: "var(--color-border)", marginTop: "4px", flexShrink: 0 }}></div>
                    <div>
                      <div style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink)", fontWeight: 600, marginBottom: "4px" }}>{item.title}</div>
                      <div style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-3)", lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── PLANNING SCENARIOS ─────────────────────────────── */}
          <section>
            <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-ink)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "24px" }}>
              Planning Scenarios
            </h2>
            <div style={{ padding: "32px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "white", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-2)", lineHeight: 1.6, marginBottom: "32px" }}>
                Evaluate different infrastructure deployments by altering spatial demand assumptions.
                <br/><br/>
                <strong>Strategic Impact:</strong> Test the spatial implications of placing stations to support morning commutes versus continuous regional transit.
              </p>
              <div style={{ padding: "24px", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", background: "var(--color-canvas)" }}>
                <div style={{ fontFamily: "Times New Roman, serif", fontSize: "13px", color: "var(--color-ink-3)", marginBottom: "12px" }}>Available Scenarios:</div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", padding: "6px 12px", background: "white", borderRadius: "4px", border: "1px solid var(--color-border)", color: "var(--color-ink)", fontFamily: "Times New Roman, serif" }}>Commuter (Morning)</span>
                  <span style={{ fontSize: "13px", padding: "6px 12px", background: "white", borderRadius: "4px", border: "1px solid var(--color-border)", color: "var(--color-ink)", fontFamily: "Times New Roman, serif" }}>Commercial (Afternoon)</span>
                  <span style={{ fontSize: "13px", padding: "6px 12px", background: "white", borderRadius: "4px", border: "1px solid var(--color-border)", color: "var(--color-ink)", fontFamily: "Times New Roman, serif" }}>Residential (Overnight)</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ── DATA SOURCES & LIMITATIONS ─────────────────────── */}
        <section style={{ marginBottom: "64px" }}>
          <div style={{ padding: "32px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "white" }}>
            <h3 style={{ fontFamily: "Times New Roman, serif", fontSize: "16px", fontWeight: 600, color: "var(--color-ink)", marginBottom: "16px" }}>
              Methodology & Limitations
            </h3>
            <p style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-3)", lineHeight: 1.6, margin: 0 }}>
              <strong>Data Sources:</strong> Coverage baselines integrate inputs from Open Charge Map (OCM) and municipal datasets where available. 
              Figures presented above are policy demonstration indicators. 
              <br/><br/>
              <strong>Limitations:</strong> Infrastructure planning should be corroborated with local zoning records, detailed grid capacity studies from utilities, and environmental impact assessments prior to sanctioning deployment funds.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
