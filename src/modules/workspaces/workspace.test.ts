import { describe, expect, it } from "bun:test";
import { WorkspacePolicy } from "./workspace.policy";

describe("WorkspacePolicy RBAC Matrix", () => {
  it("allows only owners to manage workspace settings and deletion", () => {
    expect(WorkspacePolicy.canManageWorkspace("owner")).toBe(true);
    expect(WorkspacePolicy.canManageWorkspace("admin")).toBe(false);
    expect(WorkspacePolicy.canManageWorkspace("member")).toBe(false);
    expect(WorkspacePolicy.canManageWorkspace("viewer")).toBe(false);
  });

  it("allows owners and admins to manage members", () => {
    expect(WorkspacePolicy.canManageMembers("owner")).toBe(true);
    expect(WorkspacePolicy.canManageMembers("admin")).toBe(true);
    expect(WorkspacePolicy.canManageMembers("member")).toBe(false);
    expect(WorkspacePolicy.canManageMembers("viewer")).toBe(false);
  });

  it("allows owners and admins to manage integrations", () => {
    expect(WorkspacePolicy.canManageIntegrations("owner")).toBe(true);
    expect(WorkspacePolicy.canManageIntegrations("admin")).toBe(true);
    expect(WorkspacePolicy.canManageIntegrations("member")).toBe(false);
    expect(WorkspacePolicy.canManageIntegrations("viewer")).toBe(false);
  });

  it("allows owners, admins, and members to trigger analysis and recovery plans", () => {
    expect(WorkspacePolicy.canTriggerAnalysis("owner")).toBe(true);
    expect(WorkspacePolicy.canTriggerAnalysis("admin")).toBe(true);
    expect(WorkspacePolicy.canTriggerAnalysis("member")).toBe(true);
    expect(WorkspacePolicy.canTriggerAnalysis("viewer")).toBe(false);

    expect(WorkspacePolicy.canCreateRecoveryPlan("member")).toBe(true);
    expect(WorkspacePolicy.canCreateRecoveryPlan("viewer")).toBe(false);
  });

  it("restricts action execution approval to owners and admins", () => {
    expect(WorkspacePolicy.canApproveExecution("owner")).toBe(true);
    expect(WorkspacePolicy.canApproveExecution("admin")).toBe(true);
    expect(WorkspacePolicy.canApproveExecution("member")).toBe(false);
    expect(WorkspacePolicy.canApproveExecution("viewer")).toBe(false);
  });

  it("allows all valid workspace roles to view data", () => {
    expect(WorkspacePolicy.canView("owner")).toBe(true);
    expect(WorkspacePolicy.canView("admin")).toBe(true);
    expect(WorkspacePolicy.canView("member")).toBe(true);
    expect(WorkspacePolicy.canView("viewer")).toBe(true);
    expect(WorkspacePolicy.canView("external")).toBe(false);
  });

  it("prevents admins from promoting someone to owner", () => {
    expect(WorkspacePolicy.canAssignRole("admin", "owner")).toBe(false);
    expect(WorkspacePolicy.canAssignRole("owner", "owner")).toBe(true);
    expect(WorkspacePolicy.canAssignRole("admin", "member")).toBe(true);
  });
});
