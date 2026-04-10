// ══════════════════════════════════════════════
// COMMITTEE STORE — Gestión del comité de IA
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDel } from '@/services/apiClient';
import type { Committee, CommitteeMember } from '@/types';

interface CommitteeState {
  committee: Committee | null;
  isLoading: boolean;
  error: string | null;

  fetchCommittee: (orgId: string) => Promise<void>;
  createCommittee: (orgId: string, meetingCadence: string) => Promise<void>;
  addMember: (member: Omit<CommitteeMember, 'id'>) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  updateDecision: (number: number, response: string) => Promise<void>;
  constituteCommittee: (orgId: string) => Promise<void>;
  clearError: () => void;
}

export const useCommitteeStore = create<CommitteeState>((set, get) => ({
  committee: null,
  isLoading: false,
  error: null,

  fetchCommittee: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const committee = await apiGet<Committee>(`/committees/organization/${orgId}`);
      set({ committee, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el comité';
      set({ error: message, isLoading: false });
    }
  },

  createCommittee: async (orgId: string, meetingCadence: string) => {
    set({ isLoading: true, error: null });
    try {
      const committee = await apiPost<Committee>(
        `/committees/organization/${orgId}`,
        { meetingCadence },
      );
      set({ committee, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el comité';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  addMember: async (member: Omit<CommitteeMember, 'id'>) => {
    const { committee } = get();
    if (!committee) throw new Error('No hay comité activo');

    set({ isLoading: true, error: null });
    try {
      const updated = await apiPost<Committee>(
        `/committees/${committee.id}/members`,
        member,
      );
      set({ committee: updated, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar miembro';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  removeMember: async (id: string) => {
    const { committee } = get();
    if (!committee) throw new Error('No hay comité activo');

    set({ isLoading: true, error: null });
    try {
      const updated = await apiDel<Committee>(
        `/committees/${committee.id}/members/${id}`,
      );
      set({ committee: updated, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar miembro';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateDecision: async (number: number, response: string) => {
    const { committee } = get();
    if (!committee) throw new Error('No hay comité activo');

    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<Committee>(
        `/committees/${committee.id}/decisions/${number}`,
        { response },
      );
      set({ committee: updated, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar decisión';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  constituteCommittee: async (_orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPost<Committee>(
        `/committees/${get().committee?.id}/constitute`,
        {},
      );
      set({ committee: updated, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al constituir el comité';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
