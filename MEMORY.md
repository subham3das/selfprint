# MEMORY.md

Permanent running history and memory log for the Self-Print project.

---

## AI Development Instructions

Before making any code changes or proposing new features, every AI agent must:

1. **Read `MEMORY.md`** - Understand project state, completed work, and context.
2. **Read `ARCHITECTURE.md`** - Adhere strictly to the established system design and patterns.
3. **Read `RULES.md`** - Follow all coding standards, constraints, and practices.
4. **Read `API_CONTRACT.md`** - Ensure API endpoints, types, payloads, and responses match the contract.

> If any conflict exists between the requested changes and these files, **stop and resolve the conflict by updating documentation first**.

---

## Project Overview

**Self-Print** is a modern, automated self-service cloud and local printing ecosystem. It allows users to upload documents seamlessly via web interfaces, configure print specifications (pages, color, copies, duplex), pay (future), and dispatch print jobs securely to connected physical printing stations/agents with zero friction.

---

## Current Status

- **Phase:** Phase 2 - Store Panel Frontend Architecture & Core Pages
- **State:** Built Store Dashboard, Store QR Generation Standee Studio, and Store Live Print Queue page matching design specs with 0 TypeScript/build errors.

---

## Completed

- [x] Initialized monorepo workspace structure (`frontend/` + `backend/`).
- [x] Configured root `package.json` with npm workspaces and orchestration scripts (`dev`, `build`, `lint`, `prisma:generate`, `prisma:migrate`).
- [x] Created root `.gitignore`, `README.md`, and `LICENSE` (MIT).
- [x] Configured Frontend workspace:
  - React 19 + Vite 6 + TypeScript 5.7.
  - Tailwind CSS + PostCSS setup with custom theme variables.
  - React Router v7 configured with `AppRoutes` and `MainLayout`.
  - TanStack Query v5 configured with `queryClient`.
  - Axios configured with base URL, timeout, and authorization/error interceptors.
  - Starter UI, Lucide React icons, and utility helpers (`cn`).
  - Scalable modular folder structure (`components/`, `pages/`, `routes/`, `hooks/`, `services/`, `lib/`, `types/`, `context/`, `utils/`, `constants/`, `styles/`).
- [x] Configured Backend workspace:
  - Node.js + Express + TypeScript 5.7.
  - Prisma ORM configured with PostgreSQL provider and starter `User` model.
  - Security middlewares: Helmet, CORS, Morgan request logging.
  - Express body parsers (JSON & URL-encoded with 10MB limits).
  - Centralized error handler and 404 route middleware.
  - Standardized `ApiResponse` response format helper.
  - Health check endpoint (`GET /api/v1/health` and `GET /`).
  - Graceful shutdown handlers for SIGTERM and SIGINT.
  - Scalable modular folder structure (`config/`, `controllers/`, `routes/`, `middleware/`, `services/`, `models/`, `utils/`, `types/`, `lib/`, `database/`, `constants/`).
- [x] Generated knowledge graph via `graphify` (283 nodes, 288 edges, 32 communities).
- [x] Created permanent documentation suite (`MEMORY.md`, `ARCHITECTURE.md`, `RULES.md`, `API_CONTRACT.md`).
- [x] Verified full monorepo: installed dependencies, generated Prisma client, fixed TypeScript Vite environment types, and passed complete build (`npm run build`).
- [x] Built **Store Dashboard Page** (`frontend/src/store_pannel/pages/Dashboard.tsx`):
  - Pixel-accurate implementation matching `frontend/ui_reference/store_dashboard.png`.
  - Sidebar with printer control, summary, store switcher, and navigation.
  - Header with dynamic title, notification popover, printer status, and mobile toggle.
  - 4 top summary cards with live queue jumping.
  - Recent Queue card with interactive tabs and Job Details Modal.
  - Printer Status card with Pause/Resume toggle, Toner/Paper meters, and Printer Settings Modal.
  - Activity log, Stock Alerts, and Today's Summary breakdown cards.
  - Live auto-refresh ticker simulation.
- [x] Built **Store QR Generation Studio Page** (`frontend/src/store_pannel/pages/QRGeneration.tsx`):
  - Pixel-accurate implementation matching `frontend/ui_reference/store_pannel_qr_generation.png`.
  - Dynamic high-res QR SVG generator embedding permanent store URLs (`https://selfprint.app/store/:storeId`).
  - 6 QR Poster Templates (Default, Minimal, Rounded, Dark, Colorful, Classic).
  - QR Settings & Customization card (Store Name, Location, Upload limit, Expiry, Colors, Logo upload).
  - High-resolution A4 Print-ready Standee Poster Modal with PNG, JPG, SVG, and PDF downloads + direct print.
  - Customer mobile scanning upload kiosk simulator.
  - QR Code generation history table with action tools.
- [x] Built **User Print Progress & Completion Page** (`frontend/src/user_pannel/pages/UserProgressPage.tsx`):
  - High-fidelity animated printer machine with Framer Motion paper extrusion looping animation.
  - Live progress card with smooth progress bar, percentage calculation, live page increment counter (`Page 1 of 18` -> `Page 18 of 18`), copies tracking, and estimated time remaining countdown.
  - 4-step live print lifecycle timeline with checkmarks and active pulsing indicator.
  - Job Specifications & Receipt card (Document Name, Volume, Color & Size, Output Device, Total Paid).
  - Smooth Framer Motion transition to Success Screen with large green checkmark, confetti particle celebration burst, completion receipt summary, and 30-second auto-return countdown timer.
  - "Print More Documents" primary action button returning customer to the upload kiosk page.
  - React Router integration for `/store/:storeId/progress`, `/progress`, and `/print/progress`.

---

## In Progress

- [ ] All primary Store Panel & User Panel UI flows completed (Dashboard, QR Studio, Live Queue, History & Analytics, Settings, User Upload Kiosk, User Print Progress). Next: Backend Database schema & Real-Time Spooler Integration.

---

## Next Tasks

1. Define database models in `prisma/schema.prisma` (PrintJob, Transaction, Printer, Station, FileUpload, User, StoreConfig, StorePricing).
2. Implement backend document upload pipeline and temporary file storage integration.
3. Implement document parser / page count calculation service (PDF, DOCX, image metadata extraction).
4. Implement payment gateway integrations (Razorpay, PhonePe, Cashfree, UPI, Stripe).
5. Implement WebSocket real-time event streaming for queue, printer telemetry, and live order tracking.

---

## Decisions Made

| Date | Category | Decision | Context / Rationale |
|------|----------|----------|---------------------|
| 2026-08-24 | Architecture | Monorepo Structure | Kept frontend and backend together in one repository using npm workspaces for seamless end-to-end type safety and unified orchestration. |
| 2026-08-24 | Frontend | React 19 + Vite | Selected React 19 for modern concurrent features and Vite for instant build/HMR performance. |
| 2026-08-24 | Frontend | Tailwind CSS + Lucide | Vanilla Tailwind CSS styling for zero-runtime CSS overhead and Lucide for consistent, lightweight vector iconography. |
| 2026-08-24 | Backend | Express + TypeScript + Prisma | Express for lightweight, proven HTTP routing and Prisma with PostgreSQL for type-safe database migrations and queries. |
| 2026-08-24 | Tooling | Documentation as Source of Truth | Created 4 permanent markdown files (`MEMORY.md`, `ARCHITECTURE.md`, `RULES.md`, `API_CONTRACT.md`) to anchor all future AI development. |
| 2026-08-29 | Frontend | Standalone Store Panel Module | Built `frontend/src/store_pannel/` with dedicated sidebar layout, live tickers, real dynamic QR code generation, A4 PDF standee export, and interactive print queue management. |
| 2026-08-29 | Frontend | Zero Any TypeScript Policy | Enforced strict TypeScript interfaces across dashboard, QR studio, queue state, transaction history, and store settings. |
| 2026-08-29 | Queue | Metadata-Only Modal with Progress Timeline | Designed Queue Job Details modal with strict metadata display, no document storage/preview, and clear visual lifecycle progress timeline (Waiting -> Printing -> Completed). |
| 2026-08-29 | Finance | Strict Privacy Transaction History | Engineered Transaction History with financial metadata, payment method breakdown, SVG income charts, and export tools while strictly omitting document storage or PDF previews. |
| 2026-08-29 | Settings | Modular 3-Column Settings Layout | Built Store Settings matching UI reference with dedicated category list, inline section forms, live toggle switches, instant save state feedback, and dynamic SVG QR preview. |
| 2026-08-29 | User UX | Frictionless Zero-Login Kiosk Flow | Architected customer mobile upload flow (`frontend/src/user_pannel/`) with zero login/signup barriers, instant file drag-and-drop, real-time price calculation, and one-tap UPI payment. |
| 2026-08-29 | User UX | Real-Time Hardware Spooler Feedback | Built User Print Progress page with animated printer illustration, live page counter, lifecycle timeline, celebration confetti, and auto-return timer for high customer confidence. |

---

## Changelog

### [2026-08-24] - Initial Repository Setup
- **Added:** Monorepo root workspace files (`package.json`, `.gitignore`, `README.md`, `LICENSE`).
- **Added:** Full `frontend/` directory tree with React 19, Vite, Tailwind CSS, TanStack Query, React Router, Axios, and TypeScript configuration.
- **Added:** Full `backend/` directory tree with Express, TypeScript, Prisma (PostgreSQL), Helmet, CORS, Morgan, and modular router/controller architecture.
- **Added:** Permanent documentation suite (`MEMORY.md`, `ARCHITECTURE.md`, `RULES.md`, `API_CONTRACT.md`).

### [2026-08-29] - Complete Store Panel & User Panel Mobile Kiosk Flow
- **Added:** Store Dashboard (`/store` and `/store/dashboard`) with real-time stats, queue cards, printer status, stock alerts, and settings modals.
- **Added:** Store QR Generation Studio (`/store/qr`) with dynamic QR code creation, 6 template gallery, customization settings, A4 PDF/PNG/JPG/SVG standee export, customer mobile simulation, and QR history table.
- **Added:** Store Live Print Queue (`/store/queue` & `/store/que`) with 4 top summary cards, searchable/filterable queue table, row action menus, live printing progress card (8%), queue management actions, and job details timeline modal.
- **Added:** Store Transaction History (`/store/history` & `/store/transactions`) with 5 financial metric cards, 48-row transaction table with pagination, date range presets, filter & export modals, Daily Income SVG Area/Line Chart, Payment Method Donut chart, and Transaction Details receipt modal.
- **Added:** Store Settings Page (`/store/settings`) with 3-column layout, Category Navigation, Store Profile, Printer Configuration, Pricing Matrix, Branding & QR dropzones, Payment Settings, Preferences row, and modals for Receipt, Notifications, and About info.
- **Added:** User Panel Customer Kiosk Page (`/store/:storeId`, `/upload`, `/print`) with drag-and-drop upload zone, active file card, print configuration stepper & pills, modal selectors for page range and paper size, real-time price calculation, and UPI QR payment dialog.
- **Added:** User Print Progress Page (`/store/:storeId/progress`, `/progress`, `/print/progress`) with live animated printer illustration, progress bar, live page counter (`1/18 -> 18/18`), print lifecycle timeline, and success view with confetti and auto-return timer.
- **Improved:** User Panel Mobile Responsiveness & Native Sticky Action Bar — pinned `Pay & Print` action bar permanently to the bottom of the viewport across all screen sizes (320px–480px, tablets, desktop) with isolated content scrolling and zero vertical jumping.






