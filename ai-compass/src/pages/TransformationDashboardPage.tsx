// ══════════════════════════════════════════════
// TRANSFORMATION DASHBOARD PAGE — Dashboard de Transformación (Etapa 5)
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPost, apiPut, apiDel } from '@/services/apiClient';
import type {
  AiTool,
  AiToolCategory,
  AiToolStatus,
  GovernanceEvolution,
  TransformationSummary,
} from '@/types';

// ── Constantes ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<AiToolCategory, string> = {
  llm: 'LLM',
  'no-code': 'No-code',
  custom: 'Personalizada',
  analytics: 'Analítica',
  other: 'Otra',
};

const CATEGORY_CLASSES: Record<AiToolCategory, string> = {
  llm: 'bg-purple-900 text-purple-300',
  'no-code': 'bg-blue-900 text-blue-300',
  custom: 'bg-orange-900 text-orange-300',
  analytics: 'bg-green-900 text-green-300',
  other: 'bg-slate-700 text-slate-300',
};

const STATUS_LABELS: Record<AiToolStatus, string> = {
  active: 'Activa',
  evaluating: 'Evaluando',
  deprecated: 'Deprecada',
};

const STATUS_CLASSES: Record<AiToolStatus, string> = {
  active: 'bg-green-900 text-green-300',
  evaluating: 'bg-yellow-900 text-yellow-300',
  deprecated: 'bg-red-900 text-red-300',
};

const DIMENSION_LABELS: Record<string, string> = {
  estrategia: 'Estrategia',
  procesos: 'Procesos',
  datos: 'Datos',
  tecnologia: 'Tecnología',
  cultura: 'Cultura',
  gobernanza: 'Gobernanza',
};

// ── Subcomponentes ────────────────────────────────────────────────────────────

function KpiCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">
        {value}
        {unit && <span className="text-slate-400 text-base font-normal ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function CategoryBadge({ category }: { category: AiToolCategory }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_CLASSES[category]}`}>
      {CATEGORY_LABELS[category]}
    </span>
  );
}

function StatusBadge({ status }: { status: AiToolStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Formulario de herramienta ─────────────────────────────────────────────────

interface ToolForm {
  name: string;
  category: AiToolCategory;
  licenses: string;
  monthlyCost: string;
  teamsUsing: string;
  status: AiToolStatus;
}

const EMPTY_TOOL_FORM: ToolForm = {
  name: '',
  category: 'llm',
  licenses: '0',
  monthlyCost: '0',
  teamsUsing: '',
  status: 'active',
};

function ToolForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initial?: ToolForm;
  onSubmit: (data: ToolForm) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<ToolForm>(initial ?? { ...EMPTY_TOOL_FORM });

  function update<K extends keyof ToolForm>(field: K, value: ToolForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="bg-slate-700 rounded-xl p-5 border border-slate-600 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Nombre</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
            placeholder="ChatGPT, Copilot..."
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Categoría</label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value as AiToolCategory)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Licencias</label>
          <input
            type="number"
            min={0}
            value={form.licenses}
            onChange={(e) => update('licenses', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Costo mensual (USD)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.monthlyCost}
            onChange={(e) => update('monthlyCost', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Equipos (separados por coma)</label>
          <input
            type="text"
            value={form.teamsUsing}
            onChange={(e) => update('teamsUsing', e.target.value)}
            placeholder="Ventas, Marketing..."
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Estado</label>
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value as AiToolStatus)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg text-sm transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

// ── Formulario de evolución de gobernanza ─────────────────────────────────────

interface EvolutionForm {
  originalDecisionNumber: string;
  evolutionDate: string;
  changeDescription: string;
  decidedBy: string;
}

const EMPTY_EVOLUTION_FORM: EvolutionForm = {
  originalDecisionNumber: '',
  evolutionDate: new Date().toISOString().split('T')[0],
  changeDescription: '',
  decidedBy: '',
};

function GovernanceEvolutionForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: EvolutionForm) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<EvolutionForm>({ ...EMPTY_EVOLUTION_FORM });

  function update<K extends keyof EvolutionForm>(field: K, value: EvolutionForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="bg-slate-700 rounded-xl p-5 border border-slate-600 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">N° de decisión original</label>
          <input
            type="number"
            min={1}
            value={form.originalDecisionNumber}
            onChange={(e) => update('originalDecisionNumber', e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Fecha</label>
          <input
            type="date"
            value={form.evolutionDate}
            onChange={(e) => update('evolutionDate', e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Descripción del cambio</label>
          <textarea
            value={form.changeDescription}
            onChange={(e) => update('changeDescription', e.target.value)}
            required
            rows={3}
            disabled={isLoading}
            placeholder="Describir qué cambió y por qué..."
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Decidido por</label>
          <input
            type="text"
            value={form.decidedBy}
            onChange={(e) => update('decidedBy', e.target.value)}
            placeholder="Nombre del responsable"
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg text-sm transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isLoading ? 'Registrando...' : 'Registrar evolución'}
        </button>
      </div>
    </form>
  );
}

// ── Sección: Evolución de madurez ─────────────────────────────────────────────

function MaturityEvolutionSection({
  evolution,
}: {
  evolution: TransformationSummary['maturityEvolution'];
}) {
  if (!evolution.current) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-white font-semibold text-lg mb-4">Evolución de madurez</h2>
        <p className="text-slate-400 text-sm">No hay datos de diagnóstico disponibles aún.</p>
      </div>
    );
  }

  const dimensions = Object.keys(evolution.current);
  const maxScore = 4;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-white font-semibold text-lg mb-1">Evolución de madurez</h2>
      {evolution.first && evolution.current !== evolution.first && (
        <p className="text-slate-400 text-xs mb-4">Comparación entre el diagnóstico inicial y el actual</p>
      )}
      <div className="space-y-4">
        {dimensions.map((dim) => {
          const currentScore = evolution.current?.[dim]?.score ?? 0;
          const firstScore = evolution.first?.[dim]?.score ?? null;
          const label = DIMENSION_LABELS[dim] ?? dim;

          return (
            <div key={dim}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 text-sm">{label}</span>
                <div className="flex items-center gap-2 text-xs">
                  {firstScore !== null && firstScore !== currentScore && (
                    <span className="text-slate-500">Día 1: {firstScore}</span>
                  )}
                  <span className="text-white font-medium">Hoy: {currentScore}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {firstScore !== null && firstScore !== currentScore && (
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-slate-500 h-2 rounded-full transition-all"
                      style={{ width: `${(firstScore / maxScore) * 100}%` }}
                    />
                  </div>
                )}
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(currentScore / maxScore) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {evolution.first && (
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 bg-slate-500 rounded-full" />
            Diagnóstico inicial
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 bg-blue-500 rounded-full" />
            Diagnóstico actual
          </span>
        </div>
      )}
    </div>
  );
}

// ── Sección: Catálogo de herramientas ─────────────────────────────────────────

function ToolCatalogSection({
  orgId,
  tools,
  onToolsChange,
}: {
  orgId: string;
  tools: AiTool[];
  onToolsChange: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function parseTeams(value: string): string[] {
    return value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  async function handleCreate(data: ToolForm) {
    setIsLoading(true);
    try {
      await apiPost<AiTool>(`/transformation/organization/${orgId}/tools`, {
        name: data.name,
        category: data.category,
        licenses: parseInt(data.licenses) || 0,
        monthlyCost: parseFloat(data.monthlyCost) || 0,
        teamsUsing: parseTeams(data.teamsUsing),
        status: data.status,
      });
      setShowForm(false);
      await onToolsChange();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(id: string, data: ToolForm) {
    setIsLoading(true);
    try {
      await apiPut<AiTool>(`/transformation/tools/${id}`, {
        name: data.name,
        category: data.category,
        licenses: parseInt(data.licenses) || 0,
        monthlyCost: parseFloat(data.monthlyCost) || 0,
        teamsUsing: parseTeams(data.teamsUsing),
        status: data.status,
      });
      setEditingId(null);
      await onToolsChange();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar esta herramienta del catálogo?')) return;
    setIsLoading(true);
    try {
      await apiDel<void>(`/transformation/tools/${id}`);
      await onToolsChange();
    } finally {
      setIsLoading(false);
    }
  }

  function toolToForm(tool: AiTool): ToolForm {
    return {
      name: tool.name,
      category: tool.category,
      licenses: String(tool.licenses),
      monthlyCost: String(tool.monthlyCost),
      teamsUsing: tool.teamsUsing.join(', '),
      status: tool.status,
    };
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">Catálogo de herramientas IA</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Agregar herramienta
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <ToolForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isLoading={isLoading}
          />
        </div>
      )}

      {tools.length === 0 && !showForm && (
        <p className="text-slate-400 text-sm">No hay herramientas registradas aún.</p>
      )}

      {tools.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 font-medium pb-2 pr-4">Nombre</th>
                <th className="text-left text-slate-400 font-medium pb-2 pr-4">Categoría</th>
                <th className="text-left text-slate-400 font-medium pb-2 pr-4">Licencias</th>
                <th className="text-left text-slate-400 font-medium pb-2 pr-4">Costo/mes</th>
                <th className="text-left text-slate-400 font-medium pb-2 pr-4">Equipos</th>
                <th className="text-left text-slate-400 font-medium pb-2 pr-4">Estado</th>
                <th className="text-left text-slate-400 font-medium pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tools.map((tool) => (
                <>
                  <tr key={tool.id} className="hover:bg-slate-750">
                    <td className="py-3 pr-4 text-white font-medium">{tool.name}</td>
                    <td className="py-3 pr-4">
                      <CategoryBadge category={tool.category} />
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{tool.licenses}</td>
                    <td className="py-3 pr-4 text-slate-300">
                      ${tool.monthlyCost.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-slate-300 max-w-xs">
                      {tool.teamsUsing.length > 0
                        ? tool.teamsUsing.join(', ')
                        : <span className="text-slate-500">—</span>
                      }
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={tool.status} />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(editingId === tool.id ? null : tool.id)}
                          className="text-slate-400 hover:text-white text-xs transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(tool.id)}
                          disabled={isLoading}
                          className="text-red-400 hover:text-red-300 text-xs transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === tool.id && (
                    <tr key={`edit-${tool.id}`}>
                      <td colSpan={7} className="py-2">
                        <ToolForm
                          initial={toolToForm(tool)}
                          onSubmit={(data) => handleUpdate(tool.id, data)}
                          onCancel={() => setEditingId(null)}
                          isLoading={isLoading}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Sección: Evolución de gobernanza ──────────────────────────────────────────

function GovernanceSection({
  orgId,
  evolutions,
  onEvolutionsChange,
}: {
  orgId: string;
  evolutions: GovernanceEvolution[];
  onEvolutionsChange: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(data: EvolutionForm) {
    setIsLoading(true);
    try {
      await apiPost<GovernanceEvolution>(
        `/transformation/organization/${orgId}/governance-evolutions`,
        {
          originalDecisionNumber: parseInt(data.originalDecisionNumber),
          evolutionDate: data.evolutionDate,
          changeDescription: data.changeDescription,
          decidedBy: data.decidedBy || undefined,
        },
      );
      setShowForm(false);
      await onEvolutionsChange();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">Evolución de gobernanza</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Registrar evolución
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <GovernanceEvolutionForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isLoading={isLoading}
          />
        </div>
      )}

      {evolutions.length === 0 && !showForm && (
        <p className="text-slate-400 text-sm">No hay evoluciones de gobernanza registradas aún.</p>
      )}

      {evolutions.length > 0 && (
        <div className="relative pl-4">
          {/* Línea vertical del timeline */}
          <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-slate-600" />

          <div className="space-y-5">
            {evolutions.map((ev) => (
              <div key={ev.id} className="relative pl-6">
                {/* Punto del timeline */}
                <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-800 -translate-x-[5px]" />

                <div className="bg-slate-750 rounded-lg border border-slate-600 p-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-medium">
                        Decisión #{ev.originalDecisionNumber}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {new Date(ev.evolutionDate).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {ev.decidedBy && (
                      <span className="text-slate-400 text-xs shrink-0">
                        Por: <span className="text-slate-300">{ev.decidedBy}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">{ev.changeDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function TransformationDashboardPage() {
  const { orgId } = useParams<{ orgId: string }>();

  const [summary, setSummary] = useState<TransformationSummary | null>(null);
  const [tools, setTools] = useState<AiTool[]>([]);
  const [evolutions, setEvolutions] = useState<GovernanceEvolution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    if (!orgId) return;
    const data = await apiGet<TransformationSummary>(`/transformation/organization/${orgId}/summary`);
    setSummary(data);
  }

  async function loadTools() {
    if (!orgId) return;
    const data = await apiGet<AiTool[]>(`/transformation/organization/${orgId}/tools`);
    setTools(data);
  }

  async function loadEvolutions() {
    if (!orgId) return;
    const data = await apiGet<GovernanceEvolution[]>(`/transformation/organization/${orgId}/governance-evolutions`);
    setEvolutions(data);
  }

  useEffect(() => {
    if (!orgId) return;
    setIsLoading(true);
    Promise.all([loadSummary(), loadTools(), loadEvolutions()])
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al cargar el dashboard';
        setError(message);
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <p className="text-slate-400 text-sm">Cargando dashboard de transformación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-white text-2xl font-bold">Dashboard de Transformación</h1>
        <p className="text-slate-400 text-sm mt-1">
          Visión consolidada del impacto acumulado de la transformación IA
        </p>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Procesos rediseñados"
            value={summary.totalProcessesRedesigned}
          />
          <KpiCard
            label="Horas liberadas"
            value={summary.hoursFreed.toFixed(0)}
            unit="h"
          />
          <KpiCard
            label="ROI estimado"
            value={`$${summary.estimatedRoi.toLocaleString('es-AR')}`}
          />
          <KpiCard
            label="Herramientas IA activas"
            value={summary.aiToolsAdopted}
          />
        </div>
      )}

      {/* Evolución de madurez */}
      {summary && (
        <MaturityEvolutionSection evolution={summary.maturityEvolution} />
      )}

      {/* Catálogo de herramientas */}
      <ToolCatalogSection
        orgId={orgId ?? ''}
        tools={tools}
        onToolsChange={loadTools}
      />

      {/* Evolución de gobernanza */}
      <GovernanceSection
        orgId={orgId ?? ''}
        evolutions={evolutions}
        onEvolutionsChange={loadEvolutions}
      />
    </div>
  );
}
