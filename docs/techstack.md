> **Status:** Selected project idea · **Track:** Amazon Developer Hackathon 2026 — Alexa+
> 

> **Tagline:** When your project falls behind, your agent gets you back on track.
> 

## 1. Product overview

ProjectRescue is an AI project-recovery agent for software teams. It inspects a project's current state, identifies blockers and dependencies, proposes a realistic recovery plan, executes approved project-management actions, and replans when circumstances change.

**Core principle:** GitHub is the data source; dependency-aware recovery is the product.

## 2. Problem statement

When a software project falls behind schedule, teams struggle to determine which issues matter most, which tasks block other work, what can realistically be completed before the deadline, and what scope should be cut. Project information is scattered across issues, pull requests, task boards, build logs, and team conversations. ProjectRescue turns that fragmented information into an evidence-backed recovery plan and helps the team execute it safely.

## 3. Example user scenario

A hackathon team has 36 hours left. Authentication is broken, two features are unfinished, several issues remain open, and deployment is unstable.

The user says: “Our hackathon project is falling apart. We have 36 hours left. Help us recover.”

ProjectRescue should:

1. Retrieve current issues, pull requests, milestones, and available build/deployment status.
2. Identify confirmed blockers and label inferred risks as hypotheses.
3. Map task dependencies and estimate remaining effort.
4. Check whether the essential scope fits the available time and team capacity.
5. Propose priorities, a schedule, and scope cuts where necessary.
6. Explain the evidence and trade-offs behind the plan.
7. Wait for approval before modifying GitHub.
8. Track progress and generate a revised plan when the project changes.

### Illustrative recovery plan

The following times are examples only. A real plan must calculate durations and validate dependencies, capacity, and availability.

| Priority | Task | Reason | Illustrative target |
| --- | --- | --- | --- |
| P0 | Fix authentication | Blocks protected-route testing | Hour 4 |
| P0 | Stabilize deployment | Needed for a reliable demo | Hour 8 |
| P1 | Complete Feature A | Dependency for Feature B | Hour 16 |
| P1 | Complete Feature B | Core functionality | Hour 26 |
| P2 | Polish UI | Lower priority than stability | Hour 32 |
| P2 | Final testing and demo | Verify submission readiness | Hour 36 |

## 4. Target users

- Hackathon teams working against short deadlines.
- Student developers managing academic or personal projects.
- Small engineering teams facing release risks.
- Project leads who need evidence-backed prioritization and replanning.

## 5. Core features

### Feature A — Project intelligence

Collect project data from GitHub repositories, issues, pull requests, milestones, deadlines, and build/deployment status where available. Normalize this information into a structured project state.

**Acceptance criteria**

- The user can connect or select a repository with appropriate permissions.
- The agent can retrieve issues and pull requests.
- Recommendations link back to the relevant source records.
- Missing or inaccessible data is stated clearly instead of invented.

### Feature B — Blocker and risk detection

Detect dependency blockers, critical bugs, unreviewed pull requests, failing builds, and tasks threatening the deadline.

**Acceptance criteria**

- Confirmed facts are separated from inferred risks.
- Every finding has supporting evidence where possible.
- The agent explains why each blocker matters.
- The user can inspect the source issue, PR, or build record.

### Feature C — Dependency-aware recovery planning

Generate a recovery plan using remaining time, task dependencies, effort estimates, developer capacity, task importance, and minimum requirements for a successful release.

**Acceptance criteria**

- Task dependencies are represented as a directed graph.
- The planner rejects schedules that violate dependencies or capacity constraints.
- Estimates and assumptions are visible.
- The agent identifies work that should be postponed or cut.
- If the required scope is infeasible, the agent says so rather than pretending everything fits.

### Feature D — Approved execution

After approval, use tools to create or update GitHub issues, set priorities or milestones where supported, assign tasks, and record progress.

**Acceptance criteria**

- Read-only analysis is distinct from proposed changes and executed actions.
- Mutating actions require appropriate user approval.
- Each executed action records its result and source.
- API permissions are limited to what the workflow needs.
- Failed actions are surfaced; the agent never claims success without verification.

### Feature E — Continuous recovery

Reassess the project after important changes such as a delayed task, newly opened critical issue, failed deployment, or changed deadline.

**Acceptance criteria**

- The system compares the current state with the last approved plan.
- It identifies affected downstream tasks and at-risk milestones.
- It explains what changed and why.
- It proposes a new plan rather than silently changing the approved one.
- Plan versions and action history are retained.

## 6. What differentiates ProjectRescue

1. **Dependency-aware planning:** Understands task chains, not just isolated issues.
2. **Evidence-backed findings:** Links recommendations to real project records.
3. **Deadline feasibility:** Uses deterministic validation for time, capacity, and dependencies.
4. **Human approval:** Separates analysis, proposals, and external writes.
5. **Recovery history:** Preserves plan versions and explains changes.
6. **Agentic workflow:** Completes the loop from investigation to approved action and replanning.

## 7. Recommended architecture

- **Frontend:** Next.js project dashboard and conversational simulator.
- **Backend API:** Node.js + Express for application APIs and business logic.
- **Agent layer:** LLM with tool calling for intent understanding, workflow coordination, and explanations.
- **MCP server:** Expose project tools using the current eligible MCP transport and protocol requirements.
- **Data source:** GitHub API for issues, PRs, milestones, and available repository metadata.
- **Database:** PostgreSQL for projects, tasks, dependencies, plan versions, approvals, and action logs.
- **Planner:** Deterministic scheduling and validation module.
- **Worker:** Scheduled or event-driven checks for changed project state.
- **Deployment:** Host the app and MCP endpoint on a suitable platform.

### Conceptual architecture

```
User
  |
  v
Alexa+ integration or clearly labelled web simulator
  |
  v
Agent layer
  |---------------------|
  v                     v
MCP project tools    Recovery planner
  |                     |
  v                     v
GitHub API          Constraint validation
  |                     |
  +----------+----------+
             v
         PostgreSQL
             |
             v
    Project dashboard
```

Keep responsibilities separate. The LLM should not be responsible for arithmetic, dependency validation, or silently inventing project facts. Use regular code for those operations.

## 8. MVP scope

Build only the smallest complete workflow.

### Include

- One GitHub repository integration.
- Retrieval of issues and pull requests.
- A normalized project/task/dependency model.
- Blocker detection with evidence.
- A dependency-aware recovery plan.
- Deadline and capacity validation.
- An approval screen for proposed GitHub changes.
- Execution of a small set of GitHub actions.
- Plan versioning and replanning after a meaningful change.
- A web simulator with a visible tool-call/activity timeline.
- One polished end-to-end demo scenario.

### Exclude from the first version

- Multiple project-management platforms.
- Autonomous code commits or merges.
- Unrestricted access to repositories.
- A complex multi-agent architecture without a demonstrated need.
- Full team chat, email, calendar, and issue tracker integrations all at once.
- Claims of real Alexa+ integration if only a simulator has been built.

## 9. Suggested MCP tools

Start with a narrow, auditable set:

- `get_repository_summary`
- `list_issues`
- `list_pull_requests`
- `get_issue_details`
- `get_build_status` (only if a real integration exists)
- `build_dependency_graph`
- `propose_recovery_plan`
- `validate_recovery_plan`
- `create_github_issue`
- `update_github_issue`
- `assign_github_issue`
- `record_plan_approval`
- `record_progress`
- `compare_plan_versions`

Tool names are proposed interfaces, not existing implementations. Every tool must validate input, handle API failures, and return structured results.

## 10. Implementation roadmap

| Phase | Deliverable | Definition of done |
| --- | --- | --- |
| 1. GitHub integration | Repository data retrieval | Real issues and PRs load successfully |
| 2. Project model | Tasks, dependencies, deadlines, owners | Data is normalized and traceable |
| 3. Recovery planner | Prioritized proposed schedule | Dependencies and capacity are validated |
| 4. Agent tools | Read and planning tools exposed to agent | Tool calls return structured, verified data |
| 5. Approval and execution | Approved GitHub updates | Actions are verified and logged |
| 6. Recovery loop | Replanning after changes | Updated plan explains changed priorities |
| 7. Alexa+ path | Eligible integration or simulation | Track requirements are verified and accurately represented |
| 8. Demo and submission | End-to-end story and documentation | Clean setup, working demo, and clear limitations |

## 11. Demo storyboard (2–3 minutes)

1. **Crisis:** Show a repository with a deadline, unresolved issues, dependencies, and a failed build or deployment status.
2. **Investigation:** Ask ProjectRescue to assess the project. Show actual tool calls and evidence.
3. **Planning:** Display blockers, a proposed schedule, feasibility warnings, and scope cuts.
4. **Approval:** Approve selected changes and show the resulting GitHub updates.
5. **Disruption:** Introduce a delayed task or new failure.
6. **Replanning:** Show the new plan, affected tasks, and an explanation of what changed.

The demo must use a real running workflow, not screenshots pretending to be tool execution.

## 12. Risks and mitigations

- **Over-scoping:** Limit the first version to GitHub and one complete recovery workflow.
- **Hallucinated facts:** Ground findings in source records and label uncertain inferences.
- **Bad schedules:** Validate dependencies, capacity, durations, and deadlines in deterministic code.
- **Unsafe writes:** Require approval for external changes and keep an audit trail.
- **Unreliable integrations:** Handle rate limits, missing permissions, and API errors visibly.
- **False automation claims:** Do not claim actions happened until the result is verified.
- **Alexa+ access uncertainty:** Verify the latest official rules and available developer access before committing to a particular integration route.

## 13. Alexa+ hackathon compliance checklist

- [ ]  Recheck the current official track requirements and deadline.
- [ ]  Select the eligible Agent Skill, self-hosted MCP server, or simulated-experience route.
- [ ]  If using MCP, verify the required protocol version and transport from the current rules.
- [ ]  Do not assume preview-only Amazon tools are available.
- [ ]  Clearly label a simulated Alexa+ experience as a simulation.
- [ ]  Show real tool execution and the complete workflow in the demo.
- [ ]  Document setup, architecture, permissions, limitations, and sample data.
- [ ]  Verify the final repository and video satisfy submission rules.

## 14. Immediate next actions

- [ ]  Finalize the one-paragraph problem statement.
- [ ]  Confirm the MVP and explicitly freeze out-of-scope features.
- [ ]  Read the latest official Alexa+ track rules and choose the integration path.
- [ ]  Define the database schema and project/task/dependency model.
- [ ]  Create the repository and implement read-only GitHub retrieval first.
- [ ]  Build the deterministic recovery planner before polishing the UI.

## Product decision

**ProjectRescue is the selected concept.** Its core value is not chatting about GitHub. It is identifying project blockers, calculating a realistic recovery plan, executing approved actions, and adapting when the project state changes.