import { Schema, model, models } from "mongoose";
import type {
  IGitHubSnapshot,
  ISnapshotIssue,
  ISnapshotPullRequest,
} from "../types/github-snapshot.type";

const snapshotIssueSchema = new Schema<ISnapshotIssue>(
  {
    githubIssueId: { type: Number, required: true },
    issueNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String },
    state: { type: String, enum: ["open", "closed"], required: true },
    authorLogin: { type: String, trim: true },
    assignees: [{ type: String }],
    labels: [{ type: String }],
    githubCreatedAt: { type: Date },
    githubUpdatedAt: { type: Date },
    githubClosedAt: { type: Date },
  },
  { _id: false },
);

const snapshotPullRequestSchema = new Schema<ISnapshotPullRequest>(
  {
    githubPrId: { type: Number, required: true },
    prNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String },
    state: { type: String, enum: ["open", "closed", "merged"], required: true },
    isDraft: { type: Boolean, default: false },
    headRef: { type: String },
    baseRef: { type: String },
    authorLogin: { type: String, trim: true },
    mergedAt: { type: Date },
    githubCreatedAt: { type: Date },
    githubUpdatedAt: { type: Date },
    githubClosedAt: { type: Date },
  },
  { _id: false },
);

const githubSnapshotSchema = new Schema<IGitHubSnapshot>(
  {
    workspaceId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    syncRunId: { type: String, required: true, index: true },
    sourceVersion: { type: Number, required: true, default: 1 },
    capturedAt: { type: Date, required: true, default: Date.now },
    issues: [snapshotIssueSchema],
    pullRequests: [snapshotPullRequestSchema],
    metadata: { type: Schema.Types.Mixed, default: {} },
    schemaVersion: { type: Number, required: true, default: 1 },
  },
  {
    timestamps: true,
  },
);

githubSnapshotSchema.index({ projectId: 1, capturedAt: -1 });
githubSnapshotSchema.index({ projectId: 1, sourceVersion: 1 });
githubSnapshotSchema.index({ syncRunId: 1 });

export const GitHubSnapshot =
  models.GitHubSnapshot ??
  model<IGitHubSnapshot>("GitHubSnapshot", githubSnapshotSchema);
