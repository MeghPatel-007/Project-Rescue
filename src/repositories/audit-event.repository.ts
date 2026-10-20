import { db } from "@/db";
import { auditEvents, NewAuditEvent } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const auditEventRepository = {
  async record(eventData: Omit<NewAuditEvent, "id" | "createdAt">) {
    const [created] = await db
      .insert(auditEvents)
      .values(eventData)
      .returning();
    return created;
  },

  async findByWorkspaceId(workspaceId: string, limit = 50) {
    return db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.workspaceId, workspaceId))
      .orderBy(desc(auditEvents.createdAt))
      .limit(limit);
  },

  async findByProjectId(projectId: string, limit = 50) {
    return db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.projectId, projectId))
      .orderBy(desc(auditEvents.createdAt))
      .limit(limit);
  },
};
