// ══════════════════════════════════════════════
// ParticipantManager — Gestión de participantes de sesión
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { Participant } from '@/types';

interface ParticipantManagerProps {
  participants: Participant[];
  onAdd: (p: Omit<Participant, 'id'>) => void;
  onRemove: (id: string) => void;
  readOnly: boolean;
}

interface FormState {
  name: string;
  role: string;
  area: string;
}

const EMPTY_FORM: FormState = { name: '', role: '', area: '' };

export default function ParticipantManager({
  participants,
  onAdd,
  onRemove,
  readOnly,
}: ParticipantManagerProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAdd() {
    const { name, role, area } = form;
    if (!name.trim() || !role.trim() || !area.trim()) return;
    onAdd({ name: name.trim(), role: role.trim(), area: area.trim() });
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handleCancel() {
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Participantes ({participants.length})
      </h3>

      {participants.length === 0 && (
        <p className="text-sm text-gray-500 italic">Sin participantes registrados.</p>
      )}

      <ul className="space-y-2">
        {participants.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
          >
            <div>
              <span className="text-sm font-medium text-white">{p.name}</span>
              <span className="text-xs text-gray-400 ml-2">
                {p.role} · {p.area}
              </span>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                className="text-gray-500 hover:text-red-400 text-sm transition-colors"
                aria-label={`Eliminar a ${p.name}`}
              >
                Eliminar
              </button>
            )}
          </li>
        ))}
      </ul>

      {!readOnly && (
        <>
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Agregar participante
            </button>
          ) : (
            <div className="bg-gray-800 rounded-lg p-3 space-y-2">
              <input
                type="text"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Rol"
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Área"
                value={form.area}
                onChange={(e) => handleChange('area', e.target.value)}
                className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!form.name.trim() || !form.role.trim() || !form.area.trim()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
