# NWIS Stage 03: Modular Risk Engines & Decision-Support Scoring

## 1. Modular Risk Architecture
NWIS implements modular risk engines adhering to a common interface (`RiskEngine`):

```typescript
export interface RiskEngine {
  readonly riskType: RiskType;
  evaluate(context: RiskEvaluationContext): RiskAssessmentData | null;
}
```

### Risk Engines Implemented:
1. **`StuckPipeRiskEngine`**:
   - Evaluates: Torque deviation above baseline, ROP decline rate, Overpull drag increase, Hookload oscillation, and Historical offset precedents.
2. **`LostCirculationRiskEngine`**:
   - Evaluates: Flow-out deficit relative to pump rate, Active pit volume decline, Standpipe pressure drop, and Formation permeability context.
3. **`KickRiskEngine`**:
   - Evaluates: Flow return surge exceeding pump rate, Active pit volume gain, and Unexpected pressure imbalance.
4. **`TorqueRiskEngine`**:
   - Evaluates: Sudden torsional spikes, Stick-slip oscillations (high std dev), and RPM response abnormalities.
5. **`CementingRiskEngine`**:
   - Evaluates: Displacement pressure elevation and return slurry volume discrepancy (active strictly during `CEMENTING` state).

---

## 2. Decision-Support Risk Score (No Faked Probabilities)

NWIS strictly enforces the **Anti-Hallucination & Probability Transparency Rule**:
- We do **NOT** claim "87% chance of stuck pipe" without a calibrated long-term production model.
- We present a transparent, explainable **Decision-Support Risk Score** (0 to 100):

| Score Range | Severity | Description |
| :--- | :--- | :--- |
| **0 – 30** | `NORMAL` | Signals within verified formation baselines. |
| **31 – 60** | `WATCH` | Mild baseline deviation or single elevated parameter. |
| **61 – 80** | `WARNING` | Multi-signal corroboration with historical precedent match. |
| **81 – 100** | `CRITICAL` | Severe physical divergence with confirmed offset sticking/loss cases. |

---

## 3. Explainable Contribution Breakdown
Every risk assessment includes an explicit, additive contributing factor breakdown:

```json
{
  "score": 75,
  "severity": "WARNING",
  "contributingFactors": [
    { "factor": "Torque Deviation", "weight": 24, "contribution": 24.0, "description": "Torque increased 38.2% above formation baseline" },
    { "factor": "ROP Decline", "weight": 18, "contribution": 16.5, "description": "Rate of Penetration dropped 27.5% below baseline" },
    { "factor": "Drag Increase", "weight": 14, "contribution": 14.0, "description": "Overpull / drag increased 28.1%" },
    { "factor": "Historical Precedent", "weight": 20, "contribution": 13.3, "description": "2 comparable historical stuck-pipe events documented in offset wells" },
    { "factor": "Formation Sensitivity", "weight": 12, "contribution": 9.6, "description": "Formation Gamma identified as mechanically sensitive interval" }
  ]
}
```

---

## 4. Mandatory Section 55 "Insufficient Data" Rule
If critical input sensors are missing (e.g. flow-out sensor disconnected or uncalibrated during lost-circulation analysis):
- NWIS **NEVER** fabricates a risk score.
- NWIS returns **`score: 0`** with status:
  `"INSUFFICIENT DATA: Flow-out sensor unavailable for the current interval. Lost-circulation assessment is unavailable."`
