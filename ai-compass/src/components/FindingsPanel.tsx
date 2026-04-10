// ══════════════════════════════════════════════
// FindingsPanel — Panel de hallazgos emergentes de sesión
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { EmergentFinding } from '@/types';

interface FindingsPanelProps {
  findings: EmergentFinding[];
}

const FINDING_ICONS: Record<EmergentFinding['type'], string> = {
  alignment: 'Alineación',
  misalignment: 'Desalineación',
  champion: 'Champion',
  resistance: 'Resistencia',
  'uncovered-topic': 'Tema sin cubrir',
};

const FINDING_COLORS: Record<EmergentFinding['type'], string> = {
  alignment: 'text-green-400 bg-green-900/30 border-green-800',
  misalignment: 'text-red-400 bg-red-900/30 border-red-800',
  champion: 'text-blue-400 bg-blue-900/30 border-blue-800',
  resistance: 'text-orange-400 bg-orange-900/30 border-orange-800',
  'uncovered-topic': 'text-purple-400 bg-purple-900/30 border-purple-800',
};

const DIMENSION_LABELS: Record<string, string> = {
  estrategia: 'Estrategia',
  procesos: 'Procesos',
  datos: 'Datos',
  tecnologia: 'Tecnología',
  cultura: 'Cultura',
  gobernanza: 'Gobernanza',
};

function FindingItem({ finding }: { finding: EmergentFinding }) {
  const [citationsOpen, setCitationsOpen] = useState(false);
  const colorClass = FINDING_COLORS[finding.type];

  return (
    <div className={`border rounded-lg p-4 space-y-2 ${colorClass}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wide">
          {FINDING_ICONS[finding.type]}
        </span>
        {finding.relatedDimensions.map((dim) => (
          <span
            key={dim}
            className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
          >
            {DIMENSION_LABELS[dim] ?? dim}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-200 leading-relaxed">{finding.description}</p>

      {finding.citations.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setCitationsOpen((o) => !o)}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            {citationsOpen
              ? 'Ocultar citas'
              : `Ver ${finding.citations.length} cita(s)`}
          </button>
          {citationsOpen && (
            <ul className="mt-2 space-y-1">
              {finding.citations.map((c, i) => (
                <li key={i} className="text-xs text-gray-400 border-l-2 border-gray-600 pl-2">
                  <span className="italic">"{c.text}"</span>
                  <span className="ml-1 text-gray-500">
                    — {c.speakerName} ({c.speakerRole})
                    {c.timestamp && ` @ ${c.timestamp}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function FindingsPanel({ findings }: FindingsPanelProps) {
  if (findings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm italic">
        No hay hallazgos emergentes registrados para esta sesión.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">
        Hallazgos emergentes ({findings.length})
      </h2>
      {findings.map((f) => (
        <FindingItem key={f.id} finding={f} />
      ))}
    </div>
  );
}
