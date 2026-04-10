export interface DecisionTemplate {
  number: number;
  title: string;
  description: string;
  guidance: string;
}

export const FOUNDATIONAL_DECISIONS: DecisionTemplate[] = [
  {
    number: 1,
    title: 'El "por qué"',
    description: '¿Para qué queremos IA?',
    guidance: 'La respuesta debe aterrizar en: subir ventas, bajar costos, o mejorar la experiencia del usuario. Si no se puede articular cuál, es síndrome del objeto brillante.',
  },
  {
    number: 2,
    title: 'Política de transparencia',
    description: '¿La organización va a ser abierta respecto al uso de IA?',
    guidance: 'La evidencia apunta a que la transparencia gana. Posición clara: "usar IA no es hacer trampa, es ser más productivo."',
  },
  {
    number: 3,
    title: 'Gobernanza de datos mínima viable',
    description: '¿Qué información es confidencial y no debe alimentar modelos externos?',
    guidance: 'Definir qué datos sí y cuáles no. Política de uso aceptable de herramientas de IA generativa.',
  },
  {
    number: 4,
    title: 'Cadencia del comité',
    description: '¿Con qué frecuencia se reúne el comité?',
    guidance: 'Quincenal los primeros 3 meses, mensual después. 60 minutos máximo. Estructura fija: qué decidimos, qué datos tenemos, qué decidimos hoy.',
  },
  {
    number: 5,
    title: 'Criterios de éxito',
    description: '¿Qué constituye éxito antes de empezar?',
    guidance: 'No "cuántos usuarios tienen acceso" sino "cuántas horas ahorramos" o "cuánto se redujo el tiempo de respuesta." Baseline, tracking a 90 días, encuestas a 6 meses.',
  },
  {
    number: 6,
    title: 'Presupuesto inicial',
    description: '¿Cuánto se puede invertir en licencias, entrenamiento y consultoría?',
    guidance: 'No necesita ser grande. Un piloto con 15-30 licencias puede arrancar con pocos miles de dólares al mes.',
  },
  {
    number: 7,
    title: 'La lista de "no por ahora"',
    description: '¿Qué NO vamos a hacer en este primer ciclo?',
    guidance: 'No agentes autónomos complejos. No transformar el modelo de negocio en el primer trimestre. No rollout a toda la empresa. No política de 40 páginas.',
  },
  {
    number: 8,
    title: 'Próximos pasos inmediatos',
    description: '¿Quién hace qué antes de la próxima reunión?',
    guidance: 'Asignar al líder operativo el descubrimiento de procesos con equipos candidatos. Definir fecha de próxima reunión.',
  },
];
