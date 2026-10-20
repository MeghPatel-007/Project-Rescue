export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 40,
  admin: 30,
  member: 20,
  viewer: 10,
};

export class WorkspacePolicy {
  static canManageWorkspace(role: string): boolean {
    return role === "owner";
  }

  static canManageMembers(role: string): boolean {
    return role === "owner" || role === "admin";
  }

  static canManageIntegrations(role: string): boolean {
    return role === "owner" || role === "admin";
  }

  static canTriggerAnalysis(role: string): boolean {
    return ["owner", "admin", "member"].includes(role);
  }

  static canCreateRecoveryPlan(role: string): boolean {
    return ["owner", "admin", "member"].includes(role);
  }

  static canApproveExecution(role: string): boolean {
    return role === "owner" || role === "admin";
  }

  static canView(role: string): boolean {
    return ["owner", "admin", "member", "viewer"].includes(role);
  }

  static canAssignRole(currentUserRole: string, targetRole: WorkspaceRole): boolean {
    if (currentUserRole !== "owner" && currentUserRole !== "admin") return false;
    if (targetRole === "owner" && currentUserRole !== "owner") return false;
    return true;
  }
}
