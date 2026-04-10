// ══════════════════════════════════════════════
// COMMITTEE DESIGN PAGE — Diseño del comité de IA
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommitteeStore } from '@/stores/committeeStore';
import type { CommitteeRole, CommitteeMember } from '@/types';
import type { CommitteeRecommendation } from '@/types';
import { apiGet } from '@/services/apiClient';
import type { CrossSessionAnalysis } from '@/types';

// ──────────────────────────────────────────────
// Configuración de roles
// ──────────────────────────────────────────────

interface RoleConfig {
  role: CommitteeRole;
  label: string;
  mandatory: boolean;
  hint: string;
}

const ROLES: RoleConfig[] = [
  {
    role: 'sponsor',
    label: 'Sponsor Ejecutivo',
    mandatory: true,
    hint: 'Director o VP con autoridad para asignar presupuesto y eliminar obstáculos.',
  },
  {
    role: 'operational-leader',
    label: 'Líder Operativo',
    mandatory: true,
    hint: 'Responsable de coordinar la implementación en los equipos del día a día.',
  },
  {
    role: 'business-rep',
    label: 'Representante de Negocio',
    mandatory: false,
    hint: 'Voz de las áreas de negocio que serán impactadas por los pilotos de IA.',
  },
  {
    role: 'it-rep',
    label: 'Representante de TI',
    mandatory: false,
    hint: 'Responsable de infraestructura, seguridad y viabilidad técnica.',
  },
  {
    role: 'change-management',
    label: 'Gestión del Cambio',
    mandatory: false,
    hint: 'Facilita la adopción, comunicación y capacitación organizacional.',
  },
];

// ──────────────────────────────────────────────
// Tipos internos
// ──────────────────────────────────────────────

interface MemberDraft {
  name: string;
  email: string;
  area: string;
}

type MemberDraftMap = Record<CommitteeRole, MemberDraft>;

const EMPTY_DRAFT: MemberDraft = { name: '', email: '', area: '' };

function buildInitialDrafts(members: CommitteeMember[]): MemberDraftMap {
  const map: MemberDraftMap = {
    'sponsor': { ...EMPTY_DRAFT },
    'operational-leader': { ...EMPTY_DRAFT },
    'business-rep': { ...EMPTY_DRAFT },
    'it-rep': { ...EMPTY_DRAFT },
    'change-management': { ...EMPTY_DRAFT },
  };

  for (const m of members) {
    map[m.role] = { name: m.name, email: m.email, area: m.area };
  }

  return map;
}

// ──────────────────────────────────────────────
// Subcomponentes
// ──────────────────────────────────────────────

interface RoleCardProps {
  config: RoleConfig;
  draft: MemberDraft;
  aiSuggestion?: { suggestedPerson?: string; justification: string };
  onChange: (field: keyof MemberDraft, value: string) => void;
}

function RoleCard({ config, draft, aiSuggestion, onChange }: RoleCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
      {/* Título del rol */}
      <div className="flex items-center gap-2">
        <h3 className="text-white font-semibold text-base">
          {config.label}
          {config.mandatory && (
            <span className="text-red-400 ml-1" title="Obligatorio">*</span>
          )}
        </h3>
        {!config.mandatory && (
          <span className="text-xs text-slate-500 font-normal">(opcional)</span>
        )}
      </div>

      <p className="text-slate-400 text-sm">{config.hint}</p>

      {/* Sugerencia de IA */}
      {aiSuggestion && (
        <div className="bg-blue-950 border border-blue-700 rounded-lg px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
            Sugerencia de IA
          </p>
          {aiSuggestion.suggestedPerson && (
            <p className="text-white text-sm font-medium">{aiSuggestion.suggestedPerson}</p>
          )}
          <p className="text-blue-300 text-xs leading-relaxed">{aiSuggestion.justification}</p>
        </div>
      )}

      {/* Campos editables */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(
          [
            { field: 'name' as const, label: 'Nombre', placeholder: 'Juan Pérez' },
            { field: 'email' as const, label: 'Email', placeholder: 'juan@empresa.com' },
            { field: 'area' as const, label: 'Área', placeholder: 'Operaciones' },
          ] as { field: keyof MemberDraft; label: string; placeholder: string }[]
        ).map(({ field, label, placeholder }) => (
          <div key={field}>
            <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              value={draft[field]}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm placeholder-slate-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────

export default function CommitteeDesignPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  const { committee, isLoading, error, fetchCommittee, createCommittee, addMember } =
    useCommitteeStore();

  const [drafts, setDrafts] = useState<MemberDraftMap>({
    'sponsor': { ...EMPTY_DRAFT },
    'operational-leader': { ...EMPTY_DRAFT },
    'business-rep': { ...EMPTY_DRAFT },
    'it-rep': { ...EMPTY_DRAFT },
    'change-management': { ...EMPTY_DRAFT },
  });

  const [recommendation, setRecommendation] = useState<CommitteeRecommendation | null>(null);
  const [saving, setSaving] = useState(false);

  // Cargar comité y análisis cruzado al montar
  useEffect(() => {
    if (!orgId) return;

    void fetchCommittee(orgId);

    apiGet<CrossSessionAnalysis>(`/api/organizations/${orgId}/cross-analysis`)
      .then((analysis) => {
        setRecommendation(analysis.committeeRecommendation);
      })
      .catch(() => {
        // El análisis puede no existir aún; continuar sin recomendación
      });
  }, [orgId, fetchCommittee]);

  // Sincronizar drafts cuando se carga el comité
  useEffect(() => {
    if (committee) {
      setDrafts(buildInitialDrafts(committee.members));
    }
  }, [committee]);

  function handleDraftChange(role: CommitteeRole, field: keyof MemberDraft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [role]: { ...prev[role], [field]: value },
    }));
  }

  function getAiSuggestion(role: CommitteeRole) {
    return recommendation?.suggestedMembers.find((m) => m.role === role);
  }

  // Total de miembros con nombre ingresado
  const membersWithName = ROLES.filter((r) => drafts[r.role].name.trim().length > 0);
  const exceedsLimit = membersWithName.length > 7;

  // Habilitado si los dos roles obligatorios tienen nombre
  const canContinue =
    drafts['sponsor'].name.trim().length > 0 &&
    drafts['operational-leader'].name.trim().length > 0;

  async function handleContinue() {
    if (!orgId || !canContinue) return;
    setSaving(true);

    try {
      // Crear comité si no existe
      if (!committee) {
        await createCommittee(orgId, 'Quincenal');
      }

      // Guardar miembros con nombre
      for (const roleConfig of ROLES) {
        const draft = drafts[roleConfig.role];
        if (draft.name.trim().length === 0) continue;

        // Verificar si ya existe este rol en el comité
        const exists = committee?.members.some((m) => m.role === roleConfig.role);
        if (!exists) {
          await addMember({
            name: draft.name,
            email: draft.email,
            area: draft.area,
            role: roleConfig.role,
          });
        }
      }

      void navigate(`/org/${orgId}/committee/constitution`);
    } finally {
      setSaving(false);
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
        <h2 className="text-white text-2xl font-bold mb-1">Diseño del Comité de IA</h2>
        <p className="text-slate-400 text-sm">
          Define quiénes integrarán el comité de gobernanza de IA. Los roles marcados con{' '}
          <span className="text-red-400 font-medium">*</span> son obligatorios para continuar.
        </p>
      </div>

      {/* Recomendación de composición */}
      {recommendation && (
        <div className="bg-blue-950 border border-blue-700 rounded-xl px-5 py-4">
          <p className="text-blue-300 text-sm font-semibold mb-1">
            Recomendación de composición basada en el análisis cruzado
          </p>
          <p className="text-blue-200 text-sm">
            El análisis de las sesiones sugiere los perfiles ideales para cada rol.
            Las sugerencias aparecen dentro de cada tarjeta de rol.
          </p>
        </div>
      )}

      {/* Estado de carga */}
      {isLoading && !committee && (
        <p className="text-slate-400 text-sm">Cargando comité...</p>
      )}

      {error && (
        <div className="bg-red-950 border border-red-700 rounded-lg px-4 py-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Alerta de límite de miembros */}
      {exceedsLimit && (
        <div className="bg-amber-950 border border-amber-600 rounded-lg px-4 py-3">
          <p className="text-amber-300 text-sm font-medium">
            Se recomienda un máximo de 7 miembros en el comité. Actualmente hay{' '}
            {membersWithName.length} roles con datos.
          </p>
        </div>
      )}

      {/* Tarjetas de roles */}
      <div className="space-y-5">
        {ROLES.map((config) => (
          <RoleCard
            key={config.role}
            config={config}
            draft={drafts[config.role]}
            aiSuggestion={getAiSuggestion(config.role)}
            onChange={(field, value) => handleDraftChange(config.role, field, value)}
          />
        ))}
      </div>

      {/* Botón continuar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => void handleContinue()}
          disabled={!canContinue || saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors"
        >
          {saving ? 'Guardando...' : 'Continuar a Constitución'}
        </button>
      </div>
    </div>
  );
}
