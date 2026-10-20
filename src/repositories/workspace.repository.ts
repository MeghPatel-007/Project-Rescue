import { db } from "@/db";
import { workspaces, workspaceMembers, user, NewWorkspace, NewWorkspaceMember } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const workspaceRepository = {
  async createWorkspaceWithOwner(
    workspaceData: Omit<NewWorkspace, "id" | "ownerId" | "createdAt" | "updatedAt">,
    ownerUserId: string,
  ) {
    const [created] = await db
      .insert(workspaces)
      .values({
        ...workspaceData,
        ownerId: ownerUserId,
      })
      .returning();

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

  async findMember(workspaceId: string, userId: string) {
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      );
    return membership ?? null;
  },

  async findMembers(workspaceId: string) {
    return db
      .select({
        id: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.joinedAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(workspaceMembers)
      .innerJoin(user, eq(workspaceMembers.userId, user.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));
  },

  async addOrUpdateMember(workspaceId: string, userId: string, role: string) {
    const existing = await this.findMember(workspaceId, userId);
    if (existing) {
      const [updated] = await db
        .update(workspaceMembers)
        .set({ role })
        .where(eq(workspaceMembers.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId,
        role,
      })
      .returning();
    return created;
  },

  async removeMember(workspaceId: string, userId: string) {
    const [removed] = await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      )
      .returning();
    return removed ?? null;
  },

  async update(
    workspaceId: string,
    data: Partial<Omit<NewWorkspace, "id" | "ownerId" | "createdAt" | "updatedAt">>,
  ) {
    const [updated] = await db
      .update(workspaces)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId))
      .returning();
    return updated ?? null;
  },

  async delete(workspaceId: string) {
    const [deleted] = await db
      .delete(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .returning();
    return deleted ?? null;
  },
};
