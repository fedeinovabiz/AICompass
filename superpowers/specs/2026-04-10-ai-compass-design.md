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

### 5 Etapas del Journey

| Etapa | Nombre | Duracion | Foco |
|-------|--------|----------|------|
| 1 | Diagnostico y Comite | Semanas 1-3 | Evaluar madurez, formar AI Council |
| 2 | Descubrimiento y Priorizacion | Semanas 3-5 | Deep dives, quick wins, presentacion final |
| 3 | Pilotos y Quick Wins | Meses 1-3 | Ejecutar pilotos, medir impacto, decidir |
| 4 | Escalamiento y Rediseno | Meses 3-9 | Escalar lo exitoso, redisenar flujos (futuro) |
| 5 | Transformacion AI-First | Meses 9-18+ | Agentes, CoE, modelo operativo (futuro) |

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
- Estado: en diseno / activo / evaluando / decision (escalar/iterar/matar)
- Quick wins asociados

**Dimensiones y Preguntas**
- 6 dimensiones fijas
- Preguntas asignadas por tipo de sesion
- Niveles de madurez por dimension (1-4)
- Benchmarks por industria

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

*Spec generada el 2026-04-10. Producto de InovaBiz.*
