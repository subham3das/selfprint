# Database Documentation (MongoDB Architecture)

This document defines the normalized MongoDB schema design, collection specifications, field structures, relationships, indexing strategies, aggregation patterns, and asset storage rules for the **Self-Print Platform**.

---

## 1. Database Overview & Core Principles

1. **Database Name**: `selfprint` (configured explicitly in `backend/.env` as `...mongodb.net/selfprint?appName=PrintPay` and in Mongoose `dbName: 'selfprint'`).
2. **Zero Dummy Data Guarantee**:
   - The database starts completely empty on production deployment.
   - ZERO automatically inserted demo stores, mock users, synthetic queues, demo printers, or fake revenue records.
   - All APIs return clean empty collections (`[]`, `0`, `null`) when no database rows exist, allowing the frontend to render proper empty states gracefully.
3. **Multi-Tenant Scalability**: Engineered for 100,000+ Print Stores, 10 Million+ Users, and Millions of Print Spooler Transactions.
4. **Normalized Core with Targeted Denormalization**: Critical foreign references are indexed with `ObjectId` relations; frequently read telemetry and counters are maintained via atomic updates and caching.
5. **Cloudinary Asset Storage Policy**:
   - **Permanent Assets**: Store brand logos, storefront images, user avatars, admin profile pictures, and future branding assets are stored in **Cloudinary** (configured via `.env`).
   - **Printing Documents (PDFs, DOCX, print images)**: Temporary customer print uploads are stored in **ephemeral local/temp storage** and are **NEVER stored permanently in Cloudinary**. Files are purged automatically after print execution.



---

## 2. Collection Index Matrix

| # | Collection Name | Purpose | Primary Model / Module | Indexes |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **`admins`** | Super Admin, Admin, and Staff user credentials & permissions | `modules/auth`, `modules/admin` | `{ email: 1 }` (unique), `{ role: 1 }` |
| 2 | **`stores`** | Store partner profiles, contact info, coordinates, status | `modules/store` | `{ email: 1 }` (unique), `{ storeCode: 1 }` (unique), `{ location: '2dsphere' }` |
| 3 | **`store_settings`** | Page pricing rates (B&W/Color/Duplex), business hours, kiosk rules | `modules/store` | `{ storeId: 1 }` (unique) |
| 4 | **`store_bank_accounts`** | Payout bank details, IFSC, settlement UPI IDs | `modules/store`, `modules/payments` | `{ storeId: 1 }` (unique), `{ isVerified: 1 }` |
| 5 | **`users`** | Customer kiosk accounts, phone numbers, membership tiers | `modules/user`, `modules/admin` | `{ email: 1 }` (unique), `{ userIdCode: 1 }` (unique), `{ phone: 1 }` |
| 6 | **`printers`** | Hardware telemetry, USB/WiFi/LAN ports, paper & toner % | `modules/printer`, `modules/store` | `{ storeId: 1, status: 1 }`, `{ storeId: 1, isDefault: 1 }` |
| 7 | **`print_jobs`** | Print spooler queue, page volume, color settings, lifecycle status | `modules/orders`, `modules/printer` | `{ jobNumber: 1 }` (unique), `{ storeId: 1, status: 1, createdAt: -1 }` |
| 8 | **`transactions`** | Customer payments, Razorpay order IDs, status, splits | `modules/payments` | `{ transactionId: 1 }` (unique), `{ orderId: 1 }`, `{ storeId: 1 }` |
| 9 | **`revenue_records`** | Daily and monthly store earnings aggregates, commissions | `modules/analytics`, `modules/payments` | `{ storeId: 1, date: -1 }`, `{ month: 1, year: 1 }` |
| 10 | **`qr_links`** | Dynamic QR tokens, store routing, scan counters | `modules/qr` | `{ token: 1 }` (unique), `{ storeId: 1 }` |
| 11 | **`notifications`** | In-app alerts, low stock warnings, payout dispatches | `modules/notifications` | `{ recipientId: 1, isRead: 1, createdAt: -1 }` |
| 12 | **`audit_logs`** | Immutable security audit trail & administrative action logs | `modules/audit` | `{ actorId: 1, createdAt: -1 }`, `{ entityType: 1, entityId: 1 }` |
| 13 | **`support_tickets`** | Customer & store inquiries, dispute threads, priority flags | `modules/admin` | `{ ticketNumber: 1 }` (unique), `{ status: 1 }`, `{ storeId: 1 }` |
| 14 | **`sessions`** | Active JWT refresh tokens, device fingerprints, kiosk logins | `modules/auth` | `{ tokenHash: 1 }` (unique), `{ expiresAt: 1 }` (TTL) |
| 15 | **`system_settings`** | Global platform maintenance mode, pricing caps, feature flags | `modules/super-admin` | `{ configKey: 1 }` (unique) |

---

## 3. Detailed Collection Schemas & Relationships

### 3.1 `admins`
- **Purpose**: Dedicated identity and RBAC collection exclusively for platform administrators (Super Admin, Admins, Staff). Never mixed with `users` or `stores`.
- **Collection Name**: `admins`
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `name`: `String` (required) — Full legal name
  - `displayName`: `String` (required) — UI badge name (e.g. `'Super Admin'`)
  - `email`: `String` (required, unique, lowercase) — Administrator login email
  - `passwordHash`: `String` (required, `select: false`) — bcrypt salt+hash
  - `role`: `String` (`'SUPER_ADMIN'` | `'ADMIN'` | `'MANAGER'` | `'FINANCE'` | `'OPERATIONS'` | `'SUPPORT'` | `'STAFF'`, default: `'ADMIN'`)
  - `status`: `String` (`'ACTIVE'` | `'INACTIVE'` | `'SUSPENDED'` | `'PENDING'`, default: `'ACTIVE'`)
  - `permissions`: `Object` — Granular $O(1)$ mapping e.g. `{ stores: { view: true, create: true, edit: false, delete: false, approve: true } }`
  - `avatar`: `String` (optional) — Cloudinary URL or initials badge
  - `isActivated`: `Boolean` (default: `false`) — Whether staff member has activated their account via Google
  - `activatedAt`: `Date` (optional) — Timestamp when account activation occurred
  - `inviteToken`: `String` (optional, indexed) — Cryptographic invitation token (SHA256/hex)
  - `inviteExpiresAt`: `Date` (optional, indexed) — Strict 48-hour expiration timestamp
  - `inviteSentAt`: `Date` (optional) — Timestamp when invitation email was dispatched
  - `emailStatus`: `String` (`'PENDING'` | `'SENT'` | `'FAILED'`, default: `'PENDING'`) — Nodemailer SMTP delivery status
  - `createdBy`: `String` (optional) — Email of creator
  - `department`: `String` (optional, default: `'Platform Operations'`)
  - `lastLogin`: `Date` (optional) — Timestamp of last authenticated session
  - `lastLoginIp`: `String` (optional) — IP address telemetry
  - `isDeleted`: `Boolean` (default: `false`) — Soft deletion flag
  - `createdAt`: `Date` — Auto timestamp
  - `updatedAt`: `Date` — Auto timestamp


### 3.16 `roles`
- **Purpose**: Template catalog storing default RBAC permission structures for system roles (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `FINANCE`, `OPERATIONS`, `SUPPORT`).
- **Collection Name**: `roles`
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `name`: `String` (required, unique) — Role name identifier (e.g. `'MANAGER'`)
  - `description`: `String` — Human readable role summary
  - `defaultPermissions`: `Object` — O(1) object template of permissions
  - `isSystem`: `Boolean` (default: `false`) — System lock flag preventing deletion of core roles
  - `createdAt`: `Date`
  - `updatedAt`: `Date`

  - `createdBy`: `ObjectId` (ref: `'Admin'`) — Admin who invited this member
  - `lastLogin`: `Date` — Last successful authentication timestamp
  - `lastLoginIp`: `String` — IP address of last authentication
  - `lastActive`: `Date` — Telemetry activity timestamp
  - `isDeleted`: `Boolean` (default: false) — Soft-delete flag
  - `deletedAt`: `Date`
  - `deletedBy`: `ObjectId`
  - `createdAt`: `Date`
  - `updatedAt`: `Date`
- **Super Admin Protection Rules**:
  - The initial Super Admin (`das01subhamj@gmail.com`) can **never** be deleted, banned, disabled, or demoted.
  - No other Admin or Staff member can edit the Super Admin account.
- **Initial Super Admin Seed**:
  - Seed file: `backend/src/database/seeds/superAdmin.seed.ts` (runnable via `npm run seed:superadmin`).
  - Seed Email: `das01subhamj@gmail.com`
  - Name: `Subham` | Display Name: `Super Admin` | Role: `SUPER_ADMIN` | Status: `ACTIVE` | Permissions: `['FULL_ACCESS', '*']`
- **Relationships**:
  - `Admin` (1) $\longrightarrow$ `AuditLogs` (N) via `audit_logs.actorId`


---

### 3.2 `stores`
- **Purpose**: Physical print shop partner accounts, business credentials, geolocation, and operational state.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `storeCode`: `String` (required, unique, uppercase, e.g. `SP-1001`) — Unique merchant code
  - `name`: `String` (required) — Commercial store display name
  - `ownerName`: `String` (required) — Owner legal name
  - `email`: `String` (required, unique, lowercase) — Store contact & login email
  - `phone`: `String` (required) — Contact mobile number
  - `address`: `String` (required) — Full street and branch address
  - `city`: `String` (required)
  - `state`: `String` (required)
  - `country`: `String` (default: `'India'`)
  - `pincode`: `String` (required)
  - `logo`: `String` (optional) — Cloudinary URL for brand logo
  - `storefrontImages`: `[String]` (optional) — Cloudinary URLs for store photos
  - `location`: `Object` — GeoJSON `{ type: 'Point', coordinates: [longitude, latitude] }`
  - `status`: `String` (`'ACTIVE'` \| `'INACTIVE'` \| `'SUSPENDED'` \| `'PENDING'`, default: `'ACTIVE'`)
  - `isVerified`: `Boolean` (default: false)
  - `isFirstLogin`: `Boolean` (default: true) — Controls automatic first-time Printer Setup Wizard modal display
  - `printerConfigured`: `Boolean` (default: false) — Whether a physical printer has been configured for this store
  - `verifiedAt`: `Date`
  - `verifiedBy`: `ObjectId` (ref: `'admins'`)
  - `createdAt`: `Date`
  - `updatedAt`: `Date`
- **Relationships**:
  - `Store` (1) $\longrightarrow$ `StoreSettings` (1) via `store_settings.storeId`
  - `Store` (1) $\longrightarrow$ `StoreBankAccounts` (1) via `store_bank_accounts.storeId`
  - `Store` (1) $\longrightarrow$ `Printers` (N) via `printers.storeId`
  - `Store` (1) $\longrightarrow$ `PrintJobs` (N) via `print_jobs.storeId`
  - `Store` (1) $\longrightarrow$ `Transactions` (N) via `transactions.storeId`

---

### 3.3 `store_settings`
- **Purpose**: Configurable page pricing rules, operating schedule, and kiosk upload preferences.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `storeId`: `ObjectId` (ref: `'stores'`, required, unique) — Associated store
  - `pricing`: `Object`:
    - `bwSingleSide`: `Number` (default: 2.0) — Price per page in INR
    - `bwDoubleSide`: `Number` (default: 3.5) — Price per sheet in INR
    - `colorSingleSide`: `Number` (default: 10.0) — Price per page in INR
    - `colorDoubleSide`: `Number` (default: 18.0) — Price per sheet in INR
    - `photoGlossyA4`: `Number` (default: 25.0)
  - `operatingHours`: `Object`:
    - `openTime`: `String` (e.g. `'08:00'`)
    - `closeTime`: `String` (e.g. `'22:00'`)
    - `isOpenSunday`: `Boolean` (default: true)
  - `maxFileUploadSizeMB`: `Number` (default: 50)
  - `allowGuestPrints`: `Boolean` (default: true)
  - `autoPrintQueue`: `Boolean` (default: true)
  - `updatedAt`: `Date`

---

### 3.4 `store_bank_accounts`
- **Purpose**: Merchant settlement and automated payout bank credentials.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `storeId`: `ObjectId` (ref: `'stores'`, required, unique)
  - `accountHolderName`: `String` (required)
  - `accountNumber`: `String` (required, encrypted at rest)
  - `ifscCode`: `String` (required, uppercase)
  - `bankName`: `String` (required)
  - `branchName`: `String` (optional)
  - `upiId`: `String` (optional)
  - `payoutMode`: `String` (`'BANK_TRANSFER'` \| `'UPI'`, default: `'UPI'`)
  - `isVerified`: `Boolean` (default: false)
  - `verifiedAt`: `Date`
  - `createdAt`: `Date`
  - `updatedAt`: `Date`

---

### 3.5 `users`
- **Purpose**: Customer kiosk accounts, subscriptions, contact credentials, and profile image in Cloudinary.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `userIdCode`: `String` (required, unique, e.g. `USR-1001`)
  - `name`: `String` (required)
  - `email`: `String` (required, unique, lowercase)
  - `phone`: `String` (required)
  - `avatarUrl`: `String` (optional) — Cloudinary URL for profile photo
  - `storeId`: `ObjectId` (ref: `'stores'`, optional, default: null) — Primary/Favorite kiosk
  - `city`: `String` (required)
  - `state`: `String` (default: `'Assam'`)
  - `fullAddress`: `String` (required)
  - `country`: `String` (default: `'India'`)
  - `status`: `String` (`'Active'` \| `'Inactive'` \| `'Blocked'` \| `'Banned'` \| `'Pending'` \| `'Verified'`, default: `'Active'`)
  - `membershipPlan`: `String` (`'Basic'` \| `'Pro'` \| `'Enterprise'` \| `'Student'`, default: `'Basic'`)
  - `isVerified`: `Boolean` (default: true)
  - `isOnline`: `Boolean` (default: false)
  - `lastActive`: `Date` (default: `Date.now`)
  - `lastLoginAt`: `Date`
  - `blockReason`: `String` (optional)
  - `blockedAt`: `Date`
  - `blockedBy`: `ObjectId` (ref: `'admins'`)
  - `isDeleted`: `Boolean` (default: false)
  - `deletedAt`: `Date`
  - `deletedBy`: `ObjectId` (ref: `'admins'`)
  - `createdAt`: `Date`
  - `updatedAt`: `Date`
- **Relationships**:
  - `Users` (1) $\longrightarrow$ `PrintJobs` (N) via `print_jobs.userId`
  - `Users` (1) $\longrightarrow$ `Transactions` (N) via `transactions.userId`

---

### 3.6 `printers`
- **Purpose**: Physical printing hardware devices, brand, connection type, paper level, toner level, and spooler telemetry.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `storeId`: `ObjectId` (ref: `'stores'`, required)
  - `hostId`: `ObjectId` (ref: `'hosts'`, optional) — Linked Desktop Host Bridge
  - `deviceId`: `String` (optional) — Hardware fingerprint identifier
  - `printerName`: `String` (required, e.g. `'OneNote (Desktop)'`, `'Epson L3250'`)
  - `brand`: `String` (required, e.g. `'HP'`, `'Canon'`, `'Epson'`, `'Brother'`, `'Generic'`)
  - `model`: `String` (required)
  - `driver`: `String` (optional) — System OS driver string
  - `port`: `String` (optional, e.g. `'USB001'`, `'PORTPROMPT:'`, `'9100'`)
  - `connectionType`: `String` (`'USB'` \| `'WIFI'` \| `'NETWORK'` \| `'LAN'` \| `'BLUETOOTH'` \| `'VIRTUAL'`, default: `'USB'`)
  - `status`: `String` (`'ONLINE'` \| `'PRINTING'` \| `'OFFLINE'` \| `'WARNING'` \| `'ERROR'` \| `'PAUSED'`, default: `'ONLINE'`)
  - `paperLevel`: `Number` (0–100, default: 90) — Tray capacity percentage
  - `tonerLevel`: `Number` (0–100, default: 85) — Cartridge ink capacity percentage
  - `capabilities`: `Object` — `{ isColor: Boolean, isDuplex: Boolean, isAutoCut: Boolean, paperSizes: [String] }`
  - `isDefault`: `Boolean` (default: true)
  - `lastHeartbeat`: `Date` (default: `Date.now`)
  - `lastSeen`: `Date` (default: `Date.now`)
  - `createdAt`: `Date`
  - `updatedAt`: `Date`

---

### 3.6.1 `hosts`
- **Purpose**: Desktop Host Bridge background applications running locally on the store's physical computer (`http://127.0.0.1:45120`).
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `storeId`: `ObjectId` (ref: `'stores'`, required)
  - `hostId`: `String` (required, unique per store) — Device fingerprint
  - `deviceName`: `String` (required) — Computer hostname
  - `os`: `String` (required, e.g. `'windows'`, `'darwin'`, `'linux'`)
  - `osRelease`: `String` (optional)
  - `hostVersion`: `String` (default: `'1.0.0'`)
  - `ipAddress`: `String` (optional)
  - `status`: `String` (`'ONLINE'` \| `'OFFLINE'`, default: `'ONLINE'`)
  - `lastHeartbeat`: `Date` (default: `Date.now`)
  - `createdAt`: `Date`
  - `updatedAt`: `Date`

---

### 3.7 `print_jobs` (Orders)
- **Purpose**: Core transactional print queue ledger, document metadata, page specifications, price, and lifecycle status.
- **Ephemeral Document Storage Rule**: The document file is stored in temporary local storage (e.g. `uploads/temp/`) during spooling and is purged after completion. **NOT stored in Cloudinary**.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `jobNumber`: `String` (required, unique, e.g. `#102` or `JOB-9821`)
  - `storeId`: `ObjectId` (ref: `'stores'`, required)
  - `userId`: `ObjectId` (ref: `'users'`, optional, nullable for guest kiosk users)
  - `printerId`: `ObjectId` (ref: `'printers'`, optional)
  - `fileName`: `String` (required, e.g. `'Final_Resume_2025.pdf'`)
  - `fileType`: `String` (`'pdf'` \| `'doc'` \| `'img'`)
  - `fileSize`: `String` (default: `'2.4 MB'`)
  - `tempFilePath`: `String` (ephemeral disk storage path, wiped post-print)
  - `totalPages`: `Number` (required, min: 1)
  - `copies`: `Number` (required, min: 1, default: 1)
  - `printType`: `String` (`'BW'` \| `'COLOR'` \| `'B&W'` \| `'Color'`, default: `'B&W'`)
  - `paperSize`: `String` (`'A4'` \| `'A3'` \| `'Letter'` \| `'Legal'`, default: `'A4'`)
  - `isDuplex`: `Boolean` (default: false)
  - `selectedPages`: `Mixed` (default: `'all'`)
  - `customerName`: `String` (default: `'Guest'`)
  - `customerPhone`: `String` (optional)
  - `status`: `String` (`'WAITING'` \| `'PRINTING'` \| `'COMPLETED'` \| `'FAILED'` \| `'CANCELLED'`, default: `'WAITING'`)
  - `price`: `Number` (required, min: 0) — Billing amount in INR
  - `paymentStatus`: `String` (`'PAID'` \| `'PENDING'` \| `'FAILED'`, default: `'PAID'`)
  - `transactionId`: `ObjectId` (ref: `'transactions'`, optional)
  - `queuedAt`: `Date` (default: `Date.now`)
  - `startedAt`: `Date`
  - `completedAt`: `Date`
  - `createdAt`: `Date`
  - `updatedAt`: `Date`

---

### 3.8 `transactions`
- **Purpose**: Financial payments ledger, Razorpay gateway order tracking, commission split, and settlement status.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `transactionId`: `String` (required, unique, e.g. `TXN-98214`)
  - `storeId`: `ObjectId` (ref: `'stores'`, required)
  - `userId`: `ObjectId` (ref: `'users'`, optional)
  - `jobId`: `ObjectId` (ref: `'print_jobs'`, required)
  - `amount`: `Number` (required, min: 0) — Total collected in INR
  - `platformFee`: `Number` (required, default: 0) — Platform commission
  - `storeEarnings`: `Number` (required) — Net merchant earnings
  - `currency`: `String` (default: `'INR'`)
  - `paymentGateway`: `String` (`'RAZORPAY'` \| `'CASHFREE'` \| `'UPI'` \| `'WALLET'`)
  - `gatewayOrderId`: `String` (optional)
  - `gatewayPaymentId`: `String` (optional)
  - `status`: `String` (`'PAID'` \| `'PENDING'` \| `'FAILED'` \| `'REFUNDED'`, default: `'PENDING'`)
  - `settlementStatus`: `String` (`'PENDING'` \| `'SETTLED'`, default: `'PENDING'`)
  - `settledAt`: `Date`
  - `createdAt`: `Date`
  - `updatedAt`: `Date`

---

### 3.9 `revenue_records`
- **Purpose**: Materialized daily and monthly financial summaries per store for sub-millisecond analytics.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `storeId`: `ObjectId` (ref: `'stores'`, required)
  - `date`: `String` (e.g. `'2025-05-29'`)
  - `month`: `Number` (1–12)
  - `year`: `Number` (e.g. `2025`)
  - `totalOrders`: `Number` (default: 0)
  - `totalRevenue`: `Number` (default: 0)
  - `platformCommissions`: `Number` (default: 0)
  - `netPayout`: `Number` (default: 0)
  - `totalPages`: `Number` (default: 0)
  - `colorPages`: `Number` (default: 0)
  - `bwPages`: `Number` (default: 0)
  - `updatedAt`: `Date`

---

### 3.10 `qr_links`
- **Purpose**: Dynamic QR code tokens, store routing resolution, and scan telemetry.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `token`: `String` (required, unique, index) — URL token slug (e.g. `qr-kiosk-102`)
  - `storeId`: `ObjectId` (ref: `'stores'`, required)
  - `targetUrl`: `String` (required, e.g. `'https://selfprint.app/store/SP-1001'`)
  - `templateName`: `String` (default: `'Default'`)
  - `totalScans`: `Number` (default: 0)
  - `lastScannedAt`: `Date`
  - `isActive`: `Boolean` (default: true)
  - `expiresAt`: `Date` (optional)
  - `createdAt`: `Date`

---

### 3.11 `notifications`
- **Purpose**: Real-time push, hardware low-stock alarms, and in-app alerts for users, stores, and administrators.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `recipientType`: `String` (`'ADMIN'` \| `'STORE'` \| `'USER'`)
  - `recipientId`: `ObjectId` (required, indexed)
  - `title`: `String` (required)
  - `message`: `String` (required)
  - `type`: `String` (`'INFO'` \| `'WARNING'` \| `'SUCCESS'` \| `'ERROR'`, default: `'INFO'`)
  - `isRead`: `Boolean` (default: false)
  - `metadata`: `Object` (optional JSON payload)
  - `createdAt`: `Date` (default: `Date.now`)

---

### 3.12 `audit_logs`
- **Purpose**: Immutable security audit trail recording all privileged admin actions, store modifications, and deletions.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `actorId`: `ObjectId` (required) — Admin or User ID
  - `actorType`: `String` (`'SUPER_ADMIN'` \| `'ADMIN'` \| `'STORE_OWNER'` \| `'SYSTEM'`)
  - `action`: `String` (required, e.g. `'USER_BLOCKED'`, `'STORE_VERIFIED'`, `'PRICING_UPDATED'`)
  - `entityType`: `String` (required, e.g. `'User'`, `'Store'`, `'Printer'`)
  - `entityId`: `String` (required)
  - `details`: `String` (optional)
  - `changesDiff`: `Object` (optional `{ before: {}, after: {} }`)
  - `ipAddress`: `String` (optional)
  - `userAgent`: `String` (optional)
  - `createdAt`: `Date` (default: `Date.now`)

---

### 3.13 `support_tickets`
- **Purpose**: Customer and store dispute management, refund inquiries, and support communications.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `ticketNumber`: `String` (required, unique, e.g. `TCK-5042`)
  - `storeId`: `ObjectId` (ref: `'stores'`, optional)
  - `userId`: `ObjectId` (ref: `'users'`, optional)
  - `subject`: `String` (required)
  - `description`: `String` (required)
  - `category`: `String` (`'PAYMENT'` \| `'HARDWARE'` \| `'PRINT_QUALITY'` \| `'GENERAL'`)
  - `priority`: `String` (`'LOW'` \| `'MEDIUM'` \| `'HIGH'` \| `'CRITICAL'`, default: `'MEDIUM'`)
  - `status`: `String` (`'OPEN'` \| `'IN_PROGRESS'` \| `'RESOLVED'` \| `'CLOSED'`, default: `'OPEN'`)
  - `assignedTo`: `ObjectId` (ref: `'admins'`, optional)
  - `createdAt`: `Date`
  - `updatedAt`: `Date`

---

### 3.14 `sessions`
- **Purpose**: Authentication refresh token store, kiosk active sessions, and automated TTL revocation.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `userId`: `ObjectId` (required)
  - `userType`: `String` (`'ADMIN'` \| `'STORE'` \| `'USER'`)
  - `tokenHash`: `String` (required, unique)
  - `deviceInfo`: `String` (optional)
  - `ipAddress`: `String` (optional)
  - `expiresAt`: `Date` (required, indexed with TTL)
  - `createdAt`: `Date` (default: `Date.now`)

---

### 3.15 `system_settings`
- **Purpose**: Global platform runtime configuration, maintenance mode, and feature flags.
- **Fields**:
  - `_id`: `ObjectId` — Primary Key
  - `configKey`: `String` (required, unique, e.g. `'GLOBAL_MAINTENANCE_MODE'`, `'MIN_PAYOUT_AMOUNT'`)
  - `configValue`: `Schema.Types.Mixed` (required)
  - `description`: `String` (optional)
  - `updatedBy`: `ObjectId` (ref: `'admins'`)
  - `updatedAt`: `Date`

---

## 4. Aggregation Pipelines & Query Patterns

### 4.1 Today's Store KPI Aggregation
```typescript
// Calculates total completed jobs, printing count, waiting count, and gross revenue
[
  { $match: { storeId: new ObjectId(storeId), createdAt: { $gte: startOfDay, $lte: endOfDay } } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$price', 0] } }
    }
  }
]
```

### 4.2 Top Performing Stores by Volume & Revenue
```typescript
// Computes store ranking based on 30-day completed print orders
[
  { $match: { status: 'COMPLETED', createdAt: { $gte: thirtyDaysAgo } } },
  {
    $group: {
      _id: '$storeId',
      totalRevenue: { $sum: '$price' },
      totalJobs: { $sum: 1 }
    }
  },
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: 'stores',
      localField: '_id',
      foreignField: '_id',
      as: 'storeDetails'
    }
  },
  { $unwind: '$storeDetails' }
]
```

---

## 5. Future Expandable Fields

- **AI Print Optimization**: Document orientation auto-detection, multi-up layout compression metadata (`print_jobs.aiEnhanceConfig`).
- **Loyalty & Rewards Program**: Kiosk reward points, wallet balances, cashback ledger (`users.walletBalance`, `users.rewardPoints`).
- **Automated WhatsApp Bot**: Webhook integration payloads for instant WhatsApp receipt delivery (`print_jobs.whatsappDispatched`).
