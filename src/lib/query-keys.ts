/**
 * Canonical TanStack Query key factories for ProjectRescue.
 * All workspace-scoped queries MUST include the workspaceId to maintain strict tenant cache isolation.
 */

export interface FindingFilters {
  projectId?: string;
  status?: string;
  criticality?: string;
  search?: string;
}

export const queryKeys = {
  workspaces: () => ['workspaces'] as const,
  workspace: (workspaceId: string) => ['workspace', workspaceId] as const,
  dashboardMetrics: (workspaceId: string, range?: string) =>
    ['dashboard-metrics', workspaceId, range ?? '7d'] as const,
  projects: (workspaceId: string) => ['projects', workspaceId] as const,
  project: (workspaceId: string, projectId: string) =>
    ['project', workspaceId, projectId] as const,
  findings: (workspaceId: string, filters?: FindingFilters) =>
    ['findings', workspaceId, filters ?? {}] as const,
  recoveryPlans: (workspaceId: string) =>
    ['recovery-plans', workspaceId] as const,
  recoveryPlan: (workspaceId: string, planId: string) =>
    ['recovery-plan', workspaceId, planId] as const,
  jobs: (workspaceId: string) => ['jobs', workspaceId] as const,
  activity: (workspaceId: string, limit: number = 20) =>
    ['activity', workspaceId, limit] as const,
  commits: (workspaceId: string, projectId?: string) =>
    ['commits', workspaceId, projectId ?? 'all'] as const,
  aiActivity: (workspaceId: string) => ['ai-activity', workspaceId] as const,
};
