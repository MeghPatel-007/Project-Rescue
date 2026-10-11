export interface ISnapshotIssue {
  githubIssueId: number;
  issueNumber: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  authorLogin?: string;
  assignees: string[];
  labels: string[];
  githubCreatedAt?: Date;
  githubUpdatedAt?: Date;
  githubClosedAt?: Date;
}

export interface ISnapshotPullRequest {
  githubPrId: number;
  prNumber: number;
  title: string;
  body?: string;
  state: "open" | "closed" | "merged";
  isDraft: boolean;
  headRef?: string;
  baseRef?: string;
  authorLogin?: string;
  mergedAt?: Date;
  githubCreatedAt?: Date;
  githubUpdatedAt?: Date;
  githubClosedAt?: Date;
}

export interface IGitHubSnapshot {
  workspaceId: string; // Foreign PostgreSQL Workspace UUID
  projectId: string; // Foreign PostgreSQL Project UUID
  syncRunId: string; // Foreign PostgreSQL SyncRun UUID
  sourceVersion: number;
  capturedAt: Date;
  issues: ISnapshotIssue[];
  pullRequests: ISnapshotPullRequest[];
  metadata: Record<string, unknown>;
  schemaVersion: number;
  createdAt?: Date;
  updatedAt?: Date;
}
