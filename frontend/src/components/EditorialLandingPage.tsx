'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  ArrowRight,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';

export function EditorialLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeRole, setActiveRole] = useState<'user' | 'owner' | 'investor'>('user');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Subtle 3D parallax tilt
  const tiltX = mousePos.y * -6;
  const tiltY = mousePos.x * 10;
  const heroParallax = Math.min(scrollY * 0.2, 100);
  const textParallax = Math.min(scrollY * 0.1, 60);

  return (
    <div className="min-h-screen bg-[#D8DCDE] p-2 sm:p-4 md:p-6 text-[#111312] selection:bg-[#111312] selection:text-white font-sans antialiased">
      {/* ── Main Editorial Outer Frame (Matching Reference) ── */}
      <div className="relative w-full max-w-[1400px] mx-auto rounded-[36px] sm:rounded-[44px] md:rounded-[52px] bg-gradient-to-b from-[#E7EAEB] via-[#DEE1E3] to-[#D3D7D9] shadow-[0_30px_90px_rgba(0,0,0,0.12)] border border-white/70 overflow-hidden flex flex-col">
        
        {/* ── Top Header: Minimal Glyph & Navigation ── */}
        <header className="relative z-40 w-full px-6 sm:px-12 py-6 sm:py-8 flex items-center justify-between border-b border-black/[0.04]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#111312] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#111312]">
              QuantEV
            </span>
          </Link>

          {/* Minimal Text Links */}
          <nav className="flex items-center gap-6 sm:gap-10 text-xs tracking-wider uppercase font-medium text-black/60">
            <a href="#hero" className="hover:text-black transition-colors">
              Home
            </a>
            <a href="#roles" className="hover:text-black transition-colors">
              Platform
            </a>
            <a href="#intelligence" className="hover:text-black transition-colors hidden sm:inline">
              AI Engine
            </a>
            <Link
              href="/users/stations"
              className="text-black font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <span>Launch</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </header>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── HERO VIEWPORT: GIANT CHARGING + 3D MONOLITH ─────────────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative min-h-[740px] sm:min-h-[820px] md:min-h-[880px] w-full flex items-center justify-center px-6 sm:px-12 py-10 overflow-hidden select-none"
        >
          {/* ── GIANT TYPOGRAPHY: CHARGING ── */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-8 pointer-events-none z-0"
            style={{
              transform: `translateY(calc(-50% - ${textParallax}px))`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <span className="text-[17vw] font-black tracking-tighter text-white/85 leading-none select-none drop-shadow-xs">
              CHAR
            </span>
            <span className="text-[17vw] font-black tracking-tighter text-white/85 leading-none select-none drop-shadow-xs">
              GING
            </span>
          </div>

          {/* ── Top-Left Callout ── */}
          <div className="absolute top-10 left-6 sm:left-12 z-20 space-y-1 max-w-[200px] sm:max-w-xs">
            <span className="text-xs font-mono uppercase tracking-widest text-black/45 block">
              Fast and Secure
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111312]">
              Next-Gen Power
            </h1>
            <p className="text-xs text-black/55 pt-1">
              Guaranteed charging spots. Zero wait time.
            </p>
          </div>

          {/* ── Central 3D Monolith Render ── */}
          <div
            className="relative z-10 w-full max-w-[380px] sm:max-w-[460px] md:max-w-[500px] flex items-center justify-center transition-transform duration-200 ease-out"
            style={{
              transform: `translateY(${heroParallax}px) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            }}
          >
            <div className="relative w-full aspect-[4/5] drop-shadow-[0_45px_70px_rgba(0,0,0,0.18)]">
              <Image
                src="/images/editorial-monolith-hero.jpg"
                alt="QuantEV 3D Charger Monolith"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>

            {/* Spec Pointer Dot and Leader Line */}
            <div className="absolute -left-6 sm:left-0 bottom-16 z-20 hidden sm:flex items-center gap-3">
              <div className="relative flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111312]" />
                <div className="w-14 h-px bg-black/30" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#111312]">SK Signet Ultra</p>
                <p className="text-[10px] text-black/50 font-mono">
                  Output 350kW DC • Dual Outlet
                </p>
              </div>
            </div>
          </div>

          {/* ── Bottom-Right Manifesto Text ── */}
          <div className="absolute bottom-12 right-6 sm:right-12 z-20 max-w-[220px] sm:max-w-xs text-right space-y-2">
            <p className="text-xs sm:text-sm text-black/65 leading-relaxed">
              Be part of the transformation in electric vehicles via intelligent network planning for public fast-charging stations.
            </p>
            <p className="text-[11px] font-mono text-black/40">
              800V ARCHITECTURE • ISO 15118
            </p>
          </div>

          {/* ── Bottom Notch with Scroll Arrow (Matching Reference) ── */}
          <div className="absolute bottom-0 inset-x-0 flex justify-center z-30 pointer-events-none">
            <div className="w-32 h-9 bg-[#D8DCDE] rounded-t-full flex items-center justify-center shadow-inner">
              <a
                href="#roles"
                aria-label="Scroll to user roles"
                className="pointer-events-auto p-1.5 text-black/40 hover:text-black transition-colors"
              >
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── SECTION 2: THE 3 USERS (NO BOXES, PURE EDITORIAL) ───────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="roles"
          className="relative px-6 sm:px-12 md:px-16 py-20 sm:py-24 border-t border-black/[0.05]"
        >
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Editorial Heading */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-black/40 block">
                The Ecosystem
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111312]">
                Tailored for Three Stakeholders
              </h2>
            </div>

            {/* 3 User Sections — Clean, Horizontal, Box-Free Typography */}
            <div className="space-y-16 divide-y divide-black/[0.08]">
              
              {/* 01: EV USER */}
              <div className="pt-12 first:pt-0 flex flex-col md:flex-row md:items-start justify-between gap-8 group">
                <div className="space-y-2 md:w-1/3">
                  <span className="text-xs font-mono font-bold text-emerald-600 block">
                    01 / DRIVER
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#111312] group-hover:translate-x-1 transition-transform">
                    EV User
                  </h3>
                  <p className="text-xs text-black/50 font-mono">
                    Zero wait time • Pre-booked spots
                  </p>
                </div>

                <div className="md:w-1/2 space-y-4">
                  <p className="text-sm sm:text-base text-black/70 leading-relaxed font-normal">
                    Pair your electric vehicle in seconds. QuantEV matches your plug type, monitors real-world battery range, plans long-distance highway routes, and lets you reserve a charging spot ahead of time with a 4-digit PIN so a stall is always open for you.
                  </p>
                  <div>
                    <Link
                      href="/users/stations"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#111312] hover:text-black group/link pt-1"
                    >
                      <span>Enter as EV User</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 02: CHARGING STATION OWNER */}
              <div className="pt-12 flex flex-col md:flex-row md:items-start justify-between gap-8 group">
                <div className="space-y-2 md:w-1/3">
                  <span className="text-xs font-mono font-bold text-[#111312] block">
                    02 / OPERATOR
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#111312] group-hover:translate-x-1 transition-transform">
                    Station Owner
                  </h3>
                  <p className="text-xs text-black/50 font-mono">
                    Mobile command • Daily revenue
                  </p>
                </div>

                <div className="md:w-1/2 space-y-4">
                  <p className="text-sm sm:text-base text-black/70 leading-relaxed font-normal">
                    Your entire station business in your pocket. Track real-time earnings from charging energy and parking spot holds, adjust electricity rates on the fly, see live power draw across installed chargers, and view regional demand signals to know when to add more bays.
                  </p>
                  <div>
                    <Link
                      href="/station-owners"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#111312] hover:text-black group/link pt-1"
                    >
                      <span>Enter as Station Owner</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 03: INVESTOR */}
              <div className="pt-12 flex flex-col md:flex-row md:items-start justify-between gap-8 group">
                <div className="space-y-2 md:w-1/3">
                  <span className="text-xs font-mono font-bold text-sky-600 block">
                    03 / CAPITAL
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#111312] group-hover:translate-x-1 transition-transform">
                    Investor
                  </h3>
                  <p className="text-xs text-black/50 font-mono">
                    AI placement • CapEx payback
                  </p>
                </div>

                <div className="md:w-1/2 space-y-4">
                  <p className="text-sm sm:text-base text-black/70 leading-relaxed font-normal">
                    High-conviction site selection backed by evolutionary AI. Eliminate charger cannibalization and grid transformer overloads, model CapEx payback curves in seconds, and identify high-demand charging deserts with heavy electric vehicle traffic before competitors.
                  </p>
                  <div>
                    <Link
                      href="/investor"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#111312] hover:text-black group/link pt-1"
                    >
                      <span>Enter as Investor</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── SECTION 3: THE AI MODELS (CLEAN TYPOGRAPHIC HIGHLIGHTS) ──── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="intelligence"
          className="relative px-6 sm:px-12 md:px-16 py-20 border-t border-black/[0.06] bg-[#111312] text-white"
        >
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C8F369] block font-bold">
                Artificial Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Powered by Dual Optimization Models
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-2">
              <div className="space-y-3">
                <span className="text-xs font-mono text-emerald-400 font-bold block">
                  DEMAND FORECASTING
                </span>
                <h3 className="text-xl font-bold text-white">Random Forest Model</h3>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-normal">
                  Learns city-wide commute patterns and vehicle movement to anticipate charging demand before queues form, preventing local transformer overloads.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono text-[#C8F369] font-bold block">
                  NETWORK PLACEMENT
                </span>
                <h3 className="text-xl font-bold text-white">Genetic Algorithm</h3>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-normal">
                  Bio-inspired evolutionary solver that tests millions of candidate location combinations, mutating network layouts to discover the ideal placements with zero station overlap.
                </p>
              </div>
            </div>

            {/* Clean Key Numbers — No Heavy Boxes, Just Minimal Dividers */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 text-center">
              <div>
                <span className="text-2xl sm:text-4xl font-bold text-[#C8F369] font-mono block">
                  2.4s
                </span>
                <span className="text-[11px] text-white/50 mt-1 block">
                  Combinatorial Solve Speed
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-4xl font-bold text-white font-mono block">
                  +38%
                </span>
                <span className="text-[11px] text-white/50 mt-1 block">
                  Corridor Demand Captured
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-4xl font-bold text-emerald-400 font-mono block">
                  99.8%
                </span>
                <span className="text-[11px] text-white/50 mt-1 block">
                  Grid Feeder Stability
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-6 sm:px-12 py-10 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-black/50 font-mono gap-4">
          <span>QuantEV Mobility System © 2026</span>
          <div className="flex items-center gap-6">
            <Link href="/users/stations" className="hover:text-black">EV User</Link>
            <Link href="/station-owners" className="hover:text-black">Station Owner</Link>
            <Link href="/investor" className="hover:text-black">Investor</Link>
          </div>
        </footer>

      </div>
    </div>
  );
}
