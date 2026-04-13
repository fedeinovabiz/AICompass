# AI Operating Level + Madurez por Departamento — Spec de Diseño

**Fecha**: 2026-04-12
**Origen**: Análisis del AI Transformation Model de Notion + necesidades del modelo AICompass
**Estado**: Aprobado por usuario

---

## 1. Contexto y motivación

El análisis del [AI Transformation Model de Notion](https://notion.notion.site/official-the-ai-transformation-model) reveló 3 elementos de alto valor (Pareto 20/80) que complementan nuestro framework actual:

1. **Taxonomía memorable de niveles IA**: "Thought Partner → Assistant → Teammates → System" como capa comunicacional para el C-suite.
2. **Progresión del modelo operativo de IA**: Cómo opera la IA en cada nivel (standalone → contexto → agentes → orquestación).
3. **Madurez por departamento**: Las áreas funcionales maduran a ritmos diferentes — el diagnóstico organizacional puede ocultar disparidades.

AICompass ya tiene un modelo de madurez robusto (6 dimensiones × 4 niveles, 16 red flags, value engineering, CUJ mapping, 8 decisiones fundacionales) que es superior al de Notion en gobernanza, métricas y accionabilidad. Estas mejoras **complementan** sin reemplazar.

---

## 2. Decisiones de diseño

| Decisión | Elección | Justificación |
|---|---|---|
| Taxonomía Notion | Capa comunicacional + indicador calculado | No es dimensión nueva del spider chart; es un output observable |
| Madurez por área | Entidad `DepartmentArea` (Enfoque A) | Escala a assessment completo futuro; evita migración posterior |
| Catálogo de áreas | Híbrido (estándar + custom) | Catálogo da benchmarking; custom da flexibilidad por cliente |
| Área no evaluada + quick win | Herencia + warning + mini-assessment opcional | Nunca bloquear, siempre informar, refinar incrementalmente |
| "How AI operates" (Tecnología) | Derivación automática del AI Operating Level | Evita duplicar información; mantiene assessment liviano |
| Cálculo AI Operating Level | En runtime, no persistido | Evita inconsistencias; siempre refleja estado actual |

---

## 3. Modelo de datos

### 3.1 Nuevos tipos

```typescript
export type AreaAssessmentStatus = 'inherited' | 'mini-assessed' | 'full-assessed';

export type AiOperatingLevel = 1 | 2 | 3 | 4;

export type StandardArea =
  | 'finanzas'
  | 'marketing'
  | 'ventas'
  | 'operaciones'
  | 'rrhh'
  | 'legal'
  | 'it'
  | 'producto'
  | 'atencion-al-cliente'
  | 'logistica'
  | 'custom';

export interface DepartmentArea {
  id: string;
  organizationId: string;
  standardArea: StandardArea;
  customName?: string;
  displayName: string;
  maturityScores: Record<DimensionKey, number | null>;
  assessmentStatus: AreaAssessmentStatus;
  aiOperatingLevel: AiOperatingLevel | null;
  assessedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 Cambios a entidades existentes

**`Pilot`** — nuevo campo:
```typescript
departmentAreaId: string | null;
```

**`Organization`** — nuevo campo:
```typescript
aiOperatingLevel: AiOperatingLevel | null;
```

**`QuickWinSuggestion`** — nuevo campo:
```typescript
suggestedArea?: string;
```

---

## 4. AI Operating Level — Lógica de cálculo

### 4.1 Señales de entrada

| Señal | Fuente | Peso |
|---|---|---|
| Tipos de herramientas en uso | `AiTool.category` | Alto |
| Implementation type de pilotos | `Pilot.implementationType` | Alto |
| Estado de pilotos | `Pilot.status` | Medio |
| Agentes con gobernanza | Pilotos tipo agente + governance owner en comité | Medio |
| Procesos rediseñados | `ProcessMap.status` | Bajo |

### 4.2 Algoritmo

```typescript
function calculateAiOperatingLevel(
  pilots: Pilot[],
  aiTools: AiTool[],
  processes: ProcessMap[],
  hasAgentGovernanceOwner: boolean
): AiOperatingLevel {
  const activePilots = pilots.filter(p =>
    ['active', 'scale', 'evaluating'].includes(p.status));

  const hasCustomAgents = activePilots.some(p =>
    p.implementationType === 'redesign' && p.tool !== '');

  const hasMultiAgent = activePilots.filter(p =>
    p.implementationType === 'redesign').length >= 3;

  const hasCriticalProcessesAutomated = processes.filter(p =>
    ['approved', 'implementing'].includes(p.status)).length >= 2;

  const hasContextAwareTools = aiTools.some(t =>
    t.status === 'active' && ['no-code', 'custom'].includes(t.category));

  // Level 4: Multi-agent + procesos críticos + gobernanza
  if (hasMultiAgent && hasCriticalProcessesAutomated && hasAgentGovernanceOwner) {
    return 4;
  }

  // Level 3: Agentes configurados con automatización recurrente
  if (hasCustomAgents && activePilots.length >= 1) {
    return 3;
  }

  // Level 2: Herramientas con contexto empresarial
  if (hasContextAwareTools || activePilots.length >= 1) {
    return 2;
  }

  // Level 1: Solo uso ad-hoc de IA genérica
  return 1;
}
```

### 4.3 Cálculo por área vs. organización

- **Por área**: Filtra pilotos y herramientas vinculados al `departmentAreaId`. Si el área no tiene pilotos ni herramientas, hereda el nivel organizacional.
- **Por organización**: Considera todos los pilotos y herramientas. El nivel global es el **máximo** alcanzado.
- **Recálculo**: En cada lectura (runtime), no persistido.

### 4.4 Naming para UI

| Level | Etiqueta inglés | Etiqueta español |
|---|---|---|
| 1 | AI as Thought Partner | IA como Asistente de Ideas |
| 2 | AI as Assistant | IA como Asistente Operativo |
| 3 | AI as Teammates | IA como Compañero de Equipo |
| 4 | AI as the System | IA como Sistema Operativo |

Se muestra bilingüe: inglés (framework de referencia) + español (contexto LATAM).

---

## 5. Madurez por departamento — Flujo incremental

### 5.1 Ciclo de vida del área

```
[Creación] → inherited → [Mini-assessment] → mini-assessed → [Assessment completo] → full-assessed
                ↑                                                                          |
                └──────────────────── (re-evaluación) ────────────────────────────────────┘
```

- **Creación**: El facilitador selecciona áreas relevantes o el sistema las crea automáticamente cuando un piloto se asigna a un área nueva.
- **Herencia**: Los `maturityScores` se copian del baseline organizacional (`Organization.maturityScores`).
- **Mini-assessment**: 12 preguntas (2 más discriminantes × 6 dimensiones). Respondido por champion del área o líder funcional. 20-30 minutos.
- **Full-assessed**: Assessment completo de la dimensión aplicado al área (futuro).

### 5.2 Flujo: Quick win apunta a área no evaluada

```
Quick win propuesto
  → ¿Tiene área asignada?
      NO → Facilitador DEBE asignar área antes de convertir en piloto
           Sistema sugiere área basándose en valueChainSegment:
             market-to-lead     → Marketing
             lead-to-sale       → Ventas
             sale-to-delivery   → Operaciones
             delivery-to-success → Atención al Cliente
             success-to-market  → Marketing/Ventas
      SÍ → ¿El área existe?
             NO → Crear área con scores heredados (automático)
             SÍ → ¿assessmentStatus = 'inherited'?
                    SÍ → Mostrar badge: "Área sin diagnóstico propio"
                         + Sugerir mini-assessment si esfuerzo ≥ M o 2+ pilotos en área
                    NO → Proceder normal
```

### 5.3 Triggers de sugerencia de mini-assessment

El sistema muestra un nudge (no bloquea) cuando:
- Piloto con esfuerzo ≥ M asignado a área con status `'inherited'`
- 2+ pilotos apuntando a la misma área con status `'inherited'`
- El comité solicita evidencia antes de tomar decisión

### 5.4 Nuevo red flag: RF17

```typescript
{
  id: 'RF17',
  severity: 'warning',
  title: 'Área con múltiples pilotos sin diagnóstico propio',
  description: 'Hay 2+ pilotos activos en un área cuya madurez se basa en scores heredados del baseline organizacional, no en un diagnóstico propio.',
  stage: 3,
  condition: '2+ pilotos activos/evaluating en un área con assessmentStatus = inherited.',
  recommendation: 'Realizar mini-assessment del área para validar que los scores organizacionales aplican. Un área puede estar significativamente por encima o por debajo del promedio.',
  canOverride: true,
}
```

---

## 6. Base de datos — Migración

```sql
-- 003_department_areas.sql

-- 1. Tabla de áreas departamentales
CREATE TABLE department_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  standard_area VARCHAR(50) NOT NULL,
  custom_name VARCHAR(100),
  display_name VARCHAR(100) NOT NULL,
  maturity_scores JSONB DEFAULT '{}',
  assessment_status VARCHAR(20) DEFAULT 'inherited'
    CHECK (assessment_status IN ('inherited', 'mini-assessed', 'full-assessed')),
  -- ai_operating_level NO se persiste: se calcula en runtime (ver sección 4.3)
  assessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, standard_area, custom_name)
);

CREATE INDEX idx_dept_areas_org ON department_areas(organization_id);

-- 2. Vincular pilotos a áreas
ALTER TABLE pilots ADD COLUMN department_area_id UUID REFERENCES department_areas(id);
CREATE INDEX idx_pilots_dept_area ON pilots(department_area_id);
```

Migración no destructiva. Pilotos existentes quedan con `department_area_id = NULL`.

---

## 7. API — Endpoints

### 7.1 Nuevos endpoints

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/areas/organization/:orgId` | Lista áreas con scores y AI Operating Level |
| `POST` | `/api/areas` | Crear área (estándar o custom). Auto-hereda scores |
| `GET` | `/api/areas/:areaId` | Detalle de área con pilotos vinculados |
| `PUT` | `/api/areas/:areaId` | Actualizar nombre, área padre |
| `DELETE` | `/api/areas/:areaId` | Eliminar área (solo si no tiene pilotos) |
| `POST` | `/api/areas/:areaId/mini-assessment` | Guardar respuestas y calcular scores propios |
| `PUT` | `/api/areas/:areaId/scores` | Override manual de scores por facilitador |
| `POST` | `/api/areas/:areaId/reset-to-inherited` | Volver a scores heredados |
| `GET` | `/api/ai-level/organization/:orgId` | Level global + level por cada área (calculado) |

### 7.2 Endpoints modificados

| Método | Ruta | Cambio |
|---|---|---|
| `POST` | `/api/pilots` | Nuevo campo opcional: `departmentAreaId` |
| `PUT` | `/api/pilots/:pilotId` | Permite asignar/cambiar `departmentAreaId` |
| `GET` | `/api/red-flags/organization/:orgId` | Evalúa RF17 |

---

## 8. Frontend — Páginas y componentes

### 8.1 Nuevas páginas

| Ruta | Propósito |
|---|---|
| `/org/:orgId/areas` | Lista de áreas: status, AI Operating Level, cantidad de pilotos |
| `/org/:orgId/areas/:areaId` | Detalle: spider chart, pilotos vinculados, botón mini-assessment |
| `/org/:orgId/areas/:areaId/mini-assessment` | Formulario de 12 preguntas |

### 8.2 Nuevos componentes

| Componente | Descripción | Uso |
|---|---|---|
| `AiOperatingLevelBadge` | Badge con icono + nivel + etiqueta (ej: "L3 — AI as Teammates") | Dashboard, detalle área, detalle piloto |
| `AreaAssessmentStatusIcon` | Icono: inherited (gris) / mini-assessed (amarillo) / full-assessed (verde) | Lista áreas, detalle área |
| `AreaMaturitySpider` | Spider chart con línea punteada (heredados) vs sólida (propios) | Detalle área |
| `AreaSelector` | Dropdown catálogo estándar + "Crear área custom" | Formulario creación/edición piloto |

### 8.3 Modificaciones a páginas existentes

| Página | Cambio |
|---|---|
| Dashboard (`/org/:orgId`) | Agregar barra horizontal de áreas con AI Operating Level + badge global |
| Formulario de piloto | Agregar `AreaSelector` como campo (opcional al crear, requerido antes de activar) |
| Lista de pilotos | Mostrar columna de área asignada |
| Red flags | Incluir RF17 en evaluación |

---

## 9. Resumen de impacto

| Capa | Cambio | Impacto |
|---|---|---|
| **Tipos** | Nueva entidad `DepartmentArea`, nuevos types, campo en `Pilot` y `Organization` | Medio |
| **Base de datos** | Nueva tabla `department_areas`, nueva columna en `pilots` | Bajo |
| **Backend** | 9 endpoints nuevos, 3 modificados, 1 red flag nuevo (RF17), función `calculateAiOperatingLevel` | Medio |
| **Frontend** | 3 páginas nuevas, 4 componentes nuevos, modificaciones a 4 páginas existentes | Medio |
| **Migración** | No destructiva, pilotos existentes quedan con área NULL | Bajo |

---

## 10. Fuera de alcance (explícitamente excluido)

- Assessment completo por área (futuro, cuando el flujo incremental lo justifique)
- Benchmarking inter-organizacional por área (requiere masa crítica de datos)
- Integración directa con Notion o cualquier vendor específico
- Modificación de las 6 dimensiones del spider chart organizacional
- Cambio de las 5 etapas de transformación por los 4 niveles de Notion
