/**
 * GitHub API client for fetching repository metadata, issues, and pull requests.
 * Uses either the user's OAuth access token or GitHub App installation token.
 */

export interface GitHubRepoSummary {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  description: string | null;
  htmlUrl: string;
  updatedAt: string;
}

export interface GitHubIssueSummary {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  body: string | null;
  htmlUrl: string;
  isPullRequest: boolean;
  createdAt: string;
  updatedAt: string;
  labels: string[];
}

export interface GitHubPullRequestSummary {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  htmlUrl: string;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
  headBranch: string;
  baseBranch: string;
}

export class GitHubClient {
  private baseUrl = "https://api.github.com";

  constructor(private readonly token: string) {}

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${this.token}`,
        "User-Agent": "ProjectRescue-Platform",
        ...options.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail = errorText;
      try {
        const json = JSON.parse(errorText);
        errorDetail = json.message || errorText;
      } catch {
        // use raw text
      }
      throw new Error(`GitHub API error (${response.status}): ${errorDetail}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Verify token and fetch authenticated user profile
   */
  async getViewer(): Promise<{ id: number; login: string; name: string | null; avatarUrl: string }> {
    const user = await this.request<{
      id: number;
      login: string;
      name: string | null;
      avatar_url: string;
    }>("/user");

    return {
      id: user.id,
      login: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
    };
  }

  /**
   * List repositories visible to the user token
   */
  async listUserRepositories(perPage = 100): Promise<GitHubRepoSummary[]> {
    const repos = await this.request<
      Array<{
        id: number;
        name: string;
        full_name: string;
        owner: { login: string };
        default_branch: string;
        private: boolean;
        description: string | null;
        html_url: string;
        updated_at: string;
      }>
    >(`/user/repos?per_page=${perPage}&sort=updated&affiliation=owner,collaborator,organization_member`);

    return repos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner.login,
      defaultBranch: r.default_branch || "main",
      isPrivate: r.private,
      description: r.description,
      htmlUrl: r.html_url,
      updatedAt: r.updated_at,
    }));
  }

  /**
   * Get specific repository metadata
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepoSummary> {
    const r = await this.request<{
      id: number;
      name: string;
      full_name: string;
      owner: { login: string };
      default_branch: string;
      private: boolean;
      description: string | null;
      html_url: string;
      updated_at: string;
    }>(`/repos/${owner}/${repo}`);

    return {
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner.login,
      defaultBranch: r.default_branch || "main",
      isPrivate: r.private,
      description: r.description,
      htmlUrl: r.html_url,
      updatedAt: r.updated_at,
    };
  }

  /**
   * List issues for a repository (excluding PRs)
   */
  async listIssues(owner: string, repo: string, state: "open" | "closed" | "all" = "open"): Promise<GitHubIssueSummary[]> {
    const issues = await this.request<
      Array<{
        id: number;
        number: number;
        title: string;
        state: "open" | "closed";
        body: string | null;
        html_url: string;
        pull_request?: unknown;
        created_at: string;
        updated_at: string;
        labels: Array<{ name: string } | string>;
      }>
    >(`/repos/${owner}/${repo}/issues?state=${state}&per_page=50`);

    return issues.map((i) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      state: i.state,
      body: i.body,
      htmlUrl: i.html_url,
      isPullRequest: Boolean(i.pull_request),
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      labels: (i.labels || []).map((l) => (typeof l === "string" ? l : l.name)),
    }));
  }

  /**
   * List pull requests for a repository
   */
  async listPullRequests(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "open",
  ): Promise<GitHubPullRequestSummary[]> {
    const prs = await this.request<
      Array<{
        id: number;
        number: number;
        title: string;
        state: "open" | "closed";
        html_url: string;
        draft?: boolean;
        created_at: string;
        updated_at: string;
        head: { ref: string };
        base: { ref: string };
      }>
    >(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=30`);

    return prs.map((p) => ({
      id: p.id,
      number: p.number,
      title: p.title,
      state: p.state,
      htmlUrl: p.html_url,
      draft: Boolean(p.draft),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      headBranch: p.head?.ref || "unknown",
      baseBranch: p.base?.ref || "main",
    }));
  }
}
