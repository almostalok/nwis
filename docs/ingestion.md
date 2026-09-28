# NWIS Data Ingestion Architecture

## 1. Architectural Mandate
Section 18 of the NWIS specification requires:
> "Do NOT directly import files into database logic. Create an ingestion abstraction:
> DataSource -> Adapter -> Parser -> Validator -> Normalizer -> Mapper -> Database.
> The application must not depend directly on the synthetic dataset."

---

## 2. Pipeline Components

```text
               Raw Source (File / API / Stream / WITSML)
                                  │
                                  ▼
                            [DataAdapter]
                      (Fetches raw byte/string stream)
                                  │
                                  ▼
                            [DataParser]
                  (Converts raw stream into record list)
                                  │
                                  ▼
                            [DataNormalizer]
                 (Converts units to canonical meters/bar,
                   maps event synonyms into canonical enums)
                                  │
                                  ▼
                            [DataValidator]
                  (Validates types and geological boundaries)
                                  │
                                  ▼
                             [DataMapper]
                 (Translates validated record into entity DTO)
                                  │
                                  ▼
                           [Database Layer]
                 (Prisma transactional upsert & Audit logging)
```

### Component Contracts
1. **`IDataAdapter<TRaw>`**: Connects to the physical protocol (local filesystem, CSV, JSON payload, WITSML SOAP endpoint).
2. **`IDataParser<TRaw, TParsed>`**: Parses raw content into typed dictionaries.
3. **`IDataNormalizer<T, TNormalized>`**: Normalizes engineering units (e.g. feet to meters, psi to bar, ppg to sg) and event terminology synonyms.
4. **`IDataValidator<T>`**: Executes Zod schemas, verifying coordinates (-90..90, -180..180), positive depths, and valid geological order (`topDepth < bottomDepth`).
5. **`IDataMapper<TInput, TOutput>`**: Assembles canonical database models with metadata and quality scores.

---

## 3. Error Handling & Idempotency
* **Non-destructive Processing**: A corrupted record in row 14 does not discard valid records in rows 1–13. Errors are recorded into the `ingestion_jobs` audit record.
* **Deterministic Upsert**: Records use unique natural keys (`wellId`, `wellId + measuredDepth`) to allow repeated execution without creating duplicate rows.
