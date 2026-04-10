// ══════════════════════════════════════════════
// SESSION STORE — Gestión de sesiones de diagnóstico
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDel } from '@/services/apiClient';
import type { Session, Participant, ValidationStatus } from '@/types';

interface CreateSessionData {
  engagementId: string;
  type: Session['type'];
  modality: Session['modality'];
  title: string;
  scheduledDate?: string;
}

interface UpdateSessionData {
  title?: string;
  notes?: string;
  status?: Session['status'];
  modality?: Session['modality'];
  scheduledDate?: string;
}

interface UpdateQuestionAnswerData {
  validationStatus?: ValidationStatus;
  editedAnswer?: string;
  manualAnswer?: string;
  finalAnswer?: string;
}

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  isProcessingAI: boolean;
  error: string | null;

  fetchSessions: (engagementId: string) => Promise<void>;
  fetchSession: (id: string) => Promise<void>;
  createSession: (data: CreateSessionData) => Promise<Session>;
  updateSession: (id: string, data: UpdateSessionData) => Promise<void>;
  updateQuestionAnswer: (sessionId: string, questionId: string, data: UpdateQuestionAnswerData) => Promise<void>;
  addParticipant: (sessionId: string, p: Omit<Participant, 'id'>) => Promise<void>;
  removeParticipant: (sessionId: string, pid: string) => Promise<void>;
  processWithAI: (sessionId: string) => Promise<void>;
  uploadTranscript: (sessionId: string, file: File) => Promise<void>;
  uploadTranscriptText: (sessionId: string, text: string) => Promise<void>;
  clearCurrentSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  isProcessingAI: false,
  error: null,

  fetchSessions: async (engagementId: string) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await apiGet<Session[]>(`/sessions/engagement/${engagementId}`);
      set({ sessions, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar sesiones';
      set({ error: message, isLoading: false });
    }
  },

  fetchSession: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await apiGet<Session>(`/sessions/${id}`);
      set({ currentSession: session, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar sesión';
      set({ error: message, isLoading: false });
    }
  },

  createSession: async (data: CreateSessionData) => {
    set({ isLoading: true, error: null });
    try {
      const session = await apiPost<Session>('/sessions', data);
      set((state) => ({
        sessions: [...state.sessions, session],
        isLoading: false,
      }));
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear sesión';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateSession: async (id: string, data: UpdateSessionData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<Session>(`/sessions/${id}`, data);
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? updated : s)),
        currentSession: state.currentSession?.id === id ? updated : state.currentSession,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar sesión';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateQuestionAnswer: async (sessionId: string, questionId: string, data: UpdateQuestionAnswerData) => {
    try {
      await apiPut(
        `/sessions/${sessionId}/questions/${questionId}`,
        data,
      );
      await get().fetchSession(sessionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar respuesta';
      set({ error: message });
      throw err;
    }
  },

  addParticipant: async (sessionId: string, p: Omit<Participant, 'id'>) => {
    try {
      await apiPost(`/sessions/${sessionId}/participants`, p);
      await get().fetchSession(sessionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar participante';
      set({ error: message });
      throw err;
    }
  },

  removeParticipant: async (sessionId: string, pid: string) => {
    // Optimistic update
    const prevSession = get().currentSession;
    if (prevSession?.id === sessionId) {
      set((state) => ({
        currentSession: state.currentSession
          ? {
              ...state.currentSession,
              participants: state.currentSession.participants.filter((p) => p.id !== pid),
            }
          : null,
      }));
    }
    try {
      await apiDel(`/sessions/${sessionId}/participants/${pid}`);
    } catch (err) {
      // Revertir optimistic update
      if (prevSession) set({ currentSession: prevSession });
      const message = err instanceof Error ? err.message : 'Error al eliminar participante';
      set({ error: message });
      throw err;
    }
  },

  processWithAI: async (sessionId: string) => {
    set({ isProcessingAI: true, error: null });
    try {
      await apiPost(`/ai/process-session/${sessionId}`, {});
      await get().fetchSession(sessionId);
      set({ isProcessingAI: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar con IA';
      set({ error: message, isProcessingAI: false });
      throw err;
    }
  },

  uploadTranscript: async (sessionId: string, file: File) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const BASE_URL = import.meta.env.VITE_API_URL ?? '';
      const response = await fetch(`${BASE_URL}/transcripts/${sessionId}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error((errorBody as { message?: string }).message ?? `Error ${response.status}`);
      }

      // El backend retorna metadata, no la sesion completa; refrescar
      await get().fetchSession(sessionId);
      set({ isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir transcripcion';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  uploadTranscriptText: async (sessionId: string, text: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiPost(`/transcripts/${sessionId}/text`, { text });
      // El backend retorna metadata, no la sesion completa; refrescar
      await get().fetchSession(sessionId);
      set({ isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar texto de transcripcion';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearCurrentSession: () => {
    set({ currentSession: null, error: null });
  },
}));
