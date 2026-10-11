import { db } from "@/db";
import {
  githubIssues,
  issueDependencies,
  NewGithubIssue,
  NewIssueDependency,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const githubIssueRepository = {
  /**
   * Upsert GitHub issues on sync
   */
  async upsertIssue(issue: NewGithubIssue) {
    const [upserted] = await db
      .insert(githubIssues)
      .values(issue)
      .onConflictDoUpdate({
        target: githubIssues.githubIssueId,
        set: {
          title: issue.title,
          body: issue.body,
          state: issue.state,
          stateReason: issue.stateReason,
          assignees: issue.assignees,
          labels: issue.labels,
          githubUpdatedAt: issue.githubUpdatedAt,
          githubClosedAt: issue.githubClosedAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upserted;
  },

  /**
   * Record dependency with validation ensuring both issues belong to same project
   */
  async addDependency(dep: NewIssueDependency) {
    const [blocking] = await db
      .select({ projectId: githubIssues.projectId })
      .from(githubIssues)
      .where(eq(githubIssues.id, dep.blockingIssueId));

    const [blocked] = await db
      .select({ projectId: githubIssues.projectId })
      .from(githubIssues)
      .where(eq(githubIssues.id, dep.blockedIssueId));

    if (!blocking || !blocked) {
      throw new Error("One or both issues not found.");
    }

    if (blocking.projectId !== dep.projectId || blocked.projectId !== dep.projectId) {
      throw new Error("Integrity violation: Both issues in a dependency must belong to the same project.");
    }

    const [created] = await db
      .insert(issueDependencies)
      .values(dep)
      .onConflictDoNothing()
      .returning();

    // Mark the blocked issue as blocked
    await db
      .update(githubIssues)
      .set({ isBlocked: true })
      .where(eq(githubIssues.id, dep.blockedIssueId));

    return created;
  },

  async findProjectIssues(projectId: string) {
    return db
      .select()
      .from(githubIssues)
      .where(eq(githubIssues.projectId, projectId));
  },

  async findBlockedIssues(projectId: string) {
    return db
      .select()
      .from(githubIssues)
      .where(and(eq(githubIssues.projectId, projectId), eq(githubIssues.isBlocked, true)));
  },
};
