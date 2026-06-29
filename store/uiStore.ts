import { create } from 'zustand';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AdminFilters {
  status: string;
  search: string;
  startDate: string;
  endDate: string;
}

interface UIState {
  // Notification state
  notifications: Notification[];
  unreadCount: number;

  // Modal state
  activeModal: string | null;
  modalData: Record<string, unknown> | null;

  // Admin filters
  filters: AdminFilters;

  // Sidebar state
  sidebarOpen: boolean;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  openModal: (modalId: string, data?: Record<string, unknown> | null) => void;
  closeModal: () => void;
  updateFilters: (filters: Partial<AdminFilters>) => void;
  resetFilters: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const defaultFilters: AdminFilters = {
  status: '',
  search: '',
  startDate: '',
  endDate: '',
};

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  activeModal: null,
  modalData: null,
  filters: { ...defaultFilters },
  sidebarOpen: false,

  // Actions
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),

  openModal: (modalId, data = null) =>
    set({ activeModal: modalId, modalData: data as Record<string, unknown> | null }),

  closeModal: () => set({ activeModal: null, modalData: null }),

  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
