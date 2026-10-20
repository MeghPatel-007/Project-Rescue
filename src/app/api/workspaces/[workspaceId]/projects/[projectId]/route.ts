import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonError } from "@/lib/api-session";
import { GithubIntegrationService } from "@/modules/github/github-integration.service";

interface RouteContext {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  const { workspaceId, projectId } = await context.params;

  try {
    const ip = request.headers.get("x-forwarded-for") ?? undefined;
    await GithubIntegrationService.disconnectRepository(
      user.id,
      workspaceId,
      projectId,
      ip,
    );

    return NextResponse.json({ success: true, message: "Project disconnected" });
  } catch (error) {
    return jsonError(error);
  }
}
