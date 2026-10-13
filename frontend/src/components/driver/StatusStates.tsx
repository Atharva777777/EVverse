"use client";

import React from "react";
import { AlertCircle, RefreshCw, FilterX, WifiOff } from "lucide-react";

/**
 * Reusable Loading Skeleton for station cards and telemetry metrics
 */
export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 w-full py-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-4 border border-[rgba(17,19,18,0.06)] shadow-xs space-y-3"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1.5 flex-1 pr-4">
              <div className="h-4 w-3/5 bg-[#EAE8E2] rounded-md" />
              <div className="h-3 w-2/5 bg-[#F2F0EB] rounded-md" />
            </div>
            <div className="h-6 w-16 bg-[#EAE8E2] rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[rgba(17,19,18,0.04)]">
            <div className="h-3 bg-[#F2F0EB] rounded" />
            <div className="h-3 bg-[#F2F0EB] rounded" />
            <div className="h-3 bg-[#F2F0EB] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when search or filters return zero stations
 */
export function EmptyState({
  title = "No charging hubs match your filters",
  message = "Try clearing your connector type, speed threshold, or search keyword.",
  onReset,
}: {
  title?: string;
  message?: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-[rgba(17,19,18,0.06)] my-4">
      <div className="w-12 h-12 rounded-full bg-[#F3F2ED] flex items-center justify-center text-[#525854] mb-3">
        <FilterX size={20} />
      </div>
      <h4 className="text-sm font-semibold text-[#111312] mb-1">{title}</h4>
      <p className="text-xs text-[#6B726D] max-w-[280px] leading-relaxed mb-4">
        {message}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 bg-[#111312] text-white text-xs font-semibold rounded-xl hover:bg-[#252826] transition-colors active:scale-98"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}

/**
 * Error alert pill with retry button
 */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-[#FFF5F5] border border-[#FEE2E2] rounded-xl text-xs text-[#991B1B] my-2">
      <div className="flex items-center gap-2.5">
        <AlertCircle size={16} className="text-[#DC2626] shrink-0" />
        <span className="font-medium leading-tight">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 font-semibold text-[#991B1B] hover:text-[#7F1D1D] px-2 py-1 bg-white rounded-lg border border-[#FEE2E2] shadow-2xs active:scale-95"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Offline / Baseline dataset notice badge
 */
export function OfflineNotice({
  source,
  onSync,
}: {
  source: string;
  onSync?: () => void;
}) {
  if (source === "open_charge_map") return null;

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-[#F6F5F0] border border-[rgba(17,19,18,0.07)] rounded-xl text-[11px] text-[#525854] my-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse" />
        <span className="font-medium">
          Verified Regional Dataset (OCM Gateway Offline)
        </span>
      </div>
      {onSync && (
        <button
          onClick={onSync}
          className="text-[#111312] font-semibold flex items-center gap-1 hover:underline ml-2"
        >
          <RefreshCw size={10} />
          Check Live
        </button>
      )}
    </div>
  );
}
