'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Building2,
  DollarSign,
  TrendingUp,
  Star,
  ChevronDown,
  ShieldCheck,
  MapPin,
  Clock,
  Layers,
  ArrowUpRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Maximize2
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CodedStationChargersLineup } from './CodedStationChargersLineup';
import { StationOwnerPaymentsConsole } from './StationOwnerPaymentsConsole';
import { StationOwnerDemandTab } from './StationOwnerDemandTab';
import { StationOwnerReviewsTab } from './StationOwnerReviewsTab';

export interface OwnedStation {
  id: string;
  name: string;
  location: string;
  address: string;
  status: 'Online' | 'Maintenance' | 'Offline';
  totalBays: number;
  activeBays: number;
  peakKw: number;
  todayRevenue: string;
  monthlyRevenue: string;
  parkingFeeToday: string;
  totalSessionsToday: number;
  kwhDeliveredToday: string;
  rating: number;
  reviewCount: number;
  ratePerKwh: number;
  parkingFeePerHour: number;
}

const OWNED_STATIONS: OwnedStation[] = [
  {
    id: 'superhub-pune',
    name: 'Expressway Fast Superhub',
    location: 'Mumbai-Pune Expressway',
    address: 'Km 48, Near Khalapur Toll Plaza, Maharashtra',
    status: 'Online',
    totalBays: 6,
    activeBays: 5,
    peakKw: 180,
    todayRevenue: '₹24,850',
    monthlyRevenue: '₹6,84,200',
    parkingFeeToday: '₹3,400',
    totalSessionsToday: 38,
    kwhDeliveredToday: '1,142 kWh',
    rating: 4.8,
    reviewCount: 128,
    ratePerKwh: 18.5,
    parkingFeePerHour: 50,
  },
  {
    id: 'bkc-mumbai',
    name: 'BKC Commercial Hub',
    location: 'Bandra Kurla Complex, Mumbai',
    address: 'G-Block, Opp. Trade Centre, Bandra East, Mumbai',
    status: 'Online',
    totalBays: 4,
    activeBays: 3,
    peakKw: 120,
    todayRevenue: '₹18,400',
    monthlyRevenue: '₹5,12,000',
    parkingFeeToday: '₹2,600',
    totalSessionsToday: 26,
    kwhDeliveredToday: '890 kWh',
    rating: 4.9,
    reviewCount: 94,
    ratePerKwh: 16.0,
    parkingFeePerHour: 60,
  },
  {
    id: 'indiranagar-blr',
    name: 'Indiranagar Transit Hub',
    location: '100 Feet Road, Bengaluru',
    address: '12th Main Junction, Indiranagar, Bengaluru',
    status: 'Online',
    totalBays: 6,
    activeBays: 4,
    peakKw: 150,
    todayRevenue: '₹21,120',
    monthlyRevenue: '₹5,90,400',
    parkingFeeToday: '₹2,800',
    totalSessionsToday: 32,
    kwhDeliveredToday: '980 kWh',
    rating: 4.7,
    reviewCount: 112,
    ratePerKwh: 17.0,
    parkingFeePerHour: 40,
  },
];

type OwnerTab = 'hub' | 'earnings' | 'demand' | 'reviews';

export function StationOwnerMobileApp() {
  const [selectedStationId, setSelectedStationId] = useState<string>(OWNED_STATIONS[0].id);
  const [showStationPicker, setShowStationPicker] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<OwnerTab>('hub');
  const [isFramed, setIsFramed] = useState<boolean>(true);

  // Station controls state
  const [autoReleaseEnabled, setAutoReleaseEnabled] = useState<boolean>(true);
  const [nightIllumination, setNightIllumination] = useState<boolean>(true);
  const [parkingReservationsActive, setParkingReservationsActive] = useState<boolean>(true);

  const currentStation = OWNED_STATIONS.find((s) => s.id === selectedStationId) || OWNED_STATIONS[0];

  return (
    <div className="min-h-screen bg-[#EDECE8] text-[#111312] flex flex-col items-center justify-start py-0 md:py-6 selection:bg-[#C8F369] selection:text-[#111312]">
      {/* Top Desktop Studio Navigation Toolbar */}
      <header className="w-full max-w-5xl px-4 py-2.5 mb-2 hidden md:flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <BrandLogo suffix="Owner Studio" />
          </Link>

          <div className="h-4 w-px bg-black/10" />

          {/* Quick role switcher */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/users/stations"
              className="text-black/60 hover:text-black font-medium transition-colors"
            >
              Driver View
            </Link>
            <span className="text-black/30">•</span>
            <span className="font-semibold text-black px-2 py-0.5 rounded-full bg-white shadow-2xs">
              Station Owner
            </span>
            <span className="text-black/30">•</span>
            <Link
              href="/investor"
              className="text-black/60 hover:text-black font-medium transition-colors"
            >
              Investor View
            </Link>
          </div>
        </div>

        {/* Viewport Frame Toggle */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/[0.08] shadow-2xs">
          <button
            type="button"
            onClick={() => setIsFramed(true)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
              isFramed ? 'bg-[#111312] text-white shadow-xs' : 'text-black/60 hover:text-black'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Device</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFramed(false)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
              !isFramed ? 'bg-[#111312] text-white shadow-xs' : 'text-black/60 hover:text-black'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit Canvas</span>
          </button>
        </div>
      </header>

      {/* Main Container / Mobile Phone Shell */}
      <div
        className={`w-full transition-all duration-300 ${
          isFramed
            ? 'max-w-[430px] rounded-[50px] shadow-[0_24px_70px_rgba(0,0,0,0.18)] border-[10px] border-[#1C1F1D] bg-[#FAF9F6] overflow-hidden min-h-[880px] my-auto'
            : 'max-w-md w-full bg-[#FAF9F6] min-h-screen md:rounded-3xl md:shadow-lg md:border md:border-black/[0.08]'
        } flex flex-col relative`}
      >
        {/* Dynamic Island / Status Bar (When in phone frame mode) */}
        {isFramed && (
          <div className="h-10 w-full flex items-center justify-between px-7 shrink-0 z-40 bg-[#FAF9F6] border-b border-black/[0.03] select-none">
            <span className="text-[12px] font-semibold text-[#111312] font-mono">9:41</span>
            <div className="h-4.5 w-24 bg-black rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              <span className="text-[9px] font-mono font-bold text-white tracking-wider">LIVE HUB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-black/60">5G</span>
              <div className="w-4 h-2 rounded-xs border border-black/40 flex items-center p-0.5">
                <div className="w-2.5 h-full bg-black rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile Header: Station Switcher ── */}
        <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md px-4 pt-3 pb-3 border-b border-black/[0.06]">
          <div className="flex items-center justify-between">
            {/* Station Selector Dropdown Button */}
            <div className="relative flex-1 mr-3">
              <button
                type="button"
                onClick={() => setShowStationPicker(!showStationPicker)}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-white border border-black/[0.08] shadow-2xs hover:border-black/20 transition-all text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#111312] text-[#C8F369] flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#111312] truncate block">
                        {currentStation.name}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                    <span className="text-[10px] text-black/50 block truncate">
                      {currentStation.location}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-black/40 shrink-0 transition-transform ${showStationPicker ? 'rotate-180' : ''}`} />
              </button>

              {/* Station Switcher Dropdown Modal */}
              {showStationPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl p-2 shadow-xl border border-black/10 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black/40">
                    Your Owned Stations ({OWNED_STATIONS.length})
                  </div>
                  <div className="space-y-1">
                    {OWNED_STATIONS.map((station) => {
                      const isSelected = station.id === currentStation.id;
                      return (
                        <button
                          key={station.id}
                          type="button"
                          onClick={() => {
                            setSelectedStationId(station.id);
                            setShowStationPicker(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-[#111312] text-white' : 'hover:bg-black/[0.04] text-[#111312]'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-semibold">{station.name}</p>
                            <p className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-black/50'}`}>
                              {station.location} • {station.totalBays} Bays
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#C8F369]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{currentStation.activeBays}/{currentStation.totalBays} Busy</span>
            </div>
          </div>
        </header>

        {/* ── Scrollable Tab Content ── */}
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
          {/* TAB 1: HUB (Hardware, Coded Image, Telemetry, Controls) */}
          {activeTab === 'hub' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Daily Telemetry Ribbon */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white p-3 border border-black/[0.06] shadow-2xs">
                  <span className="text-[10px] text-black/50 font-medium block">Today Generated</span>
                  <span className="text-base font-bold text-[#111312] mt-0.5 block">{currentStation.todayRevenue}</span>
                  <span className="text-[9px] text-emerald-600 font-semibold">+18% vs avg</span>
                </div>
                <div className="rounded-2xl bg-white p-3 border border-black/[0.06] shadow-2xs">
                  <span className="text-[10px] text-black/50 font-medium block">Dispatched</span>
                  <span className="text-base font-bold text-[#111312] mt-0.5 block">{currentStation.kwhDeliveredToday}</span>
                  <span className="text-[9px] text-black/50">{currentStation.totalSessionsToday} Sessions</span>
                </div>
                <div className="rounded-2xl bg-white p-3 border border-black/[0.06] shadow-2xs">
                  <span className="text-[10px] text-black/50 font-medium block">Driver Rating</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-[#111312] text-[#111312]" />
                    <span className="text-base font-bold text-[#111312]">{currentStation.rating}</span>
                  </div>
                  <span className="text-[9px] text-black/50">{currentStation.reviewCount} reviews</span>
                </div>
              </div>

              {/* Real Coded Image & Charger Hardware Presentation */}
              <CodedStationChargersLineup stationName={currentStation.name} />

              {/* Station Details & Tariff Card */}
              <div className="rounded-2xl bg-white p-4 border border-black/[0.06] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06]">
                  <span className="text-xs font-semibold text-[#111312]">Station Parameters</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/[0.04] text-black/60 font-mono">
                    ID: {currentStation.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-black/50 block text-[11px]">Energy Tariff</span>
                    <span className="font-bold text-[#111312] text-sm">₹{currentStation.ratePerKwh.toFixed(2)} / kWh</span>
                  </div>
                  <div>
                    <span className="text-black/50 block text-[11px]">Parking Hold Rate</span>
                    <span className="font-bold text-[#111312] text-sm">₹{currentStation.parkingFeePerHour} / hr</span>
                  </div>
                  <div>
                    <span className="text-black/50 block text-[11px]">Operating Hours</span>
                    <span className="font-medium text-[#111312]">24/7 Unrestricted</span>
                  </div>
                  <div>
                    <span className="text-black/50 block text-[11px]">Peak Grid Capacity</span>
                    <span className="font-medium text-[#111312]">{currentStation.peakKw} kW Available</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-black/[0.05] flex items-center gap-2 text-[11px] text-black/60">
                  <MapPin className="w-3.5 h-3.5 text-black/40 shrink-0" />
                  <span className="truncate">{currentStation.address}</span>
                </div>
              </div>

              {/* Quick Station Operating Toggles */}
              <div className="rounded-2xl bg-white p-4 border border-black/[0.06] shadow-2xs space-y-3">
                <span className="text-xs font-semibold text-[#111312] block">Smart Station Controls</span>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-[#111312]">Driver Parking Reservations</p>
                      <p className="text-[11px] text-black/50">Allow 30-min bay booking hold</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setParkingReservationsActive(!parkingReservationsActive)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        parkingReservationsActive ? 'bg-[#111312]' : 'bg-black/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          parkingReservationsActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-black/[0.04]">
                    <div>
                      <p className="font-medium text-[#111312]">Auto-Release Plug Lock</p>
                      <p className="text-[11px] text-black/50">Unlock connector when charge reaches 100%</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoReleaseEnabled(!autoReleaseEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        autoReleaseEnabled ? 'bg-[#111312]' : 'bg-black/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          autoReleaseEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-black/[0.04]">
                    <div>
                      <p className="font-medium text-[#111312]">Night Bay Lighting</p>
                      <p className="text-[11px] text-black/50">Automatic high-lumen canopy LED sensor</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNightIllumination(!nightIllumination)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        nightIllumination ? 'bg-[#111312]' : 'bg-black/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          nightIllumination ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EARNINGS & PAYOUTS CONSOLE */}
          {activeTab === 'earnings' && (
            <div className="animate-in fade-in duration-200">
              <StationOwnerPaymentsConsole />
            </div>
          )}

          {/* TAB 3: DEMAND & LIVE OCCUPANCY PROFILE */}
          {activeTab === 'demand' && (
            <div className="animate-in fade-in duration-200">
              <StationOwnerDemandTab />
            </div>
          )}

          {/* TAB 4: REVIEWS & DRIVER SATISFACTION */}
          {activeTab === 'reviews' && (
            <div className="animate-in fade-in duration-200">
              <StationOwnerReviewsTab
                stationName={currentStation.name}
                averageRating={currentStation.rating}
                totalReviews={currentStation.reviewCount}
              />
            </div>
          )}
        </main>

        {/* ── Fixed Bottom Navigation Bar (4 clean tabs, zero emojis) ── */}
        <nav className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/[0.08] px-3 py-2 flex items-center justify-around">
          <button
            type="button"
            onClick={() => setActiveTab('hub')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'hub' ? 'text-[#111312]' : 'text-black/40 hover:text-black/70'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'hub' ? 'bg-[#111312] text-[#C8F369]' : ''}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('earnings')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'earnings' ? 'text-[#111312]' : 'text-black/40 hover:text-black/70'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'earnings' ? 'bg-[#111312] text-[#C8F369]' : ''}`}>
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">Earnings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('demand')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'demand' ? 'text-[#111312]' : 'text-black/40 hover:text-black/70'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'demand' ? 'bg-[#111312] text-[#C8F369]' : ''}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">Demand</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'reviews' ? 'text-[#111312]' : 'text-black/40 hover:text-black/70'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'reviews' ? 'bg-[#111312] text-[#C8F369]' : ''}`}>
              <Star className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">Reviews</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
