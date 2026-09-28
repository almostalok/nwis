# NWIS Data Model Specification

## 1. Domain Entities & Schema Overview

NWIS's data model is purpose-built for drilling intelligence, spatial proximity search, geological depth correlation, and explainable precedent retrieval.

### Well (`wells`)
* `id`: UUID (Primary Key)
* `wellId`: String (Unique business identifier, e.g. `OIL-SYN-001`)
* `name`: String (Display name, e.g. `NWIS Discovery Well 01`)
* `field`: String (Fictional field identifier, e.g. `NWIS-DEMO-FIELD`)
* `operator`: String (`Oil India Limited (Synthetic Operations)`)
* `wellType`: Enum (`EXPLORATION`, `DEVELOPMENT`, `APPRAISAL`, `WILDCAT`, `STRATIGRAPHIC`)
* `status`: Enum (`PLANNED`, `DRILLING`, `COMPLETED`, `SUSPENDED`, `ABANDONED`)
* `spudDate`: DateTime (Optional spud date)
* `completionDate`: DateTime (Nullable completion date)
* `totalDepth`: Float (Canonical depth in meters)
* `latitude`: Float (-90 to 90 degrees)
* `longitude`: Float (-180 to 180 degrees)
* `qualityStatus`: Enum (`VALID`, `WARNING`, `INVALID`, `UNVERIFIED`, `VERIFIED`)
* `qualityScore`: Float (0.0 to 1.0)
* `sourceId`: UUID (Nullable reference to `data_sources`)

### Well Trajectory (`well_trajectory_points`)
* `id`: UUID
* `wellId`: Foreign Key -> `wells.id`
* `measuredDepth`: Float (m)
* `trueVerticalDepth`: Float (m)
* `inclination`: Float (degrees, 0-180)
* `azimuth`: Float (degrees, 0-360)
* `dogLegSeverity`: Float (deg/30m)
* `latitude`, `longitude`, `northing`, `easting`: Floats (Projected and geographic coordinates)
* Index: `[wellId, measuredDepth]`

### Formation Interval (`formation_intervals`)
* `id`: UUID
* `wellId`: Foreign Key -> `wells.id`
* `formationName`: String (`Alluvium`, `Girujan Clay`, `Tipam Sandstone`, `Surma Group`, `Barail Sandstone`, `Kopili Shale`, `Jaintia Limestone`)
* `topDepth`: Float (m)
* `bottomDepth`: Float (m)
* `topTVD`: Float (m)
* `bottomTVD`: Float (m)
* `lithology`: String (e.g. `Fine Sandstone & Carbonaceous Shale`)
* `reservoir`: Boolean (Flag indicating hydrocarbon pay zone)
* `confidence`: Float (0.0 to 1.0)
* Indexes: `[wellId]`, `[formationName]`, `[topDepth, bottomDepth]`

### Operational Event (`operational_events`)
* `id`: UUID
* `wellId`: Foreign Key -> `wells.id`
* `eventType`: Enum (`LOST_CIRCULATION`, `KICK`, `STUCK_PIPE`, `FISHING`, `NPT`, `TORQUE_SPIKE`, `PRESSURE_ANOMALY`, `FORMATION_INSTABILITY`, `CASING_EVENT`, `CEMENTING_EVENT`, `EQUIPMENT_FAILURE`, `OTHER`)
* `severity`: Enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
* `startDepth`: Float (m)
* `endDepth`: Float (m)
* `startTime`, `endTime`: DateTimes
* `formationId`: Foreign Key -> `formation_intervals.id`
* `description`: Text (Detailed incident narrative)
* `rootCause`: Text (Engineering root cause analysis)
* `mitigation`: Text (Procedures and actions taken to regain control)
* `outcome`: Text (Final result and operational lessons learned)
* `confidence`: Float (0.0 to 1.0)
* **Provenance Fields**:
  * `sourceDocumentId`: Foreign Key -> `documents.id`
  * `sourcePage`: Integer (Page reference in document)
  * `sourceLocation`: String
  * `extractionMethod`: String (`MANUAL`, `HEURISTIC`, `LLM_PIPELINE`)
  * `extractionConfidence`: Float
  * `verifiedBy`: String
  * `verifiedAt`: DateTime
* Indexes: `[wellId]`, `[eventType]`, `[startDepth]`, `[formationId]`

### Drilling Parameter Samples (`drilling_parameter_samples`)
* `id`: UUID
* `wellId`: Foreign Key -> `wells.id`
* `timestamp`: DateTime
* `measuredDepth`: Float (m)
* `rop`: Float (m/h)
* `wob`: Float (kN)
* `rpm`: Float (rotary speed)
* `torque`: Float (kN.m)
* `hookLoad`: Float (kN)
* `standpipePressure`: Float (bar)
* `flowRate`: Float (lpm)
* `additionalTags`: JSONB (Extensible sensor dictionary)
* Indexes: `[wellId, measuredDepth]`, `[wellId, timestamp]`

### Mud Samples (`mud_samples`)
* `id`: UUID
* `wellId`: Foreign Key -> `wells.id`
* `timestamp`: DateTime
* `measuredDepth`: Float (m)
* `mudWeight`: Float (sg)
* `plasticViscosity`: Float (cP)
* `yieldPoint`: Float (lb/100ft2)
* `funnelViscosity`: Float (sec/qt)
* `fluidLoss`: Float (ml/30min)
* `ph`: Float
* `chlorides`: Float (mg/l)
* `pitVolume`: Float (m3)
* `gasReading`: Float (units)

### Casing Section & Cementing Job
* `casing_sections`: `casingSize`, `settingDepth`, `topDepth`, `bottomDepth`, `grade`, `weight`, `cementTop`
* `cementing_jobs`: `jobDate`, `topDepth`, `bottomDepth`, `cementVolume`, `cementDensity`, `slurryType`, `jobStatus`

### Document & Provenance Store (`documents`)
* `id`: UUID
* `wellId`: Foreign Key -> `wells.id`
* `documentType`: Enum (`WCR`, `DDR`, `MUD_REPORT`, `GEOLOGICAL_REPORT`, `CEMENTING_REPORT`, `CASING_REPORT`, `INCIDENT_REPORT`, `OTHER`)
* `title`: String
* `fileName`: String
* `storagePath`: String
* `checksum`: String (SHA-256)
* `processingStatus`: Enum (`UPLOADED`, `QUEUED`, `PROCESSING`, `PROCESSED`, `FAILED`, `VERIFIED`)
