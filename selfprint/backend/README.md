# Backend — Self-Print Platform

Production-grade Node.js + Express + TypeScript + MongoDB (Mongoose ODM) backend architecture.

## Tech Stack

- **Runtime & Framework:** Node.js, Express
- **Language:** TypeScript 5.7
- **Database & ODM:** MongoDB Atlas, Mongoose ODM
- **Asset Storage:** Cloudinary (Permanent Store/User/Admin Assets) & Ephemeral Storage (Temporary Print Documents)
- **Security & Logging:** Helmet, CORS, Morgan, Express Rate Limit
- **Validation:** Zod Schema Validation
- **Authentication:** JWT, Refresh Tokens, RBAC (Super Admin, Admin, Store, User)

## Normalized Directory Structure

```
backend/src/
├── config/         # Environment, Cloudinary, Database & JWT configurations
├── constants/      # Status codes, error codes, role definitions, permissions
├── controllers/    # BaseController and abstract request handlers
├── database/       # Mongoose connection manager with singleton connection pooling
├── errors/         # Standardized ApiError and HTTP error subclasses
├── helpers/        # Date, string, and formatting helpers
├── interfaces/     # BaseRepository and BaseService interfaces
├── middlewares/    # Auth, Role, Permission, RateLimit, Error & 404 middlewares
├── models/         # Mongoose schemas and models
├── modules/        # Feature-first modular subsystems:
│   ├── auth/           # Authentication, JWT, Refresh Tokens, RBAC
│   ├── super-admin/    # Super Admin platform settings & controls
│   ├── admin/          # Admin/Staff operations, store verification, support
│   ├── store/          # Store Dashboard, Onboarding, Pricing, Bank Details
│   ├── user/           # Customer Kiosk, Document upload & config, Order tracking
│   ├── orders/         # Print job spooler ledger, Document metadata, Queue state machine
│   ├── payments/       # Razorpay/Cashfree/UPI gateway, Webhooks, Payout settlements
│   ├── printer/        # Hardware telemetry, Spooler heartbeat, Status monitor
│   ├── qr/             # Dynamic QR generation, Standee tokens, Store routing
│   ├── notifications/  # Real-time in-app alerts, WhatsApp/SMS, Low-stock alarms
│   ├── audit/          # Immutable security logs & administrative audit trail
│   └── analytics/      # Revenue aggregation, Print volume analytics, Platform KPIs
├── repositories/   # BaseRepository data access layer
├── responses/      # Standardized ApiResponse envelope helper
├── routes/         # Express router endpoints mounting all feature modules
├── schemas/        # Shared Zod validation schemas
├── services/       # BaseService business logic operations
├── uploads/        # Multer memory and ephemeral temp file storage config
├── utils/          # AsyncHandler, JWT utils, Password hashing, Logger
├── validators/     # Reusable Zod validation middleware
├── app.ts          # Express application initialization & middleware pipeline
└── server.ts       # HTTP server listener & graceful shutdown handlers
```

## Scripts

```bash
# Start development server with live reload (port 5000)
npm run dev

# Compile TypeScript to dist/
npm run build

# Start compiled production server
npm run start
```
