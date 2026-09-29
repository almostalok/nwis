# NWIS — AI Document Intelligence & Knowledge Pipeline

## 1. Overview
Stage 02 of NWIS transforms historical drilling documentation (DDRs, WCRs, Mud Reports, Incident Reports) into structured, queryable, and semantically grounded operational intelligence.

The pipeline architecture strictly enforces:
```text
DOCUMENT
  ↓
TEXT / OCR EXTRACTION (Page Boundary Preserving)
  ↓
SEMANTIC CHUNKING (Headers & Offset Tracking)
  ↓
DOMAIN ENTITY EXTRACTION (Wells, Depths, Formations, Events, Mitigations)
  ↓
EVENT DEDUPLICATION & EVIDENCE LINKAGE (HistoricalEventEvidence)
  ↓
VECTOR EMBEDDINGS (Local Deterministic Projections + pgvector compatibility)
  ↓
KNOWLEDGE STORAGE (PostgreSQL Relational + Vector Index)
```

---

## 2. Text Extraction & OCR Abstraction

### OCRProvider Interface
```typescript
export abstract class OCRProvider {
  abstract extractTextFromPage(pageIdentifier: string, bufferOrContent?: Buffer | string): Promise<OCRResult>;
}
```
The provider abstraction decouples the core domain from specific OCR engines. In development, `DefaultOCRProvider` evaluates digital and scanned text streams, computing character confidence scores (`ocrConfidence` ~0.98). For on-premise production deployments at OIL, Tesseract OCR or PaddleOCR can be plugged in directly via this interface.

### Page-Boundary Preservation
Rather than treating documents as a flat string, `DocumentExtractorService` preserves page boundaries:
- Page number (`pageNumber: 1, 2, ...`)
- Word count and character length
- Provenance confidence score

---

## 3. Semantic & Boundary-Aware Chunking

### Chunk Model
`DocumentChunk` maintains:
- `documentId`: Foreign key to document
- `pageNumber`: Exact page in original report
- `chunkIndex`: Monotonically increasing chunk order
- `section`: Logical section classification (`GEOLOGY`, `OPERATIONS`, `FLUIDS`, `INCIDENTS`, `GENERAL`)
- `startOffset` / `endOffset`: Precise character spans for highlighting
- `tokenCount`: Estimated token density for LLM context windows
- `embedding`: 64-dimensional semantic projection vector

---

## 4. Domain Entity & Event Extraction

`DomainNLPUtils` extracts:
1. **Wells**: Regex and canonical normalizer (`OIL-SYN-001` to `OIL-SYN-020`).
2. **Depths**: Measured depths converted to canonical meters (`3210 m MD`, `10,500 ft` → `3200.4 m`).
3. **Formations**: Stratigraphic units (`Barail Sandstone`, `Tipam Sandstone`, `Girujan Clay`, `Formation Gamma`).
4. **Operational Events**: Canonical event taxonomy (`STUCK_PIPE`, `LOST_CIRCULATION`, `TORQUE_SPIKE`, `KICK`).
5. **Precursor Indicators**: Early warning signals (`TORQUE_SPIKE`, `ROP_DECREASE`, `DRAG_INCREASE`, `PIT_VOLUME_DROP`, `FLOW_IMBALANCE`).
6. **Mitigation Actions**: Operational procedures executed (`Spotted 12 m3 lubricant soaking pill`, `Controlled hydraulic jarring`).
7. **Lessons Learned**: Explicit operational takeaways.

---

## 5. Event Deduplication & Evidence Linkage

The same operational incident often appears across multiple reports (e.g. DDR, WCR, and Mud Log). Rather than creating fragmented duplicate events, `EventDeduplicationService` computes a deterministic hash key:
```typescript
dedupKey = sha256(`${wellId}_${eventType}_${depthBucket}`).slice(0, 32);
```
When a duplicate is encountered:
1. The canonical `OperationalEvent` record is updated with any additional root-cause or mitigation details.
2. A new `HistoricalEventEvidence` record is attached:
   - `eventId`: Target event
   - `documentId`: Source report
   - `pageNumber`: Document page
   - `textExcerpt`: Raw surrounding excerpt
   - `confidence`: Extraction confidence score

This ensures every event has a multi-source audit trail of verifiable archival evidence.
