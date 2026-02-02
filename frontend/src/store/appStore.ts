import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'fr';

interface AppState {
  // UI State
  theme: Theme;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  locale: Locale;

  // App Context
  currentCompanyId: string | null;
  currentDepartmentId: string | null;
  currentOfficeId: string | null;

  // Actions
  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setLocale: (locale: Locale) => void;
  setCurrentCompanyId: (companyId: string | null) => void;
  setCurrentDepartmentId: (departmentId: string | null) => void;
  setCurrentOfficeId: (officeId: string | null) => void;
  resetAppState: () => void;
}

const initialState = {
  theme: 'system' as Theme,
  sidebarOpen: true,
  sidebarCollapsed: false,
  locale: 'en' as Locale,
  currentCompanyId: null,
  currentDepartmentId: null,
  currentOfficeId: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      // Theme actions
      setTheme: (theme: Theme) => set({ theme }),

      // Sidebar actions
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Locale actions
      setLocale: (locale: Locale) => {
        // Also update localStorage for i18n persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('locale', locale);
        }
        set({ locale });
      },

      // Company/Department/Office context
      setCurrentCompanyId: (companyId: string | null) =>
        set({ currentCompanyId: companyId }),
      setCurrentDepartmentId: (departmentId: string | null) =>
        set({ currentDepartmentId: departmentId }),
      setCurrentOfficeId: (officeId: string | null) =>
        set({ currentOfficeId: officeId }),

      // Reset app state (useful on logout)
      resetAppState: () =>
        set({
          currentCompanyId: null,
          currentDepartmentId: null,
          currentOfficeId: null,
        }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        locale: state.locale,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useTheme = () => useAppStore((state) => state.theme);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useSidebarCollapsed = () =>
  useAppStore((state) => state.sidebarCollapsed);
export const useLocale = () => useAppStore((state) => state.locale);
export const useCurrentCompanyId = () =>
  useAppStore((state) => state.currentCompanyId);
