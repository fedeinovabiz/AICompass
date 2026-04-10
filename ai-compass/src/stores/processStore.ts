// ══════════════════════════════════════════════
// PROCESS STORE — Mapeo y rediseño de procesos con IA (Etapa 4)
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDel } from '@/services/apiClient';
import type { ProcessMap, ProcessStep, ValueChainSegment, ImplementationLevel, Pilot } from '@/types';

interface CreateProcessData {
  organizationId: string;
  name: string;
  description?: string;
  valueChainSegment?: ValueChainSegment;
  implementationLevel?: ImplementationLevel;
}

interface UpdateProcessData {
  currentSteps?: ProcessStep[];
  redesignedSteps?: ProcessStep[];
  estimatedHoursSavedWeekly?: number;
  estimatedImpact?: string;
  status?: ProcessMap['status'];
  implementationLevel?: ImplementationLevel;
  valueChainSegment?: ValueChainSegment;
}

interface ProcessState {
  processes: ProcessMap[];
  currentProcess: ProcessMap | null;
  isLoading: boolean;
  error: string | null;

  fetchProcesses: (orgId: string) => Promise<void>;
  fetchProcess: (id: string) => Promise<void>;
  createProcess: (data: CreateProcessData) => Promise<ProcessMap>;
  updateProcess: (id: string, data: UpdateProcessData) => Promise<void>;
  deleteProcess: (id: string) => Promise<void>;
  convertToPilot: (id: string) => Promise<Pilot>;
  clearCurrentProcess: () => void;
}

export const useProcessStore = create<ProcessState>((set) => ({
  processes: [],
  currentProcess: null,
  isLoading: false,
  error: null,

  fetchProcesses: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const processes = await apiGet<ProcessMap[]>(`/processes/organization/${orgId}`);
      set({ processes, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar procesos';
      set({ error: message, isLoading: false });
    }
  },

  fetchProcess: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const process = await apiGet<ProcessMap>(`/processes/${id}`);
      set({ currentProcess: process, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar proceso';
      set({ error: message, isLoading: false });
    }
  },

  createProcess: async (data: CreateProcessData) => {
    set({ isLoading: true, error: null });
    try {
      const process = await apiPost<ProcessMap>('/processes', data);
      set((state) => ({ processes: [...state.processes, process], isLoading: false }));
      return process;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear proceso';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateProcess: async (id: string, data: UpdateProcessData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<ProcessMap>(`/processes/${id}`, data);
      set((state) => ({
        processes: state.processes.map((p) => (p.id === id ? updated : p)),
        currentProcess: state.currentProcess?.id === id ? updated : state.currentProcess,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar proceso';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteProcess: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiDel<void>(`/processes/${id}`);
      set((state) => ({
        processes: state.processes.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar proceso';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  convertToPilot: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const pilot = await apiPost<Pilot>(`/processes/${id}/convert-to-pilot`, {});
      set((state) => ({
        processes: state.processes.map((p) =>
          p.id === id ? { ...p, status: 'implementing' as const } : p,
        ),
        currentProcess:
          state.currentProcess?.id === id
            ? { ...state.currentProcess, status: 'implementing' as const }
            : state.currentProcess,
        isLoading: false,
      }));
      return pilot;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al convertir proceso en piloto';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearCurrentProcess: () => {
    set({ currentProcess: null, error: null });
  },
}));
