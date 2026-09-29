# NWIS — Nearby Wells Intelligence System

> **Stage 02: AI Document Intelligence, Semantic Search, Cross-Well Intelligence & Precedent Engine**  
> Built for **Oil India Limited (OIL)** drilling operations intelligence.

---

## 1. Product Context

NWIS works alongside OIL's existing **eRTMAC (electronic Real-Time Monitoring and Advisory Centre)** ecosystem.

* **eRTMAC** informs drilling engineers of real-time conditions (*what is happening now*).
* **NWIS** adds **institutional memory**, **nearby-well intelligence**, **geological depth correlation**, **precedent detection**, and **explainable historical risk analysis** (*what happened before in comparable wells and why is it relevant*).

> **Important Notice on Data Provenance**:  
> In compliance with enterprise confidentiality and project specifications, NWIS operates on a curated, clearly designated **OIL-Compatible Synthetic Demonstration Dataset** (`OIL-SYN-001` to `OIL-SYN-020` in the fictional `NWIS-DEMO-FIELD`). The data architecture uses decoupled interfaces (`WITSMLAdapter`, `DataAdapter`, `OCRProvider`) so that synthetic sources can be replaced with production OIL/eRTMAC/WITSML feeds without rewriting domain logic.

---

## 2. Monorepo Architecture

NWIS is organized as a high-performance TypeScript monorepo managed with **pnpm workspaces** and **Turborepo**:

```text
nwis/
├── apps/
│   ├── api/                      # NestJS REST API with Swagger, JWT, Knowledge & Intelligence Engines
│   │   ├── src/
│   │   │   ├── intelligence/     # Precedent Engine, Well Similarity, Hybrid Search, RAG Service
│   │   │   ├── knowledge/        # OCR Provider, PDF/Text Extractor, Semantic Chunker, Event Deduplication
│   │   │   ├── wells/            # PostGIS Nearby Search & Dossier Management
│   │   │   └── ...
│   │
│   └── web/                      # Next.js 15 App Router Frontend + Leaflet GIS Map + Tailwind CSS
│       ├── src/
│       │   ├── app/
│       │   │   ├── dashboard/                 # Field overview & operational KPI cards
│       │   │   ├── wells/                     # Well listings & PostGIS radius search
│       │   │   ├── wells/[id]/intelligence/   # Comprehensive Well Intelligence & Precedent Dossier
│       │   │   ├── compare/                   # Side-by-side cross-well multi-factor comparison
│       │   │   ├── search/                    # Hybrid search (Vector + Keyword + Metadata)
│       │   │   ├── knowledge/                 # Document intelligence, chunks & entity extraction
│       │   │   ├── events/[id]/               # Operational event detail with archival evidence
│       │   │   └── data/                      # Ingestion pipeline & data quality report
│
├── packages/
│   ├── config/                   # Centralized TypeScript & tooling configurations
│   ├── database/                 # Prisma schema, PostGIS SpatialRepository, Stage 01 & 02 Seed Engines
│   ├── types/                    # Core domain models, enums, DTOs, and Stage 02 Intelligence interfaces
│   ├── validation/               # Strict Zod schemas for all domain entities & DTOs
│   ├── api-client/               # Type-safe isomorphic HTTP API client with Knowledge & Intelligence methods
│   └── utils/                    # UnitNormalizer, EventNormalizer, VectorUtils, DomainNLPUtils, SpatialUtils
│
├── data/
│   ├── synthetic/                # Canonical synthetic wells (CSV, JSON)
│   ├── schemas/                  # Data format validation schemas
│   └── samples/                  # Fictional DDR & WCR sample reports (Wells 003, 005, 007, 012)
│
├── docker/
│   ├── docker-compose.yml        # PostgreSQL 17 + PostGIS + NWIS API + NWIS Web
│   ├── Dockerfile.api
│   └── Dockerfile.web
│
├── docs/                         # Comprehensive Engineering Documentation
│   ├── architecture.md           # System design & boundaries
│   ├── data-model.md             # Domain entities & ERD
│   ├── api.md                    # OpenAPI / REST endpoint specifications
│   ├── document-intelligence.md  # OCR, chunking, NLP extraction, and evidence linkage
│   ├── precedent-engine.md       # Precedent detection algorithm & SYN-020 scenario
│   ├── search-rag.md             # Hybrid search & Grounded RAG with anti-hallucination
│   ├── well-similarity.md        # 6-factor similarity scoring & explanations
│   ├── ingestion.md              # Pipeline stages & extension guides
│   ├── synthetic-dataset.md      # Coordinate clustering, geology & precedent patterns
│   ├── data-quality.md           # Validation statuses, provenance & scoring rules
│   ├── security.md               # RBAC permissions matrix & audit logging
│   └── future-witsml-integration.md # OIL eRTMAC integration blueprint
│
├── tests/
│   ├── e2e-test-suite.ts         # Stage 01 automated verification test suite (35 tests)
│   └── stage02-verification-suite.ts # Stage 02 AI & Precedent test suite (37 tests)
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## 3. Tech Stack

- **Runtime & Language**: Node.js 20+, TypeScript 5.8+
- **Monorepo Manager**: pnpm 10+, Turborepo 2.4+
- **Backend Framework**: NestJS 11, Passport JWT, Swagger OpenAPI (`/api/docs`)
- **Database & Spatial**: PostgreSQL 17 + PostGIS (with automatic fallback to PostgreSQL `cube` + `earthdistance`)
- **Vector & Semantic Search**: 64-dimensional local deterministic embedding projection + cosine vector similarity (pgvector ready)
- **Document Processing**: OCRProvider abstraction, boundary-preserving chunker, domain entity extractor
- **ORM**: Prisma ORM 6.4
- **Validation**: Zod + class-validator
- **Frontend Framework**: Next.js 15 (React 19), Tailwind CSS, Lucide React, Leaflet Maps
- **Containerization**: Docker Compose

---

## 4. Key Capabilities Delivered in Stage 02

1. **Document Intelligence Pipeline**:
   - Boundary-preserving text and OCR extraction (`DocumentExtractorService`, `OCRProvider`).
   - Semantic, section-aware document chunking (`DocumentChunk` with offsets, tokens, and 64-dim embeddings).
   - Domain entity extraction for Wells, Depths, Formations, Drilling Parameters, Operational Events, Actions, and Lessons Learned (`DomainNLPUtils`).
   - Incident deduplication and multi-source evidence linkage (`HistoricalEventEvidence` connecting DDRs, WCRs to canonical events).

2. **Signature Precedent Engine**:
   - Answers: *"Has a comparable operational situation happened before in offset wells?"*
   - Correlates geological intervals (e.g. `Barail Sandstone` / `Formation Gamma` around 3200m MD).
   - Matches precursor parameter signatures (Torque spike >25 kN.m, ROP decay <6 m/h, drag increase).
   - Tested & verified with candidate `OIL-SYN-020` identifying precedents `OIL-SYN-003` (78%), `OIL-SYN-007` (74%), and `OIL-SYN-012` (81%) with exact document citations.

3. **Multi-Factor Cross-Well Similarity Engine**:
   - 6-factor transparent scoring: Spatial (20%), Formation Overlap (30%), Depth Overlap (20%), Trajectory Profile (10%), Operational Incidents (10%), and Reservoir Zones (10%).
   - Generates human-readable explanations (e.g. `✓ Immediate offset well: located 1.8 km away`, `✓ Shares 6 geological formations`).
   - Side-by-side comparison page (`/compare`) with formation Jaccard index and event breakdowns.

4. **Hybrid Search Engine**:
   - Combines vector similarity on document chunks (50%), exact keyword stem matching (30%), and structured metadata filters (20%).
   - Accessible via API (`POST /api/v1/intelligence/search`) and interactive UI (`/search`).

5. **Grounded RAG Drilling Assistant**:
   - Context-aware drilling advisor embedded in the well intelligence page.
   - Enforces strict **anti-hallucination guardrails**:
     - Non-existent well identifiers (e.g. `OIL-SYN-999`) are rejected: *"No matching evidence was found in the indexed NWIS dataset."*
     - Depths exceeding well total depth (e.g. 9000m on a 4150m well) are rejected based on physical boundaries.
     - Unsupported questions return explicit no-evidence responses.
   - Generates structured answers with verified document citation cards (Document title, page number, text excerpt).

---

## 5. Quickstart

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL 17 running locally or via Docker

### 1. Installation
```bash
git clone https://github.com/almostalok/nwis.git
cd nwis
pnpm install
```

### 2. Database Migration & Seeding
```bash
# Push Prisma schema to PostgreSQL
pnpm db:push

# Seed Stage 01 base records (20 wells, formations, trajectories, users)
pnpm db:seed

# Seed Stage 02 document knowledge pipeline (chunks, entities, evidence linkage)
pnpm db:seed:stage02
```

### 3. Run Automated Verification Test Suites
```bash
# Run Stage 01 foundation tests (35 tests)
pnpm test

# Run Stage 02 AI intelligence, precedent, search & anti-hallucination tests (37 tests)
pnpm test:stage02
```
*Total verification test count: 72 tests (72 Passed, 0 Failed).*

### 4. Start Development Servers
```bash
# Start API (port 4000) and Next.js Web (port 3000) in parallel
pnpm dev
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
  - `/dashboard`: Field overview
  - `/wells`: Well catalog & PostGIS map
  - `/wells/OIL-SYN-020/intelligence`: **Stage 02 Well Intelligence & Precedent Dossier**
  - `/compare?wellA=OIL-SYN-020&wellB=OIL-SYN-003`: **Cross-Well Comparison**
  - `/search`: **Hybrid Semantic Search**
  - `/knowledge`: **Document Intelligence & Chunks**
  - `/events`: Operational events timeline
- **API Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 6. Seed Accounts for Testing

| Role | Email | Password | Primary Scope |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@nwis.oil.in` | `password123` | Full admin & configuration access |
| **Drilling Engineer** | `engineer@nwis.oil.in` | `password123` | Precedents, trajectories, and parameters |
| **Chief Geologist** | `geologist@nwis.oil.in` | `password123` | Formation intervals & reservoir zones |
| **Asset Manager** | `manager@nwis.oil.in` | `password123` | Field-level KPIs and summaries |
| **Data Platform Engineer** | `data@nwis.oil.in` | `password123` | Ingestion pipeline & data quality |
| **Operations Viewer** | `viewer@nwis.oil.in` | `password123` | Read-only inspection |

---

## 7. Looking Ahead to Stage 03

Stage 02 provides the **Institutional Memory and Precedent Baseline**. Stage 03 will build directly on top of this by connecting:
- Streaming real-time sensor feeds (WITS0 / WITSML simulation)
- Real-time deviation detection from the historical precedent baseline
- Multi-parameter anomaly detection (torque fluctuation, drag escalation, flow imbalance)
- Explainable risk alerts citing offset well precedents
- Proactive advisory recommendations backed by verified historical mitigations
