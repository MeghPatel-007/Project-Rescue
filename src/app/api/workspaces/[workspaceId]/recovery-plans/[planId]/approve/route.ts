import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonError } from "@/lib/api-session";
import { GithubIntegrationService } from "@/modules/github/github-integration.service";

interface RouteContext {
  params: Promise<{ workspaceId: string; planId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  const { workspaceId, planId } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const planItemId = body.planItemId || planId;
    const note = body.note;
    const ip = request.headers.get("x-forwarded-for") ?? undefined;

    const result = await GithubIntegrationService.decideApproval(
      user.id,
      workspaceId,
      planItemId,
      "approved",
      note,
      ip,
    );

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
