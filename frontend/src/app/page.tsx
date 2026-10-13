"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { ArrowUpRight, BookOpen } from "lucide-react";

export default function EVverseEntryPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        color: "#1d1d1f",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <BrandLogo />
        </Link>
        <Link href="/users/knowledge" style={{ textDecoration: "none" }}>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              background: "#f5f5f7",
              color: "#1d1d1f",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e5e5ea"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f5f5f7"; }}
          >
            <BookOpen size={14} className="text-[#16A34A]" />
            <span>EV Knowledge Hub</span>
          </button>
        </Link>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "60px 24px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "48px",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", maxWidth: "620px" }}>
          <h1
            style={{
              fontSize: "clamp(32px, 3.8vw, 46px)",
              fontWeight: 500,
              letterSpacing: "-0.025em",
              color: "#1d1d1f",
              marginBottom: "12px",
            }}
          >
            Welcome to EVverse
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#86868b",
              lineHeight: 1.55,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Select your role to access tailored infrastructure planning, deployment insights, and optimization tools.
          </p>
        </div>

        {/* Three Distinct Role Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: "28px",
            width: "100%",
          }}
        >
          {/* ── CARD 1: INVESTOR ─────────────────────────── */}
          <Link href="/investor/map" style={{ textDecoration: "none" }}>
            <div
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                borderRadius: "22px",
                overflow: "hidden",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow:
                  hoveredCard === 1
                    ? "0 20px 40px rgba(0, 0, 0, 0.1)"
                    : "0 2px 10px rgba(0, 0, 0, 0.03)",
                transform: hoveredCard === 1 ? "translateY(-5px)" : "translateY(0)",
                transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "220px",
                  overflow: "hidden",
                  background: "#f5f5f7",
                }}
              >
                <Image
                  src="/images/card-investor.png"
                  alt="Investor Quantum Planning"
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  style={{
                    objectFit: "cover",
                    transform: hoveredCard === 1 ? "scale(1.05)" : "scale(1)",
                    transition: "transform 0.5s ease",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "26px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#1d1d1f",
                      letterSpacing: "-0.015em",
                      margin: 0,
                    }}
                  >
                    Investor
                  </h2>
                  <ArrowUpRight
                    size={18}
                    style={{
                      color: hoveredCard === 1 ? "#0071e3" : "#86868b",
                      transition: "color 0.2s ease, transform 0.2s ease",
                      transform: hoveredCard === 1 ? "translate(2px, -2px)" : "none",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.55,
                    color: "#6e6e73",
                    margin: 0,
                  }}
                >
                  Identify high-demand areas, plan strategic deployments, and analyze ROI scenarios.
                </p>
              </div>
            </div>
          </Link>

          {/* ── CARD 2: EV STATION OWNERS ───────────────────────── */}
          <Link href="/station-owners" style={{ textDecoration: "none" }}>
            <div
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                borderRadius: "22px",
                overflow: "hidden",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow:
                  hoveredCard === 2
                    ? "0 20px 40px rgba(0, 0, 0, 0.1)"
                    : "0 2px 10px rgba(0, 0, 0, 0.03)",
                transform: hoveredCard === 2 ? "translateY(-5px)" : "translateY(0)",
                transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "220px",
                  overflow: "hidden",
                  background: "#f5f5f7",
                }}
              >
                <Image
                  src="/images/card-station-owners.png"
                  alt="EV Station Owners Operations and Telemetry"
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  style={{
                    objectFit: "cover",
                    transform: hoveredCard === 2 ? "scale(1.05)" : "scale(1)",
                    transition: "transform 0.5s ease",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "26px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#1d1d1f",
                      letterSpacing: "-0.015em",
                      margin: 0,
                    }}
                  >
                    EV Station Owners
                  </h2>
                  <ArrowUpRight
                    size={18}
                    style={{
                      color: hoveredCard === 2 ? "#0071e3" : "#86868b",
                      transition: "color 0.2s ease, transform 0.2s ease",
                      transform: hoveredCard === 2 ? "translate(2px, -2px)" : "none",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.55,
                    color: "#6e6e73",
                    margin: 0,
                  }}
                >
                  Manage charging hubs, monitor charger utilization, optimize tariffs, and track grid power uptime.
                </p>
              </div>
            </div>
          </Link>

          {/* ── CARD 3: EV USERS ─────────────────────────── */}
          <Link href="/users/stations" style={{ textDecoration: "none" }}>
            <div
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                borderRadius: "22px",
                overflow: "hidden",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow:
                  hoveredCard === 3
                    ? "0 20px 40px rgba(0, 0, 0, 0.1)"
                    : "0 2px 10px rgba(0, 0, 0, 0.03)",
                transform: hoveredCard === 3 ? "translateY(-5px)" : "translateY(0)",
                transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "220px",
                  overflow: "hidden",
                  background: "#f5f5f7",
                }}
              >
                <Image
                  src="/images/card-users.png"
                  alt="EV Users Vehicle and Fast Charger"
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  style={{
                    objectFit: "cover",
                    transform: hoveredCard === 3 ? "scale(1.05)" : "scale(1)",
                    transition: "transform 0.5s ease",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "26px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#1d1d1f",
                      letterSpacing: "-0.015em",
                      margin: 0,
                    }}
                  >
                    EV Users
                  </h2>
                  <ArrowUpRight
                    size={18}
                    style={{
                      color: hoveredCard === 3 ? "#0071e3" : "#86868b",
                      transition: "color 0.2s ease, transform 0.2s ease",
                      transform: hoveredCard === 3 ? "translate(2px, -2px)" : "none",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.55,
                    color: "#6e6e73",
                    margin: 0,
                  }}
                >
                  Discover charging stations and plan seamless journeys across the network.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(0, 0, 0, 0.06)",
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: "#86868b",
        }}
      >
        <div>EVverse</div>
        <div>Decision Intelligence for EV Infrastructure</div>
      </footer>
    </div>
  );
}
