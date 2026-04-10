// ══════════════════════════════════════════════
// useStageProgress — Criterios cumplidos/pendientes por etapa
// ══════════════════════════════════════════════

import { useMemo } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { useOrganizationStore } from '@/stores/organizationStore';
import { STAGES } from '@/constants/stages';
import type { Stage } from '@/types';

export interface StageProgressResult {
  criteria: Record<string, boolean>;
  fulfilled: number;
  total: number;
  percentage: number;
}

export function useStageProgress(orgId: string, stage: Stage): StageProgressResult {
  const sessions = useSessionStore((s) => s.sessions);
  const currentOrganization = useOrganizationStore((s) => s.currentOrganization);

  const result = useMemo<StageProgressResult>(() => {
    const stageDef = STAGES.find((sd) => sd.stage === stage);
    if (!stageDef) {
      return { criteria: {}, fulfilled: 0, total: 0, percentage: 0 };
    }

    // Criterios guardados en la organización
    const orgCriteria: Record<string, boolean> =
      currentOrganization?.id === orgId && currentOrganization.stageCriteria
        ? currentOrganization.stageCriteria
        : {};

    // Lógica derivada desde sesiones para etapa 1
    const validatedSessionCount = sessions.filter(
      (s) => s.status === 'validated',
    ).length;

    const criteria: Record<string, boolean> = {};

    for (const criterion of stageDef.advanceCriteria) {
      // Si la org ya tiene el criterio guardado, usarlo como fuente de verdad
      if (criterion.id in orgCriteria) {
        criteria[criterion.id] = orgCriteria[criterion.id];
        continue;
      }

      // Derivar automáticamente cuando es posible
      if (criterion.id === 'S1-01') {
        criteria[criterion.id] = validatedSessionCount >= 3;
      } else {
        criteria[criterion.id] = false;
      }
    }

    const total = stageDef.advanceCriteria.length;
    const fulfilled = Object.values(criteria).filter(Boolean).length;
    const percentage = total > 0 ? Math.round((fulfilled / total) * 100) : 0;

    return { criteria, fulfilled, total, percentage };
  }, [sessions, currentOrganization, orgId, stage]);

  return result;
}
