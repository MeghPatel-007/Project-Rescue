import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonError } from "@/lib/api-session";
import { WorkspaceService } from "@/modules/workspaces/workspace.service";

interface RouteContext {
  params: Promise<{ workspaceId: string; userId: string }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  const { workspaceId, userId: targetUserId } = await context.params;

  try {
    const ip = request.headers.get("x-forwarded-for") ?? undefined;
    const removed = await WorkspaceService.removeMember(user.id, workspaceId, targetUserId, ip);

    return NextResponse.json({ success: true, removed });
  } catch (error) {
    return jsonError(error);
  }
}
