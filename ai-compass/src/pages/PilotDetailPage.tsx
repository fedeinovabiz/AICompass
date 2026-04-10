// ══════════════════════════════════════════════
// PILOT DETAIL PAGE — Detalle completo del piloto
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePilotStore } from '@/stores/pilotStore';
import type { PilotStatus, WorkflowDesign, PilotMetric, ChampionAssignment, RoleImpact, PilotMetricEntry } from '@/types';
import WorkflowDesignSection from '@/components/pilots/WorkflowDesignSection';
import BaselineSection from '@/components/pilots/BaselineSection';
import ChampionsSection from '@/components/pilots/ChampionsSection';
import MetricsTrackingSection from '@/components/pilots/MetricsTrackingSection';
import RoleImpactSection from '@/components/pilots/RoleImpactSection';
import CommitteeDecisionSection from '@/components/pilots/CommitteeDecisionSection';

const STATUS_CONFIG: Record<PilotStatus, { label: string; className: string }> = {
  designing: { label: 'Diseñando', className: 'bg-slate-700 text-slate-300' },
  active: { label: 'Activo', className: 'bg-blue-900 text-blue-300' },
  evaluating: { label: 'Evaluando', className: 'bg-yellow-900 text-yellow-300' },
  scale: { label: 'Escalar', className: 'bg-green-900 text-green-300' },
  iterate: { label: 'Iterar', className: 'bg-orange-900 text-orange-300' },
  kill: { label: 'Terminado', className: 'bg-red-900 text-red-300' },
};

const STATUS_ORDER: PilotStatus[] = ['designing', 'active', 'evaluating', 'scale', 'iterate', 'kill'];

export default function PilotDetailPage() {
  const { orgId, pilotId } = useParams<{ orgId: string; pilotId: string }>();
  const navigate = useNavigate();
  const { currentPilot, isLoading, error, fetchPilot, updatePilot, updateStatus, addMetricEntry, setBaseline, setCommitteeDecision } =
    usePilotStore();

  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    if (pilotId) void fetchPilot(pilotId);
  }, [pilotId, fetchPilot]);

  async function handleSaveWorkflow(design: WorkflowDesign) {
    if (!pilotId) return;
    setSavingSection('workflow');
    try {
      await updatePilot(pilotId, { workflowDesign: design });
    } finally {
      setSavingSection(null);
    }
  }

  async function handleSaveBaseline(metrics: PilotMetric[]) {
    if (!pilotId) return;
    setSavingSection('baseline');
    try {
      await setBaseline(pilotId, metrics);
    } finally {
      setSavingSection(null);
    }
  }

  async function handleSaveChampions(champions: ChampionAssignment[]) {
    if (!pilotId) return;
    setSavingSection('champions');
    try {
      await updatePilot(pilotId, { champions });
    } finally {
      setSavingSection(null);
    }
  }

  async function handleAddEntry(entry: PilotMetricEntry) {
    if (!pilotId) return;
    setSavingSection('metrics');
    try {
      await addMetricEntry(pilotId, entry);
    } finally {
      setSavingSection(null);
    }
  }

  async function handleSaveRoleImpacts(impacts: RoleImpact[]) {
    if (!pilotId) return;
    setSavingSection('roles');
    try {
      await updatePilot(pilotId, { roleImpacts: impacts });
    } finally {
      setSavingSection(null);
    }
  }

  async function handleCommitteeDecision(decision: string, justification: string) {
    if (!pilotId) return;
    setSavingSection('committee');
    try {
      await setCommitteeDecision(pilotId, decision, justification);
    } finally {
      setSavingSection(null);
    }
  }

  async function handleStatusChange(status: PilotStatus) {
    if (!pilotId) return;
    await updateStatus(pilotId, status);
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-slate-400 text-sm">Cargando piloto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!currentPilot) {
    return (
      <div className="p-8">
        <p className="text-slate-400 text-sm">Piloto no encontrado.</p>
      </div>
    );
  }

  const pilot = currentPilot;
  const statusCfg = STATUS_CONFIG[pilot.status];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => void navigate(`/org/${orgId}/pilots`)}
          className="text-slate-400 hover:text-white text-sm mt-1 transition-colors shrink-0"
        >
          ← Volver
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-white text-2xl font-bold">{pilot.title}</h1>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}>
              {statusCfg.label}
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Herramienta: <span className="text-slate-300">{pilot.tool}</span>
            {' · '}Champion: <span className="text-slate-300">{pilot.championName}</span>
            {' · '}Equipo: <span className="text-slate-300">{pilot.teamSize} personas</span>
          </p>
        </div>
      </div>

      {/* Cambio de estado */}
      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Estado del piloto</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_ORDER.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const isActive = pilot.status === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => !isActive && void handleStatusChange(status)}
                disabled={isActive || isLoading}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? `${cfg.className} ring-2 ring-offset-1 ring-offset-slate-800 ring-current cursor-default`
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secciones */}
      <WorkflowDesignSection
        workflowDesign={pilot.workflowDesign}
        pilotStatus={pilot.status}
        onSave={handleSaveWorkflow}
        isSaving={savingSection === 'workflow'}
      />

      <BaselineSection
        baseline={pilot.baseline}
        pilotStatus={pilot.status}
        onSave={handleSaveBaseline}
        isSaving={savingSection === 'baseline'}
      />

      <ChampionsSection
        champions={pilot.champions}
        teamSize={pilot.teamSize}
        onSave={handleSaveChampions}
        isSaving={savingSection === 'champions'}
      />

      <MetricsTrackingSection
        baseline={pilot.baseline}
        entries={pilot.metrics}
        onAddEntry={handleAddEntry}
        isSaving={savingSection === 'metrics'}
      />

      <RoleImpactSection
        roleImpacts={pilot.roleImpacts}
        onSave={handleSaveRoleImpacts}
        isSaving={savingSection === 'roles'}
      />

      {pilot.status === 'evaluating' && (
        <CommitteeDecisionSection
          onConfirm={handleCommitteeDecision}
          isSaving={savingSection === 'committee'}
        />
      )}

      {/* Decisión previa del comité (si ya existe) */}
      {pilot.committeeDecision && pilot.status !== 'evaluating' && (
        <section className="bg-slate-800 rounded-xl p-6 space-y-2">
          <h2 className="text-white font-semibold">Decisión del Comité</h2>
          <p className="text-slate-300 text-sm">
            Decisión: <span className="font-medium capitalize">{pilot.committeeDecision}</span>
          </p>
          {pilot.committeeDecisionDate && (
            <p className="text-slate-500 text-xs">
              Registrada el {new Date(pilot.committeeDecisionDate).toLocaleDateString('es-AR')}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
