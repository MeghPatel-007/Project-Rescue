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
    const plans = await GithubIntegrationService.getWorkspaceRecoveryPlans(user.id, workspaceId);
    return NextResponse.json({ plans });
  } catch (error) {
    return jsonError(error);
  }
}
