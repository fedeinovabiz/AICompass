// ══════════════════════════════════════════════
// AREA ASSESSMENT STATUS ICON
// ══════════════════════════════════════════════

import type { AreaAssessmentStatus } from '@/types';

const STATUS_CONFIG: Record<AreaAssessmentStatus, { label: string; dotColor: string; bgColor: string }> = {
  inherited: { label: 'Heredado', dotColor: 'bg-slate-400', bgColor: 'bg-slate-800 text-slate-400' },
  'mini-assessed': { label: 'Mini-assessment', dotColor: 'bg-yellow-400', bgColor: 'bg-yellow-900/30 text-yellow-400' },
  'full-assessed': { label: 'Evaluado', dotColor: 'bg-green-400', bgColor: 'bg-green-900/30 text-green-400' },
};

interface Props {
  status: AreaAssessmentStatus;
  showLabel?: boolean;
}

export default function AreaAssessmentStatusIcon({ status, showLabel = true }: Props) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {showLabel && config.label}
    </span>
  );
}
