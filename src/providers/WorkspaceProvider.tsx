"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  role: string;
  description?: string | null;
}

interface WorkspaceContextType {
  workspaces: WorkspaceItem[];
  currentWorkspace: WorkspaceItem | null;
  isLoading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  getWorkspaceUrl: (path: string) => string;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = React.createContext<WorkspaceContextType | undefined>(undefined);

function setWorkspaceCookie(id: string) {
  if (typeof document !== "undefined") {
    document.cookie = `project_rescue_active_workspace=${id}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

function getStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("project_rescue_active_workspace="));
  if (match) return match.split("=")[1];
  return localStorage.getItem("project_rescue_active_workspace");
}

function WorkspaceProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlWorkspaceId = searchParams.get("workspaceId");

  const [workspaces, setWorkspaces] = React.useState<WorkspaceItem[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = React.useState<WorkspaceItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchWorkspaces = React.useCallback(async () => {
    try {
      const res = await fetch("/api/workspaces");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.workspaces)) {
        const mapped: WorkspaceItem[] = data.workspaces.map(
          (item: { workspace: { id: string; name: string; slug: string; description?: string }; membership: { role: string } }) => ({
            id: item.workspace.id,
            name: item.workspace.name,
            slug: item.workspace.slug,
            description: item.workspace.description,
            role: item.membership.role,
          }),
        );
        setWorkspaces(mapped);

        let targetWorkspace: WorkspaceItem | undefined;
        if (urlWorkspaceId) {
          targetWorkspace = mapped.find((w) => w.id === urlWorkspaceId);
        }
        if (!targetWorkspace) {
          const storedId = getStoredWorkspaceId();
          if (storedId) {
            targetWorkspace = mapped.find((w) => w.id === storedId);
          }
        }
        if (!targetWorkspace && mapped.length > 0) {
          targetWorkspace = mapped[0];
        }

        if (targetWorkspace) {
          setCurrentWorkspace(targetWorkspace);
          setWorkspaceCookie(targetWorkspace.id);
          localStorage.setItem("project_rescue_active_workspace", targetWorkspace.id);
        }
      }
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    } finally {
      setIsLoading(false);
    }
  }, [urlWorkspaceId]);

  React.useEffect(() => {
    let ignore = false;

    fetch("/api/workspaces")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (ignore || !data || !Array.isArray(data.workspaces)) {
          if (!ignore) setIsLoading(false);
          return;
        }
        const mapped: WorkspaceItem[] = data.workspaces.map(
          (item: { workspace: { id: string; name: string; slug: string; description?: string }; membership: { role: string } }) => ({
            id: item.workspace.id,
            name: item.workspace.name,
            slug: item.workspace.slug,
            description: item.workspace.description,
            role: item.membership.role,
          }),
        );
        setWorkspaces(mapped);

        let targetWorkspace: WorkspaceItem | undefined;
        if (urlWorkspaceId) {
          targetWorkspace = mapped.find((w) => w.id === urlWorkspaceId);
        }
        if (!targetWorkspace) {
          const storedId = getStoredWorkspaceId();
          if (storedId) {
            targetWorkspace = mapped.find((w) => w.id === storedId);
          }
        }
        if (!targetWorkspace && mapped.length > 0) {
          targetWorkspace = mapped[0];
        }

        if (targetWorkspace) {
          setCurrentWorkspace(targetWorkspace);
          setWorkspaceCookie(targetWorkspace.id);
          localStorage.setItem("project_rescue_active_workspace", targetWorkspace.id);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load workspaces:", err);
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [urlWorkspaceId]);

  // Keep state synced if URL workspaceId changes
  React.useEffect(() => {
    if (!urlWorkspaceId || workspaces.length === 0) return;
    const match = workspaces.find((w) => w.id === urlWorkspaceId);
    if (match && match.id !== currentWorkspace?.id) {
      setWorkspaceCookie(match.id);
      localStorage.setItem("project_rescue_active_workspace", match.id);
      Promise.resolve().then(() => {
        setCurrentWorkspace(match);
      });
    }
  }, [urlWorkspaceId, workspaces, currentWorkspace]);

  const switchWorkspace = React.useCallback(
    (workspaceId: string) => {
      const found = workspaces.find((w) => w.id === workspaceId);
      if (!found) return;

      setCurrentWorkspace(found);
      setWorkspaceCookie(found.id);
      localStorage.setItem("project_rescue_active_workspace", found.id);

      const params = new URLSearchParams(searchParams.toString());
      params.set("workspaceId", found.id);
      router.push(`${pathname}?${params.toString()}`);
    },
    [workspaces, searchParams, pathname, router],
  );

  const getWorkspaceUrl = React.useCallback(
    (path: string) => {
      if (!currentWorkspace) return path;
      const separator = path.includes("?") ? "&" : "?";
      return `${path}${separator}workspaceId=${currentWorkspace.id}`;
    },
    [currentWorkspace],
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        switchWorkspace,
        getWorkspaceUrl,
        refreshWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<>{children}</>}>
      <WorkspaceProviderInner>{children}</WorkspaceProviderInner>
    </React.Suspense>
  );
}

const defaultWorkspaceContext: WorkspaceContextType = {
  workspaces: [],
  currentWorkspace: null,
  isLoading: true,
  switchWorkspace: () => {},
  getWorkspaceUrl: (path: string) => path,
  refreshWorkspaces: async () => {},
};

export function useWorkspace() {
  const context = React.useContext(WorkspaceContext);
  return context ?? defaultWorkspaceContext;
}
