# NWIS Stage 03: Hackathon Live Demonstration Guide

## 1. 1-Click Demonstration Script
To demonstrate the complete real-time drilling intelligence system:

1. **Open Dashboard**: Navigate to `http://localhost:3000/dashboard`.
2. **Click "Run NWIS Demo"**:
   - Automatically selects `OIL-SYN-020` in **Formation Gamma** at depth ~3200m.
   - Scenario: `STUCK_PIPE_PRECURSOR` at 10x speed.
3. **Observation Timeline**:
   - **Phase 1 (0:00 - 0:20)**: Normal steady-state drilling (Torque ~15 kNm, ROP ~18 m/hr).
   - **Phase 2 (0:20 - 0:45)**: Subtle torque increase (+18%) and ROP slowdown.
   - **Phase 3 (0:45 - 1:00)**: Overpull drag increases (+28%), Feature Engine calculates rolling slope and z-score anomaly.
   - **Phase 4 (1:00 - 1:15)**: Risk Fusion queries Stage 02 Precedent Engine &rarr; matches 3 offset wells (`OIL-SYN-003`, `OIL-SYN-007`, `OIL-SYN-012`).
   - **Phase 5 (1:15 - 1:30)**: `WARNING` alert created with score 74/100.
4. **Open Alert Dossier**: Click "Open Complete Alert Dossier".
   - Shows live signals + factor breakdown.
   - Shows verified citations to source documents: `WCR-OIL-SYN-007.pdf` (Page 21), `DDR-003.pdf` (Page 14).
5. **Acknowledge Alert**: Click "Acknowledge Alert".
6. **Resolve Alert**: Click "Mark Resolved" with resolution note.
