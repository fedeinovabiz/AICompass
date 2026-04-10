// ══════════════════════════════════════════════
// DIMENSIONES DE MADUREZ IA — BACKEND
// ══════════════════════════════════════════════

type DimensionKey = 'estrategia' | 'procesos' | 'datos' | 'tecnologia' | 'cultura' | 'gobernanza';
type MaturityLevel = 1 | 2 | 3 | 4;

export interface DimensionDefinition {
  key: DimensionKey;
  name: string;
  description: string;
  levels: Record<MaturityLevel, string>;
}

export const DIMENSIONS: DimensionDefinition[] = [
  {
    key: 'estrategia',
    name: 'Estrategia',
    description: 'Visión, objetivos y hoja de ruta para adopción de IA en la organización.',
    levels: {
      1: 'Sin estrategia formal de IA. Iniciativas aisladas sin alineación con objetivos de negocio.',
      2: 'Estrategia emergente con algunos objetivos definidos, pero sin prioridades claras ni hoja de ruta.',
      3: 'Estrategia documentada con prioridades definidas y alineación con objetivos de negocio. KPIs establecidos.',
      4: 'Estrategia de IA madura, integrada en la planificación corporativa con revisiones periódicas y modelo de valor claro.',
    },
  },
  {
    key: 'procesos',
    name: 'Procesos',
    description: 'Nivel de documentación, estandarización y automatización de procesos clave.',
    levels: {
      1: 'Procesos no documentados o documentación obsoleta. Dependencia alta en conocimiento individual.',
      2: 'Procesos parcialmente documentados. Algunos flujos estandarizados pero con inconsistencias.',
      3: 'Procesos documentados y estandarizados. Flujos claros con responsables definidos y métricas básicas.',
      4: 'Procesos optimizados con mejora continua. Automatización parcial y análisis de datos para decisiones.',
    },
  },
  {
    key: 'datos',
    name: 'Datos',
    description: 'Calidad, accesibilidad, gobernanza y aprovechamiento de datos para IA.',
    levels: {
      1: 'Datos dispersos en silos. Sin gobierno de datos. Calidad inconsistente y baja accesibilidad.',
      2: 'Datos parcialmente centralizados. Iniciativas aisladas de calidad. Sin gobierno formal.',
      3: 'Arquitectura de datos definida. Gobierno básico implementado. Pipelines establecidos para casos de uso clave.',
      4: 'Datos como activo estratégico. Gobierno maduro. Calidad alta y accesibilidad para toda la organización.',
    },
  },
  {
    key: 'tecnologia',
    name: 'Tecnología',
    description: 'Infraestructura, herramientas y capacidades técnicas para implementar IA.',
    levels: {
      1: 'Infraestructura tecnológica básica. Sin herramientas de IA. Deuda técnica significativa.',
      2: 'Herramientas de IA experimentales en uso. Infraestructura en desarrollo. Integración limitada.',
      3: 'Stack tecnológico definido para IA. Integraciones funcionales. MLOps básico implementado.',
      4: 'Infraestructura robusta y escalable. MLOps maduro. Experimentación continua con tecnologías emergentes.',
    },
  },
  {
    key: 'cultura',
    name: 'Cultura',
    description: 'Mentalidad, adopción, resistencia al cambio y capacitación del equipo.',
    levels: {
      1: 'Alta resistencia al cambio. Sin cultura de datos. Formación en IA inexistente o muy limitada.',
      2: 'Curiosidad incipiente hacia IA. Algunos campeones internos. Formación básica en curso.',
      3: 'Cultura de experimentación establecida. Campeones activos. Programa de formación estructurado.',
      4: 'IA integrada en la cultura organizacional. Aprendizaje continuo. Innovación interna frecuente.',
    },
  },
  {
    key: 'gobernanza',
    name: 'Gobernanza',
    description: 'Estructura de toma de decisiones, políticas éticas y gestión de riesgos de IA.',
    levels: {
      1: 'Sin estructura de gobernanza de IA. Decisiones ad-hoc. Riesgos no identificados ni gestionados.',
      2: 'Gobernanza informal. Algunos roles definidos. Políticas básicas en desarrollo.',
      3: 'Comité de IA constituido. Políticas de uso responsable documentadas. Procesos de revisión establecidos.',
      4: 'Gobernanza madura con comité activo. Ética de IA operacionalizada. Auditorías periódicas y mejora continua.',
    },
  },
];

export const DIMENSION_KEYS: DimensionKey[] = DIMENSIONS.map(d => d.key);

export function getDimensionByKey(key: DimensionKey): DimensionDefinition | undefined {
  return DIMENSIONS.find(d => d.key === key);
}
