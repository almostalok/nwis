# NWIS — Well Similarity & Cross-Well Correlation

## 1. Overview
Geographic proximity alone is insufficient for drilling comparison. Two wells 1 km apart may penetrate different geological fault blocks, while a well 8 km away along the same regional strike may encounter identical formations and pressure regimes.

NWIS computes **Multi-Factor Similarity** across 6 operational dimensions:

```text
DIMENSION                    DEFAULT WEIGHT    EVALUATION METHOD
Spatial Proximity            20% (0.20)        Geodesic distance decay (0 - 25 km)
Formation Overlap            30% (0.30)        Jaccard index of penetrated stratigraphic units
Depth Interval Overlap       20% (0.20)        Total depth ratio and interval overlap
Trajectory Profile           10% (0.10)        Maximum inclination and deviation matching
Operational Incidents        10% (0.10)        Historical event type alignment (stuck pipe, losses)
Reservoir Target Zones       10% (0.10)        Shared hydrocarbon-bearing reservoir intervals
```

---

## 2. Transparent Human-Readable Explanations (Section 27)
A similarity score is never displayed without an explanation. For each offset candidate, the engine generates clear bullets:

```text
✓ Immediate offset well: located only 1.8 km away
✓ Shares 6 geological formations: Tipam Sandstone, Barail Sandstone, Kopili Shale
✓ Target depth difference is within 30m (4280m vs 4250m)
✓ Encountered similar historical operational events: STUCK_PIPE, TORQUE_SPIKE
```

---

## 3. Side-by-Side Cross-Well Comparison API
- **Endpoint**: `GET /api/v1/intelligence/compare?wellA=OIL-SYN-020&wellB=OIL-SYN-003`
- **Output**:
  - Distance in kilometers
  - Overall similarity score & 6-factor breakdown
  - Formation overlap (shared formations, unique to A, unique to B)
  - Depth correlation ratio
  - Side-by-side operational events and NPT summary
