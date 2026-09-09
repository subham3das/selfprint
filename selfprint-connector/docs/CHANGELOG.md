# Changelog - SelfPrint Connector

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.8.0] - 2026-09-09

### Added (Phase 8 — Integrate Connector Desktop UI with SelfPrint Web Platform)
- **Deep Linking Protocol (`selfprint://`)**: Registered custom URL protocol handler in Electron (`selfprint://open`, `selfprint://printers`, `selfprint://settings`, `selfprint://notifications`, `selfprint://activity`) allowing the SelfPrint Web App to launch and focus the Desktop UI directly.
- **Store Rooms Realtime Synchronization**: Implemented Socket.IO store rooms (`store:${storeId}`) broadcasting `store_connector_status`, `store_printers_updated`, `store_connector_health`, `store_printer_event`, `store_job_progress`, and `store_notification`.
- **Remote Notification Bridge**: Dual-channel notification dispatcher routing alerts to both the Store Dashboard and Connector Desktop UI simultaneously.
- **Store-to-Connector Remote Control API**: `POST /api/v1/stores/:storeId/connectors/:id/command` executing `refresh_printers`, `restart_connector`, `restart_spooler`, `pause_printer`, `resume_printer`, `test_print`, and `refresh_status`.
- **Offline Command Queueing & Self-Healing Auto-Drain**: Remote commands targeted at disconnected connectors are safely queued in memory and executed automatically upon reconnection.
- **Store Diagnostics Generator**: `GET /api/v1/stores/:storeId/connectors/:id/diagnostics` generating comprehensive downloadable JSON diagnostic reports.
- **Store Ownership Security & Audit Logging**: Enforced store ownership checks rejecting cross-tenant commands, backed by immutable audit trail logging.
- **Local API Enhancements**: Added `/diagnostics`, `/printer/control`, and `/test-print` to the local daemon REST server on port 4500.

---

## [0.7.0] - 2026-09-08

### Added (Phase 7 — SelfPrint Connector Desktop UI)
- **Modern Desktop UI Application**: Built complete Electron + React 18 + TypeScript + TailwindCSS + Framer Motion application inside `desktop/`.
- **Frameless Windows Native Titlebar**: Custom drag region, status beacon, minimize, maximize, and minimize-to-tray on close.
- **System Tray Integration**: Background tray menu with `Open Connector`, `Notifications`, `Reconnect`, `Refresh Printers`, `Restart`, and `Exit`.
- **Dashboard Page**: Displays connector online status, cloud backend link, machine credentials, spooler & CPU telemetry, recent activity preview, and quick action buttons.
- **Printers Page**: Live grid of installed printers with status badges, capabilities drawer, DPI, paper sizes, and direct controls.
- **Notifications Center**: Notification center with unread badges, severity filters, search, floating toasts, and native Windows notifications.
- **Hardware Activity Timeline**: Chronological event stream with CSV/JSON export.
- **Settings Page**: Cloud backend URL configuration, polling intervals, and Windows startup preferences.
- **About & Diagnostics Page**: Hardware identity viewer and diagnostic exporter.

---

## [0.6.0] - 2026-09-08

### Added (Phase 6 — Complete Connector Management System for SelfPrint Backend)
- **MongoDB Connector Collection**: Production schema storing hardware credentials, status, printers, and health telemetry.
- **Device Registration & Heartbeat APIs**: `POST /api/v1/connectors/register` and `POST /api/v1/connectors/heartbeat`.
- **Printer Synchronization API**: `POST /api/v1/connectors/printers/sync`.
- **Socket.IO Gateway & 60s Watchdog**: Auto-detects stale heartbeats > 60s and marks connectors OFFLINE.
- **Store Tenancy System**: One-to-many store connector mapping.

---

## [0.5.0] - 2026-09-08

### Added (Phase 5 — Production Ready Windows Service)
- **Auto Start & Windows Service Support**: Created PowerShell installers and invisible background VBS launcher.
- **Minimal System Tray Companion**: PowerShell WinForms NotifyIcon tray application.
- **Exponential Auto-Reconnect Ladder**: `[2s, 5s, 10s, 20s, 30s]` reconnect loop.
- **Offline Print Queue**: `config/offlineQueue.json` persistence.
- **Crash Recovery Manager**: `config/recovery.json` checkpoints.
- **Daily Rotating Logger**: Daily logs, 10MB split, 30-day purge.
