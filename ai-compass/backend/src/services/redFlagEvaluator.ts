// ══════════════════════════════════════════════
// RED FLAG EVALUATOR — Evaluación de alertas
// ══════════════════════════════════════════════

import { RED_FLAG_RULES } from '../constants/redFlags';

export interface OrgState {
  currentStage: number;
  maturityScores: Record<string, number | null>;
  sessions: Array<{
    type: string;
    status: string;
    participants: Array<{ role: string }>;
  }>;
  committee: {
    members: Array<{ role: string }>;
    decisions: Array<{ response: string }>;
    meetings: Array<{ attendees: string[] }>;
  } | null;
  pilots: Array<{
    status: string;
    baseline: unknown[];
    startDate: string | null;
    metrics: unknown[];
    implementationType: string | null;
    cujId: string | null;
    valuePnl: number | null;
    valueEffort: string | null;
  }>;
}

export interface ActiveRedFlag {
  ruleId: string;
  severity: string;
  title: string;
  description: string;
  stage: number;
}

function evaluarRF01(state: OrgState): boolean {
  // RF01: Sesión ejecutiva sin participante con rol "sponsor"
  const sesionesEjecutivas = state.sessions.filter((s) => s.type === 'ejecutiva');
  if (sesionesEjecutivas.length === 0) return false;
  return sesionesEjecutivas.some(
    (s) => !s.participants.some((p) => p.role === 'sponsor'),
  );
}

function evaluarRF02(_state: OrgState): boolean {
  // RF02: Contradicción detectada (placeholder — depende de IA)
  return false;
}

function evaluarRF03(state: OrgState): boolean {
  // RF03: 5+ dimensiones con score 1
  const dimensionesEnUno = Object.values(state.maturityScores).filter(
    (score) => score === 1,
  );
  return dimensionesEnUno.length >= 5;
}

function evaluarRF05(state: OrgState): boolean {
  // RF05: Comité sin operational-leader
  if (!state.committee) return false;
  return !state.committee.members.some((m) => m.role === 'operational-leader');
}

function evaluarRF06(state: OrgState): boolean {
  // RF06: Menos de 6 decisiones con respuesta
  if (!state.committee) return false;
  const conRespuesta = state.committee.decisions.filter(
    (d) => d.response && d.response.trim().length > 0,
  );
  return conRespuesta.length < 6;
}

function evaluarRF07(state: OrgState): boolean {
  // RF07: Más de 7 miembros en el comité
  if (!state.committee) return false;
  return state.committee.members.length > 7;
}

function evaluarRF08(state: OrgState): boolean {
  // RF08: Piloto activo sin baseline
  const pilotosActivos = state.pilots.filter((p) => p.status === 'active');
  return pilotosActivos.some(
    (p) => !p.baseline || p.baseline.length === 0,
  );
}

function evaluarRF09(state: OrgState): boolean {
  // RF09: Piloto activo más de 8 semanas sin decisión del comité
  const ocho_semanas_ms = 8 * 7 * 24 * 60 * 60 * 1000;
  return state.pilots.some((p) => {
    if (p.status !== 'active' || !p.startDate) return false;
    const inicio = new Date(p.startDate).getTime();
    const ahora = Date.now();
    return ahora - inicio > ocho_semanas_ms;
  });
}

function evaluarRF10(state: OrgState): boolean {
  // RF10: Adopción < 30% a 4 semanas del inicio
  const cuatro_semanas_ms = 4 * 7 * 24 * 60 * 60 * 1000;
  return state.pilots.some((p) => {
    if (p.status !== 'active' || !p.startDate) return false;
    const inicio = new Date(p.startDate).getTime();
    const ahora = Date.now();
    if (ahora - inicio < cuatro_semanas_ms) return false;

    // Verificar si las métricas indican adopción < 30%
    const metricas = p.metrics as Array<{ adoptionMetrics?: { activePercentage?: number } }>;
    if (metricas.length === 0) return false;
    const ultima = metricas[metricas.length - 1];
    const adopcion = ultima?.adoptionMetrics?.activePercentage ?? null;
    return adopcion !== null && adopcion < 30;
  });
}

function evaluarRF11(state: OrgState): boolean {
  // RF11: Más de 5 pilotos activos simultáneamente
  const activos = state.pilots.filter((p) => p.status === 'active');
  return activos.length > 5;
}

function evaluarRF_SponsorAusente(state: OrgState): boolean {
  // RF05 adicional: Sponsor ausente > 2 reuniones del comité
  if (!state.committee) return false;
  const reuniones = state.committee.meetings;
  if (reuniones.length < 3) return false;
  const ultimasTres = reuniones.slice(-3);
  const sinSponsor = ultimasTres.filter(
    (r) => !r.attendees.includes('sponsor'),
  );
  return sinSponsor.length > 2;
}

function evaluarRF12(state: OrgState): boolean {
  // RF12: Cimientos rotos — score <=1 en datos/tecnología + piloto activo
  const datosScore = state.maturityScores['datos'] ?? 0;
  const techScore = state.maturityScores['tecnologia'] ?? 0;
  const cimientosFragiles = datosScore <= 1 || techScore <= 1;
  if (!cimientosFragiles) return false;
  const pilotosActivos = state.pilots.filter(
    (p) => p.status === 'active' || p.status === 'designing',
  );
  return pilotosActivos.length > 0;
}

function evaluarRF13(state: OrgState): boolean {
  // RF13: Automatizando el pasado — piloto tipo "digitalization"
  return state.pilots.some(
    (p) =>
      (p.status === 'designing' || p.status === 'active') &&
      p.implementationType === 'digitalization',
  );
}

function evaluarRF14(state: OrgState): boolean {
  // RF14: Agent Sprawl — 3+ pilotos activos sin owner de gobernanza
  const pilotosActivos = state.pilots.filter(
    (p) => p.status === 'active' || p.status === 'designing',
  );
  if (pilotosActivos.length < 3) return false;
  if (!state.committee) return true;
  const tieneOwnerGobernanza = state.committee.members.some(
    (m) => m.role === 'it-rep' || m.role === 'operational-leader',
  );
  return !tieneOwnerGobernanza;
}

function evaluarRF15(state: OrgState): boolean {
  // RF15: Piloto sin CUJ vinculado
  return state.pilots.some(
    (p) =>
      (p.status === 'active' || p.status === 'evaluating') &&
      !p.cujId,
  );
}

function evaluarRF16(state: OrgState): boolean {
  // RF16: Bajo P&L para el esfuerzo
  return state.pilots.some(
    (p) =>
      p.valuePnl !== null &&
      p.valuePnl < 5000 &&
      p.valueEffort !== null &&
      ['M', 'L', 'XL'].includes(p.valueEffort),
  );
}

// Mapa de evaluadores por ruleId (usando IDs del archivo de constantes)
type Evaluador = (state: OrgState) => boolean;

const EVALUADORES: Record<string, Evaluador> = {
  RF01: evaluarRF01,       // Sin sponsor ejecutivo identificado
  RF02: evaluarRF02,       // Datos en silos (placeholder - depende de IA)
  RF03: evaluarRF03,       // Alta resistencia cultural (5+ dimensiones en 1)
  // RF04: sin evaluador automatico (procesos no documentados - requiere revision manual)
  RF05: evaluarRF05,       // Comite no constituido (sin operational-leader)
  RF06: evaluarRF06,       // Decisiones fundacionales sin consenso
  RF07: evaluarRF07,       // Champion sin tiempo dedicado (>7 miembros como proxy)
  RF08: evaluarRF08,       // Sin metricas baseline antes del piloto
  RF09: evaluarRF10,       // Adopcion del piloto por debajo del 30%
  RF10: evaluarRF09,       // Piloto sin decision del comite al cumplir plazo
  RF11: evaluarRF_SponsorAusente, // Comite sin reuniones por mas de 30 dias
  RF12: evaluarRF12,      // Cimientos rotos (deuda técnica + IA)
  RF13: evaluarRF13,      // Automatizando el pasado
  RF14: evaluarRF14,      // Agent Sprawl
  RF15: evaluarRF15,      // Piloto sin CUJ
  RF16: evaluarRF16,      // Bajo P&L para esfuerzo
};

export function evaluateRedFlags(orgState: OrgState): ActiveRedFlag[] {
  const activos: ActiveRedFlag[] = [];

  for (const rule of RED_FLAG_RULES) {
    const evaluador = EVALUADORES[rule.id];
    if (!evaluador) continue;

    const disparado = evaluador(orgState);
    if (disparado) {
      activos.push({
        ruleId: rule.id,
        severity: rule.severity,
        title: rule.title,
        description: rule.description,
        stage: rule.stage,
      });
    }
  }

  return activos;
}
