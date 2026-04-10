// ══════════════════════════════════════════════
// PREGUNTAS DEL DIAGNÓSTICO — BACKEND
// ══════════════════════════════════════════════

type DimensionKey = 'estrategia' | 'procesos' | 'datos' | 'tecnologia' | 'cultura' | 'gobernanza';
type SessionType = 'ejecutiva' | 'operativa' | 'tecnica' | 'constitucion' | 'deep-dive' | 'presentacion';

export interface DiagnosticQuestion {
  id: string;
  dimension: DimensionKey;
  text: string;
  hint: string;
  sessionTypes: SessionType[];
  weight: number;
}

export const QUESTIONS: DiagnosticQuestion[] = [
  // ── ESTRATEGIA ──────────────────────────────
  {
    id: 'E01',
    dimension: 'estrategia',
    text: '¿Existe una visión documentada de cómo la IA apoyará los objetivos de negocio en los próximos 2-3 años?',
    hint: 'Buscar: documento de estrategia, roadmap, OKRs relacionados con IA, presentación a directivos.',
    sessionTypes: ['ejecutiva'],
    weight: 1.5,
  },
  {
    id: 'E02',
    dimension: 'estrategia',
    text: '¿Cuáles son los 3 procesos o áreas de negocio donde la organización prioriza implementar IA primero y por qué?',
    hint: 'Buscar: criterios de priorización, impacto esperado, iniciativas en curso o planificadas.',
    sessionTypes: ['ejecutiva', 'operativa'],
    weight: 1.2,
  },
  {
    id: 'E03',
    dimension: 'estrategia',
    text: '¿Cómo se mide actualmente el retorno de inversión esperado o alcanzado de las iniciativas de IA?',
    hint: 'Buscar: KPIs de negocio, métricas de eficiencia, casos de negocio formales, reportes de valor.',
    sessionTypes: ['ejecutiva'],
    weight: 1.0,
  },
  {
    id: 'E04',
    dimension: 'estrategia',
    text: '¿Quién es el responsable ejecutivo (sponsor) de las iniciativas de IA y qué nivel de autoridad tiene?',
    hint: 'Buscar: nombre, cargo, capacidad de asignar presupuesto y recursos, tiempo dedicado.',
    sessionTypes: ['ejecutiva'],
    weight: 1.3,
  },

  // ── PROCESOS ─────────────────────────────────
  {
    id: 'P01',
    dimension: 'procesos',
    text: '¿Cuáles son los procesos operativos más repetitivos o intensivos en tiempo que generan mayor fricción hoy?',
    hint: 'Buscar: quejas frecuentes del equipo, procesos con alta carga manual, cuellos de botella documentados.',
    sessionTypes: ['operativa', 'ejecutiva'],
    weight: 1.4,
  },
  {
    id: 'P02',
    dimension: 'procesos',
    text: '¿Los procesos clave están documentados, actualizados y son accesibles para todo el equipo?',
    hint: 'Buscar: manuales, wikis, SOPs, fecha de última actualización, conocimiento tácito vs. explícito.',
    sessionTypes: ['operativa'],
    weight: 1.1,
  },
  {
    id: 'P03',
    dimension: 'procesos',
    text: '¿Existe algún proceso donde ya se use IA o automatización y qué resultados ha dado?',
    hint: 'Buscar: herramientas como Zapier, RPA, Copilot, ChatGPT en uso, resultados medidos.',
    sessionTypes: ['operativa', 'tecnica'],
    weight: 1.2,
  },
  {
    id: 'P04',
    dimension: 'procesos',
    text: '¿Cómo se gestiona actualmente el control de calidad y la validación en los procesos críticos?',
    hint: 'Buscar: checkpoints, revisiones manuales, tasas de error, auditorías, protocolos de aprobación.',
    sessionTypes: ['operativa'],
    weight: 0.9,
  },

  // ── DATOS ────────────────────────────────────
  {
    id: 'D01',
    dimension: 'datos',
    text: '¿Dónde viven los datos más importantes de la organización y quién tiene acceso a ellos?',
    hint: 'Buscar: sistemas CRM, ERP, bases de datos, hojas de cálculo, silos, permisos de acceso.',
    sessionTypes: ['tecnica', 'operativa'],
    weight: 1.5,
  },
  {
    id: 'D02',
    dimension: 'datos',
    text: '¿Cuál es la calidad actual de los datos: están limpios, actualizados y son consistentes?',
    hint: 'Buscar: duplicados, datos faltantes, inconsistencias entre sistemas, procesos de limpieza.',
    sessionTypes: ['tecnica'],
    weight: 1.3,
  },
  {
    id: 'D03',
    dimension: 'datos',
    text: '¿Existe alguna política o práctica formal de gobierno de datos (propietarios, diccionario, retención)?',
    hint: 'Buscar: data owner definido, catálogo de datos, políticas de privacidad y retención, RGPD.',
    sessionTypes: ['tecnica', 'ejecutiva'],
    weight: 1.2,
  },
  {
    id: 'D04',
    dimension: 'datos',
    text: '¿Cómo se recopilan, almacenan y procesan los datos generados por las operaciones diarias?',
    hint: 'Buscar: pipelines de datos, ETL, data warehouse, logs de sistemas, automatización de captura.',
    sessionTypes: ['tecnica'],
    weight: 1.0,
  },

  // ── TECNOLOGÍA ───────────────────────────────
  {
    id: 'T01',
    dimension: 'tecnologia',
    text: '¿Qué herramientas o plataformas de IA/ML están actualmente en uso o en evaluación?',
    hint: 'Buscar: licencias de Copilot, OpenAI, Azure AI, Google Cloud AI, herramientas no-code de IA.',
    sessionTypes: ['tecnica'],
    weight: 1.3,
  },
  {
    id: 'T02',
    dimension: 'tecnologia',
    text: '¿Cuál es el estado de la infraestructura tecnológica: on-premise, cloud o híbrida?',
    hint: 'Buscar: proveedor de nube, capacidades de cómputo, latencia, escalabilidad, deuda técnica.',
    sessionTypes: ['tecnica'],
    weight: 1.1,
  },
  {
    id: 'T03',
    dimension: 'tecnologia',
    text: '¿Existe capacidad interna para desarrollar, integrar o mantener soluciones de IA?',
    hint: 'Buscar: equipo de IT/desarrollo, roles de data scientist o ML engineer, contratistas externos.',
    sessionTypes: ['tecnica', 'ejecutiva'],
    weight: 1.4,
  },

  // ── CULTURA ──────────────────────────────────
  {
    id: 'C01',
    dimension: 'cultura',
    text: '¿Cómo reacciona el equipo ante la perspectiva de adoptar herramientas de IA en su trabajo diario?',
    hint: 'Buscar: entusiasmo, escepticismo, miedo a sustitución, experiencias previas con cambios tecnológicos.',
    sessionTypes: ['ejecutiva', 'operativa'],
    weight: 1.4,
  },
  {
    id: 'C02',
    dimension: 'cultura',
    text: '¿Existen iniciativas o personas internas que estén explorando o promoviendo el uso de IA de manera informal?',
    hint: 'Buscar: campeones internos, experimentos no autorizados, grupos de interés, proyectos skunkworks.',
    sessionTypes: ['operativa', 'ejecutiva'],
    weight: 1.2,
  },
  {
    id: 'C03',
    dimension: 'cultura',
    text: '¿Qué programas de formación o capacitación en IA existen actualmente o están planificados?',
    hint: 'Buscar: cursos, talleres, certificaciones, presupuesto de formación, plataformas de e-learning.',
    sessionTypes: ['ejecutiva', 'operativa'],
    weight: 1.0,
  },

  // ── GOBERNANZA ───────────────────────────────
  {
    id: 'G01',
    dimension: 'gobernanza',
    text: '¿Existe algún comité, grupo de trabajo o estructura formal para supervisar las iniciativas de IA?',
    hint: 'Buscar: comité de IA, steering committee, roles de IA Ethics Officer, revisiones de proyecto.',
    sessionTypes: ['ejecutiva'],
    weight: 1.5,
  },
  {
    id: 'G02',
    dimension: 'gobernanza',
    text: '¿Cuáles son las políticas o lineamientos actuales sobre el uso responsable de IA en la organización?',
    hint: 'Buscar: política de uso de IA, guías de ética, restricciones sobre datos sensibles, revisión de sesgos.',
    sessionTypes: ['ejecutiva', 'tecnica'],
    weight: 1.3,
  },
];

export function getQuestionsForSession(sessionType: SessionType): DiagnosticQuestion[] {
  return QUESTIONS.filter(q => q.sessionTypes.includes(sessionType));
}

export function getQuestionById(id: string): DiagnosticQuestion | undefined {
  return QUESTIONS.find(q => q.id === id);
}

export function getQuestionsByDimension(dimension: DimensionKey): DiagnosticQuestion[] {
  return QUESTIONS.filter(q => q.dimension === dimension);
}
