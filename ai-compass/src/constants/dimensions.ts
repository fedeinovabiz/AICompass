import type { DimensionKey, MaturityLevel } from '@/types';

export interface DimensionDefinition {
  key: DimensionKey;
  name: string;
  description: string;
  levels: Record<MaturityLevel, string>;
}

export const DIMENSIONS: DimensionDefinition[] = [
  {
    key: 'estrategia',
    name: 'Estrategia e IA',
    description: 'Visión de IA en el negocio, presupuesto, liderazgo',
    levels: {
      1: 'No existe visión de IA. No hay presupuesto ni conversación al respecto.',
      2: 'Se reconoce la necesidad pero no hay plan concreto. Presupuesto ad hoc.',
      3: 'Hay una estrategia documentada con presupuesto asignado y objetivos medibles.',
      4: 'IA está integrada en la estrategia de negocio. El liderazgo hace role modeling activo.',
    },
  },
  {
    key: 'procesos',
    name: 'Procesos',
    description: 'Documentación, flujos de trabajo, candidatos a automatización',
    levels: {
      1: 'Los procesos viven en la cabeza de las personas. No hay documentación.',
      2: 'Algunos procesos están documentados de manera informal o incompleta.',
      3: 'Procesos clave documentados y estandarizados. Se identifican candidatos a automatización.',
      4: 'Procesos rediseñados con IA integrada. Puntos de validación humana definidos.',
    },
  },
  {
    key: 'datos',
    name: 'Datos',
    description: 'Centralización, gobernanza, calidad, accesibilidad',
    levels: {
      1: 'Información dispersa en spreadsheets, emails y carpetas personales.',
      2: 'Algunos datos centralizados pero sin gobernanza de acceso ni calidad.',
      3: 'Datos centralizados con gobernanza básica. Se sabe quién accede a qué.',
      4: 'Datos como activo estratégico. Infraestructura optimizada para alimentar modelos de IA.',
    },
  },
  {
    key: 'tecnologia',
    name: 'Tecnología',
    description: 'Herramientas actuales, infraestructura cloud, capacidad de integración',
    levels: {
      1: 'Herramientas básicas de productividad. Sin infraestructura cloud.',
      2: 'Herramientas de productividad modernas (M365/Google). Cloud básico.',
      3: 'Plataforma de IA seleccionada e integrada. Múltiples herramientas en uso.',
      4: 'Plataformas de orquestación de agentes. Integraciones avanzadas (MCP, APIs).',
    },
  },
  {
    key: 'cultura',
    name: 'Cultura y Personas',
    description: 'Mentalidad de crecimiento, resistencia al cambio, role modeling del liderazgo',
    levels: {
      1: 'Resistencia al cambio. Uso de IA visto como "trampa" o amenaza.',
      2: 'Curiosidad incipiente. Algunos usan IA por cuenta propia de manera informal.',
      3: 'Cultura de experimentación. Red de Champions activa. Show & tell regular.',
      4: 'IA como parte de la identidad organizacional. Aprendizaje continuo como norma.',
    },
  },
  {
    key: 'gobernanza',
    name: 'Gobernanza',
    description: 'Políticas de uso, framework de IA Responsable, medición de impacto',
    levels: {
      1: 'No existen políticas de uso de IA. Sin control ni medición.',
      2: 'Política mínima viable. Reglas básicas de qué datos no usar con IA externa.',
      3: 'Política formal. Framework de IA Responsable. ROI medido por caso de uso.',
      4: 'Centro de Excelencia. Gobernanza ágil descentralizada. Auditoría activa.',
    },
  },
];
