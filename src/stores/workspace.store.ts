import { create } from "zustand";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface WorkspaceState {
  activeWorkspaceId: string | null;
  workspaces: WorkspaceSummary[];
  isSwitcherOpen: boolean;
  isCreateModalOpen: boolean;

  // Actions
  setActiveWorkspaceId: (id: string | null) => void;
  setWorkspaces: (workspaces: WorkspaceSummary[]) => void;
  setSwitcherOpen: (open: boolean) => void;
  setCreateModalOpen: (open: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: null,
  workspaces: [],
  isSwitcherOpen: false,
  isCreateModalOpen: false,

  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  setSwitcherOpen: (open) => set({ isSwitcherOpen: open }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
}));
