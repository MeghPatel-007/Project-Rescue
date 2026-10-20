import { describe, expect, it } from "bun:test";
import {
  createWorkspaceSchema,
  addWorkspaceMemberSchema,
} from "./workspace.validation.schema";
import {
  connectProjectSchema,
  updateProjectSchema,
} from "./project.validation.schema";
import {
  createRecoveryPlanSchema,
} from "./recovery-plan.validation.schema";
import {
  decideApprovalSchema,
} from "./approval.validation.schema";

describe("Workspace Validation Schemas", () => {
  it("validates a valid workspace creation payload", () => {
    const input = {
      name: "Engineering Core",
      slug: "eng-core",
      description: "Core platform engineering workspace",
    };
    const parsed = createWorkspaceSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("rejects an invalid workspace slug with uppercase or special characters", () => {
    const input = {
      name: "Engineering Core",
      slug: "Eng_Core!",
    };
    const parsed = createWorkspaceSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("validates adding a workspace member with a valid role", () => {
    const input = {
      userId: "usr_123",
      role: "admin",
    };
    const parsed = addWorkspaceMemberSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("rejects an invalid workspace role", () => {
    const input = {
      userId: "usr_123",
      role: "superadmin",
    };
    const parsed = addWorkspaceMemberSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });
});

describe("Project Validation Schemas", () => {
  it("validates a project connection payload", () => {
    const input = {
      workspaceId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      name: "ProjectRescue Core",
      repoOwner: "project-rescue",
      repoName: "project-rescue-web",
      githubRepoId: 987654,
      defaultBranch: "main",
    };
    const parsed = connectProjectSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("requires an expected version for optimistic concurrency updates", () => {
    const invalidInput = {
      name: "Updated Name",
    };
    const parsed = updateProjectSchema.safeParse(invalidInput);
    expect(parsed.success).toBe(false);

    const validInput = {
      name: "Updated Name",
      version: 1,
    };
    expect(updateProjectSchema.safeParse(validInput).success).toBe(true);
  });
});

describe("Recovery Plan & Approval Validation Schemas", () => {
  it("validates a complete recovery plan with plan items", () => {
    const planInput = {
      projectId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      title: "Auth & Deployment Recovery",
      description: "Critical path recovery for hackathon release",
      riskLevel: "high",
      items: [
        {
          orderIndex: 0,
          title: "Fix Next.js middleware session redirect",
          actionType: "split_task",
          requiresApproval: true,
        },
      ],
    };
    const parsed = createRecoveryPlanSchema.safeParse(planInput);
    expect(parsed.success).toBe(true);
  });

  it("rejects a recovery plan without items", () => {
    const planInput = {
      projectId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      title: "Empty Plan",
      items: [],
    };
    const parsed = createRecoveryPlanSchema.safeParse(planInput);
    expect(parsed.success).toBe(false);
  });

  it("validates approval decision input", () => {
    const decision = {
      approvalId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      decision: "approved",
      decisionNote: "Verified the patch diff and sandbox test run.",
    };
    const parsed = decideApprovalSchema.safeParse(decision);
    expect(parsed.success).toBe(true);
  });
});
