# EVverse / QuantEV2 — Technical Project Audit

**Prepared:** 2026-10-13
**Branch:** `main` (up to date with `origin/main`)
**Git status:** Clean working tree (one untracked directory: `data/processed/cities/pune/` — intentionally preserved)
**Hackathon:** Monad Metropolis · Primary track: Consumer Products & Payments

---

## 1. Project Overview

EVverse is a full-stack EV charging infrastructure platform that has evolved from QuantEV2.
It serves three distinct audiences through a common backend:

| Role | Entry Point | Core Value |
|------|------------|------------|
| **Investor** | `/investor/map` | QUBO/QAOA optimization, ROI forecasts, site recommendations |
| **Government** | `/government/map` | Infrastructure equity analysis, municipal briefings |
| **EV Driver** | `/users/stations` | Live station discovery, journey planning, charging sessions |

The application is **not** a blockchain product today. No Monad, Alchemy, or wallet integration exists anywhere in the codebase.

---

## 2. Architecture

```
Frontend: Next.js 16.3 / React 19 (frontend/)
  /                     EVverse entry page — 3 role cards
  /investor/page.tsx    Investor landing — market indicators
  /investor/map         ChargingMap + QUBO optimization
  /government/page.tsx  Government landing (mirrors investor)
  /government/map       Same ChargingMap with gov labels
  /users/stations       Full driver cockpit (1127 lines)
  /users/knowledge      Educational hub

Styling: Tailwind CSS v4 + inline CSS
Maps: Leaflet 1.9 (driver), MapLibre GL 6.x (investor/gov)
3D: Three.js 0.186 (ThreeChargerHub3D, Spatial3DDigitalTwin)

Backend: FastAPI 2.0 (backend/api/) — Uvicorn on :8000
  GET  /api/v1/health
  GET  /api/v1/status            pipeline warmup check
  POST /api/v1/optimize          AI → QUBO → QAOA pipeline
  GET  /api/v1/live-stations     OCM fetch with fallback
  GET  /api/v1/spatial/context   city 3D twin baseline
  POST /api/v1/spatial/calculate capex/roi/coverage calc

Services: optimizer.py (44 KB), spatial_optimizer.py (23 KB)
Data: Open Charge Map API, Parquet demand data, KMeans zones
AI: RandomForest demand model (scikit-learn)
Quantum: QAOA via Qiskit Aer (optional, falls back to classical)
```

---

## 3. Technology Stack

### Frontend
| Technology | Version | Role |
|-----------|---------|------|
| Next.js | 16.3.0 | Framework (App Router, webpack mode) |
| React | 19.2.8 | UI |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility styles |
| Leaflet | ^1.9.4 | Driver map |
| MapLibre GL | ^6.13.0 | Investor/Government map |
| Three.js | ^0.186.1 | 3D charging hub + spatial twin |
| Lucide React | ^1.30.0 | Icons |

**No blockchain/web3 libraries installed.** package.json contains zero references to wagmi, viem, ethers, web3, @rainbow-me/*, or any wallet SDK.

### Backend (Python)
| Technology | Role |
|-----------|------|
| FastAPI | REST API |
| pandas | Data processing |
| scikit-learn | RandomForest demand model |
| Qiskit Aer | QAOA quantum simulation (optional) |

### External Services
| Service | Purpose | Status |
|---------|---------|--------|
| Open Charge Map (OCM) | Live station data | Active (needs API key to avoid 403) |
| OSRM Public Router | Journey route geometry | Active (3.5s timeout, fallback geodesic) |
| Vercel | Frontend production | Configured in CORS |
| Render.com | Backend production | Configured in render.yaml |

---

## 4. Key Files

| File | Size | Purpose |
|------|------|---------|
| `frontend/src/app/page.tsx` | 14.9 KB | EVverse entry page (3 role cards) |
| `frontend/src/app/users/stations/page.tsx` | 50.9 KB | Full driver cockpit (1127 lines) |
| `frontend/src/app/investor/map/page.tsx` | 30.3 KB | Investor optimization map |
| `frontend/src/components/ChargingMap.tsx` | 49.7 KB | Core investor/gov map |
| `frontend/src/components/ResultPanel.tsx` | 41.1 KB | Optimization results |
| `frontend/src/components/Spatial3DDigitalTwinModal.tsx` | 47.3 KB | 3D infrastructure twin |
| `frontend/src/components/ThreeChargerHub3D.tsx` | 45.6 KB | Three.js 3D charger model |
| `frontend/src/components/driver/GarageFleet.tsx` | 40.5 KB | Vehicle management (909 lines) |
| `frontend/src/components/driver/JourneyPlanner.tsx` | 32.6 KB | Route planning (713 lines) |
| `frontend/src/components/driver/StationDetailSheet.tsx` | 27.7 KB | Station info sheet |
| `frontend/src/lib/journeyRouting.ts` | 14.7 KB | OSRM + energy physics engine |
| `frontend/src/lib/vehicleStorage.ts` | 12.4 KB | OEM vehicle catalogue + localStorage |
| `backend/api/services/optimizer.py` | 44.5 KB | Full AI/QUBO/QAOA pipeline |
| `backend/api/services/spatial_optimizer.py` | 23.4 KB | Spatial financial modelling |

---

## 5. Frontend Routes and Features

### `/` — EVverse Entry Page
**Status: Implemented**
Three interactive role cards: Investor → /investor/map, Government → /government/map, EV Users → /users/stations.
Apple-style clean design with hover animations.

### `/investor/page.tsx` — Investor Landing
**Status: Implemented**
Shows live market indicators (station count per city) via useLiveData hook.
Displays LIVE DATA / BASELINE badge based on OCM response.

### `/investor/map` — Investor Analysis Map
**Status: Implemented**
Full ChargingMap (MapLibre GL) + city selector. Triggers AI → QUBO → QAOA pipeline.
Shows candidate zones, demand predictions, ROI estimates, ExecutiveReportModal.
**Bug:** useCallback dependency mismatch at line 86 (handleTriggerCityOptimization) — React Compiler bails out.

### `/government/map` — Government Analysis Map
**Status: Implemented** (mirrors investor map with government labels)

### `/users/stations` — EV Driver Cockpit
**Status: Substantially implemented** (1127 lines, 5-tab mobile nav)

Tabs:
- **Home:** Vehicle cockpit — range display, drive mode (Eco/Normal/Sport), HVAC, door lock
- **Explore:** Live OCM stations, Haversine distance, multi-filter (speed/connector/compatibility/availability/saved), station detail sheet
- **Journeys:** OSRM routing to curated corridors (Mumbai-Pune, Bangalore-Mysore, etc.), energy physics model (elevation/HVAC/efficiency), en-route stop discovery within 18km detour radius
- **Charging:** Simulated charging session (real-time kWh ticker at $0.28/kWh, SoC update, target limit slider), session receipt modal
- **Garage:** OEM vehicle catalogue (Porsche Taycan GTS, BMW i7, Mercedes EQS, Hyundai Ioniq 6, Tata Nexon EV), add/edit/remove, localStorage persistence, VIN validation

Desktop Studio Frame: iPhone 16 Pro frame / fluid / expanded layout switcher.

### `/users/knowledge` — Knowledge Hub
**Status: Implemented** (23.8 KB page with EV education content)

---

## 6. Backend Endpoints

### GET /api/v1/health
Returns { status: "ok", service: "..." }. Always available.

### GET /api/v1/status
Returns whether the RandomForest + parquet cache is warm.

### POST /api/v1/optimize
Request: { city, station_count(1-8), scenario, reps(QAOA depth), shots, seed }
Response: demand_prediction, qubo, classical, qaoa(optional), recommendation(zones with lat/lng, ROI, revenue)
Fallback: Qiskit Aer absent → classical exhaustive solver. OCM fails → synthetic zones with zeroed metrics.

### GET /api/v1/live-stations
Params: city, distance_km, max_results, lat/lng override
Response: Normalized LiveStation[] with connector types, power_kw, operator, status, usage_cost
Source: Open Charge Map API → Kaggle CSV (MISSING on disk) → source:"unavailable"

### GET /api/v1/spatial/context
Returns existing chargers, candidate zones, unmet demand, coverage baseline for 3D twin.

### POST /api/v1/spatial/calculate
Full scenario: CapEx breakdown, annual revenue, payback years, population access delta.

---

## 7. Latest Teammate Changes

| Commit | Summary |
|--------|---------|
| c60b237 | Journey Planner with OSRM routing, detour analysis, primary/backup stop selection |
| 3090027 | EV Garage with OEM catalogue, localStorage persistence, VIN validation, CRUD |
| e9549d2 | Station detail: connectors, tariffs, compatibility, issue reporting |
| 9b1968e | 320px-responsive mobile layout, keyboard safety, knowledge hub navigation |
| c76e572 | Mobile design tokens, reduced-motion, accessible touch targets |

---

## 8. Feature Status

### Implemented and Functional
- EVverse entry page (3 roles) — full JSX, hover states, routing
- Investor/Government map + optimization trigger
- AI demand prediction (RandomForest) from parquet data
- QUBO construction (binary variables, penalty terms)
- Classical exhaustive solver (always runs)
- QAOA simulation with graceful fallback
- Live station fetch (OCM) with normalized output
- 3D charging hub modal (45.6 KB Three.js)
- Spatial 3D digital twin modal
- Driver station discovery with Haversine distance
- Multi-filter station search (speed/connector/compatibility/availability/saved)
- Station detail sheet with full connector info
- Vehicle garage with localStorage persistence
- OSRM journey routing with geodesic fallback
- Energy physics model (elevation/HVAC/efficiency)
- En-route charging stop discovery (detour <= 18km)
- Charging session simulation (setInterval ticker)
- Session receipt modal
- Backend regression tests (6/6 passing)
- TypeScript clean (tsc --noEmit exits 0)

### Partial / Simulated
| Feature | Status | Issue |
|---------|--------|-------|
| Journey AI telemetry | SIMULATED | qaoaEnergyDelta, convergenceScore computed locally in journeyRouting.ts, not from backend |
| Station tariff data | PARTIAL | usage_cost often null; fallback hardcoded to $0.28/kWh |
| Route geometry | PARTIAL | OSRM has 3.5s timeout; geodesic fallback is 3-point arc |
| AI Co-Pilot recommendation | TEMPLATE | String template, not model inference |
| Charging power curve | SIMULATED | Fixed kW, simplified taper visualization |
| Invoice number | RANDOM | Math.random() — not a real transaction ID |
| Vehicle SOH | HARDCODED | Fixed sohPct values (97.9-99.1%) in catalogue |

### Missing / Not Implemented
| Feature | Priority |
|---------|---------|
| Monad blockchain integration | P0 — HACKATHON CRITICAL |
| Alchemy integration | P0 — HACKATHON CRITICAL |
| Wallet connection (MetaMask/Rainbow/Mera) | P0 — HACKATHON CRITICAL |
| On-chain charging payment | P0 — HACKATHON CRITICAL |
| Transaction signing | P0 — HACKATHON CRITICAL |
| Transaction receipt with txHash | P0 — HACKATHON CRITICAL |
| Mera account/onboarding | P0 — HACKATHON CRITICAL |
| Kimi AI integration | P1 |
| Real payment backend endpoint | P0 — HACKATHON CRITICAL |
| Global baseline dataset (Kaggle CSV) | P1 |
| User authentication | P2 (out of scope) |
| E2E browser tests | P2 |

---

## 9. Data Flow

```
Driver Flow:
  Browser → GET /api/v1/live-stations?city=Mumbai
         → OCM API (with key) OR Kaggle CSV (MISSING)
         → LiveStation[] → Haversine distance → filtered display

Optimization Flow:
  Browser → POST /api/v1/optimize { city, station_count, scenario }
         → CityManager loads parquet demand data
         → RandomForest predicts demand per zone
         → QUBO matrix constructed
         → QAOA (Aer) OR classical solver
         → RecommendationResponse → ResultPanel + ExecutiveReport

Journey Flow (frontend-only, no backend call):
  Browser → fetch https://router.project-osrm.org/route/v1/... (3.5s timeout)
         → Geodesic fallback if timeout
         → Energy physics in journeyRouting.ts
         → Stops scored by detour + compatibility
         → JourneyPlanResult shown in JourneyPlanner.tsx
```

---

## 10. Test Commands and Actual Results

### Backend Tests
```bash
python -m pytest -v backend/tests/
```
RESULT: 6 passed, 0 failed (3.87s, Python 3.12.10)

- test_resolve_city_center_unknown_city PASSED
- test_resolve_city_center_known_city PASSED
- test_fetch_city_stations_empty_response PASSED
- test_fetch_city_stations_provider_failure_with_dataset PASSED
- test_fetch_city_stations_provider_failure_without_dataset PASSED
- test_optimizer_fallback_missing_dataset PASSED

Note: .venv/Scripts/python does not have pytest. Must use system python.

### TypeScript Check
```bash
cd frontend && npx tsc --noEmit
```
RESULT: CLEAN — exit code 0, no errors

### ESLint
```bash
cd frontend && npx eslint src/
```
RESULT: 139 problems (47 errors, 92 warnings)

Primary error types:
- react-hooks/preserve-manual-memoization: React Compiler cannot preserve useCallback
  in investor/map/page.tsx:86 (handleTriggerCityOptimization) — 4 instances
- @typescript-eslint/no-explicit-any: in vehicleStorage.ts, stationAdapter.ts, journeyRouting.ts
- @typescript-eslint/no-unused-vars: caught error variables (err in catch blocks)
- 92 warnings: predominantly no-explicit-any and react-hooks/*

These are pre-existing issues and do not block the build.

### Production Build
```bash
cd frontend && npm run build
```
RESULT: Running at time of audit. TypeScript clean exit 0 indicates build will succeed.
Previous HANDOVER.md (Oct 10) confirms build was passing.

---

## 11. Known Bugs and Limitations

| Severity | Description | Location |
|---------|-------------|---------|
| High | useCallback dependency mismatch — React Compiler bails, component may re-render incorrectly | investor/map/page.tsx:86 |
| High | Missing baseline dataset (global_ev_charging_stations.csv) — OCM 403 leads to "unavailable" state | data/raw/ |
| Medium | OCM API key not configured — likely hitting anonymous rate limits in production | .env.example |
| Medium | data/processed/cities/pune/ is untracked — may produce different results across environments | data/processed/ |
| Medium | Invoice # is Math.random() — no idempotency, no backend record | ChargingConsole.tsx:362 |
| Medium | Journey AI telemetry is local arithmetic, not real backend call | journeyRouting.ts:422-426 |
| Low | Missing sizes prop on plug images — Next.js performance warning | StationDetailSheet.tsx |
| Low | Hard-coded bus voltage (784V) and tariff ($0.28/kWh) | ChargingConsole.tsx:67,210 |
| Low | OSRM public gateway may be rate-limited at hackathon demo | journeyRouting.ts:206 |
| Low | .venv does not have pytest — must use system Python | Setup inconsistency |

---

## 12. Monad, Alchemy, Mera, and Kimi Integration Status

FINDING: All four integrations are completely absent from the codebase. No code, no config, no dependencies.

| Integration | Status | Evidence |
|-------------|--------|---------|
| Monad (network) | NOT STARTED | Zero references. No RPC URL, chain ID, or contract address anywhere |
| Alchemy | NOT STARTED | Not in package.json. No ALCHEMY_API_KEY in .env.example |
| Mera | NOT STARTED | Zero references anywhere in codebase |
| Wallet connect | NOT STARTED | No wagmi, viem, ethers, rainbow-me, or WalletConnect |
| On-chain payment | NOT STARTED | Cost is JS ticker (kwhDelivered * 0.28). Never touches a contract |
| Transaction signing | NOT STARTED | No signing capability |
| Kimi AI | NOT STARTED | No API calls to any Kimi endpoint |

### Current charging session flow (simulation only):
1. User taps "Initiate High-Speed Session"
2. setInterval increments kwhDelivered every second at vehicle max DC kW
3. Cost computed locally: kwhDelivered * 0.28
4. "Complete Session & Unlock Cable" stops interval, shows receipt modal
5. Receipt shows Math.random() invoice number — nothing recorded anywhere

### What is needed for the Monad track:
- Install viem + wagmi + wallet connector
- Deploy ChargingSession smart contract on Monad testnet
- On "Initiate Session" → wallet signs startSession(stationId) tx
- On "Complete Session" → wallet signs endSession(kwhDelivered, costWei) tx
- Receipt shows real txHash with block explorer link
- ALCHEMY_API_KEY for RPC provider on Monad

---

## 13. Security and Deployment Concerns

| Concern | Status | Detail |
|---------|--------|--------|
| .env excluded from git | OK | Confirmed in .gitignore |
| frontend/.env.local excluded | OK | Confirmed in .gitignore |
| Secrets in source | OK | grep found no committed keys |
| CORS configuration | Review | Allows https://*.vercel.app via regex — confirm for production |
| OCM API key | Warning | Empty in .env.example — likely hitting rate limits |
| data/raw/* gitignored | OK | Large datasets not tracked |
| Model artifacts gitignored | OK | .joblib, .pkl, .pt excluded |
| No rate limiting on /optimize | Risk | POST /optimize is heavy (QAOA can take 10-60s). No rate limiting |
| Input validation | OK | All request bodies use Pydantic with field constraints |
| Error messages | OK | sanitiseDetail() strips binary garbage from Qiskit errors |
| data/processed/cities/pune/ untracked | Intentional | Must remain untracked per team decision |

---

## 14. Prioritized Roadmap

### P0 — Hackathon Critical (all currently missing)

1. Install blockchain dependencies
   ```
   cd frontend && npm install viem wagmi @tanstack/react-query @rainbow-me/rainbowkit
   ```
   Target: Monad testnet (chain ID 10143), Alchemy RPC endpoint

2. Add .env.local variables
   ```
   NEXT_PUBLIC_MONAD_RPC_URL=https://monad-testnet.g.alchemy.com/v2/<KEY>
   NEXT_PUBLIC_ALCHEMY_API_KEY=<KEY>
   NEXT_PUBLIC_CHARGING_CONTRACT_ADDRESS=<DEPLOYED>
   ```

3. Deploy ChargingSession.sol to Monad testnet
   - startSession(bytes32 stationId) — emits SessionStarted
   - endSession(uint256 kwhX100, uint256 costWei) — emits SessionCompleted

4. Wire wallet connect into driver cockpit
   - Add ConnectWallet button to DriverNav.tsx
   - Gate "Initiate Session" on wallet connection

5. Replace JS charging ticker with on-chain session
   - startChargingSession() → sign startSession tx → show txHash
   - stopChargingSession() → sign endSession tx with final kWh + cost
   - Receipt modal: real txHash + Monad block explorer link

6. Mera integration (if SDK available)
   - Use Mera for account abstraction / wallet onboarding

### P1 — Quality and Demo Polish

7. Fix useCallback dependency mismatch in investor/map/page.tsx:86
   - Add setStationCount, setScenario, setPhase, setSequenceStep to deps array

8. Configure OCM API key in backend .env

9. Label simulated AI telemetry as "(estimated)" in JourneyPlanner

10. Add sizes prop to plug images in StationDetailSheet.tsx

11. Download global_ev_charging_stations.csv from Kaggle into data/raw/

### P2 — Post-Hackathon

12. Fix 47 ESLint errors (no-explicit-any, memoization)
13. Add E2E tests (Playwright)
14. Add rate limiting on POST /optimize
15. Add persistent transaction ledger backend endpoint
16. Real VIN verification
17. India-specific pricing (replace hardcoded $0.28/kWh with INR rates)

---

## 15. Five Most Important Next Actions

PRIORITY ORDER FOR MONAD METROPOLIS HACKATHON:

1. Install viem + wagmi + RainbowKit (or Mera SDK) and configure Monad testnet chain in Next.js.
   This unblocks all subsequent blockchain work.

2. Deploy a minimal ChargingSession.sol to Monad testnet.
   A 30-line contract with startSession + endSession events is sufficient for a credible demo.

3. Wire wallet connect into the driver cockpit.
   Add connect button, gate session start on wallet state, emit startSession tx when charging begins.

4. Replace the receipt modal random Invoice # with a real txHash.
   This single visible change transforms the simulation into a genuine blockchain product.
   This is the moment hackathon judges will look for.

5. Fix the useCallback dependency mismatch in investor/map/page.tsx (line 86).
   Only bug that could cause subtle re-render issues during a live demo.

---

## 16. Acceptance Criteria for Monad Integration

Before hackathon submission, verify:

- [ ] Wallet connects to Monad testnet without error
- [ ] "Initiate Session" sends a signed tx to the deployed contract
- [ ] Transaction appears on Monad testnet block explorer
- [ ] Receipt shows real txHash
- [ ] "Complete Session" sends a second signed endSession tx
- [ ] Session cost in wei matches local JS-computed cost
- [ ] Graceful fallback if wallet not connected (clear prompt, not broken UI)
- [ ] No secrets committed to git
- [ ] npx tsc --noEmit still passes after blockchain deps added
- [ ] python -m pytest backend/tests/ still passes (backend unchanged)

---

Audit produced by direct inspection of all key source files.
Commands run: python -m pytest -v backend/tests/, npx tsc --noEmit, npx eslint src/
No application files were modified.
Git state confirmed clean (only untracked: data/processed/cities/pune/).
