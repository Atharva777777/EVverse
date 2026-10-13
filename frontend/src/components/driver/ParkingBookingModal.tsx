"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  CheckCircle2,
  Car,
  Zap,
  CreditCard,
  Navigation,
  ShieldCheck,
  Calendar,
  AlertCircle,
  QrCode,
  Lock,
  Unlock,
} from "lucide-react";
import type { LiveStation } from "@/types/api";

export interface ParkingBooking {
  id: string;
  stationId: string;
  stationName: string;
  bayNumber: string;
  connectorType: string;
  durationMinutes: number;
  totalCost: string;
  pinCode: string;
  startTime: string;
  expiryTime: string;
  expiryTimestamp: number;
  status: "confirmed" | "active" | "cancelled";
}

interface ParkingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: LiveStation | null;
  onStartNavigation?: (station: LiveStation) => void;
}

const RESERVATION_FEE_OPTIONS = [
  { mins: 30, label: "30 min hold", fee: "₹49", tag: "Most Popular" },
  { mins: 45, label: "45 min hold", fee: "₹69", tag: "Extra Buffer" },
  { mins: 60, label: "60 min hold", fee: "₹89", tag: "Long Transit" },
  { mins: 90, label: "90 min hold", fee: "₹119", tag: "Highway Stop" },
];

export function ParkingBookingModal({
  isOpen,
  onClose,
  station,
  onStartNavigation,
}: ParkingBookingModalProps) {
  const [selectedMins, setSelectedMins] = useState<number>(30);
  const [selectedBay, setSelectedBay] = useState<string>("Bay 02 (180 kW Ultra DC)");
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [activeBooking, setActiveBooking] = useState<ParkingBooking | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800);

  // Check if there is an existing booking for this station in localStorage
  useEffect(() => {
    if (isOpen && station) {
      try {
        const stored = localStorage.getItem("evverse_active_spot_booking");
        if (stored) {
          const parsed: ParkingBooking = JSON.parse(stored);
          const timeLeft = Math.floor((parsed.expiryTimestamp - Date.now()) / 1000);
          if (timeLeft > 0 && parsed.stationId === station.station_id) {
            setActiveBooking(parsed);
            setSecondsRemaining(timeLeft);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen, station]);

  // Live countdown timer for active booking
  useEffect(() => {
    if (!activeBooking) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBooking]);

  if (!isOpen || !station) return null;

  const currentOption =
    RESERVATION_FEE_OPTIONS.find((o) => o.mins === selectedMins) ||
    RESERVATION_FEE_OPTIONS[0];

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const now = Date.now();
      const expiryTimestamp = now + selectedMins * 60 * 1000;
      const expiryDate = new Date(expiryTimestamp);

      const booking: ParkingBooking = {
        id: `RES-${Math.floor(1000 + Math.random() * 9000)}-EV`,
        stationId: station.station_id,
        stationName: station.name,
        bayNumber: selectedBay,
        connectorType: station.connector_types?.[0] || "CCS2 Combo",
        durationMinutes: selectedMins,
        totalCost: currentOption.fee,
        pinCode: String(Math.floor(1000 + Math.random() * 9000)),
        startTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        expiryTime: expiryDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        expiryTimestamp,
        status: "confirmed",
      };

      setActiveBooking(booking);
      setSecondsRemaining(selectedMins * 60);
      setIsProcessing(false);

      // Save to driver storage and notify app
      try {
        localStorage.setItem("evverse_active_spot_booking", JSON.stringify(booking));
        window.dispatchEvent(new CustomEvent("evverse-spot-booking-changed", { detail: booking }));
      } catch (e) {
        console.warn("Storage error:", e);
      }
    }, 750);
  };

  const handleCancelBooking = () => {
    try {
      localStorage.removeItem("evverse_active_spot_booking");
      window.dispatchEvent(new CustomEvent("evverse-spot-booking-changed", { detail: null }));
    } catch (e) {
      // ignore
    }
    setActiveBooking(null);
    onClose();
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Book Charging Spot"
      className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-sm border border-black/[0.08] shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#111312] text-white flex items-center justify-center">
              <Zap size={16} className="text-[#C8F369]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111312]">
                {activeBooking ? "Charging Spot Reserved" : "Book Charging Spot"}
              </h3>
              <p className="text-[11px] text-[#525854] truncate max-w-[200px]">
                {station.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking modal"
            className="w-8 h-8 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#525854] hover:bg-[#F4F3EE] cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {activeBooking ? (
          /* ── ACTIVE RESERVATION PASS VIEW ────────────────────────── */
          <div className="space-y-4">
            {/* Live Hold Status Card */}
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] mx-auto">
                <CheckCircle2 size={26} />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold">
                  Stall Barrier Reserved
                </span>
                <div className="text-base font-bold text-[#111312] mt-0.5">
                  {activeBooking.bayNumber}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#86EFAC] text-xs font-mono font-bold text-[#15803D]">
                <Clock size={12} />
                <span>{formatCountdown(secondsRemaining)} remaining</span>
              </div>
            </div>

            {/* Digital Stall Ticket & Barrier Unlock PIN */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-black/[0.05] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <div>
                  <div className="text-[10px] text-[#767D78] uppercase font-mono">
                    Stall Barrier PIN
                  </div>
                  <div className="text-xl font-mono font-bold text-[#111312] tracking-widest mt-0.5">
                    {activeBooking.pinCode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#767D78] uppercase font-mono">
                    Booking Code
                  </div>
                  <div className="text-xs font-mono font-bold text-[#111312] mt-0.5">
                    {activeBooking.id}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#525854]">
                  <span>Reserved Window:</span>
                  <span className="font-semibold text-[#111312]">
                    {activeBooking.startTime} – {activeBooking.expiryTime}
                  </span>
                </div>
                <div className="flex justify-between text-[#525854]">
                  <span>Hold Duration:</span>
                  <span className="font-semibold text-[#111312]">
                    {activeBooking.durationMinutes} minutes
                  </span>
                </div>
                <div className="flex justify-between text-[#525854]">
                  <span>Booking Fee Paid:</span>
                  <span className="font-bold text-[#16A34A]">
                    {activeBooking.totalCost}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-black/[0.04] text-[10.5px] text-[#525854] flex items-start gap-2">
                <ShieldCheck size={14} className="text-[#16A34A] shrink-0 mt-0.5" />
                <span>
                  The stall barrier will unlock automatically via camera license plate recognition or by keying your 4-digit PIN.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onStartNavigation) onStartNavigation(station);
                  onClose();
                }}
                className="w-full min-h-[46px] py-3 bg-[#111312] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 hover:bg-[#252826] cursor-pointer shadow-md"
              >
                <Navigation size={14} className="text-[#C8F369]" />
                <span>Navigate to Reserved Stall</span>
              </button>

              <button
                type="button"
                onClick={handleCancelBooking}
                className="w-full min-h-[40px] py-2 bg-[#FAF9F6] text-[#DC2626] text-xs font-semibold rounded-2xl border border-black/[0.06] hover:bg-[#FEE2E2] cursor-pointer"
              >
                Cancel Reservation & Release Stall
              </button>
            </div>
          </div>
        ) : (
          /* ── SPOT BOOKING CONFIGURATION VIEW ──────────────────────── */
          <div className="space-y-4">
            {/* Value Proposition Banner */}
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl flex items-start gap-2.5">
              <Zap size={15} className="text-[#16A34A] shrink-0 mt-0.5" />
              <div className="text-xs text-[#166534] leading-relaxed">
                <span className="font-bold">Guaranteed Stall: </span>
                Pay a small fee to hold your charger stall. The barrier stays locked until your vehicle arrives.
              </div>
            </div>

            {/* 1. Choose Hold Duration & Small Fee */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111312] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-[#16A34A]" />
                  <span>Hold Duration & Small Fee</span>
                </span>
                <span className="text-[10px] text-[#767D78] font-mono">
                  Refundable if cancelled in 10m
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {RESERVATION_FEE_OPTIONS.map((opt) => {
                  const isSelected = selectedMins === opt.mins;
                  return (
                    <button
                      key={opt.mins}
                      type="button"
                      onClick={() => setSelectedMins(opt.mins)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[48px] flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#111312] text-white border-[#111312] shadow-xs"
                          : "bg-[#FAF9F6] text-[#111312] border-black/[0.06] hover:bg-[#F4F3EE]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span
                          className={`text-xs font-mono font-bold ${
                            isSelected ? "text-[#C8F369]" : "text-[#16A34A]"
                          }`}
                        >
                          {opt.fee}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono mt-0.5 ${
                          isSelected ? "text-[#A0AAA2]" : "text-[#767D78]"
                        }`}
                      >
                        {opt.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Choose Stall / Bay */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111312] flex items-center gap-1">
                <Car size={13} className="text-[#16A34A]" />
                <span>Select Charging Stall</span>
              </label>
              <select
                value={selectedBay}
                onChange={(e) => setSelectedBay(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-black/[0.1] bg-white text-[#111312] cursor-pointer"
              >
                <option value="Bay 01 (180 kW Ultra DC)">Bay 01 — 180 kW Ultra Fast DC (CCS2)</option>
                <option value="Bay 02 (120 kW Fast DC)">Bay 02 — 120 kW Fast DC (CCS2 / Type 2)</option>
                <option value="Bay 03 (60 kW Fast DC)">Bay 03 — 60 kW Fast DC (CCS2 Combo)</option>
                <option value="Bay 04 (22 kW Fast AC)">Bay 04 — 22 kW Mennekes (Type 2 AC)</option>
              </select>
            </div>

            {/* 3. Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111312] flex items-center gap-1">
                <CreditCard size={13} className="text-[#16A34A]" />
                <span>Payment Method</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { id: "upi", label: "UPI / GPay" },
                  { id: "card", label: "Card" },
                  { id: "wallet", label: "EVverse" },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`py-2 px-1 text-center rounded-xl border text-[11px] font-medium cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? "border-[#111312] bg-[#FAF9F6] font-bold text-[#111312]"
                        : "border-black/[0.08] text-[#525854]"
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fee Summary */}
            <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-black/[0.05] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#525854]">
                <span>Reservation Hold ({currentOption.label}):</span>
                <span className="font-mono">{currentOption.fee}</span>
              </div>
              <div className="flex justify-between text-[#525854]">
                <span>Automatic Barrier Unlock:</span>
                <span className="font-mono text-[#16A34A]">Included</span>
              </div>
              <div className="flex justify-between font-bold text-[#111312] border-t border-black/[0.05] pt-1.5">
                <span>Total Booking Fee:</span>
                <span className="text-[#16A34A] font-mono text-sm">
                  {currentOption.fee}
                </span>
              </div>
            </div>

            {/* Submit & Pay Button */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="w-full min-h-[48px] py-3.5 bg-[#111312] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#252826] active:scale-[0.99] transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Securing Stall...</span>
                ) : (
                  <>
                    <Zap size={14} className="text-[#C8F369]" />
                    <span>Pay {currentOption.fee} & Book Spot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
