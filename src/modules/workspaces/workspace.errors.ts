export class WorkspaceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "WorkspaceError";
  }
}

export class WorkspaceNotFoundError extends WorkspaceError {
  constructor(workspaceId: string) {
    super(`Workspace '${workspaceId}' not found.`, "WORKSPACE_NOT_FOUND", 404);
  }
}

export class WorkspaceUnauthorizedError extends WorkspaceError {
  constructor(message = "Unauthorized: not a member of this workspace.") {
    super(message, "WORKSPACE_UNAUTHORIZED", 403);
  }
}

export class WorkspacePermissionDeniedError extends WorkspaceError {
  constructor(message = "Permission denied: insufficient role in this workspace.") {
    super(message, "WORKSPACE_PERMISSION_DENIED", 403);
  }
}

export class WorkspaceConflictError extends WorkspaceError {
  constructor(message: string) {
    super(message, "WORKSPACE_CONFLICT", 409);
  }
}
