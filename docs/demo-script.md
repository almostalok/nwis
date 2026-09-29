# NWIS — Smart India Hackathon (SIH26121) 1-Click Demonstration Script

## Organization: Oil India Limited (OIL)
## Problem Title: Nearby Wells Intelligence System (NWIS)

---

# 1. EXECUTIVE PITCH HOOK (Duration: 60 Seconds)

> *"Respected Evaluators and Oil India Limited Leadership,*
>
> *Every year, complex exploration and development wells face unforeseen subsurface drilling hazards—stuck pipes, severe mud losses, and kicks. When these occur, an operator loses between ₹50 Lakhs to ₹3 Crores per incident in Non-Productive Time (NPT).*
>
> *Oil India Limited already has a world-class real-time monitoring infrastructure: **eRTMAC**.*
> *eRTMAC is exceptional at telling the drilling engineer **what is happening right now**.*
>
> *However, when an engineer sees torque fluctuations at 3,200m depth, eRTMAC cannot automatically answer:*
> 1. *Have we encountered this exact micro-trend before within a 10 km radius?*
> 2. *Which offset well experienced this?*
> 3. *What formation was it in, and what specific action cured the problem 5 years ago?*
>
> *That is why we built **NWIS: Nearby Wells Intelligence System**.*
> *eRTMAC tells the engineer what is happening.*
> *NWIS tells the engineer **what is about to happen, why, and what was proven to work in offset wells**."*

---

# 2. STORYBOARD DEMONSTRATION WORKFLOW (Duration: 3 to 4 Minutes)

### Step 1: Open the 1-Click Pitch Command Center
* Navigate to `http://localhost:3000/demo` (or click **"1-Click Pitch"** in the top navigation).
* Highlight the top regulatory indicator:
  - `"SYNTHETIC DEMONSTRATION DATA &bull; OIL/eRTMAC INTEGRATION READY"`
  - Note: *"NWIS is designed with an uncompromising safety framework. It is strictly a **decision-support advisory system** with zero autonomous rig actuators—the drilling superintendent retains absolute operational authority."*

### Step 2: Phase 1 — Nominal Baseline Drilling
* Show Phase 1 in the Storyboard:
  - Depth: 3,200m in Upper Barail Sandstone.
  - Normal ROP: 18.5 m/h, Smooth torque: 14.5 kN-m, SPP: 195 bar.
  - Telemetry is within normal statistical baselines.

### Step 3: Phase 2 — Micro-Trend Anomaly Detection (3,218m)
* Advance to Phase 2:
  - The bit enters a reactive Barail Coal seam.
  - Point to the **Deterministic Robust MAD Anomaly Detector**:
    - Torque variance surges +2.8σ.
    - Standpipe pressure rises +1.8 bar/min slope.
    - Overpull on connections reaches +45 kN.
  - Explain: *"Traditional systems trigger only when the pipe is already stuck. NWIS feature engine detects rolling micro-trends across 30-second and 300-second windows."*

### Step 4: Phase 3 — Signature Precedent Engine Matching
* Advance to Phase 3:
  - Point to the **Precedent Match**:
    - **94.2% Precedent Match** with historical well `OIL-SYN-005` (4.8 km Northeast).
    - In 2021, `OIL-SYN-005` experienced a severe mechanical stuck pipe at 3,235m under identical geological conditions, resulting in 36.5 hours of NPT.
    - Highlight: *"NWIS retrieves institutional memory in less than 250 milliseconds from historical Daily Drilling Reports (DDR) and Well Completion Reports (WCR)."*

### Step 5: Phase 4 — Bayesian Risk Fusion & Early Warning
* Advance to Phase 4:
  - Risk score reaches **88.4 / 100 [CRITICAL]**.
  - **Estimated Early Warning Lead Time: 28.5 Minutes**.
  - Point out that this proactive lead time gives the rig crew ample time to pick up off bottom, circulate with high flow rates, and pump a high-density sweep before mechanical packing off occurs.

### Step 6: Phase 5 — Human-in-the-Loop Audit & Prevented Incident
* Advance to Phase 5:
  - Demonstrate the **Acknowledge & Resolve Workflow**.
  - Show the immutable audit trail with timestamp and engineer attribution.
  - Result: 0 hours NPT, estimated ₹48+ Lakhs saved.

---

# 3. TECHNICAL DEPTH HIGHLIGHTS FOR JUDGES

1. **Spatial Subsurface Engine (`/wells`)**:
   - PostGIS spherical distance queries (`ST_DWithin`) with lithological formation correlation.
   - Interactive 3D trajectory interpolation.
2. **Hybrid Semantic Search (`/search`)**:
   - Combines BM25 keyword matching with domain-normalized 64-dimensional dense vector embeddings.
3. **Model Governance & Registry (`/models`)**:
   - 5 domain-specific hazard models (Stuck Pipe, Lost Circulation, Kick, Torque & Drag, Cementing Channeling).
   - Validated F1 scores exceeding 91%, with live Kolmogorov-Smirnov drift monitoring.
4. **Data Integrity & ISO 19157 Standards (`/data-quality`)**:
   - Transparent scoring breakdown for completeness, positional accuracy, logical consistency, and temporal freshness.
5. **Executive Reports & Dossiers (`/reports`)**:
   - 1-click printable PDF/Markdown dossiers for well intelligence and post-mortem reviews.

---

# 4. ANTICIPATED JUDGES' QUESTIONS & WINNING ANSWERS

### Q1: *"Does NWIS alter drilling parameters like WOB or RPM automatically?"*
> **Answer:** *"Absolutely not. Under standard petroleum safety protocols and IEC 62443 cyber-physical boundaries, NWIS enforces a strict **unidirectional read-only air-gap**. NWIS advises and alerts; certified rig toolpushers and drilling superintendents execute all operational decisions."*

### Q2: *"Is this data from real active OIL wells?"*
> **Answer:** *"No. In compliance with OIL confidentiality and SIH guidelines, this system runs on high-fidelity synthetic data modeled after the geological formations and drilling parameters typical of the Upper Assam shelf (Barail, Tipam, Kopili, Girujan). However, our integration adapters (`ERTMACAdapter`, `WITSMLLiveAdapter`) are built to the exact WITSML 1.4.1.1 and 2.0 standards, making the system 100% integration-ready for production hookup upon authorization."*

### Q3: *"How does NWIS prevent hallucinated recommendations?"*
> **Answer:** *"NWIS employs a multi-tiered anti-hallucination architecture:
> 1. All recommendations cite the exact document chunk ID, page number, and source file.
> 2. Anomaly detection is mathematically deterministic using robust MAD and rolling z-scores.
> 3. Extracted entities are backed by a human-in-the-loop verification interface where drilling engineers can audit and confirm values."*
