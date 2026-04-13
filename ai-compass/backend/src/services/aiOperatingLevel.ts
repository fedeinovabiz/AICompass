// ═══════════════��═════════════════════════════���
// AI OPERATING LEVEL — Cálculo en runtime
// ════════════════════════���═════════════════════

export type AiOperatingLevel = 1 | 2 | 3 | 4;

export interface AiLevelInput {
  pilots: Array<{
    status: string;
    implementationType: string | null;
    tool: string | null;
    departmentAreaId: string | null;
  }>;
  aiTools: Array<{
    status: string;
    category: string;
    teamsUsing: string[];
  }>;
  processes: Array<{
    status: string;
  }>;
  hasAgentGovernanceOwner: boolean;
}

export const AI_LEVEL_LABELS: Record<AiOperatingLevel, { en: string; es: string }> = {
  1: { en: 'AI as Thought Partner', es: 'IA como Asistente de Ideas' },
  2: { en: 'AI as Assistant', es: 'IA como Asistente Operativo' },
  3: { en: 'AI as Teammates', es: 'IA como Compañero de Equipo' },
  4: { en: 'AI as the System', es: 'IA como Sistema Operativo' },
};

export function calculateAiOperatingLevel(input: AiLevelInput): AiOperatingLevel {
  const { pilots, aiTools, processes, hasAgentGovernanceOwner } = input;

  const activePilots = pilots.filter(p =>
    ['active', 'scale', 'evaluating'].includes(p.status),
  );

  const hasCustomAgents = activePilots.some(
    p => p.implementationType === 'redesign' && p.tool && p.tool.length > 0,
  );

  const redesignCount = activePilots.filter(
    p => p.implementationType === 'redesign',
  ).length;

  const automatedProcessCount = processes.filter(p =>
    ['approved', 'implementing'].includes(p.status),
  ).length;

  const hasContextAwareTools = aiTools.some(
    t => t.status === 'active' && ['no-code', 'custom'].includes(t.category),
  );

  // Level 4: Multi-agent + procesos críticos + gobernanza
  if (redesignCount >= 3 && automatedProcessCount >= 2 && hasAgentGovernanceOwner) {
    return 4;
  }

  // Level 3: Agentes configurados con automatización recurrente
  if (hasCustomAgents && activePilots.length >= 1) {
    return 3;
  }

  // Level 2: Herramientas con contexto empresarial
  if (hasContextAwareTools || activePilots.length >= 1) {
    return 2;
  }

  // Level 1: Solo uso ad-hoc
  return 1;
}

export function calculateAiLevelForArea(
  areaId: string,
  input: AiLevelInput,
): AiOperatingLevel {
  const filtered: AiLevelInput = {
    ...input,
    pilots: input.pilots.filter(p => p.departmentAreaId === areaId),
  };

  if (filtered.pilots.length === 0) {
    return 1;
  }

  return calculateAiOperatingLevel(filtered);
}
