"use client";

import Link from "next/link";
import React from "react";
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
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h1 style={{ fontFamily: "Times New Roman, serif", fontSize: "40px", color: "var(--color-ink)", marginBottom: "16px", letterSpacing: "-0.02em" }}>
            EVverse Station Discovery
          </h1>
          <p style={{ fontFamily: "Times New Roman, serif", fontSize: "18px", color: "var(--color-ink-3)", lineHeight: 1.6, marginBottom: "40px" }}>
            Explore the charging network, view live operational status where available, and locate supported connectors for a seamless journey. 
          </p>
          <Link href="/users/stations" style={{ textDecoration: "none" }}>
            <button
              style={{
                background: "var(--color-navy-900)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "16px 32px",
                fontFamily: "var(--font-sans)",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(10,22,40,0.15)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(10,22,40,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(10,22,40,0.15)";
              }}
            >
              Find Charging Stations
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
