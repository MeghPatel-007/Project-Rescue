# Task: Generate Production-Ready Drizzle and Mongoose Schemas for ProjectRescue

Act as a **senior database architect, PostgreSQL DBA, Drizzle ORM expert, MongoDB/Mongoose expert, and Better Auth integration specialist**.

Design and implement the complete database schema layer for **ProjectRescue**, an agentic project-recovery platform that integrates with GitHub and provides AI-powered blocker detection, recovery planning, approval workflows, and controlled action execution. The application also exposes capabilities through an MCP server for an Alexa+ hackathon experience.

## 1. Technology Stack

- TypeScript
- PostgreSQL
- Drizzle ORM
- Better Auth with its Drizzle adapter
- MongoDB
- Mongoose
- Node.js
- Zod for application-level validation
- GitHub REST API and webhooks
- MCP server for exposing agent tools

Generate real, compilable TypeScript code, not pseudocode.

## 2. Database Architecture

Use a hybrid database architecture with explicit ownership boundaries.

### PostgreSQL + Drizzle ORM

PostgreSQL is the canonical source of truth for relational application data, authentication, authorization, GitHub project state, dependencies, recovery plans, approvals, action executions, agent-run metadata, and audit events.

Use Drizzle ORM for all relational tables and migrations.

### MongoDB + Mongoose

MongoDB stores flexible, document-oriented data that benefits from schema flexibility, such as:

- GitHub project snapshots
- Selected raw webhook payload archives
- Agent diagnostic artifacts
- Structured tool traces and inspection metadata
- Large recovery-analysis artifacts

Use Mongoose for MongoDB models, validation, indexes, and document lifecycle management.

Do not duplicate canonical relational records in MongoDB. MongoDB documents may reference PostgreSQL UUIDs as strings, but cross-database foreign keys do not exist. Explain how consistency is maintained.

If a collection does not provide a meaningful benefit for the MVP, identify it as optional.

## 3. Drizzle ORM Schema Requirements

Create modular Drizzle schemas for all the following tables:

### Authentication

1. `users`
2. `sessions`
3. `accounts`

These must be compatible with the installed Better Auth version and its Drizzle adapter. Verify the expected field names, types, and model configuration against the installed version or official documentation. Prefer generating the authentication schema through Better Auth's supported schema workflow instead of manually guessing its internal requirements.

Include any additional Better Auth tables required by the configured features, such as verification tokens, if applicable.

### Workspace and GitHub

4. `workspaces`
5. `workspaceMembers`
6. `githubInstallations`
7. `projects`

### GitHub project state

8. `githubIssues`
9. `githubPullRequests`
10. `issueDependencies`
11. `syncRuns`

### AI recovery planning

12. `recoveryPlans`
13. `recoveryPlanItems`
14. `approvals`
15. `actionExecutions`
16. `agentRuns`
17. `auditEvents`

Use the exact logical entities and relationships supplied in this task. Improve the design when necessary and explain each meaningful change.

## 4. Relationship Requirements

Implement proper PostgreSQL foreign keys with explicit deletion behavior.

Required relationships:

- Users to sessions and accounts.
- Users and workspaces through workspace memberships.
- Workspaces to GitHub installations and projects.
- GitHub installations to projects.
- Projects to issues, pull requests, dependency edges, synchronization runs, and recovery plans.
- Issues to dependency edges through their blocking and blocked issue roles.
- Recovery plans to recovery plan items.
- Issues to recovery plan items.
- Users to recovery-plan creators.
- Recovery plan items to approval records.
- Users to approval requesters and decision makers.
- Approvals to action executions.
- Projects and plans to agent runs.
- Workspaces, users, and projects to audit events.

Use explicit references and avoid circular imports between schema modules.

Ensure that both ends of issue dependencies belong to the same project. Explain how to enforce this with database constraints, triggers, or transactional service validation.

## 5. Data Modeling Improvements

Do not blindly copy the original schema if doing so creates integrity problems.

Evaluate and implement the following:

- UUID primary keys for application-owned records.
- Unique constraints for workspace slugs, memberships, GitHub installation IDs, project repository identity, external GitHub issue/PR IDs, and plan versions.
- Appropriate indexes for common filters and joins.
- Foreign keys with deliberate `onDelete` behavior.
- Timestamps with timezone awareness.
- Explicit status and action types using PostgreSQL enums or validated alternatives.
- JSONB for flexible relational metadata and plan assumptions.
- Optimistic concurrency controls for project synchronization and recovery plans.
- Idempotency keys for GitHub action execution.
- Safe webhook deduplication using GitHub delivery IDs.
- Workspace-level authorization and tenant isolation.
- Audit records for consequential changes.
- Proper handling of GitHub issue versus pull-request numbering.
- Correct modeling of proposed actions, approvals, and actual execution attempts.

Consider adding `githubDeliveryEvents`, `agentToolCalls`, or a separate `actionExecutionAttempts` table only if they provide clear architectural value. Explain whether each is required for the MVP.

Do not store GitHub access tokens in plaintext. Use a secure secret-management or encrypted-token strategy.

## 6. Mongoose Schema Requirements

Generate separate, production-minded Mongoose models for:

### A. `GitHubSnapshot`

Store a point-in-time snapshot of a project's relevant GitHub state.

Fields should include:

- `workspaceId`
- `projectId`
- `syncRunId`
- `sourceVersion`
- `capturedAt`
- `issues`
- `pullRequests`
- `metadata`
- `schemaVersion`

Use typed nested schemas instead of unrestricted `Schema.Types.Mixed` wherever practical.

Add indexes for project history, source version, and snapshot identity.

### B. `AgentArtifact`

Store agent diagnostic artifacts independently of canonical PostgreSQL audit data.

Fields should include:

- `workspaceId`
- `projectId`
- `agentRunId`
- `artifactType`
- `schemaVersion`
- `content`
- `createdAt`

Support artifact types such as:

- `context_summary`
- `tool_trace`
- `evaluation`
- `error_report`

Use explicit validation, appropriate indexes, and optional retention policies.

Do not store credentials, sensitive secrets, or unrestricted internal reasoning traces.

### C. `WebhookPayloadArchive` (optional)

If justified, store selected sanitized webhook payloads for debugging and replay.

Include:

- `deliveryId`
- `eventType`
- `projectId`
- `receivedAt`
- `payload`
- `processingStatus`
- `schemaVersion`

Explain how webhook deduplication remains authoritative in PostgreSQL even if payload archives live in MongoDB.

## 7. Expected Folder Structure

Generate the implementation in this structure, adapting it if necessary:

```text
src/
├── db/
│   ├── drizzle.ts
│   ├── schema/
│   │   ├── index.ts
│   │   ├── auth-schema.ts
│   │   ├── workspace.ts
│   │   ├── github-installation.ts
│   │   ├── project.ts
│   │   ├── github-issue.ts
│   │   ├── github-pull-request.ts
│   │   ├── issue-dependency.ts
│   │   ├── sync-run.ts
│   │   ├── recovery-plan.ts
│   │   ├── recovery-plan-item.ts
│   │   ├── approval.ts
│   │   ├── action-execution.ts
│   │   ├── agent-run.ts
│   │   └── audit-event.ts
│   └── migrations/
├── mongodb/
│   ├── connection.ts
│   └── models/
│       ├── github-snapshot.ts
│       ├── agent-artifact.ts
│       └── webhook-payload-archive.ts
├── repositories/
├── services/
├── validation/
└── index.ts
```

## 8. Deliverables

Generate the following in order:

1. Architecture explanation and database ownership matrix.
2. Final relational ER model.
3. Complete Drizzle schema files for all PostgreSQL tables.
4. Better Auth configuration and schema-generation instructions.
5. Complete Mongoose models and MongoDB connection module.
6. Drizzle client initialization and connection pooling configuration.
7. Zod validation schemas for important inputs and outputs.
8. `drizzle.config.ts`, environment-variable examples, and migration commands.
9. MongoDB index creation and migration instructions.
10. Example repository functions for creating a workspace, connecting a project, synchronizing GitHub issues, generating a recovery plan, requesting approval, and executing an approved action.
11. Transactions, idempotency, authorization, concurrency, and error-handling guidance.
12. Automated tests for relationships, uniqueness, validation, webhook deduplication, and approval-to-execution safety.

## 9. Coding Standards

- Use strict TypeScript.
- Avoid `any` unless explicitly justified.
- Use inferred Drizzle types such as `$inferSelect` and `$inferInsert`.
- Use Mongoose `InferSchemaType` or equivalent inferred model types where appropriate.
- Keep schema definitions modular and avoid circular imports.
- Avoid duplicating Better Auth-managed tables or conflicting with its generated schema.
- Do not fabricate library APIs or configuration options.
- State the supported library versions and verify version-sensitive APIs.
- Do not put all models in one enormous file.
- Do not leave TODO placeholders in core schemas.
- Provide complete imports and exports.
- Explain all non-obvious constraints.
- Separate schema validation from authorization and business logic.
- Use transactions for relational operations that must succeed or fail together.
- Never claim that a cross-database transaction exists between PostgreSQL and MongoDB.

## 10. Implementation Strategy

Build the canonical PostgreSQL + Drizzle schema first, then the Better Auth integration, then MongoDB models.

If the complete output is too large, deliver it in clearly labeled implementation phases. Ensure each phase is internally consistent and compilable before moving to the next.

The final result should be a secure, maintainable, production-minded database foundation for ProjectRescue—not just a diagram converted into tables.