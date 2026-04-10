// ══════════════════════════════════════════════
// ORGANIZATION STORE — Gestión de organizaciones
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiGet, apiPost } from '@/services/apiClient';
import type { Organization } from '@/types';

interface CreateOrganizationData {
  name: string;
  industry: string;
  size: string;
  contactName: string;
  contactEmail: string;
}

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;
  fetchOrganizations: () => Promise<void>;
  fetchOrganization: (id: string) => Promise<void>;
  createOrganization: (data: CreateOrganizationData) => Promise<Organization>;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizations: [],
  currentOrganization: null,
  isLoading: false,
  error: null,

  fetchOrganizations: async () => {
    set({ isLoading: true, error: null });
    try {
      const organizations = await apiGet<Organization[]>('/organizations');
      set({ organizations, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar organizaciones';
      set({ error: message, isLoading: false });
    }
  },

  fetchOrganization: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const organization = await apiGet<Organization>(`/organizations/${id}`);
      set({ currentOrganization: organization, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar organización';
      set({ error: message, isLoading: false });
    }
  },

  createOrganization: async (data: CreateOrganizationData) => {
    set({ isLoading: true, error: null });
    try {
      const organization = await apiPost<Organization>('/organizations', data);
      set((state) => ({
        organizations: [...state.organizations, organization],
        isLoading: false,
      }));
      return organization;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear organización';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
