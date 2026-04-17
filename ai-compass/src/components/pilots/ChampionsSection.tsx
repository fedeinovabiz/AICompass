// ══════════════════════════════════════════════
// CHAMPIONS SECTION — GAP CRÍTICO 2
// Red de champions del piloto
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { ChampionAssignment } from '@/types';

interface Props {
  champions: ChampionAssignment[];
  teamSize: number;
  onSave: (champions: ChampionAssignment[]) => Promise<void>;
  isSaving: boolean;
}

const RESPONSIBILITY_OPTIONS = [
  'Peer training',
  'Soporte primer nivel',
  'Feedback loop',
  'Documentación de prompts',
];

const EMPTY_CHAMPION: ChampionAssignment = {
  name: '',
  area: '',
  responsibilities: [],
  weeklyHours: 2,
  communicationChannel: '',
};

const IDEAL_RATIO = 50;

function ChampionCard({
  champion,
  idx,
  onChange,
  onRemove,
}: {
  champion: ChampionAssignment;
  idx: number;
  onChange: (idx: number, data: ChampionAssignment) => void;
  onRemove: (idx: number) => void;
}) {
  function update<K extends keyof ChampionAssignment>(field: K, value: ChampionAssignment[K]) {
    onChange(idx, { ...champion, [field]: value });
  }

  function toggleResponsibility(resp: string) {
    const current = champion.responsibilities;
    const updated = current.includes(resp)
      ? current.filter((r) => r !== resp)
      : [...current, resp];
    update('responsibilities', updated);
  }

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
          Champion #{idx + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="text-slate-500 hover:text-red-400 transition-colors text-sm"
        >
          Eliminar
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Nombre</label>
          <input
            type="text"
            value={champion.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ana García"
            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Área</label>
          <input
            type="text"
            value={champion.area}
            onChange={(e) => update('area', e.target.value)}
            placeholder="Operaciones"
            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Horas semanales</label>
          <input
            type="number"
            min={1}
            max={40}
            value={champion.weeklyHours}
            onChange={(e) => update('weeklyHours', parseInt(e.target.value) || 1)}
            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Canal de comunicación</label>
          <input
            type="text"
            value={champion.communicationChannel}
            onChange={(e) => update('communicationChannel', e.target.value)}
            placeholder="Slack #ai-pilots"
            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-2">Responsabilidades</label>
        <div className="flex flex-wrap gap-2">
          {RESPONSIBILITY_OPTIONS.map((resp) => {
            const active = champion.responsibilities.includes(resp);
            return (
              <button
                key={resp}
                type="button"
                onClick={() => toggleResponsibility(resp)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  active
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-400'
                }`}
              >
                {resp}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ChampionsSection({ champions, teamSize, onSave, isSaving }: Props) {
  const [items, setItems] = useState<ChampionAssignment[]>(champions ?? []);

  const idealChampions = Math.ceil(teamSize / IDEAL_RATIO);
  const ratio = items.length > 0 ? Math.round(teamSize / items.length) : teamSize;

  function updateChampion(idx: number, data: ChampionAssignment) {
    setItems((prev) => prev.map((c, i) => (i === idx ? data : c)));
  }

  function addChampion() {
    setItems((prev) => [...prev, { ...EMPTY_CHAMPION }]);
  }

  function removeChampion(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    await onSave(items);
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Red de Champions</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {items.length} champions para {teamSize} usuarios{' '}
            <span className={items.length >= idealChampions ? 'text-green-400' : 'text-yellow-400'}>
              (ideal: 1:{IDEAL_RATIO} = {idealChampions} champion{idealChampions !== 1 ? 's' : ''}, ratio actual: 1:{ratio})
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded-lg transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((champion, idx) => (
          <ChampionCard
            key={idx}
            champion={champion}
            idx={idx}
            onChange={updateChampion}
            onRemove={removeChampion}
          />
        ))}

        {items.length === 0 && (
          <p className="text-slate-500 text-sm py-4 text-center">Sin champions asignados aún.</p>
        )}
      </div>

      <button
        type="button"
        onClick={addChampion}
        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg border border-slate-600 transition-colors"
      >
        + Agregar champion
      </button>
    </section>
  );
}
