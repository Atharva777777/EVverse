'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap, Users } from 'lucide-react';

interface StageData {
  number: string;
  badge: string;
  zoneTag: string;
  zoneSub: string;
  title: string;
  howItWorks: string;
  communityBenefit: string;
  impactMetric: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageData[] = [
  {
    number: '01',
    badge: 'ACCESSIBLE CLEAN ENERGY',
    zoneTag: 'ZONE 01',
    zoneSub: 'CITIZEN ACCESS',
    title: 'Bringing Fast Charging Directly to Real Neighborhoods',
    howItWorks:
      'EVverse maps real daily traffic flows, commuter corridors, and residential habits to pinpoint where electric vehicles actually travel and park.',
    communityBenefit:
      'No more charging deserts. Fast chargers are placed right where families live, work, and grocery shop—making clean electric transportation accessible to every single neighborhood, not just luxury areas.',
    impactMetric: '100% Equal Access · Eliminates regional charging deserts',
    icon: Users,
  },
  {
    number: '02',
    badge: 'ZERO QUEUES & DELAYS',
    zoneTag: 'ZONE 02',
    zoneSub: 'ZERO BOTTLENECKS',
    title: 'Ending Long Charging Lines Before They Ever Form',
    howItWorks:
      'Our smart predictive system anticipates morning rush hours, weekend getaways, and sudden weather shifts days ahead to balance charging demand city-wide.',
    communityBenefit:
      'Drivers pull up to an open, ultra-fast charger with zero waiting. No lost work hours, no missed appointments, and total peace of mind that your family will never be stranded with a dead battery.',
    impactMetric: 'Guaranteed Open Bays · Saves 45+ minutes per charge trip',
    icon: Zap,
  },
  {
    number: '03',
    badge: 'COMMUNITY GRID PROTECTION',
    zoneTag: 'ZONE 03',
    zoneSub: 'GRID STABILITY',
    title: 'Protecting City Power and Preventing Blackouts',
    howItWorks:
      'EVverse balances electricity demand intelligently with local substations, guaranteeing high-voltage chargers never overload neighborhood power transformers.',
    communityBenefit:
      'Neighborhood power stays stable and reliable without brownouts or voltage dips. Electricity bills stay low, and our communities breathe fresh, smog-free air every day.',
    impactMetric: 'Zero Transformer Overload · Clean air & protected home power',
    icon: ShieldCheck,
  },
  {
    number: '04',
    badge: 'SHARED ECONOMIC PROSPERITY',
    zoneTag: 'ZONE 04',
    zoneSub: 'LOCAL GROWTH',
    title: 'Creating Steady Income for Local Businesses and Hosts',
    howItWorks:
      'We connect local property owners, retail hubs, and drivers into one shared system with fair, automated transparent earnings.',
    communityBenefit:
      'Local coffee shops, supermarkets, and mom-and-pop stores gain regular customer foot traffic while drivers charge. The entire community retains wealth locally and creates high-quality green jobs.',
    impactMetric: 'Direct Local Commerce · Sustainable green wealth for communities',
    icon: CheckCircle2,
  },
];

export function AbstractEditorialTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [containerWidth, setContainerWidth] = useState(1000);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Scroll progress tracking across the whole timeline
      const totalScrollable = rect.height - windowHeight * 0.7;
      const currentScroll = -rect.top + windowHeight * 0.15;
      const rawProgress = Math.min(Math.max(currentScroll / Math.max(totalScrollable, 1), 0), 1);

      setScrollProgress(rawProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Compute active stage (0 to 3)
  const activeStage = Math.min(
    Math.floor(scrollProgress * STAGES.length),
    STAGES.length - 1
  );
  const currentStageData = STAGES[activeStage];
  const CurrentIcon = currentStageData.icon;

  // Single zone entity zigzag motion calculations:
  // Starts on the RIGHT at Step 1 (progress 0)
  // Glides to the LEFT at Step 2 (progress ~0.33)
  // Glides to the RIGHT at Step 3 (progress ~0.66)
  // Glides to the LEFT at Step 4 (progress 1.0)
  const maxAmplitude = Math.min(Math.max((containerWidth / 2) * 0.52, 70), 280);
  const xOffset = Math.cos(scrollProgress * Math.PI * 3) * maxAmplitude;
  const rotationAngle = scrollProgress * 540;
  const pulseScale = 1 + Math.sin(scrollProgress * Math.PI * 6) * 0.05;
  const progressPercent = Math.round(scrollProgress * 100);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative px-6 sm:px-12 md:px-16 py-28 sm:py-36 border-t border-black/[0.05] bg-gradient-to-b from-transparent via-white/25 to-transparent overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Section Header ── */}
        <div className="max-w-3xl space-y-4 mb-20 sm:mb-28">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-black/60 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>How EVverse Works & How It Helps Us All</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#111312] leading-[1.08]">
            Clean energy should be effortless, reliable, and shared by everyone.
          </h2>
          <p className="text-base sm:text-xl text-black/65 font-light leading-relaxed pt-2">
            Here is how EVverse transforms public charging from a guessing game into a reliable community utility that protects our electrical grid and powers our local economy.
          </p>
        </div>

        {/* ── Interactive Zigzag Journey Arena ── */}
        <div className="relative">

          {/* ── ABSTRACT UNDULATING PATH GUIDE (Subtle visual spine) ── */}
          <div className="absolute inset-0 pointer-events-none hidden md:flex items-center justify-center overflow-hidden opacity-25">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 2000"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M 680 150 C 680 400, 120 450, 120 750 C 120 1050, 680 1100, 680 1400 C 680 1700, 120 1750, 120 1950"
                stroke="#111312"
                strokeWidth="1.5"
                strokeDasharray="6 12"
              />
            </svg>
          </div>

          {/* ── THE SINGLE INTERACTIVE ZONE COMPONENT (Moves Zigzag with Scroll) ── */}
          <div className="sticky top-[26vh] z-30 pointer-events-none flex items-center justify-center h-0">
            <div
              className="pointer-events-auto transition-transform duration-150 ease-out select-none"
              style={{
                transform: `translateX(${xOffset}px) scale(${pulseScale})`,
              }}
            >
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
                
                {/* Dynamic Ambient Volt-Green & Deep Charcoal Glow */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, rgba(200,243,105,0.3) 0%, rgba(17,19,18,0.06) 60%, transparent 80%)`,
                  }}
                />

                {/* Concentric Rotating Outer Kinetic Orbit */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-200 ease-out"
                  viewBox="0 0 240 240"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                >
                  <circle
                    cx="120"
                    cy="120"
                    r="105"
                    fill="none"
                    stroke="#111312"
                    strokeWidth="1.2"
                    strokeDasharray="4 10"
                    strokeOpacity="0.3"
                  />
                  {/* Lead Satellite Waypoint Node */}
                  <circle cx="120" cy="15" r="4.5" fill="#111312" />
                  <circle
                    cx="120"
                    cy="15"
                    r="9"
                    fill="none"
                    stroke="#111312"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />
                  {/* Counter Satellite Node */}
                  <circle cx="120" cy="225" r="3" fill="#111312" fillOpacity="0.5" />
                </svg>

                {/* Concentric Counter-Rotating Orbit */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 ease-out"
                  viewBox="0 0 240 240"
                  style={{ transform: `rotate(${-rotationAngle * 0.7}deg)` }}
                >
                  <circle
                    cx="120"
                    cy="120"
                    r="82"
                    fill="none"
                    stroke="#111312"
                    strokeWidth="1.2"
                    strokeDasharray="2 12"
                    strokeOpacity="0.4"
                  />
                  <circle cx="202" cy="120" r="3.5" fill="#111312" />
                </svg>

                {/* Progress Arc Ring */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none -rotate-90" viewBox="0 0 240 240">
                  <circle
                    cx="120"
                    cy="120"
                    r="92"
                    fill="none"
                    stroke="#111312"
                    strokeWidth="2"
                    strokeOpacity="0.08"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="92"
                    fill="none"
                    stroke="#111312"
                    strokeWidth="2.5"
                    strokeDasharray={2 * Math.PI * 92}
                    strokeDashoffset={2 * Math.PI * 92 * (1 - scrollProgress)}
                    strokeLinecap="round"
                    className="transition-all duration-150 ease-out"
                  />
                </svg>

                {/* Central Kinetic Telemetry Orb */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 rounded-full bg-white/85 backdrop-blur-md border border-white/90 shadow-[0_25px_50px_rgba(0,0,0,0.1)] w-40 h-40 sm:w-44 sm:h-44 transition-all duration-300">
                  <div className="w-8 h-8 rounded-full bg-[#111312] text-[#C8F369] flex items-center justify-center mb-1 shadow-xs">
                    <CurrentIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-black/55 font-bold">
                    {currentStageData.zoneTag}
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-[#111312] leading-none my-1">
                    {currentStageData.number}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-black/70 font-semibold px-2 py-0.5 rounded-full bg-black/[0.04]">
                    {currentStageData.zoneSub}
                  </span>
                  <span className="text-[8px] font-mono text-black/40 mt-1">
                    {progressPercent}% SYNCED
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* ── FOUR ALTERNATING STAGES (One Left, One Right) ── */}
          <div className="space-y-48 sm:space-y-64 pt-8 pb-16">
            {STAGES.map((stage, index) => {
              const isEven = index % 2 === 0;
              const isStageActive = activeStage === index;

              return (
                <div
                  key={stage.number}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-500 ${
                    isStageActive ? 'opacity-100' : 'opacity-35 hover:opacity-70'
                  }`}
                >
                  {/* TEXT CONTENT: Placed on Left for Even stages, on Right for Odd stages */}
                  <div
                    className={`space-y-6 ${
                      isEven ? 'md:col-start-1 md:col-end-2' : 'md:col-start-2 md:col-end-3'
                    }`}
                  >
                    {/* Number and Badge */}
                    <div className="flex items-center gap-4">
                      <span className="text-4xl sm:text-6xl font-mono font-light tracking-tighter text-[#111312]">
                        {stage.number}
                      </span>
                      <div className="h-6 w-px bg-black/15" />
                      <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-black/70">
                        {stage.badge}
                      </span>
                    </div>

                    {/* Stage Headline */}
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#111312] leading-snug">
                      {stage.title}
                    </h3>

                    {/* How It Works */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-black/45 font-bold block">
                        How EVverse Works
                      </span>
                      <p className="text-sm sm:text-base text-black/75 leading-relaxed font-light">
                        {stage.howItWorks}
                      </p>
                    </div>

                    {/* Community Benefit */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#16A34A] font-bold block">
                        Benefit to the Entire Community
                      </span>
                      <p className="text-sm sm:text-base text-[#111312] leading-relaxed font-normal">
                        {stage.communityBenefit}
                      </p>
                    </div>

                    {/* Impact Line */}
                    <div className="pt-2 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-black/85">
                      <ArrowRight className="w-4 h-4 text-black shrink-0" />
                      <span>{stage.impactMetric}</span>
                    </div>
                  </div>

                  {/* EMPTY OPPOSITE COLUMN (Where the single floating Zone travels into) */}
                  <div
                    className={`hidden md:block min-h-[220px] ${
                      isEven ? 'md:col-start-2 md:col-end-3' : 'md:col-start-1 md:col-end-2'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
