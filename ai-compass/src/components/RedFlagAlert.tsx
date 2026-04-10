// ══════════════════════════════════════════════
// RED FLAG ALERT — Tarjeta de alerta individual
// ══════════════════════════════════════════════

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { RedFlagSeverity } from '@/types';

interface RedFlagAlertProps {
  redFlag: {
    ruleId: string;
    severity: RedFlagSeverity;
    title: string;
    description: string;
    stage: number;
  };
  onResolve?: (id: string, resolution: string) => void;
  onOverride?: (id: string, justification: string) => void;
}

const ESTILOS_SEVERIDAD: Record<RedFlagSeverity, string> = {
  warning: 'bg-yellow-900/50 border-yellow-500 text-yellow-200',
  alert: 'bg-orange-900/50 border-orange-500 text-orange-200',
  block: 'bg-red-900/50 border-red-500 text-red-200',
};

const ETIQUETA_SEVERIDAD: Record<RedFlagSeverity, string> = {
  warning: 'ADVERTENCIA',
  alert: 'ALERTA',
  block: 'BLOQUEANTE',
};

export default function RedFlagAlert({ redFlag, onResolve, onOverride }: RedFlagAlertProps) {
  const { user } = useAuthStore();
  const esFacilitador = user?.role === 'facilitator' || user?.role === 'admin';

  const [mostrarResolver, setMostrarResolver] = useState(false);
  const [mostrarOverride, setMostrarOverride] = useState(false);
  const [textoResolucion, setTextoResolucion] = useState('');
  const [textoJustificacion, setTextoJustificacion] = useState('');

  const clasesContenedor = `border rounded-lg p-4 ${ESTILOS_SEVERIDAD[redFlag.severity]}`;

  function handleResolver() {
    if (!textoResolucion.trim()) return;
    onResolve?.(redFlag.ruleId, textoResolucion.trim());
    setMostrarResolver(false);
    setTextoResolucion('');
  }

  function handleOverride() {
    if (!textoJustificacion.trim()) return;
    onOverride?.(redFlag.ruleId, textoJustificacion.trim());
    setMostrarOverride(false);
    setTextoJustificacion('');
  }

  return (
    <div className={clasesContenedor}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">
              {ETIQUETA_SEVERIDAD[redFlag.severity]}
            </span>
            <span className="text-xs opacity-50">Etapa {redFlag.stage}</span>
          </div>
          <p className="font-semibold text-sm">{redFlag.title}</p>
          <p className="text-xs opacity-80 mt-1">{redFlag.description}</p>
        </div>

        {esFacilitador && (onResolve ?? onOverride) && (
          <div className="flex gap-2 shrink-0">
            {onResolve && (
              <button
                onClick={() => { setMostrarResolver((v) => !v); setMostrarOverride(false); }}
                className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                Resolver
              </button>
            )}
            {onOverride && redFlag.severity !== 'block' && (
              <button
                onClick={() => { setMostrarOverride((v) => !v); setMostrarResolver(false); }}
                className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                Override
              </button>
            )}
          </div>
        )}
      </div>

      {mostrarResolver && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={textoResolucion}
            onChange={(e) => setTextoResolucion(e.target.value)}
            placeholder="Describe cómo se resolvió..."
            className="flex-1 text-xs px-2 py-1.5 rounded bg-black/30 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
          />
          <button
            onClick={handleResolver}
            className="text-xs px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 transition-colors font-medium"
          >
            Confirmar
          </button>
        </div>
      )}

      {mostrarOverride && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={textoJustificacion}
            onChange={(e) => setTextoJustificacion(e.target.value)}
            placeholder="Justificación para ignorar esta alerta..."
            className="flex-1 text-xs px-2 py-1.5 rounded bg-black/30 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
          />
          <button
            onClick={handleOverride}
            className="text-xs px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 transition-colors font-medium"
          >
            Confirmar override
          </button>
        </div>
      )}
    </div>
  );
}
