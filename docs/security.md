# NWIS Security & Role-Based Access Control (RBAC)

## 1. Authentication Foundation
Stage 01 provides a lightweight yet secure JWT-based authentication foundation, decoupled from external SSO providers to allow zero-configuration local development while remaining ready for OIL's enterprise Active Directory / Keycloak integration.

---

## 2. RBAC Persona Matrix

| Role | Description | Permissions |
|---|---|---|
| **ADMIN** | System Administrator | Full access: User management, data purge, system audit logs, schema updates |
| **DRILLING_ENGINEER** | Senior Drilling Engineer | Create/modify wells, log operational events, review technical reports |
| **GEOLOGIST** | Chief Geologist | Stratigraphic formation management, lithology annotation, depth correlation |
| **MANAGER** | Asset Operations Manager | View dashboard KPIs, precedent summaries, export reports, review audit trail |
| **DATA_ENGINEER** | Data Platform Engineer | Run ingestion pipelines, configure adapters, trigger quality audits |
| **VIEWER** | Operations Viewer | Read-only access to maps, wells, and historical precedents |

---

## 3. Audit Trail Architecture
All state-altering actions (Logins, Ingestion Imports, Well Mutations, Event Creations) trigger an append-only entry in the `audit_logs` table recording:
* `userId`: Actor identifier
* `action`: Action enum (`LOGIN`, `DATA_IMPORT`, `DATA_UPDATE`, `DOCUMENT_UPLOAD`, etc.)
* `entityType`: Target entity class (`WELL`, `EVENT`, `DATA_SOURCE`)
* `entityId`: Primary key of affected entity
* `metadata`: Structured JSON payload of mutation details
* `timestamp`: High-precision UTC timestamp
