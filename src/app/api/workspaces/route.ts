import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonBadRequest, jsonError } from "@/lib/api-session";
import { WorkspaceService } from "@/modules/workspaces/workspace.service";
import { createWorkspaceSchema } from "@/validation/workspace.validation.schema";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  try {
    const workspaces = await WorkspaceService.getUserWorkspaces(user.id);
    return NextResponse.json({ workspaces });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  try {
    const body = await request.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return jsonBadRequest("Invalid workspace payload", parsed.error.format());
    }

    const ip = request.headers.get("x-forwarded-for") ?? undefined;
    const workspace = await WorkspaceService.createWorkspace(user.id, parsed.data, ip);

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
