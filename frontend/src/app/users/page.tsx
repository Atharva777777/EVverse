"use client";

import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";

export default function EVUsersLanding() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: "#ffffff",
        overflowX: "hidden",
      }}
    >
      {/* ── FUTURISTIC APPLE AESTHETIC EV BACKGROUND ─────────── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Image
          src="/images/users-bg.png"
          alt="Futuristic EV World Architecture"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "center 42%",
            opacity: 0.85,
          }}
        />

        {/* Apple Editorial Atmospheric Light Gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.72) 22%, rgba(255, 255, 255, 0.38) 50%, rgba(255, 255, 255, 0.82) 80%, rgba(255, 255, 255, 0.98) 100%)",
          }}
        />

        {/* Subtle Radial Glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.6) 100%)",
          }}
        />
      </div>

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
          padding: "0 32px",
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <BrandLogo suffix="Users" />
        </Link>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: "860px", width: "100%" }}>
          <div style={{ marginBottom: "52px", textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "Times New Roman, serif",
                fontSize: "38px",
                color: "var(--color-ink)",
                marginBottom: "12px",
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              EV Users
            </h1>
            <p
              style={{
                fontFamily: "Times New Roman, serif",
                fontSize: "17px",
                color: "var(--color-ink-3)",
                lineHeight: 1.6,
                margin: 0,
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Discover charging stations near you, or learn about electric vehicles and ownership.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "28px",
            }}
          >
            {/* Station Discovery */}
            <Link href="/users/stations" style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.88)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  borderRadius: "20px",
                  padding: "40px 36px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  height: "100%",
                  transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  cursor: "pointer",
                  boxShadow: "0 10px 36px rgba(10, 22, 40, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 18px 44px rgba(10, 22, 40, 0.12), 0 0 0 1px rgba(0, 113, 227, 0.2)";
                  e.currentTarget.style.borderColor = "rgba(0, 113, 227, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 36px rgba(10, 22, 40, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.8)";
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-navy-500)",
                      marginBottom: "10px",
                    }}
                  >
                    Station Discovery
                  </div>
                  <h2
                    style={{
                      fontFamily: "Times New Roman, serif",
                      fontSize: "26px",
                      color: "var(--color-ink)",
                      marginBottom: "12px",
                      letterSpacing: "-0.01em",
                      fontWeight: 400,
                    }}
                  >
                    Find Charging Stations
                  </h2>
                  <p
                    style={{
                      fontFamily: "Times New Roman, serif",
                      fontSize: "15px",
                      color: "var(--color-ink-3)",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    Explore the live charging network by city. Filter by location, view connector types and power specifications, and inspect station details directly on the map.
                  </p>
                </div>
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "24px",
                    borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "13px",
                      color: "var(--color-ink-3)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <span>Station locations and operator details</span>
                    <span>Connector types and power capacity</span>
                    <span>Live and baseline data, clearly labelled</span>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--color-navy-700)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Open Map &rarr;
                </div>
              </div>
            </Link>

            {/* Knowledge Hub */}
            <Link href="/users/knowledge" style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.88)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  borderRadius: "20px",
                  padding: "40px 36px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  height: "100%",
                  transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  cursor: "pointer",
                  boxShadow: "0 10px 36px rgba(10, 22, 40, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 18px 44px rgba(10, 22, 40, 0.12), 0 0 0 1px rgba(0, 113, 227, 0.2)";
                  e.currentTarget.style.borderColor = "rgba(0, 113, 227, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 36px rgba(10, 22, 40, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.8)";
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-navy-500)",
                      marginBottom: "10px",
                    }}
                  >
                    EV Knowledge Hub
                  </div>
                  <h2
                    style={{
                      fontFamily: "Times New Roman, serif",
                      fontSize: "26px",
                      color: "var(--color-ink)",
                      marginBottom: "12px",
                      letterSpacing: "-0.01em",
                      fontWeight: 400,
                    }}
                  >
                    Explore EV Knowledge
                  </h2>
                  <p
                    style={{
                      fontFamily: "Times New Roman, serif",
                      fontSize: "15px",
                      color: "var(--color-ink-3)",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    Understand electric vehicles before you buy. Compare cars and two-wheelers, learn about range, batteries, charging speeds, and what to expect from EV ownership.
                  </p>
                </div>
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "24px",
                    borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "13px",
                      color: "var(--color-ink-3)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <span>Powertrain architectures explained</span>
                    <span>Vehicle classes and Indian context</span>
                    <span>Visual energy-flow diagrams</span>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--color-navy-700)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
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
