"use client";

import Link from "next/link";
import React from "react";

export default function GovernmentDashboard() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-canvas)" }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="glass"
        style={{ position: "sticky", top: 0, zIndex: 50, height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--color-navy-900)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="2" fill="white" />
                <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="0.8" fill="none" opacity="0.45" />
                <circle cx="6" cy="6" r="6" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2" />
              </svg>
            </div>
            <span style={{ fontFamily: "Times New Roman, serif", fontSize: "16px", color: "var(--color-ink)", letterSpacing: "-0.01em" }}>
              EVverse Government
            </span>
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

        {/* ── INFRASTRUCTURE INDICATORS ──────────────────────── */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-ink)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "24px" }}>
            Data Inputs & Policy Goals
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
            
            {[
              { label: "Tracked National Sites", value: "Coverage", sub: "Source: OCM / NREL API", status: "Aggregated" },
              { label: "Demand Proxy", value: "Density", sub: "Source: Census Datasets", status: "Modeled" },
              { label: "Grid Constraints", value: "Unverified", sub: "Status: Awaiting Utility GIS", status: "Scenario Input" },
              { label: "Equity Prioritization", value: "Spatial", sub: "Target: Distance-based access", status: "Policy Goal" }
            ].map((stat, idx) => (
              <div key={idx} style={{ padding: "24px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "white" }}>
                <div style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-3)", marginBottom: "12px" }}>{stat.label}</div>
                <div style={{ fontFamily: "Times New Roman, serif", fontSize: "28px", fontWeight: 400, color: "var(--color-ink)", marginBottom: "12px", letterSpacing: "-0.02em" }}>{stat.value}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border-subtle)", paddingTop: "12px" }}>
                  <div style={{ fontFamily: "Times New Roman, serif", fontSize: "13px", color: "var(--color-ink-3)" }}>{stat.sub}</div>
                  <div style={{ fontFamily: "Times New Roman, serif", fontSize: "11px", color: "var(--color-ink-3)", background: "var(--color-canvas)", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--color-border-subtle)" }}>{stat.status}</div>
                </div>
              </div>
            ))}

          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "48px", marginBottom: "48px" }}>
          
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
