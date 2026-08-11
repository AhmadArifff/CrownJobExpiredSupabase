import { create } from 'zustand';
import { SupabaseConfigDTO } from '@cronjob/shared';

interface ConfigState {
  configs: SupabaseConfigDTO[];
  isLoading: boolean;
  error: string | null;
  recentlyDeleted: SupabaseConfigDTO | null;
  setConfigs: (configs: SupabaseConfigDTO[]) => void;
  addConfig: (config: SupabaseConfigDTO) => void;
  updateConfig: (id: string, updated: Partial<SupabaseConfigDTO>) => void;
  removeConfig: (id: string) => void;
  setRecentlyDeleted: (config: SupabaseConfigDTO | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  configs: [],
  isLoading: false,
  error: null,
  recentlyDeleted: null,

  setConfigs: (configs) => set({ configs, error: null }),
  addConfig: (config) => set((state) => ({ configs: [config, ...state.configs] })),
  updateConfig: (id, updated) =>
    set((state) => ({
      configs: state.configs.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    })),
  removeConfig: (id) =>
    set((state) => {
      const target = state.configs.find((c) => c.id === id);
      return {
        configs: state.configs.filter((c) => c.id !== id),
        recentlyDeleted: target || null,
      };
    }),
  setRecentlyDeleted: (recentlyDeleted) => set({ recentlyDeleted }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
