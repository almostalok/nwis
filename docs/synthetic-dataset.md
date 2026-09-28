# NWIS Synthetic Dataset Specification

## 1. Important Operational Notice
> **Notice**: We DO NOT possess Oil India Limited's (OIL) private operational data. This dataset is a **clearly labelled, OIL-compatible synthetic demonstration dataset** crafted specifically for Stage 01–04 development. Never represent synthetic data as real OIL operational data.

---

## 2. Geological & Geographic Framework

* **Fictional Field**: `NWIS-DEMO-FIELD`
* **Geographical Region**: Clustered realistic fictional coordinates in Upper Assam / Arunachal Basin (~27.28°N to 27.42°N, 95.26°E to 95.42°E), matching OIL's operational geography (Duliajan, Moran, Nahorkatiya, Tengakhat).
* **Wells Count**: 20 wells (`OIL-SYN-001` through `OIL-SYN-020`).

---

## 3. Stratigraphic Column (Formations)

The dataset implements 7 distinct regional formations:

1. **Alluvium** (0m – ~450m MD): Recent unconsolidated sands, gravels, silts.
2. **Girujan Clay** (~450m – ~1150m MD): Variegated, water-sensitive claystone. Contains shale sloughing and pack-off events (e.g. Well 016).
3. **Tipam Sandstone** (~1150m – ~2350m MD): Porous, medium-to-coarse sandstone with shale breaks. Major oil & gas pay zone, with high-permeability micro-fractured loss zones (Wells 005, 014).
4. **Surma Group** (~2350m – ~2850m MD): Alternating sandstone and laminated shale.
5. **Barail Sandstone** (~2850m – ~3450m MD): Primary target reservoir interbedded with carbonaceous, highly fissile shale under tectonic stress.
6. **Kopili Shale** (~3450m – ~4000m MD): Dark splintery marine shale with localized overpressured pockets (gas kicks, Well 009).
7. **Jaintia Limestone** (~4000m – 4500m MD): Deep fossiliferous carbonate secondary reservoir.

---

## 4. Intentional Cross-Well Precedent Signatures

The synthetic dataset incorporates realistic precursors and deliberate cross-well correlations for Stages 02 and 03:

### Precedent A: Recurrent Stuck Pipe in Barail Sandstone (~3200m MD)
* **Wells Involved**: `OIL-SYN-003` (3210m), `OIL-SYN-007` (3180m), and `OIL-SYN-012` (3205m).
* **Precursor Pattern**:
  1. Steady drilling baseline: ROP ~14 m/h, Torque ~11 kN.m.
  2. Escalating torque spike: 11 &rarr; 18 &rarr; 26 &rarr; 34 kN.m.
  3. ROP collapse: 14 &rarr; 8 &rarr; 4 &rarr; 0.5 m/h.
  4. Top drive stall and severe overpull (+60 tonnes).
* **Mitigation & Precedent Lesson**: Spotting 10–14 m3 organic lubricating soaking pills, long hydraulic jarring (36–54 hrs), and switching BHA stabilizers to spiral configurations for subsequent offset wells.

### Precedent B: Lost Circulation in Tipam Sandstone (~2120m MD)
* **Wells Involved**: `OIL-SYN-005` (2125m) and `OIL-SYN-014` (2115m).
* **Precursor Pattern**: Sudden pit volume drop (23 m3 lost in 20 min), flow return drops to 0%, standpipe pressure drops from 165 to 135 bar.
* **Mitigation**: Staged coarse LCM pills (calcium carbonate, walnut nut-plug, fibers) and lowering active mud weight from 1.16 to 1.12 sg.

### Precedent C: Gas Kick in Overpressured Kopili Shale (~3650m MD)
* **Well Involved**: `OIL-SYN-009` (3652m).
* **Precursor Pattern**: ROP drill break (8 &rarr; 18 m/h), pit gain of 3.8 m3 in 12 minutes, gas units surging to 850 units.
* **Mitigation**: Shut in on annular preventer; kill well with Drillers Method and increase mud weight to 1.40 sg.
