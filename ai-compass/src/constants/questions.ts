import type { SessionType, DimensionKey } from '@/types';

export interface QuestionDefinition {
  id: string;
  sessionType: SessionType;
  dimension: DimensionKey;
  text: string;
  probeQuestions: string[];
}

export const QUESTIONS: QuestionDefinition[] = [
  // S1: VISIÓN EJECUTIVA — Estrategia
  {
    id: 'S1-EST-01',
    sessionType: 'ejecutiva',
    dimension: 'estrategia',
    text: '¿Cómo encaja la IA en la visión estratégica de la organización a 2-3 años?',
    probeQuestions: ['¿Hay un objetivo concreto o es una aspiración general?', '¿Qué resultados de negocio espera que la IA impulse?'],
  },
  {
    id: 'S1-EST-02',
    sessionType: 'ejecutiva',
    dimension: 'estrategia',
    text: '¿Hay presupuesto asignado específicamente para iniciativas de IA?',
    probeQuestions: ['¿Es un presupuesto recurrente o puntual?', '¿Quién tiene la autoridad para aprobar inversiones en IA?'],
  },
  {
    id: 'S1-EST-03',
    sessionType: 'ejecutiva',
    dimension: 'estrategia',
    text: '¿El liderazgo senior usa IA activamente en su trabajo diario?',
    probeQuestions: ['¿Puede dar un ejemplo de cómo usted usa IA esta semana?', '¿Sus reportes directos lo ven usando IA?'],
  },
  // S1: VISIÓN EJECUTIVA — Gobernanza
  {
    id: 'S1-GOB-01',
    sessionType: 'ejecutiva',
    dimension: 'gobernanza',
    text: '¿Existe alguna política sobre el uso de herramientas de IA en la organización?',
    probeQuestions: ['¿La gente sabe qué puede y qué no puede hacer con IA?', '¿Se ha comunicado alguna posición oficial?'],
  },
  {
    id: 'S1-GOB-02',
    sessionType: 'ejecutiva',
    dimension: 'gobernanza',
    text: '¿Qué información consideran confidencial y que no debería alimentar modelos externos?',
    probeQuestions: ['¿Tienen clasificación de datos definida?', '¿Hay restricciones regulatorias que apliquen?'],
  },
  {
    id: 'S1-GOB-03',
    sessionType: 'ejecutiva',
    dimension: 'gobernanza',
    text: '¿Cómo medirían el éxito de adoptar IA? ¿Qué significaría "funcionó"?',
    probeQuestions: ['¿Es subir ventas, bajar costos, o mejorar experiencia del usuario?', '¿Tienen métricas actuales contra las que comparar?'],
  },
  // S2: REALIDAD OPERATIVA — Procesos
  {
    id: 'S2-PRO-01',
    sessionType: 'operativa',
    dimension: 'procesos',
    text: '¿Qué tarea les consume más tiempo de manera repetitiva?',
    probeQuestions: ['¿Con qué frecuencia se hace?', '¿Cuántas personas están involucradas?'],
  },
  {
    id: 'S2-PRO-02',
    sessionType: 'operativa',
    dimension: 'procesos',
    text: '¿Dónde sienten que están haciendo trabajo que no requiere su criterio profesional?',
    probeQuestions: ['¿Qué porcentaje de su día es trabajo mecánico vs. criterio experto?', '¿Hay tareas que "cualquiera podría hacer" pero las hace el equipo senior?'],
  },
  {
    id: 'S2-PRO-03',
    sessionType: 'operativa',
    dimension: 'procesos',
    text: '¿Los procesos clave están documentados o viven en la cabeza de las personas?',
    probeQuestions: ['¿Si alguien clave se va mañana, qué se pierde?', '¿Un nuevo empleado puede entender cómo hacer la tarea sin preguntar?'],
  },
  {
    id: 'S2-PRO-04',
    sessionType: 'operativa',
    dimension: 'procesos',
    text: '¿De los procesos que mencionaron, cuáles se hacen 100% en computadora y cuáles requieren presencia física?',
    probeQuestions: ['¿El trabajo remoto es viable para esta tarea?', '¿Qué porcentaje del equipo trabaja remoto vs presencial?'],
  },
  {
    id: 'S2-PRO-05',
    sessionType: 'operativa',
    dimension: 'procesos',
    text: '¿Si tuvieran que clasificar sus tareas en tres niveles — las que se resuelven con una conversación con ChatGPT, las que necesitan una automatización tipo workflow, y las que necesitan desarrollo técnico custom — dónde cae cada una?',
    probeQuestions: ['¿Alguien del equipo ya usa herramientas no-code como Make o Zapier?', '¿Tienen desarrolladores internos o dependen de proveedores?'],
  },
  // S2: REALIDAD OPERATIVA — Cultura
  {
    id: 'S2-CUL-01',
    sessionType: 'operativa',
    dimension: 'cultura',
    text: '¿Alguien en su equipo ya usa herramientas de IA por cuenta propia?',
    probeQuestions: ['¿Qué herramientas? ¿Para qué tareas?', '¿Lo hacen abiertamente o "a escondidas"?'],
  },
  {
    id: 'S2-CUL-02',
    sessionType: 'operativa',
    dimension: 'cultura',
    text: '¿Cómo reacciona el equipo cuando se habla de incorporar IA al trabajo?',
    probeQuestions: ['¿Hay entusiasmo, indiferencia o miedo?', '¿Alguien ha expresado preocupación por su puesto?'],
  },
  {
    id: 'S2-CUL-03',
    sessionType: 'operativa',
    dimension: 'cultura',
    text: '¿Qué información necesitan frecuentemente que les cuesta conseguir?',
    probeQuestions: ['¿Cuánto tiempo pierden buscando información dispersa?', '¿De cuántas fuentes diferentes necesitan consolidar datos?'],
  },
  // S3: CAPACIDAD TÉCNICA — Tecnología
  {
    id: 'S3-TEC-01',
    sessionType: 'tecnica',
    dimension: 'tecnologia',
    text: '¿Qué suite de productividad usa la organización (Microsoft 365, Google Workspace, otra)?',
    probeQuestions: ['¿Qué plan/licencia tienen?', '¿Hay herramientas adicionales específicas por área?'],
  },
  {
    id: 'S3-TEC-02',
    sessionType: 'tecnica',
    dimension: 'tecnologia',
    text: '¿Tienen infraestructura cloud? ¿Cuál y para qué la usan?',
    probeQuestions: ['¿Azure, AWS, GCP? ¿On-premise?', '¿Qué tan madura es la adopción cloud?'],
  },
  {
    id: 'S3-TEC-03',
    sessionType: 'tecnica',
    dimension: 'tecnologia',
    text: '¿Hay herramientas de IA ya licenciadas o en evaluación?',
    probeQuestions: ['¿Copilot, ChatGPT Team, Claude, Gemini?', '¿Cuántas licencias? ¿Quién las usa?'],
  },
  // S3: CAPACIDAD TÉCNICA — Datos
  {
    id: 'S3-DAT-01',
    sessionType: 'tecnica',
    dimension: 'datos',
    text: '¿Dónde vive la información crítica del negocio?',
    probeQuestions: ['¿ERP, CRM, SharePoint, carpetas compartidas, emails?', '¿Hay una fuente de verdad o hay datos duplicados en múltiples sistemas?'],
  },
  {
    id: 'S3-DAT-02',
    sessionType: 'tecnica',
    dimension: 'datos',
    text: '¿Existe gobernanza de datos? ¿Quién puede acceder a qué?',
    probeQuestions: ['¿Hay roles y permisos definidos?', '¿Se audita el acceso a información sensible?'],
  },
  {
    id: 'S3-DAT-03',
    sessionType: 'tecnica',
    dimension: 'datos',
    text: '¿Cómo calificaría la calidad de los datos de la organización?',
    probeQuestions: ['¿Los datos están actualizados? ¿Son consistentes entre sistemas?', '¿Hay procesos de limpieza o validación de datos?'],
  },
];

export function getQuestionsForSession(sessionType: SessionType): QuestionDefinition[] {
  return QUESTIONS.filter((q) => q.sessionType === sessionType);
}

export function getQuestionsForDimension(dimension: DimensionKey): QuestionDefinition[] {
  return QUESTIONS.filter((q) => q.dimension === dimension);
}
