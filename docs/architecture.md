# NWIS — Nearby Wells Intelligence System: System Architecture

## 1. Architectural Philosophy & Context
NWIS is an AI/ML-ready drilling intelligence platform designed to complement Oil India Limited's (OIL) existing real-time monitoring center (**eRTMAC**).

* **eRTMAC Focus**: Tells drilling superintendents and engineers *what is happening right now* (real-time telemetry, MWD/LWD, SPP, surface mud sensors).
* **NWIS Focus**: Tells engineers *what happened before in comparable offset wells* and provides institutional memory, geological cross-well correlation, historical precedent detection, and risk intelligence.

### Stage 01 Scope: Production-Grade Data Foundation
Stage 01 establishes the data platform on which the Stage 02 NLP/Document Extraction, Stage 03 Real-Time Risk Engine, and Stage 04 Production Cockpit will operate.

---

## 2. Monorepo Structure & Module Boundaries
NWIS is organized as a high-performance TypeScript monorepo managed with **pnpm workspaces** and **Turborepo**:

```text
nwis/
│
├── apps/
│   ├── api/             # NestJS REST API with OpenAPI/Swagger & RBAC
│   └── web/             # Next.js 15 (App Router), TypeScript, Tailwind CSS
│
├── packages/
│   ├── config/          # Shared tsconfig base, node, and react configurations
│   ├── database/        # Prisma ORM schema, migrations, seeders, and PostGIS queries
│   ├── types/           # Canonical domain models, taxonomy enums, and API DTOs
│   ├── validation/      # Zod runtime validation schemas for all inputs
│   ├── api-client/      # Isomorphic typed API client wrapper (no raw fetch in UI)
│   └── utils/           # Canonical unit normalizer, event synonym engine, spatial math
│
├── data/
│   ├── synthetic/       # 20+ synthetic well master records (JSON & CSV)
│   ├── schemas/         # JSON/CSV schemas for OIL-compatible data
│   └── samples/         # Fictional synthetic drilling documents (DDR, WCR, Mud logs)
│
├── docker/              # Docker Compose (PostgreSQL + PostGIS, Redis, App containers)
├── docs/                # Architectural, Data Model, API, and Integration documentation
└── tests/               # Automated end-to-end verification test suite
```

---

## 3. Core Architectural Principles
1. **Decoupled Ingestion Pipeline**: Ingestion follows `DataSource -> Adapter -> Parser -> Validator -> Normalizer -> Mapper -> Database`. The application has zero hardcoded dependencies on synthetic data; synthetic adapters can be swapped with live eRTMAC WITSML adapters without touching core business logic.
2. **Canonical Internal Units**: All depth measurements are stored in **meters (m)**, pressures in **bar**, torques in **kN.m**, temperatures in **°C**, and mud densities in **Specific Gravity (sg)**.
3. **Dual Spatial Engine (PostGIS & Earthdistance)**: Spatial proximity queries utilize PostGIS `ST_DWithin` and `ST_Distance` on geography points, with automatic fallback to PostgreSQL's `earthdistance` GiST spherical indexing for native sub-millisecond execution.
4. **Data Provenance & Traceability**: Every historical operational event links back to its source document ID, page number, extraction method, and verification timestamp to ensure full explainability for future AI risk models.
5. **No Raw API Calls in UI**: The Next.js frontend interacts exclusively through the `@nwis/api-client` package, guaranteeing strict type safety.
