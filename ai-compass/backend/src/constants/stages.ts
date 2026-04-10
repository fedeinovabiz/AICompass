// ══════════════════════════════════════════════
// ETAPAS DEL ENGAGEMENT — BACKEND
// ══════════════════════════════════════════════

type Stage = 1 | 2 | 3 | 4 | 5;

export interface GovernanceExpectation {
  role: string;
  expectation: string;
}

export interface StageDefinition {
  number: Stage;
  name: string;
  description: string;
  objective: string;
  keyDeliverables: string[];
  typicalDuration: string;
  governanceExpectations: GovernanceExpectation[];
  entryConditions: string[];
  exitConditions: string[];
}

export const STAGES: StageDefinition[] = [
  {
    number: 1,
    name: 'Diagnóstico',
    description: 'Evaluación del estado actual de madurez de IA de la organización mediante sesiones de descubrimiento.',
    objective: 'Obtener un diagnóstico completo del nivel de madurez de IA en las 6 dimensiones clave.',
    keyDeliverables: [
      'Mapa de hallazgos por dimensión',
      'Informe de diagnóstico completo',
      'Identificación de quick wins',
      'Recomendación de conformación del comité',
    ],
    typicalDuration: '3-4 semanas',
    governanceExpectations: [
      { role: 'Sponsor Ejecutivo', expectation: 'Disponibilidad para sesión ejecutiva inicial (2h).' },
      { role: 'Líder Operativo', expectation: 'Participación en sesiones operativas y técnicas.' },
    ],
    entryConditions: ['Contrato firmado', 'Sponsor ejecutivo identificado'],
    exitConditions: [
      'Diagnóstico validado por el cliente',
      'Mínimo 3 sesiones completadas (ejecutiva, operativa, técnica)',
      'Todas las dimensiones evaluadas',
    ],
  },
  {
    number: 2,
    name: 'Constitución del Comité',
    description: 'Formación y activación del Comité de Transformación IA con roles, responsabilidades y decisiones fundacionales.',
    objective: 'Establecer la estructura de gobernanza interna que sostendrá la transformación IA.',
    keyDeliverables: [
      'Propuesta de comité con roles y perfiles',
      'Acta de constitución firmada',
      '8 decisiones fundacionales registradas',
      'Primer acta de reunión del comité',
    ],
    typicalDuration: '2-3 semanas',
    governanceExpectations: [
      { role: 'Sponsor Ejecutivo', expectation: 'Aprobar la conformación del comité y presidir la sesión de constitución.' },
      { role: 'Líder Operativo', expectation: 'Asumir rol de Líder Operativo de IA en el comité.' },
      { role: 'Representante de Negocio', expectation: 'Designar representantes por área de negocio clave.' },
      { role: 'Representante de IT', expectation: 'Asumir responsabilidad técnica de la transformación.' },
    ],
    entryConditions: [
      'Diagnóstico completado y validado',
      'Candidatos para el comité identificados en el diagnóstico',
    ],
    exitConditions: [
      'Comité formalmente constituido con acta firmada',
      '8 decisiones fundacionales respondidas',
      'Calendario de reuniones establecido',
    ],
  },
  {
    number: 3,
    name: 'Pilotos',
    description: 'Diseño, ejecución y evaluación de casos de uso piloto de IA con medición de resultados.',
    objective: 'Demostrar valor tangible y aprendizajes replicables a través de pilotos controlados.',
    keyDeliverables: [
      'Diseño detallado de pilotos seleccionados',
      'Métricas baseline y de seguimiento',
      'Informe de evaluación de pilotos',
      'Recomendación de escalamiento o pivote',
    ],
    typicalDuration: '6-12 semanas por piloto',
    governanceExpectations: [
      { role: 'Campeón del Piloto', expectation: 'Liderar la implementación y recopilar métricas semanalmente.' },
      { role: 'Comité de IA', expectation: 'Revisar avance quincenal y tomar decisión de escalar, iterar o descontinuar.' },
      { role: 'Sponsor Ejecutivo', expectation: 'Participar en sesión de evaluación final del piloto.' },
    ],
    entryConditions: [
      'Comité de IA constituido',
      'Al menos 1 quick win o caso de uso priorizado',
      'Baseline de métricas definido',
    ],
    exitConditions: [
      'Mínimo 1 piloto evaluado con decisión del comité',
      'Lecciones aprendidas documentadas',
      'Decisión de escalamiento tomada',
    ],
  },
  {
    number: 4,
    name: 'Escalamiento',
    description: 'Expansión de los pilotos exitosos y consolidación de capacidades de IA en la organización.',
    objective: 'Institucionalizar las prácticas de IA y escalar los casos de uso validados.',
    keyDeliverables: [
      'Plan de escalamiento por caso de uso',
      'Framework de habilitación interna',
      'Programa de formación expandido',
      'Actualización de procesos operativos',
    ],
    typicalDuration: '3-6 meses',
    governanceExpectations: [
      { role: 'Comité de IA', expectation: 'Sesiones mensuales de revisión de avance y toma de decisiones de inversión.' },
      { role: 'Líder de Cambio', expectation: 'Gestionar la adopción y comunicación interna del escalamiento.' },
      { role: 'IT', expectation: 'Asegurar infraestructura y seguridad para el escalamiento.' },
    ],
    entryConditions: [
      'Al menos 1 piloto con decisión de escalar',
      'Budget aprobado para escalamiento',
      'Equipo habilitado para operar la solución',
    ],
    exitConditions: [
      'Solución en producción con usuarios activos',
      'Métricas de adopción superiores al 60%',
      'Proceso de soporte operativo establecido',
    ],
  },
  {
    number: 5,
    name: 'Optimización Continua',
    description: 'Consolidación de la cultura de IA y ciclos de mejora continua para maximizar el valor.',
    objective: 'Establecer capacidades autónomas de innovación con IA dentro de la organización.',
    keyDeliverables: [
      'Centro de excelencia de IA (CoE) o equivalente',
      'Roadmap de innovación 12 meses',
      'Programa de embajadores internos de IA',
      'Informe de impacto y valor generado',
    ],
    typicalDuration: 'Ongoing (ciclos de 3 meses)',
    governanceExpectations: [
      { role: 'CoE de IA', expectation: 'Liderar la agenda de innovación y replicación de casos de uso.' },
      { role: 'Comité de IA', expectation: 'Revisión trimestral de estrategia y prioridades.' },
      { role: 'Toda la organización', expectation: 'Cultura de mejora continua con IA integrada en el ADN operativo.' },
    ],
    entryConditions: [
      'Mínimo 2 soluciones de IA en producción',
      'Equipo interno habilitado',
      'Comité de IA funcionando de manera autónoma',
    ],
    exitConditions: [
      'Organización autónoma en su gestión de IA',
      'Engagement formal concluido',
    ],
  },
];

export function getStageByNumber(number: Stage): StageDefinition | undefined {
  return STAGES.find(s => s.number === number);
}

export function getNextStage(current: Stage): StageDefinition | undefined {
  if (current >= 5) return undefined;
  return getStageByNumber((current + 1) as Stage);
}
