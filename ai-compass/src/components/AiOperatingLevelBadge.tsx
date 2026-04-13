// ══════════════════════════════════════════════
// AI OPERATING LEVEL BADGE
// ══════════════════════════════════════════════

import type { AiOperatingLevel } from '@/types';

const LEVEL_CONFIG: Record<AiOperatingLevel, { en: string; es: string; color: string }> = {
  1: { en: 'AI as Thought Partner', es: 'IA como Asistente de Ideas', color: 'bg-slate-700 text-slate-300' },
  2: { en: 'AI as Assistant', es: 'IA como Asistente Operativo', color: 'bg-blue-900 text-blue-300' },
  3: { en: 'AI as Teammates', es: 'IA como Compañero de Equipo', color: 'bg-purple-900 text-purple-300' },
  4: { en: 'AI as the System', es: 'IA como Sistema Operativo', color: 'bg-amber-900 text-amber-300' },
};

interface Props {
  level: AiOperatingLevel | null;
  size?: 'sm' | 'md';
}

export default function AiOperatingLevelBadge({ level, size = 'sm' }: Props) {
  if (!level) return null;

  const config = LEVEL_CONFIG[level];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${sizeClasses}`}>
      <span className="font-bold">L{level}</span>
      <span className="hidden sm:inline">{config.es}</span>
    </span>
  );
}
