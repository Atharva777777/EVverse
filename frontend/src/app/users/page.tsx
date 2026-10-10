"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function EVUsersLanding() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-canvas)" }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="glass"
        style={{ position: "sticky", top: 0, zIndex: 50, height: "64px", display: "flex", alignItems: "center", padding: "0 32px", borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <BrandLogo suffix="Users" />
        </Link>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
        <div style={{ maxWidth: "800px", width: "100%" }}>

          <div style={{ marginBottom: "56px", textAlign: "center" }}>
            <h1 style={{ fontFamily: "Times New Roman, serif", fontSize: "36px", color: "var(--color-ink)", marginBottom: "12px", letterSpacing: "-0.02em" }}>
              EV Users
            </h1>
            <p style={{ fontFamily: "Times New Roman, serif", fontSize: "17px", color: "var(--color-ink-3)", lineHeight: 1.6, margin: 0 }}>
              Discover charging stations near you, or learn about electric vehicles and ownership.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>

            {/* Station Discovery */}
            <Link href="/users/stations" style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "white",
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                  padding: "40px 36px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  height: "100%",
                  transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(10,22,40,0.08)";
                  e.currentTarget.style.borderColor = "var(--color-navy-300)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-navy-500)", marginBottom: "10px" }}>
                    Station Discovery
                  </div>
                  <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "26px", color: "var(--color-ink)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                    Find Charging Stations
                  </h2>
                  <p style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-3)", lineHeight: 1.65, margin: 0 }}>
                    Explore the live charging network by city. Filter by location, view connector types and power specifications, and inspect station details directly on the map.
                  </p>
                </div>
                <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid var(--color-border-subtle)" }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--color-ink-3)", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span>Station locations and operator details</span>
                    <span>Connector types and power capacity</span>
                    <span>Live and baseline data, clearly labelled</span>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 600, color: "var(--color-navy-700)", display: "flex", alignItems: "center", gap: "6px" }}>
                  Open Map &rarr;
                </div>
              </div>
            </Link>

            {/* Knowledge Hub */}
            <Link href="/users/knowledge" style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "white",
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                  padding: "40px 36px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  height: "100%",
                  transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(10,22,40,0.08)";
                  e.currentTarget.style.borderColor = "var(--color-navy-300)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-navy-500)", marginBottom: "10px" }}>
                    EV Knowledge Hub
                  </div>
                  <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "26px", color: "var(--color-ink)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                    Explore EV Knowledge
                  </h2>
                  <p style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-3)", lineHeight: 1.65, margin: 0 }}>
                    Understand electric vehicles before you buy. Compare cars and two-wheelers, learn about range, batteries, charging speeds, and what to expect from EV ownership.
                  </p>
                </div>
                <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid var(--color-border-subtle)" }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--color-ink-3)", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span>Powertrain architectures explained</span>
                    <span>Vehicle classes and Indian context</span>
                    <span>Visual energy-flow diagrams</span>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 600, color: "var(--color-navy-700)", display: "flex", alignItems: "center", gap: "6px" }}>
                  Explore &rarr;
                </div>
              </div>
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}

