# SelfPrint Production Connector Architecture & Integration Guide

## 1. System Architecture Overview

SelfPrint implements a zero-trust, cloud-orchestrated hardware bridging model where physical printing is strictly decoupled from browser and client applications.

```
┌────────────────────────────────────────────────────────┐
│               SelfPrint Cloud Backend                  │
│       • Single Source of Truth                         │
│       • Pairing & Ownership Authority                  │
│       • Remote Command Gateway (Socket.IO)             │
│       • Hardware Telemetry Ingestion (<15s Liveness)   │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
       REST /   │                        │ WebSocket / REST
      Socket.IO │                        │ DeviceToken Auth
                │                        │
┌───────────────▼─────────┐    ┌─────────▼───────────────┐
│     Store Dashboard     │    │   Desktop Connector     │
│       (Browser)         │    │  (Electron UI Companion)│
│  • Never calls printers │    │  • Machine Identity     │
│  • Reads state from     │    │  • Telemetry Collector  │
│    Cloud Backend        │    │  • Auto-reconnect       │
└─────────────────────────┘    └─────────┬───────────────┘
                                         │ HTTP localhost:4500
                               ┌─────────▼───────────────┐
                               │   SelfPrint Host Service │
                               │  • Windows Spooler      │
                               │  • Real Hardware Only   │
                               └─────────┬───────────────┘
                                         │ Windows Print API
                               ┌─────────▼───────────────┐
                               │    Physical Printers    │
                               │  (USB / Network / POS)  │
                               └─────────────────────────┘
```

---

## 2. Core Separation of Concerns

1. **Browser / Web App**:
   - Strictly forbidden from invoking `navigator.print()`, `window.print()`, or querying local OS printers.
   - Strictly queries the Cloud Backend (`/api/v1/connectors/status`) as the single source of truth.
   - Displays the 10-minute pairing code (`SP-XXXXXX`) to authorize physical connectors.

2. **SelfPrint Cloud Backend**:
   - Single source of truth for connector ownership, state, active telemetry, and job routing.
   - Issues 10-minute TTL pairing codes.
   - Binds a connector uniquely to a store upon successful pairing handshake.
   - Evaluates heartbeats: if last heartbeat is $< 15\text{ seconds}$, connector is `ONLINE`/`READY`; otherwise `OFFLINE`.

3. **Desktop Connector (`selfprint-connector`)**:
   - Hardware bridge running on the merchant's machine.
   - Never discovers printers directly; delegates discovery to Host Service (`localhost:4500`).
   - Gathers 10-second system telemetry (CPU, RAM, disk, spooler status, latency, real printers).
   - Reports telemetry upstream to the Cloud Backend.
   - Persists permanent `deviceToken` and `connectorId` in encrypted local storage (`localStorage`).

4. **Host Service (`localhost:4500`)**:
   - Background Windows service with direct Windows Print Spooler access (`winspool.drv` / PowerShell).
   - Filters out virtual/PDF printers (`Microsoft Print to PDF`, `OneNote`, `XPS Document Writer`).
   - Serves endpoints: `GET /health`, `GET /printers`, `POST /test-print`, `POST /calibrate`.

---

## 3. Canonical 11-State Connection State Machine

The entire ecosystem (Backend, Web Frontend, and Desktop Connector) synchronizes on the following 11 canonical states:

| State | Definition | Trigger |
|---|---|---|
| `NOT_INSTALLED` | Connector companion is not installed on the merchant PC | Default when unconfigured |
| `NOT_PAIRED` | Connector installed but not bound to any Store account | First run / unlinked |
| `PAIRING` | Merchant entered pairing code, handshake in progress | `POST /connectors/pair` |
| `AUTHENTICATING`| Connector validating permanent `deviceToken` | App launch handshake |
| `CONNECTED` | WebSocket & REST authentication verified with Cloud | Socket handshake OK |
| `HOST_RUNNING` | Connector confirmed Host Service alive on `localhost:4500` | `GET :4500/health` = 200 |
| `SCANNING` | Querying Windows spooler for physical hardware | Hardware scan requested |
| `READY` | Connected, Host running, printers verified & idle | Steady operational state |
| `RECONNECTING` | Internet dropped or socket reconnecting | Auto-backoff retry |
| `OFFLINE` | No heartbeat received for > 15 seconds | Watchdog expiry |
| `ERROR` | Hardware spooler fault or invalid device credentials | Exception state |

---

## 4. Ownership Handshake & Pairing Workflow

### Step-by-Step Flow:
1. **Store Dashboard** requests a pairing code:
   ```http
   POST /api/v1/connectors/pairing-code
   Authorization: Bearer <StoreJWT>
   ```
   Backend generates a cryptographically random 6-character code (e.g. `SP-948271`), stores it in MongoDB with a 10-minute TTL, and returns it to the Store Dashboard.

2. **Store Dashboard** displays the code:
   - Formatted as `SP-XXXXXX` with a one-click copy button and countdown indicator.

3. **Desktop Connector** merchant opens the "Pair Connector" modal and inputs `SP-XXXXXX`:
   ```http
   POST /api/v1/connectors/pair
   Content-Type: application/json

   {
     "pairingCode": "SP-948271",
     "connectorId": "conn_f8a9e201c4",
     "machineId": "BFEBFBFF000906EA",
     "hostname": "STORE-PC-01",
     "version": "1.0.0"
   }
   ```

4. **Backend Validation**:
   - Backend queries `PairingCodeModel` where `pairingCode == code`, `used == false`, and `expiresAt > now`.
   - Generates permanent `deviceToken` (`sp_dev_<64_hex_chars>`).
   - Updates or creates `ConnectorModel` permanently bound to `storeId`.
   - Marks pairing code as used (`used: true`).
   - Broadcasts `connector_paired` over Socket.IO room `store_<storeId>`.

5. **Desktop & Store Sync**:
   - Desktop Connector stores `deviceToken` and `pairedStoreName` in `localStorage`.
   - Store Dashboard automatically receives `connector_paired` and unlocks full printing capabilities.
   - On subsequent desktop restarts, the Desktop Connector auto-authenticates using `deviceToken` without user interaction.

---

## 5. Telemetry Heartbeat (10-Second Cadence)

Desktop Connector broadcasts rich diagnostic telemetry every 10 seconds:

```http
POST /api/v1/connectors/heartbeat
Authorization: Bearer <deviceToken>
Content-Type: application/json

{
  "connectorId": "conn_f8a9e201c4",
  "storeId": "651f8a9e201cb4e92a101f",
  "state": "READY",
  "system": {
    "cpuUsage": 4.2,
    "ramUsage": 48.6,
    "diskFreeGb": 124.5,
    "latencyMs": 28
  },
  "spooler": {
    "isServiceRunning": true,
    "jobsInQueue": 0
  },
  "physicalPrinters": [
    {
      "id": "Canon_LBP2900",
      "name": "Canon LBP2900",
      "status": "ONLINE",
      "paperLevel": 95,
      "tonerLevel": 80,
      "isColor": false,
      "isDuplex": false
    }
  ]
}
```

### Backend Liveness Rule:
```typescript
const isOnline = connector.lastHeartbeat && 
  (Date.now() - new Date(connector.lastHeartbeat).getTime() < 15000);
```

---

## 6. Remote Command Execution & Acknowledgement

Store Dashboard or Cloud Admin triggers remote hardware actions through the Cloud Backend:

1. **Dispatch Remote Command**:
   ```http
   POST /api/v1/connectors/command
   Authorization: Bearer <StoreOrAdminJWT>

   {
     "connectorId": "conn_f8a9e201c4",
     "action": "TEST_PRINT",
     "payload": { "printerName": "Canon LBP2900" }
   }
   ```
2. **Backend Relays via Socket.IO**:
   Backend emits `execute_command` to connector's socket room.
3. **Desktop Connector Executes & Acknowledges**:
   Desktop routes command to Host Service (`POST :4500/test-print`), then emits `command_ack` back to Backend:
   ```json
   {
     "commandId": "cmd_9941a",
     "success": true,
     "data": { "jobId": "JOB-1049" }
   }
   ```
4. **Realtime Broadcast**:
   Backend forwards acknowledgement to the Store Dashboard room.
