"use client";

import Link from "next/link";
import React from "react";
import { BrandLogo } from "@/components/BrandLogo";

export default function EVverseEntryPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="glass"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: "56px", display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.5)" }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <BrandLogo />
        </Link>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", width: "100%", maxWidth: "1000px" }}>
          
          {/* Investor Card */}
          <Link href="/investor" style={{ textDecoration: "none" }}>
            <div
              className="anim-fade-up d-0"
              style={{
                height: "100%",
                padding: "40px 32px",
                borderRadius: "16px",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                cursor: "pointer",
                background: "white"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(10,22,40,0.08)";
                e.currentTarget.style.borderColor = "var(--color-navy-200)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--color-navy-50)", color: "var(--color-navy-900)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: 700 }}>
                I
              </div>
              <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", color: "var(--color-ink)", marginBottom: "12px", letterSpacing: "-0.01em" }}>Investor</h2>
              <p style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-3)", margin: 0, lineHeight: 1.6 }}>
                Identify high-demand areas, plan strategic deployments, and analyze ROI scenarios.
              </p>
            </div>
          </Link>

          {/* Government Card */}
          <Link href="/government" style={{ textDecoration: "none" }}>
            <div
              className="anim-fade-up d-1"
              style={{
                height: "100%",
                padding: "40px 32px",
                borderRadius: "16px",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                cursor: "pointer",
                background: "white"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(10,22,40,0.08)";
                e.currentTarget.style.borderColor = "var(--color-navy-200)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--color-navy-50)", color: "var(--color-navy-900)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: 700 }}>
                G
              </div>
              <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", color: "var(--color-ink)", marginBottom: "12px", letterSpacing: "-0.01em" }}>Government</h2>
              <p style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-3)", margin: 0, lineHeight: 1.6 }}>
                Ensure equitable coverage, analyze grid readiness, and generate municipal briefings.
              </p>
            </div>
          </Link>

          {/* EV Users Card */}
          <Link href="/users" style={{ textDecoration: "none" }}>
            <div
              className="anim-fade-up d-2"
              style={{
                height: "100%",
                padding: "40px 32px",
                borderRadius: "16px",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                cursor: "pointer",
                background: "white"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(10,22,40,0.08)";
                e.currentTarget.style.borderColor = "var(--color-navy-200)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--color-navy-50)", color: "var(--color-navy-900)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: 700 }}>
                U
              </div>
              <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", color: "var(--color-ink)", marginBottom: "12px", letterSpacing: "-0.01em" }}>EV Users</h2>
              <p style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-3)", margin: 0, lineHeight: 1.6 }}>
                Discover charging stations and plan seamless journeys across the network.
              </p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
