import { create } from "zustand";

export type DateRangeOption = "7d" | "14d" | "30d" | "90d";
export type SeverityFilter = "all" | "critical" | "high" | "medium" | "low";

interface DashboardUIState {
  dateRange: DateRangeOption;
  selectedSeverity: SeverityFilter;
  activeRepositoryId: string | "all";
  isRefreshing: boolean;

  // Actions
  setDateRange: (range: DateRangeOption) => void;
  setSelectedSeverity: (severity: SeverityFilter) => void;
  setActiveRepositoryId: (repoId: string | "all") => void;
  setIsRefreshing: (refreshing: boolean) => void;
}

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  dateRange: "30d",
  selectedSeverity: "all",
  activeRepositoryId: "all",
  isRefreshing: false,

  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedSeverity: (selectedSeverity) => set({ selectedSeverity }),
  setActiveRepositoryId: (activeRepositoryId) => set({ activeRepositoryId }),
  setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
}));
