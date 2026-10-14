import React from "react";
import Image from "next/image";

export function BrandLogo({ suffix }: { suffix?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ position: "relative", width: "28px", height: "28px", flexShrink: 0 }}>
        <Image
          src="/images/evverse-logo.png"
          alt="EVverse Logo"
          width={28}
          height={28}
          priority
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: 800, color: "var(--color-navy-900)", letterSpacing: "-0.04em" }}>EV</span>
        <span style={{ fontFamily: "Times New Roman, serif", fontSize: "21px", fontWeight: 400, color: "var(--color-ink)", letterSpacing: "-0.01em" }}>verse</span>
      </div>
      {suffix && (
        <span style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-3)", borderLeft: "1px solid var(--color-border-subtle)", paddingLeft: "10px", marginTop: "2px" }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

