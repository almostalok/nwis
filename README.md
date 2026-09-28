# NWIS — Nearby Wells Intelligence System

> **Stage 01: Foundation, Data Platform & OIL-Compatible Data Layer**  
> Built for **Oil India Limited (OIL)** drilling operations intelligence.

---

## 1. Product Context

NWIS works alongside OIL's existing **eRTMAC (electronic Real-Time Monitoring and Advisory Centre)** ecosystem.

* **eRTMAC** informs drilling engineers of real-time conditions (*what is happening now*).
* **NWIS** adds **institutional memory**, **nearby-well intelligence**, **geological depth correlation**, **precedent detection**, and **explainable historical risk analysis** (*what happened before in comparable wells*).

> **Important Notice on Data Provenance**:  
> In compliance with enterprise confidentiality and Stage 01 specifications, NWIS operates on a curated, clearly designated **OIL-Compatible Synthetic Demonstration Dataset** (`OIL-SYN-001` to `OIL-SYN-020` in the fictional `NWIS-DEMO-FIELD`). The data architecture uses decoupled interfaces (`WITSMLAdapter`, `DataAdapter`) so that synthetic sources can be replaced with production OIL/eRTMAC/WITSML feeds without rewriting domain logic.

---

## 2. Monorepo Architecture

NWIS is organized as a high-performance TypeScript monorepo managed with **pnpm workspaces** and **Turborepo**:

```text
nwis/
├── apps/
│   ├── api/                      # NestJS REST API with Swagger, JWT, RBAC & Spatial Engine
│   └── web/                      # Next.js 15 App Router Frontend + Leaflet GIS Map + Tailwind CSS
│
├── packages/
│   ├── config/                   # Centralized TypeScript & tooling configurations
│   ├── database/                 # Prisma ORM schema, dual PostGIS/earthdistance SpatialRepository, seed engine
│   ├── types/                    # Core domain entities, enums, DTOs, and adapter interfaces
│   ├── validation/               # Strict Zod schemas for all domain entities & DTOs
│   ├── api-client/               # Type-safe isomorphic HTTP API client
│   └── utils/                    # UnitNormalizer, EventNormalizer, SpatialUtils, CryptoUtils
│
├── data/
│   ├── synthetic/                # Canonical synthetic dataset (wells, formations, trajectories, events, logs)
│   ├── schemas/                  # JSON/CSV structural schemas
│   └── samples/                  # Fictional DDR & WCR sample operational reports
│
├── docker/
│   ├── docker-compose.yml        # PostgreSQL 17 + PostGIS + NWIS API + NWIS Web
│   ├── Dockerfile.api
│   └── Dockerfile.web
│
├── docs/                         # Architecture, Data Model, API, Ingestion, Quality, Security, and WITSML guides
├── tests/
│   └── e2e-test-suite.ts         # 35-point automated verification test suite
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## 3. Tech Stack

- **Runtime & Language**: Node.js 20+, TypeScript 5.5+
- **Monorepo Manager**: pnpm 10+, Turborepo
- **Backend Framework**: NestJS 10, Passport JWT, Swagger OpenAPI (`/api/docs`)
- **Database & Spatial**: PostgreSQL 17 + PostGIS (with automatic fallback to PostgreSQL `cube` + `earthdistance` extension)
- **ORM**: Prisma ORM 5.22
- **Validation**: Zod + class-validator
- **Frontend Framework**: Next.js 15 (React 19), Tailwind CSS, Lucide React, Leaflet Maps
- **Containerization**: Docker Compose

---

## 4. Key Capabilities Delivered in Stage 01

1. **Spatial & Nearby Well Intelligence**: PostGIS geodesic distance queries (`/api/v1/wells/nearby?latitude=...&longitude=...&radiusKm=10`) with radial search, formation summary aggregation, and distance sorting.
2. **Geological Correlation & Precedent Retrieval**: Dual depth-and-formation querying (`/api/v1/events/near-depth?targetDepth=3200&toleranceMeters=50`) that surfaces historical stuck-pipe and lost-circulation precedents across wells (e.g. Wells 003, 007, 012 in Formation Gamma).
3. **Pluggable Ingestion Pipeline**: Ingestion abstraction conforming to `DataSource → Adapter → Parser → Validator → Normalizer → Mapper → Database`.
4. **Canonical Normalizers**:
   - `UnitNormalizer`: Converts oilfield measurements (ft → m, psi → kPa, lbf-ft → N·m, °F → °C, ppg → kg/m³).
   - `EventNormalizer`: Normalizes synonyms ("pipe stuck", "stuck string") into canonical operational taxonomy.
5. **Data Quality & Provenance**: Audit-logging, quality scores (`VALID`, `WARNING`, `INVALID`, `UNVERIFIED`, `VERIFIED`), and document extraction lineage (`sourceDocumentId`, `sourcePage`, `extractionConfidence`).
6. **Role-Based Access Control (RBAC)**: 6 personas (`ADMIN`, `DRILLING_ENGINEER`, `GEOLOGIST`, `MANAGER`, `DATA_ENGINEER`, `VIEWER`).
7. **Interactive Web Dashboard**: Well listing, detailed well dossier with formation intervals and drilling logs, operational event timeline, and live GIS map with radius circle filtering.

---

## 5. Quickstart

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL 17 (with PostGIS or `cube`/`earthdistance` extensions)

### 1. Installation
```bash
git clone https://github.com/almostalok/nwis.git
cd nwis
pnpm install
```

### 2. Environment Configuration
Copy the template and verify your database connection:
```bash
cp .env.example .env
```
Default connection string:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nwis_dev?schema=public"
JWT_SECRET="nwis_oil_stage01_jwt_development_secret_key_32bytes_min"
PORT=4000
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 3. Database Migration & Deterministic Seeding
```bash
# Push Prisma schema to PostgreSQL
pnpm db:migrate

# Seed 20 synthetic wells, formations, trajectories, precedents, and RBAC users
pnpm db:seed
```

### 4. Build Monorepo
```bash
pnpm build
```

### 5. Run Automated Verification Test Suite
```bash
pnpm test
```
*Executes all 35 verification checks covering database integrity, spatial searches, precedent correlation, unit conversions, terminology normalization, Zod validation, and ingestion pipelines.*

### 6. Start Development Servers
```bash
# Start both API (port 4000) and Next.js Web (port 3000) in parallel
pnpm dev
```
- **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 6. Seed Accounts for Testing

| Role | Email | Password | Primary Scope |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@nwis.oil.in` | `password123` | Full admin & configuration access |
| **Drilling Engineer** | `engineer@nwis.oil.in` | `password123` | Operational events, trajectories, and parameters |
| **Chief Geologist** | `geologist@nwis.oil.in` | `password123` | Formation intervals, lithology, and reservoir zones |
| **Asset Manager** | `manager@nwis.oil.in` | `password123` | Field-level KPIs and summaries |
| **Data Platform Engineer** | `data@nwis.oil.in` | `password123` | Data ingestion pipeline, imports, data quality |
| **Operations Viewer** | `viewer@nwis.oil.in` | `password123` | Read-only inspection |

---

## 7. Documentation Index

Comprehensive engineering guides are located in the [`docs/`](./docs) directory:
- [Architecture & Design Principles](./docs/architecture.md)
- [Domain Data Model & ERD](./docs/data-model.md)
- [REST API Specification](./docs/api.md)
- [Data Ingestion Architecture](./docs/ingestion.md)
- [Synthetic Dataset Specification](./docs/synthetic-dataset.md)
- [Data Quality & Provenance Framework](./docs/data-quality.md)
- [Security & RBAC Architecture](./docs/security.md)
- [Future WITSML / eRTMAC Integration Strategy](./docs/future-witsml-integration.md)

---

## 8. Looking Ahead to Stage 02

Stage 01 provides the verified, clean data layer. Stage 02 will layer on:
- Unstructured document ingestion & OCR (parsing DDRs, WCRs, Mud logs)
- Vector embeddings and semantic event search
- Entity extraction linking operational incidents directly to document pages (`sourcePage`, `extractionConfidence`)
- LLM-assisted historical precedent retrieval
