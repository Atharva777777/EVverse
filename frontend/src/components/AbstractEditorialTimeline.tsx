'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface TimelineStep {
  number: string;
  tag: string;
  title: string;
  description: string;
  highlight: string;
  coordinates: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    number: '01',
    tag: 'URBAN PULSE',
    title: "Reading the City's Rhythm",
    description:
      'We observe real-world traffic patterns, commuter habits, and local electrical grids to understand where electric vehicles travel, pause, and need power most.',
    highlight: 'Real-time metropolitan traffic & grid telemetry',
    coordinates: 'ZONE 01 // TELEMETRY',
  },
  {
    number: '02',
    tag: 'PREDICTIVE FORECASTING',
    title: 'Anticipating Demand Before Queues Form',
    description:
      'Smart prediction engines calculate future charging demand hours and seasons ahead, uncovering high-need charging deserts before driver lines ever start forming.',
    highlight: 'Proactive neighborhood demand anticipation',
    coordinates: 'ZONE 02 // INFERENCE',
  },
  {
    number: '03',
    tag: 'LOCATION SYNTHESIS',
    title: 'Pinpointing the Perfect Coordinates',
    description:
      'Our solvers simulate millions of layout combinations to choose the ideal locations—maximizing driver convenience while preventing grid strain and station overlap.',
    highlight: 'Zero cannibalization & balanced power distribution',
    coordinates: 'ZONE 03 // OPTIMIZATION',
  },
  {
    number: '04',
    tag: 'CONNECTED ECOSYSTEM',
    title: 'Empowering Everyone in the Network',
    description:
      'Drivers enjoy effortless charging with zero wait times, station owners maximize daily utilization and revenue, and investors deploy capital with total certainty.',
    highlight: 'Seamless harmony for drivers, owners & investors',
    coordinates: 'ZONE 04 // ECOSYSTEM',
  },
];

export function AbstractEditorialTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Compute progress through the container
      const totalDist = rect.height - windowHeight * 0.4;
      const currentDist = -rect.top + windowHeight * 0.3;
      const rawProgress = Math.min(Math.max(currentDist / totalDist, 0), 1);
      
      setScrollProgress(rawProgress);

      // Determine active step based on progress
      const stepIndex = Math.min(
        Math.floor(rawProgress * TIMELINE_STEPS.length),
        TIMELINE_STEPS.length - 1
      );
      setActiveStep(stepIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Geometry calculations for abstract kinetic orbital
  const rotationAngle = scrollProgress * 360;
  const pulseScale = 1 + Math.sin(scrollProgress * Math.PI * 4) * 0.08;
  const progressPercent = Math.round(scrollProgress * 100);

  const scrollToStep = (idx: number) => {
    if (!containerRef.current) return;
    const stepElements = containerRef.current.querySelectorAll('[data-timeline-step]');
    if (stepElements[idx]) {
      stepElements[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative px-6 sm:px-12 md:px-16 py-24 sm:py-32 border-t border-black/[0.05] bg-gradient-to-b from-transparent via-white/30 to-transparent"
    >
      <div className="max-w-6xl mx-auto">
        
        {/* ── Section Header (No Cards, Pure Clean Editorial Typography) ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 sm:mb-24 pb-8 border-b border-black/[0.06]">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-black/50 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>How EVverse Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#111312]">
              From Raw City Movement to Guaranteed Energy.
            </h2>
          </div>
          
          <p className="text-sm sm:text-base text-black/60 max-w-sm leading-relaxed font-light">
            An intelligent pipeline designed to eliminate charging anxiety, balance the electrical grid, and turn every EV journey into a seamless experience.
          </p>
        </div>

        {/* ── Main Layout: Abstract Kinetic Timeline Dial + Pure Typography Steps ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ── LEFT COLUMN: Abstract Orbital Kinetic Dial (Sticky on Desktop) ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 z-20 flex flex-col items-center select-none py-4">
            
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center">
              
              {/* Outer Ambient Glow Aura */}
              <div
                className="absolute inset-0 rounded-full transition-all duration-700 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, rgba(17,19,18,0.06) 0%, rgba(200,243,105,${0.1 + scrollProgress * 0.15}) 60%, transparent 80%)`,
                  transform: `scale(${pulseScale})`,
                }}
              />

              {/* Kinetic Orbital Ring 1: Continuous SVG Dashed Orbit */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-200 ease-out"
                viewBox="0 0 200 200"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke="#111312"
                  strokeWidth="1"
                  strokeDasharray="4 8"
                  strokeOpacity="0.25"
                />
                {/* Orbital Waypoint Node 1 */}
                <circle cx="100" cy="12" r="3.5" fill="#111312" />
                <circle cx="100" cy="12" r="7" fill="none" stroke="#111312" strokeWidth="0.8" strokeOpacity="0.3" />

                {/* Orbital Waypoint Node 2 (Opposite) */}
                <circle cx="100" cy="188" r="2.5" fill="#111312" fillOpacity="0.6" />
              </svg>

              {/* Kinetic Orbital Ring 2: Counter-Rotating Ring */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 ease-out"
                viewBox="0 0 200 200"
                style={{ transform: `rotate(${-rotationAngle * 0.6}deg)` }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="66"
                  fill="none"
                  stroke="#111312"
                  strokeWidth="1.2"
                  strokeDasharray="2 12"
                  strokeOpacity="0.35"
                />
                <circle cx="166" cy="100" r="3" fill="#111312" />
              </svg>

              {/* Progress Arc Track */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="78"
                  fill="none"
                  stroke="#111312"
                  strokeWidth="2.5"
                  strokeOpacity="0.08"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="78"
                  fill="none"
                  stroke="#111312"
                  strokeWidth="2.5"
                  strokeDasharray={2 * Math.PI * 78}
                  strokeDashoffset={2 * Math.PI * 78 * (1 - scrollProgress)}
                  strokeLinecap="round"
                  className="transition-all duration-150 ease-out"
                />
              </svg>

              {/* Central Core Display */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_15px_35px_rgba(0,0,0,0.06)] w-36 h-36 sm:w-40 sm:h-40">
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/45 font-bold">
                  PHASE
                </span>
                <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-[#111312] my-0.5">
                  {TIMELINE_STEPS[activeStep].number}
                </span>
                <span className="text-[10px] font-mono text-black/55 uppercase tracking-wider">
                  {progressPercent}% COMPLETE
                </span>
              </div>
            </div>

            {/* Micro Metadata Indicator Below Dial */}
            <div className="mt-6 flex flex-col items-center text-center space-y-1">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#111312] uppercase">
                {TIMELINE_STEPS[activeStep].coordinates}
              </span>
              <p className="text-xs text-black/50 font-light max-w-[220px]">
                Scroll continuously to step through the system lifecycle
              </p>
            </div>

            {/* Quick Interactive Phase Selectors (Minimal Horizontal Dots) */}
            <div className="flex items-center gap-2.5 mt-5">
              {TIMELINE_STEPS.map((step, idx) => (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => scrollToStep(idx)}
                  className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                    activeStep === idx
                      ? 'w-7 h-2 bg-[#111312]'
                      : 'w-2 h-2 bg-black/20 hover:bg-black/40'
                  }`}
                  aria-label={`Jump to stage ${step.number}`}
                />
              ))}
            </div>

          </div>

          {/* ── RIGHT COLUMN: Editorial Fluid Step Narrative (No Cards, Pure Flow) ── */}
          <div className="lg:col-span-7 space-y-24 sm:space-y-32 py-6">
            {TIMELINE_STEPS.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={step.number}
                  data-timeline-step={index}
                  className={`group relative transition-all duration-500 ease-out ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-40 hover:opacity-75 translate-x-1 sm:translate-x-2'
                  }`}
                >
                  {/* Subtle Abstract Left Accent Pulse (Not a generic ruler line) */}
                  <div className="flex items-start gap-6 sm:gap-8">
                    
                    {/* Big Abstract Stage Number */}
                    <div className="shrink-0 select-none">
                      <span
                        className={`text-4xl sm:text-6xl md:text-7xl font-mono font-light tracking-tighter transition-colors duration-300 ${
                          isActive ? 'text-[#111312] font-semibold' : 'text-black/20'
                        }`}
                      >
                        {step.number}
                      </span>
                    </div>

                    {/* Step Content */}
                    <div className="space-y-3.5 flex-1 pt-1 sm:pt-2">
                      
                      {/* Abstract Tag & Sub-badge */}
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[11px] font-mono font-bold tracking-widest uppercase transition-colors duration-300 ${
                            isActive ? 'text-black' : 'text-black/40'
                          }`}
                        >
                          {step.tag}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-black/30" />
                        <span className="text-[10px] font-mono text-black/45 tracking-wider">
                          STAGE {index + 1} OF 4
                        </span>
                      </div>

                      {/* Main Step Headline */}
                      <h3
                        className={`text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight leading-snug transition-colors duration-300 ${
                          isActive ? 'text-[#111312]' : 'text-black/50'
                        }`}
                      >
                        {step.title}
                      </h3>

                      {/* Clear, Human, Jargon-Free Explanation */}
                      <p className="text-base sm:text-lg text-black/70 leading-relaxed font-light max-w-xl">
                        {step.description}
                      </p>

                      {/* Detail Highlight Line */}
                      <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-black/80">
                        <ArrowRight className="w-3.5 h-3.5 text-black shrink-0" />
                        <span>{step.highlight}</span>
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
