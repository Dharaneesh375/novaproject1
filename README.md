# ResilienceOS Tamil Nadu (தமிழ்நாடு பேரிடர் செயல்பாட்டு தளம்)

**ResilienceOS Tamil Nadu** is a full-stack, AI-assisted disaster intelligence and emergency operations platform designed for coordinated disaster preparedness, live incident management, shelter tracking, resource logistics, and deterministic flood risk modeling across Tamil Nadu's 38 revenue districts.

---

## 🚨 Demonstration & Data Transparency Notice
> **Important Notice:** All disaster incidents, shelter occupancy metrics, river flow values, and telemetry figures rendered in this platform are **synthetic and for demonstration/simulation purposes only**. Realistic geographical coordinates and census baseline numbers are calibrated to Tamil Nadu districts, but must not be used for actual tactical life-safety decisions without live integrations with TNDDR/TNSDMA and CWC telemetry.

---

## 🌟 Key Capabilities & Features

### 1. Role-Based Access Control (RBAC) & Multi-Persona Command
- **State Commander (`state_commander`)**: State-wide incident orchestration, executive situation reports, risk thresholds, and resource redeployment across districts.
- **District Officer (`district_officer`)**: Localized district oversight (e.g., Chennai, Nagapattinam, Cuddalore), localized triage, and shelter updates.
- **Field Responder (`field_responder`)**: Field task assignments, incident reporting with GPS, tactical contact directories, and rapid situational feedback.
- **Relief Coordinator (`relief_coordinator`)**: Food packet, drinking water, medicine kits, rescue boat allocations, and shelter logistics.
- **Data Analyst (`data_analyst`)**: Multi-district trend tracking, synthetic vs. authentic data provenance tracking, model evaluation.
- **Citizen (`citizen`)**: Emergency SOS hotlines (1070, 1077, 112, 108), nearest shelter lookup, bilingual safety advisories in English & Tamil (தமிழ்).

### 2. Deterministic AI / Mathematical Flood Risk Model
- Transparent calculation engine accounting for:
  - **Precipitation Intensity (mm/24h)** — Weight: 35%
  - **River Water Level & Reservoir Inflow (%)** — Weight: 30%
  - **Soil Moisture Saturation Index (%)** — Weight: 20%
  - **Historical Coastal Surge & Vulnerability** — Weight: 15%
- Dynamic Radar Chart component breakdown.
- Uncertainty indices and model transparency notes showing weights and inputs.

### 3. Interactive Geospatial Operations Map
- Built with **MapLibre GL** and vector/raster tile layers.
- District risk centroid markers with color-coded severity (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
- Active disaster incidents (Floods, Cyclones, Heatwaves, Landslides).
- Live shelter capacity and utilization pins.
- Interactive toggle filters for districts, incidents, and shelters.

### 4. Incident & Shelter Operations Center
- Incident lifecycle management (`ACTIVE` ➔ `MONITORING` ➔ `RESOLVED` ➔ `CLOSED`).
- Incident creation modal with district binding and severity tags.
- Shelter capacity progress bars with automated utilization warning triggers.

---

## 🛠️ Tech Stack

- **Backend**:
  - Node.js & TypeScript
  - Express.js
  - Prisma ORM with SQLite (`dev.db`)
  - JWT Authentication & Bcrypt password hashing
  - Zod runtime request schema validation
- **Frontend**:
  - React 19 & TypeScript
  - Vite 8
  - MapLibre GL for geospatial maps
  - Recharts for radar, bar, and trend analytics
  - Lucide React icons
  - Custom dark glassmorphic design system with bilingual Tamil typography
- **Verification**:
  - Full automated TypeScript build pipeline (`tsc --noEmit` + `vite build`)
  - End-to-end browser subagent automated session verification

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
Dependencies are already installed for both frontend and backend. To reinstall from scratch:
```bash
npm run install:all
```

### Database Setup & Seeding
```bash
# Run migrations (if needed)
npm run db:migrate --prefix backend

# Seed with districts, demo users, shelters, resources & incidents
npm run db:seed --prefix backend
```

### Running the Application

You can launch both services independently:

#### Start Backend (Port 3001)
```bash
npm run dev --prefix backend
```
Health Check: `http://localhost:3001/api/health`

#### Start Frontend (Port 5173)
```bash
npm run dev --prefix frontend
```
Frontend URL: `http://localhost:5173/`

---

## 👥 Demo Credentials

All demo accounts share the password: `demo1234`

| Role | Email | Password | Scope / Focus |
|---|---|---|---|
| **State Commander** | `commander@tnsdma.gov.in` | `demo1234` | Full state executive authority |
| **District Officer** | `chennai@tnsdma.gov.in` | `demo1234` | Chennai district operations |
| **District Officer** | `nagapattinam@tnsdma.gov.in` | `demo1234` | Coastal delta region operations |
| **Field Responder** | `responder1@tnsdma.gov.in` | `demo1234` | Field dispatch, tactical response |
| **Relief Coordinator**| `relief@tnsdma.gov.in` | `demo1234` | Inventory, boats, food, medical supplies |
| **Data Analyst** | `analyst@tnsdma.gov.in` | `demo1234` | Predictive models, radar analysis |
| **Citizen** | `citizen@example.com` | `demo1234` | Public portal, emergency SOS, shelters |

*(You can also click any of the 1-click quick-fill buttons on the login screen to sign in instantly.)*

---

## 📁 Repository Structure

```text
novaproject1/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (Districts, Users, Incidents, Shelters, etc.)
│   │   └── dev.db              # SQLite development database
│   ├── src/
│   │   ├── db/client.ts        # Prisma client singleton
│   │   ├── db/seed.ts          # Comprehensive Tamil Nadu seed dataset
│   │   ├── middleware/auth.ts  # JWT verification & RBAC guard middleware
│   │   ├── routes/             # API routes (auth, districts, incidents, shelters, risk, etc.)
│   │   ├── services/floodRisk.ts # Deterministic mathematical flood risk engine
│   │   └── index.ts            # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared layouts, navigation, and badges
│   │   ├── contexts/           # Authentication context with persistent session
│   │   ├── lib/api.ts          # Axios client with interceptors
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx  # Executive situation report & KPIs
│   │   │   ├── IncidentsPage.tsx  # Incident triage & status management
│   │   │   ├── SheltersPage.tsx   # Relief camp capacity & tracking
│   │   │   ├── ResourcesPage.tsx  # Emergency supplies & boat allocations
│   │   │   ├── MapPage.tsx        # Interactive MapLibre GL geospatial map
│   │   │   ├── RiskPage.tsx       # Live interactive flood risk simulator
│   │   │   ├── DistrictsPage.tsx  # 38 revenue district overview
│   │   │   ├── AnalyticsPage.tsx  # Demographic, incident trend, and data provenance charts
│   │   │   ├── FieldPage.tsx      # Field responder tactical mobile-ready page
│   │   │   ├── CitizenPage.tsx    # Citizen bilingual portal & hotline directory
│   │   │   └── LoginPage.tsx      # Multi-persona quick-login screen
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── App.tsx             # Route definitions & protected routes
│   │   └── main.tsx            # React root mount
│   ├── package.json
│   └── vite.config.ts
└── package.json                # Root orchestration scripts
```
