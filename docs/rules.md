when you create any schema make it segregated manner

user.schema.ts

define model use naming convention
user.model.ts


and make it as much moduler and make moduler

and define interface in types folder 

like

user.type.ts
export interface IUser {
  name: string;
  email: string;
  avatar?: string;
  // Use Types.ObjectId for references in the interface
  organization: Types.ObjectId; 
}


user.model.ts

import { Schema, model, Types } from 'mongoose';
import IUser from 'types/user.type'
// 1. Create an interface representing a document in MongoDB


// 2. Create a Schema corresponding to the document interface
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String },
  // Use Schema.Types.ObjectId in the schema definition
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
});

// 3. Create and export the Model
export const User = model<IUser>('User', userSchema);



# Database Design & Repository Architecture Rules

## 1. Core Principles

- Follow a modular, feature-based architecture.
- Keep database schemas, models, interfaces, validation, repositories, and services in separate files.
- Follow SOLID principles, DRY, separation of concerns, and single responsibility.
- Use TypeScript with strict type safety.
- Avoid duplicated definitions, unnecessary abstractions, and tightly coupled modules.
- Keep database access inside repositories rather than controllers or route handlers.
- Make every module independently understandable, testable, and maintainable.
- Use explicit, descriptive names and consistent exports.

## 2. Repository Structure
ch feature into dedicated folders.


```

Create folders only when they provide a meaningful organizational benefit. Do not create empty folders or unnecessary files.

## 3. File Naming Conventions

Use lowercase kebab-case for file names.

| Purpose | Naming convention | Example |
|---|---|---|
| Drizzle table definition | `<entity>.schema.ts` | `user.schema.ts` |
| Mongoose model | `<entity>.model.ts` | `user.model.ts` |
| TypeScript interface/types | `<entity>.type.ts` | `user.type.ts` |
| Request validation | `<entity>.validation.schema.ts` | `user.validation.schema.ts` |
| Repository | `<entity>.repository.ts` | `user.repository.ts` |
| Business logic | `<entity>.service.ts` | `user.service.ts` |
| Controller | `<entity>.controller.ts` | `user.controller.ts` |
| Routes | `<entity>.routes.ts` | `user.routes.ts` |
| Constants | `<entity>.constant.ts` | `user.constant.ts` |
| Errors | `<entity>.error.ts` | `user.error.ts` |

Use PascalCase for interfaces, types, and Mongoose model names. Use camelCase for variables, functions, and object properties.

## 4. Schema Design Rules

- Every database entity must have one authoritative schema definition per database.
- Use Drizzle schemas for PostgreSQL tables.
- Use Mongoose schemas for MongoDB collections.
- Never confuse database schemas with API validation schemas.
- Use explicit field types, required constraints, defaults, indexes, and uniqueness rules.
- Add database constraints for invariants that must always hold.
- Use foreign keys in PostgreSQL when relational integrity is required.
- Define indexes based on query patterns, uniqueness requirements, and expected workload.
- Avoid redundant fields and unnecessary data duplication.
- Use consistent timestamps such as `createdAt` and `updatedAt`.
- Define deletion behavior explicitly for related records.
- Use enums or constrained values where appropriate.
- Avoid storing derived values unless there is a clear performance or business justification.
- Document unusual design decisions and important constraints.

## 5. Drizzle ORM Rules

- Keep PostgreSQL table definitions in the central `drizzle/schema/` directory.
- Use `pgTable()` for PostgreSQL tables.
- Use explicit column types, defaults, nullability, indexes, unique constraints, and foreign keys.
- Infer TypeScript types from Drizzle schemas wherever practical.

Example:

```ts
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

- Use `$inferSelect` for records read from the database.
- Use `$inferInsert` for records being inserted.
- Define relationships and foreign keys consistently.
- Generate migrations using Drizzle Kit.
- Never manually modify production database structure without a reviewed migration.
- Keep Better Auth table definitions compatible with the configured Better Auth adapter and version.
- Do not independently redefine Better Auth-managed tables unless the integration explicitly requires it.

## 6. Mongoose Model Rules

- Keep MongoDB interfaces in `types/<entity>.type.ts`.
- Keep Mongoose schema and model definitions in `models/<entity>.model.ts`.
- If schemas are stored in a separate `schemas/` directory, use `<entity>.schema.ts` and import them into the model file.
- Use `Schema.Types.ObjectId` in schema field definitions.
- Use `Types.ObjectId` in TypeScript interfaces for ObjectId references.
- Set `ref` to the actual registered Mongoose model name.
- Add timestamps when required.
- Add validation, indexes, and collection options deliberately.
- Prevent duplicate model registration during development and hot reload.
- Avoid embedding unbounded arrays or documents that grow indefinitely.
- Use references for independently managed entities and embedding for bounded, tightly coupled data.
- Do not assume MongoDB references enforce foreign-key constraints.

## 7. TypeScript Interface Rules

- Use `I<Entity>` naming for Mongoose document-related interfaces when this convention is appropriate.
- Export interfaces explicitly from their type files.
- Use `Types.ObjectId` for Mongoose ObjectId references.
- Distinguish persisted document types, creation inputs, update inputs, and API response types when their shapes differ.
- Do not use database document interfaces as API request validation.
- Prefer inferred Drizzle types instead of manually duplicating PostgreSQL table types.
- Avoid `any`; use `unknown` and narrow types when necessary.
- Keep optional properties optional only when the domain genuinely permits their absence.

Example `user.type.ts`:

```ts
import type { Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  avatar?: string;
  organization: Types.ObjectId;
}
```

## 8. Mongoose Model Example

Example `user.model.ts`:

```ts
import { Schema, model, models } from "mongoose";
import type { IUser } from "../types/user.type";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User =
  models.User ?? model<IUser>("User", userSchema);
```

Add a unique index for email only if email uniqueness is a domain requirement and its scope is correctly defined. Consider whether the interface should extend `Document` or whether separate raw-document and hydrated-document types are more suitable for your Mongoose version and usage.

## 9. Database Segregation: PostgreSQL vs MongoDB

### PostgreSQL with Neon and Drizzle

Use PostgreSQL for:

- Users and relational authentication records.
- Organizations and memberships.
- Workspace ownership and permissions.
- Projects, teams, tasks, and assignments.
- Relationships requiring foreign keys.
- Transactional workflows and structured business entities.

### MongoDB with Mongoose

Use MongoDB for:

- Flexible conversation documents and message histories.
- Agent execution traces and structured tool outputs.
- Variable-shaped AI results.
- Large, independently growing document collections.
- Integration payloads that benefit from flexible document structures.

These are starting recommendations, not rigid rules. Choose the database according to access patterns, consistency requirements, transaction boundaries, and data ownership.

## 10. Database Ownership and Relationships

- Assign one authoritative database to each entity.
- Avoid maintaining two writable copies of the same entity without a synchronization strategy.
- Never assume a PostgreSQL foreign key can enforce integrity against a MongoDB document.
- Store external references explicitly when records span databases.
- Use stable identifiers for cross-database references.
- Validate cross-database references in application services where necessary.
- Define retry, failure recovery, and consistency behavior for workflows spanning both databases.
- Avoid distributed transactions unless genuinely required and supported by the chosen architecture.
- Document which database owns each entity and which service is responsible for writes.

## 11. Repository and Service Rules

### Repository

- Handle database queries and persistence.
- Provide clear, typed methods such as `findById`, `findByEmail`, `create`, `update`, and `delete`.
- Keep HTTP request and response logic out of repositories.
- Avoid exposing raw database operations unnecessarily.
- Use explicit projections and pagination for large collections.

### Service

- Implement business rules and application workflows.
- Coordinate repositories and integrations.
- Validate business invariants.
- Handle multi-step operations and consistency requirements.
- Keep framework-specific HTTP logic out of business services.

### Controller and Routes

- Parse and validate incoming requests.
- Authenticate users and enforce authorization through appropriate middleware or services.
- Call services and map results to HTTP responses.
- Avoid embedding complex business logic or database queries in route handlers.

## 12. Validation, Security, and Data Integrity

- Validate all untrusted input at system boundaries.
- Use a dedicated validation library and separate request schemas from database schemas.
- Never rely only on frontend validation.
- Enforce authorization on every protected resource operation.
- Do not expose password hashes, tokens, internal identifiers, or sensitive fields unnecessarily.
- Use environment variables for credentials and database connection strings.
- Never commit secrets.
- Add appropriate uniqueness constraints and indexes.
- Handle duplicate-key errors, missing records, validation failures, and connection failures explicitly.
- Use transactions for operations that require atomicity within a single database.

## 13. Exports and Module Boundaries

- Export only the public API of each module through its `index.ts`.
- Keep implementation details private when they do not need to be shared.
- Avoid circular imports.
- Prefer importing from a module's public entry point when doing so does not create circular dependencies.
- Avoid broad barrel exports that accidentally expose internal models, configuration, or sensitive implementation details.
- Share common types only when they are genuinely used across multiple modules.

## 14. Migration and Testing Rules

- Version-control database migrations.
- Review generated migrations before applying them.
- Never silently remove or rename production columns.
- Use expand-and-contract migrations for changes that require backward compatibility.
- Test repository methods against the actual database engine where practical.
- Add integration tests for indexes, constraints, transactions, and authorization-sensitive queries.
- Test migration behavior and rollback or recovery procedures.
- Use separate test databases and never run destructive tests against production.

## 15. Mandatory Checklist for Every New Entity

Before completing a new database entity, verify:

- [ ] Correct database selected and ownership documented.
- [ ] Schema and model files created using the naming conventions.
- [ ] TypeScript interfaces or inferred types defined.
- [ ] Required fields, nullability, defaults, and constraints specified.
- [ ] Relationships and deletion behavior documented.
- [ ] Indexes justified by actual query patterns.
- [ ] Input validation schemas added where needed.
- [ ] Repository and service responsibilities separated.
- [ ] Authorization and sensitive-field handling reviewed.
- [ ] Migration generated and reviewed when applicable.
- [ ] Tests cover core operations and important constraints.
- [ ] Module exports and imports are clean.
- [ ] No duplicate source of truth or unnecessary abstraction introduced.

## 16. Final Design Principle

**Design for correctness first, modularity second, and optimization based on measured needs.**

Do not create a file, interface, abstraction, index, or database relationship simply to follow a pattern. Every design decision must have a clear purpose, consistent naming, defined ownership, and a maintainable implementation.