# Future WITSML & OIL eRTMAC Integration Strategy

## 1. Overview & Context
Oil India Limited's (OIL) **eRTMAC** (Real-Time Monitoring and Control Center) operates on industry-standard **WITSML** (Wellsite Information Transfer Standard Markup Language) data streams (v1.3.1.1 and v1.4.1.1) to aggregate real-time mud logging, directional surveys, and MWD/LWD sensor channels from drilling rigs across the Assam/Arunachal assets.

Stage 01 provides the `IWITSMLAdapter` interface and simulation sandbox so the core data platform never requires architectural refactoring when the live eRTMAC integration goes online.

---

## 2. Integration Architecture

```text
       OIL Drilling Rig (Assam Asset)
                   │  (WITS / Modbus)
                   ▼
      Rigsite WITSML Server (Baker Hughes / SLB / Halliburton)
                   │  (SOAP / XML over TLS)
                   ▼
       OIL Central eRTMAC Server
                   │
                   ├──► eRTMAC Real-time Displays (What is happening now)
                   │
                   └──► NWIS WITSML Adapter (What happened before in offset wells)
                             │
                             ▼
                      [NWIS Normalizer]
                             │
                             ▼
                   [Precedent Engine & Risk Alert]
```

---

## 3. Required WITSML Capabilities
When connecting to OIL's production eRTMAC instance, the production adapter will implement:

1. **`WMLS_GetCap`**: Negotiate schema versions and supported object types (`well`, `wellbore`, `trajectory`, `log`, `mudLog`).
2. **`WMLS_GetFromStore`**:
   * Retrieve well and wellbore headers.
   * Query historical survey stations (`trajectory` object).
   * Stream time-series drilling curves (`log` object: ROP, WOB, RPM, Torque, SPP, FlowRate).
3. **Real-Time Subscription**: Connect via WebSocket or interval polling to stream live surface parameters into Stage 03's real-time risk engine.
