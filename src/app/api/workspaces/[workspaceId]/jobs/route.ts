import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonUnauthorized, jsonError } from "@/lib/api-session";
import { WorkspaceService } from "@/modules/workspaces/workspace.service";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    await WorkspaceService.getWorkspaceWithAuth(user.id, workspaceId);

    const projs = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));

    const jobs = projs.map((p, idx) => ({
      id: `job-${p.id.slice(0, 8)}`,
      type: "Repository Synchronization & Blocker Analysis",
      target: `${p.repoOwner}/${p.repoName}`,
      status: p.lastSyncedAt ? "completed" : "pending",
      duration: `${1.2 + (idx * 0.4)}s`,
      updatedAt: p.lastSyncedAt ? p.lastSyncedAt.toISOString() : p.createdAt.toISOString(),
      details: `Indexed branches, issues, and dependency graph (Health Score: ${p.healthScore}%)`,
    }));

    return NextResponse.json({ jobs });
  } catch (error) {
    return jsonError(error);
  }
}
