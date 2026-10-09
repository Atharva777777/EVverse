"use client";

import Link from "next/link";
import React from "react";

export default function EVverseEntryPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="glass"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: "56px", display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.5)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--color-navy-900)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="2" fill="white" />
              <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="0.8" fill="none" opacity="0.45" />
              <circle cx="6" cy="6" r="6" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2" />
            </svg>
          </div>
          <span style={{ fontFamily: "Times New Roman, serif", fontSize: "16px", color: "var(--color-ink)", letterSpacing: "-0.01em" }}>
            EVverse
          </span>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main className="anim-fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontFamily: "Times New Roman, serif", fontSize: "36px", fontWeight: 400, color: "var(--color-ink)", marginBottom: "12px", letterSpacing: "-0.02em" }}>
            Welcome to EVverse
          </h1>
          <p style={{ fontFamily: "Times New Roman, serif", fontSize: "16px", color: "var(--color-ink-3)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.5 }}>
            Select your role to access tailored infrastructure planning, deployment insights, and optimization tools.
          </p>
        </div>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center", maxWidth: "900px" }}>
          
          {/* Investor Card */}
          <Link href="/investor" style={{ textDecoration: "none" }}>
            <div
              className="glass"
              style={{
                width: "280px",
                padding: "32px 24px",
                borderRadius: "20px",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                transition: "all 0.2s ease",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(10,22,40,0.05)",
                background: "white"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(10,22,40,0.1)";
                e.currentTarget.style.borderColor = "var(--color-navy-200)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(10,22,40,0.05)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "20px", color: "var(--color-ink)", marginBottom: "8px" }}>Investor</h2>
              <p style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-3)", margin: 0, lineHeight: 1.5 }}>
                Identify high-demand areas, plan strategic deployments, and analyze ROI scenarios.
              </p>
            </div>
          </Link>

          {/* Government Card */}
          <Link href="/government" style={{ textDecoration: "none" }}>
            <div
              className="glass"
              style={{
                width: "280px",
                padding: "32px 24px",
                borderRadius: "20px",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                transition: "all 0.2s ease",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(10,22,40,0.05)",
                background: "white"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(10,22,40,0.1)";
                e.currentTarget.style.borderColor = "var(--color-navy-200)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(10,22,40,0.05)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "20px", color: "var(--color-ink)", marginBottom: "8px" }}>Government</h2>
              <p style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-3)", margin: 0, lineHeight: 1.5 }}>
                Ensure equitable coverage, analyze grid readiness, and generate municipal briefings.
              </p>
            </div>
          </Link>

          {/* EV Users Card (Placeholder) */}
          <div
            className="glass"
            style={{
              width: "280px",
              padding: "32px 24px",
              borderRadius: "20px",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              opacity: 0.7,
              background: "white"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "20px", color: "var(--color-ink)", margin: 0 }}>EV Users</h2>
              <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 6px", borderRadius: "4px", background: "var(--color-grey-200)", color: "var(--color-grey-600)", fontWeight: 600 }}>Coming Soon</span>
            </div>
            <p style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-3)", margin: 0, lineHeight: 1.5 }}>
              Discover charging stations and plan seamless journeys across the network.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
