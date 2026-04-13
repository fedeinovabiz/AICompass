# Spec: Herramientas de Transformación Agéntica (80/20 del Framework de Google)

**Fecha**: 2026-04-12
**Origen**: Análisis del Agentic AI Transformation Framework de Google Cloud
**Enfoque**: Implementar las 3 herramientas del veredicto 80/20 como capacidades transversales en AICompass

---

## Contexto

Google Cloud publicó su Agentic AI Transformation Framework para guiar a las empresas desde chatbots hacia sistemas autónomos. Del análisis profundo del framework, se extrajeron las 3 herramientas que generan el 80% del valor:

1. **Diagnóstico de 3 anti-patrones** — detectar los errores que hacen fracasar implementaciones agénticas
2. **CUJ Mapper** — mapear Critical User Journeys antes de construir agentes
3. **Value Engineering** — anclar cada proyecto en impacto financiero real (P&L)

## Decisiones de diseño

- **Enfoque híbrido**: Anti-patrones se integran invisiblemente como Red Flags. CUJ y Value Engineering tienen vistas propias porque son herramientas de trabajo activas.
- **Transversal, no etapa nueva**: Las 3 herramientas permean las etapas existentes (1-5) en vez de crear una Etapa 6. Esto maximiza adopción — el valor llega donde ya hay tráfico de usuarios.
- **YAGNI aplicado**: Sin canvas visual para CUJ (lista estructurada basta), sin escenarios múltiples en Value Engineering, sin cálculo automático de ROI.

---

## Componente 1: Anti-Patrones como Red Flags

### Descripción

3 reglas nuevas en el sistema de Red Flags existente (F-009). No requiere vistas nuevas — se muestra en el RedFlagBanner del layout.

### RF-11: Cimientos Rotos (Cracked Foundations)

- **Severidad**: block
- **Trigger**: Score <=1 en la dimensión de Datos/Infraestructura del diagnóstico Y el cliente quiere aprobar un piloto que depende de integración con sistemas legado.
- **Mensaje**: "El piloto [X] requiere integración con sistemas que el diagnóstico marcó como frágiles. La IA amplifica fallas existentes — resolver la deuda técnica antes de escalar."
- **Cuándo aparece**: Etapa 3 (al crear/aprobar piloto) y Etapa 4 (al escalar).

### RF-12: Automatizando el Pasado

- **Severidad**: block
- **Trigger**: Un piloto o proceso propuesto replica el flujo actual paso-a-paso sin rediseño. El facilitador marca el tipo de implementación al crear el piloto: "digitalización directa" vs. "rediseño de proceso". Si elige "digitalización directa", salta el flag.
- **Mensaje**: "Este piloto digitaliza el proceso existente sin reimaginarlo. ¿El objetivo final del usuario se puede lograr de otra forma eliminando pasos intermedios?"
- **Cuándo aparece**: Etapa 3 (al diseñar piloto) y Etapa 4 (rediseño de procesos).

### RF-13: Agent Sprawl

- **Severidad**: block
- **Trigger**: 3+ pilotos aprobados de tipo "agente/automatización" sin un owner de gobernanza asignado en el comité, O pilotos duplicados que atacan el mismo proceso desde distintas áreas.
- **Mensaje**: "Hay [N] agentes/automatizaciones en curso sin gobernanza centralizada. Riesgo de proliferación descontrolada — asignar un owner en el comité antes de aprobar más."
- **Cuándo aparece**: Etapa 3-4 (al aprobar piloto nuevo cuando ya hay varios activos).

### Cambios técnicos

- Extender motor de red flags con 3 reglas nuevas en backend
- Agregar campo `implementation_type` (enum: 'digitalization' | 'redesign') a la entidad Pilot
- No requiere cambios en frontend más allá de los datos que ya consume RedFlagBanner

---

## Componente 2: CUJ Mapper (Vista Nueva)

### Descripción

Herramienta visual para mapear el journey crítico del usuario antes de diseñar un piloto o agente. Obliga a pensar end-to-end en vez de automatizar tareas aisladas.

### Dónde vive

- Accesible desde el flujo de pilotos (botón "Mapear Journey" antes de aprobar piloto)
- Accesible desde la herramienta de procesos (F-014b) como paso previo al rediseño

### Modelo de datos

**Tabla `cujs`**:

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | Identificador |
| engagement_id | UUID FK | Engagement al que pertenece |
| name | VARCHAR(255) | Nombre del journey |
| actor | VARCHAR(255) | Rol del actor principal |
| objective | TEXT | Resultado que busca el actor |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última modificación |

**Tabla `cuj_steps`**:

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | Identificador |
| cuj_id | UUID FK | Journey al que pertenece |
| step_order | INTEGER | Posición en la secuencia |
| description | TEXT | Qué hace el actor en este paso |
| actor | VARCHAR(255) | Quién ejecuta (persona o "agente") |
| current_tool | VARCHAR(255) | Herramienta/sistema actual |
| estimated_time_minutes | INTEGER | Tiempo estimado actual |
| pain_point | TEXT | Punto de dolor (opcional) |
| agent_candidate | BOOLEAN | ¿Podría un agente ejecutar este paso? |

**Relaciones**:

- `pilots.cuj_id` FK opcional a `cujs.id` — vincula un piloto a su journey
- `processes.cuj_id` FK opcional a `cujs.id` — vincula un proceso (F-014b) a su journey

### Métricas calculadas (no almacenadas)

- Tiempo total del journey: SUM(estimated_time_minutes)
- Total de pasos: COUNT(steps)
- Pasos candidatos a agente: COUNT(steps WHERE agent_candidate = true)
- % automatizable: candidatos / total * 100

### Flujo de uso

1. Facilitador crea CUJ desde vista de pilotos o procesos
2. Agrega pasos secuencialmente (lista ordenada, drag & drop para reordenar)
3. Marca puntos de dolor y candidatos a agente
4. Sistema calcula métricas automáticamente
5. Al aprobar piloto, se puede vincular al CUJ

### Red Flag asociada

- **Severidad**: warning
- **Trigger**: Piloto aprobado sin CUJ vinculado
- **Mensaje**: "Este piloto no tiene un journey mapeado. Para pilotos que involucran múltiples pasos o actores, mapear el CUJ antes de aprobar ayuda a evitar automatizar tareas aisladas."
- Incluye botón "Mapear Journey" que lleva al CUJ Mapper pre-vinculado

### Exclusiones (YAGNI)

- No es editor visual tipo diagrama/flowchart — lista estructurada de pasos
- No genera CUJs automáticamente con IA
- No tiene versionamiento de journeys

---

## Componente 3: Value Engineering Panel (Vista Nueva)

### Descripción

Herramienta de priorización que ancla cada proyecto/piloto en impacto financiero real. Mata los proyectos "cool pero inútiles" antes de que consuman recursos.

### Dónde vive

- Panel dentro del Dashboard de escalamiento (Etapa 4) — para decidir qué pilotos escalar
- Paso en la priorización de quick wins (Etapa 2) — para filtrar recomendaciones del diagnóstico
- Columnas adicionales en la lista de pilotos (Etapa 3) — para comparar pilotos entre sí

### Campos del Value Assessment

| Campo | Tipo | Descripción |
|---|---|---|
| value_pnl | DECIMAL | Impacto estimado anual en USD (ahorro o ingreso) |
| value_pnl_type | ENUM | 'savings' o 'revenue' |
| value_effort | ENUM | 'S' / 'M' / 'L' / 'XL' |
| value_risk | ENUM | 'low' / 'medium' / 'high' |
| value_time_to_value | ENUM | 'under_4w' / '4_to_12w' / 'over_12w' |
| value_score | INTEGER | Calculado (1-100) |

### Fórmula del Value Score

```
value_score = (pnl_normalized * 0.40) + (effort_inverse * 0.25) + (risk_inverse * 0.20) + (ttv_inverse * 0.15)
```

Donde:
- `pnl_normalized`: P&L mapeado a escala 0-100 (con tope configurable, ej. $500K = 100)
- `effort_inverse`: XL=25, L=50, M=75, S=100
- `risk_inverse`: high=33, medium=66, low=100
- `ttv_inverse`: over_12w=33, 4_to_12w=66, under_4w=100

### Vista principal — Matriz de priorización

Tabla ordenada por Value Score descendente con todos los pilotos/quick wins del engagement. Columnas: nombre, Value Score, impacto P&L, esfuerzo, riesgo, tiempo al valor, estado.

### Flujo de uso

1. Al crear piloto o quick win, facilitador completa los 4 campos (obligatorio para aprobar)
2. Sistema calcula Value Score automáticamente
3. En la matriz de priorización, el comité ve el ranking y decide
4. Pilotos sin Value Score quedan como "sin evaluar" — no se pueden aprobar para escalar

### Red Flag asociada

- **Severidad**: warning
- **Trigger**: Piloto con impacto P&L < $5K/año y esfuerzo M o mayor
- **Mensaje**: "Este piloto tiene un impacto estimado bajo ($[X]/año) para su nivel de esfuerzo. Considerar si el ROI justifica la inversión."

### Exclusiones (YAGNI)

- No calcula ROI automáticamente — el facilitador estima con el cliente
- No tiene escenarios múltiples (optimista/pesimista)
- No tiene dashboard financiero separado — la matriz es la vista

---

## Integración Cross-Etapas

```
Etapa 1-2 (Diagnóstico)
  +-- Anti-patrones: RF-11 (Cimientos Rotos) se evalúa con scores de madurez
  +-- Value Engineering: Quick wins incluyen Value Score para priorizar desde el día 1

Etapa 3 (Pilotos)
  +-- Anti-patrones: RF-12 (Automatizando el Pasado) al crear piloto
  +-- CUJ Mapper: Warning si piloto no tiene journey vinculado
  +-- Value Engineering: 4 campos obligatorios antes de aprobar piloto
  +-- Flujo: Crear piloto -> Mapear CUJ (sugerido) -> Completar Value Score -> Aprobar

Etapa 4 (Escalar)
  +-- Anti-patrones: RF-13 (Agent Sprawl) al aprobar pilotos nuevos
  +-- Anti-patrones: RF-11 reaparece al escalar a sistemas con deuda técnica
  +-- CUJ Mapper: Accesible desde rediseño de procesos (F-014b)
  +-- Value Engineering: Matriz de priorización como vista principal de decisión

Etapa 5 (Transformación)
  +-- Value Engineering: KPIs acumulados (P&L total impactado) en Dashboard de Transformación
  +-- CUJ Mapper: Journeys completados como evidencia de transformación
```

## Modelo de datos — Resumen de cambios

| Entidad | Cambio |
|---|---|
| **Pilot** (existente) | Agregar: `implementation_type`, `value_pnl`, `value_pnl_type`, `value_effort`, `value_risk`, `value_time_to_value`, `value_score`, `cuj_id` (FK opcional) |
| **Process** (existente, F-014b) | Agregar: `cuj_id` (FK opcional) |
| **CUJ** (nueva) | Tabla `cujs` con campos de la sección 2 |
| **CUJStep** (nueva) | Tabla `cuj_steps` con campos de la sección 2 |
| **RedFlag rules** (config) | 4 reglas nuevas (RF-11, RF-12, RF-13 + warning value engineering) + 1 warning CUJ |

## Lo que NO cambia

- Spider chart, sesiones de diagnóstico, flujo de transcripciones
- Comité, decisiones fundacionales
- Autenticación, roles
- Dashboard de transformación (solo se agregan KPIs de Value Engineering)

## Scope estimado

| Componente | Complejidad | Archivos estimados |
|---|---|---|
| 3 Red Flags nuevas + campo implementation_type | Baja | 2-3 archivos |
| CUJ Mapper (vista + API + modelo + migración) | Media | 6-8 archivos nuevos |
| Value Engineering (panel + campos + API + migración) | Media | 5-7 archivos |
| Integración cross-etapas (modificar pilotos, procesos, dashboards) | Baja | 3-4 archivos existentes |
| **Total** | | ~15-20 archivos, ~2 semanas |

---

*Spec generada el 2026-04-12. Producto de InovaBiz.*
