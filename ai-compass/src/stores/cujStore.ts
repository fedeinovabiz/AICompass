// ══════════════════════════════════════════════
// CUJ STORE — Gestión de Critical User Journeys
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDel } from '@/services/apiClient';
import type { Cuj, CujStep } from '@/types';

interface CreateCujData {
  engagementId: string;
  name: string;
  actor: string;
  objective: string;
  steps?: Omit<CujStep, 'id' | 'cujId'>[];
}

interface UpdateCujData {
  name?: string;
  actor?: string;
  objective?: string;
  steps?: Omit<CujStep, 'id' | 'cujId'>[];
}

interface CujState {
  cujs: Cuj[];
  currentCuj: Cuj | null;
  isLoading: boolean;
  error: string | null;

  fetchCujs: (engagementId: string) => Promise<void>;
  fetchCuj: (id: string) => Promise<void>;
  createCuj: (data: CreateCujData) => Promise<Cuj>;
  updateCuj: (id: string, data: UpdateCujData) => Promise<void>;
  deleteCuj: (id: string) => Promise<void>;
  clearCurrentCuj: () => void;
}

export const useCujStore = create<CujState>((set) => ({
  cujs: [],
  currentCuj: null,
  isLoading: false,
  error: null,

  fetchCujs: async (engagementId: string) => {
    set({ isLoading: true, error: null });
    try {
      const cujs = await apiGet<Cuj[]>(`/cujs/engagement/${engagementId}`);
      set({ cujs, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar CUJs';
      set({ error: message, isLoading: false });
    }
  },

  fetchCuj: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const cuj = await apiGet<Cuj>(`/cujs/${id}`);
      set({ currentCuj: cuj, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar CUJ';
      set({ error: message, isLoading: false });
    }
  },

  createCuj: async (data: CreateCujData) => {
    set({ isLoading: true, error: null });
    try {
      const cuj = await apiPost<Cuj>('/cujs', data);
      set((state) => ({ cujs: [...state.cujs, cuj], isLoading: false }));
      return cuj;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear CUJ';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateCuj: async (id: string, data: UpdateCujData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<Cuj>(`/cujs/${id}`, data);
      set((state) => ({
        cujs: state.cujs.map((c) => (c.id === id ? updated : c)),
        currentCuj: state.currentCuj?.id === id ? updated : state.currentCuj,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar CUJ';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteCuj: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiDel(`/cujs/${id}`);
      set((state) => ({
        cujs: state.cujs.filter((c) => c.id !== id),
        currentCuj: state.currentCuj?.id === id ? null : state.currentCuj,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar CUJ';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearCurrentCuj: () => {
    set({ currentCuj: null, error: null });
  },
}));
