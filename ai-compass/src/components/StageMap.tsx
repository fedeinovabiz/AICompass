// ══════════════════════════════════════════════
// StageMap — Mapa de etapas horizontal del engagement
// ══════════════════════════════════════════════

import { STAGES } from '@/constants/stages';
import type { Stage } from '@/types';

interface StageMapProps {
  currentStage: Stage;
  onStageClick?: (stage: Stage) => void;
}

export default function StageMap({ currentStage, onStageClick }: StageMapProps) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pt-3 pb-2">
      {STAGES.map((stageDef, idx) => {
        const isCurrent = stageDef.stage === currentStage;
        const isPast = stageDef.stage < currentStage;
        const isFuture = stageDef.stage > currentStage;
        const isClickable = Boolean(onStageClick);

        let bgClass = '';
        let textClass = '';
        let borderClass = '';

        if (isCurrent) {
          bgClass = 'bg-blue-600';
          textClass = 'text-white';
          borderClass = 'border-blue-500';
        } else if (isPast) {
          bgClass = 'bg-gray-700';
          textClass = 'text-gray-200';
          borderClass = 'border-gray-600';
        } else {
          bgClass = 'bg-gray-900';
          textClass = 'text-gray-500';
          borderClass = 'border-gray-700';
        }

        return (
          <div key={stageDef.stage} className="flex items-center">
            <button
              type="button"
              onClick={() => isClickable && onStageClick?.(stageDef.stage)}
              disabled={!isClickable}
              className={`relative flex flex-col items-center border-2 rounded-lg px-4 py-3 min-w-[140px] transition-all ${bgClass} ${textClass} ${borderClass} ${
                isClickable && !isCurrent
                  ? 'hover:brightness-110 cursor-pointer'
                  : isCurrent
                  ? 'cursor-default ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-950'
                  : 'cursor-default'
              } ${isFuture ? 'opacity-50' : ''}`}
            >
              {isPast && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
              )}
              <span className="text-xs font-bold opacity-70">Etapa {stageDef.stage}</span>
              <span className="text-sm font-semibold text-center leading-tight mt-0.5">
                {stageDef.name}
              </span>
              <span className="text-xs opacity-60 mt-1">{stageDef.duration}</span>
            </button>

            {idx < STAGES.length - 1 && (
              <div
                className={`w-6 h-0.5 shrink-0 ${
                  stageDef.stage < currentStage ? 'bg-green-500' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
