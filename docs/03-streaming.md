# NWIS Stage 03: Streaming Architecture & Event Delivery

## 1. Protocol Architecture
For real-time browser delivery, NWIS uses **Server-Sent Events (SSE)** via NestJS `@Sse('api/v1/realtime/stream')` with an RxJS reactive event broker (`StreamEventService`).

### Why Server-Sent Events (SSE)?
- **HTTP/2 & HTTP/1.1 Standard**: Operates through enterprise corporate proxies, firewalls, and VPNs without specialized WebSocket upgrade negotiation.
- **Auto-Reconnection**: Standard browser `EventSource` automatically handles network drops and backoff reconnects.
- **Lightweight**: Zero heartbeat framing overhead compared to heavy WebSocket protocols.

---

## 2. Event Types & Payloads

| Event Name | Direction | Payload Description |
| :--- | :--- | :--- |
| `drilling.sample` | Server &rarr; Client | Real-time sensor sample with quality status. |
| `drilling.feature.updated` | Server &rarr; Client | Rolling window statistics (mean, std, slope, z-scores). |
| `anomaly.detected` | Server &rarr; Client | Physical parameter deviation exceeding thresholds. |
| `risk.updated` | Server &rarr; Client | Unified risk assessment score and factor breakdown. |
| `alert.created` | Server &rarr; Client | New decision-support alert created. |
| `alert.updated` | Server &rarr; Client | Alert score or peak value updated. |
| `alert.resolved` | Server &rarr; Client | Alert resolved after debounce stabilization. |
| `simulation.started` | Server &rarr; Client | Simulation session initiated. |
| `simulation.stopped` | Server &rarr; Client | Simulation stopped. |

---

## 3. Subscription & Client Connection
Clients connect to `/api/v1/realtime/stream?wellId=OIL-SYN-020` to stream real-time updates for a single well, or omit `wellId` to listen to field-wide notifications.
