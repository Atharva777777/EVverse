"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const POWERTRAINS = [
  {
    id: "bev",
    name: "Battery Electric (BEV)",
    description: "Runs entirely on electricity stored in a large battery pack. No internal combustion engine, zero tailpipe emissions.",
    energySource: "Grid electricity (AC/DC)",
    storage: "High-capacity Lithium-ion battery pack",
    powerElectronics: "Inverter converts DC from battery to AC for the motor",
    motor: "Electric traction motor (AC synchronous or induction)",
    drivetrain: "Single-speed transmission to the wheels",
    charging: "Plug-in charging via AC (slow/fast) or DC (rapid)",
    regen: true,
    advantages: ["Zero tailpipe emissions", "Lower running and maintenance costs", "Smooth, quiet, high-torque performance"],
    limitations: ["Relies entirely on charging infrastructure", "Higher upfront battery cost", "Charging takes longer than refuelling"],
    flowNodes: ["Charging Port", "Battery Pack", "Power Electronics", "Electric Motor", "Wheels"],
  },
  {
    id: "phev",
    name: "Plug-in Hybrid (PHEV)",
    description: "Combines an electric motor and a small battery with a traditional internal combustion engine (ICE). Can be plugged in to charge and driven in pure-electric mode for short distances.",
    energySource: "Grid electricity AND Liquid Fuel (Petrol/Diesel)",
    storage: "Medium-capacity battery + Fuel tank",
    powerElectronics: "Manages power flow between battery, motor, and engine",
    motor: "Electric motor + Internal Combustion Engine",
    drivetrain: "Complex transmission blending both power sources",
    charging: "Plug-in charging (usually AC only) + Refuelling at standard pumps",
    regen: true,
    advantages: ["No range anxiety on long trips", "Pure electric driving for daily commutes", "Smaller, cheaper battery than BEV"],
    limitations: ["Carries the weight of two powertrains", "Higher maintenance complexity", "Requires frequent charging to realise benefits"],
    flowNodes: ["Grid / Fuel Pump", "Battery / Fuel Tank", "Inverter / Engine", "Electric Motor / Drivetrain", "Wheels"],
  },
  {
    id: "hev",
    name: "Hybrid Electric (HEV)",
    description: "Uses a combustion engine alongside a small electric motor. The battery is charged entirely through regenerative braking and the engine—it cannot be plugged in.",
    energySource: "Liquid Fuel (Petrol/Diesel) only",
    storage: "Small-capacity battery + Fuel tank",
    powerElectronics: "Optimises engine efficiency and motor assist",
    motor: "Small electric assist motor + Primary Combustion Engine",
    drivetrain: "Transmission blending both power sources",
    charging: "No plug. Refuels at standard pumps. Battery charged internally.",
    regen: true,
    advantages: ["Improved fuel efficiency over standard ICE", "No change to user habits (just refuel)", "Lower upfront cost than BEV/PHEV"],
    limitations: ["Still produces tailpipe emissions", "Cannot drive meaningful distances on electricity alone", "Relies entirely on fossil fuels for primary energy"],
    flowNodes: ["Fuel Pump", "Fuel Tank", "Combustion Engine", "Drivetrain", "Wheels"],
  }
];

const VEHICLE_CLASSES = [
  {
    id: "e-2w",
    name: "Electric Two-Wheelers",
    description: "Electric scooters and motorcycles designed for urban mobility and short-distance commutes.",
    indianContext: "Two-wheelers dominate Indian roads, making up over 70% of total vehicles. Electrifying this segment is India's fastest and most impactful transition to EV, driven by high fuel prices and strong government subsidies.",
    commonApplications: ["Personal daily commuting", "Last-mile delivery (food, groceries, e-commerce)", "Bike-taxi services"],
    tradeOffs: ["Lower upfront cost and immediate fuel savings", "Extremely easy to charge on standard home sockets", "Limited top speed and highway range", "Susceptible to extreme heat degradation if not actively cooled"],
  },
  {
    id: "e-3w",
    name: "Electric Three-Wheelers",
    description: "Battery-powered auto-rickshaws and cargo loaders.",
    indianContext: "E-3Ws have achieved massive organic adoption in India, often reaching price parity with CNG equivalents. They are critical for affordable public transit and urban logistics.",
    commonApplications: ["Shared urban mobility (auto-rickshaws)", "Last-mile freight and cargo delivery", "Municipal waste collection"],
    tradeOffs: ["Excellent return on investment for fleet operators", "Very low running costs compared to fossil fuels", "Lower top speeds suited only for dense city traffic", "Relies on fragmented local charging or battery-swapping infrastructure"],
  },
  {
    id: "passenger",
    name: "Passenger EVs",
    description: "Personal electric cars, spanning from affordable compact hatchbacks to premium SUVs.",
    indianContext: "Passenger EV adoption is growing steadily, primarily driven by early adopters, fleet operators, and tax incentives. The market requires affordable sub-₹10 Lakh models to reach mass scale.",
    commonApplications: ["Personal family transport", "Corporate fleet operations", "Premium electric ride-hailing cabs"],
    tradeOffs: ["Zero tailpipe emissions and silent operation", "High status and tech appeal", "Higher initial purchase price compared to ICE", "Highway travel requires planning around public fast-chargers"],
  },
  {
    id: "e-buses",
    name: "Electric Buses",
    description: "Large capacity electric vehicles for public transit and intercity travel.",
    indianContext: "State transport undertakings (STUs) are rapidly electrifying fleets under the FAME II scheme and the PM-eBus Sewa initiative, transforming heavily polluted urban corridors.",
    commonApplications: ["Intra-city public transport", "Corporate employee shuttles", "Airport tarmac transfers"],
    tradeOffs: ["Dramatically reduces urban air and noise pollution", "Predictable routes make charging logistics easier", "Requires massive grid upgrades at bus depots", "High upfront capital expenditure for municipalities"],
  },
  {
    id: "commercial",
    name: "Electric Commercial & Freight",
    description: "Electric light commercial vehicles (e-LCVs) and heavy-duty trucks.",
    indianContext: "A nascent but vital sector. While e-LCVs are entering urban logistics, heavy electric trucks are currently limited to closed-loop operations like mining or port logistics due to battery weight and charging needs.",
    commonApplications: ["Urban FMCG distribution", "E-commerce hub-to-hub transfers", "Closed-loop industrial transport"],
    tradeOffs: ["Significant operational cost savings for high-utilization fleets", "Helps corporations meet ESG and zero-emission goals", "Heavy batteries reduce payload capacity", "Requires dedicated high-power megawatt charging infrastructure"],
  }
];

const FlowDiagram = ({ nodes, isRegen }: { nodes: string[], isRegen?: boolean }) => {
  return (
    <div className="relative p-6 bg-[var(--color-fog)] rounded-xl border border-[var(--color-border-subtle)] my-8 overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Forward Path */}
        <div className="flex items-center justify-between relative z-10">
          {nodes.map((node, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center flex-1">
                <div className="w-14 h-14 bg-white border border-[var(--color-border)] shadow-sm rounded-full flex items-center justify-center p-1.5 text-center mb-3">
                   <div className="w-full h-full bg-[var(--color-canvas)] rounded-full flex items-center justify-center">
                      <span className="text-[11px] uppercase font-bold text-[var(--color-navy-700)]">
                        {i + 1}
                      </span>
                   </div>
                </div>
                <div className="text-[13px] font-serif font-semibold text-[var(--color-ink)] text-center leading-tight">
                  {node.split('/').map((line, j) => <div key={j}>{line.trim()}</div>)}
                </div>
              </div>
              {i < nodes.length - 1 && (
                <div className="flex-1 flex items-center justify-center -mx-6 text-[var(--color-navy-300)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Reverse Regen Path */}
        {isRegen && (
          <div className="mt-8 relative pt-4 border-t border-dashed border-[var(--color-border)]">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-fog)] px-4">
               <span className="text-[10px] uppercase font-bold text-[var(--color-navy-600)] tracking-wider bg-white border border-[var(--color-border-subtle)] px-2 py-1 rounded">Regenerative Braking</span>
             </div>
             <div className="flex items-center justify-between text-[var(--color-navy-400)] px-[10%] mt-4">
                <svg className="w-full h-4" preserveAspectRatio="none" viewBox="0 0 100 10" fill="none">
                   <line x1="100" y1="5" x2="2" y2="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                   <polygon points="2,5 8,1 8,9" fill="currentColor" />
                </svg>
             </div>
             <div className="text-center mt-2 font-serif text-[13px] text-[var(--color-ink-4)] italic">
                Kinetic energy from the wheels is recovered by the motor to recharge the battery during deceleration.
             </div>
          </div>
        )}
      </div>
      <div className="mt-6 text-center font-serif text-[11px] text-[var(--color-ink-4)] opacity-70">
        Simplified representation. Component topology varies by specific vehicle architecture.
      </div>
    </div>
  );
};

const PowertrainView = ({ data }: { data: typeof POWERTRAINS[0] }) => (
  <div className="anim-fade-in">
    <h2 className="font-serif text-[28px] text-[var(--color-ink)] mb-4">{data.name}</h2>
    <p className="font-serif text-[16px] text-[var(--color-ink-2)] mb-8 leading-relaxed">
      {data.description}
    </p>

    <div className="font-sans text-[11px] uppercase tracking-widest text-[var(--color-navy-500)] font-semibold mb-4">
      Energy Flow Architecture
    </div>
    <FlowDiagram nodes={data.flowNodes} isRegen={data.regen} />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 pt-10 border-t border-[var(--color-border-subtle)]">
       <div>
         <h3 className="font-serif text-[18px] text-[var(--color-ink)] mb-6">Component Specifications</h3>
         <dl className="space-y-5">
           <div>
             <dt className="text-[11px] uppercase tracking-wider font-bold text-[var(--color-ink-4)] mb-1">Energy Source</dt>
             <dd className="font-serif text-[15px] text-[var(--color-ink)]">{data.energySource}</dd>
           </div>
           <div>
             <dt className="text-[11px] uppercase tracking-wider font-bold text-[var(--color-ink-4)] mb-1">Energy Storage</dt>
             <dd className="font-serif text-[15px] text-[var(--color-ink)]">{data.storage}</dd>
           </div>
           <div>
             <dt className="text-[11px] uppercase tracking-wider font-bold text-[var(--color-ink-4)] mb-1">Power Electronics</dt>
             <dd className="font-serif text-[15px] text-[var(--color-ink)]">{data.powerElectronics}</dd>
           </div>
           <div>
             <dt className="text-[11px] uppercase tracking-wider font-bold text-[var(--color-ink-4)] mb-1">Motor</dt>
             <dd className="font-serif text-[15px] text-[var(--color-ink)]">{data.motor}</dd>
           </div>
           <div>
             <dt className="text-[11px] uppercase tracking-wider font-bold text-[var(--color-ink-4)] mb-1">Drivetrain</dt>
             <dd className="font-serif text-[15px] text-[var(--color-ink)]">{data.drivetrain}</dd>
           </div>
           <div>
             <dt className="text-[11px] uppercase tracking-wider font-bold text-[var(--color-ink-4)] mb-1">Charging</dt>
             <dd className="font-serif text-[15px] text-[var(--color-ink)]">{data.charging}</dd>
           </div>
         </dl>
       </div>
       <div>
         <h3 className="font-serif text-[18px] text-[var(--color-ink)] mb-6">Advantages & Limitations</h3>
         <div className="mb-8">
           <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider font-bold text-[var(--color-ink-4)] mb-4">
             <div className="w-2 h-2 rounded-full bg-[#10b981]" />
             Advantages
           </div>
           <ul className="space-y-3">
             {data.advantages.map((a, i) => (
               <li key={i} className="font-serif text-[15px] text-[var(--color-ink-2)] flex items-start gap-3">
                 <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--color-ink-4)] shrink-0" />
                 {a}
               </li>
             ))}
           </ul>
         </div>
         <div>
           <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider font-bold text-[var(--color-ink-4)] mb-4">
             <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
             Limitations
           </div>
           <ul className="space-y-3">
             {data.limitations.map((l, i) => (
               <li key={i} className="font-serif text-[15px] text-[var(--color-ink-2)] flex items-start gap-3">
                 <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--color-ink-4)] shrink-0" />
                 {l}
               </li>
             ))}
           </ul>
         </div>
       </div>
    </div>
  </div>
);

const ClassView = ({ data }: { data: typeof VEHICLE_CLASSES[0] }) => (
  <div className="anim-fade-in">
    <h2 className="font-serif text-[28px] text-[var(--color-ink)] mb-4">{data.name}</h2>
    <p className="font-serif text-[16px] text-[var(--color-ink-2)] mb-8 leading-relaxed">
      {data.description}
    </p>

    <div className="bg-[#f0f4f8] border border-[var(--color-navy-200)] p-6 rounded-xl mb-10">
      <div className="font-sans text-[11px] uppercase tracking-widest text-[var(--color-navy-600)] font-bold mb-3 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
        Indian Context
      </div>
      <p className="font-serif text-[15px] text-[var(--color-ink)] leading-relaxed m-0">
        {data.indianContext}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10 border-t border-[var(--color-border-subtle)] pt-10">
      <div>
        <h3 className="font-serif text-[18px] text-[var(--color-ink)] mb-6">Common Applications</h3>
        <ul className="space-y-4">
          {data.commonApplications.map(app => (
            <li key={app} className="flex gap-3 items-start">
              <div className="mt-2 w-1.5 h-1.5 bg-[var(--color-navy-500)] rounded-full shrink-0" />
              <span className="font-serif text-[15px] text-[var(--color-ink-2)] leading-snug">{app}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-serif text-[18px] text-[var(--color-ink)] mb-6">Practical Trade-offs</h3>
        <ul className="space-y-4">
          {data.tradeOffs.map(trade => (
            <li key={trade} className="flex gap-3 items-start">
              <div className="mt-2 w-1.5 h-1.5 bg-[var(--color-ink-4)] rounded-full shrink-0" />
              <span className="font-serif text-[15px] text-[var(--color-ink-2)] leading-snug">{trade}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default function EVKnowledgeHub() {
  const [activeTab, setActiveTab] = useState<"powertrains" | "classes">("powertrains");
  const [activeId, setActiveId] = useState("bev");

  const activePowertrain = activeTab === "powertrains" ? POWERTRAINS.find(p => p.id === activeId) : null;
  const activeClass = activeTab === "classes" ? VEHICLE_CLASSES.find(c => c.id === activeId) : null;

  const handleTabChange = (tab: "powertrains" | "classes") => {
    setActiveTab(tab);
    setActiveId(tab === "powertrains" ? POWERTRAINS[0].id : VEHICLE_CLASSES[0].id);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-canvas)" }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link
            href="/users"
            style={{ textDecoration: "none", color: "var(--color-ink-3)", fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 500 }}
          >
            &larr; Back
          </Link>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <BrandLogo suffix="Knowledge" />
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, padding: "56px 32px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        {/* Intro */}
        <div className="mb-12">
          <h1 className="font-serif text-[36px] text-[var(--color-ink)] mb-4 tracking-tight">
            EV Knowledge Hub
          </h1>
          <p className="font-serif text-[17px] text-[var(--color-ink-3)] leading-relaxed max-w-[800px] mb-6">
            Electric mobility is defined by two different dimensions: <strong className="text-[var(--color-ink)]">Powertrain Architectures</strong> (the internal technology powering the vehicle) and <strong className="text-[var(--color-ink)]">Vehicle Classes</strong> (the physical form factor and application). Explore both dimensions below.
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-8 mb-8 border-b border-[var(--color-border-subtle)]">
          <button 
            onClick={() => handleTabChange("powertrains")}
            className={`pb-4 font-serif text-[18px] transition-colors relative ${activeTab === 'powertrains' ? 'text-[var(--color-ink)] font-semibold' : 'text-[var(--color-ink-4)] hover:text-[var(--color-ink-2)]'}`}
          >
            Powertrain Architectures
            {activeTab === 'powertrains' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[var(--color-navy-700)] rounded-t-md" />}
          </button>
          <button 
            onClick={() => handleTabChange("classes")}
            className={`pb-4 font-serif text-[18px] transition-colors relative ${activeTab === 'classes' ? 'text-[var(--color-ink)] font-semibold' : 'text-[var(--color-ink-4)] hover:text-[var(--color-ink-2)]'}`}
          >
            Vehicle Classes & Context
            {activeTab === 'classes' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[var(--color-navy-700)] rounded-t-md" />}
          </button>
        </div>

        {/* EXPLORER LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* LEFT SIDEBAR (List) */}
          <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-2">
            {(activeTab === "powertrains" ? POWERTRAINS : VEHICLE_CLASSES).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 ${activeId === item.id ? 'bg-white border-[var(--color-navy-300)] shadow-[0_4px_12px_rgba(10,22,40,0.06)]' : 'bg-transparent border-transparent hover:bg-[rgba(10,22,40,0.03)] hover:border-[var(--color-border-subtle)]'}`}
              >
                <div className={`font-serif text-[16px] ${activeId === item.id ? 'font-semibold text-[var(--color-ink)]' : 'text-[var(--color-ink-2)]'}`}>
                  {item.name}
                </div>
              </button>
            ))}
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 bg-white border border-[var(--color-border)] rounded-2xl p-8 lg:p-12 shadow-[0_8px_32px_rgba(10,22,40,0.02)] min-h-[600px]">
             {activeTab === "powertrains" && activePowertrain && <PowertrainView data={activePowertrain} />}
             {activeTab === "classes" && activeClass && <ClassView data={activeClass} />}
          </div>
        </div>

        <div className="mt-16 p-6 bg-[var(--color-fog)] rounded-xl border border-[var(--color-border-subtle)] text-center">
          <p className="font-serif text-[13px] text-[var(--color-ink-3)] leading-relaxed m-0 max-w-[800px] mx-auto">
            <strong>Educational Disclaimer:</strong> This page provides general educational information about electric vehicles. It does not contain independently verified vehicle-specific specifications, prices, or performance claims. Always consult official manufacturer documentation and local regulations before making purchase decisions.
          </p>
        </div>
      </main>
    </div>
  );
}
