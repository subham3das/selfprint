# SelfPrint API Reference & Hardware Protocol

> **Specification of Cloud Backend Endpoints, Local REST API, and WebSocket Gateway.**

---

## 💻 1. Local Diagnostic REST API (Port 4500)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check, machine ID, uptime, and printer count |
| `GET` | `/printers` | Returns all physical/local printers detected on THIS machine |
| `GET` | `/printers/:id` | Returns specific printer metadata by ID or Name |
| `GET` | `/jobs/history` | Returns the last 100 print jobs from the in-memory circular buffer |
| `POST` | `/rescan` | Triggers an immediate local printer hardware scan |

---

## 🌐 2. Cloud Backend REST API (`/api/v1/connectors`)

- **`POST /api/v1/connectors/register`** — Registers connector and returns signed JWT `deviceToken`.
- **`POST /api/v1/connectors/heartbeat`** — Authenticated 15s heartbeat with memory, CPU, and uptime telemetry.
- **`POST /api/v1/connectors/printers/sync`** — Authenticated printer inventory sync.

---

## ⚡ 3. WebSocket Real-Time Hardware Commands & Telemetry

### 3.1 Inbound Commands from Backend (Backend ➔ Connector)
- **`print_pdf` / `new_print_job`**
  - **Payload**:
    ```json
    {
      "jobId": "job_102938",
      "fileUrl": "https://storage.selfprint.com/docs/order_102938.pdf",
      "printer": "HP LaserJet Pro MFP M428fdw",
      "copies": 2,
      "paperSize": "A4",
      "orientation": "portrait",
      "colorMode": "monochrome",
      "duplex": "single",
      "checksum": "a8f9c2...",
      "timeoutMs": 90000
    }
    ```
- **`pause_printer`** / **`pause_job`** — `{ "printer": "HP LaserJet" }`
- **`resume_printer`** / **`resume_job`** — `{ "printer": "HP LaserJet" }`
- **`cancel_job`** — `{ "jobId": "job_102938", "printer": "HP LaserJet" }`
- **`restart_printer`** — `{ "printer": "HP LaserJet" }`
- **`refresh_printers`** / **`rescan`** — `{}`

### 3.2 Outbound Telemetry from Connector (Connector ➔ Backend)
- **`job_status_update`**
  - **Payload**:
    ```json
    {
      "connectorId": "cntr_d44f4051-a32a-401d-af78-6bfa6b3bf242",
      "jobId": "job_102938",
      "status": "QUEUED | DOWNLOADING | READY | PRINTING | PAGE_PROGRESS | COMPLETED | FAILED | CANCELLED",
      "printerName": "HP LaserJet Pro MFP M428fdw",
      "currentPage": 2,
      "totalPages": 4,
      "error": null,
      "timestamp": "2026-09-08T23:30:15.000Z"
    }
    ```
- `connector_online`, `connector_offline`, `hardware_ready`, `heartbeat`, `printer_sync`, `printer_added`, `printer_removed`, `printer_updated`, `paper_changed`, `toner_low`.
