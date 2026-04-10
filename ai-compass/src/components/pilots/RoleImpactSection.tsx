// ══════════════════════════════════════════════
// ROLE IMPACT SECTION — Impacto en roles del piloto
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { RoleImpact } from '@/types';

interface Props {
  roleImpacts: RoleImpact[];
  onSave: (impacts: RoleImpact[]) => Promise<void>;
  isSaving: boolean;
}

const EMPTY_IMPACT: RoleImpact = {
  roleName: '',
  timeFreedPercent: 0,
  newResponsibilities: '',
  proposedIncentive: '',
};

const HIGH_IMPACT_THRESHOLD = 30;

export default function RoleImpactSection({ roleImpacts, onSave, isSaving }: Props) {
  const [impacts, setImpacts] = useState<RoleImpact[]>(roleImpacts);

  const alertRoles = impacts.filter(
    (r) => r.timeFreedPercent > HIGH_IMPACT_THRESHOLD && !r.proposedIncentive.trim(),
  );

  function updateImpact(idx: number, field: keyof RoleImpact, value: string | number) {
    setImpacts((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    );
  }

  function addImpact() {
    setImpacts((prev) => [...prev, { ...EMPTY_IMPACT }]);
  }

  function removeImpact(idx: number) {
    setImpacts((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    await onSave(impacts);
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Impacto en Roles</h2>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded-lg transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {alertRoles.length > 0 && (
        <div className="bg-orange-900/40 border border-orange-700 rounded-lg px-4 py-3 text-orange-300 text-sm">
          <span className="font-bold">Atención:</span>{' '}
          {alertRoles.map((r) => r.roleName).join(', ')} libera más del {HIGH_IMPACT_THRESHOLD}% del tiempo sin incentivo propuesto.
          Definir un incentivo para gestionar el cambio.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-700">
              <th className="pb-2 pr-3 font-medium">Rol</th>
              <th className="pb-2 pr-3 font-medium">% Tiempo liberado</th>
              <th className="pb-2 pr-3 font-medium">Nuevas responsabilidades</th>
              <th className="pb-2 pr-3 font-medium">Incentivo propuesto</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {impacts.map((impact, idx) => (
              <tr key={idx}>
                <td className="py-2 pr-3">
                  <input
                    type="text"
                    value={impact.roleName}
                    onChange={(e) => updateImpact(idx, 'roleName', e.target.value)}
                    placeholder="Analista"
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={impact.timeFreedPercent}
                      onChange={(e) => updateImpact(idx, 'timeFreedPercent', parseInt(e.target.value) || 0)}
                      className={`w-20 px-2 py-1 bg-slate-700 border rounded text-white focus:outline-none focus:border-blue-500 ${
                        impact.timeFreedPercent > HIGH_IMPACT_THRESHOLD
                          ? 'border-orange-600'
                          : 'border-slate-600'
                      }`}
                    />
                    <span className="text-slate-400 text-xs">%</span>
                  </div>
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="text"
                    value={impact.newResponsibilities}
                    onChange={(e) => updateImpact(idx, 'newResponsibilities', e.target.value)}
                    placeholder="Supervisar outputs de IA"
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="text"
                    value={impact.proposedIncentive}
                    onChange={(e) => updateImpact(idx, 'proposedIncentive', e.target.value)}
                    placeholder="Capacitación en IA avanzada"
                    className={`w-full px-2 py-1 bg-slate-700 border rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 ${
                      impact.timeFreedPercent > HIGH_IMPACT_THRESHOLD && !impact.proposedIncentive.trim()
                        ? 'border-orange-600'
                        : 'border-slate-600'
                    }`}
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => removeImpact(idx)}
                    className="text-slate-500 hover:text-red-400 transition-colors px-2"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {impacts.length === 0 && (
          <p className="text-slate-500 text-sm py-4 text-center">Sin roles afectados registrados.</p>
        )}
      </div>

      <button
        type="button"
        onClick={addImpact}
        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg border border-slate-600 transition-colors"
      >
        + Agregar rol
      </button>
    </section>
  );
}
