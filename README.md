# NWIS — Nearby Wells Intelligence System
### AI/ML-Enabled Drilling Intelligence, Offset Precedent Retrieval & Explainable Risk Advisory Platform
**Organization:** Oil India Limited (OIL) &bull; Problem Statement SIH26121  
**Classification:** Enterprise Decision-Support Platform (OIL/eRTMAC Integration Ready)  
**Verification Status:** 170 / 170 Passing Automated Tests Across All 4 Stages &bull; 100% Monorepo Build Success  

---

## 1. Product Context & Strategic Mission

During complex drilling operations in Assam-Arakan basin fields, unforeseen subsurface hazards—such as mechanical pipe sticking, severe lost circulation, and well kicks—lead to millions of rupees in Non-Productive Time (NPT) and potential wellbore loss.

Oil India Limited's **eRTMAC (electronic Real-Time Monitoring and Advisory Centre)** provides real-time situational awareness by telling engineers **what is happening right now**.

**NWIS** pairs directly alongside eRTMAC to deliver **institutional memory and proactive hazard foresight**:
* **eRTMAC tells the engineer what is happening.**
* **NWIS tells the engineer what is about to happen, why, and what specific mitigation succeeded in offset wells under identical conditions.**

> **Safety Notice & Compliance (IEC 62443):**  
> NWIS is strictly an **advisory decision-support platform**. It possesses zero physical control over rig equipment (cannot actuate drawworks, alter WOB, change RPM, or command mud pumps). All actions require human verification and manual execution by certified drilling superintendents.
>  
> **Data Provenance:**  
> In compliance with enterprise confidentiality, demonstration instances operate on a curated, high-fidelity **OIL-Compatible Synthetic Demonstration Dataset** (`OIL-SYN-001` to `OIL-SYN-020` in the fictional `NWIS-DEMO-FIELD`). The underlying adapters (`ERTMACAdapter`, `WITSMLLiveAdapter`, `DocumentLakeAdapter`) are built to standard WITSML 1.4.1.1 and 2.0 specifications, ready for immediate production hookup upon authorization.

---

## 2. Four-Stage Architecture Overview

```
+---------------------------------------------------------------------------------------------------+
| STAGE 01: FOUNDATION & DATA PLATFORM                                                              |
| PostgreSQL 16 + PostGIS • 20 OIL-Compatible Wells • 3D Trajectory Math • Ingestion Pipeline       |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| STAGE 02: AI DOCUMENT INTELLIGENCE & HISTORICAL PRECEDENT ENGINE                                  |
| OCR / NLP Ingestion • 64-Dim Domain Embeddings • Hybrid Search (Keyword+Vector) • Grounded RAG    |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| STAGE 03: REAL-TIME STREAMING, ANOMALY DETECTION & RISK FUSION                                    |
| Multi-Window Features (30s/300s) • Robust MAD Z-Score • 5 Hazard Engines • 28-Min Early Warning    |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| STAGE 04: FINAL INTEGRATION, PRODUCTION HARDENING & SIH PITCH COCKPIT                             |
| 1-Click SIH Pitch Storyboard • Model Registry & Drift Tracking • ISO 19157 Governance • Reports    |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Key Platform Capabilities

### 3.1 1-Click SIH Pitch Demonstration Mode (`/demo`)
* **Guided 5-Phase Storyboard:**
  1. *Baseline Drilling:* Normal ROP (18.5 m/h) in Upper Barail Sandstone at 3,200m depth.
  2. *Micro-Trend Anomaly:* Bit enters reactive coal seam; torque variance surges +2.8σ (Robust MAD), SPP slope increases.
  3. *Offset Precedent Matching:* Precedent Engine identifies **94.2% match** with well `OIL-SYN-005` (4.8 km NE, 36.5h NPT incident).
  4. *Bayesian Risk Fusion:* Dispatches CRITICAL Stuck Pipe Alert with **28.5 minutes proactive lead time**.
  5. *Human-in-the-Loop Resolution:* Engineer authorizes offset playbook from `OIL-SYN-018` DDR; incident prevented with 0 NPT.
* **Instant Demo Reset:** 1-click reset clears all simulation buffers and resets sessions to initial baseline.

### 3.2 Real-Time Cockpit & Multi-Hazard Risk Fusion (`/dashboard`, `/alerts`)
* **Live SSE Telemetry:** Sub-25ms Server-Sent Events stream delivering 1-second drilling parameters.
* **Deterministic Anomaly Engines:** Rolling Z-score, Robust MAD (Median Absolute Deviation), and linear regression trend slope.
* **5 Modular Risk Engines:**
  - `StuckPipeRiskEngine`: Overpull margin, torque oscillation, SPP slope, Barail stickiness factor.
  - `LostCirculationRiskEngine`: Flow-in vs flow-out mass balance, pit volume gradient, ECD vs fracture limit.
  - `KickRiskEngine`: Dual-confirmation pit gain, return flow surge, drilling break detection.
  - `TorqueDragRiskEngine`: Dogleg severity, soft-string friction, hookload envelope tracking.
  - `CementingRiskEngine`: Slurry density vs mud ratio, displacement velocity, casing standoff modeling.

### 3.3 Subsurface Geospatial Explorer & Precedent Catalog (`/wells`, `/search`, `/events`)
* **PostGIS Spatial Radius Queries:** Millisecond spatial filtering by distance (`ST_DWithin`) and stratigraphic horizon.
* **Hybrid Semantic Search:** Combines BM25 keyword matching with domain-calibrated 64-dimensional dense vector embeddings.
* **Grounded RAG Assistant:** 100% source-backed citations linking answers directly to document chunk IDs, page numbers, and verified excerpts.

### 3.4 Governance, Model Registry & Executive Dossiers (`/models`, `/data-quality`, `/reports`)
* **Model Registry & Drift Monitoring:** Benchmarks (Precision >90%, Recall >90%, F1 >91%, False Alarm Rate <5%) with live Kolmogorov-Smirnov drift tracking.
* **ISO 19157 Standards Compliance:** Transparent audit scoring across Completeness, Positional Accuracy, Logical Consistency, and Temporal Freshness.
* **Executive Report Generator:** 1-click printable/exportable Markdown & PDF dossiers for well proposals, incident investigations, and daily drilling ops.

---

## 4. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Monorepo & Tooling** | Turborepo, pnpm workspaces, TypeScript 5.8 |
| **Backend Core** | NestJS 10, RxJS (Server-Sent Events), Node.js 20 |
| **Database & Spatial** | PostgreSQL 16 + PostGIS, Prisma ORM 6.19 |
| **Frontend UI** | Next.js 15 (App Router), React 19, Tailwind CSS, Leaflet GIS |
| **Vector Engine** | 64-dimensional domain-tokenized dense embeddings with cosine similarity |
| **Deployment** | Multi-stage Docker (`Dockerfile.api`, `Dockerfile.web`), Docker Compose (`docker-compose.prod.yml`) |

---

## 5. Quickstart & Local Setup

### Prerequisites
* **Node.js**: v20 or higher
* **pnpm**: v9 or higher (`npm install -g pnpm`)
* **PostgreSQL with PostGIS**: Running locally on port 5432 (or via Docker)

### Installation
```bash
# Clone the repository
git clone https://github.com/almostalok/nwis.git
cd nwis

# Install all dependencies across monorepo packages
pnpm install

# Push Prisma schema and generate client
pnpm db:push
pnpm db:generate

# Seed the database with 20 OIL synthetic wells & precedent events
pnpm db:seed
pnpm db:seed:stage02
```

### Running the Development Environment
```bash
# Run the entire stack (API on port 4000 + Web on port 3000)
pnpm dev

# Alternatively, run services individually:
pnpm --filter @nwis/api start:dev    # API runs at http://localhost:4000
pnpm --filter @nwis/web dev          # Web app runs at http://localhost:3000
```

### Accessing the Web Command Center
Open your browser to **`http://localhost:3000`**:
* **1-Click Pitch Storyboard:** `http://localhost:3000/demo`
* **Real-Time Command Cockpit:** `http://localhost:3000/dashboard`
* **Live Alerts & Precedents:** `http://localhost:3000/alerts`
* **Rig Simulator Room:** `http://localhost:3000/simulation`
* **Model Registry & Governance:** `http://localhost:3000/models`
* **Data Quality & ISO 19157:** `http://localhost:3000/data-quality`
* **Executive Reports Generator:** `http://localhost:3000/reports`
* **OIL eRTMAC Integration Specs:** `http://localhost:3000/integrations`
* **OpenAPI (Swagger) Documentation:** `http://localhost:4000/api/docs`

---

## 6. Verification & Automated Test Suites

NWIS includes 4 comprehensive automated test suites validating all platform layers:

```bash
# Run Stage 01 Suite: Database, PostGIS, Trajectory Math, Ingestion (35 Tests)
pnpm test

# Run Stage 02 Suite: Vector Embeddings, Hybrid Search, RAG, Precedent Engine (37 Tests)
pnpm test:stage02

# Run Stage 03 Suite: Rolling Features, Anomaly Detectors, 5 Risk Engines, Simulator (44 Tests)
pnpm test:stage03

# Run Stage 04 Suite: Health Probes, Model Registry, Reports, Simulator Reset, Governance (54 Tests)
pnpm test:stage04

# Full Monorepo Build Check (All 7 packages & apps)
pnpm build
```

**Total Automated Test Coverage:** **170 Passing Tests &bull; 0 Failures**

---

## 7. Production Docker Deployment

Deploy the entire production stack (PostgreSQL + PostGIS, Redis, NestJS API, Next.js Web) with Docker Compose:

```bash
# Build and run all production containers
docker compose -f docker-compose.prod.yml up -d --build

# Verify container health
docker compose -f docker-compose.prod.yml ps

# Check API health probe
curl http://localhost:4000/health
```

---

## 8. Role-Based Access Control (Demo Personas)

| Role | Email | Password | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Drilling Engineer** | `engineer@nwis.oil.in` | `password123` | Real-time monitoring, alert acknowledgment, mitigation execution |
| **Operations Geologist** | `geologist@nwis.oil.in` | `password123` | Formation top correlation, lithology verification |
| **Drilling Superintendent**| `superintendent@nwis.oil.in` | `password123` | Critical alert escalation, procedure sign-off |
| **Data Engineer** | `data@nwis.oil.in` | `password123` | WITSML pipeline ingestion, ISO 19157 data quality auditing |
| **Administrator** | `admin@nwis.oil.in` | `password123` | User provisioning, model registry configuration |

---

## 9. Documentation Index

* **[SIH Pitch Demonstration Script](file:///c:/Users/DELL/OneDrive/Desktop/codepg\products\nawis\docs\demo-script.md)**: Detailed judges pitch workflow, timing, and Q&A talking points.
* **[Production Readiness & Hardening](file:///c:/Users/DELL/OneDrive/Desktop/codepg\products\nawis\docs\production-readiness.md)**: Cybersecurity air-gap architecture, RBAC, backups, and SLAs.
* **[OIL eRTMAC Integration Roadmap](file:///c:/Users/DELL/OneDrive/Desktop/codepg\products\nawis\docs\integration\roadmap.md)**: Technical transition plan from synthetic demo to live Duliajan eRTMAC feeds.

---

## 10. License & Organization Attribution

Developed for the **Smart India Hackathon (SIH 2024 / SIH26121)** in partnership with **Oil India Limited (OIL)**.  
All rights reserved &bull; Restricted Enterprise Demonstration.
