# RULES.md

Permanent development rules, conventions, and engineering standards for the **Self-Print** codebase. Every contributor and AI agent must adhere strictly to these rules.

---

## AI Development Instructions

Before making any code changes or proposing new features, every AI agent must:

1. **Read `MEMORY.md`** - Understand project state, completed work, and context.
2. **Read `ARCHITECTURE.md`** - Adhere strictly to the established system design and patterns.
3. **Read `RULES.md`** - Follow all coding standards, constraints, and practices.
4. **Read `API_CONTRACT.md`** - Ensure API endpoints, types, payloads, and responses match the contract.

> If any conflict exists between the requested changes and these files, **stop and resolve the conflict by updating documentation first**.

---

## 1. General Rules

- **DRY (Don't Repeat Yourself):** Never duplicate code or logic. If logic appears twice, extract it to a shared utility, hook, or service.
- **YAGNI (You Aren't Gonna Need It):** Build only what is needed for the current requirement. No speculative abstractions.
- **Backward Compatibility:** Always maintain backward compatibility for existing endpoints and contracts.
- **No File Renaming:** Never rename existing files or re-structure directories unless explicitly instructed.
- **Single Source of Truth:** Never hardcode shared constants across multiple files. Keep them in dedicated `constants/` files.

---

## 2. Code Quality Rules

- Keep functions small, focused, and pure where possible (single responsibility principle).
- Use `async/await` for asynchronous code; avoid nested promises and raw callbacks.
- Do not leave dead, unused, commented-out code, or console logs in production code.
- Prefer early returns over deeply nested `if/else` conditions.
- Write clean, self-documenting code with meaningful variable and function names.

---

## 3. React Rules

- **Functional Components Only:** Class components are strictly prohibited.
- **Keep Components Small:** Components must remain small and focused (< 150-200 lines). Break complex components into sub-components.
- **No Business Logic in UI:** UI components are purely presentational or state-binding. Extract stateful workflows and data manipulations to custom hooks.
- **Custom Hooks for Reusable Logic:** Encapsulate stateful logic, queries, and mutations in custom hooks under `src/hooks/`.
- **No Inline Styles:** Use Tailwind CSS utility classes exclusively. Never use `style={{ ... }}` unless computing dynamic runtime positions (e.g. canvas or dragging coords).
- **Reusable Component Composition:** Always reuse primitives from `components/ui/` and compound blocks from `components/common/`.
- **Clean Props Interface:** Every component must explicitly define a TypeScript interface for its props (e.g., `interface ButtonProps { ... }`).
- **Hook Rules:** Never call hooks conditionally or inside loops.

---

## 4. TypeScript Rules

- **Use TypeScript Everywhere:** No `.js` or `.jsx` files are permitted in `src/`.
- **Strict Mode:** TypeScript `strict: true` must always be respected.
- **No `any` Types:** The `any` type is strictly forbidden. Use proper generic types, `unknown`, type narrowing, or specific interfaces.
- **Explicit Types for Public Signatures:** Exported functions, API responses, hooks, and helpers must have explicit return and parameter types.
- **Shared Interfaces:** Maintain global domain models and API contracts in `types/index.ts`.

---

## 5. Backend Rules

- **Layered Separation:**
  - **Controllers:** Thin controllers that validate input, call the service layer, and return standard `ApiResponse`.
  - **Services:** Pure business logic and domain processing.
  - **Prisma/Lib:** Database interaction layer.
- **No Direct DB Calls in Controllers:** Controllers must NEVER call `prisma.<model>` directly. All database access must route through the service layer.
- **No `req`/`res` in Services:** Service functions must accept standard parameters and return domain data or throw typed errors; they must never receive Express `req` or `res` objects.

---

## 6. Express Rules

- **Centralized Middleware Stack:** All security (Helmet, CORS), logging (Morgan), and parsing middlewares must remain organized in `app.ts`.
- **No Uncaught Exceptions:** Always route unexpected errors to `next(err)` or throw managed errors that the global `errorHandler` middleware catches.
- **Standardized Response Envelope:** Every controller response must use the helper:
  - Success: `ApiResponse.success(res, message, data, statusCode)`
  - Error: `ApiResponse.error(res, message, error, statusCode)`
- **Graceful Shutdown:** Process termination listeners (`SIGTERM`, `SIGINT`) in `server.ts` must close database connections and active HTTP sockets cleanly.

---

## 7. API Rules

- **RESTful Endpoints:** Endpoints must use standard HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) with plural noun resource paths (e.g., `/api/v1/print-jobs`).
- **API Versioning:** All API endpoints must be prefixed with `/api/v1/`.
- **Contract First:** Every new endpoint must be declared in `API_CONTRACT.md` before coding starts.
- **Consistent Status Codes:**
  - `200 OK` / `201 Created` for successful actions.
  - `400 Bad Request` for invalid input / validation failures.
  - `401 Unauthorized` for missing/invalid credentials.
  - `403 Forbidden` for insufficient permissions.
  - `404 Not Found` for missing resources.
  - `500 Internal Server Error` for unhandled system failures.
- **Centralized Client:** Frontend must exclusively use `apiClient` (`src/lib/axios.ts`) for all network requests. Never use global `fetch` or new `axios` instances.

---

## 8. Folder & File Rules

- **Strict Directory Layout:** Always place files in their designated directories:
  - Frontend: `src/components/{common|layout|ui}`, `src/pages`, `src/routes`, `src/hooks`, `src/services`, `src/lib`, `src/types`, `src/utils`, `src/constants`.
  - Backend: `src/config`, `src/controllers`, `src/routes`, `src/middleware`, `src/services`, `src/models`, `src/utils`, `src/types`, `src/lib`, `src/database`, `src/constants`.
- **Barrel Exports:** Every subdirectory should maintain an `index.ts` barrel file to provide clean and consistent module imports.

---

## 9. Naming Rules

- **Components & Layouts:** `PascalCase.tsx` (e.g., `MainLayout.tsx`, `PrintJobCard.tsx`).
- **Hooks:** `camelCase.ts` starting with `use` (e.g., `usePrintJob.ts`, `useAuth.ts`).
- **Services, Utils, Configs:** `camelCase.ts` (e.g., `env.config.ts`, `printService.ts`, `formatDate.ts`).
- **Types & Interfaces:** `PascalCase` with descriptive names (e.g., `PrintJobResponse`, `CreateJobDto`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE_MB`, `API_PREFIX`).

---

## 10. Database Rules

- Always execute schema changes through Prisma migrations (`npx prisma migrate dev`). Never mutate production database tables manually.
- Table names mapped to lowercase plural snake_case via `@@map("table_names")`.
- Include `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` on all primary entity models.
- Always use indexed foreign keys for relational lookups.

---

## 11. Error Handling Rules

- Backend: Throw standard `Error` objects with optional status codes, or use custom application error classes.
- Frontend: Handle errors gracefully using TanStack Query `onError` / `isError` states and present user-friendly error banners/toasts.
- Never leak database stack traces, SQL errors, or sensitive internal paths to the client in production (`NODE_ENV === 'production'`).

---

## 12. Security Rules

- **Input Sanitization:** Validate all incoming request parameters and bodies.
- **File Upload Security:** Validate MIME types, limit max file size (e.g. 50MB), and store files using generated UUID names.
- **No Hardcoded Secrets:** API keys, database credentials, and JWT secrets must strictly reside in `.env`.
- **CORS Protection:** Restrict allowed origins to trusted client domains.

---

## 13. Git & Workflow Rules

- Write clean, descriptive commit messages following the Conventional Commits format (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- Keep `.env` and local build outputs out of version control.

---

## 14. Documentation Rules

- **`MEMORY.md` Update:** Every completed feature or architectural milestone MUST update `MEMORY.md`.
- **`ARCHITECTURE.md` Update:** Any addition or modification to system design must be documented in `ARCHITECTURE.md`.
- **`API_CONTRACT.md` Update:** Any new or modified endpoint must update `API_CONTRACT.md`.

---

## 15. AI Agent Rules

- **Zero Hallucinated Imports:** Only import packages and files that actually exist in the workspace.
- **Check Constraints First:** Before generating code, verify whether the proposed solution adheres to all rules in this document.
- **Refactor Safely:** When updating existing files, preserve all unrelated code, comments, and structure.
