# ProjectRescue

> **When your project falls behind, your agent gets you back on track.**

ProjectRescue is an AI-powered GitHub repository intelligence and recovery platform. It inspects repository health, analyzes dependency bottlenecks and blockers, creates evidence-backed recovery plans, and executes approved fixes under strict two-phase human governance.

---

## Architecture & Directory Structure

ProjectRescue is implemented as a modular full-stack application following clean architecture boundaries:

```text
src/
├── app/                      # Next.js App Router (Routes & Layouts only)
│   ├── (auth)/               # Authentication routes (/sign-in, /signup)
│   ├── api/                  # Thin API route handlers (Auth, Workspaces, Webhooks)
│   ├── app/                  # Authenticated workspace application shell (/app/*)
│   └── dashboard/            # Project health dashboard & recovery overview
├── components/
│   ├── layout/               # Shared layout components (AppSidebar, SiteHeader, WorkspaceSwitcher, ThemeToggle)
│   └── ui/                   # Design system primitives (Tailwind CSS v4 + Base UI)
├── db/                       # PostgreSQL database layer (Drizzle ORM)
│   ├── schema/               # Modular Drizzle table definitions (*.schema.ts)
│   └── index.ts              # Database client export
├── features/                 # Colocated frontend feature modules
│   ├── auth/                 # Sign-in and Sign-up components
│   ├── dashboard/            # Metrics cards, interactive charts, data table
│   └── landing/              # Marketing hero and action components
├── hooks/                    # Reusable React hooks
├── lib/                      # Core backend utilities (auth, api-session, mongodb)
├── models/                   # Mongoose models for document storage (snapshots, artifacts, archives)
├── modules/                  # Application use cases, domain policies, and services
│   └── workspaces/           # Workspace lifecycle, RBAC matrix, and audit logging
├── providers/                # React context providers (ThemeProvider)
├── repositories/             # Persistence data access layer (*.repository.ts)
├── types/                    # Domain and TypeScript interfaces (*.type.ts)
└── validation/               # Runtime input validation schemas (*.validation.schema.ts)
```

---

## Naming Conventions

- **Directories & TypeScript modules:** `kebab-case` (`workspace.service.ts`, `recovery-plan.repository.ts`).
- **React Components:** `PascalCase.tsx` (`AppSidebar.tsx`, `LoginForm.tsx`, `LandingHero.tsx`).
- **Descriptive File Suffixes:**
  - `.schema.ts` — Drizzle table schemas
  - `.model.ts` — Mongoose models
  - `.type.ts` — TypeScript types and domain interfaces
  - `.repository.ts` — Persistence repository implementations
  - `.service.ts` — Application services and use cases
  - `.policy.ts` — Authorization and business policies
  - `.test.ts` — Automated test suites
  - `.validation.schema.ts` — Zod runtime schemas
- **PostgreSQL Tables & Columns:** Plural `snake_case` (`workspaces`, `recovery_plans`, `audit_events`).

---

## Verification & Quality Gates

Run all automated quality checks with Bun:

```bash
bun run lint         # ESLint static analysis
bun run typecheck    # TypeScript strict check
bun test             # Unit and integration test suites
bun run build        # Production Next.js build
```
