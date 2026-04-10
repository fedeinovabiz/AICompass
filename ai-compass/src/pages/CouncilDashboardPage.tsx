// ══════════════════════════════════════════════
// COUNCIL DASHBOARD PAGE — Vista de solo lectura para miembros del AI Council (F-013)
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOrganizationStore } from '@/stores/organizationStore';
import { usePilotStore } from '@/stores/pilotStore';
import { useCommitteeStore } from '@/stores/committeeStore';
import { useRedFlags } from '@/hooks/useRedFlags';
import { apiGet } from '@/services/apiClient';
import SpiderChart from '@/components/SpiderChart';
import type { Pilot, FoundationalDecision, DimensionKey } from '@/types';

interface BenchmarkResponse {
  industry: string;
  sizeCategory: string;
  scores: Partial<Record<DimensionKey, number>>;
  sampleSize: number;
  source: string;
}

// ── Helpers de formato ────────────────────────────────────────────────────────

const STAGE_LABELS: Record<number, string> = {
  1: 'Etapa 1 — Exploración',
  2: 'Etapa 2 — Fundación',
  3: 'Etapa 3 — Pilotos',
  4: 'Etapa 4 — Escala',
  5: 'Etapa 5 — Transformación',
};

const PILOT_STATUS_LABELS: Record<string, string> = {
  designing: 'Diseñando',
  active: 'Activo',
  evaluating: 'Evaluando',
  scale: 'Escalando',
  iterate: 'Iterando',
  kill: 'Cancelado',
};

const PILOT_STATUS_COLORS: Record<string, string> = {
  designing: 'bg-yellow-900 text-yellow-300',
  active: 'bg-green-900 text-green-300',
  evaluating: 'bg-blue-900 text-blue-300',
  scale: 'bg-emerald-900 text-emerald-300',
  iterate: 'bg-orange-900 text-orange-300',
  kill: 'bg-red-900 text-red-300',
};

const SEVERITY_COLORS: Record<string, string> = {
  warning: 'bg-yellow-900 border-yellow-600 text-yellow-200',
  alert: 'bg-orange-900 border-orange-600 text-orange-200',
  block: 'bg-red-900 border-red-600 text-red-200',
};

const SEVERITY_LABELS: Record<string, string> = {
  warning: 'Advertencia',
  alert: 'Alerta',
  block: 'Bloqueo',
};

function calcWeeksActive(pilot: Pilot): number {
  if (!pilot.startDate) return 0;
  const start = new Date(pilot.startDate);
  const now = new Date();
  const diff = Math.max(0, now.getTime() - start.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function PilotCard({ pilot }: { pilot: Pilot }) {
  const semanas = calcWeeksActive(pilot);
  const statusClass = PILOT_STATUS_COLORS[pilot.status] ?? 'bg-slate-700 text-slate-300';
  const statusLabel = PILOT_STATUS_LABELS[pilot.status] ?? pilot.status;

  return (
    <div className="bg-slate-700 rounded-xl p-4 border border-slate-600">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-white font-medium text-sm leading-snug">{pilot.title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusClass}`}>
          {statusLabel}
        </span>
      </div>
      <p className="text-slate-400 text-xs mb-1">
        Herramienta: <span className="text-slate-300">{pilot.tool}</span>
      </p>
      <p className="text-slate-400 text-xs">
        {semanas > 0 ? `${semanas} semana${semanas !== 1 ? 's' : ''} activo` : 'Sin iniciar'}
      </p>
    </div>
  );
}

function DecisionItem({ decision }: { decision: FoundationalDecision }) {
  return (
    <div className="border-l-2 border-slate-600 pl-4 py-1">
      <p className="text-slate-300 text-sm font-medium">
        {decision.number}. {decision.title}
      </p>
      {decision.response ? (
        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{decision.response}</p>
      ) : (
        <p className="text-slate-500 text-xs mt-1 italic">Pendiente de resolución</p>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function CouncilDashboardPage() {
  const { user } = useAuthStore();
  const orgId = user?.organizationId;

  const { currentOrganization, fetchOrganization, isLoading: orgLoading } = useOrganizationStore();
  const { pilots, fetchPilots, isLoading: pilotsLoading } = usePilotStore();
  const { committee, fetchCommittee, isLoading: committeeLoading } = useCommitteeStore();
  const { redFlags, isLoading: redFlagsLoading } = useRedFlags(orgId);
  const [benchmark, setBenchmark] = useState<BenchmarkResponse | null>(null);

  useEffect(() => {
    if (!orgId) return;
    void fetchOrganization(orgId);
    void fetchPilots(orgId);
    void fetchCommittee(orgId);
  }, [orgId, fetchOrganization, fetchPilots, fetchCommittee]);

  useEffect(() => {
    if (!currentOrganization) return;
    const { industry, size } = currentOrganization;
    apiGet<BenchmarkResponse>(`/benchmarks?industry=${encodeURIComponent(industry)}&size=${encodeURIComponent(size)}`)
      .then((data) => setBenchmark(data))
      .catch(() => { /* benchmark opcional */ });
  }, [currentOrganization]);

  const isLoading = orgLoading || pilotsLoading || committeeLoading || redFlagsLoading;

  if (!orgId) {
    return (
      <div className="flex items-center justify-center min-h-64 text-slate-400">
        No hay organización asignada a este usuario.
      </div>
    );
  }

  if (isLoading && !currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-64 text-slate-400">
        Cargando información...
      </div>
    );
  }

  const org = currentOrganization;
  const pilotsActivos = pilots.filter((p) => p.status !== 'kill');
  const decisiones = committee?.decisions ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Encabezado de organización */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {org?.name ?? 'Mi organización'}
        </h1>
        {org && (
          <p className="text-slate-400 text-sm mt-1">
            {STAGE_LABELS[org.currentStage] ?? `Etapa ${org.currentStage}`}
            &nbsp;·&nbsp;{org.industry}&nbsp;·&nbsp;{org.size}
          </p>
        )}
      </div>

      {/* Spider Chart de madurez */}
      {org && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Madurez por dimensión</h2>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <SpiderChart scores={org.maturityScores} benchmark={benchmark?.scores} />
            {benchmark && (
              <p className="text-slate-500 text-xs mt-2 text-center">
                {benchmark.source === 'framework'
                  ? `Benchmark basado en frameworks de referencia — ${org.industry} (${benchmark.sizeCategory} empleados)`
                  : `Comparado con ${benchmark.sampleSize} empresa${benchmark.sampleSize !== 1 ? 's' : ''} de ${benchmark.industry} (${benchmark.sizeCategory} empleados)`}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Pilotos activos */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Pilotos activos
          {pilotsActivos.length > 0 && (
            <span className="ml-2 text-sm text-slate-400 font-normal">
              ({pilotsActivos.length})
            </span>
          )}
        </h2>
        {pilotsActivos.length === 0 ? (
          <p className="text-slate-400 text-sm">No hay pilotos activos en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pilotsActivos.map((pilot) => (
              <PilotCard key={pilot.id} pilot={pilot} />
            ))}
          </div>
        )}
      </section>

      {/* Decisiones del comité */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Decisiones del comité</h2>
        {decisiones.length === 0 ? (
          <p className="text-slate-400 text-sm">No hay decisiones registradas.</p>
        ) : (
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
            {decisiones.map((decision) => (
              <DecisionItem key={decision.id} decision={decision} />
            ))}
          </div>
        )}
      </section>

      {/* Red Flags activos */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Alertas activas
          {redFlags.length > 0 && (
            <span className="ml-2 text-sm text-red-400 font-normal">({redFlags.length})</span>
          )}
        </h2>
        {redFlags.length === 0 ? (
          <p className="text-slate-400 text-sm">No hay alertas activas.</p>
        ) : (
          <div className="space-y-3">
            {redFlags.map((flag) => {
              const colorClass = SEVERITY_COLORS[flag.severity] ?? 'bg-slate-700 border-slate-600 text-slate-300';
              const severityLabel = SEVERITY_LABELS[flag.severity] ?? flag.severity;
              return (
                <div
                  key={flag.ruleId}
                  className={`rounded-xl p-4 border ${colorClass}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                      {severityLabel}
                    </span>
                    <span className="font-semibold text-sm">{flag.title}</span>
                  </div>
                  <p className="text-sm opacity-80">{flag.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
