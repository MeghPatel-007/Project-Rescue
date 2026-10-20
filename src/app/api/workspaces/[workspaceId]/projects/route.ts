import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonBadRequest, jsonError } from "@/lib/api-session";
import { GithubIntegrationService } from "@/modules/github/github-integration.service";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

const connectProjectSchema = z.object({
  repoOwner: z.string().min(1, "Repository owner is required"),
  repoName: z.string().min(1, "Repository name is required"),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonUnauthorized();
  }

  const { workspaceId } = await context.params;

  try {
    const projects = await GithubIntegrationService.getWorkspaceProjects(user.id, workspaceId);
    return NextResponse.json({ projects });
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
    const parsed = connectProjectSchema.safeParse(body);
    if (!parsed.success) {
      return jsonBadRequest("Invalid repository connect payload", parsed.error.format());
    }

    const ip = request.headers.get("x-forwarded-for") ?? undefined;
    const project = await GithubIntegrationService.connectRepository(
      user.id,
      workspaceId,
      parsed.data,
      ip,
    );

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
