'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, ShieldCheck, Flame, Radio } from 'lucide-react';

interface InteractiveChargingCableHandleProps {
  stageNumber: string;
  stageName: string;
  scrollProgress: number; // 0 to 1
  isEvenStage: boolean;
}

export function InteractiveChargingCableHandle({
  stageNumber,
  stageName,
  scrollProgress,
  isEvenStage,
}: InteractiveChargingCableHandleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse 3D perspective tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isEngaged, setIsEngaged] = useState(false);
  const [surgeKey, setSurgeKey] = useState(0);

  // Dynamic telemetry metrics
  const [powerKw, setPowerKw] = useState(348.6);
  const [voltage, setVoltage] = useState(824);
  const [currentAmps, setCurrentAmps] = useState(422);

  // Subtle live telemetry fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setPowerKw(prev => +(345 + Math.random() * 5).toFixed(1));
      setVoltage(prev => Math.round(820 + Math.random() * 8));
      setCurrentAmps(prev => Math.round(418 + Math.random() * 8));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  const handleTriggerClick = () => {
    setIsEngaged(prev => !prev);
    setSurgeKey(k => k + 1);
  };

  // 3D rotation angles
  const rotX = mousePos.y * -20;
  const rotY = mousePos.x * 24;
  const cableTension = Math.sin(scrollProgress * Math.PI * 3) * 15;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleTriggerClick}
      className="relative w-72 h-80 sm:w-80 sm:h-88 flex items-center justify-center cursor-pointer select-none group"
      style={{
        perspective: '1000px',
      }}
      title="Interactive Fast-Charging Connector — Click to Engage Power Surge"
    >
      {/* ── Outer High-Voltage Electric Glow Aura ── */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
          isEngaged
            ? 'opacity-80 scale-110'
            : isHovered
            ? 'opacity-50 scale-105'
            : 'opacity-30 scale-100'
        }`}
        style={{
          background: isEngaged
            ? 'radial-gradient(circle at center, rgba(0, 229, 255, 0.45) 0%, rgba(200, 243, 105, 0.25) 45%, transparent 75%)'
            : 'radial-gradient(circle at center, rgba(0, 229, 255, 0.25) 0%, rgba(17, 19, 18, 0.08) 60%, transparent 75%)',
          filter: 'blur(20px)',
        }}
      />

      {/* ── Electric Surge Shockwave (Triggered on Click) ── */}
      {surgeKey > 0 && (
        <div
          key={surgeKey}
          className="absolute inset-0 rounded-full border-2 border-[#00E5FF] animate-ping pointer-events-none opacity-75"
        />
      )}

      {/* ── 3D PIVOTING CHASSIS ── */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${isHovered ? 1.04 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ── LAYER 1: HEAVY LIQUID-COOLED TETHER CABLE (Snakes from handle) ── */}
        <svg
          className="absolute -top-12 -left-6 w-48 h-56 pointer-events-none overflow-visible z-0"
          viewBox="0 0 200 240"
          fill="none"
        >
          {/* Cable shadow */}
          <path
            d={`M -40 -20 C 10 30, 40 80, 95 125`}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="22"
            strokeLinecap="round"
            className="blur-xs"
          />
          {/* Main thick rubber conduit */}
          <path
            d={`M -40 -20 C 10 30, 40 80, 95 125`}
            stroke="#191B1A"
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Metallic Braided Sheen Highlight */}
          <path
            d={`M -40 -20 C 10 30, 40 80, 95 125`}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Animated Neon Internal Current Pulse */}
          <path
            d={`M -40 -20 C 10 30, 40 80, 95 125`}
            stroke={isEngaged ? '#C8F369' : '#00E5FF'}
            strokeWidth="3"
            strokeDasharray="10 20"
            strokeLinecap="round"
            className="transition-all duration-100"
            style={{
              strokeDashoffset: isEngaged ? -surgeKey * 80 : -scrollProgress * 150,
            }}
          />
        </svg>

        {/* ── LAYER 2: THE ERGONOMIC FAST-CHARGER GUN (Coded Vector Architecture) ── */}
        <div className="relative z-10 w-64 h-64 flex items-center justify-center drop-shadow-[0_20px_35px_rgba(0,0,0,0.25)]">
          
          {/* SVG Vector Gun Body with Metallic Sheen and Contact Pins */}
          <svg className="w-full h-full overflow-visible" viewBox="0 0 320 320" fill="none">
            <defs>
              {/* Metallic Titanium Linear Gradient */}
              <linearGradient id="titaniumSheen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4A4E4D" />
                <stop offset="45%" stopColor="#252726" />
                <stop offset="70%" stopColor="#3B3F3E" />
                <stop offset="100%" stopColor="#141615" />
              </linearGradient>

              {/* Matte Rubber Grip Gradient */}
              <linearGradient id="rubberGrip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1D1F1E" />
                <stop offset="100%" stopColor="#0B0C0B" />
              </linearGradient>

              {/* Cyan Energy Glow Gradient */}
              <radialGradient id="cyanHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="1" />
                <stop offset="70%" stopColor="#00B0FF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* ── Ribbed Strain Relief Collar (Where cable enters handle) ── */}
            <g id="strain-relief" transform="translate(68, 72) rotate(32)">
              <rect x="0" y="0" width="28" height="42" rx="6" fill="#151716" stroke="#2B2E2D" strokeWidth="1.5" />
              <line x1="6" y1="10" x2="22" y2="10" stroke="#3A3E3D" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="6" y1="18" x2="22" y2="18" stroke="#3A3E3D" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="6" y1="26" x2="22" y2="26" stroke="#3A3E3D" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="6" y1="34" x2="22" y2="34" stroke="#3A3E3D" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* ── Main Ergonomic Gun Body Shell ── */}
            <path
              d="M 100 95 C 130 75, 190 70, 235 90 C 255 98, 275 125, 270 155 C 265 185, 240 205, 215 220 C 195 232, 185 255, 180 280 C 178 292, 160 292, 156 280 C 150 255, 140 230, 120 215 C 105 200, 95 180, 92 155 C 90 130, 92 110, 100 95 Z"
              fill="url(#titaniumSheen)"
              stroke="#383D3B"
              strokeWidth="2"
            />

            {/* ── Ergonomic Finger-Groove Grip Panel ── */}
            <path
              d="M 160 210 C 175 225, 178 245, 174 275 C 168 277, 162 277, 158 275 C 152 245, 145 225, 135 210 Z"
              fill="url(#rubberGrip)"
              stroke="#2B2F2E"
              strokeWidth="1.5"
            />
            {/* Grip Ribs */}
            <circle cx="166" cy="235" r="3.5" fill="#323635" />
            <circle cx="164" cy="250" r="3.5" fill="#323635" />
            <circle cx="161" cy="265" r="3.5" fill="#323635" />

            {/* ── Top Mechanical Trigger Latch ── */}
            <g id="latch" transform="translate(195, 76)">
              <rect
                x="0"
                y="0"
                width="42"
                height="12"
                rx="4"
                fill="#2A2D2C"
                stroke="#4C5250"
                strokeWidth="1.2"
                className="transition-transform group-hover:translate-y-0.5"
              />
              <line x1="12" y1="4" x2="30" y2="4" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* ── CCS2 Combo Charging Nozzle (Faceplate) ── */}
            <g id="nozzle-face" transform="translate(165, 85)">
              {/* Illuminated Circular Halo Ring */}
              <circle
                cx="42"
                cy="42"
                r="46"
                fill="none"
                stroke={isEngaged ? '#C8F369' : '#00E5FF'}
                strokeWidth={isHovered ? 4.5 : 3.5}
                className="transition-all duration-300 drop-shadow-[0_0_12px_#00E5FF]"
              />

              {/* Titanium Bezel Barrel */}
              <circle
                cx="42"
                cy="42"
                r="40"
                fill="#161817"
                stroke="#4A504E"
                strokeWidth="2.5"
              />

              {/* 5 AC / Signal Sensor Pins */}
              <circle cx="42" cy="22" r="5" fill="#0E100F" stroke="#333735" strokeWidth="1.5" />
              <circle cx="42" cy="22" r="2.5" fill={isEngaged ? '#C8F369' : '#00E5FF'} />

              <circle cx="26" cy="32" r="5" fill="#0E100F" stroke="#333735" strokeWidth="1.5" />
              <circle cx="26" cy="32" r="2.5" fill={isEngaged ? '#C8F369' : '#00E5FF'} />

              <circle cx="58" cy="32" r="5" fill="#0E100F" stroke="#333735" strokeWidth="1.5" />
              <circle cx="58" cy="32" r="2.5" fill={isEngaged ? '#C8F369' : '#00E5FF'} />

              <circle cx="31" cy="48" r="5" fill="#0E100F" stroke="#333735" strokeWidth="1.5" />
              <circle cx="31" cy="48" r="2.5" fill={isEngaged ? '#C8F369' : '#00E5FF'} />

              <circle cx="53" cy="48" r="5" fill="#0E100F" stroke="#333735" strokeWidth="1.5" />
              <circle cx="53" cy="48" r="2.5" fill={isEngaged ? '#C8F369' : '#00E5FF'} />

              {/* Center Ground Pin */}
              <circle cx="42" cy="38" r="4" fill="#0A0C0B" stroke="#252827" strokeWidth="1.2" />

              {/* Dual Heavy DC Fast-Charging Power Terminals (Bottom Combo Inset) */}
              <g id="dc-combo-pins" transform="translate(18, 56)">
                <rect x="0" y="0" width="48" height="26" rx="8" fill="#101211" stroke="#363A39" strokeWidth="1.5" />
                {/* DC Positive Terminal */}
                <circle cx="14" cy="13" r="8" fill="#1C1E1D" stroke="#D4AF37" strokeWidth="1.8" />
                <circle cx="14" cy="13" r="4" fill={isEngaged ? '#C8F369' : '#00E5FF'} />
                {/* DC Negative Terminal */}
                <circle cx="34" cy="13" r="8" fill="#1C1E1D" stroke="#D4AF37" strokeWidth="1.8" />
                <circle cx="34" cy="13" r="4" fill={isEngaged ? '#C8F369' : '#00E5FF'} />
              </g>
            </g>
          </svg>

          {/* ── OLED DIGITAL TELEMETRY SCREEN (Embedded on Handle Body) ── */}
          <div className="absolute top-[86px] left-[70px] w-28 bg-black/90 rounded-lg p-2 border border-white/15 backdrop-blur-sm shadow-inner pointer-events-none">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[7.5px] font-mono uppercase tracking-wider text-white/50">
                EVVERSE HPC
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isEngaged ? 'bg-[#C8F369] animate-ping' : 'bg-[#00E5FF] animate-pulse'
                  }`}
                />
                <span className="text-[7px] font-mono text-emerald-400 font-bold">
                  {isEngaged ? 'SURGE' : 'READY'}
                </span>
              </div>
            </div>

            {/* Live kW Readout */}
            <div className="flex items-baseline justify-between border-b border-white/10 pb-1 mb-1">
              <span className="text-sm font-mono font-bold text-white tracking-tight">
                {isEngaged ? '362.4' : powerKw}
              </span>
              <span className="text-[8px] font-mono font-semibold text-[#00E5FF]">
                kW DC
              </span>
            </div>

            {/* Voltage & Amps Micro Row */}
            <div className="flex justify-between text-[7.5px] font-mono text-white/60 leading-none">
              <span>{voltage}V</span>
              <span>{currentAmps}A</span>
              <span>800V SYS</span>
            </div>
          </div>

        </div>

        {/* ── INTERACTIVE INSTRUCTION CHIP BENEATH THE GUN ── */}
        <div className="absolute -bottom-4 inset-x-0 flex flex-col items-center pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-black/10 shadow-[0_8px_20px_rgba(0,0,0,0.1)] flex items-center gap-2 transition-transform group-hover:scale-105">
            <div
              className={`w-2 h-2 rounded-full ${
                isEngaged ? 'bg-[#C8F369] shadow-[0_0_8px_#C8F369]' : 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]'
              } animate-pulse`}
            />
            <span className="text-[9.5px] font-mono font-bold text-[#111312] tracking-wider uppercase">
              {stageNumber} // {stageName}
            </span>
            <span className="text-[8.5px] font-mono text-black/45 border-l border-black/15 pl-1.5">
              {isEngaged ? '⚡ 362kW' : 'CLICK TO SURGE'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
