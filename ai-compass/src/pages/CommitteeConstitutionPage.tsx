// ══════════════════════════════════════════════
// COMMITTEE CONSTITUTION PAGE — Constitución del comité
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommitteeStore } from '@/stores/committeeStore';
import DecisionCard from '@/components/DecisionCard';
import { FOUNDATIONAL_DECISIONS } from '@/constants/foundationalDecisions';
import type { CommitteeMember, FoundationalDecision } from '@/types';

// ──────────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────────

const CADENCE_OPTIONS = ['Quincenal', 'Mensual', 'Otra'] as const;
type CadenceOption = typeof CADENCE_OPTIONS[number];

const ROLE_LABELS: Record<string, string> = {
  'sponsor': 'Sponsor Ejecutivo',
  'operational-leader': 'Líder Operativo',
  'business-rep': 'Rep. de Negocio',
  'it-rep': 'Rep. de TI',
  'change-management': 'Gestión del Cambio',
};

// ──────────────────────────────────────────────
// Subcomponentes
// ──────────────────────────────────────────────

function MemberChip({ member }: { member: CommitteeMember }) {
  return (
    <div className="flex items-center gap-3 bg-slate-700 rounded-lg px-4 py-2.5">
      <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {member.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-white text-sm font-medium truncate">{member.name}</p>
        <p className="text-slate-400 text-xs truncate">
          {ROLE_LABELS[member.role] ?? member.role}
          {member.area ? ` · ${member.area}` : ''}
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────

export default function CommitteeConstitutionPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  const { committee, isLoading, error, fetchCommittee, updateDecision, constituteCommittee } =
    useCommitteeStore();

  const [cadence, setCadence] = useState<CadenceOption>('Quincenal');
  const [constituting, setConstituting] = useState(false);

  useEffect(() => {
    if (orgId) void fetchCommittee(orgId);
  }, [orgId, fetchCommittee]);

  useEffect(() => {
    if (committee?.meetingCadence) {
      const match = CADENCE_OPTIONS.find((o) => o === committee.meetingCadence);
      setCadence(match ?? 'Otra');
    }
  }, [committee]);

  // Construir mapa de decisiones existentes (number → FoundationalDecision)
  function getDecisionForNumber(num: number): FoundationalDecision {
    const found = committee?.decisions.find((d) => d.number === num);
    if (found) return found;
    return {
      id: `temp-${num}`,
      number: num,
      title: FOUNDATIONAL_DECISIONS[num - 1]?.title ?? '',
      description: FOUNDATIONAL_DECISIONS[num - 1]?.description ?? '',
      response: '',
    };
  }

  // Contar decisiones documentadas
  const documentedCount = FOUNDATIONAL_DECISIONS.filter((t) => {
    const decision = committee?.decisions.find((d) => d.number === t.number);
    return decision && decision.response.trim().length > 0;
  }).length;

  const canConstitute = documentedCount >= 6;

  // Verificar si falta el líder operativo
  const hasOperationalLeader = committee?.members.some(
    (m) => m.role === 'operational-leader' && m.name.trim().length > 0,
  ) ?? false;

  async function handleUpdateDecision(number: number, response: string) {
    await updateDecision(number, response);
  }

  async function handleConstitute() {
    if (!orgId || !canConstitute) return;
    setConstituting(true);
    try {
      await constituteCommittee(orgId);
      void navigate(`/org/${orgId}`);
    } finally {
      setConstituting(false);
    }
  }

  if (!orgId) {
    return (
      <div className="p-8">
        <p className="text-red-400">Organización no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <h2 className="text-white text-2xl font-bold mb-1">Constitución del Comité</h2>
        <p className="text-slate-400 text-sm">
          Documenta las 8 decisiones fundacionales que el comité debe acordar antes de operar.
        </p>
      </div>

      {/* Estado de carga */}
      {isLoading && !committee && (
        <p className="text-slate-400 text-sm">Cargando comité...</p>
      )}

      {error && (
        <div className="bg-red-950 border border-red-700 rounded-lg px-4 py-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Red flag: falta líder operativo */}
      {!isLoading && committee && !hasOperationalLeader && (
        <div className="bg-red-950 border border-red-600 rounded-xl px-5 py-4 flex items-start gap-3">
          <span className="text-red-400 font-bold text-lg leading-none mt-0.5">!</span>
          <div>
            <p className="text-red-300 font-semibold text-sm">Líder Operativo no asignado</p>
            <p className="text-red-400 text-sm mt-0.5">
              El comité no puede operar eficazmente sin un Líder Operativo designado.
              Vuelve al diseño del comité para asignarlo.
            </p>
          </div>
        </div>
      )}

      {/* Lista de miembros (solo lectura) */}
      {committee && committee.members.length > 0 && (
        <section>
          <h3 className="text-white font-semibold mb-3">Miembros del comité</h3>
          <div className="flex flex-wrap gap-3">
            {committee.members.map((member) => (
              <MemberChip key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {/* Progreso de decisiones */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Decisiones fundacionales</h3>
        <span className="text-sm font-medium text-slate-300">
          <span className={documentedCount >= 6 ? 'text-emerald-400' : 'text-slate-300'}>
            {documentedCount}
          </span>
          {' '}de 8 documentadas
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-slate-700 rounded-full h-2 -mt-6">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(documentedCount / 8) * 100}%` }}
        />
      </div>

      {/* Cadencia de reuniones */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <label className="block text-white font-semibold mb-1">
          Cadencia de reuniones
        </label>
        <p className="text-slate-400 text-sm mb-3">
          ¿Con qué frecuencia se reunirá el comité?
        </p>
        <select
          value={cadence}
          onChange={(e) => setCadence(e.target.value as CadenceOption)}
          className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          {CADENCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* 8 DecisionCards */}
      <div className="space-y-4">
        {FOUNDATIONAL_DECISIONS.map((template) => {
          const decision = getDecisionForNumber(template.number);
          return (
            <DecisionCard
              key={template.number}
              decision={decision}
              template={template}
              onUpdate={(response) => void handleUpdateDecision(template.number, response)}
              readOnly={isLoading}
            />
          );
        })}
      </div>

      {/* Información de habilitación */}
      {!canConstitute && (
        <p className="text-slate-500 text-sm text-center">
          Se necesitan al menos 6 decisiones documentadas para constituir el comité.
          Faltan {6 - documentedCount} más.
        </p>
      )}

      {/* Botón constituir */}
      <div className="flex justify-end pt-2 pb-8">
        <button
          type="button"
          onClick={() => void handleConstitute()}
          disabled={!canConstitute || constituting}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors"
        >
          {constituting ? 'Constituyendo...' : 'Constituir Comité'}
        </button>
      </div>
    </div>
  );
}
