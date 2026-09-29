# NWIS Stage 03: REST & Streaming API Documentation

## 1. Real-Time Endpoints

### `GET /api/v1/realtime/stream?wellId=:id`
- **Protocol**: Server-Sent Events (SSE)
- **Response**: Reactive stream of `drilling.sample`, `anomaly.detected`, `risk.updated`, `alert.*`.

### `GET /api/v1/realtime/wells/:id/latest`
- Returns the latest normalized telemetry sample for the specified well.

### `GET /api/v1/realtime/wells/:id/history?limit=50`
- Returns recent time-series telemetry samples.

### `GET /api/v1/realtime/wells/:id/features`
- Returns rolling window features (30s, 60s, 300s).

### `GET /api/v1/realtime/wells/:id/anomalies`
- Returns active detected anomalies.

### `GET /api/v1/realtime/wells/:id/risks`
- Returns active risk assessments and contribution factors.

### `GET /api/v1/realtime/wells/:id/context`
- Returns the complete real-time well context object.

### `GET /api/v1/realtime/wells/:id/sensor-health`
- Returns sensor quality diagnostics.

---

## 2. Simulation & Replay Endpoints

### `POST /api/v1/realtime/simulator/start`
- **Body**: `{ wellId, scenario, speedMultiplier, startDepth, endDepth, totalSteps }`

### `POST /api/v1/realtime/simulator/stop`
- **Body**: `{ wellId }`

### `POST /api/v1/realtime/simulator/pause`
- **Body**: `{ wellId }`

### `POST /api/v1/realtime/simulator/resume`
- **Body**: `{ wellId }`

### `POST /api/v1/realtime/simulator/demo`
- **Action**: Initiates the 1-click deterministic Hackathon Demo.

---

## 3. Alert Lifecycle Endpoints

### `GET /api/v1/alerts`
- **Query**: `wellId`, `severity`, `status`, `riskType`, `limit`

### `GET /api/v1/alerts/:id`
- Returns complete alert record with trigger signals, source evidence, and historical citations.

### `POST /api/v1/alerts/:id/acknowledge`
- **Body**: `{ actor, note }`

### `POST /api/v1/alerts/:id/resolve`
- **Body**: `{ actor, note }`

### `POST /api/v1/alerts/:id/dismiss`
- **Body**: `{ actor, reason }` (Reason is strictly mandatory)
