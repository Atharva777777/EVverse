"use client";

import Link from "next/link";
import React from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useLiveData } from "@/hooks/useLiveData";

function InvestorMarketIndicator({ city, description }: { city: string, description: string }) {
  const { loading, isLive, stationCount, source } = useLiveData(city);

  return (
    <div 
      className="anim-fade-up" 
      style={{ padding: "24px", borderRadius: "12px", border: "1px solid var(--color-border)", background: "white", display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h4 style={{ fontFamily: "Times New Roman, serif", fontSize: "20px", margin: 0, color: "var(--color-ink)" }}>{city}</h4>
          <div style={{ fontSize: "13px", color: "var(--color-ink-3)", marginTop: "4px" }}>{description}</div>
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
          {isLive ? "LIVE DATA" : "BASELINE"}
        </span>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--color-border-subtle)" }}>
        <div style={{ fontSize: "12px", color: "var(--color-ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tracked Existing Supply</div>
        <div style={{ fontFamily: "Times New Roman, serif", fontSize: "32px", color: "var(--color-navy-900)", display: "flex", alignItems: "baseline", gap: "8px" }}>
          {loading ? "..." : (stationCount > 0 ? stationCount : "0")} 
          <span style={{ fontSize: "14px", color: "var(--color-ink-3)", fontFamily: "var(--font-sans)" }}>stations</span>
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "var(--color-ink-4)", marginTop: "12px" }}>
        Source: {loading ? "Fetching..." : (source === "open_charge_map" ? "Open Charge Map API" : "Static Kaggle Dataset")}
      </div>
    </div>
  );
}

export default function InvestorDashboard() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-canvas)" }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="glass"
        style={{ position: "sticky", top: 0, zIndex: 50, height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <BrandLogo suffix="Investor" />
          </Link>
        </div>
        
        <div>
          <Link href="/investor/map" style={{ textDecoration: "none" }}>
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
              <span>Start Deployment Planning</span>
              <span>→</span>
            </button>
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main className="anim-fade-in" style={{ flex: 1, padding: "48px 32px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        
        <div style={{ marginBottom: "48px" }}>
          <h1 style={{ fontFamily: "Times New Roman, serif", fontSize: "42px", fontWeight: 400, color: "var(--color-ink)", marginBottom: "16px", letterSpacing: "-0.02em" }}>
            Investment Intelligence
          </h1>
          <p style={{ fontFamily: "Times New Roman, serif", fontSize: "18px", color: "var(--color-ink-3)", maxWidth: "800px", lineHeight: 1.6, margin: 0 }}>
            Strategic insights for EV infrastructure deployment. Analyze market readiness, 
            evaluate candidate locations, and project financial scenarios before committing capital.
          </p>
        </div>

        {/* ── ACTIVE TARGET MARKETS (LIVE DATA) ──────────────── */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-ink)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <span>Target Market Intelligence</span>
            <span style={{ fontSize: "13px", color: "var(--color-ink-3)", fontFamily: "var(--font-sans)" }}>Aggregated from live telemetry</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
             <InvestorMarketIndicator city="Mumbai" description="High-density urban expansion" />
             <InvestorMarketIndicator city="Delhi" description="Extensive transit corridors" />
             <InvestorMarketIndicator city="Bengaluru" description="Tech-corridor early adoption" />
          </div>
        </section>

        {/* ── MARKET & SCENARIO INDICATORS ──────────────────── */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-ink)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "24px" }}>
            Reference Data & Scenario Assumptions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: "24px" }}>
            
            {[
              { label: "Tracked Global Sites", value: "~242k", sub: "Source: Open Charge Map", status: "Verified" },
              { label: "Target Capex per Port", value: "$45k", sub: "Assumption: DCFC Benchmark", status: "Scenario Input" },
              { label: "Target Utilization Rate", value: "15%", sub: "Assumption: Baseline", status: "Scenario Input" },
              { label: "Demand Proxy", value: "Population", sub: "Source: Census / Density", status: "Modeled" }
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
                  <div style={{ fontFamily: "Times New Roman, serif", fontSize: "11px", color: stat.status === "Verified" ? "var(--color-positive)" : "var(--color-ink-3)", background: stat.status === "Verified" ? "var(--color-positive-bg)" : "var(--color-canvas)", padding: "4px 8px", borderRadius: "4px", border: "1px solid", borderColor: stat.status === "Verified" ? "rgba(15,122,74,0.2)" : "var(--color-border-subtle)", fontWeight: 600, letterSpacing: "0.02em" }}>{stat.status}</div>
                </div>
              </div>
            ))}

          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: "48px", marginBottom: "48px", alignItems: "start" }}>
          
          {/* ── CANDIDATE LOCATIONS ─────────────────────────────── */}
          <section>
            <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-ink)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "24px" }}>
              Coverage Opportunity
            </h2>
            <div style={{ padding: "32px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "white", height: "100%" }}>
              <p style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-2)", lineHeight: 1.6, marginBottom: "32px" }}>
                The placement engine uses combinatorial optimization to identify candidate locations based on existing supply and demand proxies. It is designed to maximize spatial coverage.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
                {[
                  { title: "Density Proxies", desc: "Estimates demand using regional population centers." },
                  { title: "Existing Supply", desc: "Factors in current Open Charge Map locations." },
                  { title: "Grid Feasibility", desc: "Currently treated as a static scenario constraint." }
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

          {/* ── FINANCIAL SCENARIOS ─────────────────────────────── */}
          <section>
            <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-ink)", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "24px" }}>
              Financial Scenarios
            </h2>
            <div style={{ padding: "32px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "white", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-2)", lineHeight: 1.6, marginBottom: "32px" }}>
                The deployment planner allows testing scenarios against different temporal demand patterns (e.g., morning vs. afternoon peaks). 
                <br/><br/>
                <strong>Explicit Assumptions:</strong> The model uses fixed capital expenditure benchmarks and assumed utilization tariffs. These are scenario planning tools, not guaranteed financial returns or live market data.
              </p>
              <div style={{ padding: "24px", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", background: "var(--color-canvas)" }}>
                <div style={{ fontFamily: "Times New Roman, serif", fontSize: "13px", color: "var(--color-ink-3)", marginBottom: "12px" }}>Included in Analysis:</div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", padding: "6px 12px", background: "white", borderRadius: "4px", border: "1px solid var(--color-border)", color: "var(--color-ink)", fontFamily: "Times New Roman, serif" }}>Morning Peak</span>
                  <span style={{ fontSize: "13px", padding: "6px 12px", background: "white", borderRadius: "4px", border: "1px solid var(--color-border)", color: "var(--color-ink)", fontFamily: "Times New Roman, serif" }}>Afternoon Peak</span>
                  <span style={{ fontSize: "13px", padding: "6px 12px", background: "white", borderRadius: "4px", border: "1px solid var(--color-border)", color: "var(--color-ink)", fontFamily: "Times New Roman, serif" }}>All Hours (Baseline)</span>
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
              <strong>Data Sources:</strong> Station data is sourced from Open Charge Map (OCM) and the Kaggle baseline dataset. 
              Figures presented above are demonstration indicators. The live planning map fetches actual available station metadata when possible. 
              <br/><br/>
              <strong>Limitations:</strong> Do not rely on these models for final financial commitment without independently verifying real estate, local grid capacity, and up-to-date regional EV adoption rates.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
