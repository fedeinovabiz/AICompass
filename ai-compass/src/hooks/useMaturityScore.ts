// ══════════════════════════════════════════════
// USE MATURITY SCORE — Cálculos de madurez
// ══════════════════════════════════════════════

import { useMemo } from 'react';
import type { DimensionKey } from '@/types';

type ScoreMap = Partial<Record<DimensionKey, number | null>>;

export interface MaturityScoreResult {
  promedio: number | null;
  scoresPorDimension: Record<DimensionKey, number | null>;
  dimensionesEnRojo: DimensionKey[];
  dimensionesFuertes: DimensionKey[];
}

const TODAS_LAS_DIMENSIONES: DimensionKey[] = [
  'estrategia',
  'procesos',
  'datos',
  'tecnologia',
  'cultura',
  'gobernanza',
];

export function useMaturityScore(maturityScores: ScoreMap): MaturityScoreResult {
  return useMemo(() => {
    const scoresPorDimension = TODAS_LAS_DIMENSIONES.reduce<Record<DimensionKey, number | null>>(
      (acc, key) => {
        acc[key] = maturityScores[key] ?? null;
        return acc;
      },
      {} as Record<DimensionKey, number | null>,
    );

    const valoresNumericos = Object.values(scoresPorDimension).filter(
      (v): v is number => v !== null,
    );

    const promedio =
      valoresNumericos.length > 0
        ? valoresNumericos.reduce((a, b) => a + b, 0) / valoresNumericos.length
        : null;

    const dimensionesEnRojo = TODAS_LAS_DIMENSIONES.filter(
      (key) => scoresPorDimension[key] === 1,
    );

    const dimensionesFuertes = TODAS_LAS_DIMENSIONES.filter((key) => {
      const score = scoresPorDimension[key];
      return score !== null && score >= 3;
    });

    return { promedio, scoresPorDimension, dimensionesEnRojo, dimensionesFuertes };
  }, [maturityScores]);
}
