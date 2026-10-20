import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonError } from "@/lib/api-session";
import { GithubIntegrationService } from "@/modules/github/github-integration.service";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  const { workspaceId } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const severity = searchParams.get("severity") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const projectId = searchParams.get("projectId") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  try {
    const findings = await GithubIntegrationService.getWorkspaceFindings(user.id, workspaceId, {
      severity,
      status,
      projectId,
      search,
    });
    return NextResponse.json({ findings });
  } catch (error) {
    return jsonError(error);
  }
}
