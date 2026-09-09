# Connector Flow & Runtime Lifecycle

> **Hardware bridge startup, printer scanning loop, print execution, and telemetry pipeline.**

---

## 🔁 Runtime Lifecycle

```text
               ┌────────────────────────┐
               │    Connector Boots     │
               │      (app.ts)          │
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │ Load Device Identity   │
               │   (connector.json)     │
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │ Scan Local Printers    │
               │  (Win32_Printer WMI)   │
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │ Start Local REST API   │
               │ (Port 4500 Diagnostic) │
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │ Connect WebSocket to   │
               │ SelfPrint Backend      │
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │ Start 15s Heartbeat    │
               │ & 30s Hardware Watcher │
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │ Await Hardware Command │ ◄──────────────────────┐
               └───────────┬────────────┘                        │
                           │                                     │
                 [ Command Arrives ]                             │
                           │                                     │
            ┌──────────────┴──────────────┐                      │
            │                             │                      │
     [ Print PDF ]               [ Spooler Control ]             │
            │                             │                      │
     Download PDF                  Pause / Resume /              │
            │                      Cancel / Restart              │
     Send to Spooler                      │                      │
            │                      Notify Backend                │
     Send Progress /                      │                      │
     Completed Telemetry                  └──────────────────────┘
            │
            └────────────────────────────────────────────────────┘
```

---

## 🔄 30-Second Hardware Watcher Cycle

1. Executes WMI printer enumeration on local host.
2. Compares with in-memory `printerCache`.
3. If changes detected:
   - Dispatches WebSocket event (`printer_added`, `printer_removed`, `printer_online`, `printer_offline`, `paper_changed`, `toner_low`, etc.).
   - Dispatches updated inventory to Backend API.
