# AI Operating Level + Madurez por Departamento — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar madurez incremental por departamento, AI Operating Level calculado (taxonomía Notion), y red flag RF17 a AICompass.

**Architecture:** Nueva entidad `DepartmentArea` vinculada a `Organization`, con scores heredados del baseline org o propios vía mini-assessment. AI Operating Level se calcula en runtime desde pilotos/herramientas existentes. Los pilotos se vinculan opcionalmente a un área.

**Tech Stack:** React 19, Vite, TypeScript, Zustand, Tailwind (frontend) / Node.js, Express, PostgreSQL (backend)

**Spec:** `docs/superpowers/specs/2026-04-12-ai-operating-level-department-areas-design.md`

---

## File Map

### Create
| File | Responsibility |
|---|---|
| `backend/migrations/003_department_areas.sql` | Tabla `department_areas` + columna `department_area_id` en `pilots` |
| `backend/src/routes/areas.ts` | CRUD de áreas + mini-assessment + AI level endpoint |
| `backend/src/services/aiOperatingLevel.ts` | Función pura de cálculo del AI Operating Level |
| `src/stores/areaStore.ts` | Zustand store para áreas departamentales |
| `src/components/AiOperatingLevelBadge.tsx` | Badge visual L1-L4 con etiqueta bilingüe |
| `src/components/AreaAssessmentStatusIcon.tsx` | Icono inherited/mini-assessed/full-assessed |
| `src/components/AreaSelector.tsx` | Dropdown catálogo estándar + custom |
| `src/components/AreaMaturitySpider.tsx` | Spider chart con línea punteada (heredado) vs sólida (propio) |
| `src/pages/AreaListPage.tsx` | Lista de áreas con status y AI Level |
| `src/pages/AreaDetailPage.tsx` | Detalle de área: spider, pilotos, mini-assessment |
| `src/pages/AreaMiniAssessmentPage.tsx` | Formulario de 12 preguntas |

### Modify
| File | Change |
|---|---|
| `src/types/index.ts` | Agregar tipos `DepartmentArea`, `AiOperatingLevel`, `StandardArea`, `AreaAssessmentStatus` |
| `backend/src/constants/redFlags.ts` | Agregar RF17 |
| `backend/src/services/redFlagEvaluator.ts` | Agregar evaluador RF17 + `departmentAreaId` en `OrgState.pilots` |
| `backend/src/routes/pilots.ts` | Aceptar y persistir `departmentAreaId` en POST y PUT |
| `backend/src/index.ts` | Registrar `areaRoutes` |
| `src/stores/pilotStore.ts` | Agregar `departmentAreaId` a `CreatePilotData` y `UpdatePilotData` |
| `src/App.tsx` | Agregar rutas `/org/:orgId/areas/*` |
| `src/pages/DashboardPage.tsx` | Mostrar `AiOperatingLevelBadge` en `OrgCard` |

---

### Task 1: Migración de base de datos

**Files:**
- Create: `ai-compass/backend/migrations/003_department_areas.sql`

- [ ] **Step 1: Crear archivo de migración**

```sql
-- 003_department_areas.sql
-- Madurez incremental por departamento + vinculación de pilotos a áreas

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

- [ ] **Step 2: Ejecutar migración contra la base local**

Run: `cd ai-compass/backend && psql -U postgres -d aicompass -f migrations/003_department_areas.sql`
Expected: CREATE TABLE, CREATE INDEX, ALTER TABLE sin errores.

- [ ] **Step 3: Verificar que la tabla existe**

Run: `psql -U postgres -d aicompass -c "\d department_areas"`
Expected: Tabla con columnas id, organization_id, standard_area, custom_name, display_name, maturity_scores, assessment_status, assessed_at, created_at, updated_at.

- [ ] **Step 4: Verificar columna en pilots**

Run: `psql -U postgres -d aicompass -c "\d pilots" | grep department`
Expected: `department_area_id | uuid |`

- [ ] **Step 5: Commit**

```bash
git add ai-compass/backend/migrations/003_department_areas.sql
git commit -m "feat: migración 003 — tabla department_areas + columna en pilots"
```

---

### Task 2: Tipos TypeScript

**Files:**
- Modify: `ai-compass/src/types/index.ts`

- [ ] **Step 1: Agregar nuevos tipos al final de la sección de enums**

Después de la línea `export type ImplementationLevel = 'prompting' | 'no-code' | 'custom';` (línea 64), agregar:

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
```

- [ ] **Step 2: Agregar interfaz DepartmentArea**

Después de la sección de `ProcessMap` (tras línea 505), agregar:

```typescript
// ══════════════════════════════════════════════
// ÁREAS DEPARTAMENTALES
// ══════════════════════════════════════════════

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

export interface MiniAssessmentAnswer {
  dimension: DimensionKey;
  questionIndex: number;
  questionText: string;
  answer: string;
  suggestedLevel: MaturityLevel;
}
```

- [ ] **Step 3: Agregar campo `departmentAreaId` a `Pilot`**

En la interfaz `Pilot` (línea 273), agregar después de `organizationId`:

```typescript
departmentAreaId: string | null;
```

- [ ] **Step 4: Agregar campo `aiOperatingLevel` a `Organization`**

En la interfaz `Organization` (línea 97), agregar después de `maturityScores`:

```typescript
aiOperatingLevel: AiOperatingLevel | null;
```

- [ ] **Step 5: Agregar `suggestedArea` a `QuickWinSuggestion`**

En la interfaz `QuickWinSuggestion` (línea 369), agregar al final:

```typescript
suggestedArea?: string;
```

- [ ] **Step 6: Verificar que compila**

Run: `cd ai-compass && npx tsc --noEmit 2>&1 | head -20`
Expected: Sin errores nuevos (puede haber errores preexistentes, pero no de los tipos agregados).

- [ ] **Step 7: Commit**

```bash
git add ai-compass/src/types/index.ts
git commit -m "feat: tipos TypeScript para DepartmentArea, AiOperatingLevel y StandardArea"
```

---

### Task 3: Servicio de cálculo del AI Operating Level

**Files:**
- Create: `ai-compass/backend/src/services/aiOperatingLevel.ts`

- [ ] **Step 1: Crear el servicio con la función de cálculo**

```typescript
// ══════════════════════════════════════════════
// AI OPERATING LEVEL — Cálculo en runtime
// ══════════════════════════════════════════════

export type AiOperatingLevel = 1 | 2 | 3 | 4;

export interface AiLevelInput {
  pilots: Array<{
    status: string;
    implementationType: string | null;
    tool: string | null;
    departmentAreaId: string | null;
  }>;
  aiTools: Array<{
    status: string;
    category: string;
    teamsUsing: string[];
  }>;
  processes: Array<{
    status: string;
  }>;
  hasAgentGovernanceOwner: boolean;
}

export const AI_LEVEL_LABELS: Record<AiOperatingLevel, { en: string; es: string }> = {
  1: { en: 'AI as Thought Partner', es: 'IA como Asistente de Ideas' },
  2: { en: 'AI as Assistant', es: 'IA como Asistente Operativo' },
  3: { en: 'AI as Teammates', es: 'IA como Compañero de Equipo' },
  4: { en: 'AI as the System', es: 'IA como Sistema Operativo' },
};

export function calculateAiOperatingLevel(input: AiLevelInput): AiOperatingLevel {
  const { pilots, aiTools, processes, hasAgentGovernanceOwner } = input;

  const activePilots = pilots.filter(p =>
    ['active', 'scale', 'evaluating'].includes(p.status),
  );

  const hasCustomAgents = activePilots.some(
    p => p.implementationType === 'redesign' && p.tool && p.tool.length > 0,
  );

  const redesignCount = activePilots.filter(
    p => p.implementationType === 'redesign',
  ).length;

  const automatedProcessCount = processes.filter(p =>
    ['approved', 'implementing'].includes(p.status),
  ).length;

  const hasContextAwareTools = aiTools.some(
    t => t.status === 'active' && ['no-code', 'custom'].includes(t.category),
  );

  // Level 4: Multi-agent + procesos críticos + gobernanza
  if (redesignCount >= 3 && automatedProcessCount >= 2 && hasAgentGovernanceOwner) {
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

  // Level 1: Solo uso ad-hoc
  return 1;
}

export function calculateAiLevelForArea(
  areaId: string,
  input: AiLevelInput,
): AiOperatingLevel {
  const filtered: AiLevelInput = {
    ...input,
    pilots: input.pilots.filter(p => p.departmentAreaId === areaId),
  };

  // Si el área no tiene pilotos, retorna level 1 (se mostrará el org level como fallback en el frontend)
  if (filtered.pilots.length === 0) {
    return 1;
  }

  return calculateAiOperatingLevel(filtered);
}
```

- [ ] **Step 2: Verificar que compila**

Run: `cd ai-compass/backend && npx tsc --noEmit 2>&1 | head -10`
Expected: Sin errores en el nuevo archivo.

- [ ] **Step 3: Commit**

```bash
git add ai-compass/backend/src/services/aiOperatingLevel.ts
git commit -m "feat: servicio de cálculo AI Operating Level (runtime, no persistido)"
```

---

### Task 4: Red flag RF17

**Files:**
- Modify: `ai-compass/backend/src/constants/redFlags.ts`
- Modify: `ai-compass/backend/src/services/redFlagEvaluator.ts`

- [ ] **Step 1: Agregar RF17 al array de constantes**

En `ai-compass/backend/src/constants/redFlags.ts`, agregar al final del array `RED_FLAG_RULES` (antes del `]` de cierre en línea 180):

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
  },
```

- [ ] **Step 2: Agregar `departmentAreaId` al tipo `OrgState` del evaluador**

En `ai-compass/backend/src/services/redFlagEvaluator.ts`, modificar la interfaz `OrgState`. En el array `pilots` (línea 21-29), agregar el campo:

```typescript
    departmentAreaId: string | null;
```

- [ ] **Step 3: Agregar campo `departmentAreas` a `OrgState`**

Agregar al final de la interfaz `OrgState` (antes del `}`):

```typescript
  departmentAreas: Array<{
    id: string;
    assessmentStatus: string;
  }>;
```

- [ ] **Step 4: Agregar función evaluadora RF17**

Antes del mapa `EVALUADORES`, agregar:

```typescript
function evaluarRF17(state: OrgState): boolean {
  // RF17: 2+ pilotos activos en un área con assessment heredado
  const pilotosActivos = state.pilots.filter(
    (p) => ['active', 'evaluating'].includes(p.status) && p.departmentAreaId,
  );

  // Agrupar pilotos por área
  const porArea = new Map<string, number>();
  for (const p of pilotosActivos) {
    const areaId = p.departmentAreaId!;
    porArea.set(areaId, (porArea.get(areaId) ?? 0) + 1);
  }

  // Verificar si algún área con 2+ pilotos tiene status inherited
  for (const [areaId, count] of porArea) {
    if (count < 2) continue;
    const area = state.departmentAreas.find((a) => a.id === areaId);
    if (area && area.assessmentStatus === 'inherited') {
      return true;
    }
  }

  return false;
}
```

- [ ] **Step 5: Registrar RF17 en el mapa de evaluadores**

En el objeto `EVALUADORES`, agregar:

```typescript
  RF17: evaluarRF17,      // Área con múltiples pilotos sin diagnóstico propio
```

- [ ] **Step 6: Verificar que compila**

Run: `cd ai-compass/backend && npx tsc --noEmit 2>&1 | head -10`
Expected: Sin errores.

- [ ] **Step 7: Commit**

```bash
git add ai-compass/backend/src/constants/redFlags.ts ai-compass/backend/src/services/redFlagEvaluator.ts
git commit -m "feat: red flag RF17 — área con múltiples pilotos sin diagnóstico propio"
```

---

### Task 5: Backend — Ruta de áreas y AI Level

**Files:**
- Create: `ai-compass/backend/src/routes/areas.ts`
- Modify: `ai-compass/backend/src/index.ts`

- [ ] **Step 1: Crear ruta de áreas**

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { query, getOne, getMany } from '../db';
import {
  calculateAiOperatingLevel,
  calculateAiLevelForArea,
  AI_LEVEL_LABELS,
} from '../services/aiOperatingLevel';
import type { AiLevelInput } from '../services/aiOperatingLevel';

const router = Router();
router.use(authMiddleware);

// Helper: cargar datos para cálculo de AI Level de una org
async function loadAiLevelInput(orgId: string): Promise<AiLevelInput> {
  const pilots = await getMany(
    `SELECT status, implementation_type, tool, department_area_id FROM pilots WHERE organization_id = $1`,
    [orgId],
  );
  const aiTools = await getMany(
    `SELECT status, category, teams_using FROM ai_tools WHERE organization_id = $1`,
    [orgId],
  );
  const processes = await getMany(
    `SELECT status FROM process_maps WHERE organization_id = $1`,
    [orgId],
  );
  const committee = await getOne(
    `SELECT id FROM committees WHERE organization_id = $1`,
    [orgId],
  );
  let hasAgentGovernanceOwner = false;
  if (committee) {
    const owner = await getOne(
      `SELECT id FROM committee_members WHERE committee_id = $1 AND role IN ('it-rep', 'operational-leader')`,
      [(committee as { id: string }).id],
    );
    hasAgentGovernanceOwner = !!owner;
  }

  return {
    pilots: (pilots as Array<Record<string, unknown>>).map(p => ({
      status: p.status as string,
      implementationType: p.implementation_type as string | null,
      tool: p.tool as string | null,
      departmentAreaId: p.department_area_id as string | null,
    })),
    aiTools: (aiTools as Array<Record<string, unknown>>).map(t => ({
      status: t.status as string,
      category: t.category as string,
      teamsUsing: (t.teams_using as string[]) ?? [],
    })),
    processes: (processes as Array<Record<string, unknown>>).map(p => ({
      status: p.status as string,
    })),
    hasAgentGovernanceOwner,
  };
}

// GET /organization/:orgId — Lista áreas de la organización
router.get('/organization/:orgId', async (req, res, next) => {
  try {
    const areas = await getMany(
      'SELECT * FROM department_areas WHERE organization_id = $1 ORDER BY display_name',
      [req.params.orgId],
    );

    const aiInput = await loadAiLevelInput(req.params.orgId);

    const areasWithLevel = (areas as Array<Record<string, unknown>>).map(area => {
      const areaId = area.id as string;
      const areaPilots = aiInput.pilots.filter(p => p.departmentAreaId === areaId);
      const level = areaPilots.length > 0
        ? calculateAiLevelForArea(areaId, aiInput)
        : null;

      return {
        ...area,
        aiOperatingLevel: level,
        aiOperatingLevelLabel: level ? AI_LEVEL_LABELS[level] : null,
        pilotCount: areaPilots.length,
      };
    });

    res.json(areasWithLevel);
  } catch (err) {
    next(err);
  }
});

// POST / — Crear área (hereda scores del baseline org)
router.post('/', async (req, res, next) => {
  try {
    const { organizationId, standardArea, customName } = req.body;
    if (!organizationId || !standardArea) {
      res.status(400).json({ message: 'organizationId y standardArea son requeridos', code: 'VALIDATION_ERROR' });
      return;
    }

    // Obtener baseline org para heredar scores
    const org = await getOne(
      'SELECT maturity_scores FROM organizations WHERE id = $1',
      [organizationId],
    );
    const orgScores = org ? (org as { maturity_scores: Record<string, number | null> }).maturity_scores : {};

    const displayName = customName ?? standardArea;

    const result = await query(
      `INSERT INTO department_areas (organization_id, standard_area, custom_name, display_name, maturity_scores, assessment_status)
       VALUES ($1, $2, $3, $4, $5, 'inherited')
       RETURNING *`,
      [organizationId, standardArea, customName ?? null, displayName, JSON.stringify(orgScores)],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /:id — Detalle de área con pilotos vinculados
router.get('/:id', async (req, res, next) => {
  try {
    const area = await getOne('SELECT * FROM department_areas WHERE id = $1', [req.params.id]);
    if (!area) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const areaData = area as Record<string, unknown>;
    const orgId = areaData.organization_id as string;

    const pilots = await getMany(
      'SELECT * FROM pilots WHERE department_area_id = $1 ORDER BY created_at DESC',
      [req.params.id],
    );

    const aiInput = await loadAiLevelInput(orgId);
    const level = calculateAiLevelForArea(req.params.id, aiInput);

    res.json({
      ...areaData,
      pilots,
      aiOperatingLevel: level,
      aiOperatingLevelLabel: AI_LEVEL_LABELS[level],
    });
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Actualizar área
router.put('/:id', async (req, res, next) => {
  try {
    const { displayName, standardArea, customName } = req.body;

    const result = await query(
      `UPDATE department_areas SET
         display_name = COALESCE($1, display_name),
         standard_area = COALESCE($2, standard_area),
         custom_name = COALESCE($3, custom_name),
         updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [displayName ?? null, standardArea ?? null, customName ?? null, req.params.id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id — Eliminar área (solo si no tiene pilotos)
router.delete('/:id', async (req, res, next) => {
  try {
    const pilotCount = await getOne(
      'SELECT COUNT(*) as count FROM pilots WHERE department_area_id = $1',
      [req.params.id],
    );
    if (pilotCount && Number((pilotCount as { count: string }).count) > 0) {
      res.status(400).json({
        message: 'No se puede eliminar un área con pilotos vinculados',
        code: 'HAS_PILOTS',
      });
      return;
    }

    const result = await query('DELETE FROM department_areas WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /:id/mini-assessment — Guardar mini-assessment y actualizar scores
router.post('/:id/mini-assessment', async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ message: 'El campo answers (array) es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    // Calcular scores por dimensión: promedio de los levels sugeridos por dimensión
    const scoresByDimension: Record<string, number[]> = {};
    for (const answer of answers) {
      const dim = answer.dimension as string;
      const level = answer.suggestedLevel as number;
      if (!scoresByDimension[dim]) scoresByDimension[dim] = [];
      scoresByDimension[dim].push(level);
    }

    const maturityScores: Record<string, number> = {};
    for (const [dim, levels] of Object.entries(scoresByDimension)) {
      maturityScores[dim] = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
    }

    const result = await query(
      `UPDATE department_areas SET
         maturity_scores = $1,
         assessment_status = 'mini-assessed',
         assessed_at = NOW(),
         updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(maturityScores), req.params.id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id/scores — Override manual de scores
router.put('/:id/scores', async (req, res, next) => {
  try {
    const { maturityScores } = req.body;
    if (!maturityScores) {
      res.status(400).json({ message: 'El campo maturityScores es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const result = await query(
      `UPDATE department_areas SET
         maturity_scores = $1,
         updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(maturityScores), req.params.id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /:id/reset-to-inherited — Volver a scores heredados
router.post('/:id/reset-to-inherited', async (req, res, next) => {
  try {
    const area = await getOne('SELECT organization_id FROM department_areas WHERE id = $1', [req.params.id]);
    if (!area) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const orgId = (area as { organization_id: string }).organization_id;
    const org = await getOne('SELECT maturity_scores FROM organizations WHERE id = $1', [orgId]);
    const orgScores = org ? (org as { maturity_scores: Record<string, number | null> }).maturity_scores : {};

    const result = await query(
      `UPDATE department_areas SET
         maturity_scores = $1,
         assessment_status = 'inherited',
         assessed_at = NULL,
         updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(orgScores), req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /ai-level/organization/:orgId — AI Operating Level global + por área
router.get('/ai-level/organization/:orgId', async (req, res, next) => {
  try {
    const aiInput = await loadAiLevelInput(req.params.orgId);
    const globalLevel = calculateAiOperatingLevel(aiInput);

    const areas = await getMany(
      'SELECT id, display_name, assessment_status FROM department_areas WHERE organization_id = $1',
      [req.params.orgId],
    );

    const areaLevels = (areas as Array<Record<string, unknown>>).map(area => {
      const areaId = area.id as string;
      const areaPilots = aiInput.pilots.filter(p => p.departmentAreaId === areaId);
      const level = areaPilots.length > 0
        ? calculateAiLevelForArea(areaId, aiInput)
        : null;

      return {
        areaId,
        displayName: area.display_name,
        assessmentStatus: area.assessment_status,
        aiOperatingLevel: level,
        aiOperatingLevelLabel: level ? AI_LEVEL_LABELS[level] : null,
      };
    });

    res.json({
      global: {
        aiOperatingLevel: globalLevel,
        aiOperatingLevelLabel: AI_LEVEL_LABELS[globalLevel],
      },
      areas: areaLevels,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
```

- [ ] **Step 2: Registrar rutas en index.ts**

En `ai-compass/backend/src/index.ts`, agregar import y uso:

Después de `import valueEngineeringRoutes from './routes/valueEngineering';` (línea 21):
```typescript
import areaRoutes from './routes/areas';
```

Después de `app.use('/api/value-engineering', valueEngineeringRoutes);` (línea 48):
```typescript
app.use('/api/areas', areaRoutes);
```

- [ ] **Step 3: Verificar que compila**

Run: `cd ai-compass/backend && npx tsc --noEmit 2>&1 | head -10`
Expected: Sin errores.

- [ ] **Step 4: Commit**

```bash
git add ai-compass/backend/src/routes/areas.ts ai-compass/backend/src/index.ts
git commit -m "feat: endpoints CRUD áreas departamentales + AI Operating Level"
```

---

### Task 6: Backend — Modificar pilotos para aceptar departmentAreaId

**Files:**
- Modify: `ai-compass/backend/src/routes/pilots.ts`

- [ ] **Step 1: Agregar `departmentAreaId` al INSERT de creación**

En `ai-compass/backend/src/routes/pilots.ts`, en el handler POST (línea 64), agregar `departmentAreaId` al destructuring:

```typescript
    const {
      organizationId, name, description, targetProcess, startDate, endDate,
      implementationType, cujId, valuePnl, valuePnlType, valueEffort, valueRisk, valueTimeToValue,
      departmentAreaId,
    } = req.body;
```

Modificar la query INSERT para incluir `department_area_id`:

```sql
INSERT INTO pilots (organization_id, title, process_description, target_process, start_date, end_date, status,
  implementation_type, cuj_id, value_pnl, value_pnl_type, value_effort, value_risk, value_time_to_value, value_score,
  department_area_id)
VALUES ($1, $2, $3, $4, $5, $6, 'planning', $7, $8, $9, $10, $11, $12, $13, $14, $15)
RETURNING *
```

Agregar `departmentAreaId ?? null` como parámetro $15 al array de valores.

- [ ] **Step 2: Agregar `departmentAreaId` al UPDATE**

En el handler PUT (línea 96), agregar `departmentAreaId` al destructuring:

```typescript
    const {
      title, status, workflowDesign, championAssignments, roleImpacts,
      startDate,
      implementationType, cujId, valuePnl, valuePnlType, valueEffort, valueRisk, valueTimeToValue,
      departmentAreaId,
    } = req.body;
```

Agregar al SET de la query UPDATE:

```sql
department_area_id = COALESCE($16, department_area_id),
```

Agregar `departmentAreaId ?? null` como parámetro $16 (y ajustar el WHERE a $17).

- [ ] **Step 3: Verificar que compila**

Run: `cd ai-compass/backend && npx tsc --noEmit 2>&1 | head -10`
Expected: Sin errores.

- [ ] **Step 4: Commit**

```bash
git add ai-compass/backend/src/routes/pilots.ts
git commit -m "feat: pilotos aceptan departmentAreaId en creación y actualización"
```

---

### Task 7: Frontend — Store de áreas (Zustand)

**Files:**
- Create: `ai-compass/src/stores/areaStore.ts`

- [ ] **Step 1: Crear el store**

```typescript
// ══════════════════════════════════════════════
// AREA STORE — Gestión de áreas departamentales
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDel } from '@/services/apiClient';
import type { DepartmentArea, MiniAssessmentAnswer } from '@/types';

interface AiLevelResponse {
  global: {
    aiOperatingLevel: number;
    aiOperatingLevelLabel: { en: string; es: string };
  };
  areas: Array<{
    areaId: string;
    displayName: string;
    assessmentStatus: string;
    aiOperatingLevel: number | null;
    aiOperatingLevelLabel: { en: string; es: string } | null;
  }>;
}

interface AreaState {
  areas: DepartmentArea[];
  currentArea: (DepartmentArea & { pilots?: unknown[] }) | null;
  aiLevels: AiLevelResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchAreas: (orgId: string) => Promise<void>;
  fetchArea: (id: string) => Promise<void>;
  createArea: (orgId: string, standardArea: string, customName?: string) => Promise<DepartmentArea>;
  updateArea: (id: string, data: { displayName?: string; standardArea?: string; customName?: string }) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;
  submitMiniAssessment: (id: string, answers: MiniAssessmentAnswer[]) => Promise<void>;
  overrideScores: (id: string, scores: Record<string, number | null>) => Promise<void>;
  resetToInherited: (id: string) => Promise<void>;
  fetchAiLevels: (orgId: string) => Promise<void>;
}

export const useAreaStore = create<AreaState>((set) => ({
  areas: [],
  currentArea: null,
  aiLevels: null,
  isLoading: false,
  error: null,

  fetchAreas: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const areas = await apiGet<DepartmentArea[]>(`/areas/organization/${orgId}`);
      set({ areas, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar áreas', isLoading: false });
    }
  },

  fetchArea: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const area = await apiGet<DepartmentArea & { pilots?: unknown[] }>(`/areas/${id}`);
      set({ currentArea: area, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar área', isLoading: false });
    }
  },

  createArea: async (orgId: string, standardArea: string, customName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const area = await apiPost<DepartmentArea>('/areas', { organizationId: orgId, standardArea, customName });
      set((state) => ({ areas: [...state.areas, area], isLoading: false }));
      return area;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al crear área', isLoading: false });
      throw err;
    }
  },

  updateArea: async (id: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<DepartmentArea>(`/areas/${id}`, data);
      set((state) => ({
        areas: state.areas.map(a => a.id === id ? updated : a),
        currentArea: state.currentArea?.id === id ? { ...updated, pilots: state.currentArea?.pilots } : state.currentArea,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar área', isLoading: false });
      throw err;
    }
  },

  deleteArea: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiDel(`/areas/${id}`);
      set((state) => ({
        areas: state.areas.filter(a => a.id !== id),
        currentArea: state.currentArea?.id === id ? null : state.currentArea,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al eliminar área', isLoading: false });
      throw err;
    }
  },

  submitMiniAssessment: async (id: string, answers: MiniAssessmentAnswer[]) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPost<DepartmentArea>(`/areas/${id}/mini-assessment`, { answers });
      set((state) => ({
        areas: state.areas.map(a => a.id === id ? updated : a),
        currentArea: state.currentArea?.id === id ? { ...updated, pilots: state.currentArea?.pilots } : state.currentArea,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al guardar mini-assessment', isLoading: false });
      throw err;
    }
  },

  overrideScores: async (id: string, scores: Record<string, number | null>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<DepartmentArea>(`/areas/${id}/scores`, { maturityScores: scores });
      set((state) => ({
        areas: state.areas.map(a => a.id === id ? updated : a),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar scores', isLoading: false });
      throw err;
    }
  },

  resetToInherited: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPost<DepartmentArea>(`/areas/${id}/reset-to-inherited`, {});
      set((state) => ({
        areas: state.areas.map(a => a.id === id ? updated : a),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al resetear scores', isLoading: false });
      throw err;
    }
  },

  fetchAiLevels: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const levels = await apiGet<AiLevelResponse>(`/areas/ai-level/organization/${orgId}`);
      set({ aiLevels: levels, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar AI levels', isLoading: false });
      throw err;
    }
  },
}));
```

- [ ] **Step 2: Verificar que compila**

Run: `cd ai-compass && npx tsc --noEmit 2>&1 | head -10`
Expected: Sin errores.

- [ ] **Step 3: Commit**

```bash
git add ai-compass/src/stores/areaStore.ts
git commit -m "feat: Zustand store para áreas departamentales y AI levels"
```

---

### Task 8: Frontend — Modificar pilotStore para departmentAreaId

**Files:**
- Modify: `ai-compass/src/stores/pilotStore.ts`

- [ ] **Step 1: Agregar `departmentAreaId` a `CreatePilotData`**

En `ai-compass/src/stores/pilotStore.ts`, agregar al final de `CreatePilotData` (antes del `}`):

```typescript
  departmentAreaId?: string;
```

- [ ] **Step 2: Agregar `departmentAreaId` a `UpdatePilotData`**

Agregar al final de `UpdatePilotData` (antes del `}`):

```typescript
  departmentAreaId?: string | null;
```

- [ ] **Step 3: Verificar que compila**

Run: `cd ai-compass && npx tsc --noEmit 2>&1 | head -10`
Expected: Sin errores.

- [ ] **Step 4: Commit**

```bash
git add ai-compass/src/stores/pilotStore.ts
git commit -m "feat: pilotStore acepta departmentAreaId"
```

---

### Task 9: Frontend — Componentes reutilizables

**Files:**
- Create: `ai-compass/src/components/AiOperatingLevelBadge.tsx`
- Create: `ai-compass/src/components/AreaAssessmentStatusIcon.tsx`
- Create: `ai-compass/src/components/AreaSelector.tsx`

- [ ] **Step 1: Crear AiOperatingLevelBadge**

```tsx
// ══════════════════════════════════════════════
// AI OPERATING LEVEL BADGE
// ══════════════════════════════════════════════

import type { AiOperatingLevel } from '@/types';

const LEVEL_CONFIG: Record<AiOperatingLevel, { en: string; es: string; color: string }> = {
  1: { en: 'AI as Thought Partner', es: 'IA como Asistente de Ideas', color: 'bg-slate-700 text-slate-300' },
  2: { en: 'AI as Assistant', es: 'IA como Asistente Operativo', color: 'bg-blue-900 text-blue-300' },
  3: { en: 'AI as Teammates', es: 'IA como Compañero de Equipo', color: 'bg-purple-900 text-purple-300' },
  4: { en: 'AI as the System', es: 'IA como Sistema Operativo', color: 'bg-amber-900 text-amber-300' },
};

interface Props {
  level: AiOperatingLevel | null;
  size?: 'sm' | 'md';
}

export default function AiOperatingLevelBadge({ level, size = 'sm' }: Props) {
  if (!level) return null;

  const config = LEVEL_CONFIG[level];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${sizeClasses}`}>
      <span className="font-bold">L{level}</span>
      <span className="hidden sm:inline">{config.es}</span>
    </span>
  );
}
```

- [ ] **Step 2: Crear AreaAssessmentStatusIcon**

```tsx
// ══════════════════════════════════════════════
// AREA ASSESSMENT STATUS ICON
// ══════════════════════════════════════════════

import type { AreaAssessmentStatus } from '@/types';

const STATUS_CONFIG: Record<AreaAssessmentStatus, { label: string; dotColor: string; bgColor: string }> = {
  inherited: { label: 'Heredado', dotColor: 'bg-slate-400', bgColor: 'bg-slate-800 text-slate-400' },
  'mini-assessed': { label: 'Mini-assessment', dotColor: 'bg-yellow-400', bgColor: 'bg-yellow-900/30 text-yellow-400' },
  'full-assessed': { label: 'Evaluado', dotColor: 'bg-green-400', bgColor: 'bg-green-900/30 text-green-400' },
};

interface Props {
  status: AreaAssessmentStatus;
  showLabel?: boolean;
}

export default function AreaAssessmentStatusIcon({ status, showLabel = true }: Props) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {showLabel && config.label}
    </span>
  );
}
```

- [ ] **Step 3: Crear AreaSelector**

```tsx
// ══════════════════════════════════════════════
// AREA SELECTOR — Dropdown estándar + custom
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { StandardArea, DepartmentArea } from '@/types';

const STANDARD_AREAS: { value: StandardArea; label: string }[] = [
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'rrhh', label: 'Recursos Humanos' },
  { value: 'legal', label: 'Legal' },
  { value: 'it', label: 'Tecnología / IT' },
  { value: 'producto', label: 'Producto' },
  { value: 'atencion-al-cliente', label: 'Atención al Cliente' },
  { value: 'logistica', label: 'Logística' },
];

interface Props {
  existingAreas: DepartmentArea[];
  value: string | null;
  onChange: (areaId: string | null) => void;
  onCreateArea?: (standardArea: string, customName?: string) => Promise<DepartmentArea>;
}

export default function AreaSelector({ existingAreas, value, onChange, onCreateArea }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customParent, setCustomParent] = useState<string>('custom');

  async function handleCreateCustom() {
    if (!onCreateArea || !customName.trim()) return;
    const area = await onCreateArea(customParent, customName.trim());
    onChange(area.id);
    setShowCustom(false);
    setCustomName('');
  }

  return (
    <div className="space-y-2">
      <select
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          if (val === '__new__') {
            setShowCustom(true);
            return;
          }
          onChange(val || null);
        }}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="">Sin área asignada</option>
        {existingAreas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.displayName}
          </option>
        ))}
        {onCreateArea && <option value="__new__">+ Crear nueva área...</option>}
      </select>

      {showCustom && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 space-y-2">
          <select
            value={customParent}
            onChange={(e) => setCustomParent(e.target.value)}
            className="w-full bg-slate-700 border border-slate-500 rounded px-2 py-1.5 text-white text-sm"
          >
            {STANDARD_AREAS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
            <option value="custom">Otra (custom)</option>
          </select>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nombre del área..."
            className="w-full bg-slate-700 border border-slate-500 rounded px-2 py-1.5 text-white text-sm placeholder:text-slate-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateCustom}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
            >
              Crear
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verificar que compila**

Run: `cd ai-compass && npx tsc --noEmit 2>&1 | head -10`
Expected: Sin errores.

- [ ] **Step 5: Commit**

```bash
git add ai-compass/src/components/AiOperatingLevelBadge.tsx ai-compass/src/components/AreaAssessmentStatusIcon.tsx ai-compass/src/components/AreaSelector.tsx
git commit -m "feat: componentes AiOperatingLevelBadge, AreaAssessmentStatusIcon y AreaSelector"
```

---

### Task 10: Frontend — Páginas de áreas

**Files:**
- Create: `ai-compass/src/pages/AreaListPage.tsx`
- Create: `ai-compass/src/pages/AreaDetailPage.tsx`
- Create: `ai-compass/src/pages/AreaMiniAssessmentPage.tsx`
- Modify: `ai-compass/src/App.tsx`

- [ ] **Step 1: Crear AreaListPage**

```tsx
// ══════════════════════════════════════════════
// AREA LIST PAGE — Lista de áreas departamentales
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAreaStore } from '@/stores/areaStore';
import AiOperatingLevelBadge from '@/components/AiOperatingLevelBadge';
import AreaAssessmentStatusIcon from '@/components/AreaAssessmentStatusIcon';
import type { AiOperatingLevel, AreaAssessmentStatus, StandardArea } from '@/types';

const STANDARD_AREAS: { value: StandardArea; label: string }[] = [
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'rrhh', label: 'Recursos Humanos' },
  { value: 'legal', label: 'Legal' },
  { value: 'it', label: 'Tecnología / IT' },
  { value: 'producto', label: 'Producto' },
  { value: 'atencion-al-cliente', label: 'Atención al Cliente' },
  { value: 'logistica', label: 'Logística' },
];

export default function AreaListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { areas, isLoading, fetchAreas, createArea } = useAreaStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newArea, setNewArea] = useState('finanzas');

  useEffect(() => {
    if (orgId) void fetchAreas(orgId);
  }, [orgId, fetchAreas]);

  async function handleAdd() {
    if (!orgId) return;
    await createArea(orgId, newArea);
    setShowAdd(false);
  }

  if (isLoading && areas.length === 0) {
    return <div className="text-slate-400 p-8">Cargando áreas...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Áreas departamentales</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500"
        >
          + Agregar área
        </button>
      </div>

      {showAdd && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-4 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Área estándar</label>
            <select
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              className="w-full bg-slate-700 border border-slate-500 rounded px-3 py-2 text-white text-sm"
            >
              {STANDARD_AREAS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-500">
            Crear
          </button>
          <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600">
            Cancelar
          </button>
        </div>
      )}

      {areas.length === 0 ? (
        <div className="text-slate-500 text-center py-16">
          No hay áreas registradas. Agrega la primera área para comenzar el diagnóstico incremental.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => navigate(`/org/${orgId}/areas/${area.id}`)}
              className="text-left bg-slate-800 rounded-xl p-5 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-500"
            >
              <h3 className="text-white font-semibold mb-2">{area.displayName}</h3>
              <div className="flex items-center gap-2 mb-3">
                <AreaAssessmentStatusIcon status={area.assessmentStatus as AreaAssessmentStatus} />
              </div>
              <div className="flex items-center justify-between">
                <AiOperatingLevelBadge level={area.aiOperatingLevel as AiOperatingLevel} />
                <span className="text-slate-400 text-xs">
                  {(area as unknown as { pilotCount?: number }).pilotCount ?? 0} pilotos
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Crear AreaDetailPage**

```tsx
// ══════════════════════════════════════════════
// AREA DETAIL PAGE — Detalle de área con spider chart
// ══════════════════════════════════════════════

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAreaStore } from '@/stores/areaStore';
import SpiderChart from '@/components/SpiderChart';
import AiOperatingLevelBadge from '@/components/AiOperatingLevelBadge';
import AreaAssessmentStatusIcon from '@/components/AreaAssessmentStatusIcon';
import type { AiOperatingLevel, AreaAssessmentStatus, DimensionKey } from '@/types';

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  estrategia: 'Estrategia',
  procesos: 'Procesos',
  datos: 'Datos',
  tecnologia: 'Tecnología',
  cultura: 'Cultura',
  gobernanza: 'Gobernanza',
};

export default function AreaDetailPage() {
  const { orgId, areaId } = useParams<{ orgId: string; areaId: string }>();
  const navigate = useNavigate();
  const { currentArea, isLoading, fetchArea, resetToInherited } = useAreaStore();

  useEffect(() => {
    if (areaId) void fetchArea(areaId);
  }, [areaId, fetchArea]);

  if (isLoading || !currentArea) {
    return <div className="text-slate-400 p-8">Cargando área...</div>;
  }

  const scores = currentArea.maturityScores ?? {};
  const isInherited = currentArea.assessmentStatus === 'inherited';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(`/org/${orgId}/areas`)} className="text-sm text-slate-400 hover:text-white mb-4 block">
        Volver a áreas
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{currentArea.displayName}</h1>
          <div className="flex items-center gap-3">
            <AreaAssessmentStatusIcon status={currentArea.assessmentStatus as AreaAssessmentStatus} />
            <AiOperatingLevelBadge level={currentArea.aiOperatingLevel as AiOperatingLevel} size="md" />
          </div>
        </div>
        <div className="flex gap-2">
          {isInherited && (
            <button
              onClick={() => navigate(`/org/${orgId}/areas/${areaId}/mini-assessment`)}
              className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-500"
            >
              Realizar mini-assessment
            </button>
          )}
          {!isInherited && (
            <button
              onClick={async () => { await resetToInherited(currentArea.id); void fetchArea(currentArea.id); }}
              className="px-4 py-2 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600"
            >
              Volver a heredado
            </button>
          )}
        </div>
      </div>

      {isInherited && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6 text-sm text-yellow-300">
          Los scores de esta área son heredados del baseline organizacional. Realiza un mini-assessment para obtener datos específicos del área.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spider chart */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Madurez del área
            {isInherited && <span className="text-xs text-slate-400 ml-2">(heredado)</span>}
          </h2>
          <SpiderChart scores={scores as Record<string, number>} />
        </div>

        {/* Scores por dimensión */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Scores por dimensión</h2>
          <div className="space-y-3">
            {(Object.entries(DIMENSION_LABELS) as [DimensionKey, string][]).map(([key, label]) => {
              const score = scores[key] ?? null;
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{label}</span>
                  <span className={`font-medium text-sm ${isInherited ? 'text-slate-400 italic' : 'text-white'}`}>
                    {score !== null ? `${score}/4` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pilotos vinculados */}
      <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Pilotos vinculados</h2>
        {!currentArea.pilots || (currentArea.pilots as unknown[]).length === 0 ? (
          <p className="text-slate-500 text-sm">No hay pilotos vinculados a esta área.</p>
        ) : (
          <div className="space-y-2">
            {(currentArea.pilots as Array<{ id: string; title: string; status: string }>).map((pilot) => (
              <button
                key={pilot.id}
                onClick={() => navigate(`/org/${orgId}/pilots/${pilot.id}`)}
                className="w-full text-left bg-slate-700 rounded-lg p-3 hover:bg-slate-600 flex items-center justify-between"
              >
                <span className="text-white text-sm">{pilot.title}</span>
                <span className="text-xs text-slate-400 capitalize">{pilot.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Crear AreaMiniAssessmentPage**

```tsx
// ══════════════════════════════════════════════
// AREA MINI-ASSESSMENT PAGE — 12 preguntas rápidas
// ══════════════════════════════════════════════

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAreaStore } from '@/stores/areaStore';
import type { DimensionKey, MaturityLevel, MiniAssessmentAnswer } from '@/types';

interface MiniQuestion {
  dimension: DimensionKey;
  questionIndex: number;
  questionText: string;
  options: { level: MaturityLevel; text: string }[];
}

const MINI_QUESTIONS: MiniQuestion[] = [
  // Estrategia (2 preguntas)
  { dimension: 'estrategia', questionIndex: 0, questionText: '¿Existe una visión documentada de IA en la organización?',
    options: [
      { level: 1, text: 'No se ha conversado formalmente sobre IA' },
      { level: 2, text: 'Se reconoce la necesidad pero no hay plan' },
      { level: 3, text: 'Hay estrategia documentada con objetivos medibles' },
      { level: 4, text: 'IA está integrada en la estrategia de negocio' },
    ]},
  { dimension: 'estrategia', questionIndex: 1, questionText: '¿El liderazgo del área participa activamente en iniciativas de IA?',
    options: [
      { level: 1, text: 'No hay involucramiento del liderazgo' },
      { level: 2, text: 'Interés pasivo, sin acciones concretas' },
      { level: 3, text: 'Liderazgo asigna recursos y tiempo' },
      { level: 4, text: 'Liderazgo hace role-modeling activo con IA' },
    ]},
  // Procesos (2 preguntas)
  { dimension: 'procesos', questionIndex: 0, questionText: '¿Los procesos clave del área están documentados?',
    options: [
      { level: 1, text: 'Procesos ad-hoc, no documentados' },
      { level: 2, text: 'Parcialmente documentados' },
      { level: 3, text: 'Documentados y estandarizados' },
      { level: 4, text: 'Rediseñados con IA integrada' },
    ]},
  { dimension: 'procesos', questionIndex: 1, questionText: '¿Se han identificado procesos candidatos a automatización?',
    options: [
      { level: 1, text: 'No se ha evaluado' },
      { level: 2, text: 'Algunas ideas sin priorizar' },
      { level: 3, text: 'Mapa de procesos con priorización' },
      { level: 4, text: 'Pipeline activo de automatización' },
    ]},
  // Datos (2 preguntas)
  { dimension: 'datos', questionIndex: 0, questionText: '¿Los datos del área son accesibles para herramientas de IA?',
    options: [
      { level: 1, text: 'Datos en silos, inaccesibles' },
      { level: 2, text: 'Algunos datos centralizados' },
      { level: 3, text: 'Datos centralizados con gobernanza básica' },
      { level: 4, text: 'Infraestructura de datos optimizada para IA' },
    ]},
  { dimension: 'datos', questionIndex: 1, questionText: '¿Existe calidad y confiabilidad en los datos del área?',
    options: [
      { level: 1, text: 'Datos inconsistentes y no confiables' },
      { level: 2, text: 'Calidad variable, sin métricas' },
      { level: 3, text: 'Monitoreo de calidad implementado' },
      { level: 4, text: 'Pipelines de calidad automatizados' },
    ]},
  // Tecnología (2 preguntas)
  { dimension: 'tecnologia', questionIndex: 0, questionText: '¿Qué herramientas de IA se usan en el área?',
    options: [
      { level: 1, text: 'Solo herramientas de productividad básicas' },
      { level: 2, text: 'Herramientas modernas + algo de cloud' },
      { level: 3, text: 'Plataformas de IA integradas al flujo' },
      { level: 4, text: 'Orquestación de agentes y automatización avanzada' },
    ]},
  { dimension: 'tecnologia', questionIndex: 1, questionText: '¿Hay capacidad de integración entre sistemas del área?',
    options: [
      { level: 1, text: 'Sistemas aislados, sin APIs' },
      { level: 2, text: 'Algunas integraciones manuales' },
      { level: 3, text: 'APIs disponibles, integraciones activas' },
      { level: 4, text: 'Ecosistema conectado con MCPs y agentes' },
    ]},
  // Cultura (2 preguntas)
  { dimension: 'cultura', questionIndex: 0, questionText: '¿Cómo percibe el equipo del área la adopción de IA?',
    options: [
      { level: 1, text: 'Resistencia activa o miedo' },
      { level: 2, text: 'Curiosidad emergente' },
      { level: 3, text: 'Cultura de experimentación' },
      { level: 4, text: 'IA es parte de la identidad del equipo' },
    ]},
  { dimension: 'cultura', questionIndex: 1, questionText: '¿Hay personas en el área que promueven activamente el uso de IA?',
    options: [
      { level: 1, text: 'Nadie lo promueve' },
      { level: 2, text: '1-2 personas exploran por cuenta propia' },
      { level: 3, text: 'Champions identificados con tiempo asignado' },
      { level: 4, text: 'Equipo autoorganizado crea soluciones IA' },
    ]},
  // Gobernanza (2 preguntas)
  { dimension: 'gobernanza', questionIndex: 0, questionText: '¿Existen políticas de uso de IA en el área?',
    options: [
      { level: 1, text: 'Sin políticas ni lineamientos' },
      { level: 2, text: 'Lineamientos informales' },
      { level: 3, text: 'Políticas formales documentadas' },
      { level: 4, text: 'Gobernanza adaptativa con centro de excelencia' },
    ]},
  { dimension: 'gobernanza', questionIndex: 1, questionText: '¿Se mide el impacto de las iniciativas de IA en el área?',
    options: [
      { level: 1, text: 'No se mide nada' },
      { level: 2, text: 'Métricas anecdóticas' },
      { level: 3, text: 'KPIs definidos con tracking regular' },
      { level: 4, text: 'Dashboard de impacto en tiempo real' },
    ]},
];

export default function AreaMiniAssessmentPage() {
  const { orgId, areaId } = useParams<{ orgId: string; areaId: string }>();
  const navigate = useNavigate();
  const { submitMiniAssessment, isLoading } = useAreaStore();
  const [answers, setAnswers] = useState<Record<number, MaturityLevel>>({});

  function handleSelect(questionIdx: number, level: MaturityLevel) {
    setAnswers(prev => ({ ...prev, [questionIdx]: level }));
  }

  async function handleSubmit() {
    if (!areaId) return;

    const formatted: MiniAssessmentAnswer[] = MINI_QUESTIONS.map((q, idx) => ({
      dimension: q.dimension,
      questionIndex: q.questionIndex,
      questionText: q.questionText,
      answer: q.options.find(o => o.level === answers[idx])?.text ?? '',
      suggestedLevel: answers[idx] ?? 1,
    }));

    await submitMiniAssessment(areaId, formatted);
    navigate(`/org/${orgId}/areas/${areaId}`);
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = MINI_QUESTIONS.length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(`/org/${orgId}/areas/${areaId}`)} className="text-sm text-slate-400 hover:text-white mb-4 block">
        Volver al área
      </button>

      <h1 className="text-2xl font-bold text-white mb-2">Mini-assessment del área</h1>
      <p className="text-slate-400 text-sm mb-6">
        12 preguntas para obtener un diagnóstico rápido. Responde según la realidad actual del área.
        <span className="ml-2 text-white font-medium">{answeredCount}/{totalCount}</span>
      </p>

      <div className="space-y-6">
        {MINI_QUESTIONS.map((q, idx) => (
          <div key={idx} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-white font-medium mb-1">{idx + 1}. {q.questionText}</p>
            <p className="text-xs text-slate-500 mb-3 capitalize">{q.dimension}</p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => handleSelect(idx, opt.level)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    answers[idx] === opt.level
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : 'bg-slate-700 text-slate-300 border border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <span className="font-medium mr-2">Nivel {opt.level}:</span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={answeredCount < totalCount || isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : 'Guardar mini-assessment'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Agregar rutas en App.tsx**

En `ai-compass/src/App.tsx`, agregar imports después de la línea de `ValueEngineeringPage`:

```typescript
import AreaListPage from './pages/AreaListPage';
import AreaDetailPage from './pages/AreaDetailPage';
import AreaMiniAssessmentPage from './pages/AreaMiniAssessmentPage';
```

Agregar rutas dentro del `<Route element={<Layout />}>`, después del bloque de Value Engineering (línea 66):

```tsx
          {/* Áreas departamentales */}
          <Route path="/org/:orgId/areas" element={<AreaListPage />} />
          <Route path="/org/:orgId/areas/:areaId" element={<AreaDetailPage />} />
          <Route path="/org/:orgId/areas/:areaId/mini-assessment" element={<AreaMiniAssessmentPage />} />
```

- [ ] **Step 5: Verificar que compila**

Run: `cd ai-compass && npx tsc --noEmit 2>&1 | head -20`
Expected: Sin errores en los archivos nuevos.

- [ ] **Step 6: Commit**

```bash
git add ai-compass/src/pages/AreaListPage.tsx ai-compass/src/pages/AreaDetailPage.tsx ai-compass/src/pages/AreaMiniAssessmentPage.tsx ai-compass/src/App.tsx
git commit -m "feat: páginas de áreas departamentales (lista, detalle, mini-assessment)"
```

---

### Task 11: Frontend — AI Operating Level badge en Dashboard

**Files:**
- Modify: `ai-compass/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Agregar import del badge**

En `ai-compass/src/pages/DashboardPage.tsx`, agregar después de los imports existentes:

```typescript
import AiOperatingLevelBadge from '@/components/AiOperatingLevelBadge';
import type { AiOperatingLevel } from '@/types';
```

- [ ] **Step 2: Agregar badge al OrgCard**

En el componente `OrgCard` (línea 42-59), agregar el badge después del span de Score (línea 55):

```tsx
        {org.aiOperatingLevel && (
          <AiOperatingLevelBadge level={org.aiOperatingLevel as AiOperatingLevel} />
        )}
```

- [ ] **Step 3: Verificar que compila**

Run: `cd ai-compass && npx tsc --noEmit 2>&1 | head -10`
Expected: Sin errores.

- [ ] **Step 4: Commit**

```bash
git add ai-compass/src/pages/DashboardPage.tsx
git commit -m "feat: AI Operating Level badge en dashboard de organizaciones"
```

---

### Task 12: Validación final y lint

**Files:** Todos los modificados/creados

- [ ] **Step 1: Ejecutar typecheck completo**

Run: `cd ai-compass && npx tsc --noEmit 2>&1`
Expected: Sin errores nuevos.

- [ ] **Step 2: Ejecutar lint**

Run: `cd ai-compass && npm run validate 2>&1 | tail -20`
Expected: Sin errores de lint en archivos nuevos.

- [ ] **Step 3: Corregir errores de lint si los hay**

Run: `cd ai-compass && npm run validate:fix 2>&1 | tail -20`

- [ ] **Step 4: Verificar que el backend compila**

Run: `cd ai-compass/backend && npx tsc --noEmit 2>&1`
Expected: Sin errores.

- [ ] **Step 5: Commit final si hubo correcciones de lint**

```bash
git add -A
git commit -m "fix: correcciones de lint y typecheck"
```
