# Database Documentation

## Current Status

**Collections Created**: None

---

## Planned Collections

The database architecture is designed for multi-tenant scalability (100,000+ Stores, 10 Million+ Users, Millions of Print Jobs). Collections will be introduced gradually **feature-by-feature**.

| Collection Name | Purpose | Target Feature Module | Status |
| :--- | :--- | :--- | :--- |
| **Admins** | Super Admin & Admin account credentials, profiles & access levels | `admin_pannel` / Auth | Planned |
| **AdminPermissions** | Granular module and action permissions matrix for Staff/Admins | Access Control | Planned |
| **Stores** | Print shop partner profiles, coordinates, addresses, status | Store Onboarding / Stores | Planned |
| **StoreSettings** | Pricing rules (B&W / Color / Duplex rates), store operational hours | Store Settings | Planned |
| **StoreBankAccounts**| Partner payout bank details, IFSC, and UPI settlement configs | Store Payouts / Bank | Planned |
| **Users** | Kiosk and customer identity records (phone, name, activity) | Customer Panel / Users | Planned |
| **PrintJobs** | Print spooler queue items, document URLs, page counts, configurations | Spooler / Print Jobs | Planned |
| **Transactions** | Customer payments, Razorpay / UPI gateway order IDs, statuses | Transactions / Payments | Planned |
| **Revenue** | Daily and monthly store earnings breakdown, platform commission | Store & Admin Revenue | Planned |
| **Printers** | Registered physical hardware devices, brands, serial numbers, ports | Store Printer Suite | Planned |
| **PrinterStatus** | Real-time printer health telemetry, ink levels, paper status, latency | Live Hardware Monitor | Planned |
| **PrinterLogs** | Hardware diagnostic history, error triggers, reconnect events | Hardware Diagnostics | Planned |
| **AuditLogs** | Platform security audit trail (logins, config changes, permissions) | Security / Audit Logs | Planned |
| **SupportTickets** | Customer and store support inquiries, priority statuses, chat threads | Support Management | Planned |
| **Notifications** | In-app alerts, low paper/ink warnings, payout dispatches | Notification Engine | Planned |
| **Sessions** | Active JWT refresh tokens, device fingerprints, login sessions | Auth / Security | Planned |
| **Uploads** | Cloudinary asset records, public IDs, MIME types, file sizes, expiries | Storage / Asset Engine | Planned |
| **ActivityLogs** | Store owner and operator operational logs | Store Dashboard Activity | Planned |
| **SystemSettings** | Global platform maintenance mode, pricing caps, feature flags | System Configuration | Planned |
| **QRLinks** | Dynamic QR code tokens, store bindings, scan counters | QR Generation | Planned |

---

## Detailed Collection Specifications (To Be Populated As Collections Are Created)

> ⚠️ **RULE**: Every time a collection is created, `DATABASE.md` MUST be updated immediately with:
> - **Collection Name**
> - **Purpose**
> - **Relationships**
> - **Indexes**
> - **Created Date**
> - **Created By**
> - **Status**
> - **Fields**
> - **Future Plans**
