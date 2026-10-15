"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  BatteryCharging,
  QrCode,
  Coins,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Car,
  CheckCircle2,
  Sliders,
  DollarSign,
  Fuel,
  Info,
  ExternalLink,
} from "lucide-react";

// ── Interactive Vehicles for Cost & Time Calculator ────────────────────────
interface GuideVehicle {
  id: string;
  name: string;
  category: string;
  batteryKwh: number;
  maxDcKw: number;
  acKw: number;
  rangeKm: number;
  effKmPerKwh: number;
  image: string;
}

const GUIDE_VEHICLES: GuideVehicle[] = [
  {
    id: "nexon",
    name: "Tata Nexon EV Max",
    category: "Passenger SUV",
    batteryKwh: 40.5,
    maxDcKw: 60,
    acKw: 7.2,
    rangeKm: 340,
    effKmPerKwh: 8.4,
    image: "/images/car-tata-nexon.jpg",
  },
  {
    id: "ather",
    name: "Ather 450X Gen 3",
    category: "Electric Scooter",
    batteryKwh: 3.7,
    maxDcKw: 3.3,
    acKw: 1.5,
    rangeKm: 110,
    effKmPerKwh: 29.7,
    image: "/images/scooter-ather-450x.jpg",
  },
  {
    id: "treo",
    name: "Mahindra Treo Auto",
    category: "Commercial 3-Wheeler",
    batteryKwh: 7.37,
    maxDcKw: 3.3,
    acKw: 2.2,
    rangeKm: 130,
    effKmPerKwh: 17.6,
    image: "/images/auto-mahindra-treo.jpg",
  },
  {
    id: "taycan",
    name: "Porsche Taycan 4S",
    category: "High-Performance EV",
    batteryKwh: 93.4,
    maxDcKw: 180,
    acKw: 11.0,
    rangeKm: 480,
    effKmPerKwh: 5.1,
    image: "/images/car-porsche.png",
  },
];

// ── Plug Standards ────────────────────────────────────────────────────────
interface PlugStandard {
  id: string;
  name: string;
  type: string;
  speedTier: string;
  outputRange: string;
  chargeTime10to80: string;
  idealFor: string;
  compatibleModels: string;
  typicalTariff: string;
  color: string;
  image: string;
  hardwareModel: string;
  pillGradient: string;
}

const PLUG_STANDARDS: PlugStandard[] = [
  {
    id: "ccs2",
    name: "CCS2 Combo",
    type: "Combined AC/DC Fast",
    speedTier: "Ultra-Fast DC",
    outputRange: "50 kW – 180 kW DC",
    chargeTime10to80: "25 – 45 min",
    idealFor: "Highways, express transit hubs & mid-journey top-ups",
    compatibleModels: "Tata Nexon/Curvv, MG ZS, Hyundai Ioniq 5, Porsche, BYD",
    typicalTariff: "₹16.50 – ₹18.50 / kWh",
    color: "#14F1D9",
    image: "/images/plug-ccs2.png",
    hardwareModel: "Volt-DC Ultra (180 kW Dual Gun)",
    pillGradient: "linear-gradient(135deg, #CFE7FA 0%, #B2D8F7 100%)",
  },
  {
    id: "type2",
    name: "Type 2 Mennekes",
    type: "Standard AC Connector",
    speedTier: "Destination AC",
    outputRange: "7.4 kW – 22 kW AC",
    chargeTime10to80: "3.5 – 6.5 hours",
    idealFor: "Shopping malls, office parking, hotels & overnight stays",
    compatibleModels: "All Indian 4-wheeler EVs & universal Type 2 adapters",
    typicalTariff: "₹11.00 – ₹13.50 / kWh",
    color: "#3B82F6",
    image: "/images/plug-type2.png",
    hardwareModel: "Wall Connector (22 kW AC Destination)",
    pillGradient: "linear-gradient(135deg, #D4EDDA 0%, #C3E6CB 100%)",
  },
  {
    id: "chademo",
    name: "Dual Core CHAdeMO",
    type: "Dual-Standard Fast DC",
    speedTier: "High-Speed DC",
    outputRange: "60 kW – 120 kW DC",
    chargeTime10to80: "30 – 50 min",
    idealFor: "Commercial fleet plazas, highway interchanges & high-throughput hubs",
    compatibleModels: "Nissan Leaf, Lexus UX, and all standard CCS2 Indian electric passenger cars",
    typicalTariff: "₹15.50 – ₹17.00 / kWh",
    color: "#64748B",
    image: "/images/plug-chademo.png",
    hardwareModel: "Dual Core Pedestal (120 kW High Speed)",
    pillGradient: "linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)",
  },
  {
    id: "bharat-dc",
    name: "Bharat DC-001 (GB/T)",
    type: "Low-Voltage Fleet DC",
    speedTier: "Fleet Rapid DC",
    outputRange: "15 kW – 30 kW DC",
    chargeTime10to80: "60 – 90 min",
    idealFor: "Urban electric taxi fleets & municipal commercial loaders",
    compatibleModels: "Tata Tigor EV Fleet, Mahindra e-Verito, commercial e-LCVs",
    typicalTariff: "₹13.00 – ₹15.00 / kWh",
    color: "#A855F7",
    image: "/images/plug-gbt.png",
    hardwareModel: "Fleet Depot Dispenser (30 kW Rapid)",
    pillGradient: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)",
  },
];

// ── FAQs ──────────────────────────────────────────────────────────────────
interface FaqItem {
  question: string;
  answer: string;
  badge: string;
}

const FAQS: FaqItem[] = [
  {
    badge: "BATTERY CARE",
    question: "Why does fast charging slow down after 80% SOC?",
    answer:
      "All lithium-ion batteries follow a Constant Current / Constant Voltage (CC/CV) safety profile. Between 10% and 80%, the charger feeds maximum current. Above 80%, voltage peaks and current tapers sharply to prevent overheating and dendrite buildup. For fastest road trips, unplugging at 80% saves you time and keeps charging bays open for others.",
  },
  {
    badge: "SUMMER HEALTH",
    question: "How should I charge in 40°C+ Indian summer heat?",
    answer:
      "Modern EVs use active liquid thermal management. Whenever possible, plug in during cooler morning or evening hours, or pick covered charging bays. If your car has pre-conditioning, leave it active so the battery pack cools to optimal temperature before high-voltage contactors energize.",
  },
  {
    badge: "ZERO WAIT",
    question: "How does the EVverse 15-Minute Guaranteed Reservation work?",
    answer:
      "When you tap 'Reserve' on any open bay in the Driver app, a 15-minute countdown begins. The charger's LED turns amber, locking out other drivers. When you arrive, scan the Bharat QR code on the kiosk to immediately unlock the cable with zero wait time.",
  },
  {
    badge: "PAYMENTS",
    question: "Do I need to deposit money into a proprietary wallet?",
    answer:
      "Never. EVverse operates on a direct dual-rail payment architecture: you either pay exact session fees via Instant Bharat QR (Google Pay, PhonePe, Paytm, BHIM) or approve micro-transactions using Monad Testnet Web3 crypto with sub-cent gas fees.",
  },
  {
    badge: "IDLE FEES",
    question: "What happens if I stay parked after my charging completes?",
    answer:
      "EVverse gives you a generous 15-minute grace period to unplug and vacate the bay once your target SOC is reached. After 15 minutes, a modest anti-hogging tariff applies to ensure fast chargers remain accessible to fellow drivers.",
  },
];

export default function EVverseGuidePage() {
  const [activeTab, setActiveTab] = useState<"how" | "calculator" | "plugs" | "payments" | "faqs">("how");
  const [selectedPlugId, setSelectedPlugId] = useState<string>("ccs2");

  // Calculator State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("nexon");
  const [startSoc, setStartSoc] = useState<number>(20);
  const [targetSoc, setTargetSoc] = useState<number>(80);
  const [tariffPerKwh, setTariffPerKwh] = useState<number>(17.5);

  const vehicle = GUIDE_VEHICLES.find((v) => v.id === selectedVehicleId) || GUIDE_VEHICLES[0];

  // Calculations
  const socAdded = Math.max(0, targetSoc - startSoc);
  const energyKwhNeeded = (vehicle.batteryKwh * socAdded) / 100;
  const chargingCostInr = Math.round(energyKwhNeeded * tariffPerKwh);

  // Time estimate on DC Fast Charger (accounting for taper above 70%)
  const effectiveDcKw = Math.min(vehicle.maxDcKw, 60);
  const dcTimeMinutes =
    effectiveDcKw > 0
      ? Math.round((energyKwhNeeded / effectiveDcKw) * 60 * (targetSoc > 70 ? 1.25 : 1.1))
      : 0;

  // Time estimate on AC Destination Charger (7.2kW or vehicle max)
  const effectiveAcKw = Math.min(vehicle.acKw, 7.2);
  const acTimeMinutes =
    effectiveAcKw > 0 ? Math.round((energyKwhNeeded / effectiveAcKw) * 60 * 1.15) : 0;
  const acHours = Math.floor(acTimeMinutes / 60);
  const acMins = acTimeMinutes % 60;

  // Added Range & Fuel Savings
  const kmAdded = Math.round(energyKwhNeeded * vehicle.effKmPerKwh);
  // Compare to petrol at ₹105/L assuming 14 km/L for cars, 45 km/L for bikes, 22 km/L for 3W
  const petrolKmPerLitre =
    vehicle.id === "ather" ? 45 : vehicle.id === "treo" ? 22 : 14;
  const petrolLitersSaved = kmAdded / petrolKmPerLitre;
  const petrolCostEquivalent = Math.round(petrolLitersSaved * 105);
  const netSavingsInr = Math.max(0, petrolCostEquivalent - chargingCostInr);

  return (
    <div
      className="min-h-screen bg-[#FAF9F6] text-[#111312] selection:bg-[#111312] selection:text-[#14F1D9] antialiased"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      }}
    >
      {/* ── STICKY TOP APP BAR ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-black/[0.06] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-black/70 hover:text-black bg-black/[0.04] hover:bg-black/[0.08] transition-all border border-black/[0.06]"
              title="Return to EVverse Landing Page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing</span>
            </Link>

            <div className="h-4 w-px bg-black/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 shrink-0">
                <Image
                  src="/images/evverse-logo.png"
                  alt="EVverse Logo"
                  width={28}
                  height={28}
                  priority
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="leading-none">
                <span className="text-sm font-bold tracking-tight text-[#111312]">
                  EVverse
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0D9488] font-semibold ml-1.5 px-1.5 py-0.5 rounded-full bg-[#14F1D9]/15 border border-[#14F1D9]/30">
                  User Guide
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/station-owners"
              className="hidden md:inline-flex text-xs font-medium text-black/60 hover:text-black px-2.5 py-1.5 transition-colors"
            >
              Station Owners
            </Link>
            <Link
              href="/investor"
              className="hidden md:inline-flex text-xs font-medium text-black/60 hover:text-black px-2.5 py-1.5 transition-colors"
            >
              Investors
            </Link>
            <Link
              href="/users/stations"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#111312] hover:bg-black transition-all shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-[#14F1D9]" />
              <span>Launch Driver App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ───────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-8 pt-10 pb-8 sm:pt-16 sm:pb-12 max-w-6xl mx-auto overflow-hidden">
        {/* Ambient Teal Radial Backlight */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#14F1D9]/20 via-teal-400/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14F1D9]/15 border border-[#14F1D9]/30 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0D9488]">
            <Sparkles className="w-3 h-3 text-[#0D9488]" />
            <span>Official Driver & Host Handbook</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111312] leading-[1.15]">
            Everything you need to master charging across EVverse.
          </h1>
          <p className="text-sm sm:text-base text-black/65 font-normal leading-relaxed pt-1">
            Zero wait times, transparent tariffs, universal plug compatibility, and instant dual-rail payments. Designed for effortless electric mobility in India and beyond.
          </p>
        </div>

        {/* ── INTERACTIVE TAB SELECTOR ── */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: "how", label: "How It Works", icon: Zap },
            { id: "calculator", label: "Cost & Time Calculator", icon: Sliders },
            { id: "plugs", label: "Plugs & Speeds", icon: BatteryCharging },
            { id: "payments", label: "Dual-Rail Payments", icon: QrCode },
            { id: "faqs", label: "Driver FAQs & Tips", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-tight transition-all shrink-0 cursor-pointer ${
                  isSel
                    ? "bg-[#111312] text-white shadow-sm ring-1 ring-black"
                    : "bg-white text-black/70 hover:text-black border border-black/[0.08] hover:border-black/20"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSel ? "text-[#14F1D9]" : "text-black/50"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── MAIN CONTENT TAB PANELS ───────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 1: HOW IT WORKS (3-STEP VISUAL JOURNEY)                   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "how" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 1 */}
              <div className="rounded-3xl bg-white p-6 border border-black/[0.08] shadow-xs flex flex-col justify-between space-y-4 hover:border-black/20 transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#111312] text-[#14F1D9] flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-[#111312]">
                    Find & Reserve Ahead
                  </h3>
                  <p className="text-xs sm:text-sm text-black/65 leading-relaxed">
                    Search over real verified chargers across Pune, Mumbai, Bangalore, and highway corridors. Tap <strong className="text-black">Reserve</strong> to lock your bay for 15 minutes with zero upfront deposit.
                  </p>
                </div>
                <div className="pt-3 border-t border-black/[0.06] text-[11px] font-mono text-[#0D9488] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bay held exclusively for your vehicle</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-3xl bg-white p-6 border border-black/[0.08] shadow-xs flex flex-col justify-between space-y-4 hover:border-black/20 transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#111312] text-[#14F1D9] flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-[#111312]">
                    Plug In & Scan Kiosk QR
                  </h3>
                  <p className="text-xs sm:text-sm text-black/65 leading-relaxed">
                    Insert the CCS2 or Type 2 connector into your EV. Scan the kiosk's <strong className="text-black">Bharat QR</strong> via Google Pay / PhonePe or approve with Monad Web3. The high-voltage relay energizes in under 2 seconds.
                  </p>
                </div>
                <div className="pt-3 border-t border-black/[0.06] text-[11px] font-mono text-[#0D9488] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Hardware pilot handshake verified</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-3xl bg-white p-6 border border-black/[0.08] shadow-xs flex flex-col justify-between space-y-4 hover:border-black/20 transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#111312] text-[#14F1D9] flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-[#111312]">
                    Track Live & Drive Away
                  </h3>
                  <p className="text-xs sm:text-sm text-black/65 leading-relaxed">
                    Watch kilowatt draw, battery percentage, and energy delivered live on your phone. When complete, power automatically disconnects with an instant GST tax invoice and digital receipt.
                  </p>
                </div>
                <div className="pt-3 border-t border-black/[0.06] text-[11px] font-mono text-[#0D9488] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>15-min free grace period after charging</span>
                </div>
              </div>
            </div>

            {/* Quick Action Callout */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#111312] text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#14F1D9]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 text-center sm:text-left z-10">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#14F1D9] font-bold">
                  Ready to test a charging session?
                </span>
                <h4 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Open the EVverse Interactive Driver App
                </h4>
                <p className="text-xs sm:text-sm text-white/70 max-w-lg">
                  Explore real live stations, inspect charger kW outputs, simulate Monad Web3 escrow or UPI, and trigger physical actuator relay telemetry.
                </p>
              </div>
              <Link
                href="/users/stations"
                className="z-10 px-5 py-3 rounded-2xl bg-[#14F1D9] text-[#111312] font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-md shrink-0 flex items-center gap-2"
              >
                <span>Launch Driver Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 2: INTERACTIVE CHARGING COST & TIME CALCULATOR             */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "calculator" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-8">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#0D9488] font-bold block mb-1">
                  Interactive Simulator
                </span>
                <h2 className="text-2xl font-bold text-[#111312]">
                  EV Charging Time & Cost Calculator
                </h2>
                <p className="text-xs sm:text-sm text-black/60 pt-0.5">
                  Pick your vehicle model, adjust your starting and target battery percentages, and see actual charging durations, ₹ costs, and savings compared to petrol.
                </p>
              </div>

              {/* Vehicle Selection Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-black/70 uppercase tracking-wider font-mono">
                  1. Select Vehicle Model
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {GUIDE_VEHICLES.map((v) => {
                    const isSel = v.id === selectedVehicleId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSel
                            ? "bg-[#111312] text-white border-[#111312] shadow-xs"
                            : "bg-[#FAF9F6] text-[#111312] border-black/[0.08] hover:border-black/20"
                        }`}
                      >
                        <div className="relative w-full h-16 rounded-xl overflow-hidden mb-2 bg-black/5">
                          <Image
                            src={v.image}
                            alt={v.name}
                            fill
                            className="object-cover"
                            sizes="140px"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight line-clamp-1">
                            {v.name}
                          </div>
                          <div
                            className={`text-[10px] font-mono mt-0.5 ${
                              isSel ? "text-white/70" : "text-black/50"
                            }`}
                          >
                            {v.batteryKwh} kWh • {v.category}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders: Start & Target SOC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-black/[0.06]">
                {/* Start SOC Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-black/75">
                      Starting Battery Level:
                    </span>
                    <span className="font-mono font-bold text-[#111312] px-2 py-0.5 rounded bg-black/5">
                      {startSoc}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={startSoc}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStartSoc(val);
                      if (val >= targetSoc) setTargetSoc(val + 10);
                    }}
                    className="w-full accent-[#0D9488] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-black/40 font-mono">
                    <span>5% (Depleted)</span>
                    <span>60%</span>
                  </div>
                </div>

                {/* Target SOC Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-black/75">
                      Target Battery Level:
                    </span>
                    <span className="font-mono font-bold text-[#0D9488] px-2 py-0.5 rounded bg-[#14F1D9]/15">
                      {targetSoc}% {targetSoc === 80 && "(Optimal Road Trip)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={startSoc + 5}
                    max="100"
                    step="5"
                    value={targetSoc}
                    onChange={(e) => setTargetSoc(Number(e.target.value))}
                    className="w-full accent-[#0D9488] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-black/40 font-mono">
                    <span>{startSoc + 5}%</span>
                    <span>100% (Full Top-up)</span>
                  </div>
                </div>
              </div>

              {/* Station Tariff Rate Adjustment */}
              <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-black/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#0D9488]" />
                  <span className="font-semibold text-black/80">
                    Station Tariff Rate:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[12.5, 17.5, 21.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setTariffPerKwh(rate)}
                      className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer ${
                        tariffPerKwh === rate
                          ? "bg-[#111312] text-[#14F1D9]"
                          : "bg-white text-black/70 border border-black/[0.08]"
                      }`}
                    >
                      ₹{rate.toFixed(1)}/kWh
                    </button>
                  ))}
                </div>
              </div>

              {/* ── REAL-TIME CALCULATED OUTPUT MATRIX ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-black/[0.06]">
                  <span className="text-[10px] font-mono text-black/50 uppercase block">
                    Energy Added
                  </span>
                  <span className="text-xl font-bold font-mono text-[#111312] mt-0.5 block">
                    {energyKwhNeeded.toFixed(1)} kWh
                  </span>
                  <span className="text-[10px] text-black/50 font-mono">
                    +{socAdded}% Capacity
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-black/[0.06]">
                  <span className="text-[10px] font-mono text-black/50 uppercase block">
                    DC Fast Charge Time
                  </span>
                  <span className="text-xl font-bold font-mono text-[#0D9488] mt-0.5 block">
                    {dcTimeMinutes > 0 ? `~${dcTimeMinutes} min` : "N/A (AC only)"}
                  </span>
                  <span className="text-[10px] text-black/50 font-mono">
                    10% to 80% Fast Lane
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-black/[0.06]">
                  <span className="text-[10px] font-mono text-black/50 uppercase block">
                    Total Session Cost
                  </span>
                  <span className="text-xl font-bold font-mono text-[#111312] mt-0.5 block">
                    ₹{chargingCostInr}
                  </span>
                  <span className="text-[10px] text-black/50 font-mono">
                    @ ₹{tariffPerKwh.toFixed(1)}/kWh
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/60">
                  <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block">
                    Petrol Money Saved
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-700 mt-0.5 block">
                    ₹{netSavingsInr}
                  </span>
                  <span className="text-[10px] text-emerald-800/80 font-mono">
                    vs. Petrol @ ₹105/L
                  </span>
                </div>
              </div>

              {/* Bonus Range Added Pill */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-black/[0.03] rounded-2xl border border-black/[0.04] text-xs gap-2">
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-[#0D9488]" />
                  <span>
                    This session adds approximately <strong className="font-mono text-black">+{kmAdded} km</strong> of real driving range.
                  </span>
                </div>
                <div className="text-[11px] font-mono text-black/50">
                  AC Home Top-up Equivalent: ~{acHours}h {acMins}m
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 3: PLUGS & CHARGER SPEEDS                                 */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "plugs" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#0D9488] font-bold block mb-1">
                Hardware Compatibility
              </span>
              <h2 className="text-2xl font-bold text-[#111312]">
                Charging Plug Standards & Station Hardware
              </h2>
              <p className="text-xs sm:text-sm text-black/60 pt-0.5">
                Explore the physical commercial dispensers and universal plug standards deployed across EVverse charging plazas.
              </p>
            </div>

            {/* ── HARDWARE LINEUP STUDIO SHOWCASE (MATCHING STATION OWNER APP) ── */}
            <div className="relative rounded-3xl overflow-hidden border border-black/[0.08] bg-white shadow-xs p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#0D9488] font-bold">
                    Installed Charger Hardware
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#111312]">
                    Commercial Dispenser Lineup Showcase
                  </h3>
                  <p className="text-xs text-black/60">
                    High-output DC fast chargers and destination AC pillars deployed across express corridors.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1 rounded-full font-bold self-start sm:self-auto flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>All Units Online & Certified</span>
                </span>
              </div>

              {/* Studio Hardware Photo from Station Owner App */}
              <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-[#FBFBFA] border border-black/[0.05]">
                <Image
                  src="/images/station-chargers-lineup.jpg"
                  alt="EVverse Station Charger Hardware Lineup"
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 100vw, 850px"
                  priority
                />
              </div>

              {/* Hardware Selector Cards (styled after reference photo pills in station owner app) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PLUG_STANDARDS.map((chg) => {
                  const isSelected = chg.id === selectedPlugId;
                  return (
                    <button
                      key={chg.id}
                      type="button"
                      onClick={() => setSelectedPlugId(chg.id)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[110px] ${
                        isSelected
                          ? "border-[#111312] bg-[#FAF9F6] shadow-xs ring-1 ring-[#111312]"
                          : "border-black/[0.06] bg-white hover:bg-[#FAF9F6]"
                      }`}
                    >
                      {/* Pill Graphic Background */}
                      <div
                        className="w-12 h-6 rounded-full flex items-center justify-center shadow-2xs mb-1.5 shrink-0"
                        style={{ background: chg.pillGradient }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#111312]" />
                      </div>

                      <div>
                        <div className="text-xs font-bold text-[#111312] leading-tight line-clamp-1">
                          {chg.hardwareModel.split(" (")[0]}
                        </div>
                        <div className="text-[10px] font-mono text-[#767D78] mt-0.5">
                          {chg.outputRange.split(" – ")[1] || chg.outputRange}
                        </div>
                      </div>

                      <div className="text-[10px] font-mono font-bold text-[#0D9488] mt-1.5">
                        {chg.typicalTariff.split(" – ")[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── INDIVIDUAL PLUG CARDS WITH DETAILED CONNECTOR IMAGES ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLUG_STANDARDS.map((plug) => {
                const isSelected = plug.id === selectedPlugId;
                return (
                  <div
                    key={plug.id}
                    onClick={() => setSelectedPlugId(plug.id)}
                    className={`rounded-3xl bg-white p-5 sm:p-6 border transition-all flex flex-col justify-between space-y-4 cursor-pointer ${
                      isSelected
                        ? "border-[#111312] ring-1 ring-[#111312] shadow-sm bg-[#FAF9F6]/40"
                        : "border-black/[0.08] shadow-xs hover:border-black/20"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Card Header with Plug Cutout Image */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          {/* Plug Connector Image in Styled Hardware Studio Container */}
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center p-2.5 shrink-0 border border-black/[0.08] relative overflow-hidden shadow-2xs"
                            style={{ background: plug.pillGradient }}
                          >
                            <div className="relative w-full h-full">
                              <Image
                                src={plug.image}
                                alt={plug.name}
                                fill
                                className="object-contain"
                                sizes="64px"
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 font-bold block">
                              {plug.type}
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-[#111312] leading-tight mt-0.5">
                              {plug.name}
                            </h3>
                            <span className="text-[10.5px] font-mono text-[#0D9488] font-semibold block mt-0.5">
                              Dispenser: {plug.hardwareModel}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-black/[0.08] shrink-0">
                          {plug.speedTier}
                        </span>
                      </div>

                      {/* Specs Matrix */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-black/[0.04]">
                          <span className="text-[9.5px] font-mono text-black/45 block">
                            Peak Output
                          </span>
                          <span className="font-mono font-bold text-[#111312] text-xs">
                            {plug.outputRange}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-black/[0.04]">
                          <span className="text-[9.5px] font-mono text-black/45 block">
                            10% → 80% Duration
                          </span>
                          <span className="font-mono font-bold text-[#0D9488] text-xs">
                            {plug.chargeTime10to80}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-black/70 pt-1">
                        <div>
                          <strong className="text-[#111312]">Best for:</strong>{" "}
                          {plug.idealFor}
                        </div>
                        <div>
                          <strong className="text-[#111312]">Vehicles:</strong>{" "}
                          {plug.compatibleModels}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs">
                      <span className="text-black/50 font-mono text-[11px]">
                        Active Station Rate:
                      </span>
                      <span className="font-mono font-bold text-[#111312]">
                        {plug.typicalTariff}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 4: DUAL-RAIL PAYMENTS (BHARAT QR + MONAD WEB3)            */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "payments" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#0D9488] font-bold block mb-1">
                Frictionless Settlement
              </span>
              <h2 className="text-2xl font-bold text-[#111312]">
                Dual-Rail Payment Architecture
              </h2>
              <p className="text-xs sm:text-sm text-black/60 pt-0.5">
                Zero walled gardens. Pay instantly using standard Indian UPI or sub-second Monad blockchain micropayments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rail 1: Bharat QR / UPI */}
              <div className="rounded-3xl bg-white p-6 border border-black/[0.08] shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 font-bold block">
                      Rail 01 • Fiat UPI
                    </span>
                    <h3 className="text-xl font-bold text-[#111312] mt-0.5">
                      Instant Bharat QR / UPI
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-black/65 leading-relaxed">
                    Designed for everyday Indian EV drivers. Scan the dynamic QR code displayed on the charger kiosk using Google Pay, PhonePe, Paytm, or any BHIM UPI bank app.
                  </p>
                  <ul className="space-y-2 text-xs text-black/75 pt-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Zero deposit required — pay only for units used</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant 1-second bank confirmation via NPCI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Automatic WhatsApp & SMS invoice receipt</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-black/[0.06] text-[11px] font-mono text-emerald-700 font-bold">
                  Compatible with 100% of Indian bank accounts
                </div>
              </div>

              {/* Rail 2: Monad Web3 */}
              <div className="rounded-3xl bg-white p-6 border border-black/[0.08] shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200/60 flex items-center justify-center">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 font-bold block">
                      Rail 02 • High-Throughput EVVM
                    </span>
                    <h3 className="text-xl font-bold text-[#111312] mt-0.5">
                      Monad Blockchain Micro-Escrow
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-black/65 leading-relaxed">
                    Engineered for autonomous vehicles, fleet depots, and decentralized energy trading. 10,000 TPS with sub-cent gas fees unlocks machine-to-machine payments.
                  </p>
                  <ul className="space-y-2 text-xs text-black/75 pt-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Smart contract escrow on Monad Testnet (Chain ID 10143)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Sub-second contactor release via cryptographic signature</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Trustless revenue split directly to station host wallet</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-black/[0.06] text-[11px] font-mono text-purple-700 font-bold">
                  Zero intermediary lock-in • Fully verifiable on-chain
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 5: DRIVER FAQS & BATTERY PRO TIPS                         */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "faqs" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#0D9488] font-bold block mb-1">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl font-bold text-[#111312]">
                Pro Tips for EV Drivers
              </h2>
              <p className="text-xs sm:text-sm text-black/60 pt-0.5">
                Expert recommendations for maximizing battery lifespan, avoiding queue delays, and smart road trip planning.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white p-5 border border-black/[0.08] shadow-xs space-y-2 hover:border-black/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#14F1D9]/15 text-[#0D9488] border border-[#14F1D9]/30 uppercase">
                      {faq.badge}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#111312]">
                      {faq.question}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-black/70 leading-relaxed pl-1 pt-0.5">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ── MINIMAL FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.06] bg-white/60 py-6 px-4 sm:px-8 text-xs text-black/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111312]">EVverse</span>
            <span>•</span>
            <span>Decision Intelligence & Connected Charging for Electric Mobility</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="hover:text-black transition-colors">
              Landing Page
            </Link>
            <Link href="/users/stations" className="hover:text-black transition-colors">
              Driver Map
            </Link>
            <Link href="/station-owners" className="hover:text-black transition-colors">
              Station Owner Hub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
