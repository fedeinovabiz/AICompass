// ══════════════════════════════════════════════
// USE RED FLAGS — Hook para alertas organizacionales
// ══════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '@/services/apiClient';
import type { RedFlag } from '@/types';

interface ActiveRedFlag {
  ruleId: string;
  severity: RedFlag['severity'];
  title: string;
  description: string;
  stage: number;
}

interface UseRedFlagsResult {
  redFlags: ActiveRedFlag[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRedFlags(orgId: string | undefined): UseRedFlagsResult {
  const [redFlags, setRedFlags] = useState<ActiveRedFlag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!orgId) return;

    let activo = true;
    setIsLoading(true);
    setError(null);

    apiGet<ActiveRedFlag[]>(`/api/red-flags/organization/${orgId}`)
      .then((data) => {
        if (activo) {
          setRedFlags(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (activo) {
          const mensaje = err instanceof Error ? err.message : 'Error al cargar red flags';
          setError(mensaje);
          setIsLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [orgId, tick]);

  return { redFlags, isLoading, error, refetch };
}
