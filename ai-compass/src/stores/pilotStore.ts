// ══════════════════════════════════════════════
// PILOT STORE — Gestión de pilotos de IA (Etapa 3)
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiGet, apiPost, apiPut } from '@/services/apiClient';
import type { Pilot, PilotStatus, PilotMetricEntry } from '@/types';

interface CreatePilotData {
  title: string;
  processBefore: string;
  processAfter: string;
  tool: string;
  teamSize: number;
  championName: string;
  championEmail: string;
}

interface UpdatePilotData {
  title?: string;
  processBefore?: string;
  processAfter?: string;
  tool?: string;
  teamSize?: number;
  championName?: string;
  championEmail?: string;
  workflowDesign?: Pilot['workflowDesign'];
  champions?: Pilot['champions'];
  roleImpacts?: Pilot['roleImpacts'];
}

interface PilotState {
  pilots: Pilot[];
  currentPilot: Pilot | null;
  isLoading: boolean;
  error: string | null;

  fetchPilots: (orgId: string) => Promise<void>;
  fetchPilot: (id: string) => Promise<void>;
  createPilot: (orgId: string, data: CreatePilotData) => Promise<Pilot>;
  updatePilot: (id: string, data: UpdatePilotData) => Promise<void>;
  updateStatus: (id: string, status: PilotStatus) => Promise<void>;
  addMetricEntry: (id: string, entry: Omit<PilotMetricEntry, never>) => Promise<void>;
  setBaseline: (id: string, metrics: Pilot['baseline']) => Promise<void>;
  setCommitteeDecision: (id: string, decision: string, justification: string) => Promise<void>;
  clearCurrentPilot: () => void;
}

export const usePilotStore = create<PilotState>((set) => ({
  pilots: [],
  currentPilot: null,
  isLoading: false,
  error: null,

  fetchPilots: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const pilots = await apiGet<Pilot[]>(`/api/organizations/${orgId}/pilots`);
      set({ pilots, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar pilotos';
      set({ error: message, isLoading: false });
    }
  },

  fetchPilot: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const pilot = await apiGet<Pilot>(`/api/pilots/${id}`);
      set({ currentPilot: pilot, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar piloto';
      set({ error: message, isLoading: false });
    }
  },

  createPilot: async (orgId: string, data: CreatePilotData) => {
    set({ isLoading: true, error: null });
    try {
      const pilot = await apiPost<Pilot>(`/api/organizations/${orgId}/pilots`, data);
      set((state) => ({ pilots: [...state.pilots, pilot], isLoading: false }));
      return pilot;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear piloto';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updatePilot: async (id: string, data: UpdatePilotData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<Pilot>(`/api/pilots/${id}`, data);
      set((state) => ({
        pilots: state.pilots.map((p) => (p.id === id ? updated : p)),
        currentPilot: state.currentPilot?.id === id ? updated : state.currentPilot,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar piloto';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateStatus: async (id: string, status: PilotStatus) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<Pilot>(`/api/pilots/${id}/status`, { status });
      set((state) => ({
        pilots: state.pilots.map((p) => (p.id === id ? updated : p)),
        currentPilot: state.currentPilot?.id === id ? updated : state.currentPilot,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar estado';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  addMetricEntry: async (id: string, entry: PilotMetricEntry) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPost<Pilot>(`/api/pilots/${id}/metrics`, entry);
      set((state) => ({
        pilots: state.pilots.map((p) => (p.id === id ? updated : p)),
        currentPilot: state.currentPilot?.id === id ? updated : state.currentPilot,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar entrada de métrica';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  setBaseline: async (id: string, metrics: Pilot['baseline']) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<Pilot>(`/api/pilots/${id}/baseline`, { baseline: metrics });
      set((state) => ({
        pilots: state.pilots.map((p) => (p.id === id ? updated : p)),
        currentPilot: state.currentPilot?.id === id ? updated : state.currentPilot,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar baseline';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  setCommitteeDecision: async (id: string, decision: string, justification: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<Pilot>(`/api/pilots/${id}/committee-decision`, {
        decision,
        justification,
      });
      set((state) => ({
        pilots: state.pilots.map((p) => (p.id === id ? updated : p)),
        currentPilot: state.currentPilot?.id === id ? updated : state.currentPilot,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar decisión del comité';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearCurrentPilot: () => {
    set({ currentPilot: null, error: null });
  },
}));
