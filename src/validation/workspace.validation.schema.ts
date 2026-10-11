import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  description: z.string().max(1000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export const addWorkspaceMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["owner", "admin", "member", "viewer"]).default("member"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>;
