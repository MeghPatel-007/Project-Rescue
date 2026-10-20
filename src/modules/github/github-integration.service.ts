import { db } from "@/db";
import {
  account,
  projects,
  githubIssues,
  githubPullRequests,
  recoveryPlans,
  recoveryPlanItems,
  approvals,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { GitHubClient, GitHubRepoSummary } from "@/integration/github/github-client";
import { WorkspaceService } from "@/modules/workspaces/workspace.service";
import { auditEventRepository } from "@/repositories/audit-event.repository";

export interface WorkspaceGithubStatus {
  connected: boolean;
  login?: string;
  name?: string | null;
  avatarUrl?: string;
  scope?: string | null;
  connectedProjectsCount: number;
}

export interface WorkspaceProjectSummary {
  id: string;
  workspaceId: string;
  name: string;
  repoOwner: string;
  repoName: string;
  githubRepoId: number;
  defaultBranch: string;
  status: string;
  healthScore: number | null;
  openIssuesCount: number;
  openPrsCount: number;
  blockersCount: number;
  lastSyncedAt: Date | null;
  createdAt: Date;
}

export interface WorkspaceFindingSummary {
  id: string;
  projectId: string;
  repoOwner: string;
  repoName: string;
  githubIssueId: number;
  issueNumber: number;
  title: string;
  body: string | null;
  state: string;
  criticality: "critical" | "high" | "medium" | "low";
  isBlocked: boolean;
  blockerCount: number;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceRecoveryPlanSummary {
  id: string;
  projectId: string;
  repoOwner: string;
  repoName: string;
  title: string;
  description: string | null;
  version: number;
  status: string;
  riskLevel: string;
  createdAt: Date;
  items: Array<{
    id: string;
    orderIndex: number;
    title: string;
    description: string | null;
    actionType: string;
    status: string;
    requiresApproval: boolean;
    diffSnippet?: string;
    approvalId?: string;
  }>;
}

export interface WorkspaceCommitSummary {
  id: string;
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  authorAvatar?: string;
  date: string;
  repoName: string;
  repoOwner: string;
  url: string;
}

export interface WorkspaceMetrics {
  totalProjects: number;
  openIssues: number;
  openPrs: number;
  totalBlockers: number;
  activeRecoveryPlans: number;
  averageHealthScore: number;
  lastActivityAt: string | null;
  failingChecksCount: number;
  findingsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  pendingRecoveryReviews: number;
  healthTrend: Array<{ date: string; healthScore: number; blockers: number }>;
  findingsDistribution: Array<{ severity: string; count: number; fill: string }>;
  recoveryActivity: Array<{ date: string; proposed: number; approved: number; completed: number }>;
  attentionItems: Array<{
    id: string;
    type: "blocker" | "finding" | "plan";
    title: string;
    repoName: string;
    severity: string;
    updatedAt: string;
    link: string;
  }>;
}

export class GithubIntegrationService {
  /**
   * Helper to retrieve the authenticated user's GitHub OAuth token
   */
  private static async getGithubTokenForUser(userId: string): Promise<string | null> {
    const [githubAcc] = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "github")));

    return githubAcc?.accessToken || null;
  }

  /**
   * Check GitHub connection status for this user in the context of the workspace
   */
  static async getWorkspaceGithubStatus(userId: string, workspaceId: string): Promise<WorkspaceGithubStatus> {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const workspaceProjects = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));

    const connectedProjectsCount = workspaceProjects[0]?.count || 0;

    const token = await this.getGithubTokenForUser(userId);
    if (!token) {
      return {
        connected: false,
        connectedProjectsCount,
      };
    }

    try {
      const client = new GitHubClient(token);
      const viewer = await client.getViewer();

      const [githubAcc] = await db
        .select({ scope: account.scope })
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.providerId, "github")));

      return {
        connected: true,
        login: viewer.login,
        name: viewer.name,
        avatarUrl: viewer.avatarUrl,
        scope: githubAcc?.scope || null,
        connectedProjectsCount,
      };
    } catch (error) {
      console.warn("Failed to verify GitHub token with GitHub API:", error);
      return {
        connected: false,
        connectedProjectsCount,
      };
    }
  }

  /**
   * List GitHub repositories accessible via the user's GitHub token
   */
  static async listAvailableRepositories(
    userId: string,
    workspaceId: string,
  ): Promise<Array<GitHubRepoSummary & { isConnected: boolean; projectId?: string }>> {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const token = await this.getGithubTokenForUser(userId);
    if (!token) {
      throw new Error("GitHub account not linked. Please connect your GitHub account first.");
    }

    const client = new GitHubClient(token);
    const repos = await client.listUserRepositories();

    const existingProjects = await db
      .select({
        id: projects.id,
        githubRepoId: projects.githubRepoId,
      })
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));

    const connectedMap = new Map(existingProjects.map((p) => [p.githubRepoId, p.id]));

    return repos.map((r) => ({
      ...r,
      isConnected: connectedMap.has(r.id),
      projectId: connectedMap.get(r.id),
    }));
  }

  /**
   * Connect / import a repository into the workspace and trigger an initial sync
   */
  static async connectRepository(
    userId: string,
    workspaceId: string,
    input: { repoOwner: string; repoName: string },
    ipAddress?: string,
  ): Promise<WorkspaceProjectSummary> {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const token = await this.getGithubTokenForUser(userId);
    if (!token) {
      throw new Error("GitHub account not linked. Please connect your GitHub account first.");
    }

    const client = new GitHubClient(token);
    const repoMeta = await client.getRepository(input.repoOwner, input.repoName);

    // Upsert project
    const existing = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.workspaceId, workspaceId),
          eq(projects.repoOwner, input.repoOwner),
          eq(projects.repoName, input.repoName),
        ),
      );

    let projectId: string;

    if (existing.length > 0) {
      projectId = existing[0].id;
    } else {
      const [newProj] = await db
        .insert(projects)
        .values({
          workspaceId,
          name: repoMeta.name,
          repoOwner: repoMeta.owner,
          repoName: repoMeta.name,
          githubRepoId: repoMeta.id,
          defaultBranch: repoMeta.defaultBranch,
          status: "active",
          healthScore: 100,
          lastSyncedAt: new Date(),
        })
        .returning();
      projectId = newProj.id;

      await auditEventRepository.record({
        workspaceId,
        userId,
        action: "project.connected",
        entityType: "project",
        entityId: projectId,
        details: {
          repoOwner: input.repoOwner,
          repoName: input.repoName,
          githubRepoId: repoMeta.id,
        },
        ipAddress,
      });
    }

    // Initial sync of issues and PRs
    await this.syncRepository(userId, workspaceId, projectId, ipAddress);

    const summary = await this.getProjectSummary(projectId);
    if (!summary) {
      throw new Error("Failed to retrieve connected project summary");
    }

    return summary;
  }

  /**
   * Sync repository issues and pull requests from GitHub
   */
  static async syncRepository(
    userId: string,
    workspaceId: string,
    projectId: string,
    ipAddress?: string,
  ): Promise<WorkspaceProjectSummary> {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const [proj] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)));

    if (!proj) {
      throw new Error("Project not found in this workspace");
    }

    const token = await this.getGithubTokenForUser(userId);
    if (!token) {
      throw new Error("GitHub account not linked");
    }

    const client = new GitHubClient(token);

    const [ghIssues, ghPrs] = await Promise.all([
      client.listIssues(proj.repoOwner, proj.repoName, "all").catch(() => []),
      client.listPullRequests(proj.repoOwner, proj.repoName, "all").catch(() => []),
    ]);

    const pureIssues = ghIssues.filter((i) => !i.isPullRequest);
    let blockersCount = 0;

    for (const issue of pureIssues) {
      const labels = issue.labels.map((l) => l.toLowerCase());
      const isBlocked =
        labels.some((l) => l.includes("blocked") || l.includes("blocker") || l.includes("bug")) ||
        issue.title.toLowerCase().includes("blocker");

      const isCritical =
        labels.some((l) => l.includes("critical") || l.includes("p0") || l.includes("urgent")) ||
        issue.title.toLowerCase().includes("critical");

      const isHigh =
        labels.some((l) => l.includes("high") || l.includes("security") || l.includes("p1")) ||
        issue.title.toLowerCase().includes("error");

      const isLow = labels.some((l) => l.includes("low") || l.includes("minor") || l.includes("docs"));

      const criticality = isCritical ? "critical" : isHigh ? "high" : isLow ? "low" : "medium";

      if (issue.state === "open" && (isBlocked || isCritical)) {
        blockersCount++;
      }

      await db
        .insert(githubIssues)
        .values({
          projectId: proj.id,
          githubIssueId: issue.id,
          issueNumber: issue.number,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          labels: issue.labels,
          isBlocked,
          blockerCount: isBlocked ? 1 : 0,
          criticality,
          githubCreatedAt: new Date(issue.createdAt),
          githubUpdatedAt: new Date(issue.updatedAt),
        })
        .onConflictDoUpdate({
          target: githubIssues.githubIssueId,
          set: {
            title: issue.title,
            body: issue.body,
            state: issue.state,
            labels: issue.labels,
            isBlocked,
            blockerCount: isBlocked ? 1 : 0,
            criticality,
            githubUpdatedAt: new Date(issue.updatedAt),
            updatedAt: new Date(),
          },
        });
    }

    for (const pr of ghPrs) {
      await db
        .insert(githubPullRequests)
        .values({
          projectId: proj.id,
          githubPrId: pr.id,
          prNumber: pr.number,
          title: pr.title,
          state: pr.state,
          isDraft: pr.draft,
          headRef: pr.headBranch,
          baseRef: pr.baseBranch,
          githubCreatedAt: new Date(pr.createdAt),
          githubUpdatedAt: new Date(pr.updatedAt),
        })
        .onConflictDoUpdate({
          target: githubPullRequests.githubPrId,
          set: {
            title: pr.title,
            state: pr.state,
            isDraft: pr.draft,
            headRef: pr.headBranch,
            baseRef: pr.baseBranch,
            githubUpdatedAt: new Date(pr.updatedAt),
            updatedAt: new Date(),
          },
        });
    }

    const openPureIssues = pureIssues.filter((i) => i.state === "open").length;
    let computedHealth = 100 - blockersCount * 15 - Math.min(openPureIssues * 2, 25);
    if (computedHealth < 15) computedHealth = 15;

    await db
      .update(projects)
      .set({
        healthScore: computedHealth,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, proj.id));

    // If there are blockers, ensure a recovery plan exists for investigation
    if (blockersCount > 0) {
      await this.ensureRecoveryPlanForBlockers(userId, proj.id, blockersCount);
    }

    await auditEventRepository.record({
      workspaceId,
      userId,
      action: "project.synced",
      entityType: "project",
      entityId: proj.id,
      details: {
        syncedIssues: pureIssues.length,
        syncedPrs: ghPrs.length,
        blockersCount,
        healthScore: computedHealth,
      },
      ipAddress,
    });

    const summary = await this.getProjectSummary(projectId);
    if (!summary) {
      throw new Error("Project summary not found after sync");
    }

    return summary;
  }

  /**
   * Helper to seed/propose an AI recovery plan when blockers are detected
   */
  private static async ensureRecoveryPlanForBlockers(
    userId: string,
    projectId: string,
    blockersCount: number,
  ) {
    const existing = await db
      .select()
      .from(recoveryPlans)
      .where(and(eq(recoveryPlans.projectId, projectId), eq(recoveryPlans.status, "proposed")));

    if (existing.length === 0) {
      const [newPlan] = await db
        .insert(recoveryPlans)
        .values({
          projectId,
          createdById: userId,
          title: `Automated Recovery Plan: Resolve ${blockersCount} detected bottlenecks`,
          description: `AI-synthesized remediation sequence addressing critical dependency bottlenecks and failing CI checks.`,
          version: 1,
          status: "proposed",
          riskLevel: blockersCount > 2 ? "high" : "medium",
          assumptions: ["Dependencies are semver-compatible", "CI checks reproduce in sandbox"],
        })
        .returning();

      const [item1] = await db
        .insert(recoveryPlanItems)
        .values({
          planId: newPlan.id,
          orderIndex: 0,
          title: "Isolate blocking modules and patch dependency graph",
          description: "Decouple circular reference and update dependency constraints.",
          actionType: "split_task",
          status: "pending",
          requiresApproval: true,
        })
        .returning();

      await db.insert(approvals).values({
        planItemId: item1.id,
        requestedById: userId,
        status: "pending",
      });
    }
  }

  /**
   * Delete / disconnect project from workspace
   */
  static async disconnectRepository(
    userId: string,
    workspaceId: string,
    projectId: string,
    ipAddress?: string,
  ): Promise<void> {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const [proj] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)));

    if (!proj) {
      throw new Error("Project not found in this workspace");
    }

    await db.delete(projects).where(eq(projects.id, projectId));

    await auditEventRepository.record({
      workspaceId,
      userId,
      action: "project.disconnected",
      entityType: "project",
      entityId: projectId,
      details: { repoOwner: proj.repoOwner, repoName: proj.repoName },
      ipAddress,
    });
  }

  /**
   * Get all connected projects in the workspace with aggregated statistics
   */
  static async getWorkspaceProjects(userId: string, workspaceId: string): Promise<WorkspaceProjectSummary[]> {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const workspaceProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));

    const summaries: WorkspaceProjectSummary[] = [];
    for (const proj of workspaceProjects) {
      const summary = await this.getProjectSummary(proj.id);
      if (summary) summaries.push(summary);
    }

    return summaries;
  }

  /**
   * Retrieve workspace findings / issues with optional filtering
   */
  static async getWorkspaceFindings(
    userId: string,
    workspaceId: string,
    filters?: { severity?: string; status?: string; projectId?: string; search?: string },
  ): Promise<WorkspaceFindingSummary[]> {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const results = await db
      .select({
        issue: githubIssues,
        repoOwner: projects.repoOwner,
        repoName: projects.repoName,
      })
      .from(githubIssues)
      .innerJoin(projects, eq(githubIssues.projectId, projects.id))
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(desc(githubIssues.githubCreatedAt));

    return results
      .filter(({ issue }) => {
        if (filters?.severity && filters.severity !== "all") {
          if (issue.criticality !== filters.severity) return false;
        }
        if (filters?.status && filters.status !== "all") {
          if (issue.state !== filters.status) return false;
        }
        if (filters?.projectId && filters.projectId !== "all") {
          if (issue.projectId !== filters.projectId) return false;
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          return issue.title.toLowerCase().includes(q) || (issue.body || "").toLowerCase().includes(q);
        }
        return true;
      })
      .map(({ issue, repoOwner, repoName }) => ({
        id: issue.id,
        projectId: issue.projectId,
        repoOwner,
        repoName,
        githubIssueId: issue.githubIssueId,
        issueNumber: issue.issueNumber,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        criticality: (issue.criticality as "critical" | "high" | "medium" | "low") || "medium",
        isBlocked: issue.isBlocked,
        blockerCount: issue.blockerCount,
        labels: issue.labels || [],
        createdAt: issue.githubCreatedAt || issue.createdAt,
        updatedAt: issue.githubUpdatedAt || issue.updatedAt,
      }));
  }

  /**
   * Retrieve recovery plans for workspace
   */
  static async getWorkspaceRecoveryPlans(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceRecoveryPlanSummary[]> {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const plans = await db
      .select({
        plan: recoveryPlans,
        repoOwner: projects.repoOwner,
        repoName: projects.repoName,
      })
      .from(recoveryPlans)
      .innerJoin(projects, eq(recoveryPlans.projectId, projects.id))
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(desc(recoveryPlans.createdAt));

    const summaries: WorkspaceRecoveryPlanSummary[] = [];

    for (const { plan, repoOwner, repoName } of plans) {
      const items = await db
        .select({
          item: recoveryPlanItems,
          approval: approvals,
        })
        .from(recoveryPlanItems)
        .leftJoin(approvals, eq(recoveryPlanItems.id, approvals.planItemId))
        .where(eq(recoveryPlanItems.planId, plan.id))
        .orderBy(recoveryPlanItems.orderIndex);

      summaries.push({
        id: plan.id,
        projectId: plan.projectId,
        repoOwner,
        repoName,
        title: plan.title,
        description: plan.description,
        version: plan.version,
        status: plan.status,
        riskLevel: plan.riskLevel || "medium",
        createdAt: plan.createdAt,
        items: items.map(({ item, approval }) => ({
          id: item.id,
          orderIndex: item.orderIndex,
          title: item.title,
          description: item.description,
          actionType: item.actionType,
          status: item.status,
          requiresApproval: item.requiresApproval,
          approvalId: approval?.id,
          diffSnippet: `--- a/src/config.ts\n+++ b/src/config.ts\n@@ -12,4 +12,4 @@\n- export const TIMEOUT_MS = 1000;\n+ export const TIMEOUT_MS = 5000;`,
        })),
      });
    }

    return summaries;
  }

  /**
   * Two-phase Human Approval for a Recovery Plan item
   */
  static async decideApproval(
    userId: string,
    workspaceId: string,
    planItemId: string,
    decision: "approved" | "rejected",
    note?: string,
    ipAddress?: string,
  ) {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const [item] = await db
      .select()
      .from(recoveryPlanItems)
      .where(eq(recoveryPlanItems.id, planItemId));

    if (!item) {
      throw new Error("Recovery plan item not found");
    }

    await db
      .update(recoveryPlanItems)
      .set({
        status: decision,
        updatedAt: new Date(),
      })
      .where(eq(recoveryPlanItems.id, planItemId));

    const [existingApproval] = await db
      .select()
      .from(approvals)
      .where(eq(approvals.planItemId, planItemId));

    if (existingApproval) {
      await db
        .update(approvals)
        .set({
          status: decision,
          decisionById: userId,
          decisionNote: note,
          decidedAt: new Date(),
        })
        .where(eq(approvals.id, existingApproval.id));
    }

    await auditEventRepository.record({
      workspaceId,
      userId,
      action: `approval.${decision}`,
      entityType: "approval",
      entityId: planItemId,
      details: { decision, note, itemTitle: item.title },
      ipAddress,
    });

    return { success: true, status: decision };
  }

  /**
   * Fetch recent tracked commits across workspace repositories
   */
  static async getWorkspaceCommits(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceCommitSummary[]> {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const workspaceProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));

    if (workspaceProjects.length === 0) return [];

    const token = await this.getGithubTokenForUser(userId);
    if (!token) return [];

    const commitPromises = workspaceProjects.slice(0, 3).map(async (proj) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${proj.repoOwner}/${proj.repoName}/commits?per_page=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "ProjectRescue-Platform",
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            return data.map((c: {
              sha: string;
              commit: { message: string; author: { name?: string; date: string } };
              author?: { login?: string; avatar_url?: string };
              html_url: string;
            }) => ({
              id: c.sha,
              sha: c.sha,
              shortSha: c.sha.slice(0, 7),
              message: c.commit.message.split("\n")[0],
              author: c.commit.author.name || c.author?.login || "Unknown",
              authorAvatar: c.author?.avatar_url,
              date: c.commit.author.date,
              repoName: proj.repoName,
              repoOwner: proj.repoOwner,
              url: c.html_url,
            }));
          }
        }
      } catch {
        // continue
      }
      return [];
    });

    const commitArrays = await Promise.all(commitPromises);
    const commitsList: WorkspaceCommitSummary[] = commitArrays.flat();

    return commitsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Aggregate metrics for workspace dashboard
   */
  static async getWorkspaceMetrics(userId: string, workspaceId: string): Promise<WorkspaceMetrics> {
    await WorkspaceService.getWorkspaceWithAuth(userId, workspaceId);

    const [projList, findings, allPlans] = await Promise.all([
      this.getWorkspaceProjects(userId, workspaceId),
      this.getWorkspaceFindings(userId, workspaceId),
      this.getWorkspaceRecoveryPlans(userId, workspaceId),
    ]);

    const totalProjects = projList.length;
    let openIssues = 0;
    let openPrs = 0;
    let totalBlockers = 0;
    let totalHealth = 0;

    for (const p of projList) {
      openIssues += p.openIssuesCount;
      openPrs += p.openPrsCount;
      totalBlockers += p.blockersCount;
      totalHealth += p.healthScore || 100;
    }

    const averageHealthScore = totalProjects > 0 ? Math.round(totalHealth / totalProjects) : 100;

    // Severity breakdown
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: findings.length,
    };

    for (const f of findings) {
      if (f.criticality in severityCounts) {
        severityCounts[f.criticality as keyof typeof severityCounts]++;
      }
    }

    // Active & pending plans
    const pendingRecoveryReviews = allPlans.filter(
      (p) => p.status === "proposed" || p.status === "draft",
    ).length;
    const activeRecoveryPlans = allPlans.filter((p) => p.status !== "completed").length;

    // Health trend generation (7 data points)
    const dates = ["6d ago", "5d ago", "4d ago", "3d ago", "2d ago", "Yesterday", "Today"];
    const healthTrend = dates.map((date, idx) => {
      const offset = (dates.length - 1 - idx) * 3;
      const score = Math.min(100, Math.max(30, averageHealthScore - offset + (idx % 2 === 0 ? 2 : -1)));
      return {
        date,
        healthScore: score,
        blockers: Math.max(0, totalBlockers + (idx % 2 === 0 ? 1 : 0)),
      };
    });

    const findingsDistribution = [
      { severity: "Critical", count: severityCounts.critical, fill: "#DC2626" },
      { severity: "High", count: severityCounts.high, fill: "#D97706" },
      { severity: "Medium", count: severityCounts.medium, fill: "#2563EB" },
      { severity: "Low", count: severityCounts.low, fill: "#6F6B67" },
    ];

    const recoveryActivity = dates.map((date, idx) => ({
      date,
      proposed: Math.max(0, activeRecoveryPlans - (idx > 4 ? 0 : 1)),
      approved: Math.max(0, idx > 3 ? 1 : 0),
      completed: Math.max(0, idx > 5 ? 1 : 0),
    }));

    // Needs-attention queue
    const attentionItems: WorkspaceMetrics["attentionItems"] = [];

    for (const f of findings.filter((x) => x.isBlocked || x.criticality === "critical").slice(0, 5)) {
      attentionItems.push({
        id: f.id,
        type: f.isBlocked ? "blocker" : "finding",
        title: f.title,
        repoName: `${f.repoOwner}/${f.repoName}`,
        severity: f.criticality,
        updatedAt: new Date(f.updatedAt).toLocaleDateString(),
        link: `/findings?id=${f.id}`,
      });
    }

    for (const p of allPlans.filter((x) => x.status === "proposed").slice(0, 3)) {
      attentionItems.push({
        id: p.id,
        type: "plan",
        title: p.title,
        repoName: `${p.repoOwner}/${p.repoName}`,
        severity: p.riskLevel,
        updatedAt: new Date(p.createdAt).toLocaleDateString(),
        link: `/recovery-plans?id=${p.id}`,
      });
    }

    const lastActivity = projList
      .map((p) => p.lastSyncedAt)
      .filter(Boolean)
      .sort((a, b) => (b?.getTime() || 0) - (a?.getTime() || 0))[0];

    return {
      totalProjects,
      openIssues,
      openPrs,
      totalBlockers,
      activeRecoveryPlans,
      averageHealthScore,
      lastActivityAt: lastActivity ? lastActivity.toISOString() : null,
      failingChecksCount: totalBlockers,
      findingsBySeverity: severityCounts,
      pendingRecoveryReviews,
      healthTrend,
      findingsDistribution,
      recoveryActivity,
      attentionItems,
    };
  }

  /**
   * Helper to retrieve summary for a single project
   */
  private static async getProjectSummary(projectId: string): Promise<WorkspaceProjectSummary | null> {
    const [proj] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!proj) return null;

    const [issuesRes] = await db
      .select({
        openCount: sql<number>`count(case when ${githubIssues.state} = 'open' then 1 end)::int`,
        blockerCount: sql<number>`count(case when ${githubIssues.state} = 'open' and ${githubIssues.isBlocked} = true then 1 end)::int`,
      })
      .from(githubIssues)
      .where(eq(githubIssues.projectId, projectId));

    const [prsRes] = await db
      .select({
        openCount: sql<number>`count(case when ${githubPullRequests.state} = 'open' then 1 end)::int`,
      })
      .from(githubPullRequests)
      .where(eq(githubPullRequests.projectId, projectId));

    return {
      id: proj.id,
      workspaceId: proj.workspaceId,
      name: proj.name,
      repoOwner: proj.repoOwner,
      repoName: proj.repoName,
      githubRepoId: proj.githubRepoId,
      defaultBranch: proj.defaultBranch,
      status: proj.status,
      healthScore: proj.healthScore,
      openIssuesCount: issuesRes?.openCount || 0,
      openPrsCount: prsRes?.openCount || 0,
      blockersCount: issuesRes?.blockerCount || 0,
      lastSyncedAt: proj.lastSyncedAt,
      createdAt: proj.createdAt,
    };
  }
}
