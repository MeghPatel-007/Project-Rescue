import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonBadRequest, jsonError } from "@/lib/api-session";
import { WorkspaceService } from "@/modules/workspaces/workspace.service";
import { updateWorkspaceSchema } from "@/validation/workspace.validation.schema";

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
    const { workspace, membership } = await WorkspaceService.getWorkspaceWithAuth(user.id, workspaceId);
    return NextResponse.json({ workspace, membership });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  const { workspaceId } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return jsonBadRequest("Invalid update payload", parsed.error.format());
    }

    const ip = request.headers.get("x-forwarded-for") ?? undefined;
    const updated = await WorkspaceService.updateWorkspace(user.id, workspaceId, parsed.data, ip);

    return NextResponse.json({ workspace: updated });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  const { workspaceId } = await context.params;

  try {
    const ip = request.headers.get("x-forwarded-for") ?? undefined;
    await WorkspaceService.deleteWorkspace(user.id, workspaceId, ip);

    return NextResponse.json({ success: true, message: "Workspace deleted" });
  } catch (error) {
    return jsonError(error);
  }
}
