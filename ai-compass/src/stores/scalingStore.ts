// ══════════════════════════════════════════════
// SCALING STORE — Gestión de planes de escalamiento (Etapa 4)
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiGet, apiPost, apiPut } from '@/services/apiClient';
import type { ScalingPlan, ScalingStatus, TargetArea } from '@/types';

interface CreatePlanData {
  pilotId: string;
  organizationId: string;
  targetAreas?: TargetArea[];
  totalTargetUsers?: number;
}

interface UpdatePlanData {
  targetAreas?: TargetArea[];
  scalingStatus?: ScalingStatus;
  totalTargetUsers?: number;
  scalingStartDate?: string | null;
}

interface AddMetricData {
  areaName: string;
  date: string;
  adoptionPercentage?: number;
  usersActive?: number;
  impactMetrics?: Record<string, unknown>;
  notes?: string;
}

interface ScalingState {
  plans: ScalingPlan[];
  currentPlan: ScalingPlan | null;
  isLoading: boolean;
  error: string | null;

  fetchPlans: (orgId: string) => Promise<void>;
  fetchPlan: (id: string) => Promise<void>;
  createPlan: (data: CreatePlanData) => Promise<ScalingPlan>;
  updatePlan: (id: string, data: UpdatePlanData) => Promise<void>;
  addMetric: (planId: string, metric: AddMetricData) => Promise<void>;
  clearCurrentPlan: () => void;
}

export const useScalingStore = create<ScalingState>((set) => ({
  plans: [],
  currentPlan: null,
  isLoading: false,
  error: null,

  fetchPlans: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const plans = await apiGet<ScalingPlan[]>(`/scaling/organization/${orgId}`);
      set({ plans, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar planes de escalamiento';
      set({ error: message, isLoading: false });
    }
  },

  fetchPlan: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const plan = await apiGet<ScalingPlan>(`/scaling/${id}`);
      set({ currentPlan: plan, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar plan de escalamiento';
      set({ error: message, isLoading: false });
    }
  },

  createPlan: async (data: CreatePlanData) => {
    set({ isLoading: true, error: null });
    try {
      const plan = await apiPost<ScalingPlan>('/scaling', data);
      set((state) => ({ plans: [...state.plans, plan], isLoading: false }));
      return plan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear plan de escalamiento';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updatePlan: async (id: string, data: UpdatePlanData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<ScalingPlan>(`/scaling/${id}`, data);
      set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? updated : p)),
        currentPlan: state.currentPlan?.id === id ? updated : state.currentPlan,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar plan de escalamiento';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  addMetric: async (planId: string, metric: AddMetricData) => {
    set({ isLoading: true, error: null });
    try {
      await apiPost<unknown>(`/scaling/${planId}/metrics`, metric);
      // Recargar el plan con las métricas actualizadas
      const updated = await apiGet<ScalingPlan>(`/scaling/${planId}`);
      set((state) => ({
        currentPlan: state.currentPlan?.id === planId ? updated : state.currentPlan,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar métrica';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearCurrentPlan: () => {
    set({ currentPlan: null, error: null });
  },
}));
