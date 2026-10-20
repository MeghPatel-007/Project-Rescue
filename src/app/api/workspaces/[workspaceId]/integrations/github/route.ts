import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonError } from "@/lib/api-session";
import { GithubIntegrationService } from "@/modules/github/github-integration.service";

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
    const status = await GithubIntegrationService.getWorkspaceGithubStatus(user.id, workspaceId);
    return NextResponse.json(status);
  } catch (error) {
    return jsonError(error);
  }
}
