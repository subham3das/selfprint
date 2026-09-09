# SelfPrint Connector Protocol & Device Management Specification

> **Complete specification for Connector Registration, JWT Authentication, Heartbeat Telemetry, Printer Synchronization, and Backend Hardware Commands.**

---

## 🔒 1. Security & Authentication Model

1. **Pure Hardware Bridge Paradigm**:
   - The connector does not authenticate store owners, platform users, or customers.
   - The connector authenticates **strictly as a physical device** via a signed JWT `deviceToken`.
2. **Device Token Claims**:
   - `sub`: `connectorId` (UUID string)
   - `machineId`: Hardware fingerprint hash
   - `type`: `connector_device`
   - `iat`: Timestamp
3. **Transport Security**:
   - All REST API calls require: `Authorization: Bearer <deviceToken>`
   - All WebSocket handshakes require: `auth: { connectorId, machineId, token: deviceToken }`

---

## 📋 2. Registration Protocol (`POST /api/v1/connectors/register`)

When a connector starts for the first time or if its local `deviceToken` is missing or revoked:

### Request
```http
POST /api/v1/connectors/register HTTP/1.1
Host: api.selfprint.com
Content-Type: application/json

{
  "connectorId": "cntr_d44f4051-a32a-401d-af78-6bfa6b3bf242",
  "machineId": "mach_8189c52071137cb4",
  "hostname": "STORE-PC-01",
  "osVersion": "Windows_NT 10.0.26100 (x64)",
  "windowsUser": "StoreOperator",
  "connectorVersion": "0.2.0"
}
```

### Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Connector registered and authenticated successfully.",
  "data": {
    "deviceToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "connectorId": "cntr_d44f4051-a32a-401d-af78-6bfa6b3bf242",
    "machineId": "mach_8189c52071137cb4",
    "heartbeatInterval": 15000,
    "scanInterval": 30000,
    "websocketURL": "https://api.selfprint.com"
  }
}
```
*The connector persists `deviceToken` into `config/connector.json` and never asks again unless revoked.*

---

## 💓 3. Heartbeat Protocol (`POST /api/v1/connectors/heartbeat`)

Sent every 15 seconds by the connector daemon to maintain active status in the Backend and MongoDB.

### Request
```http
POST /api/v1/connectors/heartbeat HTTP/1.1
Host: api.selfprint.com
Authorization: Bearer <deviceToken>
Content-Type: application/json

{
  "connectorId": "cntr_d44f4051-a32a-401d-af78-6bfa6b3bf242",
  "machineId": "mach_8189c52071137cb4",
  "uptime": 3600,
  "printerCount": 2,
  "memoryUsage": {
    "totalMB": 16384,
    "freeMB": 8192,
    "processMB": 38
  },
  "cpuUsage": 0.4,
  "connectorVersion": "0.2.0"
}
```

### Health Timeout & Stale Detection
- If a connector fails to report a heartbeat within **60 seconds**, the Backend marks its status as `OFFLINE`.

---

## 🖨️ 4. Printer Synchronization (`POST /api/v1/connectors/printers/sync`)

Sent on startup and whenever a local printer is added, removed, renamed, or transitions state.

### Request
```http
POST /api/v1/connectors/printers/sync HTTP/1.1
Host: api.selfprint.com
Authorization: Bearer <deviceToken>
Content-Type: application/json

{
  "connectorId": "cntr_d44f4051-a32a-401d-af78-6bfa6b3bf242",
  "machineId": "mach_8189c52071137cb4",
  "printers": [
    {
      "id": "prn_hp_laserjet_pro_84a9e2",
      "name": "HP LaserJet Pro MFP M428fdw",
      "driverName": "HP LaserJet Pro MFP M428-M429 PCL-6",
      "portName": "192.168.1.150",
      "manufacturer": "HP",
      "model": "LaserJet Pro MFP M428fdw",
      "isDefault": true,
      "isNetwork": true,
      "isShared": false,
      "status": "ONLINE",
      "isOnline": true,
      "jobsWaiting": 0,
      "colorSupport": true,
      "duplexSupport": true,
      "paperSizes": ["A4", "A3", "Letter", "Legal"],
      "trayList": ["Auto Select", "Tray 1", "Tray 2"],
      "resolution": "1200x1200 DPI",
      "capabilities": ["Copies", "Color", "Duplex"],
      "connectionType": "NETWORK",
      "ipAddress": "192.168.1.150",
      "mac": "00:1E:C9:8A:2F:10",
      "serialNumber": "VNB3K08492",
      "lastSeen": "2026-09-08T23:15:00.000Z"
    }
  ]
}
```

---

## ⚡ 5. Real-time WebSocket Protocol

### 5.1 Outbound Telemetry (Connector ➔ Backend)
- `connector_online`: Emitted immediately upon successful socket connection.
- `connector_offline`: Emitted on graceful shutdown.
- `hardware_ready`: Emitted with full printer inventory snapshot.
- `heartbeat`: Recurring telemetry payload every 15s.
- `printer_sync`: Emitted on printer set changes.
- `printer_added`, `printer_removed`, `printer_updated`: Granular hardware changes.
- `job_started`, `job_progress`, `job_completed`, `job_failed`, `job_cancelled`: Live spooler execution progress.

### 5.2 Inbound Hardware Commands (Backend ➔ Connector)
- `print_pdf` / `new_print_job`: Payload `{ jobId, printer, pdfUrl, options }`
- `pause_printer`: Payload `{ printer }`
- `resume_printer`: Payload `{ printer }`
- `cancel_job`: Payload `{ printer, jobId }`
- `restart_printer`: Payload `{ printer }`
- `refresh_printers` / `rescan`: Requests immediate hardware scan
- `get_printer_info`: Requests metadata for target printer
- `get_printer_status`: Requests status for target printer
- `update_config`: Payload `{ settings }`
- `restart_connector`: Restarts daemon process
- `ping`: Keepalive check, responded with `pong`
