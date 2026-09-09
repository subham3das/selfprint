# SelfPrint Connector — Architectural & Runtime Flows

> **Sequence diagrams and flowcharts for Remote Commands, Spooler Watching, and Watcher Polling.**

---

## ⚡ 1. Remote Hardware Commands Flow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Store Owner Dashboard
    participant Backend as SelfPrint Backend
    participant Connector as SelfPrint Connector
    participant Spooler as Windows Print Spooler
    participant Printer as Physical Printer

    Note over Owner,Printer: Remote Pause Command
    Owner->>Backend: Click "Pause Printer"
    Backend->>Connector: emit('pause_printer', { printer: 'HP LaserJet' })
    Connector->>Spooler: Suspend-PrintJob -PrinterName 'HP LaserJet'
    Spooler-->>Connector: OK
    Connector->>Backend: emit('printer_paused', { printer: 'HP LaserJet' })
    Backend-->>Owner: Live Dashboard Updates (Status: PAUSED)

    Note over Owner,Printer: Remote Resume Command
    Owner->>Backend: Click "Resume Printer"
    Backend->>Connector: emit('resume_printer', { printer: 'HP LaserJet' })
    Connector->>Spooler: Resume-PrintJob -PrinterName 'HP LaserJet'
    Spooler-->>Connector: OK
    Connector->>Backend: emit('printer_online', { printer: 'HP LaserJet' })
    Backend-->>Owner: Live Dashboard Updates (Status: ONLINE)

    Note over Owner,Printer: Remote Cancel Job Command
    Owner->>Backend: Click "Cancel Job"
    Backend->>Connector: emit('cancel_job', { jobId: 'job_102', printer: 'HP LaserJet' })
    Connector->>Spooler: Remove-PrintJob -PrinterName 'HP LaserJet' -ID 102
    Connector->>Backend: emit('job_cancelled', { jobId: 'job_102' })
    Backend-->>Owner: Live Dashboard Updates (Status: CANCELLED)
```

---

## 🔄 2. Spooler Watcher & Status Polling Flow

```mermaid
flowchart TD
    Start[30s Watcher Interval / Active Spooler Timer] --> QueryWMI[Query Win32_Printer & Win32_PrintJob]
    QueryWMI --> DiffCheck{Has State Changed?}
    
    DiffCheck -- No --> Idle[Sleep till next interval]
    DiffCheck -- Yes --> EvaluateChange[Determine Change Type]
    
    EvaluateChange --> Added[Printer Added] --> EmitAdded[emit 'printer_added']
    EvaluateChange --> Removed[Printer Removed] --> EmitRemoved[emit 'printer_removed']
    EvaluateChange --> Online[Printer Online] --> EmitOnline[emit 'printer_online']
    EvaluateChange --> Offline[Printer Offline] --> EmitOffline[emit 'printer_offline']
    EvaluateChange --> PaperOut[Paper Empty] --> EmitPaper[emit 'paper_empty']
    EvaluateChange --> LowToner[Low Ink/Toner] --> EmitToner[emit 'toner_low']
    EvaluateChange --> Default[Default Changed] --> EmitDefault[emit 'default_changed']
    
    EmitAdded --> SyncBackend[POST /api/v1/connectors/printers/sync]
    EmitRemoved --> SyncBackend
    EmitOnline --> SyncBackend
    EmitOffline --> SyncBackend
    EmitPaper --> SyncBackend
    EmitToner --> SyncBackend
    EmitDefault --> SyncBackend
```
