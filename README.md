# QuantEV — The Intelligent Operating System for Electric Mobility

> **An intelligent, unified ecosystem bridging EV Drivers, Station Owners, and Capital Investors — powered by Evolutionary AI and Machine Learning.**

---

## 🌟 The Vision

Electric mobility is the future, but the infrastructure behind it has been fragmented, unpredictable, and slow to adapt. Drivers worry about queue times and incompatible chargers, station owners struggle to balance revenue and equipment uptime, and investors risk millions guessing where to build.

**QuantEV** changes everything. We've built a single, beautifully unified platform that seamlessly serves all three sides of the electric revolution:
1. **EV Drivers** who want frictionless, guaranteed charging wherever they go.
2. **Station Owners** who need a mobile-first command center to manage hardware, track every rupee earned, and capture surging demand.
3. **Investors** seeking high-conviction, data-backed locations that maximize returns and protect grid stability.

---

## 👥 Three Perspectives, Three Unrivaled Superpowers

QuantEV is tailored for the three key stakeholders powering the electric future.

### ⚡ 1. EV Charging Station Owners
*Your entire charging business in the palm of your hand.*

* **Live Mobile Command Center & Instant Payouts**  
  Monitor every single rupee your stations generate in real time. Track earnings split between energy dispensed and paid parking holds, adjust dynamic kilowatt tariffs with a tap, and transfer profits directly to your bank account with instant payouts.
* **Photorealistic Hardware Showcase & Bay Telemetry**  
  Visualize your station's exact physical setup with an interactive, beautifully rendered hardware lineup. Track real-time power draw across every bay (from 22 kW destination chargers to 180 kW ultra-fast dispensers), monitor active vehicles, and control smart features like auto-release plug locks and night canopy lighting.
* **Unmet Demand Radar & Driver Reputation**  
  Never miss an opportunity to expand. View real-time driver traffic and regional charging deficits within a 5 km radius to know exactly when to add more bays. Plus, maintain high station satisfaction through verified driver reviews, car model tracking, and instant operator replies.

---

### 🚗 2. EV Users & Drivers
*Effortless travel with zero range anxiety.*

* **Smart Vehicle Cockpit & Guaranteed Compatibility**  
  Pair your electric vehicle in seconds. QuantEV automatically filters stations matching your exact plug type and charging speed, monitors real-time battery status, and calculates exact charging costs before you arrive.
* **Intelligent Journey & Road Trip Planner**  
  Plan long-distance highway travel with total peace of mind. QuantEV calculates optimal charging stops along your route, factoring in your battery buffer, real-time station availability, and road elevation to get you to your destination with zero delays.
* **Advance Bay Booking & Parking Spot Hold**  
  Never arrive to find all chargers occupied. Drivers can reserve an exclusive charging bay and parking spot in advance by paying a nominal booking fee, guaranteeing an open plug waiting for them upon arrival.

---

### 📈 3. Investors & Infrastructure Developers
*Data-backed certainty for multi-million-dollar capital investments.*

* **High-Conviction AI Site Selection**  
  Eliminate the guesswork of where to deploy capital. QuantEV analyzes urban traffic velocity, power grid headroom, and competitor density to uncover high-profit charging corridors that prevent station cannibalization and guarantee high utilization.
* **Instant ROI & Payback Financial Modeling**  
  Test any budget or station count and instantly receive institutional-grade financial forecasts: project payback timelines, monthly revenue yield, operational margins, and CapEx recovery curves in seconds.
* **Corridor Deficit & Opportunity Heatmaps**  
  Discover "charging deserts" where thousands of electric vehicles travel daily with zero access to high-power chargers. Pinpoint prime real estate primed for maximum revenue before competitors identify the opportunity.

---

## 🧠 Cutting-Edge AI Engine: Simple, Innovative, Powerful

QuantEV replaces slow, outdated guesswork with two state-of-the-art AI systems working in harmony:

### 1. High-Precision Demand Forecasting (Random Forest)
* **What It Does**: Predicts future charging demand across every neighborhood before queues even form.
* **How It Works Simply**: Just as nature observes patterns across seasons, our Random Forest algorithm learns from millions of historical electric vehicle trips, commute cycles, weekend travel surges, and local traffic momentum. It anticipates exactly how many kilowatts each station will need throughout the day with unmatched accuracy.
* **The Result**: Grid overloads are eliminated, station owners stay prepared for rush-hour surges, and drivers always find available power.

### 2. Evolutionary Network Optimization (Genetic Algorithm)
* **What It Does**: Discovers mathematically optimal station locations across entire cities.
* **How It Works Simply**: Inspired by natural selection and survival of the fittest, our Genetic Algorithm tests millions of possible station location combinations simultaneously. It treats station networks like "chromosomes," automatically breeding, cross-combining, and mutating placement strategies over generations until only the highest-performing, most accessible, and most profitable network survives.
* **The Result**: What used to take infrastructure teams months of manual surveying and 72,000+ hours of compute time is solved in seconds, delivering networks that maximize driver reach while minimizing installation costs.

---

## 🛠️ Complete Feature Matrix

| Feature | EV Driver | Station Owner | Investor |
|---|:---:|:---:|:---:|
| **Mobile-First Experience** | Yes | Yes (Default) | Responsive |
| **Interactive Live Map** | Yes | Yes | Yes |
| **Charger Hardware Lineup** | Yes | Yes | Yes |
| **Advance Spot Reservation** | Yes | Yes | Yes |
| **Real-Time Revenue Telemetry** | — | Yes | Yes |
| **Instant Bank Payouts** | — | Yes | — |
| **Regional Demand Deficit Alerts** | — | Yes | Yes |
| **Driver Reviews & Ratings** | Yes | Yes | — |
| **CapEx Payback & ROI Simulation**| — | — | Yes |
| **Vehicle Fleet Garage** | Yes | — | — |
| **Smart Route & Road Trip Planner** | Yes | — | — |

---

## 💻 Modern Technology Architecture

* **Frontend**: Next.js 16 (Turbopack, React 19, TypeScript) with modern, minimal design, responsive studio viewports, and zero jargon.
* **Interactive GIS**: Leaflet.js with live geolocation, cluster mapping, and custom styled route overlays.
* **Backend**: High-performance FastAPI (Python 3.11), asynchronous API routers, and Pydantic validation.
* **AI & Optimization**: Scikit-Learn (Random Forest Regressor), Evolutionary Genetic Algorithms, and Quantum Optimization modules.
* **Data Layer**: SQLite & persistent storage for telemetry, vehicle garage, live reservations, and driver bookmarks.

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18+ & npm
* Python 3.10+ & virtualenv

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit the app in your browser at `http://localhost:3000`:
* **Driver Experience**: `http://localhost:3000/users/stations`
* **Station Owner Studio**: `http://localhost:3000/station-owners`
* **Investor Platform**: `http://localhost:3000/investor`

---

## 📄 License

Built for the future of sustainable, accessible electric mobility. Licensed under the MIT License.
