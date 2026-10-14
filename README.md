# EVverse — On-Chain EV Charging Marketplace & Spatial Infrastructure Planning

> **Decentralized stall reservations on Monad Testnet, verified on-chain settlement, and data-driven charging infrastructure planning.**  
> *Built for the Monad Metropolis Hackathon.*

---

## ⚡ Live Deployments & Key Links

| Resource | URL / Details | Verification Status |
|---|---|---|
| **Live Frontend** | [https://evverse-mu.vercel.app/](https://evverse-mu.vercel.app/) | Deployed on Vercel (Next.js 16 / React 19) |
| **Live Backend** | [https://evverse-backend.onrender.com](https://evverse-backend.onrender.com) | Deployed on Render (FastAPI / Uvicorn) |
| **API Health Probe** | [`/api/v1/health`](https://evverse-backend.onrender.com/api/v1/health) | Returns `status: "ok"`, `service: "EVision API"` |
| **Monad RPC Status** | [`/api/v1/driver/rpc-status`](https://evverse-backend.onrender.com/api/v1/driver/rpc-status) | Returns active RPC provider, block height & Chain ID `10143` |
| **Source Repository** | [https://github.com/Atharva777777/EVverse](https://github.com/Atharva777777/EVverse) | Public GitHub repository |
| **Target Network** | **Monad Testnet** | Chain ID `10143` (`0x279f`) |
| **Public RPC** | `https://testnet-rpc.monad.xyz` | Native Asset: `MON` (18 decimals) |
| **Block Explorer** | [https://testnet.monadexplorer.com](https://testnet.monadexplorer.com) | Transaction verification & receipt inspection |

---

## 🎯 Problem & Proposed Solution

Electric vehicle (EV) charging suffers from friction across all three core stakeholders:

1. **EV Drivers** face unpredictable queues, broken chargers, and range anxiety. Arriving at a station only to find all bays occupied causes delays.
2. **Station Owners** need transparent settlement, hardware utilization tracking, and visibility into booked reservations without lock-in to proprietary hardware networks.
3. **Infrastructure Investors** struggle with capital allocation, risking funds on suboptimal locations without demand modeling or grid-awareness.

### The EVverse Solution

**EVverse** connects these three perspectives into a unified platform:
- **For Drivers**: Discover real-world charging stations, verify plug compatibility, and cryptographically reserve a charging stall with native **MON** on the **Monad Testnet**.
- **For Station Owners**: Monitor station hardware lineups, manage dynamic tariffs, and review verified on-chain reservation receipts tied directly to Monad transaction hashes.
- **For Investors**: Analyze urban charging corridors, evaluate predicted demand, and optimize station placement using classical and quantum-simulated combinatorial solvers.

---

## 🧭 Judge Quick Start / Steps to Try

Judges can explore the application with or without a Web3 wallet:

### Path A: Zero-Wallet Walkthrough (Investor & Station Owner)
*No wallet, tokens, or account creation required.*

1. **Explore the Landing Page**: Visit [https://evverse-mu.vercel.app/](https://evverse-mu.vercel.app/) and select a role.
2. **Test Infrastructure Planning**: Navigate to **Investor** (`/investor/map`):
   - Choose a metropolitan area (e.g., Mumbai, San Francisco, Chicago).
   - Select station placement count (1–8) and a demand scenario (e.g., *Morning Peak*, *24h Baseline*).
   - Click **Find Optimal Locations** to run the backend optimization pipeline.
   - Review selected zones, predicted demand, infrastructure gap scores, the **3D Station Model** modal, and the **Municipal Briefing** generator.
3. **Inspect Station Owner Studio**: Navigate to **EV Station Owners** (`/station-owners`):
   - Review the hardware lineup across charging bays.
   - Switch to the **Earnings & Payouts** tab to inspect dynamic tariff controls and the **Live Monad Testnet Receipts** ledger loaded from the backend database.

### Path B: On-Chain Driver Booking Walkthrough (Monad Testnet)
*Requires an EIP-1193 browser wallet (MetaMask, Rabby, etc.) and Monad Testnet MON.*

1. **Get Testnet MON**: Obtain free testnet MON from the official [Monad Testnet Faucet](https://testnet.monad.xyz).
2. **Open the Driver Cockpit**: Navigate to **EV Users** (`/users/stations`):
   - Select your vehicle profile (e.g., BMW i4, Porsche Taycan) to filter compatible plugs.
   - Select an available station from the map or station list and click **Book Stall & Charge**.
3. **Review & Configure**:
   - In Step 1 (**Configuration**), choose your bay (e.g., *Bay 01 — 150 kW CCS2*), reservation duration (e.g., 30 min), and battery target.
   - In Step 2 (**Review & Payment**), view the itemized price breakdown:
     - **Due Now**: Stall Reservation Deposit (`0.025 MON` / reference `₹49`).
     - **Metered Separately**: Estimated charging energy (billed on dispense).
4. **Connect Wallet & Switch Network**:
   - Click **Connect Browser Wallet**. If your wallet is on a different chain, the app prompts you to switch to **Monad Testnet (Chain ID 10143)** automatically.
5. **Set Payment Recipient**:
   - If the environment recipient is unset, the modal invites you to click **Use Connected Wallet** (or input any valid `0x...` address) for immediate evaluation.
6. **Submit & Verify on Monad**:
   - Click **Approve 0.025 MON via Wallet**. Approve the transaction in your wallet.
   - The app polls the Monad RPC (`eth_getTransactionReceipt`), verifies block inclusion and parameters, persists the booking to the backend, and displays Step 3: **Active Reservation Pass**.
   - Inspect the verified transaction hash, 4-digit barrier unlock PIN, live countdown timer, and direct **Monad Explorer** link.

---

## 🔗 Monad Testnet Integration

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MONAD TESTNET FLOW                              │
└────────────────────────────────────────────────────────────────────────┘

 [ Driver Frontend ]
        │
        ├─ 1. Connect EIP-1193 Wallet (MetaMask / Rabby)
        ├─ 2. Auto-switch to Monad Testnet (Chain ID 10143)
        ├─ 3. Parse exact amount: 0.025 MON → 25000000000000000 wei (Hex)
        ├─ 4. Explicit user approval via eth_sendTransaction
        │
        ▼
 [ Monad Testnet RPC ] ─── 5. Transaction Mined (Chain ID 10143)
        │
        ├─ 6. Client polls eth_getTransactionReceipt & enforces:
        │     • status == "0x1"
        │     • recipient == expected recipient
        │     • value >= expected wei
        ▼
 [ FastAPI Backend ]
        │
        ├─ 7. Independent Server-Side Verification:
        │     • Queries Monad RPC independently (never trusts client flag)
        │     • Re-verifies mined receipt status, recipient, and amount
        │     • Enforces UNIQUE tx_hash constraint (rejects replay attacks)
        ▼
 [ SQLite Database ] ─── 8. Persists confirmed booking in driver_bookings
        │
        ▼
 [ Station-Owner Dashboard ] ─── 9. Displays confirmed on-chain receipt
                                    with tx hash, block height & Monad Explorer link
```

### Key Technical Properties of the Monad Implementation

- **Direct EIP-1193 Integration**: Implemented in [`frontend/src/lib/monadPayment.ts`](file:///c:/Dev/Projects/EV-VERSE/QuantEV2-evverse/frontend/src/lib/monadPayment.ts) using native `window.ethereum` calls. No heavy or vulnerable Web3 SDKs.
- **Precise Integer Wei Conversion**: `monToWeiHex()` parses token amounts using BigInt string splitting, eliminating floating-point rounding errors common in JavaScript `Number` conversions.
- **Dual-Layer Receipt Verification**:
  1. *Client-side*: Confirms receipt status (`0x1`), mined recipient, and mined wei before transitioning UI state.
  2. *Server-side*: [`backend/api/routers/driver.py`](file:///c:/Dev/Projects/EV-VERSE/QuantEV2-evverse/backend/api/routers/driver.py) independently queries the Monad JSON-RPC endpoint. The backend **never** trusts client-supplied payment success flags.
- **Replay Protection**: The `driver_bookings` table enforces a unique index on `tx_hash`. Duplicate submissions are rejected with HTTP 409 Conflict.
- **Dual RPC Provider Support**: Prioritizes Alchemy Monad Testnet RPC (`https://monad-testnet.g.alchemy.com/v2/...`) with bounded automatic fallback to public Monad RPC (`https://testnet-rpc.monad.xyz`). Live status verified at `/api/v1/driver/rpc-status`.

---

## ⚗️ Alchemy Integration

EVverse integrates **Alchemy** as its primary high-throughput, enterprise-grade RPC provider for Monad Testnet (Chain ID `10143`), ensuring reliable on-chain payment and receipt verification.

### Why EVverse Uses Alchemy
- **Zero Throttling on Payment Verifications**: Driver charging reservations require fast, deterministic transaction receipt confirmation. Alchemy's infrastructure eliminates public RPC rate-limiting and connection drops during high-concurrency periods.
- **Strict Server-Side Isolation**: Alchemy private API keys are kept entirely server-side in the FastAPI backend, ensuring private credentials are never exposed to browser bundles or client network traffic.

### Backend RPC Calls Routed Through Alchemy
When `ALCHEMY_API_KEY` is configured, the backend directs the following mission-critical JSON-RPC queries to Alchemy:
1. `eth_chainId`: Validates that the active RPC connection is genuinely communicating with Monad Testnet (verifies integer `10143` / `0x279f`).
2. `eth_getTransactionReceipt`: Cryptographically confirms transaction mining, block height, and execution status (`status == "0x1"`) before releasing barrier unlock PINs and locking bay reservations.
3. `eth_getTransactionByHash`: Inspects the on-chain transfer value (wei) and target contract/recipient address against expected billing parameters.
4. `eth_blockNumber`: Performs active liveness probes in health diagnostics.

### Provider Architecture & Bounded Failover
```
                      [ Incoming Payment Verification Request ]
                                         │
                                         ▼
                     Is ALCHEMY_API_KEY set on backend?
                                    /         \
                             YES   /           \   NO
                                  ▼             ▼
                    [ Alchemy Monad RPC ]    [ Monad Public RPC ]
                    (Chain ID: 10143)        (testnet-rpc.monad.xyz)
                                  │                     │
                     Network Error or Timeout?          │
                                  │                     │
                             YES / \ NO                 │
                                ▼   └────────► SUCCESS ◄┘
                    [ Fallback: Public RPC ]
```
- **Primary Route**: Requests immediately target `https://monad-testnet.g.alchemy.com/v2/<ALCHEMY_API_KEY>`.
- **Bounded Failover**: If Alchemy encounters a network timeout (5-second bounded window) or connection error, the backend automatically fails over to the public Monad Testnet RPC (`https://testnet-rpc.monad.xyz`).
- **Semantic Integrity**: Failover is strictly reserved for network/transport faults. Deterministic on-chain receipts (e.g., reverted transactions `status == "0x0"`) are never treated as network failures and will not trigger failover.
- **Audit Transparency**: Booking responses and backend logs explicitly declare the verifying provider (`verification_provider: "Alchemy Monad Testnet RPC"` vs. `"Monad Public Testnet RPC (Fallback)"`).

### Client-Side vs. Backend RPC Roles
- **Backend (FastAPI)**: Routes all critical payment verifications and status checks through Alchemy.
- **Frontend (Next.js / Browser)**: Interacts with the user's injected wallet provider (`window.ethereum`) and uses the public Monad RPC for read-only browser queries. **Alchemy API keys are never bundled into client-side JavaScript**.

### Safe Diagnostic Endpoint
EVverse provides a transparent diagnostic endpoint at `GET /api/v1/driver/rpc-status` that actively probes the provider:
```bash
curl https://evverse-backend.onrender.com/api/v1/driver/rpc-status
```
Example response when Alchemy is active:
```json
{
  "status": "connected",
  "provider": "Alchemy Monad Testnet RPC",
  "is_alchemy": true,
  "alchemy_configured": true,
  "fallback_active": false,
  "rpc_url": "https://monad-testnet.g.alchemy.com/v2/********",
  "chain_id": 10143,
  "latest_block": 1234567,
  "latency_ms": 45.2
}
```
*Note: Secret API keys in endpoint URLs are automatically masked (`/v2/********`) in all responses and logs.*

### Environment Configuration & Setup
- **Variable Name**: `ALCHEMY_API_KEY` (Backend only — **DO NOT** use `NEXT_PUBLIC_ALCHEMY_API_KEY`).
- **Alchemy App Configuration**: In the [Alchemy Dashboard](https://dashboard.alchemy.com), ensure your App has **Monad Testnet** enabled under its supported networks. If Monad Testnet is not yet enabled, Alchemy returns `-32600: MONAD_TESTNET is not enabled for this app`, in which case EVverse automatically and safely fails over to the public Monad Testnet RPC until enabled.
- **Local Development**: Add to your root `.env` file:
  ```env
  ALCHEMY_API_KEY=your_alchemy_api_key_here
  ```
- **Production (Render Backend)**:
  1. Open the [Render Dashboard](https://dashboard.render.com).
  2. Select `evverse-backend`.
  3. Navigate to **Environment**.
  4. Add Environment Variable:
     - Key: `ALCHEMY_API_KEY`
     - Value: `<your-alchemy-api-key>`
  5. Click **Save Changes** (Render will trigger a zero-downtime redeploy).

### Automated Verification Tests
Run the dedicated test suite for Alchemy configuration, status probing, receipt validation, and failover:
```bash
python -m pytest backend/tests/test_monad_booking.py -v
```

> *Note: This integration provides an active, verified Alchemy Monad Testnet RPC implementation. Official hackathon bounty eligibility remains subject to organizer rules.*

---

## 👥 User Roles & Implemented Workflows

### 1. EV Drivers & Users (`/users/stations`)
- **Station Discovery**: Interactive map rendered with Leaflet.js, displaying verified stations enriched via the Open Charge Map API with Kaggle baseline fallback.
- **Vehicle Garage Cockpit**: Select vehicle models (BMW i4, Porsche Taycan, etc.) to automatically match charging speed and connector types (CCS2, Type 2, CHAdeMO).
- **Route & Journey Planner**: Highway corridor planning utility computing charging stop recommendations based on distance and battery buffer.
- **Stall Reservation**: Interactive duration selection (15–60 min), itemized pricing breakdown, and real Monad Testnet wallet payment flow.
- **Reservation Pass**: Displays 4-digit barrier unlock PIN, live countdown timer, and direct link to Monad Explorer.

### 2. EV Station Owners (`/station-owners`)
- **Hardware Showcase**: Visual lineup of AC and DC fast chargers (Bay 01 to Bay 06) with connector types, power ratings, and bay availability indicators.
- **Dynamic Tariff Controls**: Interactive controls to adjust electricity rates (₹/kWh) and parking hold fees (₹/hour).
- **On-Chain Settlement Ledger**: Real-time table fetching confirmed Monad Testnet booking receipts from the backend (`GET /api/v1/driver/station-owner/bookings`), displaying transaction hashes, block numbers, amounts in MON, and Monad Explorer links.
- **Telemetry Transparency**: Clearly labels operational metrics and revenue summaries as *Simulated Telemetry* to preserve data integrity.

### 3. Infrastructure Investors (`/investor/map`)
- **Urban Planning Area Selection**: Select from major metropolitan centers across India (Mumbai, Pune, Thane), the US (San Francisco, Los Angeles, Chicago), and China (Shenzhen).
- **Planning Parameters**: Configure candidate station count (1–8) and temporal demand scenarios (24h Baseline, Morning Peak, Afternoon, Overnight, Weekday, Weekend).
- **Optimization Pipeline**: Runs AI demand forecasting and combinatorial optimization via `/api/v1/optimize`.
- **Candidate Site Evaluation**: Evaluates predicted demand (kWh/h), infrastructure gap scores, and proximity-weighted coverage.
- **3D Station Model & Digital Twin**: Interactive 3D station visualization (`Spatial3DDigitalTwinModal.tsx` & Three.js viewport).
- **Municipal Briefing**: Printable executive report modal summarizing infrastructure Capex, estimated payback, and CO₂ offset.

### 4. EV Knowledge Hub (`/users/knowledge`)
- Dedicated reference guide covering charging connector standards (CCS2, CHAdeMO, GB/T, Type 2), AC vs. DC charging curves, and battery longevity best practices.

---

## 🧠 AI Demand Forecasting & Optimization Pipeline

The investor planning engine ([`backend/api/services/optimizer.py`](file:///c:/Dev/Projects/EV-VERSE/QuantEV2-evverse/backend/api/services/optimizer.py)) executes an end-to-end analytical pipeline:

```
[ Raw Station & City Data ]
            │
            ▼
 1. Feature Engineering       build_features() — temporal patterns, day-of-week, traffic momentum
            │
            ▼
 2. Demand Forecasting        Random Forest Regressor (Scikit-learn pipeline)
            │                 predicts demand (kWh/h) per candidate zone
            ▼
 3. QUBO Formulation          Encodes proximity-weighted demand coverage (3km radius)
            │                 and station count penalty into a binary quadratic matrix
            ▼
 4. Combinatorial Solvers     • Classical Solver: Exhaustive evaluator (finds theoretical global minimum)
                              • Quantum Simulation (QAOA): Parameterized quantum circuit
                                simulated via Qiskit Aer (graceful classical fallback if Aer is omitted)
```

- **Demand Model**: Pre-trained Random Forest model (`feature_pipeline.joblib`) predicting localized charging demand.
- **QUBO Matrix**: Translates spatial candidate zone selection into a Quadratic Unconstrained Binary Optimization formulation with penalty parameters enforcing the exact station budget.
- **QAOA Solver**: Uses Qiskit Aer parameterized quantum circuits with COBYLA classical optimizer when `qiskit_aer` is installed. When omitted, the pipeline falls back cleanly to the exhaustive classical solver.

---

## 🏗️ Technical Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EVVERSE ARCHITECTURE                            │
└────────────────────────────────────────────────────────────────────────┘

  [ Web Browser / Client ]
      │
      ├─ Next.js 16 (App Router, Turbopack, React 19, TypeScript)
      ├─ Leaflet.js (GIS Map & Station Visualizations)
      ├─ Three.js (3D Station Digital Twin Viewport)
      ├─ EIP-1193 Web3 Provider (window.ethereum)
      │
      ├──────────────────────────────┬─────────────────────────────┐
      │ HTTPS REST Calls             │ JSON-RPC (eth_sendTx)       │
      ▼                              ▼                             ▼
  [ FastAPI Backend ]        [ Monad Testnet ]             [ Open Charge Map ]
  (Python 3.11+, Uvicorn)    (Chain ID 10143)              (Public API)
      │                              ▲                             ▲
      ├─ /api/v1/optimize            │                             │
      ├─ /api/v1/driver/bookings ────┤ (RPC Verification)          │
      ├─ /api/v1/driver/rpc-status ──┤                             │
      ├─ /api/v1/live-stations ──────┼─────────────────────────────┘
      │                              │
      ▼                              │
  [ SQLite Persistence ]             ▼
  (data/driver.db)          [ Monad Explorer ]
  • driver_bookings         (testnet.monadexplorer.com)
  • charging_sessions
  • driver_vehicles
```

### Technology Matrix

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 16.3, React 19, TypeScript 5 | Responsive UI, App Router, static & dynamic rendering |
| **Styling & Icons** | Tailwind CSS 4, Lucide Icons | Clean typography, mobile-first layouts, accessible icons |
| **GIS & 3D Visuals** | Leaflet.js, React-Leaflet, Three.js | Geospatial charging map, 3D charger model visualization |
| **Blockchain / Web3** | EIP-1193 (`window.ethereum`), JSON-RPC | Monad Testnet wallet connection, transaction dispatch |
| **Backend Framework** | FastAPI 0.141, Uvicorn, Pydantic | Asynchronous REST APIs, request validation, CORS middleware |
| **Data Layer** | SQLite (`data/driver.db`), Pandas | Relational persistence for bookings, telemetry, sessions |
| **Machine Learning** | Scikit-learn (Random Forest), NumPy | Hourly demand prediction per geographic candidate zone |
| **Optimization** | DOcplex, Qiskit, Qiskit Aer (optional) | QUBO problem modeling, QAOA quantum simulation, classical solver |
| **External APIs** | Open Charge Map API, Monad RPC, Alchemy | Live station data, Monad Testnet block height & receipt verification |

---

## ⚙️ Environment Configuration

Copy the provided example file to create your local `.env`:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Description | Required? | Default / Example |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL for frontend | Yes (local) | `http://localhost:8000` |
| `API_HOST` | FastAPI host interface | Local dev | `0.0.0.0` |
| `API_PORT` | FastAPI port | Local dev | `8000` |
| `NEXT_PUBLIC_MONAD_PAYMENT_RECIPIENT_ADDRESS` | On-chain 20-byte recipient wallet for testnet bookings | Optional | `0xYourWalletAddress` |
| `NEXT_PUBLIC_MONAD_RPC_URL` | Monad Testnet RPC endpoint | Optional | `https://testnet-rpc.monad.xyz` |
| `NEXT_PUBLIC_MONAD_EXPLORER_URL` | Monad Testnet Explorer URL | Optional | `https://testnet.monadexplorer.com` |
| `MONAD_RPC_URL` | Backend RPC endpoint for on-chain verification | Optional | `https://testnet-rpc.monad.xyz` |
| `MONAD_PAYMENT_RECIPIENT_ADDRESS` | Backend recipient address for payment checks | Optional | `0xYourWalletAddress` |
| `OPEN_CHARGE_MAP_API_KEY` | Free API key from Open Charge Map | Optional | Free from [openchargemap.org](https://openchargemap.org/) |
| `ALCHEMY_API_KEY` | Server-side Alchemy API key for Monad Testnet RPC verification | Optional | `your_alchemy_api_key_here` |
| `MONAD_ALCHEMY_RPC_URL` | Custom full Alchemy Monad Testnet RPC URL override | Optional | `https://monad-testnet.g.alchemy.com/v2/...` |

> **Security Notice**: Never paste real private keys, mnemonic seed phrases, or production secrets into `.env` or commit them to source control. `.env` is included in `.gitignore`. Note that `ALCHEMY_API_KEY` is server-side only and must **never** use a `NEXT_PUBLIC_` prefix.

---

## 🛠️ Safe Local Development Setup

### 1. Prerequisites
- **Node.js**: `v18.17+` or `v20+`
- **npm**: `v9+` or `v10+`
- **Python**: `3.10+` (tested with Python 3.11 and 3.12)
- **Git**

### 2. Backend Setup
From the repository root:

```bash
# 1. Create and activate a Python virtual environment
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On macOS / Linux:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the FastAPI server
uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).  
Interactive OpenAPI documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Frontend Setup
In a separate terminal window:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Visit the app in your browser at [http://localhost:3000](http://localhost:3000):
- **Landing Page**: `http://localhost:3000/`
- **Driver Cockpit**: `http://localhost:3000/users/stations`
- **Station Owner Studio**: `http://localhost:3000/station-owners`
- **Investor Planning Map**: `http://localhost:3000/investor/map`
- **Knowledge Hub**: `http://localhost:3000/users/knowledge`

---

## 🧪 Available Test & Verification Commands

All test and verification commands can be run locally without external secrets:

### 1. Backend Verification
```bash
# Run Monad payment verification and persistence unit tests
python -m pytest backend/tests/test_monad_booking.py -v

# Run city coordinate validation tests
python -m pytest backend/tests/test_city_validation.py -v
```

### 2. Frontend Verification
From the `frontend/` directory:

```bash
cd frontend

# 1. TypeScript static analysis
npx tsc --noEmit

# 2. ESLint code-quality check
npx eslint src/ --quiet

# 3. Production build test (Turbopack prerendering)
npm run build
```

---

## ⚠️ Current Limitations & Honest Disclosures

To ensure transparency for hackathon judges, the following distinctions should be noted:

1. **Testnet Token Value**: All blockchain transactions are executed exclusively on **Monad Testnet (Chain ID 10143)** using testnet `MON`. Testnet tokens have **zero real-world monetary value**.
2. **Physical Hardware Decoupling**: A confirmed on-chain stall reservation cryptographically verifies the bay hold and issues a barrier PIN code; it does **not** trigger physical charger electricity flow or actuate real-world barrier gate hardware.
3. **Simulated Telemetry**: Station owner revenue cards, split-bar calculations, and 7-day revenue charts display simulated operational telemetry, as indicated by the `Simulated Telemetry` badge in the UI. Live on-chain booking receipts are loaded directly from SQLite and the Monad RPC.
4. **Third-Party API Rate Limits**: Live station data is fetched from the Open Charge Map API. If the API key is omitted or rate limits are reached, the system gracefully falls back to baseline dataset records.
5. **QAOA Quantum Simulation**: QAOA is executed on a classical simulator (Qiskit Aer), not physical quantum processing hardware. If `qiskit_aer` is unavailable, the pipeline falls back to an exhaustive classical solver.
6. **No User Password Authentication**: To streamline hackathon judging, the application uses guest session tokens stored in `localStorage` (`X-Driver-Token`) rather than requiring account creation or password credentials.

---

## 📜 License

This project is licensed under the **MIT License**.
