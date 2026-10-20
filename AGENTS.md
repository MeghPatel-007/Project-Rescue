<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ProjectRescue — AI Agent Engineering & Governance Rules

## 1. Core Principles
- ProjectRescue is an AI-powered GitHub repository intelligence and recovery platform.
- The conversational/MCP interface is a consumer of backend services, NOT the authorization boundary.
- All mutating operations (e.g. creating/modifying GitHub issues, pull requests, labels) require explicit, two-phase human approval.
- PostgreSQL (via Drizzle ORM) is the authoritative source of truth for transactional data, RBAC, approvals, and audit trails.
- MongoDB (via Mongoose) is strictly reserved for high-volume, document-shaped data (snapshots, raw webhook archives, diagnostic artifacts).
- Every feature must be validated with runtime schemas (Zod) and automated tests.

## 2. Architecture & Layering Rules
- **Presentation:** UI components in `src/components/`, feature components in `src/features/`, and routes in `src/app/`. Never import DB or GitHub secrets into client components.
- **API & Interface:** Next.js route handlers validate inputs, resolve sessions, enforce workspace permissions, and delegate to application services.
- **Application Services:** Coordinate business workflows, state transitions, transactions, and audit logging (`src/modules/`).
- **Persistence:** Repositories (`src/repositories/`) encapsulate Drizzle (`src/db/`) and Mongoose (`src/models/`) queries.
- **Integration:** External adapters (`src/integration/github/`, `src/lib/ai/`) handle API rate limits, backoff, and signature verification.

## 3. Directory Structure & Naming Conventions
- **Directories:** `kebab-case` (`src/components/layout/`, `src/modules/workspaces/`).
- **TypeScript Modules:** `kebab-case` with descriptive suffixes (`workspace.service.ts`, `workspace.policy.ts`, `workspace.repository.ts`).
- **React Components:** `PascalCase.tsx` (`AppSidebar.tsx`, `LoginForm.tsx`, `LandingHero.tsx`).
- **PostgreSQL Entities:** Plural `snake_case` tables and `snake_case` columns (`workspaces`, `recovery_plans`).
- **No Ambiguous Names:** Avoid `data.ts`, `data.json`, `common.ts`, `helpers.ts`, `misc.ts`.

## 4. Security & Multi-Tenancy Invariants
- All protected resources are scoped to a `workspaceId`.
- Never trust client-supplied tenant identifiers without verifying membership through `workspaceMembers`.
- Webhooks must verify HMAC-SHA256 signatures before processing.
- Delivery events must be deduplicated using `githubDeliveryEvents` unique delivery IDs.
- Never commit private keys, tokens, or environment credentials.

## 5. Conventional Commits & Quality Gates
Before proposing or finalizing any commit:
1. `bun run lint` (ESLint static analysis)
2. `bun run typecheck` (TypeScript strict mode)
3. `bun test` (Unit & Integration tests)
4. Production build verification (`bun run build`)
Commit messages must follow the Conventional Commits specification: `feat(...)`, `fix(...)`, `test(...)`, `refactor(...)`, `docs(...)`.
