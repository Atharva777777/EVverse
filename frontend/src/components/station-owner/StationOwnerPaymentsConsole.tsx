"use client";

import React, { useState } from "react";
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Download,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Car,
  Zap,
  Sliders,
  Check,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "charging" | "parking";
  bay: string;
  stationName: string;
  customer: string;
  details: string;
  amount: string;
  fee: string;
  net: string;
  time: string;
  status: "settled" | "processing";
  method: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-9842",
    type: "charging",
    bay: "Bay 01 (CCS2 180kW)",
    stationName: "Expressway Fast Superhub",
    customer: "MH-12-EV-4402",
    details: "42.5 kWh delivered • 38m dwell",
    amount: "₹765",
    fee: "₹15",
    net: "₹750",
    time: "12 mins ago",
    status: "settled",
    method: "UPI",
  },
  {
    id: "TXN-9841",
    type: "parking",
    bay: "Bay 02 (Dedicated Hold)",
    stationName: "BKC Commercial Hub",
    customer: "MH-01-EE-8910",
    details: "45 min reserved spot hold",
    amount: "₹60",
    fee: "₹2",
    net: "₹58",
    time: "34 mins ago",
    status: "settled",
    method: "Apple Pay",
  },
  {
    id: "TXN-9840",
    type: "charging",
    bay: "Bay 04 (CCS2 120kW)",
    stationName: "Expressway Fast Superhub",
    customer: "DL-03-EV-1029",
    details: "58.2 kWh delivered • 45m dwell",
    amount: "₹1,048",
    fee: "₹21",
    net: "₹1,027",
    time: "1 hour ago",
    status: "settled",
    method: "Credit Card",
  },
  {
    id: "TXN-9839",
    type: "parking",
    bay: "Bay 03 (Fast DC)",
    stationName: "Indiranagar Transit Hub",
    customer: "KA-05-EV-7721",
    details: "60 min reserved spot hold",
    amount: "₹80",
    fee: "₹3",
    net: "₹77",
    time: "2 hours ago",
    status: "settled",
    method: "UPI",
  },
  {
    id: "TXN-9838",
    type: "charging",
    bay: "Bay 02 (Fast DC)",
    stationName: "BKC Commercial Hub",
    customer: "MH-02-EV-9901",
    details: "31.0 kWh delivered • 28m dwell",
    amount: "₹558",
    fee: "₹11",
    net: "₹547",
    time: "3 hours ago",
    status: "processing",
    method: "EVverse Pay",
  },
];

export function StationOwnerPaymentsConsole() {
  const [filterType, setFilterType] = useState<"all" | "charging" | "parking">("all");
  const [payoutTriggered, setPayoutTriggered] = useState(false);
  const [parkingRatePerHour, setParkingRatePerHour] = useState<number>(60);
  const [baseTariffPerKwh, setBaseTariffPerKwh] = useState<number>(18);
  const [isSavedRates, setIsSavedRates] = useState(false);

  const filteredTxns = INITIAL_TRANSACTIONS.filter((t) => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });

  const handleTriggerPayout = () => {
    setPayoutTriggered(true);
    setTimeout(() => {
      setPayoutTriggered(false);
    }, 4000);
  };

  const handleSaveRates = () => {
    setIsSavedRates(true);
    setTimeout(() => setIsSavedRates(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* ── SECTION HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2
            style={{
              fontFamily: "Times New Roman, serif",
              fontSize: "26px",
              fontWeight: 400,
              color: "var(--color-ink)",
              margin: 0,
            }}
          >
            Station Revenue & Payment Settlements
          </h2>
          <p className="text-xs text-[var(--color-ink-3)] mt-1">
            Real-time earnings from fast charging sessions and reserved parking bay holds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTriggerPayout}
            disabled={payoutTriggered}
            className="px-4 py-2 bg-[var(--color-navy-900)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
          >
            {payoutTriggered ? (
              <>
                <CheckCircle2 size={13} className="text-[#C8F369]" />
                <span>Transfer Initiated</span>
              </>
            ) : (
              <>
                <ArrowUpRight size={13} />
                <span>Request Instant Payout</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── REVENUE SUMMARY CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--color-border)] shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-3)]">
            Total Revenue (30 Days)
          </div>
          <div
            className="text-2xl sm:text-3xl font-normal text-[var(--color-navy-900)] mt-1.5"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            ₹3,42,850
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#16A34A] mt-2 font-medium">
            <TrendingUp size={12} />
            <span>+18.4% vs last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--color-border)] shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-3)]">
            Charging Energy Sales
          </div>
          <div
            className="text-2xl sm:text-3xl font-normal text-[var(--color-navy-900)] mt-1.5"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            ₹2,64,200
          </div>
          <div className="text-[11px] text-[var(--color-ink-3)] mt-2">
            14,680 kWh delivered to drivers
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--color-border)] shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-3)]">
            Parking Spot Holds
          </div>
          <div
            className="text-2xl sm:text-3xl font-normal text-[var(--color-navy-900)] mt-1.5"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            ₹78,650
          </div>
          <div className="text-[11px] text-[var(--color-ink-3)] mt-2">
            1,310 reserved bay sessions
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--color-border)] shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-3)]">
            Next Bank Settlement
          </div>
          <div
            className="text-2xl sm:text-3xl font-normal text-[#15803D] mt-1.5"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            ₹84,200
          </div>
          <div className="text-[11px] text-[var(--color-ink-3)] mt-2 flex items-center gap-1">
            <Clock size={11} />
            <span>Auto-deposit on Friday (NEFT)</span>
          </div>
        </div>
      </div>

      {/* ── SETTLEMENT ACCOUNT & PRICING CONFIGURATION ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Bank Card */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-3)] font-mono">
              Payout Destination
            </span>
            <span className="text-[10px] font-mono bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck size={11} />
              Verified Account
            </span>
          </div>

          <div className="p-4 bg-[var(--color-canvas)] rounded-xl border border-[var(--color-border-subtle)] space-y-2">
            <div className="flex items-center gap-2.5">
              <Building size={16} className="text-[var(--color-navy-900)]" />
              <div className="text-xs font-bold text-[var(--color-ink)]">
                HDFC Bank Current Account
              </div>
            </div>
            <div className="text-[11px] font-mono text-[var(--color-ink-3)] pl-6">
              Account: •••• •••• 4092
            </div>
            <div className="text-[11px] font-mono text-[var(--color-ink-3)] pl-6">
              IFSC: HDFC0000240 • Mumbai Main Branch
            </div>
          </div>

          <div className="text-[11px] text-[var(--color-ink-3)] leading-relaxed">
            Payment gateway processing powered by Stripe & Razorpay. Transaction fees: 1.8% per card swipe, 0% on direct UPI.
          </div>
        </div>

        {/* Dynamic Pricing & Parking Rate Controls */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-[var(--color-navy-900)]" />
              <h3 className="text-sm font-bold text-[var(--color-ink)]">
                Live Station Tariffs & Parking Reservation Rates
              </h3>
            </div>
            {isSavedRates && (
              <span className="text-xs text-[#16A34A] font-semibold flex items-center gap-1 animate-in fade-in">
                <Check size={12} />
                Rates updated
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Base Tariff */}
            <div className="p-4 bg-[var(--color-canvas)] rounded-xl border border-[var(--color-border-subtle)] space-y-2">
              <label className="text-xs font-semibold text-[var(--color-ink)] flex items-center justify-between">
                <span>Fast Charging Rate</span>
                <span className="font-mono text-xs font-bold text-[var(--color-navy-900)]">
                  ₹{baseTariffPerKwh} / kWh
                </span>
              </label>
              <input
                type="range"
                min="12"
                max="28"
                step="0.5"
                value={baseTariffPerKwh}
                onChange={(e) => setBaseTariffPerKwh(Number(e.target.value))}
                className="w-full accent-[var(--color-navy-900)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--color-ink-3)]">
                <span>Off-Peak (₹12)</span>
                <span>Peak Grid (₹28)</span>
              </div>
            </div>

            {/* Parking Spot Rate */}
            <div className="p-4 bg-[var(--color-canvas)] rounded-xl border border-[var(--color-border-subtle)] space-y-2">
              <label className="text-xs font-semibold text-[var(--color-ink)] flex items-center justify-between">
                <span>Parking Bay Hold Rate</span>
                <span className="font-mono text-xs font-bold text-[var(--color-navy-900)]">
                  ₹{parkingRatePerHour} / hour
                </span>
              </label>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={parkingRatePerHour}
                onChange={(e) => setParkingRatePerHour(Number(e.target.value))}
                className="w-full accent-[var(--color-navy-900)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--color-ink-3)]">
                <span>Economy (₹20)</span>
                <span>Premium Transit (₹150)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveRates}
              className="px-4 py-2 bg-[var(--color-navy-900)] text-white text-xs font-semibold rounded-xl hover:opacity-90 cursor-pointer transition-all"
            >
              Update Live Station Rates
            </button>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION & BOOKING LEDGER ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">
              Recent Driver Transactions & Spot Bookings
            </h3>
            <p className="text-xs text-[var(--color-ink-3)] mt-0.5">
              Live ledger of completed charging sessions and reserved parking bay holds.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5">
            {[
              { id: "all", label: "All Records" },
              { id: "charging", label: "Charging" },
              { id: "parking", label: "Parking Holds" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  filterType === f.id
                    ? "bg-[var(--color-navy-900)] text-white"
                    : "bg-[var(--color-canvas)] text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-canvas)] text-[var(--color-ink-3)] font-mono text-[10.5px] uppercase border-b border-[var(--color-border-subtle)]">
              <tr>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Bay & Station</th>
                <th className="py-3 px-4">Session Details</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Gross Amount</th>
                <th className="py-3 px-4 text-right">Net Payout</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)] text-[var(--color-ink)]">
              {filteredTxns.map((txn) => (
                <tr key={txn.id} className="hover:bg-[var(--color-canvas)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium">
                    <div>{txn.id}</div>
                    <div className="text-[10px] text-[var(--color-ink-3)]">{txn.time}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase ${
                        txn.type === "charging"
                          ? "bg-[#DCFCE7] text-[#15803D]"
                          : "bg-[#DBEAFE] text-[#1D4ED8]"
                      }`}
                    >
                      {txn.type === "charging" ? (
                        <>
                          <Zap size={10} />
                          <span>Charge</span>
                        </>
                      ) : (
                        <>
                          <Car size={10} />
                          <span>Hold</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-xs">{txn.bay}</div>
                    <div className="text-[11px] text-[var(--color-ink-3)]">{txn.stationName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-[var(--color-ink-2)]">
                    <div>{txn.details}</div>
                    <div className="font-mono text-[10px] text-[var(--color-ink-3)]">
                      Vehicle: {txn.customer}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {txn.method}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    {txn.amount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#15803D]">
                    {txn.net}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        txn.status === "settled"
                          ? "bg-[#DCFCE7] text-[#15803D]"
                          : "bg-[#FEF3C7] text-[#92400E]"
                      }`}
                    >
                      {txn.status === "settled" ? "Settled" : "Processing"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
