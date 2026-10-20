# AI Implementation and Git Commit Rules

## 1. Core principles

- Implement features in small, independently reviewable units.
- Organize tasks by module and implementation phase.
- Every completed implementation task must have a corresponding Git commit when auto-commit is enabled.
- Never create a commit solely to satisfy a required commit count.
- Never mark an implementation phase complete without verifying its acceptance criteria.
- Preserve existing developer changes. Never overwrite, discard, or stage unrelated modifications.
- Never commit secrets, credentials, `.env` files, generated temporary files, or unrelated changes.
- Do not push to remote repositories or merge branches without explicit authorization.

## 2. Module structure

Every feature must have a module identifier, task identifier, phase, and acceptance criteria.

Example:

- Module: `user`
- Task: `USER-001`
- Phase: `data-modeling`
- Objective: Define the user schema, model, types, and relations.
- Dependencies: `DATABASE-001`
- Acceptance criteria: Schema validation and type checks pass.

## 3. Required implementation order

Follow this order when applicable:

1. Repository inspection and task planning.
2. Infrastructure and database connectivity.
3. Data modeling and type definitions.
4. Input validation and error handling.
5. Repository and persistence layer.
6. Business logic and service layer.
7. API and integration layer.
8. Automated tests.
9. Documentation and final verification.

Tasks may run in parallel only when their dependencies allow it.

## 4. Commit rules

- Use Conventional Commits.
- Prefer one commit per independently verifiable implementation unit.
- Keep commits focused on a single logical change.
- Commit only files related to the current task.
- Review the staged diff before committing.
- Run the relevant checks before creating the commit.
- Record the commit SHA after a successful commit.
- If verification fails, fix the issue and rerun the checks.
- Never bypass hooks, tests, or security checks merely to make a commit succeed.
- Never amend, rewrite, or reset shared history without authorization.

## 5. Completion requirements

A task is complete only when:

- All acceptance criteria are satisfied.
- Required tests and static checks pass.
- The staged changes have been reviewed.
- The commit exists locally.
- The task tracker records the commit SHA and verification results.
- Remaining limitations or skipped checks are explicitly recorded.

## 6. Failure handling

If a task fails:

- Record the failed phase and error details.
- Do not mark the task complete.
- Do not proceed with dependent tasks.
- Preserve diagnostic information.
- Retry only after identifying the failure or applying a justified fix.
- Request human review when requirements are ambiguous, destructive operations are needed, or automated checks cannot establish correctness.

## 7. Final reporting

At the end of an implementation task, report:

- Module and task ID.
- Completed phases.
- Files changed.
- Commit hashes and messages.
- Tests and checks executed.
- Failed or skipped checks.
- Remaining work and the next eligible task.