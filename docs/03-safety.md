# NWIS Stage 03: Decision Support & Operational Safety Framework

## 1. Safety Mandate
NWIS is fundamentally an **advisory decision-support system**.

### Strictly Prohibited Autonomous Actions:
- NWIS **NEVER** issues automated control commands to rig actuators.
- NWIS **NEVER** automatically alters:
  - Weight on Bit (WOB)
  - Rotary speed (RPM)
  - Mud density / mud weight
  - Mud pump flow rate or strokes per minute (SPM)
  - Choke manifold or blow-out preventer (BOP) valves

## 2. Permitted Advisory Terminology
All recommendations must be phrased as:
- *"Review approved stuck-pipe prevention procedure."*
- *"Consider engineering review of bottom-hole assembly stability."*
- *"Compare current trajectory against historical offset cases."*
- *"Verify flow sensor calibration and pit level totalizer."*

## 3. Sensor Quality & Fail-Safe Protection
If critical telemetry is corrupted or missing:
- Returns `"INSUFFICIENT DATA"`.
- Prevents false-alarm panic or misleading reassurance.
