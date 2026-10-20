import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonBadRequest, jsonError } from "@/lib/api-session";
import { WorkspaceService } from "@/modules/workspaces/workspace.service";
import { addWorkspaceMemberSchema } from "@/validation/workspace.validation.schema";

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
    const members = await WorkspaceService.getMembers(user.id, workspaceId);
    return NextResponse.json({ members });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  const { workspaceId } = await context.params;

  try {
    const body = await request.json();
    const parsed = addWorkspaceMemberSchema.safeParse(body);
    if (!parsed.success) {
      return jsonBadRequest("Invalid member payload", parsed.error.format());
    }

    const ip = request.headers.get("x-forwarded-for") ?? undefined;
    const member = await WorkspaceService.addOrUpdateMember(
      user.id,
      workspaceId,
      parsed.data.userId,
      parsed.data.role,
      ip,
    );

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
