import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: any;
  isKaeyrosUser: boolean;
  roles: any[];
  systemRoles: string[];
  departments: any[];
  offices: any[];
  canLogin: boolean;
  mustChangePassword: boolean;
  avatar?: string;
  preferredLanguage: string;
  notificationPreferences?: {
    email?: boolean;
    inApp?: boolean;
    disbursementCreated?: boolean;
    disbursementValidated?: boolean;
    disbursementRejected?: boolean;
    disbursementCompleted?: boolean;
    chatMessages?: boolean;
    systemAlerts?: boolean;
  };
  maxApprovalAmount?: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  isAuthenticated: boolean;

  // Actions
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Computed getter for isAuthenticated
      get isAuthenticated() {
        return !!get().token && !!get().user;
      },

      // Login action - sets user, token, and optionally refresh token
      login: (user: User, token: string, refreshToken?: string) => {
        set({ user, token, error: null, isLoading: false });
        // Store refresh token separately (not in Zustand persistence)
        if (typeof window !== 'undefined') {
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          // Set a cookie flag so Next.js middleware can detect auth state
          document.cookie = `is_authenticated=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          // Store isKaeyrosUser flag for middleware redirect logic
          document.cookie = `is_kaeyros_user=${user.isKaeyrosUser ? '1' : '0'}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
      },

      // Logout action - clears all auth state
      logout: () => {
        set({ user: null, token: null, error: null, isLoading: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refreshToken');
          // Clear auth cookies
          document.cookie = 'is_authenticated=; path=/; max-age=0';
          document.cookie = 'is_kaeyros_user=; path=/; max-age=0';
        }
      },

      // Set user
      setUser: (user: User | null) => set({ user }),

      // Update user with partial data (useful for profile updates)
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      // Set token
      setToken: (token: string | null) => set({ token }),

      // Set loading state
      setIsLoading: (isLoading: boolean) => set({ isLoading }),

      // Set error
      setError: (error: string | null) => set({ error }),

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useToken = () => useAuthStore((state) => state.token);
export const useIsAuthenticated = () =>
  useAuthStore((state) => !!state.token && !!state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
