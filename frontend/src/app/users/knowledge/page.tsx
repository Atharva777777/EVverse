"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const CATEGORIES = [
  {
    id: "electric-cars",
    label: "Electric Cars",
    description:
      "Battery electric vehicles (BEVs) run entirely on electricity with no combustion engine. Understand how they differ from hybrid and plug-in hybrid vehicles, what to look for in range ratings, and how different drive configurations (front, rear, all-wheel) affect performance and efficiency.",
    notes: [
      "Range is measured under standardised test cycles (WLTP, EPA). Real-world range is typically 10\u201320% lower depending on speed, temperature, and driving style.",
      "Fast-charging capability depends on both the vehicle\u2019s maximum charge rate and the charger\u2019s output.",
      "Manufacturer figures should be verified against independent road tests.",
    ],
  },
  {
    id: "electric-bikes-scooters",
    label: "Electric Bikes and Scooters",
    description:
      "Electric two-wheelers cover a wide range from pedal-assist e-bikes with small motors to high-speed electric scooters and motorcycles. Key differences include motor placement (hub vs. mid-drive), battery capacity, removable vs. fixed battery designs, and regulatory classifications that affect where you can ride.",
    notes: [
      "Power limits and speed classifications vary by country and road type.",
      "Pedal-assist e-bikes (pedelecs) are treated as bicycles in many jurisdictions. Throttle-controlled models may require registration.",
      "Battery longevity is affected by charging habits, temperature, and storage conditions.",
    ],
  },
  {
    id: "vehicle-comparison",
    label: "Vehicle Comparison",
    description:
      "Compare EV categories side by side. The comparison below covers general specification dimensions. A sourced vehicle catalogue with independently verified figures can be connected to this structure once available.",
    notes: [
      "All comparison values should come from verified manufacturer or independent test data.",
      "This section does not contain fabricated vehicle entries.",
    ],
    isComparison: true,
  },
  {
    id: "range-charging",
    label: "Range and Charging",
    description:
      "Range anxiety is one of the most common concerns for new EV buyers, but understanding how range is measured and what affects it helps set realistic expectations. Charging speed, from slow overnight AC charging to rapid DC fast-charging, varies significantly based on equipment and vehicle compatibility.",
    notes: [
      "AC charging (Level 1 and 2) is slower and uses your vehicle\u2019s onboard charger. DC fast-charging bypasses it and charges the battery directly.",
      "Most EV manufacturers recommend not regularly charging to 100% for daily use, to preserve battery longevity.",
      "Charging networks use different standards (CCS, CHAdeMO, Type 2, GBT). Verify compatibility before travelling.",
    ],
  },
  {
    id: "battery-maintenance",
    label: "Battery and Maintenance",
    description:
      "EV batteries degrade gradually over time, similar to smartphone batteries. Most manufacturers warrant batteries for 8 years or a set kilometre/mileage limit. Maintenance requirements are lower than combustion vehicles, but tyre wear and software updates are important.",
    notes: [
      "Battery health indicators are available in most EVs via the instrument cluster or companion app.",
      "Extreme temperatures (very hot or very cold) reduce range and can accelerate degradation if consistently applied.",
      "Brake fluid and coolant still require periodic servicing even in EVs.",
    ],
  },
  {
    id: "ev-ownership",
    label: "EV Ownership Guide",
    description:
      "Owning an EV involves considerations beyond the purchase price: home charging installation, public network access, running costs, insurance implications, and resale values. Total cost of ownership often favours EVs over longer periods, but the calculation depends heavily on local electricity prices, incentives, and usage patterns.",
    notes: [
      "Home charging typically requires a dedicated circuit. A qualified electrician should assess your installation.",
      "Government incentives vary widely by country, region, and vehicle price tier. Verify current eligibility.",
      "Insurance premiums for EVs can be higher due to repair costs. Compare quotes specifically for EV models.",
    ],
  },
];

const COMPARISON_DIMENSIONS = [
  { dimension: "Typical Range", cars: "200\u2013600 km (WLTP)", bikes: "50\u2013150 km" },
  { dimension: "Charge Time (AC)", cars: "6\u201312 hours (7 kW home)", bikes: "2\u20136 hours" },
  { dimension: "Charge Time (DC fast)", cars: "20\u201360 minutes (80%)", bikes: "Not widely supported" },
  { dimension: "Running Cost", cars: "Lower than petrol per km", bikes: "Very low per km" },
  { dimension: "Maintenance", cars: "Less than ICE; no oil changes", bikes: "Minimal; chain or belt on some models" },
  { dimension: "Licensing", cars: "Standard car licence", bikes: "Varies by power/speed class" },
  { dimension: "Cold weather impact", cars: "Range reduction 15\u201340%", bikes: "Range reduction 20\u201350%" },
];

export default function EVKnowledgeHub() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-canvas)" }}>
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

      <main style={{ flex: 1, padding: "56px 32px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: "56px" }}>
          <h1 style={{ fontFamily: "Times New Roman, serif", fontSize: "36px", color: "var(--color-ink)", marginBottom: "12px", letterSpacing: "-0.02em" }}>
            EV Knowledge Hub
          </h1>
          <p style={{ fontFamily: "Times New Roman, serif", fontSize: "17px", color: "var(--color-ink-3)", lineHeight: 1.6, maxWidth: "640px", margin: 0 }}>
            Educational guidance on electric vehicles, charging, and ownership. Content is general in nature. Consult manufacturer documentation and independent tests for vehicle-specific figures.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {CATEGORIES.map((cat) => (
            <section
              key={cat.id}
              id={cat.id}
              style={{
                background: "white",
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                padding: "40px",
              }}
            >
              <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: "24px", color: "var(--color-ink)", marginBottom: "16px", letterSpacing: "-0.01em" }}>
                {cat.label}
              </h2>
              <p style={{ fontFamily: "Times New Roman, serif", fontSize: "15px", color: "var(--color-ink-2)", lineHeight: 1.7, marginBottom: cat.isComparison ? "32px" : "24px" }}>
                {cat.description}
              </p>

              {cat.isComparison && (
                <div style={{ marginBottom: "24px", overflowX: "auto" }}>
                  <div style={{ marginBottom: "12px", fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--color-navy-500)" }}>
                    General Specification Comparison &mdash; Educational Reference
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" as const, fontFamily: "Times New Roman, serif", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                        <th style={{ textAlign: "left" as const, padding: "10px 16px", color: "var(--color-ink-4)", fontWeight: 600, fontFamily: "var(--font-sans)", fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>Dimension</th>
                        <th style={{ textAlign: "left" as const, padding: "10px 16px", color: "var(--color-ink-4)", fontWeight: 600, fontFamily: "var(--font-sans)", fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>Electric Cars</th>
                        <th style={{ textAlign: "left" as const, padding: "10px 16px", color: "var(--color-ink-4)", fontWeight: 600, fontFamily: "var(--font-sans)", fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>Electric Bikes / Scooters</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_DIMENSIONS.map((row, i) => (
                        <tr key={row.dimension} style={{ borderBottom: "1px solid var(--color-border-subtle)", background: i % 2 === 0 ? "transparent" : "var(--color-canvas)" }}>
                          <td style={{ padding: "12px 16px", color: "var(--color-ink-3)", verticalAlign: "top" as const }}>{row.dimension}</td>
                          <td style={{ padding: "12px 16px", color: "var(--color-ink)", verticalAlign: "top" as const }}>{row.cars}</td>
                          <td style={{ padding: "12px 16px", color: "var(--color-ink)", verticalAlign: "top" as const }}>{row.bikes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: "12px", fontFamily: "Times New Roman, serif", fontSize: "12px", color: "var(--color-ink-4)", fontStyle: "italic" }}>
                    General ranges for illustration only. Actual figures depend on model, conditions, and region.
                  </div>
                </div>
              )}

              {cat.notes.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "20px", borderTop: "1px solid var(--color-border-subtle)" }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--color-ink-4)", marginBottom: "4px" }}>
                    Things to know
                  </div>
                  {cat.notes.map((note, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--color-navy-400)", marginTop: "8px", flexShrink: 0 }} />
                      <p style={{ fontFamily: "Times New Roman, serif", fontSize: "14px", color: "var(--color-ink-3)", lineHeight: 1.6, margin: 0 }}>
                        {note}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <div style={{ marginTop: "48px", padding: "24px 32px", background: "var(--color-fog)", borderRadius: "12px", border: "1px solid var(--color-border-subtle)" }}>
          <p style={{ fontFamily: "Times New Roman, serif", fontSize: "13px", color: "var(--color-ink-3)", lineHeight: 1.6, margin: 0 }}>
            <strong>Content disclaimer:</strong> This page provides general educational information about electric vehicles. It does not contain independently verified vehicle-specific specifications, prices, or performance claims. Always consult official manufacturer documentation, independent road tests, and local regulations before making purchase decisions.
          </p>
        </div>
      </main>
    </div>
  );
}
