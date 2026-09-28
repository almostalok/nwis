# NWIS REST API Reference

The NWIS backend exposes clean, validated RESTful endpoints under `/api/v1`. An interactive OpenAPI/Swagger explorer is accessible at `/api/docs`.

---

## 1. Authentication & RBAC (`/api/v1/auth`)

### `POST /api/v1/auth/login`
Authenticates a user and returns a signed JWT token along with user metadata and role.
* **Payload**:
  ```json
  { "email": "engineer@nwis.oil.in", "password": "password123" }
  ```
* **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "...",
      "email": "engineer@nwis.oil.in",
      "name": "S. K. Saikia (Senior Drilling Engineer)",
      "role": "DRILLING_ENGINEER",
      "department": "Drilling Services"
    }
  }
  ```

### `GET /api/v1/auth/me`
Returns current authenticated user identity. Requires `Authorization: Bearer <token>`.

---

## 2. Wells & Geospatial Search (`/api/v1/wells`)

### `GET /api/v1/wells/nearby`
Performs geospatial radius search around specified coordinates using PostGIS / PostgreSQL `earthdistance`.
* **Query Parameters**:
  * `latitude` (Float, required): e.g. `27.325`
  * `longitude` (Float, required): e.g. `95.312`
  * `radiusKm` (Float, required): e.g. `10`
  * `formation` (String, optional): filter by formation presence, e.g. `Barail`
  * `status` (Enum, optional): `DRILLING`, `COMPLETED`, `PLANNED`
  * `wellType` (Enum, optional): `DEVELOPMENT`, `EXPLORATION`
* **Response**:
  ```json
  [
    {
      "id": "...",
      "wellId": "OIL-SYN-001",
      "name": "NWIS Discovery Well 01",
      "field": "NWIS-DEMO-FIELD",
      "distanceKm": 0.0,
      "latitude": 27.325,
      "longitude": 95.312,
      "totalDepth": 4150.0,
      "status": "COMPLETED",
      "wellType": "EXPLORATION",
      "formationSummary": ["Alluvium", "Girujan Clay", "Tipam Sandstone", "Barail Sandstone"],
      "eventCount": 1
    }
  ]
  ```

### `GET /api/v1/wells`
Lists wells with optional filtering by field, status, wellType, or search keyword.
* **Query Parameters**: `field`, `status`, `wellType`, `search`, `limit`, `offset`.

### `GET /api/v1/wells/:id`
Returns comprehensive well metadata, formations, trajectory sample, events, casing, cementing, and document counts. Accepts either UUID or `wellId` (e.g. `OIL-SYN-003`).

### `POST /api/v1/wells`
Creates a new well master record. Requires `DRILLING_ENGINEER`, `ADMIN`, or `DATA_ENGINEER` role.

### `GET /api/v1/wells/:id/trajectory`
Returns ordered trajectory survey points (MD, TVD, Inclination, Azimuth, DLS).

### `GET /api/v1/wells/:id/formations`
Returns ordered formation intervals (Top Depth, Bottom Depth, Lithology, Pay Zone flag).

### `GET /api/v1/wells/:id/parameters`
Returns time-series drilling parameter samples (ROP, WOB, RPM, Torque, SPP, FlowRate).

### `GET /api/v1/wells/:id/mud`
Returns mud rheology logs (Mud weight, Plastic Viscosity, Yield Point, Fluid Loss, Pit Volume).

### `GET /api/v1/wells/:id/events`
Returns historical operational events recorded on the well.

---

## 3. Formations & Stratigraphy (`/api/v1/formations`)

### `GET /api/v1/formations`
Returns formation intervals across all wells. Filterable with `?formationName=Barail`.

---

## 4. Events & Precedent Engine (`/api/v1/events`)

### `GET /api/v1/events/near-depth`
Queries offset historical events within a depth tolerance window across the field (cross-well precedent engine).
* **Query Parameters**:
  * `targetDepth` (Float, required): e.g. `3200`
  * `toleranceMeters` (Float, optional, default: 50): e.g. `50`
  * `formation` (String, optional): e.g. `Barail Sandstone`
  * `eventType` (Enum, optional): e.g. `STUCK_PIPE`
  * `excludeWellId` (UUID, optional): excludes current active well

### `GET /api/v1/events`
Lists historical events filtered by `formation`, `minDepth`, `maxDepth`, `eventType`, `severity`.

### `POST /api/v1/events`
Records a new operational event with root cause, mitigation, and provenance metadata.

---

## 5. Ingestion Pipeline (`/api/v1/ingestion`)

### `POST /api/v1/ingestion/import`
Ingests a dataset payload through the canonical pipeline:
`Adapter -> Parser -> Validator -> Normalizer -> Mapper -> Database`.
* **Payload**:
  ```json
  {
    "sourceName": "OIL-SYNTHETIC-BATCH-01",
    "sourceType": "CSV",
    "entityType": "WELL",
    "payload": "wellId,name,field,operator,wellType,status,spudDate,completionDate,totalDepth,latitude,longitude\n..."
  }
  ```

### `GET /api/v1/ingestion/jobs`
Returns history of batch ingestion jobs and error summaries.

---

## 6. Data Quality & Audit (`/api/v1/data-quality`, `/api/v1/audit-logs`)

### `GET /api/v1/data-quality`
Returns the dataset health index, status breakdown (`VALID`, `WARNING`, `INVALID`, `UNVERIFIED`, `VERIFIED`), and detected anomalies.

### `GET /api/v1/audit-logs`
Returns immutable audit logs tracking logins, imports, and entity mutations.
