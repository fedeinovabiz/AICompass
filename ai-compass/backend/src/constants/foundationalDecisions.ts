// ══════════════════════════════════════════════
// DECISIONES FUNDACIONALES DEL COMITÉ — BACKEND
// ══════════════════════════════════════════════

export interface FoundationalDecisionTemplate {
  number: number;
  title: string;
  description: string;
  options?: string[];
  placeholder: string;
}

export const FOUNDATIONAL_DECISIONS: FoundationalDecisionTemplate[] = [
  {
    number: 1,
    title: 'Visión de IA de la Organización',
    description: '¿Cuál es la declaración de visión que guiará el uso de IA en nuestra organización en los próximos 3 años? Esta declaración debe ser inspiradora, concreta y alineada con los objetivos estratégicos del negocio.',
    placeholder: 'Ej: "Usar IA para reducir en un 40% los tiempos operativos y liberar a nuestro equipo para tareas de mayor valor en 3 años."',
  },
  {
    number: 2,
    title: 'Criterios de Priorización de Casos de Uso',
    description: '¿Qué criterios usaremos para decidir qué iniciativas de IA priorizamos? Definir los factores que determinarán el orden de implementación: impacto, viabilidad, costo, riesgo, disponibilidad de datos, etc.',
    options: [
      'Impacto en eficiencia operativa',
      'Impacto en experiencia del cliente',
      'ROI estimado',
      'Disponibilidad de datos',
      'Complejidad técnica baja',
      'Alineación estratégica',
    ],
    placeholder: 'Ej: "Priorizamos iniciativas con impacto operativo alto, datos disponibles y complejidad técnica baja."',
  },
  {
    number: 3,
    title: 'Política de Uso Responsable de IA',
    description: '¿Cuáles son los principios y límites éticos que gobernarán el uso de IA en nuestra organización? Incluir postura sobre transparencia, sesgo, privacidad, supervisión humana y casos de uso prohibidos.',
    placeholder: 'Ej: "Toda IA en producción requiere validación humana. No usaremos IA para decisiones que afecten directamente el empleo sin revisión del comité."',
  },
  {
    number: 4,
    title: 'Modelo de Gobernanza y Toma de Decisiones',
    description: '¿Cómo tomará decisiones el Comité de Transformación IA? Definir: frecuencia de reuniones, quórum necesario, proceso para aprobar presupuesto, mecanismo para escalar al nivel ejecutivo.',
    options: [
      'Reuniones semanales',
      'Reuniones quincenales',
      'Reuniones mensuales',
      'Decisiones por consenso',
      'Decisiones por mayoría simple',
      'Decisiones del sponsor con asesoría del comité',
    ],
    placeholder: 'Ej: "El comité se reúne quincenalmente. Decisiones de inversión >$10K requieren aprobación del sponsor. Quórum: 4 de 5 miembros."',
  },
  {
    number: 5,
    title: 'Estrategia de Gestión del Cambio',
    description: '¿Cómo comunicaremos e involucraremos a toda la organización en la transformación IA? Definir: plan de comunicación, programa de formación, gestión de resistencias y estrategia de campeones internos.',
    placeholder: 'Ej: "Programa de embajadores de IA en cada área, comunicación mensual de avances y formación obligatoria básica para todos los empleados."',
  },
  {
    number: 6,
    title: 'Política de Datos para IA',
    description: '¿Qué datos podemos usar para entrenar o alimentar sistemas de IA? Definir: clasificación de datos permitidos, restricciones de privacidad, política de datos de clientes, proveedores externos permitidos.',
    placeholder: 'Ej: "Datos internos operativos permitidos. Datos de clientes solo anonimizados. No compartir datos con proveedores de IA sin acuerdo de confidencialidad."',
  },
  {
    number: 7,
    title: 'Presupuesto y Modelo de Inversión',
    description: '¿Cómo financiaremos la transformación IA? Definir: presupuesto anual asignado, modelo de aprobación de inversiones por piloto, criterios de éxito para continuar invirtiendo, fuente de los fondos.',
    placeholder: 'Ej: "Budget anual de $150K para IA, dividido en $50K por trimestre. Cada piloto requiere aprobación del comité con business case básico."',
  },
  {
    number: 8,
    title: 'Métricas de Éxito de la Transformación',
    description: '¿Cómo mediremos si nuestra transformación IA está siendo exitosa? Definir: KPIs de negocio, métricas de adopción, indicadores de madurez y frecuencia de revisión de resultados.',
    placeholder: 'Ej: "KPIs: reducción de tiempo en procesos piloto, tasa de adopción de herramientas IA, NPS interno, número de casos de uso en producción por trimestre."',
  },
];

export function getDecisionByNumber(number: number): FoundationalDecisionTemplate | undefined {
  return FOUNDATIONAL_DECISIONS.find(d => d.number === number);
}
