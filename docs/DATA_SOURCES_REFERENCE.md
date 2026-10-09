# EVverse Data Sources Reference

Status: Research and candidate-source inventory.

This document contains proposed data providers and datasets for future
EVverse development. Inclusion does not mean that a source has been
verified, integrated, licensed for our use, or tested against the current
application.

Before integration, verify:
- Current API availability and documentation.
- Geographic coverage and data completeness.
- Update frequency and data freshness.
- Licensing and redistribution permissions.
- Authentication requirements and API limits.
- Data quality and compatibility with the existing application.

Do not describe data as live, complete, or verified without evidence.
Keep private API credentials in backend environment variables.


Here is a practical inventory of **data and live APIs** that matter for EVverse (Investor + Government), aligned with what QuantEV2 already targets: India, United States, China, map, placement optimization, demand/gaps, and investment/planning views.

**Important:** Without the QuantEV2 repo, we cannot say which of these you already use. Treat this as the **target data map** for EVverse. Anything not verified in your codebase should be labeled provisional in the UI (per the handoff doc).

---

## 1. Core: existing charging infrastructure (stations / ports)

These power the map, coverage maps, gap analysis, and “current supply” side of optimization.

### Global / multi-country (best single starting point)

| Source | Type | Coverage | Notes | Access |
|--------|------|----------|--------|--------|
| **Open Charge Map (OCM)** | Live API + bulk export | Global (incl. IN, US, CN) | Largest open registry; community + operator data; not guaranteed real-time availability | Free API key: [openchargemap.org/develop/api](https://www.openchargemap.org/develop/api) — `https://api.openchargemap.io/v3/poi/` |
| **Global EV infra snapshot (OCM-derived)** | Static dataset | ~242k sites, 121 countries | Clean CSV for ML / offline analysis | [Hugging Face / GitHub tarekmasryo/global-ev-infra-dataset](https://github.com/tarekmasryo/global-ev-infra-dataset) |

**Recommendation:** Use OCM as the default live layer for all three countries; cache locally; refresh on a schedule. Do not claim “live availability” unless you also have operator real-time feeds.

### United States (highest quality official source)

| Source | Type | Notes | Access |
|--------|------|--------|--------|
| **NREL Alternative Fuel Stations API (AFDC)** | Live API | Official US DOE data; EV + other fuels; nearest, by route, by ID, networks, ports | [developer.nrel.gov/docs/transportation/alt-fuel-stations-v1](https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/) — requires free API key |
| AFDC bulk / NTAD extracts | Download | Snapshots for offline / historical | AFDC data downloads / BTS NTAD |

**Fields you typically need:** lat/lon, access (public/private), status, network, connector types, power (kW), EVSE/ports count, address, last verified date.

### India

| Source | Type | Notes | Access |
|--------|------|--------|--------|
| **data.gov.in** | Open APIs + CSVs | State/UT operational PCS counts; FAME sanctioned stations (often aggregate, not full point-level) | [data.gov.in](https://www.data.gov.in) — API key required |
| **E-Amrit (NITI Aayog) charging locator** | Web / unofficial scrape endpoint | National locator UI; community mirrors exist as GeoJSON | e-amrit.niti.gov.in (check terms; prior permission may be required) |
| **Open Charge Map (India subset)** | API / Kaggle cleans | Practical point-level for maps | OCM API filtered by `countrycode=IN` |
| Commercial (e.g. Atlas Geotech EV Charge™) | Paid API / DB | Higher coverage claims; not free | Commercial |

**Reality check:** India does **not** have a single NREL-quality national live API for every station. Expect to **combine** OCM + data.gov.in aggregates + any operator feeds you license. Label coverage as “partial / multi-source.”

### China

| Source | Type | Notes | Access |
|--------|------|--------|--------|
| **Open Charge Map** | API | Incomplete vs true China network density | OCM `countrycode=CN` |
| **CnOpenData / commercial POI** | Paid / licensed | National station POI (~30k+ in some products) | Commercial |
| **UrbanEV (Shenzhen)** | Research dataset | Occupancy, duration, volume, price, weather — demand modeling, not full national map | [GitHub IntelligentSystemsLab/UrbanEV](https://github.com/IntelligentSystemsLab/UrbanEV) / Dryad |
| **CHARGED** | Research | Multi-city (incl. Shenzhen) demand | Zenodo / papers |
| Brand / app scrapes | Fragile | Not suitable as production source of truth | Avoid for product claims |

**Reality check:** Authoritative national live China station APIs are limited for foreign products. Prefer OCM + licensed POI + city research datasets; never claim complete national coverage.

---

## 2. Demand, gaps, and planning layers (Investor + Government)

Optimization and “underserved region” views need more than stations.

| Layer | Why needed | Practical sources |
|-------|------------|-------------------|
| **Population / density** | Demand proxy | WorldPop, national census (India Census / US Census ACS, China statistical yearbooks — often not free APIs) |
| **EV / vehicle stock** | Fleet size by region | India: Vahan / state RTO aggregates, data.gov.in EV counts; US: AFDC / state DMV / EIA; China: CAAM / local stats (often report-based) |
| **Traffic / mobility** | Hotspot demand | OpenStreetMap + derived traffic; Google Traffic (paid/restricted); India: some state open traffic; US: FHWA / NPMRDS |
| **Road network** | Candidate sites, coverage radius | OpenStreetMap (Overpass / Geofabrik extracts) |
| **POI / land use** | Destination charging (malls, offices, highways) | OSM; Google Places (paid); India BHUVAN / state GIS where available |
| **Grid / substation capacity** | Feasibility for Government | US: EIA / utility open data (fragmented); India: DISCOM / CEA (often not machine-friendly); China: rarely open — treat as **scenario inputs**, not live truth |
| **Land / parcel / zoning** | Site suitability | Local GIS portals; not uniform across IN/US/CN |
| **Electricity price / tariff** | Cost scenarios | Utility tariffs (static tables); US EIA; India state DISCOM schedules |
| **Weather** | Load / occupancy models | Open-Meteo, NOAA, IMD (India) |

For **financial scenarios** (Investor): capital cost per kW / per port (industry benchmarks, not a single open API), utilization assumptions, tariff, incentives (FAME-II / state EV policies India; US IRA / state rebates; China local subsidies — policy tables, not live APIs).

---

## 3. Live APIs vs static datasets (how to use them in EVverse)

| Need | Prefer live API | Prefer snapshot / offline |
|------|-----------------|---------------------------|
| Map of existing stations | OCM + NREL (US) | Nightly cache of same |
| Coverage / gap heatmaps | API + local grid aggregation | Precomputed tiles for performance |
| Optimization / QUBO experiments | — | Fixed candidate set + demand surface for reproducibility |
| Investment briefing numbers | — | Versioned assumptions file (costs, utilization, incentives) |
| Demand forecasting ML | Session datasets (UrbanEV, city feeds) | Train offline; serve scores as static layers unless you own real-time |
| “Real-time available plugs” | Operator APIs only (ChargePoint, etc.) | Do **not** invent from OCM status alone |

**Product rule (from handoff):** Frontend must not present OCM/NREL points as “live availability” or “verified investment returns.” Show **as-of date** and **source**.

---

## 4. Recommended minimum stack for EVverse v1 (Investor + Government)

**Must-have (implement / wire first):**

1. **Open Charge Map API** — global stations, map, basic filters (connector, power, country).  
2. **NREL AFDC API** — authoritative US layer (merge or prefer over OCM for US).  
3. **India:** OCM India + data.gov.in state/UT PCS counts (for aggregate government dashboards).  
4. **OpenStreetMap extracts** — roads + basic POIs for candidate generation.  
5. **Population grid** (WorldPop or equivalent) — demand proxy for gaps.  
6. **Internal assumption tables** — capex/port, utilization, incentives — versioned, editable, never shown as “market guaranteed.”

**Should-have (next stage):**

7. India point-level enrichment (E-Amrit-derived or licensed commercial if accuracy is critical).  
8. US EV registration / sales by county (for demand strength).  
9. One research demand dataset (e.g. UrbanEV) for China pilot city scenarios only.  
10. Grid capacity as **scenario knobs**, not live GIS, until you have real utility data.

**Nice-to-have / later:**

- Operator real-time occupancy APIs (per network contracts).  
- Full China national licensed POI.  
- Transaction-level training data for your own ML demand models.

---

## 5. Auth, cost, and security notes

- **OCM:** Free key; rate limits exist — cache and avoid hammering from the browser.  
- **NREL:** Free key; do **not** embed the key in frontend bundles — proxy via your backend.  
- **data.gov.in:** API key; sample keys are limited.  
- **Commercial India/China data:** Review license for redistribution and map display.  
- **Secrets:** All keys in server env only; never commit; align with handoff security checklist.

---

## 6. What to do next in the repo

1. **Inspect QuantEV2** for: existing station files, any OCM/NREL/data.gov.in calls, hardcoded India/US/China GeoJSON, and whether “optimization” inputs are live or static.  
2. Document findings in `PROJECT_CONTEXT.md` under “Data sources (verified).”  
3. For the first EVverse milestone, **reuse whatever station layer already drives the map**; only swap sources when you have a controlled backend proxy and honest “as-of” labeling.

---

### Summary table (quick reference)

| Region | Primary live API | Official / strong secondary | Demand / research |
|--------|------------------|-----------------------------|-------------------|
| **Global** | Open Charge Map | OCM bulk / global CSV | CHARGED (multi-city) |
| **US** | NREL AFDC | AFDC bulk | TEMPO / dsgrid profiles, city session data |
| **India** | OCM + data.gov.in | E-Amrit / state portals (terms apply) | Local studies; traffic + census proxies |
| **China** | OCM (partial) | Licensed POI | UrbanEV (Shenzhen), CHARGED |

If you open the QuantEV2 repository (or paste `package.json` / data folders / API client paths), I can turn this into a **gap analysis**: what you already have vs what to add first for Investor and Government views.