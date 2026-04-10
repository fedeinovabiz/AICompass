// ══════════════════════════════════════════════
// AUTH STORE — Autenticación con Zustand
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiPost, apiGet } from '@/services/apiClient';
import type { User } from '@/types';
import type { LoginResponse } from '@/types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

const TOKEN_KEY = 'token';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  error: null,
  get isAuthenticated() {
    return !!get().token;
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiPost<LoginResponse>('/auth/login', { email, password });
      localStorage.setItem(TOKEN_KEY, response.token);
      set({ token: response.token, user: response.user, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, error: null });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const user = await apiGet<User>('/auth/me');
      set({ user, isLoading: false });
    } catch {
      // Si falla, limpiar sesión
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
