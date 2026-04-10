import type { FailurePattern } from '@/types';

export const FAILURE_PATTERNS: FailurePattern[] = [
  {
    id: 'FP-01',
    name: 'Muerte por mil pilotos',
    description: 'Muchos pilotos experimentales, ninguno escala. La organización produce demos pero no valor real.',
    source: 'McKinsey Rewired Framework',
    prevention: 'Máximo 5 pilotos simultáneos (red flag). Decisión explícita escalar/iterar/matar para cada piloto.',
  },
  {
    id: 'FP-02',
    name: 'IA como capa, no como integración',
    description: 'Agregar IA sobre procesos existentes sin rediseñar workflows. El impacto es mínimo porque el flujo de trabajo no cambió.',
    source: 'McKinsey State of AI 2025',
    prevention: 'Sección de Workflow Design obligatoria en cada piloto con mapeo detallado antes/después.',
  },
  {
    id: 'FP-03',
    name: 'El estancamiento del 20%',
    description: 'La adopción llega a 20-25% y se detiene. Falta de hero scenarios relevantes por rol.',
    source: 'Microsoft Copilot Adoption Playbook',
    prevention: 'Métricas de adopción en tracking semanal + Red de Champions peer-to-peer.',
  },
  {
    id: 'FP-04',
    name: 'Sponsor fantasma',
    description: 'El sponsor ejecutivo desaparece después de las primeras semanas. Es el predictor #1 de fracaso en transformación.',
    source: 'McKinsey Rewired + Microsoft',
    prevention: 'Red Flag RF-S3-05: alerta crítica si más de 2 reuniones del comité sin sponsor.',
  },
  {
    id: 'FP-05',
    name: 'Gobernanza asfixiante',
    description: 'Políticas tan restrictivas que es más fácil NO usar IA. Genera "Shadow AI" donde los empleados usan herramientas personales no corporativas.',
    source: 'Microsoft Copilot Adoption Playbook',
    prevention: 'Gobernanza progresiva por etapa. Política mínima viable en Etapa 1, no política de 40 páginas.',
  },
  {
    id: 'FP-06',
    name: 'Métricas vanidosas',
    description: 'Celebrar "45% adoptó la herramienta" cuando en realidad 45% la abrieron una vez. No medir profundidad ni hábito de uso.',
    source: 'Microsoft + McKinsey State of AI',
    prevention: 'Métricas de adopción: % activo semanal, frecuencia, habituales vs novatos, NPS.',
  },
  {
    id: 'FP-07',
    name: 'Transformación sin cultura',
    description: 'Implementar tecnología sin transformar la cultura. Las personas sabotean lo que no entienden o temen.',
    source: 'Collective Academy + McKinsey Rewired',
    prevention: 'Dimensión Cultura en diagnóstico. Deep Dive específico con programa de champions y narrativa.',
  },
];
