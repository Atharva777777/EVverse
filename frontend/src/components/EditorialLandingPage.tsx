'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ShieldCheck,
  Activity,
  Layers,
  TrendingUp,
  Cpu,
  Clock,
  Car,
  Building2,
  DollarSign,
  Compass,
  Sparkles,
  CheckCircle2,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export function EditorialLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activePillar, setActivePillar] = useState<0 | 1 | 2>(0);
  const [activeModel, setActiveModel] = useState<'ultra' | 'dual' | 'wall'>('ultra');
  const [simVehicleKw, setSimVehicleKw] = useState(150);
  const [simBatteryKwh, setSimBatteryKwh] = useState(60);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse move for subtle 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Calculated charge time
  const chargeMinutes = Math.round((simBatteryKwh / (simVehicleKw * 0.85)) * 60);

  // Parallax calculations
  const heroParallax = Math.min(scrollY * 0.25, 120);
  const textParallax = Math.min(scrollY * 0.15, 80);
  const rotateTiltX = mousePos.y * -8;
  const rotateTiltY = mousePos.x * 12;

  return (
    <div className="min-h-screen bg-[#D8DCDE] p-2 sm:p-4 md:p-6 text-[#111312] selection:bg-[#111312] selection:text-white font-sans antialiased">
      {/* ── Outer Editorial Canvas Frame (Matching Reference Image) ── */}
      <div className="relative w-full max-w-[1440px] mx-auto rounded-[36px] sm:rounded-[44px] md:rounded-[52px] bg-gradient-to-b from-[#E7EAEB] via-[#DFE2E4] to-[#D4D8DA] shadow-[0_30px_90px_rgba(0,0,0,0.12)] border border-white/60 overflow-hidden flex flex-col">
        
        {/* ── Top Minimal Editorial Navigation Bar ── */}
        <header className="relative z-40 w-full px-6 sm:px-10 py-5 sm:py-7 flex items-center justify-between border-b border-black/[0.04]">
          {/* Left: Lightning Glyph & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#111312] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#111312] leading-none">
                QuantEV
              </span>
              <span className="text-[10px] tracking-widest uppercase text-black/40 font-mono mt-0.5">
                Mobility OS
              </span>
            </div>
          </Link>

          {/* Center: Live Architecture Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-black/[0.06] text-xs font-mono font-medium text-black/70 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI + QUANTUM PLATFORM</span>
            <span className="text-black/30">•</span>
            <span className="text-[#111312] font-semibold">800V ARCHITECTURE</span>
          </div>

          {/* Right: Editorial Links */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-xs tracking-wider uppercase font-medium text-black/70">
            <a href="#hero" className="hover:text-black transition-colors hidden sm:inline">
              Overview
            </a>
            <a href="#ecosystem" className="hover:text-black transition-colors hidden sm:inline">
              Pillars
            </a>
            <a href="#intelligence" className="hover:text-black transition-colors hidden md:inline">
              AI Engine
            </a>
            <a href="#hardware" className="hover:text-black transition-colors hidden md:inline">
              Hardware
            </a>

            {/* Launch App Pill */}
            <Link
              href="/users/stations"
              className="px-4 py-2 rounded-full bg-[#111312] text-white hover:bg-black font-semibold text-xs tracking-normal normal-case shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>Launch Driver App</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C8F369]" />
            </Link>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── HERO STAGE: 3D MONOLITH + GIANT "CHARGING" TYPOGRAPHY ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative min-h-[720px] sm:min-h-[780px] md:min-h-[860px] w-full flex items-center justify-center px-6 sm:px-12 py-10 overflow-hidden select-none"
        >
          {/* Subtle Ambient Background Radial Glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-200/25 to-emerald-200/20 blur-3xl" />
          </div>

          {/* ── GIANT TYPOGRAPHY: "CHARGING" ── */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-6 pointer-events-none z-0"
            style={{
              transform: `translateY(calc(-50% - ${textParallax}px))`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <span className="text-[16vw] font-black tracking-tighter text-white/90 leading-none select-none drop-shadow-sm font-sans">
              CHAR
            </span>
            <span className="text-[16vw] font-black tracking-tighter text-white/90 leading-none select-none drop-shadow-sm font-sans">
              GING
            </span>
          </div>

          {/* ── TOP-LEFT EDITORIAL CALLOUT ── */}
          <div className="absolute top-10 left-6 sm:left-12 z-20 max-w-[200px] sm:max-w-xs space-y-1">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-black/50 block">
              Fast and Secure
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111312]">
              Next-Gen Infrastructure
            </h2>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-black/60 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Zero Wait Stalls</span>
            </div>
          </div>

          {/* ── CENTRAL 3D CHARGER MONOLITH WITH MOUSE PARALLAX TILT ── */}
          <div
            className="relative z-10 w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] flex items-center justify-center transition-transform duration-200 ease-out"
            style={{
              transform: `translateY(${heroParallax}px) perspective(1000px) rotateX(${rotateTiltX}deg) rotateY(${rotateTiltY}deg)`,
            }}
          >
            {/* The Photorealistic 3D Monolith Render Asset */}
            <div className="relative w-full aspect-[4/5] drop-shadow-[0_45px_60px_rgba(0,0,0,0.18)]">
              <Image
                src="/images/editorial-monolith-hero.jpg"
                alt="QuantEV Ultra Monolith Charger"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 540px"
              />

              {/* Glowing Interactive Live 72% Indicator Badge Overlay */}
              <div className="absolute top-[28%] left-[22%] sm:left-[24%] z-20 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-400/40 text-cyan-300 font-mono text-[10px] sm:text-xs flex items-center gap-1.5 shadow-lg animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>350 kW ACTIVE</span>
              </div>
            </div>

            {/* ── EDITORIAL LEADER LINE & SPEC POINTER ── */}
            <div className="absolute -left-4 sm:left-2 bottom-20 z-20 hidden sm:flex items-center gap-3">
              <div className="relative flex items-center">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-[#111312] shadow-sm animate-ping absolute" />
                <div className="w-3 h-3 rounded-full bg-[#111312] shadow-sm relative" />
                <div className="w-16 h-px bg-black/30" />
              </div>
              <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-black/[0.08] shadow-sm text-left max-w-[190px]">
                <p className="text-xs font-bold text-[#111312]">QuantEV Ultra-DC</p>
                <p className="text-[10px] text-black/50 font-mono mt-0.5 leading-tight">
                  Output 350kW DC
                  <br />
                  Dual CCS2 Liquid-Cooled
                </p>
              </div>
            </div>
          </div>

          {/* ── BOTTOM-RIGHT EDITORIAL MANIFESTO TEXT ── */}
          <div className="absolute bottom-10 right-6 sm:right-12 z-20 max-w-[240px] sm:max-w-xs text-right space-y-2">
            <p className="text-xs sm:text-sm text-black/70 leading-relaxed font-normal">
              Be part of the transformation in electric vehicles via intelligent network planning, instant driver reservations, and optimal grid stability.
            </p>
            <div className="flex items-center justify-end gap-2 text-[11px] font-mono text-black/50">
              <span>99.8% NETWORK UPTIME</span>
              <span className="w-1 h-1 rounded-full bg-black/30" />
              <span>ISO 15118</span>
            </div>
          </div>

          {/* ── BOTTOM NOTCH / INVERTED CURVED TAB (Awwwards Style Notch) ── */}
          <div className="absolute bottom-0 inset-x-0 flex justify-center z-30 pointer-events-none">
            <div className="relative w-36 h-10 bg-[#D8DCDE] rounded-t-full flex items-center justify-center shadow-inner">
              <a
                href="#ecosystem"
                aria-label="Scroll down to ecosystem"
                className="pointer-events-auto p-2 text-black/50 hover:text-black transition-colors"
              >
                <ChevronDown className="w-5 h-5 animate-bounce" />
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── SECTION 2: THE THREE STAKEHOLDER PILLARS ─────────────────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="ecosystem"
          className="relative px-6 sm:px-12 py-20 border-t border-black/[0.06] bg-white/40 backdrop-blur-md"
        >
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/[0.06]">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-black/40 font-semibold block mb-2">
                  Unified Platform
                </span>
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111312]">
                  One Ecosystem. Three Superpowers.
                </h3>
              </div>
              <p className="text-sm text-black/60 max-w-md leading-relaxed">
                Seamlessly tailored experiences for drivers on the highway, station owners managing hardware, and investors deploying infrastructure capital.
              </p>
            </div>

            {/* Pillar Selector Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 0,
                  tag: '01',
                  role: 'EV Drivers',
                  title: 'Zero Waiting. Pre-Booked Stalls.',
                  desc: 'Pair your EV model, get real-world calibrated range, reserve a charging bay in advance with a 4-digit PIN, and navigate with elevation-aware road trip routing.',
                  action: 'Open Driver App',
                  href: '/users/stations',
                  icon: Car,
                  badge: 'Mobile App Ready',
                  accent: 'bg-emerald-500/10 text-emerald-800 border-emerald-300',
                },
                {
                  id: 1,
                  tag: '02',
                  role: 'Station Owners',
                  title: 'Your Business in Your Pocket.',
                  desc: 'Mobile-first hub to monitor live kilowatt draw, collect fees from charging and parking holds, adjust tariffs dynamically, and trigger instant bank transfers.',
                  action: 'Enter Owner Studio',
                  href: '/station-owners',
                  icon: Building2,
                  badge: 'Mobile Console Ready',
                  accent: 'bg-[#C8F369]/30 text-black border-[#C8F369]',
                },
                {
                  id: 2,
                  tag: '03',
                  role: 'Infrastructure Investors',
                  title: 'AI Site Selection & Payback.',
                  desc: 'Eliminate charger cannibalization with evolutionary genetic algorithms and predict zone demand with Random Forest ML to forecast CapEx payback in seconds.',
                  action: 'Explore Investor Map',
                  href: '/investor',
                  icon: DollarSign,
                  badge: 'Intelligence Suite',
                  accent: 'bg-blue-500/10 text-blue-800 border-blue-300',
                },
              ].map((pillar) => {
                const Icon = pillar.icon;
                const isSelected = activePillar === pillar.id;
                return (
                  <div
                    key={pillar.id}
                    onClick={() => setActivePillar(pillar.id as any)}
                    className={`rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 ${
                      isSelected
                        ? 'bg-white shadow-lg border-black/[0.15] scale-[1.02]'
                        : 'bg-white/60 hover:bg-white/90 border-black/[0.06] hover:shadow-sm'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-black/40">
                          {pillar.tag}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${pillar.accent}`}>
                          {pillar.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#111312] text-white flex items-center justify-center shadow-xs">
                          <Icon className="w-5 h-5 text-[#C8F369]" />
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase tracking-wider text-black/40">
                            {pillar.role}
                          </p>
                          <h4 className="text-base font-bold text-[#111312]">
                            {pillar.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs text-black/60 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>

                    <Link
                      href={pillar.href}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#111312] text-white hover:bg-black text-xs font-bold flex items-center justify-center gap-1.5 group/btn transition-colors"
                    >
                      <span>{pillar.action}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C8F369] group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── SECTION 3: THE DUAL AI ENGINE (RANDOM FOREST + GA) ──────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="intelligence"
          className="relative px-6 sm:px-12 py-20 border-t border-black/[0.06] bg-[#111312] text-white overflow-hidden"
        >
          {/* Subtle Grid Lines Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C8F369_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="max-w-5xl mx-auto space-y-12 relative z-10">
            {/* Title & Tag */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#C8F369] font-bold block mb-2">
                  Decision Intelligence
                </span>
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Evolutionary AI & Demand Forecasting
                </h3>
              </div>
              <p className="text-sm text-white/60 max-w-md leading-relaxed">
                Replacing weeks of manual surveying with predictive Machine Learning and bio-inspired Genetic Algorithms.
              </p>
            </div>

            {/* AI Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Random Forest */}
              <div className="rounded-3xl p-6 bg-white/[0.05] border border-white/10 space-y-4 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    01 / Machine Learning
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                    TAZ Mobility Model
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white">
                  Random Forest Demand Forecasting
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Trained on millions of electric taxi trips and urban commuter rhythms across city zones. Anticipates exact hourly kilowatt spikes before rush-hour queues form, protecting local transformers from overloads.
                </p>

                <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px]">Forecast Precision</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">94.2% R²</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Lead Time</span>
                    <span className="text-base font-bold text-white font-mono">24 Hours Ahead</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Genetic Algorithm */}
              <div className="rounded-3xl p-6 bg-white/[0.05] border border-white/10 space-y-4 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#C8F369] font-bold">
                    02 / Optimization
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                    Combinatorial Solver
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white">
                  Genetic Algorithm Network Placement
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Treats candidate station networks as evolving chromosomes. Automatically mutates, crosses, and selects layouts over generations to discover the mathematically ideal network—maximizing driver coverage while eliminating cannibalization.
                </p>

                <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px]">Compute Reduction</span>
                    <span className="text-base font-bold text-[#C8F369] font-mono">72,000h → 2.4s</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Cannibalization</span>
                    <span className="text-base font-bold text-white font-mono">0% Overlap</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Performance Indicators Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                <span className="text-2xl sm:text-3xl font-bold text-[#C8F369] font-mono block">3.2x</span>
                <span className="text-[11px] text-white/50 mt-1 block">Faster CapEx Payback</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                <span className="text-2xl sm:text-3xl font-bold text-white font-mono block">+38%</span>
                <span className="text-[11px] text-white/50 mt-1 block">Corridor Deficit Captured</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono block">99.8%</span>
                <span className="text-[11px] text-white/50 mt-1 block">Grid Feeder Stability</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                <span className="text-2xl sm:text-3xl font-bold text-sky-400 font-mono block">&lt; 15 min</span>
                <span className="text-[11px] text-white/50 mt-1 block">Highway Dwell Target</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── SECTION 4: HARDWARE LINEUP & INTERACTIVE CHARGE SPEED ─── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          id="hardware"
          className="relative px-6 sm:px-12 py-20 border-t border-black/[0.06] bg-[#ECEFF0]"
        >
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/[0.06]">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-black/40 font-semibold block mb-2">
                  Modular Hardware
                </span>
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111312]">
                  Engineered for Every Dwell Time
                </h3>
              </div>
              <p className="text-sm text-black/60 max-w-md leading-relaxed">
                From high-turnaround 350kW highway dispensers to sleek 22kW destination wall connectors for urban parking facilities.
              </p>
            </div>

            {/* Hardware Showcase Carousel Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  id: 'ultra',
                  name: 'Volt-DC 350 Ultra',
                  speed: '350 kW DC',
                  plug: 'Dual CCS2 Combo',
                  voltage: '800V Architecture',
                  idealFor: 'Highway Corridors',
                  tariff: '₹18.50 / kWh',
                  pillBg: 'linear-gradient(135deg, #CFE7FA 0%, #B2D8F7 100%)',
                },
                {
                  id: 'dual',
                  name: 'Dual Core 120 Fast',
                  speed: '120 kW DC',
                  plug: 'Dual CCS2 Plugs',
                  voltage: '400V - 800V Support',
                  idealFor: 'Commercial Fleet Hubs',
                  tariff: '₹16.00 / kWh',
                  pillBg: 'linear-gradient(135deg, #FFEAA7 0%, #FDCB6E 100%)',
                },
                {
                  id: 'wall',
                  name: 'Wall Connector 22',
                  speed: '22 kW AC',
                  plug: 'Type 2 Mennekes',
                  voltage: '3-Phase 415V',
                  idealFor: 'Destination Parking & Hotels',
                  tariff: '₹12.00 / kWh',
                  pillBg: 'linear-gradient(135deg, #A8E6CF 0%, #DCEDC1 100%)',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveModel(item.id as any);
                    if (item.id === 'ultra') setSimVehicleKw(350);
                    if (item.id === 'dual') setSimVehicleKw(120);
                    if (item.id === 'wall') setSimVehicleKw(22);
                  }}
                  className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    activeModel === item.id
                      ? 'bg-white shadow-md border-black/[0.15] ring-2 ring-black'
                      : 'bg-white/70 hover:bg-white border-black/[0.06]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/[0.04] text-black/60 font-semibold">
                        {item.voltage}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 font-mono">
                        {item.tariff}
                      </span>
                    </div>

                    <div
                      className="w-14 h-7 rounded-full flex items-center justify-center shadow-xs"
                      style={{ background: item.pillBg }}
                    >
                      <div className="w-3 h-3 rounded-full bg-[#111312]" />
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-[#111312]">{item.name}</h4>
                      <p className="text-xs font-mono font-bold text-[#111312] mt-0.5">
                        {item.speed}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-black/[0.05] space-y-1 text-xs text-black/60">
                      <p>Connector: {item.plug}</p>
                      <p>Target: {item.idealFor}</p>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] font-semibold text-black/40 flex items-center gap-1">
                    <span>Click to simulate dwell time</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Dwell Time Simulator */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white border border-black/[0.08] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-left w-full md:w-1/2">
                <span className="text-xs font-mono uppercase tracking-widest text-black/40 font-bold">
                  Interactive Simulator
                </span>
                <h4 className="text-xl font-bold text-[#111312]">
                  Estimated 10% → 80% Dwell Time
                </h4>
                <p className="text-xs text-black/60">
                  Slide your battery size to preview charging speed on the selected hardware.
                </p>

                <div className="pt-3 space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-black/50">EV Battery Pack:</span>
                    <span className="font-bold text-[#111312]">{simBatteryKwh} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={simBatteryKwh}
                    onChange={(e) => setSimBatteryKwh(parseInt(e.target.value))}
                    className="w-full accent-[#111312] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-black/40 font-mono">
                    <span>30 kWh (Compact)</span>
                    <span>100 kWh (Long Range SUV)</span>
                  </div>
                </div>
              </div>

              {/* Dwell Time Result Display */}
              <div className="w-full md:w-auto p-6 rounded-2xl bg-[#111312] text-white text-center md:min-w-[240px] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C8F369] font-bold">
                  Calculated Duration
                </span>
                <div className="text-4xl sm:text-5xl font-bold font-mono text-white">
                  {chargeMinutes} <span className="text-xl font-normal text-white/60">min</span>
                </div>
                <p className="text-[11px] text-white/50">
                  at {simVehicleKw} kW peak intake
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── SECTION 5: CALL TO ACTION & PLATFORM ENTRY ──────────────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <footer className="relative px-6 sm:px-12 py-16 sm:py-20 border-t border-black/[0.06] bg-gradient-to-b from-[#DFE2E4] to-[#CFD3D6] text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-black/40 font-bold">
              Ready to Accelerate
            </span>
            <h3 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111312]">
              Choose Your Gateway
            </h3>
            <p className="text-sm text-black/60 max-w-lg mx-auto leading-relaxed">
              Experience the complete EVverse ecosystem live across driver mobile navigation, station owner management, or institutional investor analytics.
            </p>
          </div>

          {/* Doorways */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/users/stations"
              className="px-6 py-3.5 rounded-2xl bg-[#111312] text-white hover:bg-black font-semibold text-xs tracking-tight shadow-md hover:scale-105 transition-all flex items-center gap-2"
            >
              <Car className="w-4 h-4 text-[#C8F369]" />
              <span>EV Driver Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/station-owners"
              className="px-6 py-3.5 rounded-2xl bg-white text-[#111312] hover:bg-black hover:text-white font-semibold text-xs tracking-tight shadow-md hover:scale-105 transition-all border border-black/[0.08] flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-[#111312]" />
              <span>Station Owner Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/investor"
              className="px-6 py-3.5 rounded-2xl bg-white text-[#111312] hover:bg-black hover:text-white font-semibold text-xs tracking-tight shadow-md hover:scale-105 transition-all border border-black/[0.08] flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4 text-[#111312]" />
              <span>Investor Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-black/40 font-mono gap-2 max-w-5xl mx-auto">
            <span>QuantEV / EVverse Operating System © 2026</span>
            <span>Next.js 16 • Three.js • FastAPI • Monad Testnet</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
