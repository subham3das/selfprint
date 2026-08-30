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
- **Added:** High-performance 300-frame synchronized printer animation engine (`PrinterFramePlayer.tsx`) playing exact page-by-page print cycles without debug overlays, smoothly transitioning to the completion screen upon final page print.
- **Added:** Visual PDF Page Thumbnail Selector (`PdfPageThumbnailGallery.tsx`) with PDF.js-powered lazy rendering, Blinkit/Google Photos-style horizontal snap carousel, individual circular checkboxes, multi-page selection, Quick Actions (`Select All`, `Clear All`, `Odd Pages`, `Even Pages`, `Invert`), and instant price calculation based strictly on selected pages.
- **Added:** Animated Segmented Control for Color Mode selection (`Black & White` vs `Color`) with Framer Motion spring indicator and disabled button protection for 0 selected pages.
- **Added:** Split-View Full PDF Preview & Per-Page Customizer Modal (`PdfPreviewModal.tsx`) occupying ~90% screen, with large vertically scrollable PDF reader view on the left, tap-to-toggle `🟣 Color ↔ ⚪ Black & White` per-page modes, inclusion checkboxes, Quick Actions (`Select All`, `B&W All`, `Color All`, `Clear All`, `Invert`), live mixed-mode pricing engine, and streamlined "Tap to Preview" card on the main upload screen.
- **Redesigned:** Minimalist Apple PDF Viewer Modal (`PdfPreviewModal.tsx`) — removed all complex multi-action controls, statistics, and vertical lists; provides an ultra-focused single-page reading experience occupying maximum modal height with touch/drag horizontal swipe navigation (`< Previous`, `Page X of Y`, `Next >`), dedicated per-page `○ Black & White ↔ ● Color` segmented toggle, and clean bottom summary with `Apply Changes`.
- **Refined:** High-Resolution Large-View PDF Reader (`PdfPreviewModal.tsx` & `usePdfThumbnailGenerator.ts`) — preview expanded to 80–85% of modal height with high-definition rendering (scale 1.8 / 600x848 A4 canvas), floating 26px top-right circular selection checkboxes, subtle top-left mode badges (`⚪ B&W` / `🟣 Color`), iOS-like fluid spring swipe transitions (`stiffness: 260, damping: 28`), and a streamlined two-button sticky bottom toolbar (`Black & White` | `Color Print`) supporting single and multi-page batch mode assignment with auto-clearing selection.
- **Implemented:** Complete End-to-End Interactive Logic for PDF Preview — integrated persistent `pages = [{ page, selected, mode }]` array data model, animated 28px circular checkbox with checkmark spring scale, working `‹ Previous` / `Next ›` buttons and drag gestures, instant reactive B&W/Color badge updating without re-rendering PDF canvas, disabled button state when 0 pages are selected (`opacity-40 pointer-events-none`), and instant batch mode assignment with automatic selection clearing.
- **Fixed:** PDF Preview Interaction & Selection Reactivity — resolved parent re-render dependency loop that previously reset local selection state on click; enabled instant click selection on both top-right check circle and card body, smooth horizontal drag & navigation, and responsive toolbar actions.
- **Improved:** Continuous Preloaded Carousel Slider Track — replaced unmount/remount transitions with a continuous side-by-side preloaded carousel slider track (`transform: translateX`), eliminating unmount lag, blank rendering flashes, and reload delays during horizontal page transitions for instantaneous 60fps sliding.
- **Added:** Auto-Close Workflow on Mode Selection — tapping `Color Print` or `Black & White` immediately applies the selected mode to the chosen page(s), syncs the updated job configuration and live price to the main screen, and automatically closes the preview modal for a fast single-action workflow.
- **Engineered:** Native CSS Snap Carousel with Fluid Auto-Scroll — replaced transform-drag with native hardware-accelerated CSS snap carousel (`scroll-snap-type: x mandatory`), eliminating rubberband bounce-backs, jerky resistance, and stuck swipes for 100% natural touch/trackpad gestures and auto-centering alignment.
- **Enhanced:** Permanent Color/B&W Mode Memory & Re-selection — whenever the preview modal is re-opened, every page restores its previously configured mode with vibrant visual styling (`🟣 Color` badge with purple card glow vs `⚪ B&W` badge with slate border), allowing users to easily review, change, unselect, or re-assign print modes at any time.
- **Implemented:** Direct Tick $\longleftrightarrow$ Color Mode Equivalence — the top-right purple checkmark directly indicates Color mode. Tapping a Color page (ticked) removes the checkmark and reverts it to B&W; tapping a B&W page (unticked) adds the purple checkmark and converts it to Color; all checkmarks persist upon re-opening the preview.
- **Fixed:** Viewport Position Reset on Unselect — resolved state sync side-effect that previously reset `currentPage` and `scrollLeft` to Page 1 whenever a page on later slides was tapped/unselected; user now remains exactly on their currently viewed page without unexpected jumping.
- **Streamlined:** Single Primary "Color Print" Action Toolbar — simplified the bottom bar to a single full-width "Color Print" button; all unselected pages default to Black & White automatically, while selected pages print in Color with live badge counts (e.g. `Color Print (1)`).
- **Added:** Preview Guidance Note Banner — added a top note banner (`"Select pages you want to Color Print (other pages remain Black & White)"`) guiding users clearly through the page selection flow.
- **Built:** Super Admin Management Dashboard (`/admin` and `/admin/dashboard`) — desktop-first modular dashboard inside `frontend/src/admin_pannel/` recreated to match `frontend/ui_reference/admin_dashboard.png`:
  - **Sidebar:** Dark navy theme with logo, 9 primary navigation items with purple active states, Logout action, and "Self Print Platform" 3D card box.
  - **Header:** Welcome greeting, global search with `⌘K` badge, notification bell with `12` badge and popover, date filter dropdown (`29 May 2025`), Super Admin profile with live green status indicator, and last updated live timestamp.
  - **12 Statistics Cards Grid:** Total Stores (58), Active Stores (46), Offline Stores (12), Total Users (1,248), Today's Orders (356), Orders in Progress (72 Live), Completed Orders (284), Failed Orders (8), Today's Revenue (₹24,560), Monthly Revenue (₹6,45,230), Platform Commission (₹64,523), and Avg. Order Value (₹68.90).
  - **Revenue Overview:** Interactive purple cubic-bezier SVG area/line chart (₹1,45,230, ↑18.6%) with hover tooltips and time range selector.
  - **Live Print Activity:** Real-time print queue feed with store status badges, file names, page progression, and color chips.
  - **Top Performing Stores:** Multi-column store metrics table (Revenue, Orders, Commission, Online/Busy status pills).
  - **Recent Transactions:** Comprehensive transactions ledger with transaction IDs, amounts, commissions, payment methods, and status badges.
  - **Platform Analytics:** 4 Donut SVG charts (Print Type: 62% B&W vs 38% Color; Paper Size: 72% A4, 18% A3, 10% Other; Most Used Printers: 45% HP, 30% Canon, 25% Epson; Peak Hours: 48% 10AM-1PM, 35% 1PM-6PM, 17% Others).
  - **System Alerts & Recent Users:** Dedicated cards for hardware/store warnings (Low Paper, Printer Offline, Payment Failures) and active customer avatars with live activity timestamps.
- **Built:** Super Admin Store Management Page (`/admin/stores`) — desktop-first store management system matching `frontend/ui_reference/admin_store.png`:
  - **Header & Breadcrumb:** Dynamic title (`Stores`), breadcrumb (`Dashboard > Stores`), and centralized header controls.
  - **6 Top Statistics Cards:** Total Stores (`58`, 100%), Active Stores (`46`, ↑79.3%), Offline Stores (`12`, ↓20.7%), Pending Approval (`4`, 6.9%), Suspended Stores (`2`, 3.4%), and Total Cities (`23`, Across all stores).
  - **Multi-Filter & Search Bar:** Real-time multi-field search (store name, owner name, email, phone, city, ID code), Status filter (`Online`, `Busy`, `Offline`, `Pending`, `Suspended`), City filter, Subscription Plan filter (`Basic`, `Pro`, `Enterprise`), Reset button, and `+ Add New Store` button.
  - **10-Column Stores Table:** Store profile (avatar, name, email), Owner details (name, phone), City/State, Plan badge, Orders count, Total Revenue, Platform Commission, Status badge, Last active timestamp, and interactive Action buttons (`View`, `Edit`, `More Menu`).
  - **Full Store Management Modals:** Reusable animated modal suite for `View Store Details`, `Edit Store Properties`, and `Register New Store` with auto-generated Store ID codes and full validation.
  - **Pagination & Page Sizing:** Dynamic page numbers with active indicators, previous/next buttons, and rows-per-page selector (8, 10, 20, 50).
- **Built:** Super Admin Users Management Page (`/admin/users`) — desktop-first user directory and lifecycle management matching `frontend/ui_reference/admin_user.png`:
  - **Header & Breadcrumb:** Dynamic title (`Users`), breadcrumb (`Dashboard > Users`), global search (`⌘K`), notifications bell (`12`), date selector (`29 May 2025`), and admin profile status.
  - **6 Top Statistics Cards:** Total Users (`1,248`, ↑15.3%), Active Users (`896`, ↑18.7%), New Users Today (`48`, ↑12.5%), Verified Users (`1,102`, 88.3%), Banned Users (`14`, ↓6.7%), and Users Online (`124`, Live right now).
  - **Multi-Filter & Real-Time Search Bar:** Real-time search (name, email, phone, store, city), Status filter (`Active`, `Inactive`, `Blocked`, `Banned`, `Pending`, `Verified`), Store filter, City filter, Membership Plan filter (`Basic`, `Pro`, `Enterprise`, `Student`), Reset button, and CSV Export button.
  - **10-Column Users Table:** User avatar, name & email, phone number, primary store, city & state, total orders count, total spent formatted (`₹2,450.00`), colored status pill, joined date (`22 Apr 2025`), last active timestamp (`● 2 mins ago`), and action buttons (`View`, `Edit`, `More`).
  - **Interactive Modals:** Detailed User Profile Modal (account stats, color vs B&W prints breakdown, recent orders history, personal details) and Edit User Modal (profile and status modifications).
  - **Pagination & Page Sizing:** Dynamic page numbers with active indicators, previous/next controls, and rows-per-page selector (10, 20, 50, 100).
- **Built:** Super Admin Transactions Management Page (`/admin/transactions`) — desktop-first payments and ledger management matching `frontend/ui_reference/admin_transaction.png`:
  - **Header & Breadcrumb:** Dynamic title (`Transactions`), breadcrumb (`Dashboard > Transactions`), global search (`⌘K`), notifications bell (`12`), date selector (`29 May 2025`), and admin profile status.
  - **6 Top Statistics Cards:** Total Transactions (`12,846`, ↑16.8%), Successful Transactions (`12,085`, ↑17.4%), Pending Transactions (`356`, ↑8.2%), Failed Transactions (`405`, ↓5.6%), Total Amount (`₹25,68,450`, ↑18.9%), and Total Commission (`₹2,56,845`, ↑19.6%).
  - **Multi-Filter & Real-Time Search Bar:** Search by transaction ID, store, customer, or amount; Status filter (`Success`, `Pending`, `Failed`, `Refunded`, `Cancelled`), Store filter, Payment Method filter (`UPI`, `PhonePe`, `Google Pay`, `Paytm`, `Razorpay`, `Cash`), Date Range preset picker (`01 May 2025 - 29 May 2025`), Reset button, and Export dropdown (`CSV`, `Excel`, `PDF`).
  - **11-Column Transactions Table:** Transaction ID with copy button, Store badge with city, Customer avatar & email, Order type pill (`Color Print` / `B&W Print`), Pages printed, Amount in INR, Platform Commission, Payment method logo/badge, Status pill, Date & time, and Action menu.
  - **Interactive Modals:** Detailed Transaction View Modal (transaction metadata, print parameters, paper size, printer hardware, payment gateway ref, and timeline) and Refund Processing Modal (instant refund disbursement simulation).
  - **Pagination & Page Sizing:** Dynamic page numbers with active indicators, previous/next controls, and rows-per-page selector (10, 20, 50, 100).
- **Built:** Super Admin Revenue Analytics Page (`/admin/revenue`) — desktop-first financial intelligence platform matching `frontend/ui_reference/admin_revenue.png`:
  - **Header & Breadcrumb:** Dynamic title (`Revenue`), breadcrumb (`Dashboard > Revenue`), global search (`⌘K`), notifications bell (`12`), date range selector (`01 May 2025 - 29 May 2025`), and admin profile status.
  - **6 Top KPI Cards:** Total Revenue (`₹25,68,450`, ↑18.7%), Platform Commission (`₹2,56,845`, ↑19.6%), Total Transactions (`12,846`, ↑16.8%), Average Order Value (`₹199.80`, ↑6.3%), Refunds & Adjustments (`₹48,650`, ↓4.5%), and Net Revenue (`₹25,19,800`, ↑19.1%).
  - **Multi-Filter Bar:** Time Period dropdown (`Today`, `This Week`, `This Month`, `Last Month`, `This Year`, `Custom`), Store dropdown, City dropdown, Revenue Type dropdown (`All Revenue Types`, `Print Services`, `Subscription Plans`, `Membership Fees`, `Other Services`), Reset button, and Export dropdown (`CSV`, `Excel`, `PDF`, `Monthly Summary Report`).
  - **3 Core Visual Analytics Charts:**
    - **Revenue Overview Curve:** Interactive SVG cubic-bezier line and gradient area chart with segmented `Daily`, `Weekly`, and `Monthly` timeframe tabs, total revenue badge (`₹25,68,450`, ↑18.7% vs last month), dotted gridlines, and hover tooltips.
    - **Revenue by Category Donut:** Donut chart with center total amount (`₹25,68,450`) and legend for Print Services (`64.0%`), Subscription Plans (`16.6%`), Membership Fees (`8.4%`), and Other Services (`11.0%`).
    - **Revenue by Payment Method Donut:** Donut chart with center total amount (`₹25,68,450`) and legend for UPI (`48.5%`), Card Payments (`26.7%`), Wallets (`13.4%`), Net Banking (`8.2%`), and Cash (`3.2%`).
  - **3 Regional & Operational Performance Tables:**
    - **Top Performing Stores Table:** Store avatar with initials, store name, city/state, revenue, transaction count, and commission.
    - **Top Cities by Revenue Table:** City/state, revenue with purple gradient horizontal progress bars, and transaction volume.
    - **Recent Revenue Transactions Table:** Transaction ID, store name, customer amount, platform commission, status badge, and date/time.
- **Built:** Super Admin Printers Management Page (`/admin/printers`) — desktop-first hardware terminal and fleet telemetry management matching `frontend/ui_reference/admin_printers.png`:
  - **Header & Breadcrumb:** Dynamic title (`Printers`), breadcrumb (`Dashboard > Printers`), global search (`⌘K`), notifications bell (`12`), date selector (`01 May 2025 - 29 May 2025`), and admin profile status.
  - **6 Top KPI Cards:** Total Printers (`542`, 100%), Online Printers (`418`, 77.1% of total, ↑12.4%), Busy Printers (`76`, 14.0% of total, ↑5.6%), Offline Printers (`38`, 7.0% of total, ↓3.2%), Maintenance (`10`, 1.8% of total, ↓1.3%), and Total Prints This Month (`24,856`, ↑18.7%).
  - **Multi-Filter Bar:** Real-time search (`printer name, ID, store or location`), Status filter (`All Status`, `Online`, `Busy`, `Offline`, `Maintenance`, `Error`), Store filter, City filter, Printer Engine Type (`All Types`, `Laser`, `Inkjet`), Reset button, and `+ Add New Printer` action button.
  - **8-Column Fleet Table:** Printer thumbnail & ID with one-click copy, Store profile with colored logo badge, Location area & floor, Engine type pill (`Laser` / `Inkjet`), Status badge (`● Online`, `● Busy`, `● Offline`, `● Maintenance`), Monthly print volume with trend, Last active relative timestamp, Circular health gauge (e.g. `92%`, `78%`, `20%`), and Quick Actions.
  - **Interactive Modals Suite:** Detailed View Printer Modal (network telemetry, consumables supply gauges, and lifetime metrics), Register New Printer Modal, Edit Printer Modal, and Hardware Diagnostic Test Print Modal (Page, CMYK Color, Alignment, Nozzle test).
  - **Pagination & Page Sizing:** Dynamic page numbers with active indicators, previous/next controls, and rows-per-page selector (8, 10, 20, 50).
- **Built:** Super Admin Support Management Page (`/admin/support`) — desktop-first support ticket helpdesk, resolution pipeline, and telemetry intelligence platform matching `frontend/ui_reference/admin_support.png`:
  - **Header & Breadcrumb:** Dynamic title (`Support`), breadcrumb (`Dashboard > Support`), global search (`⌘K`), notifications bell (`12`), date selector (`01 May 2025 - 29 May 2025`), and admin profile status.
  - **6 Top KPI Cards with Sparklines:** Total Tickets (`1,248`, ↑12.8%), Open Tickets (`256`, ↑8.4%), In Progress (`162`, ↓4.3%), Resolved Tickets (`742`, ↑15.6%), Closed Tickets (`488`, ↑10.7%), and Customer Satisfaction Rate (`4.8 / 5`, ↑6.5%) with interactive SVG sparklines.
  - **Multi-Filter Toolbar:** Real-time search by ticket ID, subject, customer, or email; Status dropdown (`Open`, `In Progress`, `Pending`, `Resolved`, `Closed`), Category dropdown (`Technical`, `Billing`, `Refund`, `Print Quality`, `Account`, `General`), Priority dropdown (`Low`, `Medium`, `High`, `Critical`), Source dropdown (`QR Portal`, `Web App`, `Email`, `WhatsApp`), and Reset button.
  - **9-Column Support Ledger Table:** Monospace Ticket ID (`TKT-250529-1248`) with one-click copy, Subject preview, Customer avatar & email, Category pill, Priority badge, Status pill, Assigned Admin with profile picture, Created timestamp, and Action menu.
  - **3 Dedicated Right Sidebar Cards:**
    - **Support Overview:** Interactive donut chart with center total (`1,248`, `Total Tickets`) and legend for Open (`20.5%`), In Progress (`13.0%`), Pending (`7.9%`), and Resolved (`59.6%`).
    - **Recent Activities:** Live audit log feed tracking creations, admin assignments, status transitions, and customer feedback.
    - **Top Issue Categories:** Visual breakdown with purple gradient progress bars for Technical (`43.4%`), Billing & Payments (`26.3%`), Print Quality (`15.1%`), Account (`8.2%`), and Others (`7.0%`).
  - **Interactive Modals Suite:** Comprehensive View Ticket Modal with chat history timeline & instant reply, Reply Modal with quick response templates, and Assign Ticket Modal with priority selector.
  - **Pagination & Page Sizing:** Numbered page buttons with active indicators, previous/next controls, and rows-per-page selector (10, 20, 50).
- **Built:** Super Admin Analytics Page (`/admin/analytics`) — production-level enterprise analytics dashboard matching `frontend/ui_reference/admin_analytics.png`:
  - **Header & Breadcrumb:** Dynamic title (`Analytics`), breadcrumb (`Dashboard > Analytics`), global search (`⌘K`), notifications bell (`12`), date range selector (`01 May 2025 - 29 May 2025`), and admin profile status.
  - **6 Top KPI Cards with Sparklines:** Total Print Jobs Today (`12,846`, ↑18.6%), Total Pages Printed (`78,542`, ↑16.3%), Average Print Time (`24.6 sec`, ↓8.4%), Printer Efficiency (`92.4%`, ↑7.2%), Peak Usage Time (`11:00 AM`, Today's peak hour), and System Uptime (`99.68%`, ↑0.15%) with smooth SVG sparklines.
  - **Printing Activity Multi-Stream Chart:** Interactive cubic-bezier curve and area chart with segmented `Day`, `Week`, `Month`, `Year` timeframe tabs, dual Y-axes (Pages/Orders vs Revenue ₹), and hover tooltip (e.g. `27 May 2025`: Pages `14,652`, Orders `1,248`, Revenue `₹45,230`).
  - **Platform Health Telemetry Card:** 98% Overall Health circular progress gauge, Server Health (98% progress bar), API Status (● Online), Database (● Healthy), Storage Used (62% progress bar), Active Connections (1,256), and Today's Errors (12).
  - **7x24 Printing Activity Heatmap:** 7 days (Mon-Sun) × 24 hours grid with color intensity scaling and hover tooltips for job distribution insights.
  - **5 Operational Breakdown Cards:**
    - **Top 10 Stores by Performance Table:** Ranked 1..10 with colored logo badges, Store names, Orders, Revenue (₹), and Growth %.
    - **Most Used Paper Sizes:** Horizontal progress bars for A4 (52.4%), Legal (21.2%), Letter (14.8%), A3 (7.4%), B5 (2.8%), and Others (0.9%).
    - **Print Type Distribution Donut:** 78,542 Total Prints with legend for Black & White (52.3%), Color (27.6%), Poster (9.8%), Photo (6.5%), and Label (3.8%).
    - **Printer Status Distribution Donut:** 542 Total Printers with legend for Online (77.1%), Busy (14.0%), Offline (5.2%), and Maintenance (1.8%).
    - **Recent Platform Events:** Live timeline feed tracking printer offline alerts, store registrations, revenue milestones, and large print jobs.
- **Built:** Super Admin Settings Page (`/admin/settings`) — comprehensive platform administration and system preferences suite matching `frontend/ui_reference/admin_settings.png`:
  - **Header & Breadcrumb:** Dynamic title (`Settings`), breadcrumb (`Dashboard > Settings`), global search (`⌘K`), notifications bell (`12`), date selector (`01 May 2025 - 29 May 2025`), and admin profile status.
  - **Top Horizontal Navigation Tabs:** General, Platform, Stores, Users, Printing, Security, Notifications, Billing, Integrations, and System with active indicator underline.
  - **Left & Middle Configuration Cards:**
    - **General Settings Card:** Platform Name, Platform Tagline, Time Zone picker, Date Format selector, Currency dropdown, and Language with instant Save Changes.
    - **Contact Information Card:** Support Email, Support Phone, and multiline Company Address with Save Changes.
    - **Email Settings Card:** From Email, From Name, Email Provider (Gmail SMTP) with logo, and Email Notifications toggle switch.
    - **System Preferences Card:** Allow New Store Registration toggle, Auto Approve Stores toggle, Maintenance Mode toggle, Enable Captcha toggle, and Default Store Status dropdown.
    - **Session Settings Card:** Session Timeout, Remember Me Duration, Maximum Login Attempts, and Lockout Duration.
  - **Right Sidebar Telemetry & Security Cards:**
    - **System Overview:** Platform Version (`v2.4.1`), Environment (`Production`), Database Status (`● Connected`), Storage Usage progress bar (`62%`), Active Users (`10,428`), Total Stores (`248`), and Total Printers (`542`).
    - **Integrations Card:** Razorpay (Connected), SendGrid (Connected), Firebase (Connected), Cloudinary (Pending), and Manage Integrations action.
    - **Danger Zone Card:** Clear Cache, Reset All Settings, and Delete Platform Data actions with security confirmation dialogs.
- **Built:** Super Admin Access Control System (`/admin/access`, `/admin/access-control`) — enterprise Role-Based Access Control (RBAC) platform and staff directory with granular permission matrix & strict Super Admin security rules:

  - **Permanent Super Admin Protection:** Hardcoded `das01subhamj@gmail.com` as the immutable root Super Admin. This account has full permissions across all 12 modules and cannot be deleted, suspended, demoted, edited, or locked. Dangerous actions are hidden in the UI and protected at state level with distinct `SUPER ADMIN` gradient badge.
  - **Header & Breadcrumb:** Dynamic title (`Access Control`), breadcrumb (`Dashboard > Access Control`), global search (`⌘K`), notifications bell (`12`), date selector (`01 May 2025 - 29 May 2025`), and admin profile status.
  - **6 Top KPI Cards:** Total Staff (`56`), Active Staff (`48`), Platform Admins (`11`), Managers (`20`), Support Staff (`25`), and Pending Invites (`3`).
  - **Multi-Filter Toolbar:** Realtime search by name, email, role, or department; dropdowns for Role (`Super Admin`, `Admin`, `Manager`, `Finance`, `Operations`, `Support`), Status (`Active`, `Inactive`, `Suspended`, `Pending Invitation`), Department filter, Reset button, Audit Logs button, and `+ Invite Staff` action button.
  - **9-Column Staff Ledger Table:** Avatar with initials/gradient, Full Name & phone, Monospace Email with one-click copy, RoleBadge, Department, StatusBadge with animated indicator, Last Login timestamp, Created By, Permissions Summary chip (e.g. `12/12 Modules`), and AccessActionMenu with action protection.
  - **Interactive 12x7 Permission Matrix:** Granular matrix controlling 12 Modules (Dashboard, Stores, Users, Transactions, Revenue, Printers, Support, Analytics, Settings, Access Control, Audit Logs, System Configuration) across 7 Actions (View, Create, Edit, Delete, Export, Approve, Manage) with Role Templates presets (Admin, Manager, Finance, Support) and Select All / Clear shortcuts.
  - **Interactive Modals Suite:**
    - **Invite Staff Modal:** Full Name, Email, Phone, Role selector, Department, Send Email Invite checkbox, Generate Temp Password checkbox, and embedded Permission Matrix.
    - **Edit Staff Modal:** Realtime editing of staff metadata, role, status, and permissions (with Super Admin guard).
    - **View Staff Modal:** Profile telemetry cards, contact info, and read-only permission matrix.
    - **Audit Logs Modal:** Searchable security ledger tracking user creation, permission adjustments, role transitions, account suspensions, and logins with IP address & status tags.
  - **Pagination & Page Sizing:** Numbered page buttons with active indicators, previous/next controls, and rows-per-page selector (10, 20, 50).
- **Built:** Super Admin Audit Logs System (`/admin/audit-logs`, `/admin/audit`) — enterprise security, telemetry & activity history ledger matching AWS Console, Firebase, Stripe, and Azure Portal standards:
  - **Access & Immutability Rules:** Hardcoded `das01subhamj@gmail.com` as the root Super Admin with unconditional view access. Read-only, append-only, filterable, searchable, and exportable ledger with zero edit/delete capabilities.
  - **Header & Breadcrumb:** Dynamic title (`Audit Logs`), subtitle (`Complete security, activity and system event history.`), breadcrumb (`Dashboard > Audit Logs`), global search (`⌘K`), notifications bell (`12`), date selector (`01 May 2025 - 29 May 2025`), and admin profile status.
  - **6 Top KPI Cards:** Total Logs Today (`24,850`, `+12.4% vs yesterday`), Failed Login Attempts (`18`, `+4 in last hour`), Permission Changes (`14`, `+2 today`), Critical Events (`6`, `-20% vs last week`), Active Sessions (`142`, `Across 14 regions`), and Security Alerts (`3`, `1 IP blocked`) with custom SVG sparkline curves.
  - **Advanced Multi-Filter Toolbar:** Realtime search (`user, email, IP, action, module, session`), Module filter (15 modules), Severity filter (`Info`, `Success`, `Warning`, `Critical`, `Security`), Status filter (`Completed`, `Failed`, `Blocked`, `Pending`), View Mode switch (`Table`, `Timeline`, `Heatmap & Map`), Auto-Refresh interval selector (`OFF`, `30s`, `1m`, `5m`), Reset button, and Export dropdown (`CSV`, `Excel`, `PDF`, `JSON`).
  - **10-Column Audit Table:** Timestamp & relative age, Actor profile avatar with name & email, ActionBadge, Module pill, Target Resource, IP & Geolocation, SeverityBadge, StatusBadge, and row-click inspection.
  - **Interactive 3 View Modes:**
    - **Dense Table View:** Paginated ledger with quick inspect drawers.
    - **Chronological Timeline View:** Visual vertical event stream grouped by `Today`, `Yesterday`, `This Week`, and `Earlier`.
    - **Security Analytics & Heatmap View:** 7×24 hourly activity & risk intensity heatmap with hover tooltips + Regional Login & Session Telemetry distribution widget.
  - **Slide-Over Event Details Drawer (`AuditDrawer.tsx`):** Detailed view of complete event telemetry, network/client info, before-and-after state diff viewer, raw JSON request payload viewer with copy-to-clipboard, execution time (ms), and JSON export.
  - **Right Sidebar Telemetry:** Security Summary widget (Critical alerts, failed logins, permission changes, top active admins) + Realtime Live Activity Feed with animated pinging indicator.
- **Built:** Super Admin & Staff Login Page (`/admin/login`) — ultra-clean, minimal, modern authentication portal styled after Stripe, Linear, Notion, and Vercel:
  - **Email-Only Passwordless Verification:** Single email input field with no passwords, no OTP, no username, no social login, no signup, and no forgot password.
  - **Strict Access Verification:** Verifies submitted email against authorized administrator directory (`SUPER_ADMIN_EMAIL` and `INITIAL_STAFF_MOCK`). Grants instant access for authorized staff; blocks unauthorized visitors with clear *"Access Denied"* message.
  - **Form Validation & Tech Stack:** Built with React, TypeScript, TailwindCSS, React Hook Form, and Zod (`loginSchema`) for strict client-side validation.
  - **Animations & Micro-interactions:** Framer Motion card fade/scale entrance, input focus glow, error shake animation on rejection, and button hover lift with loading spinner / success checkmark.
  - **Quick Test Credential Chips:** Fast 1-click test buttons for Super Admin (`das01subhamj@gmail.com`), Admin (`ananya.sharma@selfprint.com`), and Unauthorized demo.
- **Built:** Store Partner Onboarding Flow (`/store/onboarding/*`) — end-to-end partner registration suite inspired by Stripe, Shopify, Razorpay, and Notion:
  - **Sticky Top Progress Stepper:** 3-step interactive progress header (1. Store Details, 2. Bank Details, 3. Finish) with animated checkmarks, active glowing indicators, and jump-back navigation on completed steps.
  - **Screen 0: Welcome Screen (`/store/onboarding/welcome`):** Clean hero badge, bold headline, 6 partner benefits grid (QR Printing, Auto Order Queue, Live Transactions, Daily Revenue, Printer Management, Customer Analytics), and primary `Get Started` action.
  - **Step 1: Store & Owner Details (`/store/onboarding/details`):** Comprehensive shop metadata collection (Store Name, Owner Name, Address, City, State, 6-digit PIN, 10-digit Phone, Email, optional GSTIN, Password, Confirm Password) + Drag-and-drop Store Image Upload component with preview and quick presets.
  - **Default Login Rule Info Card:** Clear policy banner explaining that Email is the default Login ID and Phone Number is the initial Password for shop owners.
  - **Step 2: Bank & Payout Information (`/store/onboarding/bank`):** Settlement bank account details (Account Holder, Bank Name with popular bank autocompletes, Account Number, Confirm Account Number, 11-character Indian IFSC validation, Branch Name, optional UPI ID).
  - **Step 3: Review & Confirmation (`/store/onboarding/review`):** Clean modular review cards with photo preview, masked account numbers, section-wise edit triggers, and legal agreement checkbox.
  - **Success Screen (`/store/onboarding/success`):** Celebratory animated checkmark, Store ID tag, 4 activation cards (Store Created, Dashboard Ready, QR Ready, Account Activated), and a 5-second countdown with auto-redirect to `/store/dashboard`.
  - **Validation & State Engine:** React Hook Form + Zod (`storeDetailsSchema`, `bankDetailsSchema`), async `storeOnboarding.service.ts` API registration, and session persistence in `localStorage`.
- **Built:** Store Partner Login Page (`/store/login`) — dedicated authentication portal for shop owners consistent with onboarding design language:
  - **Credentials Flow:** Email Address (Login ID) + Account Password (created during onboarding or default phone number).
  - **Form Validation & Tech Stack:** React Hook Form + Zod (`storeLoginSchema`) with validation for required email, email format, and required password.
  - **API Contract:** Added `POST /api/v1/store/login` endpoint specification to `API_CONTRACT.md`.
- **Built:** Production-Level Printer Detection, Setup Wizard & Monitoring Suite (`/store`, `/store/dashboard`, `/store/printer-setup`):
  - **Commercial Setup Wizard Experience:** Multi-step guided wizard inspired by Windows Hardware Setup, HP Smart, and Epson Smart Panel with automatic auto-launch on initial Store Dashboard open (with "Don't show again on this device" preference).
  - **7 Wizard Steps:**
    1. **Welcome Screen:** Visual hardware badges for USB, Wi-Fi, Network/LAN, and Thermal receipt printers with "Start Hardware Setup" CTA.
    2. **Animated Scanner:** Pulsing radar rings, real-time progress bar (0-100%), and rotating diagnostic status messages across ports and subnets.
    3. **Device Selection:** Single/multi-printer cards with radio selection, connection tags, monochrome/color badges, and manual setup triggers.
    4. **Automated Calibration:** 6-step diagnostic checklist with animated real-time checkmarks (paper tray alignment, toner sensors, nozzle health, firmware latency, duplex communication, cloud synchronization).
    5. **Default Configuration:** Paper size (A4, Letter, Legal), Print Quality (Draft, Standard, High), Color Mode, Duplex toggle, Auto-Cutter toggle, and Instant Cloud Spooling switch.
    6. **Hardware Test Print:** Interactive visual test sheet preview, simulated spooler animation, physical alignment verification, and success confirmation.
    7. **Success & Activation Screen:** Celebratory animated checkmark and 4 activation cards (Printer Connected, Paper Ready, Active Spooler, Auto Printing Enabled).
  - **Production-Level Error Handling:** Comprehensive error view component covering all 8 commercial error states (`NoPrinterFound`, `DriverMissing`, `PrinterOffline`, `PaperOut`, `LowInk`, `PaperJam`, `PrinterBusy`, `CommunicationFailed`) with clear plain-language causes, step-by-step resolution guides, and "Download Driver" / "Manual IP Setup" / "Scan Again" CTAs.
  - **Manual Setup Suite (`ManualPrinterSetup.tsx`):** Custom USB port selection (`USB001`, `USB002`, `LPT1`), local static IP address configuration (`9100` RAW / `515` LPR), and connection ping tester.
  - **Background Hardware Monitoring & Toast Notifications:** Real-time health monitoring hook (`usePrinterMonitoring.ts`), floating toast alerts for paper/toner depletion, jams, and disconnects, plus an enhanced dashboard live status widget with hardware management drawer.
  - **API Contract:** Added Printer Hardware APIs (`GET /printer/detect`, `POST /printer/connect`, `POST /printer/test`, `GET /printer/status`, `POST /printer/restart`) to `API_CONTRACT.md`.
- **Built:** Production-Grade Scalable Backend Architecture (`backend/src/*`):
  - **Clean Layered Architecture:** Fully decoupled, feature-first foundation structured for 100,000+ stores, 10M+ users, and millions of print jobs.
  - **Database Connection Manager (`src/database/connection.ts`):** Robust singleton MongoDB connection manager connected to the PrintPay cluster using environment credentials with event listeners, reconnect logic, and graceful shutdown handling.
  - **Zero Collections Rule Respected:** No MongoDB models or collections created prematurely. Created `DATABASE.md` as the single source of truth for the database lifecycle.
  - **Cloudinary Storage Pipeline (`src/cloudinary/cloudinary.service.ts`):** Reusable upload service supporting Images (JPG, PNG, WebP, SVG), PDFs, and Documents (DOCX, XLSX, TXT) with automatic stream piping from Multer memory storage, deletion by public ID, and asset replacement.
  - **Generic Repository & Service Layer:**
    - `BaseRepository<T>` (`src/repositories/BaseRepository.ts`): Mongoose CRUD abstraction with lean queries, projection, sorting, and pagination metadata calculation (`buildPaginationMeta`).
    - `BaseService<T>` (`src/services/BaseService.ts`): Business logic foundation with automated `NotFoundError` boundary checks.
    - `BaseController` (`src/controllers/BaseController.ts`): Standardized response formatting methods (`sendSuccess`, `sendCreated`, `sendPaginated`, `sendNoContent`).
  - **Error Handling & Response Envelopes:**
    - `ApiResponse` (`src/responses/ApiResponse.ts`): Uniform JSON envelopes (`success`, `message`, `data`, `pagination`, `timestamp`).
    - Centralized Error Handler (`src/middlewares/errorHandler.ts`): Automatically converts custom `ApiError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`, Mongo duplicate keys (`11000`), and JWT errors into structured API error payloads.
    - `notFoundHandler` (`src/middlewares/notFoundHandler.ts`): 404 handler for unknown routes.
  - **Authentication & RBAC Foundation:**
    - Reusable JWT signing & verification utilities (`src/utils/jwt.ts`).
    - Bearer token authentication middleware (`src/middlewares/auth.middleware.ts`).
    - Role-based authorization middleware (`src/middlewares/role.middleware.ts` supporting `SuperAdmin`, `Admin`, `Staff`, `Store`, `User`, `Guest`).
    - Granular permission matrix & enforcement middleware (`src/permissions/rbac.ts`, `src/middlewares/permission.middleware.ts`).
  - **Security & Performance Infrastructure:**
    - Security headers via `helmet`.
    - Compression middleware for reduced payload latency.
    - Rate limiting presets (`apiLimiter`, `authLimiter`, `uploadLimiter`).
    - Centralized structured logger (`src/utils/logger.ts`).
    - Zod request validation runner (`src/validators/validateRequest.ts`).
    - Health check endpoint (`GET /api/v1/health`) reporting MongoDB connectivity, Cloudinary configuration, and system memory/uptime.
  - **Documentation Created & Updated:**
    - Created [`DATABASE.md`](file:///d:/project/selfprint/DATABASE.md) listing current status and planned collections.
    - Updated [`ARCHITECTURE.md`](file:///d:/project/selfprint/ARCHITECTURE.md) Backend Architecture & Database sections.





































