'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap, Users } from 'lucide-react';

interface StageData {
  number: string;
  badge: string;
  zoneCode: string;
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
    zoneCode: 'ZONE 01 // CITIZEN ACCESS',
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
    zoneCode: 'ZONE 02 // ZERO BOTTLENECKS',
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
    zoneCode: 'ZONE 03 // GRID STABILITY',
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
    zoneCode: 'ZONE 04 // LOCAL GROWTH',
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
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Track scroll progress within this specific timeline section
      const totalDist = rect.height - windowHeight * 0.5;
      const currentDist = -rect.top + windowHeight * 0.25;
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

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative px-6 sm:px-12 md:px-16 py-28 sm:py-36 border-t border-black/[0.05] bg-gradient-to-b from-transparent via-white/20 to-transparent overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-24 sm:space-y-36">

        {/* ── Section Header (Clean, Editorial, Zero Cards) ── */}
        <div className="max-w-3xl space-y-4">
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

        {/* ── Zigzag Stages Layout (Text Left / Zone Right, then Zone Left / Text Right) ── */}
        <div className="space-y-32 sm:space-y-44">
          {STAGES.map((stage, index) => {
            const isEven = index % 2 === 0;
            const isStageActive = activeStage === index;
            const Icon = stage.icon;

            // Compute dynamic kinetic values based on scroll
            const localProgress = Math.min(
              Math.max((scrollProgress - index / STAGES.length) * STAGES.length, 0),
              1
            );
            const rotationDeg = (index + 1) * 90 + scrollProgress * 180 * (isEven ? 1 : -1);
            const zigzagOffset = (localProgress - 0.5) * (isEven ? 24 : -24);

            return (
              <div
                key={stage.number}
                className={`relative flex flex-col md:flex-row items-center gap-12 lg:gap-20 transition-all duration-700 ease-out ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                } ${isStageActive ? 'opacity-100' : 'opacity-40 hover:opacity-75'}`}
              >
                {/* ── COLUMN A: Clear, Powerful Community Narrative (No Cards) ── */}
                <div className="w-full md:w-1/2 space-y-6">
                  
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

                  {/* Clear Headline */}
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#111312] leading-snug">
                    {stage.title}
                  </h3>

                  {/* Part 1: How It Works */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-black/45 font-bold block">
                      How EVverse Works
                    </span>
                    <p className="text-sm sm:text-base text-black/75 leading-relaxed font-light">
                      {stage.howItWorks}
                    </p>
                  </div>

                  {/* Part 2: Community Benefit */}
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

                {/* ── COLUMN B: Abstract Kinetic Zone Visual (Zigzags & Moves with Scroll) ── */}
                <div className="w-full md:w-1/2 flex items-center justify-center select-none py-6">
                  <div
                    className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 flex items-center justify-center transition-transform duration-300 ease-out"
                    style={{
                      transform: `translateX(${zigzagOffset}px) scale(${isStageActive ? 1.03 : 0.96})`,
                    }}
                  >
                    {/* Ambient Glow Aura */}
                    <div
                      className="absolute inset-0 rounded-full transition-all duration-700 pointer-events-none"
                      style={{
                        background: isStageActive
                          ? 'radial-gradient(circle at center, rgba(200,243,105,0.25) 0%, rgba(17,19,18,0.04) 65%, transparent 80%)'
                          : 'radial-gradient(circle at center, rgba(17,19,18,0.03) 0%, transparent 70%)',
                      }}
                    />

                    {/* Concentric Kinetic SVG Orbit 1 */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 ease-out"
                      viewBox="0 0 240 240"
                      style={{ transform: `rotate(${rotationDeg}deg)` }}
                    >
                      <circle
                        cx="120"
                        cy="120"
                        r="105"
                        fill="none"
                        stroke="#111312"
                        strokeWidth="1.2"
                        strokeDasharray="4 10"
                        strokeOpacity={isStageActive ? '0.35' : '0.15'}
                      />
                      {/* Orbital Satellite Node */}
                      <circle cx="120" cy="15" r="4.5" fill="#111312" />
                      <circle cx="120" cy="15" r="9" fill="none" stroke="#111312" strokeWidth="1" strokeOpacity="0.25" />
                      {/* Opposite Satellite Node */}
                      <circle cx="120" cy="225" r="3" fill="#111312" fillOpacity="0.6" />
                    </svg>

                    {/* Concentric Kinetic SVG Orbit 2 (Opposite Spin) */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-500 ease-out"
                      viewBox="0 0 240 240"
                      style={{ transform: `rotate(${-rotationDeg * 0.75}deg)` }}
                    >
                      <circle
                        cx="120"
                        cy="120"
                        r="80"
                        fill="none"
                        stroke="#111312"
                        strokeWidth="1.2"
                        strokeDasharray="2 12"
                        strokeOpacity={isStageActive ? '0.45' : '0.2'}
                      />
                      <circle cx="200" cy="120" r="3.5" fill="#111312" />
                    </svg>

                    {/* Dynamic Active Progress Ring */}
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
                        strokeDashoffset={2 * Math.PI * 92 * (1 - (index + 1) / STAGES.length)}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    {/* Central Interactive Zone Core */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 rounded-full bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_20px_45px_rgba(0,0,0,0.08)] w-40 h-40 sm:w-44 sm:h-44 group-hover:scale-105 transition-transform">
                      <div className="w-7 h-7 rounded-full bg-[#111312] text-[#C8F369] flex items-center justify-center mb-1.5 shadow-xs">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-black/50 font-bold">
                        {stage.zoneCode.split(' // ')[0]}
                      </span>
                      <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-[#111312] leading-none my-1">
                        {stage.number}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-black/60 font-semibold">
                        {stage.zoneCode.split(' // ')[1]}
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
