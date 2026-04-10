import type { DeepDiveTrigger } from '@/types';

export interface DeepDiveGuide {
  trigger: DeepDiveTrigger;
  title: string;
  steps: string[];
  source: string;
}

export const DEEP_DIVE_GUIDES: DeepDiveGuide[] = [
  {
    trigger: 'cultura-rojo',
    title: 'Gestión del cambio y narrativa',
    steps: [
      'Identificar beachheads culturales: puntos concretos de resistencia y sus causas raíz (miedo a reemplazo, falta de información, experiencias negativas previas)',
      'Mapear incentivos actuales vs necesarios: si la IA libera tiempo, ¿qué gana la persona?',
      'Diseñar narrativa organizacional: "IA como amplificador, no reemplazo". El líder debe modelar uso público de IA',
      'Proponer programa de champions internos: identificar early adopters entusiastas, darles rol formal',
      'Definir quick wins culturales: demos públicas del líder usando IA, sesiones de "lunch & learn", canal para compartir prompts exitosos',
    ],
    source: 'Collective Academy + McKinsey Rewired',
  },
  {
    trigger: 'procesos-rojo',
    title: 'Mapeo de procesos prioritarios',
    steps: [
      'Mapear la cadena de valor del cliente (market-to-lead, lead-to-sale, sale-to-delivery, delivery-to-success, success-to-market)',
      'Para cada segmento: identificar procesos dolorosos, clasificar por digital vs presencial, clasificar por nivel de implementación (prompting/no-code/custom)',
      'Priorizar con matriz impacto-esfuerzo: ¿cuál tiene mayor impacto con menor complejidad?',
      'Para el proceso prioritario: documentar workflow actual paso a paso (quién hace qué, cuánto tarda)',
      'Diseñar workflow con IA: ¿qué pasos cambian? ¿cuáles se eliminan? ¿dónde valida el humano?',
    ],
    source: 'McKinsey State of AI 2025',
  },
  {
    trigger: 'datos-rojo',
    title: 'Gobernanza de datos y flujos de información',
    steps: [
      'Inventario de fuentes de datos: ¿dónde vive la información? (ERP, CRM, spreadsheets, emails, cabezas de personas)',
      'Evaluar calidad: ¿datos actualizados? ¿consistentes entre sistemas? ¿hay duplicados?',
      'Evaluar acceso: ¿quién puede ver qué? ¿hay gobernanza de permisos?',
      'Identificar la fuente de verdad para cada tipo de dato',
      'Proponer gobernanza mínima viable: clasificación básica (público, interno, confidencial) + responsable por tipo de dato',
    ],
    source: 'Google Cloud AI Adoption Framework',
  },
  {
    trigger: 'brecha-ejecutivo-operativo',
    title: 'Alineación de expectativas',
    steps: [
      'Presentar las contradicciones detectadas entre S1 y S2 (con citas textuales anonimizadas)',
      'Facilitar diálogo abierto: ¿por qué ve el líder algo distinto a lo que vive el equipo?',
      'Identificar si la brecha es de comunicación (el líder no sabe) o de expectativas (el líder sabe pero prioriza distinto)',
      'Construir visión compartida: alinear qué significa "éxito con IA" para ambas partes',
    ],
    source: 'McKinsey AI Trust Maturity Model',
  },
  {
    trigger: 'tecnologia-fragmentada',
    title: 'Arquitectura y roadmap tecnológico',
    steps: [
      'Inventario de herramientas actuales: suite de productividad, herramientas especializadas, cloud, herramientas de IA en uso',
      'Evaluar integración: ¿se hablan entre sí? ¿hay APIs? ¿hay datos en silos?',
      'Mapear capacidad de integración: ¿qué se conecta con qué?',
      'Proponer roadmap tecnológico: qué consolidar, qué mantener, qué agregar para habilitar IA',
    ],
    source: 'Google Cloud AI Adoption Framework',
  },
];
