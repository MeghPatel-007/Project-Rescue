import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonError } from "@/lib/api-session";
import { WorkspaceService } from "@/modules/workspaces/workspace.service";
import { auditEventRepository } from "@/repositories/audit-event.repository";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  const { workspaceId } = await context.params;

  try {
    await WorkspaceService.getWorkspaceWithAuth(user.id, workspaceId);
    const events = await auditEventRepository.findByWorkspaceId(workspaceId);
    return NextResponse.json({ events });
  } catch (error) {
    return jsonError(error);
  }
}
