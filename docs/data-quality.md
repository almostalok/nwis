# NWIS Data Quality & Governance Framework

## 1. Objective
Historical drilling records often suffer from transcription errors, incompatible unit systems, and contradictory reports. Stage 01 implements a data quality gatekeeper to ensure low-quality historical data does not corrupt downstream AI/ML models in Stages 02 and 03.

---

## 2. Quality Metadata Schema
Every core entity supports the following quality fields:
* `qualityStatus`: Enum (`VALID`, `WARNING`, `INVALID`, `UNVERIFIED`, `VERIFIED`)
* `qualityScore`: Float from 0.0 to 1.0
* `confidence`: Float reflecting extraction or sensor confidence
* `sourceId`: Reference to originating data source

---

## 3. Automated Anomaly Detection Rules
The Data Quality engine flags structural anomalies:
1. **Depth Inversions**: Rejects any formation where `topDepth >= bottomDepth`.
2. **Negative Drilling Parameters**: Rejects negative ROP, WOB, RPM, or Torque.
3. **Event Span Consistency**: Flags any operational event where `endDepth < startDepth`.
4. **Geographical Outliers**: Flags coordinates outside valid bounds or vastly divergent from field centroid.

---

## 4. Quality Status Lifecycle
* **UNVERIFIED**: Initial state of raw ingested data before programmatic validation.
* **VALID**: Meets all schema constraints, physical bounds, and unit checks.
* **WARNING**: Structurally valid but exhibits boundary anomalies (e.g. unusually shallow TD).
* **INVALID**: Fails hard physics constraints (e.g. inverted formations, negative depth).
* **VERIFIED**: Programmatically verified AND confirmed by a Senior Drilling Superintendent.
