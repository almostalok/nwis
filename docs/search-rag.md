# NWIS — Hybrid Search & Grounded RAG Assistant

## 1. Hybrid Search Architecture
Drilling intelligence queries require combining semantic meaning with exact numerical and geological filters. NWIS implements a three-part **Hybrid Search Engine**:

```text
QUERY: "stuck pipe in Barail formation around 3200m"
   ├── 1. Vector Similarity: Cosine similarity on 64-dim document chunk embeddings (50% weight)
   ├── 2. Exact Keyword Scoring: Frequency and position matching on token stems (30% weight)
   └── 3. Metadata Filtering: Hard bounds on formation name, depth interval, and event type (20% weight)
   ↓
COMBINED RELEVANCE SCORE & SNIPPET HIGHLIGHTING
```

### Search API
- **Endpoint**: `POST /api/v1/intelligence/search`
- **Payload**:
```json
{
  "query": "stuck pipe torque spike",
  "formation": "Barail",
  "depth": 3200,
  "eventType": "STUCK_PIPE",
  "limit": 25
}
```

---

## 2. Grounded RAG Assistant

### Core Philosophy
The NWIS AI Assistant is not a generic LLM chatbot. It is a **deterministic evidence-grounded drilling advisor**. Every factual statement in the assistant's response is directly tethered to an indexed document, page number, and offset well record.

### Anti-Hallucination Guardrails (Section 36 & 57)
The system enforces strict validation gates before generating any synthesis:

1. **Catalog Existence Check**:
   - If the user query references a well identifier (e.g. `OIL-SYN-999`) that does not exist in the database, the premise is immediately rejected:
   > *"No matching evidence was found in the indexed NWIS dataset. Well 'OIL-SYN-999' does not exist in the database."*

2. **Depth Physical Boundary Check**:
   - If the user query specifies a depth exceeding the total drilled depth of the well (e.g. 9000 m on `OIL-SYN-001`, which has a TD of 4150 m), the premise is rejected:
   > *"No matching evidence was found in the indexed NWIS dataset. Well OIL-SYN-001 has a total drilled depth of 4150m; depth 9000m exceeds the well boundaries."*

3. **No-Evidence Transparency**:
   - If no relevant historical incidents or document chunks corroborate the prompt, the system explicitly returns:
   > *"No sufficient historical evidence was found in the indexed NWIS dataset."*

---

## 3. Structured Citation Cards
Every grounded response includes clickable evidence cards containing:
- Document Title (e.g. `OIL Operations Report — SYNTHETIC-WELL-003-DDR.TXT`)
- Source file name
- Page Number
- Exact text excerpt showing the operational context
