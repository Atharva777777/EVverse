"use client";

import React from "react";
import {
  Home,
  Compass,
  Navigation,
  Zap,
  Car,
} from "lucide-react";

export type DriverTab = "home" | "explore" | "journeys" | "charging" | "garage";

interface DriverNavProps {
  activeTab: DriverTab;
  onTabChange: (tab: DriverTab) => void;
  isCharging?: boolean;
}

export function DriverNav({
  activeTab,
  onTabChange,
  isCharging = false,
}: DriverNavProps) {
  const tabs: { id: DriverTab; label: string; icon: React.ElementType }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "journeys", label: "Journeys", icon: Navigation },
    { id: "charging", label: "Charging", icon: Zap },
    { id: "garage", label: "Garage", icon: Car },
  ];

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-50 w-full flex flex-col items-center mt-auto select-none"
      style={{
        background: "rgba(250, 249, 246, 0.94)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(17, 19, 18, 0.06)",
      }}
    >
      <div className="w-full flex items-center justify-around px-2 pt-1.5 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isChargeTab = tab.id === "charging";

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-92 group cursor-pointer"
              style={{ minWidth: "56px" }}
              aria-label={tab.label}
            >
              {/* Electric Accent Indicator for Active Tab */}
              {isActive && (
                <span
                  className="absolute -top-1 w-4 h-[2px] rounded-full transition-all"
                  style={{
                    backgroundColor: isChargeTab && isCharging ? "#C8F369" : "#111312",
                  }}
                />
              )}

              <div className="relative flex items-center justify-center w-7 h-7">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.3 : 1.7}
                  className="transition-colors duration-150"
                  style={{
                    color: isActive ? "#111312" : "#8C938E",
                  }}
                />

                {/* Live pulsing badge when vehicle is charging */}
                {isChargeTab && isCharging && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8F369] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C8F369] border border-[#111312]" />
                  </span>
                )}
              </div>

              <span
                className="text-[10px] tracking-tight transition-colors duration-150 mt-0.5"
                style={{
                  color: isActive ? "#111312" : "#8C938E",
                  fontWeight: isActive ? 650 : 500,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* iOS Floating Home Indicator Bar */}
      <div className="w-full pb-1 flex justify-center">
        <div className="w-32 h-1 bg-[#111312]/20 rounded-full" />
      </div>
    </nav>
  );
}
