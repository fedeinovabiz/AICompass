// ══════════════════════════════════════════════
// ConfidenceBadge — Badge de nivel de confianza IA
// ══════════════════════════════════════════════

import type { ConfidenceLevel } from '@/types';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
}

const COLOR_MAP: Record<ConfidenceLevel, string> = {
  alto: 'bg-green-500',
  medio: 'bg-yellow-500',
  bajo: 'bg-red-500',
};

const LABEL_MAP: Record<ConfidenceLevel, string> = {
  alto: 'Alto',
  medio: 'Medio',
  bajo: 'Bajo',
};

export default function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${COLOR_MAP[level]}`}
    >
      {LABEL_MAP[level]}
    </span>
  );
}
