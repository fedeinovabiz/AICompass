import type { Stage } from '@/types';

export interface StageCriterion {
  id: string;
  description: string;
}

export interface StageDefinition {
  stage: Stage;
  name: string;
  duration: string;
  focus: string;
  advanceCriteria: StageCriterion[];
  governanceExpectations: string[];
}

export const STAGES: StageDefinition[] = [
  {
    stage: 1,
    name: 'Diagnóstico y Comité',
    duration: 'Semanas 1-3',
    focus: 'Evaluar madurez, formar AI Council',
    advanceCriteria: [
      { id: 'S1-01', description: '3 sesiones de Discovery completadas y validadas' },
      { id: 'S1-02', description: 'Comité constituido con roles asignados' },
      { id: 'S1-03', description: '8 decisiones fundacionales documentadas' },
      { id: 'S1-04', description: 'Líder operativo tiene agenda para descubrimiento' },
    ],
    governanceExpectations: [
      'Definir qué datos NO usar con IA externa',
      'Comunicar posición oficial sobre uso de IA',
      'Identificar quién decide sobre IA',
    ],
  },
  {
    stage: 2,
    name: 'Descubrimiento y Priorización',
    duration: 'Semanas 3-5',
    focus: 'Deep dives, quick wins, presentación final',
    advanceCriteria: [
      { id: 'S2-01', description: 'Deep dives completados' },
      { id: 'S2-02', description: 'Presentación final realizada al comité' },
      { id: 'S2-03', description: '2-3 quick wins priorizados con diseño de piloto' },
      { id: 'S2-04', description: 'Herramienta seleccionada y equipo comprometido' },
    ],
    governanceExpectations: [
      'Comité constituido con sponsor y líder operativo',
      '8 decisiones fundacionales documentadas',
      'Política de uso aceptable escrita',
    ],
  },
  {
    stage: 3,
    name: 'Pilotos y Quick Wins',
    duration: 'Meses 1-3',
    focus: 'Ejecutar pilotos, medir impacto, decidir',
    advanceCriteria: [
      { id: 'S3-01', description: 'Al menos 1 piloto con impacto medible' },
      { id: 'S3-02', description: 'Decisión del comité de escalar documentada' },
      { id: 'S3-03', description: 'Historia de éxito comunicable internamente' },
    ],
    governanceExpectations: [
      'Baseline obligatorio antes de activar piloto',
      'Tracking semanal de métricas de impacto Y adopción',
      'Champions asignados con responsabilidades claras',
      'Red flags activos y monitoreados',
    ],
  },
  {
    stage: 4,
    name: 'Escalamiento y Rediseño',
    duration: 'Meses 3-9',
    focus: 'Escalar lo exitoso, rediseñar flujos',
    advanceCriteria: [],
    governanceExpectations: [
      'Estándares centrales con aprobaciones delegadas a líderes de área',
      'Monitoreo automatizado de uso',
      'Auditorías periódicas de herramientas de IA',
    ],
  },
  {
    stage: 5,
    name: 'Transformación AI-First',
    duration: 'Meses 9-18+',
    focus: 'Agentes, CoE, modelo operativo',
    advanceCriteria: [],
    governanceExpectations: [
      'Centro de Excelencia operando',
      'Gobernanza ágil descentralizada',
      'Monitoreo de cumplimiento en tiempo real',
      'Gestión predictiva de riesgos',
    ],
  },
];
