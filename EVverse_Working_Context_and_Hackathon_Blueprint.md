# EVverse / QuantEV2 --- Working Context & Hackathon Blueprint

**Prepared:** 13 October 2026\
**Purpose:** Reusable project context for AI coding agents. This is a
working handoff, not a personal-memory file. Update it as decisions and
verified results change.

## 1. Goal and priority

Build EVverse for Monad Metropolis with **Consumer Products & Payments
first**. Sponsor integrations matter only when they support a real,
demoable user journey.

Product idea: - **Drivers:** discover chargers on a map, compare
connector/power/price, choose a station, optionally pre-book a slot, and
pay through EVverse. - **Direct-pay path:** users already at a station
can go to Payment without planning a route or booking first. -
**Offers:** operator-funded discounts, verified partner offers, or
clearly labelled demo coupons. Never imply a real partnership or
redeemable offer unless confirmed. - **Operators/businesses:** manage
slots, bookings, pricing, offers, and analytics. Prefer one driver
action that visibly appears in an operator view over a disconnected
dashboard. - **Revenue hypothesis:** booking/payment commission,
operator subscriptions, sponsored offers, analytics. This is not
existing revenue.

The hackathon demo should make the chain useful but unobtrusive: "find,
reserve/pay, get a verifiable receipt." Testnet payments do **not**
activate a physical charger or represent real fiat/UPI settlement.

## 2. Repository snapshot from the 13 Oct audit

Repository: `https://github.com/khushibhadangkar/QuantEV2`\
Local folder: `C:\Dev\Projects\EV-VERSE\QuantEV2-evverse`\
Branch: `main`; audit says synced with `origin/main`. Preserve untracked
`data/processed/cities/pune/`. Avoid destructive Git commands,
reset/clean, force-push, and commits/pushes without explicit approval.

### Architecture

-   Frontend: Next.js 16.3, React 19, TypeScript, Tailwind CSS v4.
-   Maps: Leaflet for driver; MapLibre GL for investor/government. 3D:
    Three.js.
-   Backend: FastAPI under `backend/api/`, normally port 8000.
-   Routes: `/`, `/investor`, `/investor/map`, `/government`,
    `/government/map`, `/users/stations`, `/users/knowledge`.
-   API routes: `GET /api/v1/health`, `GET /api/v1/status`,
    `POST /api/v1/optimize`, `GET /api/v1/live-stations`,
    `GET /api/v1/spatial/context`, `POST /api/v1/spatial/calculate`.
-   Existing infrastructure analysis: RandomForest demand prediction,
    QUBO formulation, optional QAOA via Qiskit Aer with classical
    fallback, spatial/financial modelling.
-   Data/services: Parquet demand data and KMeans zones; Open Charge Map
    (OCM); OSRM routing with geodesic fallback.
-   Audit found **no Monad, Alchemy, wallet, on-chain payment, Mera, or
    Kimi integration** at the time it was run.

### Existing driver functionality

Station discovery/filtering/detail, vehicle garage with localStorage,
journey routing/energy estimates/charging-stop suggestions, and a
charging screen with a simulated kWh ticker and receipt already exist. -
Charging ticker/receipt is not a real charger session or payment. -
Journey "AI telemetry" is local arithmetic; co-pilot is a template, not
model inference. - Tariffs can be missing; fallback is hardcoded
`$0.28/kWh`. - Invoice identifier is random, not a transaction ID or
persistent ledger record. - Clearly label live data, estimates,
hardcoded demo values, and simulations.

### Audit-reported checks (verify after changes)

  --------------------------------------------------------------------------
  Check                                  Audit result
  -------------------------------------- -----------------------------------
  `python -m pytest -v backend/tests/`   6 passed

  `cd frontend; npx tsc --noEmit`        Passed

  `cd frontend; npm run build`           Final audit summary says passed; 11
                                         static pages generated

  `cd frontend; npx eslint src/`         139 problems: 47 errors, 92
                                         warnings
  --------------------------------------------------------------------------

Reported issues include a React Compiler/useCallback issue in
`frontend/src/app/investor/map/page.tsx:86`, `no-explicit-any` and
unused-variable errors, missing global baseline CSV, and possibly
unconfigured OCM key. **ESLint errors are source-code lint findings;
they are not automatically caused by `.env`.** Build, TypeScript and
ESLint are separate checks. Compare exact commit, lockfile, Node/npm
versions, and output with teammate before diagnosing environment
differences.

## 3. Track and sponsor plan

### Primary: Consumer Products & Payments

Aim for one complete path: 1. Driver chooses **Find a charger** (map) or
**Pay / Book** (direct flow). 2. Select station, connector, slot/time,
and transparent price. 3. Confirm with the wallet/account flow required
by the selected sponsor integration. 4. Persist booking/payment status
and show a verifiable transaction receipt only after a real testnet
transaction succeeds. 5. Show the same booking/status in an
operator/demo view if time allows. 6. Optionally apply a clearly
labelled demo offer or verified partner discount.

A small end-to-end flow is stronger than many disconnected features. Do
not claim a testnet payment activates a charger.

### Alchemy + Monad

Use Alchemy's Monad testnet RPC to read chain data and submit/verify a
real transaction; show its real hash and explorer link. - Official
Alchemy Monad testnet: https://www.alchemy.com/rpc/monad-testnet -
Official quickstart:
https://www.alchemy.com/docs/reference/monad-api-quickstart -
Audit-reported testnet chain ID: `10143`; verify current official
configuration before implementation. - RPC URL shape:
`https://monad-testnet.g.alchemy.com/v2/<API_KEY>`. - Do not blindly add
`NEXT_PUBLIC_ALCHEMY_API_KEY`. A `NEXT_PUBLIC_` variable is exposed in
the browser bundle. Use restricted keys and/or a server-side proxy as
appropriate; never commit secrets. - Decide what the transaction
actually represents before deploying a minimal contract. Use testnet
tokens only.

### Mera

Mera was a target bounty, but the audit found no code/SDK integration.
Confirm exact bounty criteria and current official SDK docs before
implementation; do not assume its capabilities based on the name. Use it
if it materially improves onboarding and is feasible within the
remaining time.

### Kimi

Kimi was considered as a possible additional bounty; confirm that it is
selected and check submission requirements. Useful feature: a concise
charging/trip assistant that explains station choices using actual app
data (distance, connector compatibility, price, detour, slot). It must
call the real Kimi API server-side, keep the key server-side, handle
failures, and never invent live facts. - Official API overview:
https://www.kimi.ai/help/kimi-api/api-overview - API platform:
https://platform.kimi.ai - If the bounty requires a published article
URL, publish only after the real integration exists and accurately
describe it.

**Sponsor principle:** track flow first; Alchemy/Monad for a verified
on-chain action; Mera if official docs and time support it; Kimi only if
the core journey works. No sponsor logos standing in for integrations.
Check exact current bounty wording in the official portal.

## 4. Genetic Algorithm (GA) proposal --- recommendation

The teammate's idea---replace the QUBO/QAOA optimization workflow with a
data-driven Genetic Algorithm for station placement, capacity and
investment scenarios---is technically reasonable, but **not the first
priority before submission**.

A credible GA requires a defined solution representation, feasibility
constraints, fitness function, selection/crossover/mutation/elitism,
seeds/stopping criteria, and independent comparison with
existing-network and greedy baselines. Data provenance and adequate data
must be established before claiming real-world improvement. Replacing
the current optimizer now risks breaking working investor/government
flows while the primary track/payment integration is still missing.

Recommendation: - **Before submission:** keep the existing optimizer
stable. Do not rewrite the main path. - **If spare time:** only build an
isolated GA service with tests and baseline comparison; do not rewrite
the UI/backend. - **After the core track flow or post-hackathon:** run
GA behind a strategy/feature flag, compare on the same
datasets/seeds/constraints, report metrics honestly, then decide whether
it should replace the existing default.

## 5. ESLint diagnosis

Do not fix all 47 errors and 92 warnings at once. 1. Re-run
`cd frontend; npx eslint src/` from the repo root and save the actual
first error messages with file/line references. 2. Check
`git status -sb`, `git log -5 --oneline`, `node --version`,
`npm --version`, and whether dependencies match the committed lockfile.
Do not install/change dependencies without approval. 3. Compare exact
branch/commit and lockfile with teammate's machine; inspect diffs rather
than overwriting their work. 4. Fix only understood issues that block
build or cause a demonstrated runtime bug. Keep lint cleanup separate
from payment work. 5. Do not change `.env` to "fix ESLint" unless
evidence shows the lint config depends on an env variable.

## 6. Agent safety rules

-   Read this context plus `EVVERSE_PROJECT_AUDIT.md`, `HANDOVER.md`,
    and `EVVERSE_TECHNICAL_HANDOFF.md` before proposing edits.
-   Treat audit as a snapshot; inspect current files before acting.
-   Before edits, state the smallest change, files touched, tests and
    risks. Ask before dependency installs, env changes, deployments,
    commits or pushes.
-   Preserve teammate changes and `data/processed/cities/pune/`.
-   Never run destructive Git commands or print secret values.
-   Make one vertical slice work end to end before adding more features.
-   Never invent partnerships, discounts, payments, AI outputs, or
    transaction hashes.
-   After each meaningful change: inspect diff, run relevant
    tests/build/typecheck, report exact results. Leave commits/pushes to
    the user unless explicitly asked.

## 7. Implementation sequence

### Phase 0 --- Reconfirm

-   Read this and the handoff documents.
-   Check `git status -sb`, latest commit, preserve Pune data.
-   Confirm deadline and selected bounty requirements in the portal.
-   Confirm dev servers and env-variable names without printing secret
    values.

### Phase 1 --- Track-first consumer flow

-   Define minimum records: station, slot, booking, offer/discount,
    payment status, transaction hash.
-   Use reliable inventory or clearly labelled demo slots if live
    inventory is unavailable.
-   Implement **Find a charger** and **Pay / Book** entry paths.
-   Ensure direct pay does not force route planning.
-   Persist booking/payment state; connect to operator/demo view if
    feasible.

### Phase 2 --- One real Monad/Alchemy action

-   Verify chain configuration and use a restricted testnet key.
-   Implement only the required wallet/account flow and minimal
    transaction/contract.
-   Verify receipt and explorer URL; persist real hash/status.
-   Clearly distinguish testnet from fiat and physical charging.

### Phase 3 --- Mera if feasible

-   Read official bounty criteria and SDK docs.
-   Build the smallest qualifying integration. Do not let uncertain
    setup block the core path.

### Phase 4 --- Offers/Kimi if core works

-   Add a deterministic demo offer or verified discount.
-   Add Kimi only if selected and time remains; ground answers in
    backend-supplied station data.

### Phase 5 --- Verification

-   Re-run backend tests, `npx tsc --noEmit`, `npm run build`, and lint
    on changed files.
-   Manually test discover → select → book/pay → verified receipt →
    operator status.
-   Test disconnected wallet, RPC failures, rejected/pending
    transactions, duplicate clicks, and no-key states.
-   Capture real evidence. Defer full GA replacement unless all
    track-critical acceptance criteria are met.

## 8. Demo acceptance checklist

-   [ ] Consumer Products & Payments journey works end to end.
-   [ ] Driver can choose map discovery or direct pay/book.
-   [ ] Price, slot, offer and station data are labelled
    live/backend/demo.
-   [ ] Booking persists and can be shown in operator/demo view.
-   [ ] At least one real Monad testnet transaction succeeds and hash is
    verifiable, if on-chain payment is claimed.
-   [ ] Alchemy is actually used and tested.
-   [ ] Mera/Kimi are claimed only if integrations satisfy bounty rules.
-   [ ] No secrets committed/exposed.
-   [ ] Existing investor/government optimization still works.
-   [ ] Tests/build/typecheck and changed-file lint results are
    recorded.
-   [ ] Pune data untouched; no unapproved commit/push/deploy.
-   [ ] Demo states testnet payment is not fiat settlement or charger
    activation.

## 9. Quick flowchart

``` text
EVverse
  +--> Find a charger --> map/station details --> choose station/slot --+
  +--> Pay / Book directly ---------------------------------------------+
                                                                        |
                                                           transparent price/offer
                                                                        |
                                                            confirm wallet/account
                                                                        |
                                                   Monad testnet tx (Alchemy RPC)
                                                                        |
                                                   verified tx receipt + booking
                                                                        |
                                                  driver receipt + operator status
                                                                        |
                                             optional Mera onboarding / Kimi help

Separate future work: GA optimizer behind a flag -> baseline comparisons -> consider replacing QUBO/QAOA.
```

## 10. Official links gathered

-   Alchemy Monad testnet: https://www.alchemy.com/rpc/monad-testnet
-   Alchemy Monad quickstart:
    https://www.alchemy.com/docs/reference/monad-api-quickstart
-   Kimi API overview: https://www.kimi.ai/help/kimi-api/api-overview
-   Kimi API platform: https://platform.kimi.ai

Mera SDK links and the exact live bounty requirements still need
confirmation from the official hackathon portal. Do not guess URLs or
SDK behavior.
