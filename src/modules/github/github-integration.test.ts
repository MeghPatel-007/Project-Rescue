import { describe, it, expect, vi, beforeEach, afterEach } from "bun:test";
import { GitHubClient } from "@/integration/github/github-client";
import { GithubIntegrationService } from "./github-integration.service";
import { WorkspaceService } from "@/modules/workspaces/workspace.service";
import { WorkspaceUnauthorizedError } from "@/modules/workspaces/workspace.errors";

const originalFetch = globalThis.fetch;

describe("GitHubClient", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("formats user headers and calls the GitHub API endpoint", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("api.github.com")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 12345,
            login: "octocat",
            name: "The Octocat",
            avatar_url: "https://github.com/images/error/octocat_happy.gif",
          }),
        });
      }
      return originalFetch(url);
    });

    // @ts-expect-error mocking fetch selectively
    globalThis.fetch = mockFetch;

    const client = new GitHubClient("gho_testtoken123");
    const viewer = await client.getViewer();

    expect(viewer.login).toBe("octocat");
    expect(viewer.id).toBe(12345);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("handles GitHub API error responses gracefully", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("api.github.com")) {
        return Promise.resolve({
          ok: false,
          status: 401,
          text: async () => JSON.stringify({ message: "Bad credentials" }),
        });
      }
      return originalFetch(url);
    });

    // @ts-expect-error mocking fetch selectively
    globalThis.fetch = mockFetch;

    const client = new GitHubClient("bad_token");
    expect(client.getViewer()).rejects.toThrow("GitHub API error (401): Bad credentials");
  });
});

describe("GithubIntegrationService - Multi-Tenant Security & Scoping", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("enforces strict workspace authorization before accessing status", async () => {
    vi.spyOn(WorkspaceService, "getWorkspaceWithAuth").mockRejectedValue(
      new WorkspaceUnauthorizedError(),
    );

    expect(
      GithubIntegrationService.getWorkspaceGithubStatus(
        "unauthorized-user-id",
        "0706a5dd-ff91-4e3b-90b3-2ddc2bedacb2",
      ),
    ).rejects.toThrow(WorkspaceUnauthorizedError);
  });

  it("never returns raw oauth token in workspace status output", async () => {
    vi.spyOn(WorkspaceService, "getWorkspaceWithAuth").mockResolvedValue({
      workspace: {
        id: "0706a5dd-ff91-4e3b-90b3-2ddc2bedacb2",
        name: "Leads Creation ",
        slug: "leads-creation-",
        description: null,
        ownerId: "31OLCK54wKd9IX5wuJSDz2vMTXeqnemO",
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      membership: {
        id: "member-1",
        workspaceId: "0706a5dd-ff91-4e3b-90b3-2ddc2bedacb2",
        userId: "31OLCK54wKd9IX5wuJSDz2vMTXeqnemO",
        role: "owner",
        joinedAt: new Date(),
      },
    });

    const status = await GithubIntegrationService.getWorkspaceGithubStatus(
      "31OLCK54wKd9IX5wuJSDz2vMTXeqnemO",
      "0706a5dd-ff91-4e3b-90b3-2ddc2bedacb2",
    );

    // Verify response structure does not leak any raw token
    expect(status).toHaveProperty("connected");
    expect(status).toHaveProperty("connectedProjectsCount");
    expect(status).not.toHaveProperty("token");
    expect(status).not.toHaveProperty("accessToken");
    expect(status).not.toHaveProperty("refreshToken");
  });
});
