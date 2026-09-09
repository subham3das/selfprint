# SelfPrint Connector — REST API Reference (Phase 6)

This document provides the complete API specification for connector communication and administrative management.

---

## 🔐 1. Device Registration Endpoint

### `POST /api/v1/connectors/register`
Called automatically by the connector upon initial startup to register the host machine and obtain a signed JWT `deviceToken`.

#### Request Body
```json
{
  "connectorId": "cntr_d44f4051-a32a-401d-af78-6bfa6b3bf242",
  "machineId": "mach_8189c52071137cb4",
  "hostname": "ASUSTUFF15",
  "windowsUser": "ASUS",
  "osVersion": "Windows 11 Home 23H2",
  "connectorVersion": "0.2.0"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Connector registered and authenticated successfully.",
  "data": {
    "deviceToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "connectorId": "cntr_d44f4051-a32a-401d-af78-6bfa6b3bf242",
    "machineId": "mach_8189c52071137cb4",
    "heartbeatInterval": 15000,
    "scanInterval": 30000,
    "websocketURL": "http://localhost:3000"
  }
}
```

---

## 💓 2. Connector Telemetry & Sync Endpoints
*All requests require header: `Authorization: Bearer <deviceToken>`*

### `POST /api/v1/connectors/heartbeat`
Dispatched every 15 seconds to stream health telemetry and prove liveness.

#### Request Body
```json
{
  "connectorId": "cntr_d44f4051-a32a-401d-af78-6bfa6b3bf242",
  "machineId": "mach_8189c52071137cb4",
  "uptime": 3600,
  "printerCount": 3,
  "cpuUsage": 4.5,
  "memoryUsage": {
    "totalMB": 16384,
    "freeMB": 8192,
    "processMB": 52
  },
  "diskUsage": {
    "freeGB": 120.5,
    "totalGB": 512.0
  },
  "spoolerStatus": "Running",
  "activeQueueSize": 0,
  "connectorVersion": "0.2.0"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Heartbeat acknowledged"
}
```

---

### `POST /api/v1/connectors/printers/sync`
Dispatched on boot and whenever a local hardware change is detected.

#### Request Body
```json
{
  "connectorId": "cntr_d44f4051-a32a-401d-af78-6bfa6b3bf242",
  "machineId": "mach_8189c52071137cb4",
  "printers": [
    {
      "id": "prn_epson_l3150_cde9cff16d49",
      "name": "EPSON L3150 Series",
      "driverName": "EPSON L3150 Series",
      "portName": "USB001",
      "isDefault": true,
      "isNetwork": false,
      "isShared": false,
      "status": "ONLINE",
      "isOnline": true,
      "jobsWaiting": 0,
      "colorSupport": true,
      "duplexSupport": false,
      "paperSizes": ["A4", "Letter", "Legal"],
      "trayList": ["Auto Select", "Tray 1"],
      "resolution": "5760x1440 DPI",
      "capabilities": ["COLOR", "PHOTO", "BORDERLESS"],
      "connectionType": "USB",
      "lastSeen": "2026-09-08T23:45:00.000Z"
    }
  ]
}
```

---

## 🛠️ 3. Admin & Store Management APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/connectors` | List all connectors with search, status, and store filters |
| `GET` | `/api/v1/connectors/:id` | Get full connector details by ID |
| `PATCH` | `/api/v1/connectors/:id/store` | Assign, change, or unassign store (`{ storeId: "store_123" \| null }`) |
| `PATCH` | `/api/v1/connectors/:id/status` | Override connector status (`ONLINE`, `OFFLINE`, `ERROR`) |
| `DELETE` | `/api/v1/connectors/:id` | Soft-delete / deactivate connector |
| `GET` | `/api/v1/connectors/:id/printers` | Retrieve list of installed printers for that connector |
| `POST` | `/api/v1/connectors/:id/command` | Dispatch remote command to connector over Socket.IO |
| `GET` | `/api/v1/connectors/:id/audit-logs` | Retrieve connector audit trail |

### Example: Dispatch Command (`POST /api/v1/connectors/:id/command`)
```json
{
  "command": "print_pdf",
  "payload": {
    "jobId": "job_98765",
    "fileUrl": "https://storage.selfprint.cloud/jobs/job_98765.pdf",
    "printerName": "EPSON L3150 Series",
    "copies": 2
  }
}
```
