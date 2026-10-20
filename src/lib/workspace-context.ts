import { workspaceRepository } from "@/repositories/workspace.repository";
import { cookies } from "next/headers";

export interface ResolvedWorkspaceContext {
  workspace: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    ownerId: string;
  };
  membership: {
    id: string;
    workspaceId: string;
    userId: string;
    role: string;
  };
}

/**
 * Server-side helper that verifies the user has access to the requested workspace.
 * Resolves via explicit workspaceId, cookie, or defaults to the user's first workspace.
 */
export async function resolveAuthorizedWorkspace(
  userId: string,
  requestedWorkspaceId?: string | null,
): Promise<ResolvedWorkspaceContext | null> {
  const userWorkspaces = await workspaceRepository.findUserWorkspaces(userId);

  if (!userWorkspaces || userWorkspaces.length === 0) {
    return null;
  }

  // 1. If explicit workspaceId requested (e.g. from query param or route param)
  if (requestedWorkspaceId) {
    const match = userWorkspaces.find((uw) => uw.workspace.id === requestedWorkspaceId);
    if (!match) {
      // User is NOT a member of the requested workspace
      return null;
    }
    return {
      workspace: match.workspace,
      membership: match.membership,
    };
  }

  // 2. Check cookie if available
  try {
    const cookieStore = await cookies();
    const storedWorkspaceId = cookieStore.get("project_rescue_active_workspace")?.value;
    if (storedWorkspaceId) {
      const match = userWorkspaces.find((uw) => uw.workspace.id === storedWorkspaceId);
      if (match) {
        return {
          workspace: match.workspace,
          membership: match.membership,
        };
      }
    }
  } catch {
    // cookies() may not be available in non-request contexts
  }

  // 3. Fallback to the first authorized workspace
  const primary = userWorkspaces[0];
  return {
    workspace: primary.workspace,
    membership: primary.membership,
  };
}
