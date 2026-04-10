# AI Compass — Spec de Producto

## Resumen Ejecutivo

AI Compass es una plataforma de acompanamiento que guia a organizaciones desde el uso ad hoc de IA hasta una operacion AI-first. Combina diagnostico basado en evidencia, gobernanza progresiva, y resultados medibles por etapa.

**Modelo de negocio:** Consulting-led product (hibrido). InovaBiz lidera Etapas 1-2 como consultoria. La plataforma acompana Etapas 3+ como herramienta del AI Council. El producto genera ingreso recurrente a medida que la organizacion avanza.

**Alcance del lanzamiento (MVP):** Etapas 1-3 (diagnostico + comite + pilotos). Etapas 4-5 se construyen despues, validando con clientes reales.

**Codebase:** Producto nuevo independiente. No comparte codebase con el assessment DevSecOps.

**Principio rector:** La gobernanza crece con la organizacion. No se ponen todas las trabas al inicio.

---

## 1. Modelo de Madurez

### 6 Dimensiones

| Dimension | Que evalua |
|-----------|-----------|
| Estrategia | Vision de IA en el negocio, presupuesto, liderazgo |
| Procesos | Documentacion, flujos de trabajo, candidatos a automatizacion |
| Datos | Centralizacion, gobernanza, calidad, accesibilidad |
| Tecnologia | Herramientas actuales, infraestructura cloud, capacidad de integracion |
| Cultura | Mentalidad de crecimiento, resistencia al cambio, role modeling del liderazgo |
| Gobernanza | Politicas de uso, framework de IA Responsable, medicion de impacto |

### Niveles de Madurez por Dimension (1-4)

| Nivel | Significado |
|-------|-------------|
| 1 - Inexistente | No hay actividad ni conciencia en esta dimension |
| 2 - Incipiente | Esfuerzos aislados, sin estructura ni consistencia |
| 3 - Funcional | Estructura basica en operacion, resultados medibles |
| 4 - Avanzado | Practica madura, integrada en la operacion diaria |

### 3 Niveles de Implementacion de IA

Estos niveles clasifican los quick wins y recomendaciones por factibilidad tecnica, permitiendo priorizar las iniciativas segun la capacidad actual de la organizacion.

| Nivel | Nombre | Descripcion | Ejemplo |
|-------|--------|-------------|---------|
| 1 | Prompting | Solo requiere un LLM (ChatGPT, Claude, Gemini). Sin codigo. | Crear procesos documentados, redactar propuestas |
| 2 | No-code workflows | Requiere herramientas de automatizacion (Make, Zapier, n8n). | Automatizar envio de emails personalizados, dispatch optimizado |
| 3 | Custom | Requiere desarrollo tecnico (APIs, integraciones custom). | Agentes autonomos, integraciones con ERP/CRM |

Estos niveles se usan para clasificar quick wins y priorizar por factibilidad.

### 5 Etapas del Journey

| Etapa | Nombre | Duracion | Foco |
|-------|--------|----------|------|
| 1 | Diagnostico y Comite | Semanas 1-3 | Evaluar madurez, formar AI Council |
| 2 | Descubrimiento y Priorizacion | Semanas 3-5 | Deep dives, quick wins, presentacion final |
| 3 | Pilotos y Quick Wins | Meses 1-3 | Ejecutar pilotos, medir impacto, decidir |
| 4 | Escalamiento y Rediseno | Meses 3-9 | Escalar lo exitoso, redisenar flujos (futuro) |
| 5 | Transformacion AI-First | Meses 9-18+ | Agentes, CoE, modelo operativo (futuro) |

### Gobernanza Progresiva por Etapa

La gobernanza crece con la organizacion. Cada etapa tiene un nivel minimo esperado de gobernanza. Intentar imponer gobernanza de Etapa 5 en Etapa 1 paraliza la adopcion.

| Etapa | Nivel de gobernanza | Practicas minimas |
|-------|--------------------|--------------------|
| 1 | Politica minima viable | Definir que datos NO usar con IA externa. Comunicar posicion oficial ("usar IA no es trampa"). Identificar quien decide sobre IA. |
| 2 | Roles de gobernanza definidos | Comite constituido con sponsor y lider operativo. 8 decisiones fundacionales documentadas. Cadencia de reuniones establecida. Politica de uso aceptable escrita. |
| 3 | Metricas y control de pilotos | Baseline obligatorio antes de activar piloto. Tracking semanal de metricas de impacto Y adopcion. Champions asignados con responsabilidades claras. Red flags activos y monitoreados. |
| 4 | Gobernanza federada (futuro) | Estandares centrales del comite con aprobaciones delegadas a lideres de area. Monitoreo automatizado de uso. Auditorias periodicas de herramientas de IA. |
| 5 | Gobernanza adaptativa (futuro) | Centro de Excelencia operando. Gobernanza agil descentralizada. Monitoreo de cumplimiento en tiempo real. Gestion predictiva de riesgos. |

**Fuente:** Validado con Microsoft Agentic AI Maturity Model (5 niveles de gobernanza), McKinsey AI Trust Maturity Model (propiedad clara = 44% mas madurez), y principio rector de AI Compass.

### Criterios de Avance entre Etapas

**Etapa 1 a Etapa 2:**
- 3 sesiones de Discovery completadas y validadas
- Comite constituido con roles asignados
- 8 decisiones fundacionales documentadas
- Lider operativo tiene agenda para descubrimiento

**Etapa 2 a Etapa 3:**
- Deep dives completados
- Presentacion final realizada al comite
- 2-3 quick wins priorizados con diseno de piloto
- Herramienta seleccionada y equipo comprometido

**Etapa 3 a Etapa 4:**
- Al menos 1 piloto con impacto medible
- Decision del comite de escalar documentada
- Historia de exito comunicable internamente

---

## 2. Estructura de Sesiones

### 3 Fases de Sesiones

**Fase 1 — Discovery Core (3 sesiones fijas)**

| Sesion | Audiencia | Dimensiones | Modalidad | Duracion | Transcripcion |
|--------|-----------|-------------|-----------|----------|---------------|
| S1: Vision Ejecutiva | Sponsor + C-level | Estrategia, Gobernanza | Remota | 60 min | Critica |
| S2: Realidad Operativa | 2-3 lideres de area | Procesos, Cultura | Remota | 60-75 min | Critica |
| S3: Capacidad Tecnica | IT + responsables de datos | Tecnologia, Datos | Remota | 60 min | Util |

### Preguntas de Sesion S2 — Realidad Operativa (adiciones v2)

Ademas de las preguntas base de la sesion S2, se incluyen las siguientes preguntas adicionales:

- **S2-PRO-04:** "De los procesos que mencionaron, ¿cuales se hacen 100% en computadora y cuales requieren presencia fisica?"
  - Dimension: Procesos
  - Probe questions: ["¿El trabajo remoto es viable para esta tarea?", "¿Que porcentaje del equipo trabaja remoto vs presencial?"]

- **S2-PRO-05:** "Si tuvieran que clasificar sus tareas en tres niveles — las que se resuelven con una conversacion con ChatGPT, las que necesitan una automatizacion tipo workflow, y las que necesitan desarrollo tecnico custom — ¿donde cae cada una?"
  - Dimension: Procesos
  - Probe questions: ["¿Alguien del equipo ya usa herramientas no-code como Make o Zapier?", "¿Tienen desarrolladores internos o dependen de proveedores?"]

**Fase 1.5 — Constitucion del Comite (1 sesion)**

| Sesion | Audiencia | Modalidad | Duracion | Transcripcion |
|--------|-----------|-----------|----------|---------------|
| Constitucion del Comite | Comite completo propuesto | Presencial | 90-120 min | Critica |

Contenido: presentar recomendacion de composicion, validar miembros, facilitar 8 decisiones fundacionales, firmar acta de constitucion.

**Fase 2 — Deep Dives Adaptativos (1-3 sesiones)**

La IA recomienda que deep dives son necesarios basandose en hallazgos de Fase 1:

| Trigger | Deep Dive sugerido | Audiencia |
|---------|-------------------|-----------|
| Datos en rojo | Gobernanza de datos y flujos de informacion | IT + duenos de procesos |
| Cultura en rojo | Gestion del cambio y narrativa | RRHH + Comunicaciones + Champions |
| Procesos en rojo | Mapeo de procesos prioritarios | Lideres operativos |
| Brecha ejecutivo-operativo | Alineacion de expectativas | Sponsor + lideres de area |
| Tecnologia fragmentada | Arquitectura y roadmap tecnologico | IT + consultor tecnico |

Modalidad: remota. Duracion: 45-60 min. Transcripcion: util.

#### Guia de contenido por Deep Dive

**Deep Dive: Cultura en rojo** (el mas critico segun frameworks de referencia)
1. Identificar beachheads culturales: puntos concretos de resistencia y sus causas raiz (miedo a reemplazo, falta de informacion, experiencias negativas previas)
2. Mapear incentivos actuales vs necesarios: si la IA libera tiempo, ¿que gana la persona? (mas dinero, menos horas, nuevas responsabilidades mas interesantes, ownership)
3. Disenar narrativa organizacional: "IA como amplificador, no reemplazo". El lider debe modelar uso publico de IA (role modeling)
4. Proponer programa de champions internos: identificar early adopters entusiastas del diagnostico, darles rol formal, canal de comunicacion, sesiones de show & tell
5. Definir quick wins culturales: demos publicas del lider usando IA, sesion de "lunch & learn", canal de Slack/Teams para compartir prompts exitosos
6. Fuente: Collective Academy ("la transformacion cultural debe preceder a la implementacion tecnologica"), McKinsey Rewired ("toda transformacion de IA es una transformacion de gente")

**Deep Dive: Procesos en rojo**
1. Mapear la cadena de valor del cliente (market-to-lead, lead-to-sale, sale-to-delivery, delivery-to-success, success-to-market)
2. Para cada segmento: identificar procesos dolorosos, clasificar por digital vs presencial, clasificar por nivel de implementacion (prompting/no-code/custom)
3. Priorizar: ¿cual tiene mayor impacto con menor complejidad? (usar matriz impacto-esfuerzo)
4. Para el proceso prioritario: documentar workflow actual paso a paso (quien hace que, cuanto tarda)
5. Disenar workflow con IA: ¿que pasos cambian? ¿cuales se eliminan? ¿donde valida el humano?
6. Fuente: McKinsey ("solo 21% ha rediseñado workflows; los que lo hacen capturan 3x mas valor")

**Deep Dive: Datos en rojo**
1. Inventario de fuentes de datos: ¿donde vive la informacion? (ERP, CRM, spreadsheets, emails, cabezas de personas)
2. Evaluar calidad: ¿datos actualizados? ¿consistentes entre sistemas? ¿hay duplicados?
3. Evaluar acceso: ¿quien puede ver que? ¿hay gobernanza de permisos?
4. Identificar la fuente de verdad para cada tipo de dato
5. Proponer gobernanza minima viable: clasificacion basica (publico, interno, confidencial) + responsable por tipo de dato

**Deep Dive: Brecha ejecutivo-operativo**
1. Presentar las contradicciones detectadas entre S1 y S2 (con citas textuales anonimizadas)
2. Facilitar dialogo abierto: ¿por que ve el lider algo distinto a lo que vive el equipo?
3. Identificar si la brecha es de comunicacion (el lider no sabe) o de expectativas (el lider sabe pero prioriza distinto)
4. Construir vision compartida: alinear que significa "exito con IA" para ambas partes

**Deep Dive: Tecnologia fragmentada**
1. Inventario de herramientas actuales: suite de productividad, herramientas especializadas, cloud, herramientas de IA en uso
2. Evaluar integracion: ¿se hablan entre si? ¿hay APIs? ¿hay datos en silos?
3. Mapear capacidad de integracion: ¿que se conecta con que?
4. Proponer roadmap tecnologico: que consolidar, que mantener, que agregar para habilitar IA

**Fase 3 — Presentacion Final (1 sesion)**

| Sesion | Audiencia | Modalidad | Duracion | Transcripcion |
|--------|-----------|-----------|----------|---------------|
| Presentacion de Resultados | AI Council constituido | Presencial | 90-120 min | Critica |

3 momentos: (1) "Aqui estan" — diagnostico con spider chart, (2) "Aqui pueden llegar" — roadmap de madurez, (3) "Que decidimos hoy" — priorizacion de quick wins y pilotos.

**Total: 6-8 sesiones.** 2 presenciales (Constitucion + Presentacion), resto remotas.

---

## 3. Sistema de Input Triple

### Columna vertebral: Preguntas guia

Las preguntas siempre estan presentes. Son la guia del facilitador durante la sesion. Cada pregunta esta asignada a una dimension y a un tipo de sesion.

### 3 capas de input (la primera obligatoria, las demas opcionales)

```
Capa 1 (siempre)         Capa 2 (opcional)        Capa 3 (opcional)
Preguntas guia      +    Notas del           +    Transcripcion
(facilitador las         facilitador               completa
sigue una por una)       (durante la sesion)       (post-sesion)
```

### Modos de uso

**Modo basico:** El facilitador conduce la sesion con las preguntas guia y responde directamente en la plataforma pregunta por pregunta. Similar al DevSecOps actual.

**Modo con notas:** El facilitador tiene la sesion con las preguntas como referencia, toma notas durante la conversacion, y las carga despues. La IA mapea las notas a las preguntas y sugiere respuestas.

**Modo completo:** El facilitador conduce la sesion, toma notas, y despues sube la transcripcion. La IA procesa ambas fuentes, las cruza con las preguntas, y genera sugerencias enriquecidas.

### Reprocesamiento

Cuando el facilitador agrega una fuente nueva (notas despues de transcripcion o viceversa), la IA re-procesa integrando todo. Las respuestas ya aprobadas no se tocan — solo se actualizan las pendientes.

---

## 4. Motor de IA

### Abstraccion de Proveedor

El motor de IA es agnostico del proveedor. La app nunca sabe que modelo esta detras.

```
src/services/ai/
  types.ts                    # Interfaces comunes (input/output)
  aiService.ts                # Fachada publica
  providers/
    geminiProvider.ts         # Google Gemini
    claudeProvider.ts         # Anthropic Claude
    openaiProvider.ts         # OpenAI GPT
    index.ts                  # Registry de proveedores
  prompts/
    sessionAnalysis.ts        # Analisis de sesiones
    transcriptExtraction.ts   # Extraccion de transcripciones
    reportGeneration.ts       # Generacion de entregables
    crossSessionAnalysis.ts   # Analisis cross-sesion
```

Interfaz comun que implementa cada proveedor:

```typescript
interface AIProvider {
  name: string;
  analyzeSession(input: SessionInput): Promise<SessionAnalysis>;
  extractFromTranscript(input: TranscriptInput): Promise<ExtractionResult>;
  generateReport(input: ReportInput): Promise<ReportOutput>;
  crossSessionAnalysis(input: CrossSessionInput): Promise<CrossAnalysis>;
}
```

Configuracion via variables de entorno:
- `AI_PROVIDER`: gemini | claude | openai
- `AI_MODEL`: modelo especifico del proveedor

Los prompts estan separados de los proveedores. Cada provider toma el prompt y lo adapta al formato de su API.

Permite: cambiar proveedor con una variable de entorno, usar proveedores distintos por funcion, testear prompts contra multiples modelos.

### Funcion 1 — Extraccion y Analisis de Sesiones

**Por cada pregunta:**
- Respuesta sugerida (cuando viene de transcripcion/notas)
- Nivel de madurez sugerido (1-4)
- Citas de respaldo con atribucion (nombre, rol, timestamp)
- Nivel de confianza (alto/medio/bajo)
- Estado: pendiente de revision

**Hallazgos emergentes por sesion:**
- Alineacion/desalineacion entre participantes
- Champions identificados con citas textuales
- Resistencias detectadas con citas
- Temas no cubiertos por las preguntas

**Analisis cross-sesion (despues de validar S1+S2+S3):**
- Diagnostico consolidado por dimension con evidencia
- Recomendacion de composicion del comite
- Recomendacion de deep dives necesarios
- Quick wins sugeridos basados en dolores identificados
- **Clasificacion de quick wins por segmento de cadena de valor** (market-to-lead, lead-to-sale, sale-to-delivery, delivery-to-success, success-to-market) para identificar en que parte del negocio impacta cada sugerencia
- **Clasificacion de quick wins por nivel de implementacion** (prompting, no-code, custom) para priorizar por factibilidad tecnica y capacidad actual de la organizacion

### Funcion 2 — Generacion de Entregables

La IA genera borradores de todos los entregables. El facilitador edita y aprueba antes de publicar.

### Panel de Validacion

Para cada respuesta sugerida por la IA, el facilitador puede:
- **Aprobar**: la respuesta es correcta tal cual
- **Editar**: la IA capturo la idea pero necesita ajuste
- **Rechazar**: la IA interpreto mal, el facilitador escribe la correcta
- **No mencionado**: el tema no se toco, queda pendiente para deep dive

Preguntas sin cobertura se agrupan como input para deep dives o para respuesta manual.

---

## 5. Modelo de Datos

### Entidades Principales

**Organizacion** — Entidad raiz
- Datos generales (nombre, industria, tamano, contacto)
- Etapa actual (1-5)
- Madurez por dimension (6 scores)
- Historial de avance con timestamps
- Criterios de avance cumplidos/pendientes

**Engagement** — Ciclo de trabajo de InovaBiz con la organizacion
- Facilitador asignado
- Fechas de inicio/fin
- Estado del engagement

**Sesion** — Cada sesion del flujo
- Tipo (Ejecutiva, Operativa, Tecnica, Constitucion, Deep Dive, Presentacion)
- Modalidad (presencial/remota)
- Participantes (nombre, rol, area)
- Preguntas guia (siempre presentes)
- Notas del facilitador (opcional)
- Transcripcion (opcional, archivo subido)
- Respuestas extraidas con estado de validacion
- Hallazgos emergentes

**Comite de IA** — Se crea en la sesion de Constitucion
- Miembros con rol (sponsor, lider operativo, representantes negocio, IT, change management)
- 8 decisiones fundacionales con respuesta
- Cadencia de reuniones
- Historial de decisiones

**Piloto** (Etapa 3)
- Caso de uso (proceso antes/despues)
- Equipo asignado, Champion designado
- Herramienta seleccionada
- Baseline medido (metricas pre-piloto)
- Metricas de avance (tracking semanal)
- Metricas de adopcion (tracking semanal): porcentaje del equipo usando la herramienta activamente, frecuencia de uso (diario/semanal/esporadico), usuarios habituales vs novatos, NPS del equipo piloto
- Estado: en diseno / activo / evaluando / decision (escalar/iterar/matar)
- Quick wins asociados
- **workflowDesign:** Rediseno detallado del workflow que el piloto modifica
  - `workflowBefore`: diagrama o descripcion paso a paso del proceso actual (quien hace que, en que orden, con que herramientas, cuanto tarda)
  - `workflowAfter`: diagrama o descripcion del proceso rediseñado con IA integrada (que pasos cambian, cuales se eliminan, donde interviene la IA, donde valida el humano)
  - `humanValidationPoints`: puntos del workflow donde se requiere validacion humana explicita
  - `eliminatedSteps`: pasos que se eliminan completamente con la nueva herramienta
  - `newSteps`: pasos nuevos que no existian antes (ej: revision de output de IA)
- **champions:** Red de champions asignados al piloto
  - `championAssignments`: Array de objetos con: nombre, area, responsabilidades (peer training, soporte primer nivel, feedback loop, documentacion de prompts exitosos), horasSemanales (4-8h recomendado)
  - Ratio recomendado: 1 champion por cada 50 usuarios del piloto
  - Canal de comunicacion del champion (Teams, Slack, etc.)
  - Cadencia de reuniones de champions (semanal recomendado)
- **roleImpacts:** Array de objetos con la siguiente estructura:
  - `roleName`: nombre del rol afectado por el piloto
  - `timeFreedPercent`: porcentaje de tiempo liberado para ese rol
  - `newResponsibilities`: nuevas responsabilidades propuestas para la persona
  - `proposedIncentive`: incentivo propuesto para motivar la transicion

**Regla de transformacion de roles:** Cuando un piloto libera mas del 30% del tiempo de un rol (`timeFreedPercent > 30`), el comite de IA debe discutir la transformacion de ese rol. La discusion debe incluir: (1) nuevas responsabilidades que aprovechen el tiempo liberado, (2) incentivos concretos para la persona afectada, y (3) un plan de comunicacion que prevenga resistencia cultural. Este mecanismo es fundamental para evitar que las personas perciban la IA como una amenaza a su puesto, transformando la narrativa de "reemplazo" a "evolucion del rol".

**Dimensiones y Preguntas**
- 6 dimensiones fijas
- Preguntas asignadas por tipo de sesion
- Niveles de madurez por dimension (1-4)
- Benchmarks por industria

### Tipos Adicionales del Modelo

```typescript
// Segmentos de la cadena de valor del cliente
type ValueChainSegment =
  | 'market-to-lead'
  | 'lead-to-sale'
  | 'sale-to-delivery'
  | 'delivery-to-success'
  | 'success-to-market';

// Nivel de implementacion tecnica requerido
type ImplementationLevel = 'prompting' | 'no-code' | 'custom';
```

**QuickWinSuggestion** — Campos adicionales:
- `valueChainSegment: ValueChainSegment` — En que parte de la cadena de valor opera este quick win
- `implementationLevel: ImplementationLevel` — Nivel de dificultad tecnica requerido (prompting, no-code, custom)
- `diminishingReturns: string` — Descripcion de a que escala deja de generar valor adicional (por ejemplo: "A partir de 500 emails/mes el costo de tokens supera el ahorro de tiempo")

---

## 6. Roles de Usuario y Permisos

### 3 Tipos de Usuario

**Facilitador (InovaBiz)** — Acceso completo
- Crea organizaciones y engagements
- Conduce sesiones, sube transcripciones, valida respuestas
- Configura comite, facilita decisiones
- Disena pilotos, asigna quick wins
- Genera y edita entregables
- Ve todas las organizaciones asignadas

**Miembro del AI Council** — Acceso acotado a su organizacion
- Ve mapa de madurez y progreso por etapa
- Ve diagnostico y entregables publicados
- Participa en decisiones del comite
- Ve dashboard de pilotos y metricas
- Recibe alertas de red flags
- No puede modificar sesiones, respuestas ni configuracion

**Admin (InovaBiz)** — Gestion de la plataforma
- Crea facilitadores
- Ve metricas de todos los engagements
- Gestiona catalogo de preguntas y dimensiones
- Configuracion global

### Momento de Ingreso

El AI Council no accede a la plataforma hasta que el comite esta constituido. Antes, el facilitador trabaja solo. Cuando el comite se formaliza, se crean las cuentas y los miembros empiezan a ver el dashboard.

---

## 7. Sistema de Red Flags

### Comportamiento

- **Advertencia**: Se muestra, no bloquea. El facilitador decide.
- **Alerta**: Visible para facilitador Y AI Council. Requiere accion documentada.
- **Bloqueo**: No permite avanzar. Solo el facilitador puede hacer override con justificacion.

### Red Flags por Etapa

**Etapa 1-2 (Diagnostico)**

| Red Flag | Deteccion | Tipo |
|----------|-----------|------|
| Sponsor no participo en S1 | Sesion Ejecutiva sin participante con rol "sponsor" | Alerta |
| Brecha ejecutivo-operativo | IA detecta contradiccion entre S1 y S2 en >2 dimensiones | Alerta + recomienda deep dive |
| Todas las dimensiones en rojo | 5+ dimensiones en nivel 1 | Advertencia: acotar alcance |

**Etapa 2 (Comite)**

| Red Flag | Deteccion | Tipo |
|----------|-----------|------|
| Sin lider operativo asignado | Rol vacio en constitucion | Bloqueo |
| Decisiones fundacionales incompletas | <6 de 8 documentadas | Alerta |
| Comite >7 personas | Mas de 7 miembros registrados | Advertencia |

**Etapa 3 (Pilotos)**

| Red Flag | Deteccion | Tipo |
|----------|-----------|------|
| Piloto sin baseline | Estado "activo" sin metricas pre-piloto | Bloqueo |
| Piloto >8 semanas sin evaluacion | Timestamp inicio > 8 semanas sin decision | Alerta al AI Council |
| Adopcion <30% a 4 semanas | Metricas de uso < 30% del equipo | Alerta |
| >5 pilotos simultaneos | Conteo de pilotos activos > 5 | Advertencia |
| Sponsor ausente | >2 reuniones del comite sin sponsor | Alerta critica |

---

## 8. Entregables y Reportes

### Por Etapa

**Etapa 1 — Diagnostico**
- Mapa de Hallazgos (PDF + plataforma): diagnostico por dimension, brechas, Champions, resistencias
- Propuesta de Comite (PDF): composicion recomendada con roles y justificacion
- Acta de Constitucion (PDF + plataforma): 8 decisiones, miembros, compromisos

**Etapa 2 — Descubrimiento**
- Diagnostico Completo (PDF + plataforma): spider chart con benchmark, analisis por dimension, roadmap 12-18 meses
- Ficha de Quick Wins (PDF + plataforma): por cada quick win proceso antes/despues, herramienta, metricas, timeline
- Presentacion Final (Slides PDF/PPTX): deck ejecutivo para sesion presencial

**Etapa 3 — Pilotos**
- Diseno de Piloto (PDF + plataforma): alcance, baseline, herramienta, plan de entrenamiento, Champion
- Reporte Quincenal (PDF + plataforma): estado de pilotos, metricas vs. baseline, red flags, decisiones pendientes
- Reporte de Evaluacion (PDF + plataforma): resultados, recomendacion escalar/iterar/matar, caso de negocio

### Estructura de la Presentacion Final (Slides)

1. Portada (logo cliente + InovaBiz)
2. Contexto: por que estamos aqui
3. Metodologia: que hicimos, con quien, que frameworks
4. Spider Chart: madurez por dimension vs. benchmark industria
5-10. Una slide por dimension: hallazgo + evidencia + nivel
11. Brechas criticas: desalineaciones importantes
12. Mapa de personas: Champions, resistencias
13. Roadmap de madurez: donde estan hoy, donde pueden estar en 12-18 meses
14. Quick Wins recomendados: 2-3 pilotos con antes/despues
15. Proximos pasos: que necesitamos del comite

### Flujo de Aprobacion

IA genera borrador -> Facilitador revisa y edita -> Facilitador publica -> Visible para AI Council. Ningun entregable llega al AI Council sin aprobacion del facilitador.

---

## 9. Stack Tecnico

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (estandar, sin prefijo custom)
- React Router (routing real, no hash-based)
- Zustand (state management por dominio)
- Recharts (spider chart, graficos de metricas)

### Backend
- Node.js + Express + TypeScript
- PostgreSQL
- JWT auth
- Multer (carga de transcripciones)

### IA
- Motor agnostico de proveedor (Gemini, Claude, OpenAI)
- Schemas JSON estructurados
- Rate limiting con delay entre llamadas
- Prompts separados de providers

### Nuevo respecto al DevSecOps
- Procesamiento de transcripciones (.vtt, .srt, texto plano)
- Generacion de PPTX
- Sistema de notificaciones (alertas y red flags)
- Multi-rol (facilitador, AI Council, admin)

### Arquitectura de Archivos

```
src/
  pages/
    Dashboard.tsx              # Lista de organizaciones
    MaturityMap.tsx             # Mapa de etapas (pantalla principal)
    SessionView.tsx             # Conducir/revisar sesion
    TranscriptReview.tsx        # Panel de validacion IA
    CommitteeSetup.tsx          # Diseno y constitucion del comite
    PilotTracking.tsx           # Dashboard de pilotos (Etapa 3)
    ReportBuilder.tsx           # Generacion/edicion de entregables
  components/
    SpiderChart.tsx
    StageProgress.tsx           # Barra de progreso por etapa
    RedFlagAlert.tsx
    QuestionCard.tsx            # Pregunta + respuesta + validacion
    TranscriptUploader.tsx
  stores/
    organizationStore.ts
    sessionStore.ts
    pilotStore.ts
  services/
    apiClient.ts
    ai/
      types.ts
      aiService.ts              # Fachada publica
      providers/
        geminiProvider.ts
        claudeProvider.ts
        openaiProvider.ts
        index.ts
      prompts/
        sessionAnalysis.ts
        transcriptExtraction.ts
        reportGeneration.ts
        crossSessionAnalysis.ts
    transcriptParser.ts         # Parsing de .vtt/.srt
  types/
    index.ts
  constants/
    questions.ts                # Preguntas por sesion y dimension
    dimensions.ts               # 6 dimensiones con niveles
    redFlags.ts                 # Reglas de alertas
  hooks/
    useMaturityScore.ts
    useRedFlags.ts
    useTranscriptProcessing.ts
```

### Principios Arquitectonicos

- Ningun archivo supera 300 lineas
- Routing real con React Router y rutas protegidas por rol
- Estado predecible con Zustand stores separados por dominio
- Motor de IA desacoplado como servicio independiente
- Tipos definidos desde el dia 1

---

## 10. Narrativa Comercial

**Nombre:** AI Compass

**Tagline:** "Le mostramos donde esta y hacia donde ir con IA"

**Lo que NO es:** No es un curso de IA. No es una implementacion tecnica. No es una auditoria.

**Lo que SI es:** Un programa de acompanamiento que lleva a su organizacion desde el uso ad hoc de IA hasta una operacion AI-first, con diagnostico basado en evidencia, gobernanza progresiva, y resultados medibles en cada etapa.

**Diferenciador:** La gobernanza crece con la organizacion. No se ponen todas las trabas al inicio. El producto guia ese crecimiento gradual con guardarrailes inteligentes.

**Publico objetivo:** Organizaciones con madurez baja-media (nivel 100-200 Microsoft) que saben que necesitan IA pero no saben por donde empezar. Tipicamente 50-500 empleados con un sponsor ejecutivo dispuesto a liderar.

**Frameworks base:** Anthropic Economic Index, McKinsey State of AI y Rewired Framework, Microsoft Agentic AI Maturity Model, Google Cloud AI Adoption Framework, McKinsey AI Trust Maturity Model, framework Optimizar-Acelerar-Transformar de Collective Academy.

---

## 11. Patrones de Fracaso Documentados

Antipatrones recurrentes identificados en los frameworks de referencia. El facilitador los presenta al comite como "errores a evitar" para educar y justificar las practicas del programa.

| # | Patron | Descripcion | Fuente | Como AI Compass lo previene |
|---|--------|-------------|--------|-----------------------------|
| 1 | Muerte por mil pilotos | Muchos pilotos experimentales, ninguno escala. La organizacion produce demos pero no valor. | McKinsey Rewired | Maximo 5 pilotos simultaneos (red flag). Decision explicita escalar/iterar/matar. |
| 2 | IA como capa, no como integracion | Agregar IA sobre procesos existentes sin redisenar workflows. Impact minimo. | McKinsey State of AI | Seccion de Workflow Design obligatoria en cada piloto (before/after detallado). |
| 3 | El estancamiento del 20% | Adopcion llega a 20-25% y se detiene. Falta de hero scenarios relevantes por rol. | Microsoft Copilot Playbook | Metricas de adopcion en tracking semanal + Red de Champions peer-to-peer. |
| 4 | Sponsor fantasma | El sponsor ejecutivo desaparece despues de las primeras semanas. Predictor #1 de fracaso. | McKinsey + Microsoft | Red Flag RF-S3-05: alerta critica si >2 reuniones sin sponsor. |
| 5 | Gobernanza asfixiante | Politicas tan restrictivas que es mas facil NO usar IA. Genera "Shadow AI" (uso de herramientas no corporativas). | Microsoft Copilot Playbook | Gobernanza progresiva por etapa. Politica minima viable en Etapa 1, no politica de 40 paginas. |
| 6 | Metricas vanidosas | Celebrar "45% adopto la herramienta" cuando en realidad 45% la abrio una vez. No medir profundidad ni habito. | Microsoft + McKinsey | Metricas de adopcion: % activo semanal, frecuencia, habituales vs novatos, NPS. |
| 7 | Transformacion sin cultura | Implementar tecnologia sin transformar la cultura. Las personas sabotean lo que no entienden o temen. | Collective Academy + McKinsey Rewired | Dimension Cultura en diagnostico. Deep Dive especifico con programa de champions y narrativa. |

---

## Changelog v2

Los siguientes cambios se incorporaron en esta version respecto al documento original:

1. **Preguntas nuevas para S2 (Realidad Operativa):** Se agregaron dos preguntas adicionales (S2-PRO-04 y S2-PRO-05) en la seccion de sesiones. S2-PRO-04 indaga sobre procesos digitales vs. presenciales. S2-PRO-05 pide clasificar tareas por nivel de implementacion (prompting, no-code, custom). Ambas incluyen probe questions.

2. **Cadena de valor del cliente:** Se agrego el tipo `ValueChainSegment` con 5 segmentos (market-to-lead, lead-to-sale, sale-to-delivery, delivery-to-success, success-to-market) y se extendio `QuickWinSuggestion` con los campos `valueChainSegment`, `implementationLevel` y `diminishingReturns` en la seccion del modelo de datos.

3. **Niveles de implementacion de IA:** Se agrego una sub-seccion "3 Niveles de Implementacion de IA" (Prompting, No-code workflows, Custom) dentro de la seccion 1 (Modelo de Madurez), despues de los niveles de madurez y antes de las etapas del journey.

4. **Impacto en roles (roleImpacts):** Se agrego el campo `roleImpacts` a la entidad Piloto con estructura para rastrear impacto por rol (roleName, timeFreedPercent, newResponsibilities, proposedIncentive). Se documento la regla de que cuando un piloto libera >30% del tiempo de un rol, el comite debe discutir la transformacion del rol para prevenir resistencia cultural.

5. **Cadena de valor en el prompt de cross-analysis:** Se agrego en la Funcion 1 del Motor de IA (analisis cross-sesion) que los quick wins sugeridos deben clasificarse tanto por segmento de cadena de valor como por nivel de implementacion.

6. **Rediseno de workflows en pilotos (GAP critico 1):** Se agrego `workflowDesign` a la entidad Piloto con campos para workflow antes/despues detallado, puntos de validacion humana, pasos eliminados y pasos nuevos. Fuente: McKinsey ("solo 21% redesena workflows; los que lo hacen capturan 3x mas valor").

7. **Champions como red de adopcion (GAP critico 2):** Se agrego `champions` a la entidad Piloto con `championAssignments` (nombre, area, responsabilidades, horas semanales). Ratio 1:50. Fuente: Microsoft Copilot Playbook ("+30% adopcion con champions activos").

8. **Metricas de adopcion en pilotos (GAP critico 3):** Se agregaron 4 metricas al tracking semanal: % equipo activo, frecuencia de uso, habituales vs novatos, NPS del equipo. Fuente: McKinsey ("empresas que miden KPIs son 3x mas exitosas") + Microsoft (4 capas de metricas).

9. **Patrones de fracaso documentados (GAP medio 4):** Nueva seccion 11 con 7 antipatrones recurrentes (muerte por mil pilotos, IA como capa, estancamiento del 20%, sponsor fantasma, gobernanza asfixiante, metricas vanidosas, transformacion sin cultura). Fuentes: McKinsey, Microsoft, Collective Academy.

10. **Gobernanza progresiva por etapa (GAP medio 5):** Nueva sub-seccion en Etapas del Journey con nivel de gobernanza esperado y practicas minimas para cada etapa (1-5). Fuente: Microsoft (5 niveles), McKinsey AI Trust (propiedad clara = 44% mas madurez).

11. **Guia de contenido para deep dives (GAP medio 6+7):** Se agrego guia detallada de contenido para los 5 tipos de deep dive, con enfasis especial en el deep dive de Cultura que incluye: beachheads culturales, incentivos, narrativa, programa de champions, quick wins culturales. Fuentes: Collective Academy, McKinsey Rewired, Microsoft.

---

*Spec generada el 2026-04-10. Actualizada a v2 el 2026-04-10. Gaps de frameworks incorporados el 2026-04-10. Producto de InovaBiz.*
