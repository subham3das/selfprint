# Self-Print Monorepo

Production-ready TypeScript monorepo featuring a React 19 + Vite frontend and an Express + Prisma backend.

## Project Structure

```
self-print/
├── frontend/          # React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router
├── backend/           # Node.js, Express, TypeScript, Prisma ORM (PostgreSQL ready)
├── package.json       # Monorepo workspace configuration
├── .gitignore
├── LICENSE
└── README.md
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` files in both workspaces:

```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

### 3. Run Development Servers

```bash
# Run frontend dev server (Vite on http://localhost:5173)
npm run dev:frontend

# Run backend dev server (Express on http://localhost:5000)
npm run dev:backend
```

### 4. Database Setup (Backend)

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema / apply migrations to PostgreSQL
npm run prisma:migrate
```

## Workspaces Overview

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## License

MIT
