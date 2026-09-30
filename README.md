# NWIS — Nearby Wells Intelligence System
### AI/ML-Enabled Drilling Intelligence, Offset Precedent Retrieval & Explainable Risk Advisory Platform
**Organization:** Oil India Limited (OIL) &bull; Problem Statement SIH26121  
**Classification:** Enterprise Decision-Support Platform (OIL/eRTMAC Integration Ready)  
**Verification Status:** 218 / 218 Passing Automated Tests Across All Verification Suites &bull; 100% Monorepo Build, Type-Check & Lint Success  

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
> **Data Provenance & Truthfulness:**  
> In compliance with enterprise confidentiality and security boundaries, demonstration instances operate on a curated, high-fidelity **OIL-Compatible Synthetic Demonstration Dataset** (`OIL-SYN-001` to `OIL-SYN-020` in the fictional `NWIS-DEMO-FIELD`). NWIS does not currently claim a live physical network connection to OIL's production SCADA/eRTMAC network; rather, the underlying adapters (`ERTMACAdapter`, `WITSMLLiveAdapter`, `DocumentLakeAdapter`) are built to standard WITSML 1.4.1.1 and 2.0 specifications, ready for immediate production hookup upon authorization.

---

## 2. Four-Stage Architecture Overview

```
+---------------------------------------------------------------------------------------------------+
| STAGE 01: FOUNDATION & DATA PLATFORM                                                              |
| PostgreSQL 16 + PostGIS • 20 OIL-Compatible Wells • 3D Trajectory Math • Parameterized Spatial SQL|
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| STAGE 02: AI DOCUMENT INTELLIGENCE & HISTORICAL PRECEDENT ENGINE                                  |
| Binary PDF Parser • OCR Quality Scoring • 64-Dim Dense Embeddings • Hybrid Search • Grounded RAG  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| STAGE 03: REAL-TIME STREAMING, ANOMALY DETECTION & RISK FUSION                                    |
| Real-Time SSE Transport • Multi-Window Features (30s/300s) • Robust MAD Z-Score • 5 Risk Engines  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| STAGE 04: FULL REMEDIATION, PRODUCTION HARDENING & COMMAND COCKPIT                                |
| Bcrypt Hashing • Strict CORS • BullMQ/Redis Queue • /admin & /assistant • Toast Alerts • ISO 19157|
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Implemented Subsystems & Providers

| Component | Architecture / Provider | Status |
| :--- | :--- | :--- |
| **Realtime Transport** | Server-Sent Events (SSE) via `EventSource` on `/api/v1/realtime/stream` | Active (Polling Eliminated) |
| **Password Hashing** | Bcrypt (10 rounds with automatic upgrade for legacy hashes) | Active & Enforced |
| **CORS Policy** | Whitelist-restricted (`FRONTEND_URL`, `http://localhost:3000`) | Enforced |
| **SQL Protection** | Parameterized Prisma queries with `Prisma.sql` (No string concatenation) | Enforced |
| **Path Traversal Protection** | Safe directory normalization and containment verification | Enforced |
| **Document Pipeline** | Binary PDF Parser (`pdf-parse`) + `OCRProvider` abstraction + BullMQ/Redis | Active with Async Fallback |
| **OCR Confidence** | Printable ratio & drilling domain lexicon scoring (`VERIFICATION_REQUIRED` < 70%) | Active |
| **Embedding Engine** | `EmbeddingProvider` (64-dim domain semantic hashing with external API hook) | Active |
| **Vector Retrieval** | Hybrid search (BM25 keyword + cosine similarity + pre-fetched well metadata) | Active (N+1 Query Eliminated) |
| **RAG Assistant** | `LLMProvider` with strict context builder and anti-hallucination checks | Active (`/assistant`) |
| **Administration** | Top-level `/admin` center (Users & Roles, Audit logs, Ingestion, Models, Simulator) | Active & Protected |
| **User Feedback** | Non-blocking inline Toast notification system (Replaces native browser `alert()`) | Active |

---

## 4. Key Platform Routes

* **Real-Time Command Cockpit:** `http://localhost:3000/dashboard` (SSE stream with live connection status)
* **Grounded AI Assistant:** `http://localhost:3000/assistant` (Universal RAG decision support)
* **Administration Center:** `http://localhost:3000/admin` (Role-gated governance, users, audit, and queues)
* **1-Click Pitch Storyboard:** `http://localhost:3000/demo` (Interactive scenario demonstration)
* **Subsurface Wells Explorer:** `http://localhost:3000/wells` (Positional and directional well view)
* **Cross-Well Comparison:** `http://localhost:3000/compare` (Geological similarity scoring)
* **Semantic & Hybrid Search:** `http://localhost:3000/search` (Dense vector & keyword incident search)
* **Operational Risk Alerts:** `http://localhost:3000/alerts` (Alert catalog and detailed dossiers)
* **Rig Simulator Controls:** `http://localhost:3000/simulation` (Synthetic scenario injection)
* **Model Registry & Drift:** `http://localhost:3000/models` (Safety governance and metric tracking)
* **Data Quality Audit:** `http://localhost:3000/data-quality` (ISO 19157 compliance scoring)
* **Executive Reports:** `http://localhost:3000/reports` (Markdown and printable operations summaries)
* **API Documentation (Swagger):** `http://localhost:4000/api/docs`

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

---

## 6. Verification & Automated Test Suites

NWIS includes comprehensive automated test suites validating all platform layers and security controls:

```bash
# Stage 01 Suite: Database, PostGIS, Trajectory Math, Ingestion (35 Tests)
pnpm test

# Stage 02 Suite: Vector Embeddings, Hybrid Search, RAG, Precedent Engine (37 Tests)
pnpm test:stage02

# Stage 03 Suite: Rolling Features, Anomaly Detectors, 5 Risk Engines, Simulator (44 Tests)
pnpm test:stage03

# Stage 04 Suite: Health Probes, Model Registry, Reports, Simulator Reset, Governance (54 Tests)
pnpm test:stage04

# Security Suite: Bcrypt Hashing, Legacy Migration, Path Traversal, SQL Injection (13 Tests)
pnpm test:security

# End-to-End Suite: Monorepo Package Resolution & Integration (35 Tests)
pnpm test:e2e

# Code Quality & Compilation Verification
pnpm type-check   # TypeScript checking across all 8 packages/apps (0 errors)
pnpm lint         # Non-interactive ESLint across web and api (0 errors)
pnpm build        # Optimized production build of all packages and web app
```

**Total Automated Test Coverage:** **218 Passing Tests &bull; 0 Failures**

---

## 7. Production Docker Deployment

Deploy the entire production stack (PostgreSQL + PostGIS, Redis, NestJS API, Background Worker, Next.js Web) with Docker Compose:

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

## 9. License & Organization Attribution

Developed for the **Smart India Hackathon (SIH 2024 / SIH26121)** in partnership with **Oil India Limited (OIL)**.  
All rights reserved &bull; Restricted Enterprise Demonstration.
