'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap, Users } from 'lucide-react';
import { HyperrealisticChargingCable3D } from './HyperrealisticChargingCable3D';

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
    zoneTag: 'PHASE 01',
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
    zoneTag: 'PHASE 02',
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
    zoneTag: 'PHASE 03',
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
    zoneTag: 'PHASE 04',
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
  const journeyArenaRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [orbPosition, setOrbPosition] = useState<{
    mode: 'top' | 'fixed' | 'bottom';
    fixedLeft: number;
    fixedTop: number;
    absTop: number;
    absLeftPct: number;
    tiltAngle: number;
  }>({
    mode: 'top',
    fixedLeft: 0,
    fixedTop: 0,
    absTop: 40,
    absLeftPct: 75,
    tiltAngle: 0,
  });

  useEffect(() => {
    let animationFrameId: number;

    const updatePosition = () => {
      if (!journeyArenaRef.current) return;
      const arenaRect = journeyArenaRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Target eye-level Y on viewport (centered vertically)
      const targetEyeY = windowHeight * 0.45;

      // Calculate progress through the journey arena
      const totalScrollDistance = arenaRect.height - 180;
      const currentScrollDistance = targetEyeY - arenaRect.top;
      const rawProgress = Math.min(
        Math.max(currentScrollDistance / Math.max(totalScrollDistance, 1), 0),
        1
      );
      setScrollProgress(rawProgress);

      const arenaWidth = arenaRect.width;

      // Exact center of the opposite column (so it NEVER overlaps text)
      const columnCenterOffset = Math.min(Math.max(arenaWidth * 0.25, 120), 280);

      // Smooth cosine zigzag:
      // at progress = 0: cos(0) = +1 -> Right Column (opposite Step 1 text on Left)
      // at progress = 0.33: cos(pi) = -1 -> Left Column (opposite Step 2 text on Right)
      // at progress = 0.66: cos(2pi) = +1 -> Right Column (opposite Step 3 text on Left)
      // at progress = 1.0: cos(3pi) = -1 -> Left Column (opposite Step 4 text on Right)
      const currentXOffset = Math.cos(rawProgress * Math.PI * 3) * columnCenterOffset;

      // Kinetic tilt as the heavy cable handle sways across
      const tiltAngle = Math.sin(rawProgress * Math.PI * 3) * -12;

      // Arena horizontal center in viewport coordinates
      const arenaCenterViewportX = arenaRect.left + arenaWidth / 2;

      if (arenaRect.top > targetEyeY) {
        // Above arena -> dock neatly at top of right column
        setOrbPosition({
          mode: 'top',
          fixedLeft: arenaCenterViewportX + columnCenterOffset,
          fixedTop: targetEyeY,
          absTop: 40,
          absLeftPct: 75,
          tiltAngle: 0,
        });
      } else if (arenaRect.bottom < targetEyeY + 100) {
        // Below arena -> dock neatly at bottom of left column
        setOrbPosition({
          mode: 'bottom',
          fixedLeft: arenaCenterViewportX - columnCenterOffset,
          fixedTop: targetEyeY,
          absTop: arenaRect.height - 140,
          absLeftPct: 25,
          tiltAngle: 0,
        });
      } else {
        // Active fixed traveling cable handle
        setOrbPosition({
          mode: 'fixed',
          fixedLeft: arenaCenterViewportX + currentXOffset,
          fixedTop: targetEyeY,
          absTop: 0,
          absLeftPct: 50,
          tiltAngle,
        });
      }
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    updatePosition();

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Compute active stage (0 to 3)
  const activeStage = Math.min(
    Math.floor(scrollProgress * STAGES.length),
    STAGES.length - 1
  );
  const currentStageData = STAGES[activeStage];
  const progressPercent = Math.round(scrollProgress * 100);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative px-6 sm:px-12 md:px-16 py-16 sm:py-20 border-t border-black/[0.05] bg-gradient-to-b from-transparent via-white/20 to-transparent"
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Section Header (Editorial, Jargon-Free) ── */}
        <div className="max-w-3xl space-y-3 mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-black/60 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>How EVverse Works & How It Helps Us All</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#111312] leading-[1.12]">
            Clean energy should be effortless, reliable, and shared by everyone.
          </h2>
          <p className="text-sm sm:text-base text-black/65 font-light leading-relaxed pt-1">
            Here is how EVverse transforms public charging from a guessing game into a reliable community utility that protects our electrical grid and powers our local economy.
          </p>
        </div>

        {/* ── Interactive Zigzag Journey Arena ── */}
        <div ref={journeyArenaRef} className="relative">

          {/* ── HYPERREALISTIC CHARGING CABLE SPINE (Snakes down through the stages) ── */}
          <div className="absolute inset-0 pointer-events-none hidden md:flex items-center justify-center overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 1200"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Layer 1: Ambient Drop Shadow for Cable Depth */}
              <path
                d="M 600 120 C 600 300, 200 320, 200 480 C 200 660, 600 680, 600 840 C 600 1020, 200 1040, 200 1150"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="20"
                strokeLinecap="round"
                className="blur-sm"
              />

              {/* Layer 2: Main Heavy High-Voltage Rubber Cable Body */}
              <path
                d="M 600 120 C 600 300, 200 320, 200 480 C 200 660, 600 680, 600 840 C 600 1020, 200 1040, 200 1150"
                stroke="#1A1C1B"
                strokeWidth="11"
                strokeLinecap="round"
              />

              {/* Layer 3: Cable Specular Highlight Ridge (3D Rubber Sheen) */}
              <path
                d="M 600 120 C 600 300, 200 320, 200 480 C 200 660, 600 680, 600 840 C 600 1020, 200 1040, 200 1150"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Layer 4: Animated Internal Cyan High-Power Photon Pulse */}
              <path
                d="M 600 120 C 600 300, 200 320, 200 480 C 200 660, 600 680, 600 840 C 600 1020, 200 1040, 200 1150"
                stroke="#00E5FF"
                strokeWidth="2.5"
                strokeDasharray="16 32"
                strokeDashoffset={-scrollProgress * 240}
                strokeLinecap="round"
                strokeOpacity="0.8"
                className="transition-all duration-75"
              />
            </svg>
          </div>

          {/* ── THE HYPERREALISTIC CHARGING CABLE HANDLE GUN (Glides smoothly along the path) ── */}
          <div
            className={`hidden md:block z-30 pointer-events-none transition-opacity duration-300 ${
              orbPosition.mode === 'fixed'
                ? 'fixed'
                : 'absolute'
            }`}
            style={
              orbPosition.mode === 'fixed'
                ? {
                    left: `${orbPosition.fixedLeft}px`,
                    top: `${orbPosition.fixedTop}px`,
                    transform: `translate(-50%, -50%) rotate(${orbPosition.tiltAngle}deg)`,
                  }
                : {
                    top: `${orbPosition.absTop}px`,
                    left: `${orbPosition.absLeftPct}%`,
                    transform: `translate(-50%, -50%) rotate(${orbPosition.tiltAngle}deg)`,
                  }
            }
          >
            <div className="pointer-events-auto">
              <HyperrealisticChargingCable3D
                stageNumber={currentStageData.zoneTag}
                stageName={currentStageData.zoneSub}
                scrollProgress={scrollProgress}
                isEvenStage={activeStage % 2 === 0}
              />
            </div>
          </div>

          {/* ── FOUR ALTERNATING STAGES (Tighter Spacing, No Overlap) ── */}
          <div className="space-y-20 sm:space-y-28 pt-2 pb-10">
            {STAGES.map((stage, index) => {
              const isEven = index % 2 === 0;
              const isStageActive = activeStage === index;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.number}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center transition-opacity duration-400 ${
                    isStageActive ? 'opacity-100' : 'opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* TEXT CONTENT: Placed on Left for Even stages, on Right for Odd stages */}
                  <div
                    className={`space-y-4 max-w-lg ${
                      isEven ? 'md:col-start-1 md:col-end-2 md:pr-4' : 'md:col-start-2 md:col-end-3 md:pl-4'
                    }`}
                  >
                    {/* Number and Badge */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl font-mono font-light tracking-tighter text-[#111312]">
                        {stage.number}
                      </span>
                      <div className="h-5 w-px bg-black/15" />
                      <span className="text-[10.5px] font-mono uppercase tracking-widest font-bold text-black/70">
                        {stage.badge}
                      </span>
                    </div>

                    {/* Stage Headline */}
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-normal tracking-tight text-[#111312] leading-snug">
                      {stage.title}
                    </h3>

                    {/* How It Works */}
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-mono uppercase tracking-widest text-black/45 font-bold block">
                        How EVverse Works
                      </span>
                      <p className="text-xs sm:text-sm text-black/75 leading-relaxed font-light">
                        {stage.howItWorks}
                      </p>
                    </div>

                    {/* Community Benefit */}
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-mono uppercase tracking-widest text-[#16A34A] font-bold block">
                        Benefit to the Entire Community
                      </span>
                      <p className="text-xs sm:text-sm text-[#111312] leading-relaxed font-normal">
                        {stage.communityBenefit}
                      </p>
                    </div>

                    {/* Impact Line */}
                    <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-black/85">
                      <ArrowRight className="w-3.5 h-3.5 text-black shrink-0" />
                      <span>{stage.impactMetric}</span>
                    </div>

                    {/* Mobile-Only Compact Connector Badge */}
                    <div className="flex md:hidden items-center gap-2 pt-2">
                      <div className="w-6 h-6 rounded-full bg-[#111312] text-[#00E5FF] flex items-center justify-center">
                        <Zap className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-black/60 uppercase">
                        {stage.zoneTag} • {stage.zoneSub}
                      </span>
                    </div>

                  </div>

                  {/* EMPTY OPPOSITE COLUMN (Reserved strictly for the traveling Cable Handle) */}
                  <div
                    className={`hidden md:block min-h-[160px] ${
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
