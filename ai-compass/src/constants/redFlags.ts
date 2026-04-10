import type { Stage, RedFlagSeverity } from '@/types';

export interface RedFlagRule {
  id: string;
  stage: Stage;
  severity: RedFlagSeverity;
  title: string;
  description: string;
  detection: string;
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  { id: 'RF-S1-01', stage: 1, severity: 'alert', title: 'Sponsor no participó en sesión ejecutiva', description: 'La sesión ejecutiva se completó sin la participación del sponsor. Sin sponsor, el proceso pierde peso político.', detection: 'Sesión tipo "ejecutiva" completada sin participante con rol "sponsor".' },
  { id: 'RF-S1-02', stage: 1, severity: 'alert', title: 'Brecha ejecutivo-operativo', description: 'Se detectaron contradicciones significativas entre lo que dijo el C-level y lo que reportan las áreas operativas.', detection: 'IA detecta contradicción entre S1 y S2 en más de 2 dimensiones.' },
  { id: 'RF-S1-03', stage: 1, severity: 'warning', title: 'Todas las dimensiones en nivel mínimo', description: 'La organización muestra nivel 1 en 5 o más dimensiones. Considere acotar el alcance inicial.', detection: '5 o más dimensiones con score igual a 1.' },
  { id: 'RF-S2-01', stage: 2, severity: 'block', title: 'Sin líder operativo asignado', description: 'El comité fue constituido sin un líder operativo. Sin esta persona dedicando 30-50% de su tiempo, los pilotos no avanzan.', detection: 'Rol "operational-leader" vacío en la constitución del comité.' },
  { id: 'RF-S2-02', stage: 2, severity: 'alert', title: 'Decisiones fundacionales incompletas', description: 'Menos de 6 de las 8 decisiones fundacionales fueron documentadas.', detection: 'Menos de 6 decisiones con respuesta documentada.' },
  { id: 'RF-S2-03', stage: 2, severity: 'warning', title: 'Comité demasiado grande', description: 'El comité tiene más de 7 miembros. Los comités grandes paralizan decisiones.', detection: 'Más de 7 miembros registrados en el comité.' },
  { id: 'RF-S3-01', stage: 3, severity: 'block', title: 'Piloto sin baseline', description: 'Un piloto fue activado sin métricas de baseline. Sin baseline no se puede demostrar impacto.', detection: 'Piloto en estado "active" sin métricas pre-piloto cargadas.' },
  { id: 'RF-S3-02', stage: 3, severity: 'alert', title: 'Piloto estancado', description: 'Un piloto lleva más de 8 semanas sin datos de impacto ni decisión del comité.', detection: 'Timestamp de inicio mayor a 8 semanas sin decisión registrada.' },
  { id: 'RF-S3-03', stage: 3, severity: 'alert', title: 'Adopción baja en piloto', description: 'Menos del 30% del equipo piloto está usando la herramienta después de 4 semanas.', detection: 'Métricas de uso reportadas menores al 30% del equipo.' },
  { id: 'RF-S3-04', stage: 3, severity: 'warning', title: 'Demasiados pilotos simultáneos', description: 'Hay más de 5 pilotos activos simultáneamente. Para una organización en etapa temprana esto dispersa recursos.', detection: 'Conteo de pilotos en estado "active" mayor a 5.' },
  { id: 'RF-S3-05', stage: 3, severity: 'alert', title: 'Sponsor ausente del comité', description: 'El sponsor ejecutivo no participó en las últimas 2 reuniones del comité. El predictor #1 de fracaso es la ausencia del liderazgo senior.', detection: 'Más de 2 reuniones del comité sin el sponsor en la lista de asistentes.' },
];
