export type AgentArtifactType =
  | "context_summary"
  | "tool_trace"
  | "evaluation"
  | "error_report";

export interface IAgentArtifact {
  workspaceId: string; // Foreign PostgreSQL Workspace UUID
  projectId: string; // Foreign PostgreSQL Project UUID
  agentRunId: string; // Foreign PostgreSQL AgentRun UUID
  artifactType: AgentArtifactType;
  schemaVersion: number;
  content: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date;
}
