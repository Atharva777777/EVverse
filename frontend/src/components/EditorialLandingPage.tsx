'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  ArrowUpRight,
  ChevronDown,
  BookOpen,
  Cpu,
  Layers,
  Activity,
} from 'lucide-react';
import { FuturisticCyberMonolith } from './FuturisticCyberMonolith';

export function EditorialLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute normalized scroll progress for the hero section (0 to 1)
  const maxHeroScroll = 600;
  const scrollProgress = Math.min(Math.max(scrollY / maxHeroScroll, 0), 1);
  const textParallax = Math.min(scrollY * 0.16, 70);

  return (
    <div className="min-h-screen bg-[#D1D6D9] p-2 sm:p-4 md:p-6 text-[#111312] selection:bg-[#111312] selection:text-white antialiased font-cyber">
      {/* ── Main Editorial Outer Frame ── */}
      <div className="relative w-full max-w-[1440px] mx-auto rounded-[36px] sm:rounded-[48px] md:rounded-[56px] bg-gradient-to-b from-[#E7EAEB] via-[#DEE1E3] to-[#D3D7D9] shadow-[0_30px_100px_rgba(0,0,0,0.14)] border border-white/70 overflow-hidden flex flex-col">
        
        {/* ── Top Header: Avant-Garde Editorial Navigation ── */}
        <header className="relative z-40 w-full px-6 sm:px-12 py-6 sm:py-8 flex items-center justify-between border-b border-black/[0.04]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-[#111312] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-lg font-extrabold tracking-tight text-[#111312] leading-none">
                QuantEV
              </span>
              <span className="font-telemetry text-[9px] tracking-[0.2em] uppercase text-black/50 mt-1">
                KINETIC // 800V DC
              </span>
            </div>
          </Link>

          {/* Minimal Editorial Links */}
          <nav className="flex items-center gap-6 sm:gap-10 font-telemetry text-[11px] tracking-widest uppercase font-medium text-black/60">
            <a href="#hero" className="hover:text-black transition-colors hidden sm:inline">
              [ 01 // 3D CORE ]
            </a>
            <a href="#roles" className="hover:text-black transition-colors">
              [ 02 // SECTORS ]
            </a>
            <Link
              href="/users/knowledge"
              className="flex items-center gap-1.5 hover:text-black transition-colors"
            >
              <BookOpen size={13} className="text-[#16A34A]" />
              <span className="hidden sm:inline">Guide</span>
            </Link>
            <a
              href="#roles"
              className="bg-[#111312] text-white px-4 py-2 rounded-full font-bold flex items-center gap-1.5 hover:bg-black/85 transition-all text-[11px]"
            >
              <span>ACCESS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </nav>
        </header>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── HERO VIEWPORT: FUTURISTIC CODED 3D MONOLITH + TYPOGRAPHY ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="relative min-h-[760px] sm:min-h-[860px] md:min-h-[920px] w-full flex items-center justify-center px-4 sm:px-10 py-10 overflow-hidden select-none"
        >
          {/* ── GIANT EDITORIAL TYPOGRAPHY: CHARGING ── */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-6 pointer-events-none z-0"
            style={{
              transform: `translateY(calc(-50% - ${textParallax}px))`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <span className="font-editorial text-[18vw] font-black tracking-tighter text-white/80 leading-none select-none drop-shadow-sm">
              CHAR
            </span>
            <span className="font-editorial text-[18vw] font-black tracking-tighter text-white/80 leading-none select-none drop-shadow-sm">
              GING
            </span>
          </div>

          {/* ── Top-Left Editorial Manifest Callout ── */}
          <div className="absolute top-8 left-6 sm:left-12 z-20 space-y-2 max-w-[220px] sm:max-w-sm pointer-events-none">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/70 backdrop-blur-md border border-black/[0.06] text-[10px] font-telemetry tracking-widest text-[#111312] uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYNCHRONIZED MESH // V2G
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-black tracking-tight text-[#111312] leading-[1.05]">
              Architectural Power.
            </h1>
            <p className="font-cyber text-xs sm:text-sm text-black/60 leading-relaxed pt-1">
              Interactive 800V silicon-carbide inverter core with procedural 3D exploded assembly on scroll.
            </p>
          </div>

          {/* ── Top-Right Sci-Fi Telemetry Badges ── */}
          <div className="absolute top-8 right-6 sm:right-12 z-20 hidden md:flex flex-col items-end space-y-2 font-telemetry text-[11px] pointer-events-none">
            <div className="flex items-center gap-2 text-black/70 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-black/[0.06]">
              <Cpu className="w-3.5 h-3.5 text-[#00a896]" />
              <span>ALGORITHMIC LOAD BALANCING</span>
            </div>
            <div className="flex items-center gap-2 text-black/70 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-black/[0.06]">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>SUB-MILLISECOND PEAK SHAVING</span>
            </div>
          </div>

          {/* ── Central Interactive Coded 3D WebGL Monolith Canvas ── */}
          <div className="relative z-10 w-full max-w-4xl flex items-center justify-center">
            <FuturisticCyberMonolith scrollProgress={scrollProgress} />
          </div>

          {/* ── Bottom-Right Editorial Spec Ribbon ── */}
          <div className="absolute bottom-12 right-6 sm:right-12 z-20 max-w-[240px] sm:max-w-xs text-right space-y-1.5 pointer-events-none">
            <p className="font-cyber text-xs sm:text-sm text-black/70 leading-relaxed">
              Scroll down to disassemble the chassis and reveal the internal quantum reactor conduit.
            </p>
            <div className="font-telemetry text-[10px] tracking-widest text-black/40 uppercase">
              350KW DC // ISO 15118 PLUG & CHARGE
            </div>
          </div>

          {/* ── Bottom Notch with Animated Scroll Cue (Matching Reference) ── */}
          <div className="absolute bottom-0 inset-x-0 flex justify-center z-30 pointer-events-none">
            <div className="w-32 h-10 bg-[#D1D6D9] rounded-t-full flex items-center justify-center shadow-inner">
              <a
                href="#roles"
                aria-label="Scroll down to sectors"
                className="pointer-events-auto p-2 text-black/50 hover:text-black transition-colors"
              >
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── SECTION 2: THE 3 USERS (RESTORED EXACTLY AS BEFORE) ──────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="roles"
          className="relative px-6 sm:px-10 md:px-14 py-24 border-t border-black/[0.06] bg-white/50 backdrop-blur-lg"
        >
          <div className="max-w-6xl mx-auto space-y-14">
            
            {/* Title Section with Striking Editorial Typography */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[11px] font-telemetry tracking-widest uppercase text-black/60">
                <Layers className="w-3.5 h-3.5 text-black" />
                <span>SELECT INFRASTRUCTURE DOMAIN</span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1d1d1f]">
                Welcome to EVverse
              </h2>
              <p className="font-cyber text-sm sm:text-base text-[#86868b] leading-relaxed">
                Select your role to access tailored infrastructure planning, deployment insights, and optimization tools.
              </p>
            </div>

            {/* Three Distinct Role Cards (Preserved with Authentic Photography) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              
              {/* ── CARD 1: INVESTOR ─────────────────────────── */}
              <Link href="/investor" className="no-underline group">
                <div
                  onMouseEnter={() => setHoveredCard(1)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`h-full flex flex-col bg-white rounded-[24px] overflow-hidden border border-black/[0.08] transition-all duration-300 cursor-pointer ${
                    hoveredCard === 1
                      ? 'shadow-[0_24px_48px_rgba(0,0,0,0.12)] -translate-y-2'
                      : 'shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <div className="relative w-full h-[230px] overflow-hidden bg-[#f5f5f7]">
                    <Image
                      src="/images/card-investor.png"
                      alt="EV Charging Infrastructure Investment Modeling"
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className={`object-cover transition-transform duration-500 ${
                        hoveredCard === 1 ? 'scale-105' : 'scale-100'
                      }`}
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full font-telemetry text-[10px] text-white tracking-widest uppercase">
                      ROLE // 01
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-editorial text-[23px] font-bold text-[#1d1d1f] tracking-tight">
                        Investor
                      </h3>
                      <ArrowUpRight
                        size={20}
                        className={`transition-all duration-200 ${
                          hoveredCard === 1
                            ? 'text-[#0071e3] translate-x-1 -translate-y-1'
                            : 'text-[#86868b]'
                        }`}
                      />
                    </div>
                    <p className="font-cyber text-sm leading-relaxed text-[#6e6e73] m-0">
                      Identify high-demand areas, plan strategic deployments, and analyze ROI scenarios.
                    </p>
                  </div>
                </div>
              </Link>

              {/* ── CARD 2: EV STATION OWNERS ───────────────────────── */}
              <Link href="/station-owners" className="no-underline group">
                <div
                  onMouseEnter={() => setHoveredCard(2)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`h-full flex flex-col bg-white rounded-[24px] overflow-hidden border border-black/[0.08] transition-all duration-300 cursor-pointer ${
                    hoveredCard === 2
                      ? 'shadow-[0_24px_48px_rgba(0,0,0,0.12)] -translate-y-2'
                      : 'shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <div className="relative w-full h-[230px] overflow-hidden bg-[#f5f5f7]">
                    <Image
                      src="/images/card-station-owners.png"
                      alt="Real-World Commercial EV Charging Plaza"
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className={`object-cover transition-transform duration-500 ${
                        hoveredCard === 2 ? 'scale-105' : 'scale-100'
                      }`}
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full font-telemetry text-[10px] text-white tracking-widest uppercase">
                      ROLE // 02
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-editorial text-[23px] font-bold text-[#1d1d1f] tracking-tight">
                        EV Station Owners
                      </h3>
                      <ArrowUpRight
                        size={20}
                        className={`transition-all duration-200 ${
                          hoveredCard === 2
                            ? 'text-[#0071e3] translate-x-1 -translate-y-1'
                            : 'text-[#86868b]'
                        }`}
                      />
                    </div>
                    <p className="font-cyber text-sm leading-relaxed text-[#6e6e73] m-0">
                      Manage charging hubs, monitor charger utilization, optimize tariffs, and track grid power uptime.
                    </p>
                  </div>
                </div>
              </Link>

              {/* ── CARD 3: EV USERS ─────────────────────────── */}
              <Link href="/users/stations" className="no-underline group">
                <div
                  onMouseEnter={() => setHoveredCard(3)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`h-full flex flex-col bg-white rounded-[24px] overflow-hidden border border-black/[0.08] transition-all duration-300 cursor-pointer ${
                    hoveredCard === 3
                      ? 'shadow-[0_24px_48px_rgba(0,0,0,0.12)] -translate-y-2'
                      : 'shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <div className="relative w-full h-[230px] overflow-hidden bg-[#f5f5f7]">
                    <Image
                      src="/images/card-users.png"
                      alt="EV Users Vehicle and Fast Charger"
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className={`object-cover transition-transform duration-500 ${
                        hoveredCard === 3 ? 'scale-105' : 'scale-100'
                      }`}
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full font-telemetry text-[10px] text-white tracking-widest uppercase">
                      ROLE // 03
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-editorial text-[23px] font-bold text-[#1d1d1f] tracking-tight">
                        EV Users
                      </h3>
                      <ArrowUpRight
                        size={20}
                        className={`transition-all duration-200 ${
                          hoveredCard === 3
                            ? 'text-[#0071e3] translate-x-1 -translate-y-1'
                            : 'text-[#86868b]'
                        }`}
                      />
                    </div>
                    <p className="font-cyber text-sm leading-relaxed text-[#6e6e73] m-0">
                      Discover charging stations and plan seamless journeys across the network.
                    </p>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer className="border-t border-black/[0.06] px-6 sm:px-12 py-8 flex flex-col sm:flex-row justify-between items-center text-xs font-telemetry text-[#86868b] gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>EVverse // QuantEV Mobility System © 2026</span>
          </div>
          <div className="tracking-wider uppercase">
            Decision Intelligence for EV Infrastructure
          </div>
        </footer>

      </div>
    </div>
  );
}
