import { create } from 'zustand';
import type { User, UserRole, Order } from '@shared/types';

interface AppState {
  currentUser: User | null;
  currentRole: UserRole;
  orders: Order[];
  loading: boolean;
  error: string | null;
  
  setCurrentUser: (user: User | null) => void;
  setCurrentRole: (role: UserRole) => void;
  setOrders: (orders: Order[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  login: (phone: string, role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  currentRole: 'employer',
  orders: [],
  loading: false,
  error: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentRole: (role) => set({ currentRole: role }),
  setOrders: (orders) => set({ orders }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  login: async (phone, role) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      set({ currentUser: data.data, currentRole: role, loading: false });
      localStorage.setItem('currentUserId', data.data.id);
      localStorage.setItem('currentRole', role);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: () => {
    set({ currentUser: null });
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentRole');
  },

  switchRole: async (role) => {
    set({ loading: true });
    try {
      const phone = role === 'employer' ? '13800000001' : '13900000001';
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      set({ currentUser: data.data, currentRole: role, loading: false });
      localStorage.setItem('currentUserId', data.data.id);
      localStorage.setItem('currentRole', role);
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useAppStore;
