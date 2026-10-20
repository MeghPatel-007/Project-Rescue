import { create } from "zustand";

export type RepositoryStatusFilter = "all" | "healthy" | "has_blockers";

interface RepositoryStoreState {
  searchQuery: string;
  statusFilter: RepositoryStatusFilter;
  isConnectModalOpen: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: RepositoryStatusFilter) => void;
  setConnectModalOpen: (open: boolean) => void;
}

export const useRepositoryStore = create<RepositoryStoreState>((set) => ({
  searchQuery: "",
  statusFilter: "all",
  isConnectModalOpen: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setConnectModalOpen: (isConnectModalOpen) => set({ isConnectModalOpen }),
}));
