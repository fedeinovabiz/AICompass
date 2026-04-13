// ══════════════════════════════════════════════
// AREA STORE — Gestión de áreas departamentales
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDel } from '@/services/apiClient';
import type { DepartmentArea, MiniAssessmentAnswer } from '@/types';

interface AiLevelResponse {
  global: {
    aiOperatingLevel: number;
    aiOperatingLevelLabel: { en: string; es: string };
  };
  areas: Array<{
    areaId: string;
    displayName: string;
    assessmentStatus: string;
    aiOperatingLevel: number | null;
    aiOperatingLevelLabel: { en: string; es: string } | null;
  }>;
}

interface AreaState {
  areas: DepartmentArea[];
  currentArea: (DepartmentArea & { pilots?: unknown[] }) | null;
  aiLevels: AiLevelResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchAreas: (orgId: string) => Promise<void>;
  fetchArea: (id: string) => Promise<void>;
  createArea: (orgId: string, standardArea: string, customName?: string) => Promise<DepartmentArea>;
  updateArea: (id: string, data: { displayName?: string; standardArea?: string; customName?: string }) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;
  submitMiniAssessment: (id: string, answers: MiniAssessmentAnswer[]) => Promise<void>;
  overrideScores: (id: string, scores: Record<string, number | null>) => Promise<void>;
  resetToInherited: (id: string) => Promise<void>;
  fetchAiLevels: (orgId: string) => Promise<void>;
}

export const useAreaStore = create<AreaState>((set) => ({
  areas: [],
  currentArea: null,
  aiLevels: null,
  isLoading: false,
  error: null,

  fetchAreas: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const areas = await apiGet<DepartmentArea[]>(`/areas/organization/${orgId}`);
      set({ areas, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar áreas', isLoading: false });
    }
  },

  fetchArea: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const area = await apiGet<DepartmentArea & { pilots?: unknown[] }>(`/areas/${id}`);
      set({ currentArea: area, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar área', isLoading: false });
    }
  },

  createArea: async (orgId: string, standardArea: string, customName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const area = await apiPost<DepartmentArea>('/areas', { organizationId: orgId, standardArea, customName });
      set((state) => ({ areas: [...state.areas, area], isLoading: false }));
      return area;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al crear área', isLoading: false });
      throw err;
    }
  },

  updateArea: async (id: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<DepartmentArea>(`/areas/${id}`, data);
      set((state) => ({
        areas: state.areas.map(a => a.id === id ? updated : a),
        currentArea: state.currentArea?.id === id ? { ...updated, pilots: state.currentArea?.pilots } : state.currentArea,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar área', isLoading: false });
      throw err;
    }
  },

  deleteArea: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiDel(`/areas/${id}`);
      set((state) => ({
        areas: state.areas.filter(a => a.id !== id),
        currentArea: state.currentArea?.id === id ? null : state.currentArea,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al eliminar área', isLoading: false });
      throw err;
    }
  },

  submitMiniAssessment: async (id: string, answers: MiniAssessmentAnswer[]) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPost<DepartmentArea>(`/areas/${id}/mini-assessment`, { answers });
      set((state) => ({
        areas: state.areas.map(a => a.id === id ? updated : a),
        currentArea: state.currentArea?.id === id ? { ...updated, pilots: state.currentArea?.pilots } : state.currentArea,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al guardar mini-assessment', isLoading: false });
      throw err;
    }
  },

  overrideScores: async (id: string, scores: Record<string, number | null>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<DepartmentArea>(`/areas/${id}/scores`, { maturityScores: scores });
      set((state) => ({
        areas: state.areas.map(a => a.id === id ? updated : a),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar scores', isLoading: false });
      throw err;
    }
  },

  resetToInherited: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPost<DepartmentArea>(`/areas/${id}/reset-to-inherited`, {});
      set((state) => ({
        areas: state.areas.map(a => a.id === id ? updated : a),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al resetear scores', isLoading: false });
      throw err;
    }
  },

  fetchAiLevels: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const levels = await apiGet<AiLevelResponse>(`/areas/ai-level/organization/${orgId}`);
      set({ aiLevels: levels, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar AI levels', isLoading: false });
      throw err;
    }
  },
}));
