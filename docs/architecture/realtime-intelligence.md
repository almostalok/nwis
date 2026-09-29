# NWIS Architecture: Real-Time Intelligence & Precedent Fusion

## 1. End-to-End Pipeline Architecture

```mermaid
sequenceDiagram
    autonumber
    participant Sensor as Rig Sensors / Synthetic Stream
    participant Adapter as RealtimeDrillingAdapter
    participant FeatureEng as FeatureEngineService
    participant AnomalyEng as AnomalyEngineService
    participant Precedent as Stage 02 PrecedentEngine
    participant RiskFusion as RiskFusionEngine
    participant AlertEng as AlertEngineService
    participant UI as Next.js Live Dashboard

    Sensor->>Adapter: Telemetry Sample (ROP, Torque, SPP, Flow...)
    Adapter->>FeatureEng: Rolling Buffer Processing (30s, 60s, 300s)
    FeatureEng->>AnomalyEng: Z-Scores, Robust Z, Slopes & Deviations
    AnomalyEng->>RiskFusion: Multi-Parameter Anomalies
    opt If Anomaly or Elevated Risk
        RiskFusion->>Precedent: Query Offset Precedents (Formation, Depth, Events)
        Precedent-->>RiskFusion: Historical Precedents & Source Documents
    end
    RiskFusion->>AlertEng: Unified Risk Assessment + Contributing Factors
    AlertEng->>UI: SSE Event (`alert.created` / `risk.updated`)
    UI->>UI: Render Live Metrics, Correlation Chart & Precedent Dossier
```

## 2. Storage Strategy
- High-frequency telemetry: PostgreSQL `realtime_drilling_samples` indexed by `(wellId, timestamp)` and `(wellId, measuredDepth)`.
- Derived features: `realtime_features` indexed by `(wellId, windowSeconds)`.
- Context snapshots: `context_snapshots` frozen at the exact second a Warning or Critical alert triggers for post-incident engineering review.
