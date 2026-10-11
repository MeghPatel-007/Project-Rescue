import { Schema, model, models } from "mongoose";
import type { IAgentArtifact } from "../types/agent-artifact.type";

const agentArtifactSchema = new Schema<IAgentArtifact>(
  {
    workspaceId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    agentRunId: { type: String, required: true, index: true },
    artifactType: {
      type: String,
      enum: ["context_summary", "tool_trace", "evaluation", "error_report"],
      required: true,
      index: true,
    },
    schemaVersion: { type: Number, required: true, default: 1 },
    content: { type: Schema.Types.Mixed, required: true, default: {} },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
  },
);

agentArtifactSchema.index({ projectId: 1, createdAt: -1 });
agentArtifactSchema.index({ agentRunId: 1, artifactType: 1 });

export const AgentArtifact =
  models.AgentArtifact ??
  model<IAgentArtifact>("AgentArtifact", agentArtifactSchema);
