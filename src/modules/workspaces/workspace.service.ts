import { workspaceRepository } from "@/repositories/workspace.repository";
import { auditEventRepository } from "@/repositories/audit-event.repository";
import { WorkspacePolicy, WorkspaceRole } from "./workspace.policy";
import {
  WorkspaceNotFoundError,
  WorkspaceUnauthorizedError,
  WorkspacePermissionDeniedError,
  WorkspaceConflictError,
} from "./workspace.errors";
import { CreateWorkspaceInput, UpdateWorkspaceInput } from "@/validation/workspace.validation.schema";

export class WorkspaceService {
  /**
   * Create a new workspace and make the user its owner.
   */
  static async createWorkspace(userId: string, input: CreateWorkspaceInput, ipAddress?: string) {
    const existing = await workspaceRepository.findBySlug(input.slug);
    if (existing) {
      throw new WorkspaceConflictError(`Workspace slug '${input.slug}' is already taken.`);
    }

    const created = await workspaceRepository.createWorkspaceWithOwner(
      {
        name: input.name,
        slug: input.slug,
        description: input.description,
        metadata: input.metadata ?? {},
      },
      userId,
    );

    await auditEventRepository.record({
      workspaceId: created.id,
      userId,
      action: "workspace.created",
      entityType: "workspace",
      entityId: created.id,
      details: { slug: created.slug, name: created.name },
      ipAddress,
    });

    return created;
  }

  /**
   * Resolve user membership and verify workspace exists.
   */
  static async getWorkspaceWithAuth(userId: string, workspaceId: string) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new WorkspaceNotFoundError(workspaceId);
    }

    const membership = await workspaceRepository.findMember(workspaceId, userId);
    if (!membership) {
      throw new WorkspaceUnauthorizedError();
    }

    return { workspace, membership };
  }

  /**
   * List all workspaces accessible by the user.
   */
  static async getUserWorkspaces(userId: string) {
    return workspaceRepository.findUserWorkspaces(userId);
  }

  /**
   * Update workspace details (Owner only).
   */
  static async updateWorkspace(
    userId: string,
    workspaceId: string,
    input: UpdateWorkspaceInput,
    ipAddress?: string,
  ) {
    const { membership } = await this.getWorkspaceWithAuth(userId, workspaceId);

    if (!WorkspacePolicy.canManageWorkspace(membership.role)) {
      throw new WorkspacePermissionDeniedError("Only the workspace owner can modify workspace settings.");
    }

    if (input.slug) {
      const existing = await workspaceRepository.findBySlug(input.slug);
      if (existing && existing.id !== workspaceId) {
        throw new WorkspaceConflictError(`Workspace slug '${input.slug}' is already taken.`);
      }
    }

    const updated = await workspaceRepository.update(workspaceId, input);

    await auditEventRepository.record({
      workspaceId,
      userId,
      action: "workspace.updated",
      entityType: "workspace",
      entityId: workspaceId,
      details: input,
      ipAddress,
    });

    return updated;
  }

  /**
   * Delete workspace (Owner only).
   */
  static async deleteWorkspace(userId: string, workspaceId: string, ipAddress?: string) {
    const { membership, workspace } = await this.getWorkspaceWithAuth(userId, workspaceId);

    if (!WorkspacePolicy.canManageWorkspace(membership.role)) {
      throw new WorkspacePermissionDeniedError("Only the workspace owner can delete the workspace.");
    }

    const deleted = await workspaceRepository.delete(workspaceId);

    await auditEventRepository.record({
      workspaceId,
      userId,
      action: "workspace.deleted",
      entityType: "workspace",
      entityId: workspaceId,
      details: { slug: workspace.slug, name: workspace.name },
      ipAddress,
    });

    return deleted;
  }

  /**
   * List members of a workspace.
   */
  static async getMembers(userId: string, workspaceId: string) {
    const { membership } = await this.getWorkspaceWithAuth(userId, workspaceId);

    if (!WorkspacePolicy.canView(membership.role)) {
      throw new WorkspacePermissionDeniedError();
    }

    return workspaceRepository.findMembers(workspaceId);
  }

  /**
   * Add or update role of a workspace member (Owner/Admin only).
   */
  static async addOrUpdateMember(
    currentUserId: string,
    workspaceId: string,
    targetUserId: string,
    targetRole: WorkspaceRole,
    ipAddress?: string,
  ) {
    const { membership } = await this.getWorkspaceWithAuth(currentUserId, workspaceId);

    if (!WorkspacePolicy.canManageMembers(membership.role)) {
      throw new WorkspacePermissionDeniedError("Only workspace owners or admins can manage members.");
    }

    if (!WorkspacePolicy.canAssignRole(membership.role, targetRole)) {
      throw new WorkspacePermissionDeniedError("You do not have permission to assign this role.");
    }

    const member = await workspaceRepository.addOrUpdateMember(workspaceId, targetUserId, targetRole);

    await auditEventRepository.record({
      workspaceId,
      userId: currentUserId,
      action: "workspace.member_updated",
      entityType: "workspace_member",
      entityId: member.id,
      details: { targetUserId, role: targetRole },
      ipAddress,
    });

    return member;
  }

  /**
   * Remove member from workspace (Owner/Admin or self-leave).
   */
  static async removeMember(
    currentUserId: string,
    workspaceId: string,
    targetUserId: string,
    ipAddress?: string,
  ) {
    const { membership } = await this.getWorkspaceWithAuth(currentUserId, workspaceId);

    const isSelf = currentUserId === targetUserId;
    if (!isSelf && !WorkspacePolicy.canManageMembers(membership.role)) {
      throw new WorkspacePermissionDeniedError("Insufficient permissions to remove member.");
    }

    // Prevent removing the owner
    const targetMember = await workspaceRepository.findMember(workspaceId, targetUserId);
    if (targetMember?.role === "owner" && !isSelf) {
      throw new WorkspacePermissionDeniedError("The workspace owner cannot be removed.");
    }

    const removed = await workspaceRepository.removeMember(workspaceId, targetUserId);

    await auditEventRepository.record({
      workspaceId,
      userId: currentUserId,
      action: isSelf ? "workspace.member_left" : "workspace.member_removed",
      entityType: "workspace_member",
      entityId: targetUserId,
      details: { targetUserId },
      ipAddress,
    });

    return removed;
  }
}
