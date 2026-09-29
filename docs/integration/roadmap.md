# OIL / eRTMAC Production Integration Roadmap

## System: Nearby Wells Intelligence System (NWIS)
## Organization: Oil India Limited (OIL)

---

# 1. INTEGRATION OBJECTIVE & SCOPE

This document outlines the phased migration pathway to transition NWIS from its current **Integration-Ready Synthetic Demonstration Mode** into **Live Production Operation** integrated directly with Oil India Limited's eRTMAC monitoring center in Duliajan, Assam.

---

# 2. PHASING ROADMAP

```
+-----------------------------------------------------------------------------------------+
| PHASE 1: PILOT READINESS      PHASE 2: SECURE SHADOW RUN    PHASE 3: ENTERPRISE ROLLOUT |
| (Weeks 1 - 4)                 (Weeks 5 - 10)                (Weeks 11 - 16)             |
|                                                                                         |
| - VPN & Network Whitelist     - Passive Telemetry Feed      - Multi-Rig Fleet Scaling   |
| - Ingest 50+ Historical Wells - Parallel Shadow Evaluation   - Single Sign-On (OIL AD/LDAP)|
| - Validate Stratigraphy       - Model Tuning on Live Basin  - Formal Operator Training  |
+-----------------------------------------------------------------------------------------+
```

---

## Phase 1: Infrastructure & Data Ingestion (Weeks 1 – 4)

1. **Network Connectivity & Security Whitelisting:**
   - Establish site-to-site IPsec VPN between NWIS cloud environment and OIL Duliajan Datacenter.
   - Configure reverse proxy with mutual TLS (mTLS) certificates issued by OIL Internal CA.
2. **Historical Asset Ingestion:**
   - Ingest 50+ historical wells from OIL's legacy well database into PostgreSQL + PostGIS.
   - Run batch OCR and semantic chunking across OIL's digital archive of Daily Drilling Reports (DDR) and Well Completion Reports (WCR).
   - Calibrate the Barail, Tipam, Kopili, and Girujan stratigraphic tops with OIL Chief Geologist review.

---

## Phase 2: Live Shadow Run & Benchmark Validation (Weeks 5 – 10)

1. **eRTMAC Adapter Activation:**
   - Configure `ERTMACAdapter` in `apps/api/src/realtime/adapters/ertmac.adapter.ts` with live WITSML feed URL and authentication credentials:
     ```env
     ERTMAC_FEED_ENABLED=true
     ERTMAC_WITSML_ENDPOINT=https://ertmac.oil.in/witsml/v1.4/
     ERTMAC_AUTH_TOKEN=secret_production_token
     ```
2. **Shadow Risk Evaluation (Non-Interfering):**
   - Stream live 1-second telemetry from 2 active exploration/development drilling rigs.
   - Compare NWIS early warning alerts against rig floor logs without operational intervention.
   - Benchmark precision, recall, and false alarm rate on live Assam Basin lithology.
   - Fine-tune feature window thresholds with OIL drilling superintendents.

---

## Phase 3: Fleet Rollout & Full Operational Go-Live (Weeks 11 – 16)

1. **Enterprise Identity Integration:**
   - Connect NWIS RBAC to Oil India Limited Active Directory / Azure AD via SAML 2.0 / OAuth 2.0.
   - Map OIL employee designations directly to NWIS roles:
     - Drilling Engineer &bull; Geologist &bull; Superintendent &bull; Admin
2. **Command Center Large-Format Display Integration:**
   - Configure multi-rig wall displays for Duliajan Central Command Room (`/dashboard` and `/alerts`).
3. **Formal Operations Handoff & Knowledge Transfer:**
   - Deliver operations manuals and conduct drilling engineer training sessions.
   - Establish 24/7 SLA support and continuous data drift monitoring protocols.

---

# 3. COMPLIANCE & GOVERNANCE SIGN-OFF CHECKLIST

- [x] Unidirectional OT air-gap verified (zero equipment control paths).
- [x] Standard WITSML 1.4.1.1 and 2.0 parser conformity tested.
- [x] Source-backed citation engine eliminating ungrounded AI hallucinations.
- [x] ISO 19157 data quality governance and anomaly linting active.
- [x] Containerized multi-stage Docker and Docker Compose deployment ready.
