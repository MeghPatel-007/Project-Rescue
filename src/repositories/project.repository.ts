import { db } from "@/db";
import { projects, NewProject, Project } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const projectRepository = {
  async connectProject(data: Omit<NewProject, "id" | "createdAt" | "updatedAt" | "version">) {
    const [created] = await db
      .insert(projects)
      .values({
        ...data,
        version: 1,
      })
      .returning();
    return created;
  },

  async findById(id: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project ?? null;
  },

  async findByWorkspaceId(workspaceId: string) {
    return db.select().from(projects).where(eq(projects.workspaceId, workspaceId));
  },

  /**
   * Optimistic concurrency update for project
   */
  async updateWithVersion(
    projectId: string,
    expectedVersion: number,
    updates: Partial<Omit<Project, "id" | "version" | "createdAt" | "updatedAt">>,
  ) {
    const [updated] = await db
      .update(projects)
      .set({
        ...updates,
        version: expectedVersion + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, projectId), eq(projects.version, expectedVersion)))
      .returning();

    if (!updated) {
      throw new Error("Concurrency conflict: Project has been modified by another process.");
    }

    return updated;
  },
};
