'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Zap, Users, Radio, Cpu } from 'lucide-react';

interface StageData {
  number: string;
  badge: string;
  zoneTag: string;
  title: string;
  howItWorks: string;
  communityBenefit: string;
  impactMetric: string;
  hudStatus: string;
  hudMetricA: { label: string; value: string };
  hudMetricB: { label: string; value: string };
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageData[] = [
  {
    number: '01',
    badge: 'ACCESSIBLE CLEAN ENERGY',
    zoneTag: 'ZONE 01 // CITIZEN ACCESS',
    title: 'Bringing Fast Charging Directly to Real Neighborhoods',
    howItWorks:
      'EVverse maps real daily traffic flows, commuter corridors, and residential habits to pinpoint where electric vehicles actually travel and park.',
    communityBenefit:
      'No more charging deserts. Fast chargers are placed right where families live, work, and grocery shop—making clean electric transportation accessible to every single neighborhood, not just luxury areas.',
    impactMetric: '100% Equal Access · Eliminates regional charging deserts',
    hudStatus: 'MAPPING METRO COMMUTES',
    hudMetricA: { label: 'COVERAGE', value: '100% EQUAL' },
    hudMetricB: { label: 'ENERGY NEED', value: '14,280 kWh' },
    icon: Users,
  },
  {
    number: '02',
    badge: 'ZERO QUEUES & DELAYS',
    zoneTag: 'ZONE 02 // ZERO BOTTLENECKS',
    title: 'Ending Long Charging Lines Before They Ever Form',
    howItWorks:
      'Our smart predictive system anticipates morning rush hours, weekend getaways, and sudden weather shifts days ahead to balance charging demand city-wide.',
    communityBenefit:
      'Drivers pull up to an open, ultra-fast charger with zero waiting. No lost work hours, no missed appointments, and total peace of mind that your family will never be stranded with a dead battery.',
    impactMetric: 'Guaranteed Open Bays · Saves 45+ minutes per charge trip',
    hudStatus: 'PREDICTIVE PEAK SENSING',
    hudMetricA: { label: 'QUEUES', value: '0 DETECTED' },
    hudMetricB: { label: 'SAVED TIME', value: '45+ MIN' },
    icon: Zap,
  },
  {
    number: '03',
    badge: 'COMMUNITY GRID PROTECTION',
    zoneTag: 'ZONE 03 // GRID STABILITY',
    title: 'Protecting City Power and Preventing Blackouts',
    howItWorks:
      'EVverse balances electricity demand intelligently with local substations, guaranteeing high-voltage chargers never overload neighborhood power transformers.',
    communityBenefit:
      'Neighborhood power stays stable and reliable without brownouts or voltage dips. Electricity bills stay low, and our communities breathe fresh, smog-free air every day.',
    impactMetric: 'Zero Transformer Overload · Clean air & protected home power',
    hudStatus: 'GRID FREQUENCY LOCK',
    hudMetricA: { label: 'GRID LOAD', value: '64% SAFE' },
    hudMetricB: { label: 'VOLTAGE', value: '400V STABLE' },
    icon: ShieldCheck,
  },
  {
    number: '04',
    badge: 'SHARED ECONOMIC PROSPERITY',
    zoneTag: 'ZONE 04 // LOCAL GROWTH',
    title: 'Creating Steady Income for Local Businesses and Hosts',
    howItWorks:
      'We connect local property owners, retail hubs, and drivers into one shared system with fair, automated transparent earnings.',
    communityBenefit:
      'Local coffee shops, supermarkets, and mom-and-pop stores gain regular customer foot traffic while drivers charge. The entire community retains wealth locally and creates high-quality green jobs.',
    impactMetric: 'Direct Local Commerce · Sustainable green wealth for communities',
    hudStatus: 'COMMUNITY VALUE SYNC',
    hudMetricA: { label: 'LOCAL COMMERCE', value: '+28% VISITS' },
    hudMetricB: { label: 'CO2 SAVED', value: '180 TONS' },
    icon: Activity,
  },
];

export function AbstractEditorialTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Track progress across the container
      const totalDist = rect.height - windowHeight * 0.7;
      const currentDist = -rect.top;
      const rawProgress = Math.min(Math.max(currentDist / Math.max(totalDist, 1), 0), 1);

      setScrollProgress(rawProgress);

      const computedStage = Math.min(
        Math.floor(rawProgress * STAGES.length),
        STAGES.length - 1
      );
      setActiveStage(computedStage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentStageData = STAGES[activeStage];

  // Dynamic zigzag horizontal translation (sweeping between left and right)
  // At progress 0 (stage 0): target is on the right (+280px)
  // At progress 0.33 (stage 1): target is on the left (-280px)
  // At progress 0.66 (stage 2): target is on the right (+280px)
  // At progress 1.0 (stage 3): target is on the left (-280px)
  const zigzagWave = Math.sin(scrollProgress * Math.PI * 3); // oscillates smoothly
  const horizontalOffset = zigzagWave * 260; // +/- 260px horizontal sweep
  const rotationDeg = scrollProgress * 360 * 1.5;

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative px-6 sm:px-12 md:px-16 py-28 sm:py-36 border-t border-black/[0.05] bg-gradient-to-b from-transparent via-white/20 to-transparent overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-24 sm:space-y-32">

        {/* ── Section Header (Editorial, Zero Cards) ── */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-black/60 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>How EVverse Works & How It Helps Us All</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#111312] leading-[1.08]">
            Clean energy should be effortless, reliable, and shared by everyone.
          </h2>
          <p className="text-base sm:text-xl text-black/65 font-light leading-relaxed pt-2">
            Watch the intelligent EVverse core navigate the city in real time—eliminating queues, balancing neighborhood power, and generating shared wealth for local communities.
          </p>
        </div>

        {/* ── Interactive Workspace with the Single Floating Futuristic Zone Core ── */}
        <div className="relative">

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── SINGLE FUTURISTIC ZONE ENTITY (GLIDES ZIGZAG WITH SCROLL) ── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block sticky top-28 z-30 pointer-events-none mb-[-360px]">
            <div className="flex justify-center w-full">
              <div
                className="transition-transform duration-500 ease-out pointer-events-auto"
                style={{
                  transform: `translateX(${horizontalOffset}px)`,
                }}
              >
                {/* ── High-Tech Futuristic Holographic HUD Module ── */}
                <div className="relative w-80 rounded-3xl p-5 bg-[#0A0D10]/95 backdrop-blur-2xl border border-cyan-400/35 shadow-[0_20px_60px_rgba(0,242,254,0.2),0_0_0_1px_rgba(255,255,255,0.06)] text-white overflow-hidden group">
                  
                  {/* Subtle Glowing Corner Cyber-Brackets */}
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400" />

                  {/* Top HUD Status Row */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                      </span>
                      <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-bold">
                        {currentStageData.zoneTag}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                      LIVE HUD
                    </span>
                  </div>

                  {/* Central Kinetic Hologram Reactor Core */}
                  <div className="relative w-full h-44 flex items-center justify-center my-1">
                    
                    {/* Ambient Neon Nebula Aura */}
                    <div className="absolute inset-0 rounded-full bg-radial from-cyan-500/20 via-emerald-400/10 to-transparent blur-md" />

                    {/* Outer Gyro Ring */}
                    <div
                      className="absolute w-40 h-40 rounded-full border border-cyan-400/30 border-dashed transition-transform duration-200"
                      style={{ transform: `rotate(${rotationDeg}deg)` }}
                    />

                    {/* Inner Counter-Rotating Ring */}
                    <div
                      className="absolute w-32 h-32 rounded-full border border-emerald-400/40 border-dotted transition-transform duration-300"
                      style={{ transform: `rotate(${-rotationDeg * 1.4}deg)` }}
                    />

                    {/* Scanning Radar Needle */}
                    <div
                      className="absolute w-36 h-36 rounded-full flex items-center justify-center pointer-events-none"
                      style={{ transform: `rotate(${rotationDeg * 2}deg)` }}
                    >
                      <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-cyan-400 shadow-[0_0_8px_#00F2FE]" />
                    </div>

                    {/* Center Core HUD Shield */}
                    <div className="relative z-10 w-24 h-24 rounded-2xl bg-black/80 border border-white/20 shadow-inner flex flex-col items-center justify-center text-center p-2 backdrop-blur-md">
                      <Cpu className="w-4 h-4 text-cyan-400 mb-0.5 animate-pulse" />
                      <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest">
                        PHASE
                      </span>
                      <span className="text-2xl font-mono font-bold text-white tracking-tight leading-none">
                        {currentStageData.number}
                      </span>
                      <span className="text-[8px] font-mono text-[#C8F369] tracking-wider mt-0.5">
                        AUTONOMOUS
                      </span>
                    </div>

                  </div>

                  {/* Real-Time Telemetry Bar (Changes with Active Stage) */}
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-white/45">
                        OPERATION
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#C8F369] tracking-wide">
                        {currentStageData.hudStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <span className="text-[8px] font-mono uppercase text-white/40 block">
                          {currentStageData.hudMetricA.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-white block mt-0.5">
                          {currentStageData.hudMetricA.value}
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <span className="text-[8px] font-mono uppercase text-white/40 block">
                          {currentStageData.hudMetricB.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-300 block mt-0.5">
                          {currentStageData.hudMetricB.value}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Micro Footer Indicator */}
                  <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-white/35">
                    <span className="flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-cyan-400" />
                      <span>SYS.NODE // ORBITAL</span>
                    </span>
                    <span>STAGE {activeStage + 1} OF 4</span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── 4 ALTERNATING STAGES (ZIGZAG LAYOUT, ZERO CARDS) ───────── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-40 sm:space-y-52 pt-8">
            {STAGES.map((stage, index) => {
              const isEven = index % 2 === 0;
              const isActive = activeStage === index;

              return (
                <div
                  key={stage.number}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-700 ease-out ${
                    isActive ? 'opacity-100' : 'opacity-35 hover:opacity-70'
                  }`}
                >
                  {/* Narrative Block (Occupies Left or Right Column in Zigzag Flow) */}
                  <div
                    className={`space-y-6 lg:col-span-6 ${
                      isEven ? 'lg:col-start-1' : 'lg:col-start-7'
                    }`}
                  >
                    
                    {/* Stage Number & Badge */}
                    <div className="flex items-center gap-4">
                      <span className="text-4xl sm:text-6xl font-mono font-light tracking-tighter text-[#111312]">
                        {stage.number}
                      </span>
                      <div className="h-6 w-px bg-black/15" />
                      <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-black/70">
                        {stage.badge}
                      </span>
                    </div>

                    {/* Main Headline */}
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#111312] leading-snug">
                      {stage.title}
                    </h3>

                    {/* Part 1: How EVverse Works */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-black/45 font-bold block">
                        How EVverse Works
                      </span>
                      <p className="text-sm sm:text-base text-black/75 leading-relaxed font-light">
                        {stage.howItWorks}
                      </p>
                    </div>

                    {/* Part 2: Benefit to the Entire Community */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#16A34A] font-bold block">
                        Benefit to the Entire Community
                      </span>
                      <p className="text-sm sm:text-base text-[#111312] leading-relaxed font-normal">
                        {stage.communityBenefit}
                      </p>
                    </div>

                    {/* Impact Highlight */}
                    <div className="pt-2 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-black/85">
                      <ArrowRight className="w-4 h-4 text-black shrink-0" />
                      <span>{stage.impactMetric}</span>
                    </div>

                  </div>

                  {/* Empty channel placeholder on opposite side on desktop where the floating HUD hovers */}
                  <div
                    className={`hidden lg:block lg:col-span-6 ${
                      isEven ? 'lg:col-start-7' : 'lg:col-start-1'
                    }`}
                    aria-hidden="true"
                  />

                  {/* Mobile Compact HUD View (Shown only on small screens where sticky horizontal travel is disabled) */}
                  <div className="block lg:hidden pt-4">
                    <div className="p-4 rounded-2xl bg-[#0A0D10] text-white space-y-2 border border-cyan-400/30">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-cyan-300 font-bold">{stage.zoneTag}</span>
                        <span className="text-[#C8F369]">{stage.hudStatus}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-white/10">
                        <span>{stage.hudMetricA.label}: <strong className="text-white">{stage.hudMetricA.value}</strong></span>
                        <span>{stage.hudMetricB.label}: <strong className="text-cyan-300">{stage.hudMetricB.value}</strong></span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
