'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { AbstractEditorialTimeline } from '@/components/AbstractEditorialTimeline';

export function EditorialLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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

  // 3D parallax tilt values & camera push transitions
  const tiltX = mousePos.y * -6;
  const tiltY = mousePos.x * 10;
  
  // Dynamic camera depth and smooth scroll handover
  const heroProgress = Math.min(Math.max(scrollY / 650, 0), 1);
  const heroParallax = Math.min(scrollY * 0.22, 120);
  const monolithScale = 1 - heroProgress * 0.08;
  const monolithOpacity = Math.max(0.65, 1 - heroProgress * 0.4);
  const textParallax = scrollY * 0.16;
  const chargingTextScale = 1 + heroProgress * 0.06;
  const chargingTextOpacity = Math.max(0.18, 0.85 - heroProgress * 0.7);
  const leaderLineOpacity = Math.max(0, 1 - scrollY / 180);
  const energyBeamHeight = Math.min(Math.max((scrollY - 50) * 0.7, 0), 150);

  return (
    <div className="min-h-screen bg-[#D8DCDE] p-2 sm:p-4 md:p-6 text-[#111312] selection:bg-[#111312] selection:text-white font-sans antialiased">
      {/* ── Main Editorial Outer Frame (Matching Reference) ── */}
      <div className="relative w-full max-w-[1400px] mx-auto rounded-[36px] sm:rounded-[44px] md:rounded-[52px] bg-gradient-to-b from-[#E7EAEB] via-[#DEE1E3] to-[#D3D7D9] shadow-[0_30px_90px_rgba(0,0,0,0.12)] border border-white/70 overflow-hidden flex flex-col">
        
        {/* ── Top Header: Minimal Glyph & Navigation ── */}
        <header className="relative z-40 w-full px-6 sm:px-12 py-6 sm:py-8 flex items-center justify-between border-b border-black/[0.04]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/images/evverse-logo.png"
                alt="EVverse Logo"
                width={40}
                height={40}
                priority
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-xl font-extrabold tracking-tight text-[#111312]">
                  EV
                </span>
                <span className="text-xl font-serif italic text-black/80 ml-0.5">
                  verse
                </span>
              </div>
              <span className="text-[9px] tracking-widest uppercase text-black/45 font-mono leading-none">
                Decision Intelligence
              </span>
            </div>
          </Link>

          {/* Minimal Links */}
          <nav className="flex items-center gap-6 sm:gap-8 text-xs tracking-wider uppercase font-medium text-black/60">
            <a href="#hero" className="hover:text-black transition-colors">
              Home
            </a>
            <a href="#how-it-works" className="hover:text-black transition-colors">
              How It Works
            </a>
            <a href="#roles" className="hover:text-black transition-colors">
              Roles
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
              className="text-black font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </nav>
        </header>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── HERO VIEWPORT: GIANT CHARGING + 3D MONOLITH ─────────────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative min-h-[720px] sm:min-h-[800px] md:min-h-[860px] w-full flex items-center justify-center px-6 sm:px-12 py-10 overflow-hidden select-none"
        >
          {/* ── GIANT TYPOGRAPHY: CHARGING with 3D Depth Dispersal ── */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-8 pointer-events-none z-0 transition-transform duration-100 ease-out"
            style={{
              transform: `translateY(calc(-50% - ${textParallax}px)) scale(${chargingTextScale})`,
              opacity: chargingTextOpacity,
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
          <div
            className="absolute top-10 left-6 sm:left-12 z-20 space-y-1 max-w-[200px] sm:max-w-xs transition-opacity duration-200"
            style={{ opacity: Math.max(0.2, 1 - scrollY / 260) }}
          >
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

          {/* ── Central 3D Monolith Render with Mouse Parallax Tilt & Scroll Handover ── */}
          <div
            className="relative z-10 w-full max-w-[380px] sm:max-w-[460px] md:max-w-[500px] flex items-center justify-center transition-all duration-200 ease-out"
            style={{
              transform: `translateY(${heroParallax}px) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${monolithScale})`,
              opacity: monolithOpacity,
            }}
          >
            <div className="relative w-full aspect-[4/5] drop-shadow-[0_45px_70px_rgba(0,0,0,0.18)]">
              <Image
                src="/images/editorial-monolith-hero.jpg"
                alt="EVverse 3D Charger Monolith"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>

            {/* Spec Pointer Dot and Leader Line (Fades smoothly on scroll) */}
            <div
              className="absolute -left-6 sm:left-0 bottom-16 z-20 hidden sm:flex items-center gap-3 transition-opacity duration-200"
              style={{ opacity: leaderLineOpacity }}
            >
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
          <div
            className="absolute bottom-12 right-6 sm:right-12 z-20 max-w-[220px] sm:max-w-xs text-right space-y-2 transition-opacity duration-200"
            style={{ opacity: Math.max(0.2, 1 - scrollY / 260) }}
          >
            <p className="text-xs sm:text-sm text-black/65 leading-relaxed">
              Be part of the transformation in electric vehicles via intelligent network planning for public fast-charging stations.
            </p>
            <p className="text-[11px] font-mono text-black/40">
              800V ARCHITECTURE • ISO 15118
            </p>
          </div>

          {/* ── Seamless Energy Conduit Beam (Flows downwards through notch into timeline) ── */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-px pointer-events-none transition-all duration-150 ease-out z-20"
            style={{
              height: `${energyBeamHeight}px`,
              background: 'linear-gradient(to bottom, rgba(200,243,105,0.95), rgba(17,19,18,0.4), transparent)',
              boxShadow: '0 0 14px rgba(200,243,105,0.6)',
            }}
          />

          {/* ── Bottom Notch with Scroll Arrow & Seamless Energy Handover ── */}
          <div className="absolute bottom-0 inset-x-0 flex justify-center z-30 pointer-events-none">
            <div className="relative w-36 h-10 bg-[#D8DCDE] rounded-t-full flex items-center justify-center shadow-inner overflow-hidden">
              {/* Luminous Energy Fill */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle at 50% 100%, rgba(200,243,105,0.45) 0%, transparent 70%)',
                  opacity: Math.min(scrollY / 100, 1),
                }}
              />
              <a
                href="#how-it-works"
                aria-label="Scroll down to how it works"
                className="pointer-events-auto p-2 text-black/50 hover:text-black transition-all flex flex-col items-center gap-0.5 group"
              >
                <span className="text-[8px] font-mono uppercase tracking-widest text-black/45 font-bold group-hover:text-black transition-colors">
                  EXPLORE
                </span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce text-black/70 group-hover:text-black transition-colors" />
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── SECTION 2: ABSTRACT SCROLL TIMELINE (HOW IT WORKS) ──────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <AbstractEditorialTimeline />

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── SECTION 3: THE 3 USERS (EXACTLY AS IT WAS BEFORE) ───────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="roles"
          className="relative px-6 sm:px-10 md:px-14 py-20 border-t border-black/[0.05] bg-white/40 backdrop-blur-md"
        >
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Title Section */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
                Welcome to EVverse
              </h2>
              <p className="text-sm sm:text-base text-[#86868b] leading-relaxed">
                Select your role to access tailored infrastructure planning, deployment insights, and optimization tools.
              </p>
            </div>

            {/* Three Distinct Role Cards (Preserved Exactly as Before) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 w-full">
              
              {/* ── CARD 1: INVESTOR ─────────────────────────── */}
              <Link href="/investor" className="no-underline group">
                <div
                  onMouseEnter={() => setHoveredCard(1)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`h-full flex flex-col bg-white rounded-[22px] overflow-hidden border border-black/[0.08] transition-all duration-300 cursor-pointer ${
                    hoveredCard === 1
                      ? 'shadow-[0_20px_40px_rgba(0,0,0,0.1)] -translate-y-1.5'
                      : 'shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <div className="relative w-full h-[220px] overflow-hidden bg-[#f5f5f7]">
                    <Image
                      src="/images/card-investor.png"
                      alt="EV Charging Infrastructure Investment Modeling"
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className={`object-cover transition-transform duration-500 ${
                        hoveredCard === 1 ? 'scale-105' : 'scale-100'
                      }`}
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
                        Investor
                      </h3>
                      <ArrowUpRight
                        size={18}
                        className={`transition-all duration-200 ${
                          hoveredCard === 1
                            ? 'text-[#0071e3] translate-x-0.5 -translate-y-0.5'
                            : 'text-[#86868b]'
                        }`}
                      />
                    </div>
                    <p className="text-sm leading-relaxed text-[#6e6e73] m-0">
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
                  className={`h-full flex flex-col bg-white rounded-[22px] overflow-hidden border border-black/[0.08] transition-all duration-300 cursor-pointer ${
                    hoveredCard === 2
                      ? 'shadow-[0_20px_40px_rgba(0,0,0,0.1)] -translate-y-1.5'
                      : 'shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <div className="relative w-full h-[220px] overflow-hidden bg-[#f5f5f7]">
                    <Image
                      src="/images/card-station-owners.png"
                      alt="Real-World Commercial EV Charging Plaza"
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className={`object-cover transition-transform duration-500 ${
                        hoveredCard === 2 ? 'scale-105' : 'scale-100'
                      }`}
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
                        EV Station Owners
                      </h3>
                      <ArrowUpRight
                        size={18}
                        className={`transition-all duration-200 ${
                          hoveredCard === 2
                            ? 'text-[#0071e3] translate-x-0.5 -translate-y-0.5'
                            : 'text-[#86868b]'
                        }`}
                      />
                    </div>
                    <p className="text-sm leading-relaxed text-[#6e6e73] m-0">
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
                  className={`h-full flex flex-col bg-white rounded-[22px] overflow-hidden border border-black/[0.08] transition-all duration-300 cursor-pointer ${
                    hoveredCard === 3
                      ? 'shadow-[0_20px_40px_rgba(0,0,0,0.1)] -translate-y-1.5'
                      : 'shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <div className="relative w-full h-[220px] overflow-hidden bg-[#f5f5f7]">
                    <Image
                      src="/images/card-users.png"
                      alt="EV Users Vehicle and Fast Charger"
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className={`object-cover transition-transform duration-500 ${
                        hoveredCard === 3 ? 'scale-105' : 'scale-100'
                      }`}
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
                        EV Users
                      </h3>
                      <ArrowUpRight
                        size={18}
                        className={`transition-all duration-200 ${
                          hoveredCard === 3
                            ? 'text-[#0071e3] translate-x-0.5 -translate-y-0.5'
                            : 'text-[#86868b]'
                        }`}
                      />
                    </div>
                    <p className="text-sm leading-relaxed text-[#6e6e73] m-0">
                      Discover charging stations and plan seamless journeys across the network.
                    </p>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer className="border-t border-black/[0.06] px-6 sm:px-12 py-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#86868b] gap-2">
          <div>EVverse</div>
          <div>Decision Intelligence for EV Infrastructure</div>
        </footer>

      </div>
    </div>
  );
}
