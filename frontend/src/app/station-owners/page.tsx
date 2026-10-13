"use client";

import Link from "next/link";
import React from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useLiveData } from "@/hooks/useLiveData";
import { ArrowUpRight, Activity, Zap, TrendingUp, ShieldCheck, MapPin } from "lucide-react";
import { StationOwnerPaymentsConsole } from "@/components/station-owner/StationOwnerPaymentsConsole";

function StationOwnerHubIndicator({
  city,
  operatingFocus,
}: {
  city: string;
  operatingFocus: string;
}) {
  const { loading, isLive, stationCount, source } = useLiveData(city);

  return (
    <div
      className="anim-fade-up"
      style={{
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--color-border)",
        background: "white",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div>
          <h4
            style={{
              fontFamily: "Times New Roman, serif",
              fontSize: "20px",
              margin: 0,
              color: "var(--color-ink)",
            }}
          >
            {city} Hub Network
          </h4>
          <div
            style={{
              fontSize: "13px",
              color: "var(--color-navy-600)",
              marginTop: "4px",
              fontWeight: 500,
            }}
          >
            Focus: {operatingFocus}
          </div>
        </div>
        <span
          style={{
            fontSize: "11px",
            padding: "4px 8px",
            borderRadius: "6px",
            fontWeight: 600,
            background: isLive ? "var(--color-positive-bg)" : "var(--color-canvas)",
            color: isLive ? "var(--color-positive)" : "var(--color-ink-3)",
            border: "1px solid",
            borderColor: isLive
              ? "rgba(15,122,74,0.2)"
              : "var(--color-border-subtle)",
          }}
        >
          {isLive ? "LIVE TELEMETRY" : "BASELINE GRID"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          marginTop: "auto",
          paddingTop: "16px",
          borderTop: "1px solid var(--color-border-subtle)",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "var(--color-ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Operational Stations in Region
        </div>
        <div
          style={{
            fontFamily: "Times New Roman, serif",
            fontSize: "32px",
            color: "var(--color-navy-900)",
            display: "flex",
            alignItems: "baseline",
            gap: "8px",
          }}
        >
          {loading ? "..." : stationCount > 0 ? stationCount : "0"}
          <span
            style={{
              fontSize: "14px",
              color: "var(--color-ink-3)",
              fontFamily: "var(--font-sans)",
            }}
          >
            active charging nodes
          </span>
        </div>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "var(--color-ink-4)",
          marginTop: "12px",
        }}
      >
        Telemetry Source:{" "}
        {loading
          ? "Connecting..."
          : source === "open_charge_map"
          ? "Open Charge Map Live Network"
          : "Verified Regional Baseline"}
      </div>
    </div>
  );
}

export default function StationOwnersDashboard() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-canvas)",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <BrandLogo suffix="Station Owners" />
          </Link>
        </div>

        <div>
          <Link href="/station-owners/map" style={{ textDecoration: "none" }}>
            <button
              style={{
                padding: "8px 18px",
                borderRadius: "10px",
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
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <span>Launch Station Operations Map</span>
              <ArrowUpRight size={15} />
            </button>
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main
        className="anim-fade-in"
        style={{
          flex: 1,
          padding: "48px 32px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ marginBottom: "48px" }}>
          <h1
            style={{
              fontFamily: "Times New Roman, serif",
              fontSize: "42px",
              fontWeight: 400,
              color: "var(--color-ink)",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Charging Station Operations & Hub Intelligence
          </h1>
          <p
            style={{
              fontFamily: "Times New Roman, serif",
              fontSize: "18px",
              color: "var(--color-ink-3)",
              maxWidth: "800px",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Maximize charger utilization, monitor grid uptime in real time, and discover optimal expansion locations across high-traffic transit corridors.
          </p>
        </div>

        {/* ── LIVE REGIONAL CHARGING STATUS ──────────────────── */}
        <section style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "Times New Roman, serif",
              fontSize: "24px",
              fontWeight: 400,
              color: "var(--color-ink)",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "12px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <span>Live Regional Hub Networks</span>
            <span
              style={{
                fontSize: "13px",
                color: "var(--color-ink-3)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Continuous station telemetry
            </span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            <StationOwnerHubIndicator
              city="Mumbai"
              operatingFocus="High-speed expressway corridor"
            />
            <StationOwnerHubIndicator
              city="Delhi"
              operatingFocus="High-density urban commuter fleet"
            />
            <StationOwnerHubIndicator
              city="Bengaluru"
              operatingFocus="Tech corridor & commercial transit"
            />
          </div>
        </section>

        {/* ── OPERATIONAL METRICS & PERFORMANCE ──────────────── */}
        <section style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "Times New Roman, serif",
              fontSize: "24px",
              fontWeight: 400,
              color: "var(--color-ink)",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "12px",
              marginBottom: "24px",
            }}
          >
            Hub Performance & Grid Telemetry
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                label: "Network Uptime",
                value: "99.4%",
                sub: "Connector reliability",
                status: "Operational",
              },
              {
                label: "Average Dwell Time",
                value: "34 min",
                sub: "Fast charge to 80%",
                status: "Measured",
              },
              {
                label: "Max Hub Rate",
                value: "250 kW",
                sub: "CCS2 / Dual Fast DC",
                status: "Peak Speed",
              },
              {
                label: "Demand Deficit",
                value: "Spatial",
                sub: "High driver queue zones",
                status: "Optimization Target",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`anim-fade-up d-${idx}`}
                style={{
                  padding: "24px",
                  borderRadius: "16px",
                  border: "1px solid var(--color-border)",
                  background: "white",
                  transition: "all 0.2s ease",
                  cursor: "default",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(10,22,40,0.06)";
                  e.currentTarget.style.borderColor = "var(--color-navy-200)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                <div
                  style={{
                    fontFamily: "Times New Roman, serif",
                    fontSize: "14px",
                    color: "var(--color-ink-3)",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  className="numeric"
                  style={{
                    fontFamily: "Times New Roman, serif",
                    fontSize: "36px",
                    fontWeight: 400,
                    color: "var(--color-navy-900)",
                    marginBottom: "16px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--color-border-subtle)",
                    paddingTop: "12px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Times New Roman, serif",
                      fontSize: "13px",
                      color: "var(--color-ink-3)",
                    }}
                  >
                    {stat.sub}
                  </div>
                  <div
                    style={{
                      fontFamily: "Times New Roman, serif",
                      fontSize: "11px",
                      color:
                        stat.status === "Optimization Target"
                          ? "var(--color-navy-600)"
                          : "var(--color-ink-3)",
                      background:
                        stat.status === "Optimization Target"
                          ? "var(--color-navy-50)"
                          : "var(--color-canvas)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid",
                      borderColor:
                        stat.status === "Optimization Target"
                          ? "var(--color-navy-200)"
                          : "var(--color-border-subtle)",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {stat.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CPO INSIGHTS & OPERATIONS ───────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
            gap: "48px",
            marginBottom: "48px",
            alignItems: "start",
          }}
        >
          {/* ── UTILIZATION & EXPANSION ────────────────────────── */}
          <section>
            <h2
              style={{
                fontFamily: "Times New Roman, serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "var(--color-ink)",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "12px",
                marginBottom: "24px",
              }}
            >
              Charger Utilization & Deficit Modeling
            </h2>
            <div
              style={{
                padding: "32px",
                borderRadius: "16px",
                border: "1px solid var(--color-border)",
                background: "white",
                height: "100%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <p
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: "16px",
                  color: "var(--color-ink-2)",
                  lineHeight: 1.7,
                  marginBottom: "32px",
                }}
              >
                <strong>Operational Telemetry:</strong> EVverse tracks charger bay occupancy, turnaround times, and power delivery to identify underutilized stalls and high-congestion bottlenecks.
                <br />
                <br />
                <strong>Expansion Intelligence:</strong> Our predictive deficit model highlights nearby transit zones where driver charging demand consistently outpaces existing supply, guiding station owners where to add new chargers.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {[
                  {
                    title: "Tariff Optimization",
                    desc: "Balance off-peak utility wholesale power with driver peak charging windows.",
                  },
                  {
                    title: "Transit Corridor Placement",
                    desc: "Target high-speed stops along major highways with minimal driver detour.",
                  },
                  {
                    title: "Proactive Maintenance",
                    desc: "Automated community reporting detects broken plugs and offline stalls instantly.",
                  },
                ].map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "16px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "4px",
                        height: "16px",
                        background: "var(--color-navy-600)",
                        marginTop: "4px",
                        flexShrink: 0,
                        borderRadius: "2px",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontFamily: "Times New Roman, serif",
                          fontSize: "15px",
                          color: "var(--color-ink)",
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "Times New Roman, serif",
                          fontSize: "14px",
                          color: "var(--color-ink-3)",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── EXPANSION SCENARIOS ─────────────────────────────── */}
          <section>
            <h2
              style={{
                fontFamily: "Times New Roman, serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "var(--color-ink)",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "12px",
                marginBottom: "24px",
              }}
            >
              Operational Hub Scenarios
            </h2>
            <div
              style={{
                padding: "32px",
                borderRadius: "16px",
                border: "1px solid var(--color-border)",
                background: "white",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <p
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: "16px",
                  color: "var(--color-ink-2)",
                  lineHeight: 1.7,
                  marginBottom: "32px",
                }}
              >
                <strong>AI Hub Scenarios:</strong> Simulate different charging station deployment configurations. Test the impact of adding 180 kW dual-gun chargers versus 60 kW destination chargers on daily station throughput.
                <br />
                <br />
                <strong>Revenue Impact:</strong> Model daily kilowatt-hour throughput based on time-of-day traffic patterns and regional EV fleet density.
              </p>
              <div
                style={{
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border-subtle)",
                  background: "var(--color-canvas)",
                }}
              >
                <div
                  style={{
                    fontFamily: "Times New Roman, serif",
                    fontSize: "13px",
                    color: "var(--color-ink-3)",
                    marginBottom: "12px",
                  }}
                >
                  Deployment Profiles:
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      padding: "6px 12px",
                      background: "white",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-ink)",
                      fontFamily: "Times New Roman, serif",
                    }}
                  >
                    Highway Fast Hub (150-250 kW)
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      padding: "6px 12px",
                      background: "white",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-ink)",
                      fontFamily: "Times New Roman, serif",
                    }}
                  >
                    Urban Fleet Depot (60-120 kW)
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      padding: "6px 12px",
                      background: "white",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-ink)",
                      fontFamily: "Times New Roman, serif",
                    }}
                  >
                    Destination Retail (22-50 kW)
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── PAYMENTS & REVENUE CONSOLE ─────────────────────── */}
        <section style={{ marginBottom: "56px" }}>
          <StationOwnerPaymentsConsole />
        </section>

        {/* ── METHODOLOGY & TELEMETRY NOTES ─────────────────── */}
        <section style={{ marginBottom: "64px" }}>
          <div
            style={{
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <h3
              style={{
                fontFamily: "Times New Roman, serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--color-ink)",
                marginBottom: "16px",
              }}
            >
              Operations Telemetry & Methodology
            </h3>
            <p
              style={{
                fontFamily: "Times New Roman, serif",
                fontSize: "15px",
                color: "var(--color-ink-3)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              <strong>Data Integration:</strong> Station telemetry is sourced from Open Charge Map (OCM) and validated local infrastructure registers.
              Availability metrics distinguish live connector telemetry from baseline registry records to prevent false inferences.
              <br />
              <br />
              <strong>Grid Planning:</strong> Hub operators should coordinate with local utility distribution companies (DISCOMs) for actual transformer capacity and sanction loads prior to installing ultra-fast DC chargers.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
