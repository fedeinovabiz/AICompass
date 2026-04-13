// ══════════════════════════════════════════════
// AREA SELECTOR — Dropdown estándar + custom
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { StandardArea, DepartmentArea } from '@/types';

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

interface Props {
  existingAreas: DepartmentArea[];
  value: string | null;
  onChange: (areaId: string | null) => void;
  onCreateArea?: (standardArea: string, customName?: string) => Promise<DepartmentArea>;
}

export default function AreaSelector({ existingAreas, value, onChange, onCreateArea }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customParent, setCustomParent] = useState<string>('custom');

  async function handleCreateCustom() {
    if (!onCreateArea || !customName.trim()) return;
    const area = await onCreateArea(customParent, customName.trim());
    onChange(area.id);
    setShowCustom(false);
    setCustomName('');
  }

  return (
    <div className="space-y-2">
      <select
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          if (val === '__new__') {
            setShowCustom(true);
            return;
          }
          onChange(val || null);
        }}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="">Sin área asignada</option>
        {existingAreas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.displayName}
          </option>
        ))}
        {onCreateArea && <option value="__new__">+ Crear nueva área...</option>}
      </select>

      {showCustom && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 space-y-2">
          <select
            value={customParent}
            onChange={(e) => setCustomParent(e.target.value)}
            className="w-full bg-slate-700 border border-slate-500 rounded px-2 py-1.5 text-white text-sm"
          >
            {STANDARD_AREAS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
            <option value="custom">Otra (custom)</option>
          </select>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nombre del área..."
            className="w-full bg-slate-700 border border-slate-500 rounded px-2 py-1.5 text-white text-sm placeholder:text-slate-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateCustom}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
            >
              Crear
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
