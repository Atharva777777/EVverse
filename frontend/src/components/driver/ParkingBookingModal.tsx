"use client";

import React, { useState } from "react";
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
  startTime: string;
  expiryTime: string;
  status: "confirmed" | "active" | "cancelled";
}

interface ParkingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: LiveStation | null;
  onStartNavigation?: (station: LiveStation) => void;
}

const DURATION_OPTIONS = [
  { mins: 30, label: "30 min", price: "₹40", usdPrice: "$1.50" },
  { mins: 45, label: "45 min", price: "₹60", usdPrice: "$2.20" },
  { mins: 60, label: "1 hour", price: "₹80", usdPrice: "$3.00" },
  { mins: 90, label: "1.5 hours", price: "₹120", usdPrice: "$4.50" },
  { mins: 120, label: "2 hours", price: "₹150", usdPrice: "$5.50" },
];

export function ParkingBookingModal({
  isOpen,
  onClose,
  station,
  onStartNavigation,
}: ParkingBookingModalProps) {
  const [selectedDurationMins, setSelectedDurationMins] = useState<number>(45);
  const [selectedBay, setSelectedBay] = useState<string>("Bay 02 (Fast DC)");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [activeBooking, setActiveBooking] = useState<ParkingBooking | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen || !station) return null;

  const selectedDuration =
    DURATION_OPTIONS.find((d) => d.mins === selectedDurationMins) ||
    DURATION_OPTIONS[1];

  const handleConfirmBooking = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const expiry = new Date(now.getTime() + selectedDurationMins * 60000);

      const booking: ParkingBooking = {
        id: `RES-${Math.floor(1000 + Math.random() * 9000)}-EV`,
        stationId: station.station_id,
        stationName: station.name,
        bayNumber: selectedBay,
        connectorType: station.connector_types?.[0] || "CCS2 Combo",
        durationMinutes: selectedDurationMins,
        totalCost: selectedDuration.price,
        startTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        expiryTime: expiry.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "confirmed",
      };

      setActiveBooking(booking);
      setIsProcessing(false);

      // Save to local driver storage
      try {
        const savedBookings = JSON.parse(
          localStorage.getItem("evverse_driver_parking_bookings") || "[]"
        );
        savedBookings.unshift(booking);
        localStorage.setItem(
          "evverse_driver_parking_bookings",
          JSON.stringify(savedBookings.slice(0, 10))
        );
      } catch (e) {
        console.warn("Could not save booking to localStorage:", e);
      }
    }, 700);
  };

  const handleCancelBooking = () => {
    setActiveBooking(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Book Parking Spot"
      className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-sm border border-black/[0.08] shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#111312] text-white flex items-center justify-center">
              <Car size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111312]">
                {activeBooking ? "Spot Reserved" : "Reserve Parking Spot"}
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
          /* ── CONFIRMED BOOKING TICKET VIEW ────────────────────────── */
          <div className="space-y-4">
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl text-center space-y-2">
              <CheckCircle2 size={32} className="text-[#16A34A] mx-auto" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold">
                  Hold Confirmed
                </span>
                <div className="text-lg font-bold text-[#111312] mt-0.5">
                  {activeBooking.bayNumber}
                </div>
              </div>
              <p className="text-xs text-[#166534]">
                Your spot is held until {activeBooking.expiryTime}. Automatic barrier unlock upon arrival.
              </p>
            </div>

            {/* Ticket Details */}
            <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-black/[0.05] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#767D78]">Booking Code:</span>
                <span className="font-mono font-bold text-[#111312]">
                  {activeBooking.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767D78]">Reserved Duration:</span>
                <span className="font-medium text-[#111312]">
                  {activeBooking.durationMinutes} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767D78]">Valid Window:</span>
                <span className="font-medium text-[#111312]">
                  {activeBooking.startTime} – {activeBooking.expiryTime}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/[0.05] pt-2">
                <span className="text-[#767D78]">Spot Fee Paid:</span>
                <span className="font-bold text-[#16A34A]">
                  {activeBooking.totalCost}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onStartNavigation) onStartNavigation(station);
                  onClose();
                }}
                className="w-full min-h-[46px] py-3 bg-[#111312] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 hover:bg-[#252826] cursor-pointer"
              >
                <Navigation size={14} className="text-[#C8F369]" />
                <span>Navigate to Reserved Spot</span>
              </button>

              <button
                type="button"
                onClick={handleCancelBooking}
                className="w-full min-h-[40px] py-2 bg-[#FAF9F6] text-[#DC2626] text-xs font-semibold rounded-2xl border border-black/[0.06] hover:bg-[#FEE2E2] cursor-pointer"
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        ) : (
          /* ── BOOKING CONFIGURATION VIEW ───────────────────────────── */
          <div className="space-y-4">
            {/* 1. Duration Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111312] flex items-center gap-1">
                <Clock size={13} className="text-[#16A34A]" />
                <span>Select Duration</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {DURATION_OPTIONS.map((opt) => {
                  const isSelected = selectedDurationMins === opt.mins;
                  return (
                    <button
                      key={opt.mins}
                      type="button"
                      onClick={() => setSelectedDurationMins(opt.mins)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-[#111312] text-white border-[#111312] shadow-xs"
                          : "bg-[#FAF9F6] text-[#111312] border-black/[0.06] hover:bg-[#F4F3EE]"
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div
                        className={`text-[10px] font-mono mt-0.5 ${
                          isSelected ? "text-[#C8F369]" : "text-[#767D78]"
                        }`}
                      >
                        {opt.price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Bay Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111312] flex items-center gap-1">
                <Zap size={13} className="text-[#16A34A]" />
                <span>Select Charging Stall</span>
              </label>
              <select
                value={selectedBay}
                onChange={(e) => setSelectedBay(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-black/[0.1] bg-white text-[#111312] cursor-pointer"
              >
                <option value="Bay 01 (CCS2 180kW)">Bay 01 — CCS2 (180 kW Ultra DC)</option>
                <option value="Bay 02 (Fast DC)">Bay 02 — CCS2 / Type 2 (120 kW Fast DC)</option>
                <option value="Bay 03 (Dedicated EV)">Bay 03 — Type 2 Mennekes (22 kW AC)</option>
                <option value="Bay 04 (Accessible)">Bay 04 — Universal Accessible EV Bay</option>
              </select>
            </div>

            {/* 3. Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111312] flex items-center gap-1">
                <CreditCard size={13} className="text-[#16A34A]" />
                <span>Payment Method</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-[#111312] bg-[#FAF9F6] font-semibold text-[#111312]"
                      : "border-black/[0.08] text-[#525854]"
                  }`}
                >
                  <CreditCard size={14} className="text-[#16A34A]" />
                  <span>Card / UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer ${
                    paymentMethod === "wallet"
                      ? "border-[#111312] bg-[#FAF9F6] font-semibold text-[#111312]"
                      : "border-black/[0.08] text-[#525854]"
                  }`}
                >
                  <ShieldCheck size={14} className="text-[#16A34A]" />
                  <span>EVverse Pay</span>
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-black/[0.05] space-y-1 text-xs">
              <div className="flex justify-between text-[#525854]">
                <span>Parking Bay Hold ({selectedDuration.label}):</span>
                <span className="font-mono">{selectedDuration.price}</span>
              </div>
              <div className="flex justify-between text-[#525854]">
                <span>Convenience & Tax:</span>
                <span className="font-mono">₹0 (Free)</span>
              </div>
              <div className="flex justify-between font-bold text-[#111312] border-t border-black/[0.05] pt-1.5 mt-1">
                <span>Total Amount:</span>
                <span className="text-[#16A34A] font-mono text-sm">
                  {selectedDuration.price}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmBooking}
                className="w-full min-h-[48px] py-3.5 bg-[#111312] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#252826] active:scale-[0.99] transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Reserving Bay...</span>
                ) : (
                  <>
                    <Car size={15} className="text-[#C8F369]" />
                    <span>Confirm & Pay {selectedDuration.price}</span>
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
