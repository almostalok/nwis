# NWIS — Precedent Engine & Scenario Analysis

## 1. Overview
The **Precedent Engine** is the signature intelligence capability of NWIS Stage 02. It answers the fundamental question of drilling intelligence:

> **"Has a comparable operational situation happened before in offset wells, and what evidence supports it?"**

---

## 2. Precedent Detection Pipeline

```text
CURRENT CONTEXT (Well, Target Depth, Formation, Real-time Parameters)
       ↓
RADIAL CANDIDATE SELECTION (PostGIS radius search <= 25km)
       ↓
STRATIGRAPHIC CORRELATION (Matching formation intervals across offset wells)
       ↓
DEPTH INTERVAL MATCHING (+/- 80m window around target depth)
       ↓
PRECURSOR PARAMETER ANALYSIS (Torque Spike >25 kN.m, ROP Decay <6 m/h, Drag)
       ↓
MULTI-FACTOR RANKING & EVIDENCE LINKAGE
       ↓
EXPLAINABLE OUTPUT WITH DOCUMENT CITATIONS
```

---

## 3. The Synthetic Precedent Scenario (Sections 58 & 61)

### Context:
- **Active Well**: `OIL-SYN-020`
- **Target Depth**: `3200 m MD`
- **Formation**: `Barail Sandstone` / `Formation Gamma`
- **Current Parameters**: Torque = 34 kN.m (elevated), ROP = 4 m/h (decaying)

### Detected Historical Precedents:
The Precedent Engine correlates three historical offset wells with identical geological and precursor conditions:

1. **Well `OIL-SYN-012`** (81% Similarity, 7.0 km offset):
   - **Event**: `STUCK_PIPE` at **3205 m MD** in Barail Sandstone.
   - **Precursor**: Torque spike, ROP decay, drag increase.
   - **Action**: Spotted 14 m3 low-viscosity surfactant soaking pill, applied continuous jarring.
   - **Citation**: `synthetic-well-012-ddr.txt` (Page 1).

2. **Well `OIL-SYN-003`** (78% Similarity, 7.7 km offset):
   - **Event**: `STUCK_PIPE` at **3210 m MD** in Barail Sandstone.
   - **Precursor**: Torque spike, ROP decay, drag increase.
   - **Action**: Spotted 12 m3 oil-based lubricant soaking pill, worked string with hydraulic jars.
   - **Citation**: `synthetic-well-003-ddr.txt` (Page 1) & `synthetic-well-003-wcr.txt` (Page 1).

3. **Well `OIL-SYN-007`** (74% Similarity, 7.3 km offset):
   - **Event**: `STUCK_PIPE` at **3180 m MD** in Barail Sandstone.
   - **Precursor**: Torque spike, ROP decay, drag increase.
   - **Action**: Pumped 10 m3 lubricating pill, jarred down with 40-tonne impacts.
   - **Citation**: `synthetic-well-007-ddr.txt` (Page 1).

---

## 4. Distinction from Stage 03 Prediction
Stage 02 detects **historical precedent and multi-factor similarity**. It does not declare an autonomous real-time alarm or probability prediction (e.g. "Stuck pipe is 89% likely to occur in 30 minutes").

Instead, Stage 02 provides:
* *"This operational situation has occurred 3 times before in offset wells within 8 km."*
* *"In each past case, identical torque spikes and ROP decay preceded differential sticking."*
* *"Here are the specific soaking pills and jarring procedures that freed the drill string in those events."*

Stage 03 will connect this precedent baseline to streaming eRTMAC sensor telemetry to generate real-time anomaly alerts.
