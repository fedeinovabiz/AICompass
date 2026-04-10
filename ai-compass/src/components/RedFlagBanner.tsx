// ══════════════════════════════════════════════
// RED FLAG BANNER — Banner de alertas activas
// ══════════════════════════════════════════════

import { useRedFlags } from '@/hooks/useRedFlags';
import { apiPut } from '@/services/apiClient';
import RedFlagAlert from './RedFlagAlert';
import type { RedFlagSeverity } from '@/types';

interface BannerProps {
  orgId: string;
}

const ORDEN_SEVERIDAD: RedFlagSeverity[] = ['block', 'alert', 'warning'];

export default function RedFlagBanner({ orgId }: BannerProps) {
  const { redFlags, isLoading, refetch } = useRedFlags(orgId);

  if (isLoading || redFlags.length === 0) return null;

  const flagsOrdenados = [...redFlags].sort((a, b) => {
    return ORDEN_SEVERIDAD.indexOf(a.severity) - ORDEN_SEVERIDAD.indexOf(b.severity);
  });

  async function handleResolve(ruleId: string, resolution: string) {
    try {
      await apiPut(`/red-flags/organization/${orgId}/flags/${ruleId}/resolve`, { resolution });
      refetch();
    } catch {
      // Error silencioso: el usuario ya realizó la acción
    }
  }

  async function handleOverride(ruleId: string, justification: string) {
    try {
      await apiPut(`/red-flags/organization/${orgId}/flags/${ruleId}/override`, { justification });
      refetch();
    } catch {
      // Error silencioso
    }
  }

  return (
    <div className="px-6 pt-4 space-y-2">
      {flagsOrdenados.map((flag) => (
        <RedFlagAlert
          key={flag.ruleId}
          redFlag={flag}
          onResolve={handleResolve}
          onOverride={handleOverride}
        />
      ))}
    </div>
  );
}
