// ══════════════════════════════════════════════
// AREA LIST PAGE — Lista de áreas departamentales
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAreaStore } from '@/stores/areaStore';
import AiOperatingLevelBadge from '@/components/AiOperatingLevelBadge';
import AreaAssessmentStatusIcon from '@/components/AreaAssessmentStatusIcon';
import type { AiOperatingLevel, AreaAssessmentStatus, StandardArea } from '@/types';

const STANDARD_AREAS: { value: StandardArea; label: string }[] = [
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'rrhh', label: 'Recursos Humanos' },
  { value: 'legal', label: 'Legal' },
  { value: 'it', label: 'Tecnología / IT' },
  { value: 'producto', label: 'Producto' },
  { value: 'atencion-al-cliente', label: 'Atención al Cliente' },
  { value: 'logistica', label: 'Logística' },
];

export default function AreaListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { areas, isLoading, fetchAreas, createArea } = useAreaStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newArea, setNewArea] = useState<StandardArea>('finanzas');

  useEffect(() => {
    if (orgId) void fetchAreas(orgId);
  }, [orgId, fetchAreas]);

  async function handleAdd() {
    if (!orgId) return;
    await createArea(orgId, newArea);
    setShowAdd(false);
  }

  if (isLoading && areas.length === 0) {
    return <div className="text-slate-400 p-8">Cargando áreas...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Áreas departamentales</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500"
        >
          + Agregar área
        </button>
      </div>

      {showAdd && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-4 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Área estándar</label>
            <select
              value={newArea}
              onChange={(e) => setNewArea(e.target.value as StandardArea)}
              className="w-full bg-slate-700 border border-slate-500 rounded px-3 py-2 text-white text-sm"
            >
              {STANDARD_AREAS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-500">
            Crear
          </button>
          <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600">
            Cancelar
          </button>
        </div>
      )}

      {areas.length === 0 ? (
        <div className="text-slate-500 text-center py-16">
          No hay áreas registradas. Agrega la primera área para comenzar el diagnóstico incremental.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => navigate(`/org/${orgId}/areas/${area.id}`)}
              className="text-left bg-slate-800 rounded-xl p-5 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-500"
            >
              <h3 className="text-white font-semibold mb-2">{area.displayName}</h3>
              <div className="flex items-center gap-2 mb-3">
                <AreaAssessmentStatusIcon status={area.assessmentStatus as AreaAssessmentStatus} />
              </div>
              <div className="flex items-center justify-between">
                <AiOperatingLevelBadge level={area.aiOperatingLevel as AiOperatingLevel} />
                <span className="text-slate-400 text-xs">
                  {(area as unknown as { pilotCount?: number }).pilotCount ?? 0} pilotos
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
