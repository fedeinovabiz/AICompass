// ══════════════════════════════════════════════
// RED FLAGS — REGLAS DE ALERTA — BACKEND
// ══════════════════════════════════════════════

type RedFlagSeverity = 'warning' | 'alert' | 'block';
type Stage = 1 | 2 | 3 | 4 | 5;

export interface RedFlagRule {
  id: string;
  severity: RedFlagSeverity;
  title: string;
  description: string;
  stage: Stage;
  condition: string;
  recommendation: string;
  canOverride: boolean;
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'RF01',
    severity: 'block',
    title: 'Sin sponsor ejecutivo identificado',
    description: 'No existe un responsable ejecutivo con autoridad para tomar decisiones y asignar recursos para la transformación IA.',
    stage: 1,
    condition: 'Después de la sesión ejecutiva no se ha identificado un sponsor con nivel mínimo de gerencia.',
    recommendation: 'Pausar el engagement hasta identificar y comprometer al sponsor ejecutivo. Sin este rol, la transformación no tiene viabilidad.',
    canOverride: false,
  },
  {
    id: 'RF02',
    severity: 'alert',
    title: 'Datos críticos en silos sin acceso',
    description: 'Los datos necesarios para los casos de uso priorizados están dispersos en silos o tienen restricciones de acceso que impiden su uso para IA.',
    stage: 1,
    condition: 'Dimensión de Datos con puntuación 1 en preguntas de accesibilidad y centralización.',
    recommendation: 'Incluir iniciativa de integración de datos como prerequisito antes de pilotos. Evaluar si los quick wins pueden operar con datos disponibles.',
    canOverride: true,
  },
  {
    id: 'RF03',
    severity: 'alert',
    title: 'Alta resistencia cultural al cambio',
    description: 'Se detecta resistencia significativa en el equipo hacia la adopción de IA, que puede comprometer la adopción de cualquier solución implementada.',
    stage: 1,
    condition: 'Dimensión de Cultura con puntuación 1. Múltiples participantes expresan miedo a sustitución o rechazo activo.',
    recommendation: 'Diseñar un plan de gestión del cambio antes de iniciar pilotos. Involucrar a los resistentes más activos como campeones potenciales.',
    canOverride: true,
  },
  {
    id: 'RF04',
    severity: 'warning',
    title: 'Procesos no documentados en área piloto',
    description: 'El proceso candidato a piloto no está documentado, lo que dificulta medir la línea base y diseñar la intervención de IA.',
    stage: 1,
    condition: 'Dimensión de Procesos con puntuación 1 en el área seleccionada para piloto.',
    recommendation: 'Dedicar 1-2 semanas a documentar el proceso actual antes de diseñar el piloto. Incluir en el scope del engagement.',
    canOverride: true,
  },
  {
    id: 'RF05',
    severity: 'block',
    title: 'Comité no constituido al iniciar pilotos',
    description: 'Se intenta avanzar a la fase de pilotos sin haber constituido formalmente el Comité de Transformación IA.',
    stage: 2,
    condition: 'Se quiere avanzar a Etapa 3 sin acta de constitución del comité firmada.',
    recommendation: 'Completar la constitución del comité antes de iniciar cualquier piloto. El comité es el órgano de gobernanza esencial para tomar decisiones sobre pilotos.',
    canOverride: false,
  },
  {
    id: 'RF06',
    severity: 'alert',
    title: 'Decisiones fundacionales sin consenso',
    description: 'Más de 3 de las 8 decisiones fundacionales no tienen respuesta consensuada, indicando falta de alineación en el comité.',
    stage: 2,
    condition: 'Menos de 5 decisiones fundacionales respondidas al finalizar la sesión de constitución.',
    recommendation: 'Programar sesión adicional de alineación ejecutiva antes de continuar. Las decisiones pendientes deben resolverse para dar coherencia a la estrategia.',
    canOverride: true,
  },
  {
    id: 'RF07',
    severity: 'warning',
    title: 'Campeón del piloto sin tiempo dedicado',
    description: 'El campeón designado para el piloto no tiene tiempo asignado formalmente, lo que pone en riesgo la ejecución y medición.',
    stage: 3,
    condition: 'El campeón del piloto no tiene al menos 20% de su tiempo (8h/semana) formalmente asignado.',
    recommendation: 'Negociar con el sponsor la liberación formal de tiempo para el campeón. Sin este compromiso, el piloto fracasará por falta de atención.',
    canOverride: true,
  },
  {
    id: 'RF08',
    severity: 'alert',
    title: 'Sin métricas baseline definidas antes del piloto',
    description: 'El piloto arranca sin métricas de línea base, lo que imposibilita medir el impacto real de la solución de IA.',
    stage: 3,
    condition: 'Se inicia la ejecución del piloto sin haber registrado valores baseline para todas las métricas definidas.',
    recommendation: 'Pausar el inicio del piloto hasta recopilar el baseline. Dedicar 1 semana a la medición inicial con el método actual.',
    canOverride: false,
  },
  {
    id: 'RF09',
    severity: 'alert',
    title: 'Adopción del piloto por debajo del 30%',
    description: 'A las 3 semanas de iniciado el piloto, menos del 30% de los usuarios objetivo están usando activamente la herramienta.',
    stage: 3,
    condition: 'Métrica de adopción < 30% a las 3 semanas de inicio del piloto.',
    recommendation: 'Investigar barreras de adopción. Revisar experiencia de usuario, formación adicional, incentivos y posibles ajustes al proceso de cambio.',
    canOverride: true,
  },
  {
    id: 'RF10',
    severity: 'block',
    title: 'Piloto sin decisión del comité al cumplir plazo',
    description: 'El piloto alcanzó su fecha de evaluación y el comité no ha tomado la decisión de escalar, iterar o descontinuar.',
    stage: 3,
    condition: 'La fecha de evaluación del piloto se cumplió y no hay decisión registrada del comité en los 5 días siguientes.',
    recommendation: 'Convocar sesión de emergencia del comité. Un piloto sin decisión genera confusión, desmotivación y pérdida de momento organizacional.',
    canOverride: false,
  },
  {
    id: 'RF11',
    severity: 'warning',
    title: 'Comité sin reuniones por más de 30 días',
    description: 'El Comité de Transformación IA no se ha reunido en más de 30 días, indicando pérdida de momentum y gobernanza.',
    stage: 2,
    condition: 'Más de 30 días sin reunión registrada del comité en cualquier etapa activa.',
    recommendation: 'Reagendar urgentemente reunión del comité. Si la ausencia es por causa mayor, considerar sesión virtual de 30 minutos mínimo.',
    canOverride: true,
  },
  {
    id: 'RF12',
    severity: 'block',
    title: 'Cimientos rotos: deuda técnica amplificada por IA',
    description: 'El piloto requiere integración con sistemas que el diagnóstico marcó como frágiles. La IA amplifica fallas existentes — resolver la deuda técnica antes de escalar.',
    stage: 3,
    condition: 'Score <=1 en dimensión de datos/tecnología Y piloto depende de integración con sistemas legado.',
    recommendation: 'Resolver la deuda técnica identificada en el diagnóstico antes de aprobar este piloto. Considerar un piloto que no dependa de integración con sistemas frágiles.',
    canOverride: true,
  },
  {
    id: 'RF13',
    severity: 'block',
    title: 'Automatizando el pasado sin rediseño',
    description: 'Este piloto digitaliza el proceso existente sin reimaginarlo. El objetivo final del usuario se puede lograr eliminando pasos intermedios.',
    stage: 3,
    condition: 'Piloto marcado como "digitalización directa" sin rediseño de proceso.',
    recommendation: 'Antes de automatizar, preguntar: ¿el resultado final se puede lograr de otra forma más directa? Usar el CUJ Mapper para reimaginar el journey completo.',
    canOverride: true,
  },
  {
    id: 'RF14',
    severity: 'block',
    title: 'Proliferación de agentes sin gobernanza (Agent Sprawl)',
    description: 'Hay múltiples agentes/automatizaciones en curso sin gobernanza centralizada. Riesgo de proliferación descontrolada.',
    stage: 3,
    condition: '3+ pilotos activos de tipo agente/automatización sin owner de gobernanza asignado en el comité.',
    recommendation: 'Asignar un owner de gobernanza de agentes en el comité antes de aprobar más pilotos. Revisar si hay pilotos duplicados atacando el mismo proceso.',
    canOverride: true,
  },
  {
    id: 'RF15',
    severity: 'warning',
    title: 'Piloto sin journey mapeado (CUJ)',
    description: 'Este piloto no tiene un journey mapeado. Para pilotos que involucran múltiples pasos o actores, mapear el CUJ antes de aprobar ayuda a evitar automatizar tareas aisladas.',
    stage: 3,
    condition: 'Piloto aprobado o activo sin CUJ vinculado.',
    recommendation: 'Mapear el Critical User Journey del proceso antes de continuar. Esto asegura que se diseña para el resultado final, no para tareas individuales.',
    canOverride: true,
  },
  {
    id: 'RF16',
    severity: 'warning',
    title: 'Impacto desproporcionado: bajo P&L para el esfuerzo',
    description: 'Este piloto tiene un impacto estimado bajo para su nivel de esfuerzo. Considerar si el ROI justifica la inversión.',
    stage: 3,
    condition: 'Impacto P&L < $5,000/año con esfuerzo M o mayor.',
    recommendation: 'Reevaluar la prioridad de este piloto frente a otros con mejor relación impacto/esfuerzo. Usar la Matriz de Value Engineering para comparar.',
    canOverride: true,
  },
  {
    id: 'RF17',
    severity: 'warning',
    title: 'Área con múltiples pilotos sin diagnóstico propio',
    description: 'Hay 2+ pilotos activos en un área cuya madurez se basa en scores heredados del baseline organizacional, no en un diagnóstico propio.',
    stage: 3,
    condition: '2+ pilotos activos/evaluating en un área con assessmentStatus = inherited.',
    recommendation: 'Realizar mini-assessment del área para validar que los scores organizacionales aplican. Un área puede estar significativamente por encima o por debajo del promedio.',
    canOverride: true,
  },
];

export function getRedFlagsByStage(stage: Stage): RedFlagRule[] {
  return RED_FLAG_RULES.filter(r => r.stage === stage);
}

export function getRedFlagById(id: string): RedFlagRule | undefined {
  return RED_FLAG_RULES.find(r => r.id === id);
}

export function getBlockingRedFlags(): RedFlagRule[] {
  return RED_FLAG_RULES.filter(r => r.severity === 'block');
}
