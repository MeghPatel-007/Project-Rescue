import { db } from "@/db";
import { workspaces, workspaceMembers, NewWorkspace, NewWorkspaceMember } from "@/db/schema";
import { eq } from "drizzle-orm";

export const workspaceRepository = {
  async createWorkspaceWithOwner(
    workspaceData: Omit<NewWorkspace, "id" | "createdAt" | "updatedAt">,
    ownerUserId: string,
  ) {
    // Insert workspace
    const [created] = await db
      .insert(workspaces)
      .values({
        ...workspaceData,
        ownerId: ownerUserId,
      })
      .returning();

    // Add owner as a workspace member with "owner" role
    const memberData: NewWorkspaceMember = {
      workspaceId: created.id,
      userId: ownerUserId,
      role: "owner",
    };
    await db.insert(workspaceMembers).values(memberData);

    return created;
  },

  async findById(id: string) {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace ?? null;
  },

  async findBySlug(slug: string) {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.slug, slug));
    return workspace ?? null;
  },

  async findUserWorkspaces(userId: string) {
    return db
      .select({
        workspace: workspaces,
        membership: workspaceMembers,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, userId));
  },
};
