# ProjectRescue --- Master Development Plan

> **Purpose:** The single source of truth for product scope,
> architecture, data ownership, AI-agent behavior, GitHub integration,
> MCP/Alexa+ demonstration, security, implementation phases, testing,
> and AI-assisted commit governance.

## 1. Product vision

ProjectRescue is an AI-powered GitHub project recovery agent. It
identifies why work is blocked, analyzes dependencies and release risk,
creates an explainable recovery plan, and prepares GitHub changes for
human approval.

Example user requests: - Why is our release delayed? - Which issues are
blocking the most work? - What should we fix first? - Can we recover the
release timeline? - Prepare changes but do not execute until I
approve. - What did the agent change, and who approved it?

**Core principle:** the recovery engine owns business logic. The web
app, AI orchestration, and MCP server call the same services. No adapter
should reimplement the recovery rules.

## 2. Product modules

1.  **GitHub intelligence:** repositories, issues, pull requests,
    labels, milestones, assignments, relationships, activity, and
    synchronization.
2.  **Recovery engine:** blocker detection, dependency graph, risk and
    priority scoring, candidate plans, validation, and versioning.
3.  **Conversational interface:** Next.js chat, project-health
    dashboard, dependency visualization, plan review, and approval UI.
4.  **MCP integration:** discoverable tools over the required transport,
    with validated inputs and authorization.
5.  **Governance and execution:** human approval, fresh-state checks,
    idempotency, audit records, reconciliation, and failure handling.
6.  **Engineering governance:** modular architecture, tests, CI, feature
    checklists, AI-assisted implementation, and traceable commits.

## 3. Recommended technology stack

  -----------------------------------------------------------------------------
  Layer                   Technology                    Responsibility
  ----------------------- ----------------------------- -----------------------
  Frontend                Next.js, React, TypeScript    Chat, dashboard, plan
                                                        and approval UI

  UI                      Tailwind CSS, shadcn/ui       Reusable UI components

  Authentication          Better Auth                   Identity and sessions

  Primary database        PostgreSQL on Neon            Transactional
                                                        application data

  SQL ORM                 Drizzle ORM                   Typed schemas, queries,
                                                        migrations

  Optional document       MongoDB with Mongoose         Only justified
  database                                              document-oriented
                                                        workloads

  GitHub                  GitHub App, Octokit           Repository reads and
                                                        approved writes

  AI                      Provider-independent LLM      Reasoning and tool
                          adapter                       selection

  Validation              Zod                           Runtime input/output
                                                        validation

  MCP                     `@modelcontextprotocol/sdk`   MCP server and
                                                        Streamable HTTP

  API                     Next.js route handlers or     Application endpoints
                          separate Node.js API          

  Tests                   Vitest, integration tests,    Unit through end-to-end
                          Playwright                    tests

  CI/CD                   GitHub Actions                Lint, type check,
                                                        tests, build,
                                                        deployment

  Hosting                 Vercel plus suitable Node.js  Web and persistent
                          host                          API/MCP services
  -----------------------------------------------------------------------------

### Database decision

Use PostgreSQL as the canonical transactional database. For the MVP,
PostgreSQL alone is sufficient. Add MongoDB only when a documented
access pattern or workload justifies operating a second database.

-   PostgreSQL: users/auth references, workspaces, memberships,
    installations, repositories, snapshots metadata, recovery plans,
    plan items, proposals, approvals, executions, agent runs, audit
    logs.
-   MongoDB, if needed: large versioned raw snapshots or flexible
    intermediate agent traces.
-   GitHub is authoritative for actual repository issue/PR state.
-   Do not split one entity's ownership between PostgreSQL and MongoDB.
-   Do not duplicate Better Auth-owned tables without a clear
    integration requirement.

## 4. Architecture

``` text
Next.js dashboard / chat / Alexa+-style simulator
                    |
Authentication, API validation, tenant authorization
                    |
        +-----------+-----------+
        |                       |
 Recovery application      MCP adapter
 services                  initialize/list/call
        |                       |
        +-----------+-----------+
                    |
     GitHub adapter + persistence services
                    |
 PostgreSQL/Drizzle; optional MongoDB/Mongoose
                    |
Approval -> fresh-state validation -> execution -> verification -> audit
```

### Architecture rules

1.  UI never connects directly to databases.
2.  Controllers and route handlers stay thin.
3.  MCP handlers are adapters that call application services.
4.  GitHub writes go through a single governed adapter.
5.  Planning and execution are separate operations.
6.  Persist security-relevant state changes and execution outcomes.
7.  Treat GitHub content and other external text as untrusted data.
8.  External integrations use timeouts, bounded retries, error mapping,
    and observability.
9.  Do not keep a database transaction open while waiting for an LLM or
    external API.
10. Avoid premature microservices; begin with a modular monolith plus a
    separately deployable MCP entry point if required.

## 5. Repository structure

``` text
project-rescue/
├── apps/
│   ├── web/
│   └── mcp-server/
├── packages/
│   ├── database/
│   │   ├── drizzle/schema/
│   │   ├── drizzle/relations/
│   │   ├── drizzle/migrations/
│   │   ├── mongoose/              # optional
│   │   └── client/
│   ├── shared-types/
│   ├── validation/
│   ├── config/
│   ├── logger/
│   └── testing/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── workspaces/
│   │   ├── memberships/
│   │   ├── github-installations/
│   │   ├── repositories/
│   │   ├── issues/
│   │   ├── pull-requests/
│   │   ├── dependency-analysis/
│   │   ├── project-health/
│   │   ├── recovery-plans/
│   │   ├── approvals/
│   │   ├── action-execution/
│   │   ├── agent-runs/
│   │   ├── audit-logs/
│   │   └── notifications/
│   ├── integrations/
│   │   ├── github/
│   │   ├── ai/
│   │   └── mcp/
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── queues/
│   │   ├── cache/
│   │   └── observability/
│   └── lib/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   └── e2e/
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── adr/
│   ├── security/
│   └── demo/
├── .github/workflows/
├── PLAN.md
├── README.md
├── CONTRIBUTING.md
└── .env.example
```

Create folders as features require them; avoid empty scaffolding. For a
module, use only the layers it needs:

``` text
recovery-plans/
├── schemas/recovery-plan.schema.ts
├── models/recovery-plan.model.ts
├── types/recovery-plan.type.ts
├── repositories/recovery-plan.repository.ts
├── services/recovery-plan.service.ts
├── services/recovery-plan-validation.service.ts
├── controllers/recovery-plan.controller.ts
├── routes/recovery-plan.routes.ts
├── validators/recovery-plan.validator.ts
├── errors/recovery-plan.error.ts
├── tests/recovery-plan.service.test.ts
└── index.ts
```

For Next.js, route handlers may replace conventional controllers/routes.
Keep responsibilities separated even if the physical files differ.

## 6. Naming, types, and schema standards

Use consistent lowercase kebab-case file names, such as
`recovery-plan.schema.ts`. Use PascalCase for types and classes,
camelCase for variables/functions, and a consistent database naming
convention such as snake_case columns.

-   `*.schema.ts`: Drizzle table/column definitions or Mongoose schema
    definitions.
-   `*.model.ts`: model/query compositions where useful; do not add an
    unnecessary model layer to Drizzle.
-   `*.type.ts`: domain types and interfaces.
-   `*.validator.ts`: Zod runtime validation.
-   `*.repository.ts`: persistence queries only.
-   `*.service.ts`: business rules and orchestration.
-   `*.controller.ts` / route handlers: request/response translation.
-   `*.error.ts`: typed domain errors.
-   `*.test.ts`: colocated tests or tests in the dedicated test
    directory.

Infer database types when practical:

``` ts
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

Do not redefine the same type in multiple places. Keep database row
types, API DTOs, and domain models distinct only when their
responsibilities differ. Avoid `any`; use `unknown` plus validation at
trust boundaries.

## 7. Data model and ownership

### Core relational entities

-   **Identity:** Better Auth user/session/account tables as
    appropriate.
-   **Collaboration:** `workspaces`, `workspace_members`.
-   **Integration:** `github_installations`, `repositories`.
-   **Source state:** `project_snapshots` and synchronization metadata.
-   **Recovery:** `recovery_plans`, `recovery_plan_items`.
-   **Governance:** `action_proposals`, `approvals`,
    `action_executions`.
-   **Observability:** `agent_runs`, `audit_logs`.

Suggested relationships:

``` mermaid
erDiagram
    USERS ||--o{ WORKSPACE_MEMBERS : joins
    WORKSPACES ||--o{ WORKSPACE_MEMBERS : contains
    WORKSPACES ||--o{ GITHUB_INSTALLATIONS : owns
    GITHUB_INSTALLATIONS ||--o{ REPOSITORIES : provides
    REPOSITORIES ||--o{ PROJECT_SNAPSHOTS : captures
    REPOSITORIES ||--o{ RECOVERY_PLANS : analyzed
    USERS ||--o{ RECOVERY_PLANS : requests
    RECOVERY_PLANS ||--o{ RECOVERY_PLAN_ITEMS : contains
    RECOVERY_PLANS ||--o{ ACTION_PROPOSALS : produces
    ACTION_PROPOSALS ||--o{ APPROVALS : requires
    ACTION_PROPOSALS ||--o{ ACTION_EXECUTIONS : executes
    USERS ||--o{ APPROVALS : decides
    WORKSPACES ||--o{ AUDIT_LOGS : records
```

### Database integrity rules

-   Use a consistent opaque ID strategy for internal entities.
-   Store GitHub external IDs separately from internal IDs.
-   Add unique constraints for external repository identities and
    installation associations.
-   Add indexes for workspace membership, repository lookup, plan
    status, and recent executions.
-   Use foreign keys and transactions for related relational records.
-   Use version numbers or optimistic concurrency for plan updates and
    approvals.
-   Store timestamps in UTC.
-   Define retention rules for raw snapshots and large traces.
-   Never store private keys, access tokens, or secrets in ordinary JSON
    payloads or logs.
-   Enforce tenant authorization in services and consider PostgreSQL
    row-level security where appropriate.

Suggested schema files:

``` text
user.schema.ts
workspace.schema.ts
workspace-member.schema.ts
github-installation.schema.ts
repository.schema.ts
project-snapshot.schema.ts
recovery-plan.schema.ts
recovery-plan-item.schema.ts
action-proposal.schema.ts
approval.schema.ts
action-execution.schema.ts
agent-run.schema.ts
audit-log.schema.ts
```

## 8. Recovery engine

The recovery engine is the product's core differentiator. Use
deterministic planning and validation, enhanced by AI for interpretation
and recommendations. Do not let an LLM invent unsupported facts or
unverified schedules.

### Workflow

1.  Fetch GitHub state.
2.  Normalize and validate data.
3.  Detect blockers.
4.  Build dependency graph.
5.  Calculate priority and release risk.
6.  Generate candidate recovery plan.
7.  Validate dependencies and constraints.
8.  Revise or report infeasibility if invalid.
9.  Persist a versioned proposal.
10. Request human review.
11. Recheck current GitHub state after approval.
12. Execute approved actions.
13. Verify results and write audit records.

### Blocker categories

-   Dependency blocker: prerequisite work is incomplete.
-   Review blocker: PR is awaiting review or required changes.
-   Assignment blocker: ownership is missing where it is required.
-   Stale-work blocker: no meaningful progress in a configurable
    interval.
-   External blocker: another team, service, or decision is required.
-   Release blocker: explicit release criteria are not satisfied.
-   Data-quality blocker: dependency, date, or status information is
    missing or contradictory.

Distinguish observed facts from inferred risks.

### Dependency graph

Represent tasks as nodes and prerequisite relationships as directed
edges. Detect cycles. Do not treat every issue reference as a blocking
dependency. Support unknown durations and incomplete dependency
information. Identify critical-path tasks only when sufficient
dependency and duration data exists.

### Explainable prioritization

A configurable heuristic can use:

`P = w_b * B + w_c * C + w_r * R + w_a * A + w_d * D`

Where B = blocker impact, C = critical-path relevance, R = release risk,
A = age/staleness, and D = dependency centrality. Normalize inputs to
comparable ranges, document weights, and test with realistic scenarios.
Missing information should reduce confidence rather than automatically
increase priority. Do not present heuristic scores as calibrated
probabilities.

### Recovery plan output

Every plan should contain: - Current health summary and evidence. -
Release target and assumptions. - Top blockers and why they matter. -
Ordered tasks and prerequisites. - Suggested owners only when
justified. - Effort estimates and schedule ranges only when supported by
data. - Proposed GitHub changes. - Risks, unknowns, and alternative
paths. - Confidence and validation findings. - Source snapshot timestamp
and plan version.

**The LLM proposes; deterministic validators check whether the proposal
satisfies constraints.**

## 9. GitHub integration

Use a GitHub App for team installations rather than a developer's
personal token as the production authorization model.

### Read capabilities

-   List accessible repositories.
-   Fetch issues, PRs, labels, milestones, assignments, and relevant
    relationships.
-   Read review and merge status.
-   Retrieve recent activity where permissions allow.
-   Process webhook events and reconcile repository state.

### Initial write capabilities

-   Add/remove labels.
-   Assign issues to eligible users.
-   Update supported milestone fields.
-   Add comments describing approved decisions.
-   Defer code generation or PR creation until explicitly in scope.

Do not begin with unrestricted writes, automatic merges, or arbitrary
shell execution.

### Webhook and sync rules

-   Verify webhook signatures.
-   Deduplicate delivery IDs.
-   Handle out-of-order events.
-   Acknowledge quickly and process heavy work asynchronously.
-   Reconcile periodically because webhook delivery can fail.
-   Record source timestamps and synchronization status.
-   Mark plans stale when relevant repository state changes.

## 10. Alexa+ and MCP

Treat Alexa+ as the intended conversational interaction model and MCP as
the capability interface. Build the recovery system independently so it
remains useful in the web app and other compatible clients.

### Proposed tools

  ---------------------------------------------------------------------------
  Tool                        Access                  Purpose
  --------------------------- ----------------------- -----------------------
  `get_project_health`        Read                    Health indicators and
                                                      risks

  `find_blockers`             Read                    Evidenced blockers and
                                                      dependencies

  `create_recovery_plan`      Create proposal         Generate and persist a
                                                      plan

  `validate_recovery_plan`    Read/validate           Check constraints and
                                                      dependencies

  `get_plan_status`           Read                    Plan status and
                                                      execution progress

  `propose_github_action`     Create proposal         Prepare a narrowly
                                                      scoped change

  `get_pending_approvals`     Read                    Retrieve authorized
                                                      pending requests

  `approve_recovery_action`   Governed write          Record explicit
                                                      authenticated approval

  `execute_approved_action`   Governed write          Execute a valid
                                                      approved action

  `replan_project`            Create proposal         Refresh data and revise
                                                      a plan
  ---------------------------------------------------------------------------

Finalize exact schemas and tool names during implementation. Each tool
needs a stable description, Zod input schema, workspace/repository
authorization, structured errors, timeouts, bounded retries, correlation
IDs, and tests.

### MCP demo path

The Alexa+-style simulator must make real MCP requests to the hosted
server: 1. Initialize the protocol session. 2. Discover tools. 3. Call
tools with validated arguments. 4. Render actual results and errors. 5.
Show the recovery plan and evidence. 6. Require approval for writes. 7.
Show verified GitHub state after execution.

Do not simulate MCP calls entirely inside the frontend. Do not assume
access to a private Alexa+ preview device or partner tooling.

Before submission, verify current requirements for protocol version,
transport, and permitted demonstration approach: -
https://amazonappdev2026.devpost.com/rules -
https://amazonappdev2026.devpost.com/details/faqs -
https://developer.amazon.com/ja/docs/alexaplus/add-ons/mcp-toolkit-overview.html

Treat any previously mentioned protocol version as a requirement to
confirm against the rules in force at submission time.

## 11. Authentication, security, and trust

### Authentication and authorization

-   Use Better Auth for identity and sessions.
-   Check workspace membership on every protected operation.
-   Define roles such as owner, admin, maintainer, and viewer.
-   Enforce GitHub installation permissions independently of workspace
    roles.
-   Never trust client-supplied IDs without checking access.
-   Distinguish user identity from agent/service identity.

### AI safety

-   Treat issue bodies, PR comments, README content, and external text
    as untrusted input.
-   Do not follow instructions embedded in repository content that
    attempt to override policies.
-   Give models only the tools and data required for their current task.
-   Do not permit arbitrary SQL, shell execution, or unrestricted HTTP
    calls.
-   Validate structured model output against schemas and business
    constraints.
-   Keep secrets out of prompts, logs, and recovery plans.

### Mutation gates

1.  Authenticate the user.
2.  Verify workspace and repository access.
3.  Check proposal state and version.
4.  Confirm approval applies to the exact proposed change.
5.  Recheck current GitHub state.
6.  Validate target and input.
7.  Deduplicate or enforce idempotency where possible.
8.  Execute through the GitHub adapter.
9.  Verify the resulting GitHub state.
10. Persist outcome and audit record.

For uncertain outcomes, record `unknown` or `reconciliation_required`
instead of claiming success or blindly repeating a write.

## 12. AI-assisted commit and implementation governance

Deliver features in small, testable, reviewable stages. A possible
sequence for a module:

1.  Schema and data modeling: `feat(database): add recovery plan schema`
2.  Validation and domain rules:
    `feat(recovery): validate plan inputs and transitions`
3.  Repository and service logic:
    `feat(recovery): implement recovery plan service`
4.  API/MCP integration: `feat(mcp): expose recovery plan tools`
5.  Integration/regression tests:
    `test(recovery): cover plan validation and authorization`

These are examples, not a rigid commit quota. Never create artificial
commits merely to hit a number.

### AI coding-agent workflow

1.  Read `PLAN.md`, conventions, and relevant architecture decisions.
2.  Inspect existing code before editing.
3.  Define scope and acceptance criteria.
4.  Implement one coherent stage at a time.
5.  Run formatting, linting, type checks, and relevant tests.
6.  Inspect the diff for secrets, unrelated changes, and incomplete
    logic.
7.  Commit only after validation passes.
8.  Update feature status and test evidence.
9.  Report commits, remaining tasks, and blockers.

Do not blindly push to the default branch, rewrite shared history, or
bypass review requirements. Represent authorship and provenance
honestly. Record actual commit SHAs; never invent SHAs or mark work
complete just because code was generated.

### Per-feature checklist

-   [ ] Schema and migration
-   [ ] Domain types and validation
-   [ ] Repository and service logic
-   [ ] API/MCP integration
-   [ ] Unit and integration tests
-   [ ] Security review
-   [ ] Documentation
-   [ ] Acceptance criteria verified

## 13. API conventions

Example routes, to be finalized based on actual UI requirements:

``` text
GET    /api/v1/workspaces
POST   /api/v1/workspaces
GET    /api/v1/repositories
GET    /api/v1/repositories/:repositoryId/health
GET    /api/v1/repositories/:repositoryId/blockers
POST   /api/v1/repositories/:repositoryId/recovery-plans
GET    /api/v1/recovery-plans/:planId
POST   /api/v1/recovery-plans/:planId/validate
POST   /api/v1/action-proposals
GET    /api/v1/action-proposals/:proposalId
POST   /api/v1/action-proposals/:proposalId/approve
POST   /api/v1/action-proposals/:proposalId/execute
GET    /api/v1/agent-runs/:runId
GET    /api/v1/audit-logs
```

Standardize error responses:

``` ts
export interface IAppErrorResponse {
  code: string;
  message: string;
  requestId: string;
  details?: Record<string, unknown>;
}
```

Do not expose stack traces, raw database errors, private tokens, or
hidden model prompts. Define domain errors such as
`WORKSPACE_ACCESS_DENIED`, `REPOSITORY_NOT_FOUND`, `PLAN_STALE`,
`APPROVAL_REQUIRED`, `ACTION_ALREADY_EXECUTED`, and
`GITHUB_RATE_LIMITED`.

## 14. Implementation roadmap

### Phase 1 --- Foundation and authentication

-   Set up TypeScript workspace, linting, formatting, environment
    validation, PostgreSQL, Drizzle migrations, Better Auth, workspace
    membership, and CI.
-   **Exit criterion:** an authenticated user can create a workspace and
    only access authorized data.

### Phase 2 --- GitHub integration

-   Create GitHub App, installation flow, webhook verification, issue/PR
    retrieval, normalization, and snapshots.
-   **Exit criterion:** select an installed repository and inspect real
    repository state.

### Phase 3 --- Recovery engine

-   Implement blocker detection, dependency graph, priority scoring,
    plan generation, deterministic validation, and plan versioning.
-   **Exit criterion:** generate a validated plan from real GitHub data
    with evidence and assumptions.

### Phase 4 --- AI orchestration and MCP

-   Add model adapter, controlled tool selection, MCP initialization,
    discovery, invocation, authorization, and error handling.
-   **Exit criterion:** a real MCP client retrieves health and creates a
    recovery proposal.

### Phase 5 --- Approval and execution

-   Implement proposal review, exact-action approvals, stale-state
    checks, safe execution, reconciliation, and audit.
-   **Exit criterion:** an approved action changes GitHub and the
    resulting state is verified.

### Phase 6 --- UI and hackathon demo

-   Build chat simulator, health dashboard, dependency visualization,
    plan review, approval screen, and action history. Deploy and run
    end-to-end tests.
-   **Exit criterion:** a reproducible demonstration from
    natural-language question to verified GitHub outcome.

### MVP versus later enhancements

**MVP:** one GitHub App flow, repository health, blocker detection,
dependency-aware recovery plan, MCP tools, human-approved actions, audit
history, and Alexa+-style simulator.

**Later:** more providers, calibrated predictive models, advanced
scheduling, portfolio optimization, and direct Alexa+ integration if
officially available and permitted.

Do not make a second database, predictive ML, autonomous code changes,
or real-device Alexa+ access prerequisites for the MVP.

## 15. Testing and CI quality gates

Required checks: - \[ \] Formatting and linting pass - \[ \] TypeScript
type checking passes - \[ \] Unit tests pass - \[ \] Migrations apply on
a clean database - \[ \] Integration tests pass - \[ \] Cross-workspace
isolation tests pass - \[ \] MCP protocol and tool-contract tests pass -
\[ \] Production build succeeds - \[ \] Secret scanning passes - \[ \]
Deployment health checks pass

Critical test cases: - Workspace A cannot access Workspace B's
repositories or plans. - Dependency cycles are detected. - Invalid model
output fails schema validation. - Rejected or expired proposals cannot
execute. - Approval for one proposal cannot authorize a modified
proposal. - Duplicate webhooks do not duplicate effects. - Stale plans
are revalidated. - GitHub timeouts do not create false success. -
Repeated actions do not duplicate effects where idempotency is
supported. - Malicious issue content cannot bypass approval. - MCP
callers cannot exceed their authorization scope. - Partial failures
remain visible in agent runs and audit history.

Do not use a coverage percentage as the only quality measure. Prioritize
business invariants, security boundaries, and failure modes.

## 16. Observability and operations

-   Use structured logs with request, workspace, repository, agent-run,
    and action correlation IDs where safe.
-   Track MCP tool latency and errors, GitHub rate limits, LLM
    latency/token use, plan validation failures, approval latency, and
    execution outcomes.
-   Redact secrets and sensitive content.
-   Add health/readiness checks and graceful shutdown.
-   Set bounded retry and timeout policies.
-   Use a queue for long-running sync or agent tasks when necessary.
-   Make agent-run states explicit, e.g. `queued`, `running`,
    `completed`, `failed`, `cancelled`.
-   Make action states explicit, e.g. `proposed`, `pending_approval`,
    `approved`, `executing`, `succeeded`, `failed`, `unknown`,
    `reconciliation_required`, `rejected`, `expired`.

## 17. Environment and deployment

Maintain `.env.example` with variable names and safe placeholders only.
Validate required variables at startup. Never commit real secrets.

Potential configuration categories: - Database connection URL. - Better
Auth secret and trusted application URL. - GitHub App ID, client ID,
private key, webhook secret, and callback URL. - AI provider API key and
model selection. - MCP public origin and authentication configuration. -
Logging, rate limits, and allowed origins.

Keep web and MCP deployments separately configurable. Use HTTPS for
public endpoints, least-privilege GitHub permissions, protected
environment secrets, and deployment health checks. Do not place
credentials in frontend environment variables.

## 18. Definition of Done

A feature is complete only when: 1. Acceptance criteria are written and
satisfied. 2. Types and runtime validation are in place. 3.
Authorization and tenant isolation are tested. 4. Business logic is
implemented in the appropriate service. 5. Unit/integration tests cover
success and failure paths. 6. Migrations and rollback/recovery
considerations are documented where relevant. 7. Lint, type checks,
tests, and build pass. 8. Logs and error states are actionable without
leaking secrets. 9. Documentation and `PLAN.md` status are updated. 10.
Changes are reviewed and committed with honest authorship/provenance.
11. Any externally visible behavior is verified in a realistic
end-to-end flow.

## 19. Hackathon demo script

1.  Connect or select a GitHub App installation and a real repository.
2.  Ask: "Why is our release delayed?"
3.  Show actual repository health and evidenced blockers.
4.  Ask ProjectRescue to create a recovery plan.
5.  Display dependency order, assumptions, and validation results.
6.  Propose a specific GitHub change.
7.  Show the exact change and request approval.
8.  Approve as an authorized user.
9.  Revalidate current state and execute the action.
10. Verify the resulting GitHub state and show the audit trail.
11. Demonstrate at least one negative case, such as stale plan or
    missing authorization.

Use seeded/demo repositories only if clearly identified as demo data.
Never represent hardcoded results as live GitHub operations.

## 20. Architecture decision records

Record decisions in `docs/adr/`, including: - Why PostgreSQL is
canonical and when MongoDB is justified. - Modular monolith versus
service boundaries. - GitHub App permission scope. - Recovery priority
model and its limitations. - MCP transport and authentication
strategy. - Approval semantics and action idempotency. - Snapshot/trace
retention policy.

Each ADR should contain context, decision, alternatives, consequences,
and date.

## 21. Immediate next steps

1.  Confirm the repository's current framework/package manager and
    actual directory layout.
2.  Finalize MVP scope and architecture decisions.
3.  Create the PostgreSQL/Drizzle foundation and Better Auth
    integration.
4.  Implement workspace authorization before repository access.
5.  Build a read-only GitHub integration and reliable snapshot flow.
6.  Implement deterministic blocker detection and plan validation.
7.  Expose the same services through MCP.
8.  Add exact-action approval and safe execution.
9.  Build the simulator and end-to-end demo.
10. Update this plan and record real commits as each stage is completed.

**North star:** ProjectRescue must explain its recommendations, ground
them in real repository evidence, validate plans independently, require
authorization for consequential actions, and prove what happened through
an auditable execution trail.
