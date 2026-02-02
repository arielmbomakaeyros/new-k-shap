import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ModalState {
  id: string;
  props?: Record<string, any>;
}

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface UIState {
  // Modals
  activeModals: ModalState[];
  globalLoading: boolean;
  
  // Toasts
  toasts: Toast[];

  // Modal actions
  openModal: (id: string, props?: Record<string, any>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      activeModals: [],
      globalLoading: false,
      toasts: [],

      openModal: (id: string, props?: Record<string, any>) => {
        set((state) => ({
          activeModals: [
            ...state.activeModals.filter(modal => modal.id !== id), // Remove if exists
            { id, props }
          ]
        }));
      },

      closeModal: (id: string) => {
        set((state) => ({
          activeModals: state.activeModals.filter(modal => modal.id !== id)
        }));
      },

      closeAllModals: () => {
        set({ activeModals: [] });
      },

      addToast: (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }]
        }));

        // Auto-remove toast after duration
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, toast.duration || 5000);
        }

        return id;
      },

      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential UI state
      partialize: (state) => ({
        activeModals: state.activeModals,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useActiveModals = () => useUIStore((state) => state.activeModals);
export const useGlobalLoading = () => useUIStore((state) => state.globalLoading);
export const useToasts = () => useUIStore((state) => state.toasts);