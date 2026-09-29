# NWIS Stage 03: Real-Time Drilling Intelligence Architecture

## 1. Executive Summary
**Nearby Wells Intelligence System (NWIS)** Stage 03 introduces **Real-Time Drilling Intelligence** designed for Oil India Limited (OIL).
NWIS serves strictly as a **decision-support copilot** for drilling engineers, superintendents, and geologists. It continuously ingests high-frequency drilling telemetry, extracts rolling statistical trends, flags multi-signal physical anomalies, evaluates modular operational risks, and immediately corroborates patterns against institutional memory (offset well precedents and verified geological completion reports).

> **CRITICAL DISCLAIMER:**
> NWIS is a **decision-support advisory system**. It does **NOT** autonomously control drilling equipment or rig actuators. It never issues automated changes to WOB, RPM, mud weight, pump rate, or standpipe pressure.

---

## 2. Real-Time Data Pipeline Architecture

```mermaid
flowchart TD
    subgraph Data Sources
        OIL_eRTMAC["OIL eRTMAC Stream (Standby Adapter)"]
        WITSML["WITSML / ETP Stream (Standby Adapter)"]
        SynthStream["Synthetic Live Stream Adapter (OIL-SYN-020)"]
    end

    subgraph Streaming & Normalization
        AdapterRouter["RealtimeDrillingAdapter Router"]
        SensorQuality["Sensor Quality & Bounds Validation (ISO 19157)"]
        TimeSeriesDB[("PostgreSQL / TimescaleDB Time-Series Storage")]
    end

    subgraph Intelligence & Risk Engines
        FeatureEngine["Feature Engine (Rolling Windows: 30s, 60s, 300s, 900s)"]
        AnomalyEngine["Anomaly Engine (Z-Score, Robust Z, Trend Slope)"]
        PrecedentEngine["Stage 02 Precedent Engine (Offset Citations)"]
        RiskFusion["Risk Fusion Engine (Weights, Confidence, Factors)"]
    end

    subgraph Decision Support & Delivery
        AlertEngine["Alert Engine & Lifecycle State Machine"]
        AuditLog[("Immutable Audit Trail & Context Snapshots")]
        EventStream["Server-Sent Events (SSE) / WebSocket Gateway"]
        WebDashboard["Live Drilling Dashboard (/dashboard & /alerts)"]
    end

    OIL_eRTMAC --> AdapterRouter
    WITSML --> AdapterRouter
    SynthStream --> AdapterRouter

    AdapterRouter --> SensorQuality
    SensorQuality --> TimeSeriesDB
    SensorQuality --> FeatureEngine
    FeatureEngine --> AnomalyEngine
    AnomalyEngine --> RiskFusion
    PrecedentEngine --> RiskFusion
    RiskFusion --> AlertEngine
    AlertEngine --> AuditLog
    AlertEngine --> EventStream
    EventStream --> WebDashboard
```

---

## 3. Core Engine Responsibilities

1. **Stream Adapters (`RealtimeDrillingAdapter`)**:
   - `SyntheticLiveStreamAdapter`: Generates realistic drilling telemetry with physics-based perturbations and intentional scenario injections.
   - `ERTMACAdapter`: Production placeholder for Oil India Limited eRTMAC network conduit.
   - `WITSMLLiveAdapter`: Production placeholder for external WITSML 1.4.1.1/2.0 servers.

2. **Feature Engine (`FeatureEngineService`)**:
   - Computes rolling mean, rolling median, sample standard deviation, median absolute deviation (MAD), linear trend slope, and percentage baseline deviations across 30s, 60s, 300s, and 900s windows.

3. **Anomaly Engine (`AnomalyEngineService`)**:
   - Deterministic and statistical anomaly detection (Rolling Z-Score > 2.8, Robust Z > 3.0, ROP negative trend slope < -0.05).

4. **Risk Fusion Engine (`RiskFusionEngine`)**:
   - Synthesizes outputs from `StuckPipeRiskEngine`, `LostCirculationRiskEngine`, `KickRiskEngine`, `TorqueRiskEngine`, and `CementingRiskEngine`.
   - Directly calls Stage 02's `PrecedentEngineService` to retrieve matching offset well citations (`OIL-SYN-003`, `OIL-SYN-007`, `OIL-SYN-012`).

5. **Alert Engine (`AlertEngineService`)**:
   - Manages the alert lifecycle (`NEW` &rarr; `ACKNOWLEDGED` &rarr; `ESCALATED` &rarr; `RESOLVED` / `DISMISSED`).
   - Implements alert deduplication, cooldown, debounced auto-resolution, and append-only audit event logging.
