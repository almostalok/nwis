# NWIS Stage 03: Model Evaluation, Versioning & Registry

## 1. Model Registry
Every risk evaluation output is tagged with audit versions:
- `modelVersion`: `v1.0.0-rules`
- `featureVersion`: `v1.0.0`
- `configVersion`: `v1.0.0`

## 2. Evaluation Metrics (No Data Leakage)
To properly evaluate drilling incident prediction without data leakage:
- **Split Strategy**: Well-level split (e.g. Training Wells: `OIL-SYN-001` through `OIL-SYN-017`; Evaluation Test Wells: `OIL-SYN-018`, `OIL-SYN-019`, `OIL-SYN-020`).
- **Lead Time**: Time between first precursor alert and incident event (Target: 10–25 minutes of advance warning).
- **Precision / Recall**: Balanced against false alarms to avoid alert fatigue.

## 3. Production Readiness Statement
> "Insufficient real-world labeled production data for complex deep-learning ML models. The current prototype utilizes validated deterministic physics-based rules and statistical anomaly detection calibrated with Oil India Limited demonstration criteria."
