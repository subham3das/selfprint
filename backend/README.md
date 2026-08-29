# Backend - Self-Print

Node.js + Express + TypeScript + Prisma ORM (PostgreSQL ready) backend service.

## Tech Stack

- **Runtime & Framework:** Node.js, Express
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Security & Logging:** Helmet, CORS, Morgan
- **Validation:** Express Validator
- **Authentication Scaffolding:** JWT ready (`jsonwebtoken` types and configuration)

## Directory Structure

```
src/
├── config/         # Environment variable loaders and configurations
├── controllers/    # Route handler controllers
├── routes/         # Express router declarations and endpoint bindings
├── middleware/     # Custom Express middlewares (error handling, 404, auth)
├── services/       # Core business logic layer
├── models/         # Domain models and interfaces
├── utils/          # Standard response formatters and helper utilities
├── types/          # Global backend TypeScript definitions
├── lib/            # Shared third-party instances (Prisma Client singleton)
├── database/       # Database connection helpers / seeders
├── constants/      # Backend constants and status codes
├── app.ts          # Express application initialization and middleware stack
└── server.ts       # Server listener and process shutdown handlers
```

## Scripts

```bash
# Start development server with live reload (port 5000)
npm run dev

# Generate Prisma Client after schema changes
npm run prisma:generate

# Apply Prisma database migrations
npm run prisma:migrate

# Open Prisma Studio web GUI
npm run prisma:studio

# Compile TypeScript to dist/
npm run build

# Start compiled production server
npm run start
```
