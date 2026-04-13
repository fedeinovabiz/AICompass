# Herramientas de Transformación Agéntica — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Todo texto en español debe llevar tildes, eñes y signos de apertura correctos.

**Goal:** Agregar 3 herramientas transversales a AICompass basadas en el 80/20 del Agentic AI Transformation Framework de Google: anti-patrones como red flags, CUJ Mapper, y Value Engineering Panel.

**Architecture:** Se extiende el sistema existente de red flags con 5 reglas nuevas. Se crean 2 tablas nuevas (cujs, cuj_steps) y se agregan columnas de value engineering a pilots. Se crean 2 vistas nuevas en el frontend (CUJ Mapper, Value Engineering Matrix) y se modifica PilotDetailPage para integrar los campos nuevos. Backend sigue el patrón existente de Express + PostgreSQL con helper db.ts.

**Tech Stack:** React + TypeScript + Tailwind (frontend), Express + PostgreSQL (backend), Zustand (state), Vite (build)

**Spec:** `docs/superpowers/specs/2026-04-12-agentic-transformation-tools-design.md`

---

## Estructura de archivos

### Archivos nuevos

| Archivo | Responsabilidad |
|---|---|
| `backend/migrations/002_agentic_tools.sql` | Migración: tablas cujs/cuj_steps + columnas en pilots |
| `backend/src/routes/cujs.ts` | CRUD de CUJs y sus steps |
| `backend/src/routes/valueEngineering.ts` | Matriz de priorización + cálculo de value score |
| `src/stores/cujStore.ts` | Estado de CUJs en frontend |
| `src/pages/CujMapperPage.tsx` | Vista del CUJ Mapper |
| `src/pages/ValueEngineeringPage.tsx` | Vista de la Matriz de Value Engineering |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/src/constants/redFlags.ts` | Agregar 5 reglas nuevas (RF-12 a RF-16) |
| `backend/src/services/redFlagEvaluator.ts` | Agregar 5 evaluadores nuevos + extender OrgState |
| `backend/src/routes/redFlags.ts` | Cargar datos adicionales para nuevos evaluadores |
| `backend/src/routes/pilots.ts` | Aceptar campos de value engineering en POST/PUT |
| `backend/src/index.ts` | Registrar rutas /api/cujs y /api/value-engineering |
| `src/types/index.ts` | Agregar tipos CUJ, CUJStep, ValueAssessment + extender Pilot |
| `src/stores/pilotStore.ts` | Agregar campos de value engineering a create/update |
| `src/pages/PilotDetailPage.tsx` | Agregar sección de value engineering + link a CUJ |
| `src/App.tsx` | Agregar rutas de CUJ Mapper y Value Engineering |

---

## Task 1: Migración de base de datos

**Files:**
- Create: `backend/migrations/002_agentic_tools.sql`

- [ ] **Step 1: Crear archivo de migración**

```sql
-- 002_agentic_tools.sql — Herramientas de Transformación Agéntica

-- ═══════════════════════════════════════
-- CUJs (Critical User Journeys)
-- ═══════════════════════════════════════

CREATE TABLE cujs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  actor VARCHAR(255) NOT NULL,
  objective TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cuj_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cuj_id UUID NOT NULL REFERENCES cujs(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  description TEXT NOT NULL,
  actor VARCHAR(255) NOT NULL,
  current_tool VARCHAR(255) DEFAULT '',
  estimated_time_minutes INTEGER NOT NULL DEFAULT 0,
  pain_point TEXT DEFAULT '',
  agent_candidate BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(cuj_id, step_order)
);

CREATE INDEX idx_cujs_engagement ON cujs(engagement_id);
CREATE INDEX idx_cuj_steps_cuj ON cuj_steps(cuj_id);

-- ═══════════════════════════════════════
-- Value Engineering en pilots
-- ═══════════════════════════════════════

ALTER TABLE pilots ADD COLUMN implementation_type VARCHAR(20) DEFAULT 'redesign'
  CHECK (implementation_type IN ('digitalization', 'redesign'));

ALTER TABLE pilots ADD COLUMN cuj_id UUID REFERENCES cujs(id) ON DELETE SET NULL;

ALTER TABLE pilots ADD COLUMN value_pnl DECIMAL DEFAULT NULL;
ALTER TABLE pilots ADD COLUMN value_pnl_type VARCHAR(10) DEFAULT NULL
  CHECK (value_pnl_type IN ('savings', 'revenue'));
ALTER TABLE pilots ADD COLUMN value_effort VARCHAR(5) DEFAULT NULL
  CHECK (value_effort IN ('S', 'M', 'L', 'XL'));
ALTER TABLE pilots ADD COLUMN value_risk VARCHAR(10) DEFAULT NULL
  CHECK (value_risk IN ('low', 'medium', 'high'));
ALTER TABLE pilots ADD COLUMN value_time_to_value VARCHAR(15) DEFAULT NULL
  CHECK (value_time_to_value IN ('under_4w', '4_to_12w', 'over_12w'));
ALTER TABLE pilots ADD COLUMN value_score INTEGER DEFAULT NULL;

-- FK del CUJ en process_maps
ALTER TABLE process_maps ADD COLUMN cuj_id UUID REFERENCES cujs(id) ON DELETE SET NULL;
```

- [ ] **Step 2: Ejecutar migración contra la base de datos**

Run: `cd C:/Productos/AICompass/ai-compass/backend && psql "$DATABASE_URL" -f migrations/002_agentic_tools.sql`
Expected: CREATE TABLE, CREATE INDEX, ALTER TABLE sin errores.

- [ ] **Step 3: Commit**

```bash
git add backend/migrations/002_agentic_tools.sql
git commit -m "feat: migración 002 — tablas CUJ + columnas value engineering en pilots"
```

---

## Task 2: Tipos del frontend

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Agregar tipos de Value Engineering y CUJ al final del archivo**

Agregar después de la interfaz `FailurePattern` (línea ~508):

```typescript
// ══════════════════════════════════════════════
// VALUE ENGINEERING
// ══════════════════════════════════════════════

export type ImplementationType = 'digitalization' | 'redesign';
export type ValueEffort = 'S' | 'M' | 'L' | 'XL';
export type ValueRisk = 'low' | 'medium' | 'high';
export type ValueTimeToValue = 'under_4w' | '4_to_12w' | 'over_12w';
export type ValuePnlType = 'savings' | 'revenue';

export interface ValueAssessment {
  valuePnl: number | null;
  valuePnlType: ValuePnlType | null;
  valueEffort: ValueEffort | null;
  valueRisk: ValueRisk | null;
  valueTimeToValue: ValueTimeToValue | null;
  valueScore: number | null;
}

// ══════════════════════════════════════════════
// CUJ (Critical User Journeys)
// ══════════════════════════════════════════════

export interface CujStep {
  id: string;
  cujId: string;
  stepOrder: number;
  description: string;
  actor: string;
  currentTool: string;
  estimatedTimeMinutes: number;
  painPoint: string;
  agentCandidate: boolean;
}

export interface Cuj {
  id: string;
  engagementId: string;
  name: string;
  actor: string;
  objective: string;
  steps: CujStep[];
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Extender la interfaz Pilot con los campos nuevos**

Agregar los campos al final de la interfaz `Pilot` (antes del cierre `}`), después de `quickWinIds`:

```typescript
  // Value Engineering
  implementationType: ImplementationType;
  cujId: string | null;
  valuePnl: number | null;
  valuePnlType: ValuePnlType | null;
  valueEffort: ValueEffort | null;
  valueRisk: ValueRisk | null;
  valueTimeToValue: ValueTimeToValue | null;
  valueScore: number | null;
```

- [ ] **Step 3: Verificar typecheck**

Run: `cd C:/Productos/AICompass/ai-compass && npx tsc --noEmit`
Expected: Sin errores de tipo nuevos (pueden haber warnings existentes).

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: tipos ValueAssessment, CUJ y extensión de Pilot"
```

---

## Task 3: Red flags nuevas — Constantes

**Files:**
- Modify: `backend/src/constants/redFlags.ts`

- [ ] **Step 1: Agregar 5 reglas nuevas al array RED_FLAG_RULES**

Agregar después del último elemento del array (RF11, línea ~129), antes del `];`:

```typescript
  {
    id: 'RF12',
    severity: 'block',
    title: 'Cimientos rotos: deuda técnica amplificada por IA',
    description: 'El piloto requiere integración con sistemas que el diagnóstico marcó como frágiles. La IA amplifica fallas existentes — resolver la deuda técnica antes de escalar.',
    stage: 3,
    condition: 'Score <=1 en dimensión de datos/tecnología Y piloto depende de integración con sistemas legado.',
    recommendation: 'Resolver la deuda técnica identificada en el diagnóstico antes de aprobar este piloto. Considerar un piloto que no dependa de integración con sistemas frágiles.',
    canOverride: true,
  },
  {
    id: 'RF13',
    severity: 'block',
    title: 'Automatizando el pasado sin rediseño',
    description: 'Este piloto digitaliza el proceso existente sin reimaginarlo. El objetivo final del usuario se puede lograr eliminando pasos intermedios.',
    stage: 3,
    condition: 'Piloto marcado como "digitalización directa" sin rediseño de proceso.',
    recommendation: 'Antes de automatizar, preguntar: ¿el resultado final se puede lograr de otra forma más directa? Usar el CUJ Mapper para reimaginar el journey completo.',
    canOverride: true,
  },
  {
    id: 'RF14',
    severity: 'block',
    title: 'Proliferación de agentes sin gobernanza (Agent Sprawl)',
    description: 'Hay múltiples agentes/automatizaciones en curso sin gobernanza centralizada. Riesgo de proliferación descontrolada.',
    stage: 3,
    condition: '3+ pilotos activos de tipo agente/automatización sin owner de gobernanza asignado en el comité.',
    recommendation: 'Asignar un owner de gobernanza de agentes en el comité antes de aprobar más pilotos. Revisar si hay pilotos duplicados atacando el mismo proceso.',
    canOverride: true,
  },
  {
    id: 'RF15',
    severity: 'warning',
    title: 'Piloto sin journey mapeado (CUJ)',
    description: 'Este piloto no tiene un journey mapeado. Para pilotos que involucran múltiples pasos o actores, mapear el CUJ antes de aprobar ayuda a evitar automatizar tareas aisladas.',
    stage: 3,
    condition: 'Piloto aprobado o activo sin CUJ vinculado.',
    recommendation: 'Mapear el Critical User Journey del proceso antes de continuar. Esto asegura que se diseña para el resultado final, no para tareas individuales.',
    canOverride: true,
  },
  {
    id: 'RF16',
    severity: 'warning',
    title: 'Impacto desproporcionado: bajo P&L para el esfuerzo',
    description: 'Este piloto tiene un impacto estimado bajo para su nivel de esfuerzo. Considerar si el ROI justifica la inversión.',
    stage: 3,
    condition: 'Impacto P&L < $5,000/año con esfuerzo M o mayor.',
    recommendation: 'Reevaluar la prioridad de este piloto frente a otros con mejor relación impacto/esfuerzo. Usar la Matriz de Value Engineering para comparar.',
    canOverride: true,
  },
```

- [ ] **Step 2: Verificar typecheck del backend**

Run: `cd C:/Productos/AICompass/ai-compass/backend && npx tsc --noEmit`
Expected: Sin errores.

- [ ] **Step 3: Commit**

```bash
git add backend/src/constants/redFlags.ts
git commit -m "feat: 5 reglas de red flag nuevas (anti-patrones, CUJ, value engineering)"
```

---

## Task 4: Red flags nuevas — Evaluadores

**Files:**
- Modify: `backend/src/services/redFlagEvaluator.ts`

- [ ] **Step 1: Extender la interfaz OrgState para incluir datos de pilotos ampliados**

Reemplazar la interfaz del array `pilots` dentro de `OrgState` (línea ~20-25):

```typescript
  pilots: Array<{
    status: string;
    baseline: unknown[];
    startDate: string | null;
    metrics: unknown[];
    implementationType: string | null;
    cujId: string | null;
    valuePnl: number | null;
    valueEffort: string | null;
  }>;
```

- [ ] **Step 2: Agregar los 5 evaluadores nuevos**

Agregar después de la función `evaluarRF_SponsorAusente` (línea ~132):

```typescript
function evaluarRF12(state: OrgState): boolean {
  // RF12: Cimientos rotos — score <=1 en datos/tecnología + piloto activo
  const datosScore = state.maturityScores['datos'] ?? 0;
  const techScore = state.maturityScores['tecnologia'] ?? 0;
  const cimientosFragiles = datosScore <= 1 || techScore <= 1;
  if (!cimientosFragiles) return false;
  const pilotosActivos = state.pilots.filter(
    (p) => p.status === 'active' || p.status === 'designing',
  );
  return pilotosActivos.length > 0;
}

function evaluarRF13(state: OrgState): boolean {
  // RF13: Automatizando el pasado — piloto tipo "digitalization"
  return state.pilots.some(
    (p) =>
      (p.status === 'designing' || p.status === 'active') &&
      p.implementationType === 'digitalization',
  );
}

function evaluarRF14(state: OrgState): boolean {
  // RF14: Agent Sprawl — 3+ pilotos activos sin owner de gobernanza
  const pilotosActivos = state.pilots.filter(
    (p) => p.status === 'active' || p.status === 'designing',
  );
  if (pilotosActivos.length < 3) return false;
  // Si no hay comité, no hay owner posible
  if (!state.committee) return true;
  // Verificar si hay un miembro con rol relevante para gobernanza
  const tieneOwnerGobernanza = state.committee.members.some(
    (m) => m.role === 'it-rep' || m.role === 'operational-leader',
  );
  return !tieneOwnerGobernanza;
}

function evaluarRF15(state: OrgState): boolean {
  // RF15: Piloto sin CUJ vinculado
  return state.pilots.some(
    (p) =>
      (p.status === 'active' || p.status === 'evaluating') &&
      !p.cujId,
  );
}

function evaluarRF16(state: OrgState): boolean {
  // RF16: Bajo P&L para el esfuerzo
  return state.pilots.some(
    (p) =>
      p.valuePnl !== null &&
      p.valuePnl < 5000 &&
      p.valueEffort !== null &&
      ['M', 'L', 'XL'].includes(p.valueEffort),
  );
}
```

- [ ] **Step 3: Registrar los evaluadores en el mapa EVALUADORES**

Agregar las 5 entradas nuevas al objeto `EVALUADORES` (después de la línea `RF11: evaluarRF_SponsorAusente`):

```typescript
  RF12: evaluarRF12,      // Cimientos rotos (deuda técnica + IA)
  RF13: evaluarRF13,      // Automatizando el pasado
  RF14: evaluarRF14,      // Agent Sprawl
  RF15: evaluarRF15,      // Piloto sin CUJ
  RF16: evaluarRF16,      // Bajo P&L para esfuerzo
```

- [ ] **Step 4: Verificar typecheck del backend**

Run: `cd C:/Productos/AICompass/ai-compass/backend && npx tsc --noEmit`
Expected: Sin errores.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/redFlagEvaluator.ts
git commit -m "feat: evaluadores para 5 red flags nuevas (anti-patrones agénticos)"
```

---

## Task 5: Extender ruta de Red Flags para cargar datos nuevos

**Files:**
- Modify: `backend/src/routes/redFlags.ts`

- [ ] **Step 1: Extender la query de pilotos para incluir campos nuevos**

Reemplazar la query de pilotos (línea ~69-74):

```typescript
    const pilotosRaw = await getMany<{
      id: string;
      status: string;
      baseline: unknown;
      start_date: string | null;
      implementation_type: string | null;
      cuj_id: string | null;
      value_pnl: number | null;
      value_effort: string | null;
    }>('SELECT id, status, baseline, start_date, implementation_type, cuj_id, value_pnl, value_effort FROM pilots WHERE organization_id = $1', [orgId]);
```

- [ ] **Step 2: Extender el mapeo de pilotos para incluir campos nuevos**

Reemplazar el `return` del `map` de pilotos (línea ~83-88):

```typescript
        return {
          status: p.status,
          baseline: baselineArr,
          startDate: p.start_date,
          metrics,
          implementationType: p.implementation_type,
          cujId: p.cuj_id,
          valuePnl: p.value_pnl,
          valueEffort: p.value_effort,
        };
```

- [ ] **Step 3: Verificar typecheck del backend**

Run: `cd C:/Productos/AICompass/ai-compass/backend && npx tsc --noEmit`
Expected: Sin errores.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/redFlags.ts
git commit -m "feat: cargar campos de value engineering y CUJ en evaluación de red flags"
```

---

## Task 6: Extender ruta de Pilots para value engineering

**Files:**
- Modify: `backend/src/routes/pilots.ts`

- [ ] **Step 1: Extender el POST de creación de piloto para aceptar campos nuevos**

Reemplazar el destructuring del body en el POST `/` (línea ~44):

```typescript
    const {
      organizationId, name, description, targetProcess, startDate, endDate,
      implementationType, cujId, valuePnl, valuePnlType, valueEffort, valueRisk, valueTimeToValue,
    } = req.body;
```

Reemplazar la query INSERT (línea ~50-55):

```typescript
    const valueScore = calcValueScore(valuePnl, valueEffort, valueRisk, valueTimeToValue);

    const result = await query(
      `INSERT INTO pilots (organization_id, name, description, target_process, start_date, end_date, status,
        implementation_type, cuj_id, value_pnl, value_pnl_type, value_effort, value_risk, value_time_to_value, value_score)
       VALUES ($1, $2, $3, $4, $5, $6, 'planning', $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        organizationId, name, description ?? null, targetProcess ?? null, startDate ?? null, endDate ?? null,
        implementationType ?? 'redesign', cujId ?? null, valuePnl ?? null, valuePnlType ?? null,
        valueEffort ?? null, valueRisk ?? null, valueTimeToValue ?? null, valueScore,
      ],
    );
```

- [ ] **Step 2: Agregar función calcValueScore al inicio del archivo**

Agregar después de las imports (línea ~4):

```typescript
function calcValueScore(
  pnl: number | null | undefined,
  effort: string | null | undefined,
  risk: string | null | undefined,
  ttv: string | null | undefined,
): number | null {
  if (pnl == null || !effort || !risk || !ttv) return null;

  const PNL_CAP = 500000;
  const pnlNorm = Math.min(pnl / PNL_CAP, 1) * 100;

  const effortMap: Record<string, number> = { XL: 25, L: 50, M: 75, S: 100 };
  const riskMap: Record<string, number> = { high: 33, medium: 66, low: 100 };
  const ttvMap: Record<string, number> = { over_12w: 33, '4_to_12w': 66, under_4w: 100 };

  const effortInv = effortMap[effort] ?? 50;
  const riskInv = riskMap[risk] ?? 50;
  const ttvInv = ttvMap[ttv] ?? 50;

  return Math.round(pnlNorm * 0.40 + effortInv * 0.25 + riskInv * 0.20 + ttvInv * 0.15);
}
```

- [ ] **Step 3: Extender el PUT de actualización para incluir campos de value engineering**

Agregar al destructuring del body en PUT `/:id` (línea ~68-76):

```typescript
    const {
      name, description, status, workflowDesign, championAssignments, roleImpacts,
      targetProcess, startDate, endDate,
      implementationType, cujId, valuePnl, valuePnlType, valueEffort, valueRisk, valueTimeToValue,
    } = req.body;
```

Reemplazar la query UPDATE (línea ~84-98):

```typescript
    const valueScore = calcValueScore(valuePnl, valueEffort, valueRisk, valueTimeToValue);

    const result = await query(
      `UPDATE pilots SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         workflow_design = COALESCE($4, workflow_design),
         champion_assignments = COALESCE($5, champion_assignments),
         role_impacts = COALESCE($6, role_impacts),
         target_process = COALESCE($7, target_process),
         start_date = COALESCE($8, start_date),
         end_date = COALESCE($9, end_date),
         implementation_type = COALESCE($10, implementation_type),
         cuj_id = $11,
         value_pnl = $12,
         value_pnl_type = $13,
         value_effort = $14,
         value_risk = $15,
         value_time_to_value = $16,
         value_score = COALESCE($17, value_score),
         updated_at = NOW()
       WHERE id = $18
       RETURNING *`,
      [
        name ?? null, description ?? null, status ?? null,
        workflowDesign ? JSON.stringify(workflowDesign) : null,
        championAssignments ? JSON.stringify(championAssignments) : null,
        roleImpacts ? JSON.stringify(roleImpacts) : null,
        targetProcess ?? null, startDate ?? null, endDate ?? null,
        implementationType ?? null, cujId !== undefined ? cujId : null,
        valuePnl !== undefined ? valuePnl : null,
        valuePnlType !== undefined ? valuePnlType : null,
        valueEffort !== undefined ? valueEffort : null,
        valueRisk !== undefined ? valueRisk : null,
        valueTimeToValue !== undefined ? valueTimeToValue : null,
        valueScore, req.params.id,
      ],
    );
```

- [ ] **Step 4: Verificar typecheck del backend**

Run: `cd C:/Productos/AICompass/ai-compass/backend && npx tsc --noEmit`
Expected: Sin errores.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/pilots.ts
git commit -m "feat: value engineering en creación/actualización de pilotos + calcValueScore"
```

---

## Task 7: Backend CUJ — Rutas CRUD

**Files:**
- Create: `backend/src/routes/cujs.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear archivo de rutas CUJ**

```typescript
// ══════════════════════════════════════════════
// CUJs — Critical User Journeys (Rutas)
// ══════════════════════════════════════════════

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// GET /engagement/:engagementId — Lista CUJs del engagement
router.get('/engagement/:engagementId', async (req, res, next) => {
  try {
    const cujs = await getMany(
      'SELECT * FROM cujs WHERE engagement_id = $1 ORDER BY created_at DESC',
      [req.params.engagementId],
    );

    const cujsConSteps = await Promise.all(
      cujs.map(async (cuj: { id: string }) => {
        const steps = await getMany(
          'SELECT * FROM cuj_steps WHERE cuj_id = $1 ORDER BY step_order ASC',
          [cuj.id],
        );
        return { ...cuj, steps };
      }),
    );

    res.json(cujsConSteps);
  } catch (err) {
    next(err);
  }
});

// GET /:id — Detalle de un CUJ con steps
router.get('/:id', async (req, res, next) => {
  try {
    const cuj = await getOne('SELECT * FROM cujs WHERE id = $1', [req.params.id]);
    if (!cuj) {
      res.status(404).json({ message: 'CUJ no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const steps = await getMany(
      'SELECT * FROM cuj_steps WHERE cuj_id = $1 ORDER BY step_order ASC',
      [req.params.id],
    );

    res.json({ ...(cuj as object), steps });
  } catch (err) {
    next(err);
  }
});

// POST / — Crear CUJ con steps
router.post('/', async (req, res, next) => {
  try {
    const { engagementId, name, actor, objective, steps } = req.body;
    if (!engagementId || !name || !actor || !objective) {
      res.status(400).json({
        message: 'Los campos engagementId, name, actor y objective son requeridos',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = await query(
      `INSERT INTO cujs (engagement_id, name, actor, objective)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [engagementId, name, actor, objective],
    );

    const cuj = result.rows[0];

    // Insertar steps si vienen
    const stepsArr = Array.isArray(steps) ? steps : [];
    const insertedSteps = [];
    for (let i = 0; i < stepsArr.length; i++) {
      const s = stepsArr[i];
      const stepResult = await query(
        `INSERT INTO cuj_steps (cuj_id, step_order, description, actor, current_tool, estimated_time_minutes, pain_point, agent_candidate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          cuj.id, i + 1, s.description, s.actor, s.currentTool ?? '',
          s.estimatedTimeMinutes ?? 0, s.painPoint ?? '', s.agentCandidate ?? false,
        ],
      );
      insertedSteps.push(stepResult.rows[0]);
    }

    res.status(201).json({ ...cuj, steps: insertedSteps });
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Actualizar CUJ (metadata + reemplazar steps)
router.put('/:id', async (req, res, next) => {
  try {
    const { name, actor, objective, steps } = req.body;

    const existing = await getOne('SELECT id FROM cujs WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'CUJ no encontrado', code: 'NOT_FOUND' });
      return;
    }

    await query(
      `UPDATE cujs SET
         name = COALESCE($1, name),
         actor = COALESCE($2, actor),
         objective = COALESCE($3, objective),
         updated_at = NOW()
       WHERE id = $4`,
      [name ?? null, actor ?? null, objective ?? null, req.params.id],
    );

    // Si vienen steps, reemplazar todos
    if (Array.isArray(steps)) {
      await query('DELETE FROM cuj_steps WHERE cuj_id = $1', [req.params.id]);
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await query(
          `INSERT INTO cuj_steps (cuj_id, step_order, description, actor, current_tool, estimated_time_minutes, pain_point, agent_candidate)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            req.params.id, i + 1, s.description, s.actor, s.currentTool ?? '',
            s.estimatedTimeMinutes ?? 0, s.painPoint ?? '', s.agentCandidate ?? false,
          ],
        );
      }
    }

    // Retornar CUJ actualizado
    const updated = await getOne('SELECT * FROM cujs WHERE id = $1', [req.params.id]);
    const updatedSteps = await getMany(
      'SELECT * FROM cuj_steps WHERE cuj_id = $1 ORDER BY step_order ASC',
      [req.params.id],
    );

    res.json({ ...(updated as object), steps: updatedSteps });
  } catch (err) {
    next(err);
  }
});

// DELETE /:id — Eliminar CUJ
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await getOne('SELECT id FROM cujs WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'CUJ no encontrado', code: 'NOT_FOUND' });
      return;
    }

    await query('DELETE FROM cujs WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
```

- [ ] **Step 2: Registrar ruta en index.ts**

Agregar import después de `import scalingRoutes` (línea ~19):

```typescript
import cujRoutes from './routes/cujs';
```

Agregar registro después de `app.use('/api/scaling', scalingRoutes);` (línea ~44):

```typescript
app.use('/api/cujs', cujRoutes);
```

- [ ] **Step 3: Verificar typecheck del backend**

Run: `cd C:/Productos/AICompass/ai-compass/backend && npx tsc --noEmit`
Expected: Sin errores.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/cujs.ts backend/src/index.ts
git commit -m "feat: rutas CRUD de CUJ (Critical User Journeys)"
```

---

## Task 8: Backend Value Engineering — Ruta de Matriz

**Files:**
- Create: `backend/src/routes/valueEngineering.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear archivo de ruta de Value Engineering**

```typescript
// ══════════════════════════════════════════════
// VALUE ENGINEERING — Matriz de priorización
// ══════════════════════════════════════════════

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// GET /organization/:orgId — Matriz de priorización de pilotos
router.get('/organization/:orgId', async (req, res, next) => {
  try {
    const pilots = await getMany(
      `SELECT id, title, status, tool, value_pnl, value_pnl_type,
              value_effort, value_risk, value_time_to_value, value_score,
              implementation_type, cuj_id, start_date, committee_decision
       FROM pilots
       WHERE organization_id = $1
       ORDER BY value_score DESC NULLS LAST, created_at DESC`,
      [req.params.orgId],
    );

    // Calcular totales
    const conScore = pilots.filter((p: { value_score: number | null }) => p.value_score !== null);
    const sinScore = pilots.filter((p: { value_score: number | null }) => p.value_score === null);
    const totalPnl = conScore.reduce(
      (sum: number, p: { value_pnl: number | null }) => sum + (p.value_pnl ?? 0),
      0,
    );

    res.json({
      pilots,
      summary: {
        total: pilots.length,
        evaluated: conScore.length,
        pending: sinScore.length,
        totalPnl,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
```

- [ ] **Step 2: Registrar ruta en index.ts**

Agregar import después de `import cujRoutes`:

```typescript
import valueEngineeringRoutes from './routes/valueEngineering';
```

Agregar registro después de `app.use('/api/cujs', cujRoutes);`:

```typescript
app.use('/api/value-engineering', valueEngineeringRoutes);
```

- [ ] **Step 3: Verificar typecheck del backend**

Run: `cd C:/Productos/AICompass/ai-compass/backend && npx tsc --noEmit`
Expected: Sin errores.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/valueEngineering.ts backend/src/index.ts
git commit -m "feat: ruta de Value Engineering — matriz de priorización"
```

---

## Task 9: Frontend — CUJ Store

**Files:**
- Create: `src/stores/cujStore.ts`

- [ ] **Step 1: Crear el store de CUJ**

```typescript
// ══════════════════════════════════════════════
// CUJ STORE — Gestión de Critical User Journeys
// ══════════════════════════════════════════════

import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDel } from '@/services/apiClient';
import type { Cuj, CujStep } from '@/types';

interface CreateCujData {
  engagementId: string;
  name: string;
  actor: string;
  objective: string;
  steps?: Omit<CujStep, 'id' | 'cujId'>[];
}

interface UpdateCujData {
  name?: string;
  actor?: string;
  objective?: string;
  steps?: Omit<CujStep, 'id' | 'cujId'>[];
}

interface CujState {
  cujs: Cuj[];
  currentCuj: Cuj | null;
  isLoading: boolean;
  error: string | null;

  fetchCujs: (engagementId: string) => Promise<void>;
  fetchCuj: (id: string) => Promise<void>;
  createCuj: (data: CreateCujData) => Promise<Cuj>;
  updateCuj: (id: string, data: UpdateCujData) => Promise<void>;
  deleteCuj: (id: string) => Promise<void>;
  clearCurrentCuj: () => void;
}

export const useCujStore = create<CujState>((set) => ({
  cujs: [],
  currentCuj: null,
  isLoading: false,
  error: null,

  fetchCujs: async (engagementId: string) => {
    set({ isLoading: true, error: null });
    try {
      const cujs = await apiGet<Cuj[]>(`/cujs/engagement/${engagementId}`);
      set({ cujs, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar CUJs';
      set({ error: message, isLoading: false });
    }
  },

  fetchCuj: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const cuj = await apiGet<Cuj>(`/cujs/${id}`);
      set({ currentCuj: cuj, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar CUJ';
      set({ error: message, isLoading: false });
    }
  },

  createCuj: async (data: CreateCujData) => {
    set({ isLoading: true, error: null });
    try {
      const cuj = await apiPost<Cuj>('/cujs', data);
      set((state) => ({ cujs: [...state.cujs, cuj], isLoading: false }));
      return cuj;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear CUJ';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateCuj: async (id: string, data: UpdateCujData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiPut<Cuj>(`/cujs/${id}`, data);
      set((state) => ({
        cujs: state.cujs.map((c) => (c.id === id ? updated : c)),
        currentCuj: state.currentCuj?.id === id ? updated : state.currentCuj,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar CUJ';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteCuj: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiDel(`/cujs/${id}`);
      set((state) => ({
        cujs: state.cujs.filter((c) => c.id !== id),
        currentCuj: state.currentCuj?.id === id ? null : state.currentCuj,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar CUJ';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearCurrentCuj: () => {
    set({ currentCuj: null, error: null });
  },
}));
```

- [ ] **Step 2: Verificar typecheck del frontend**

Run: `cd C:/Productos/AICompass/ai-compass && npx tsc --noEmit`
Expected: Sin errores de tipo nuevos.

- [ ] **Step 3: Commit**

```bash
git add src/stores/cujStore.ts
git commit -m "feat: CUJ store (zustand) con CRUD completo"
```

---

## Task 10: Frontend — CUJ Mapper Page

**Files:**
- Create: `src/pages/CujMapperPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear la página CUJ Mapper**

```tsx
// ══════════════════════════════════════════════
// CUJ MAPPER PAGE — Mapeo de Critical User Journeys
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCujStore } from '@/stores/cujStore';
import type { CujStep } from '@/types';

type StepDraft = Omit<CujStep, 'id' | 'cujId'>;

const EMPTY_STEP: StepDraft = {
  stepOrder: 0,
  description: '',
  actor: '',
  currentTool: '',
  estimatedTimeMinutes: 0,
  painPoint: '',
  agentCandidate: false,
};

function StepRow({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: StepDraft;
  index: number;
  onChange: (index: number, step: StepDraft) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-2 items-start bg-slate-800 rounded-lg p-3 border border-slate-700">
      <div className="col-span-1 text-slate-500 font-mono text-sm pt-2 text-center">
        {index + 1}
      </div>
      <div className="col-span-3">
        <input
          type="text"
          placeholder="Descripción del paso"
          value={step.description}
          onChange={(e) => onChange(index, { ...step, description: e.target.value })}
          className="w-full bg-slate-900 text-white border border-slate-600 rounded px-2 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-2">
        <input
          type="text"
          placeholder="Actor"
          value={step.actor}
          onChange={(e) => onChange(index, { ...step, actor: e.target.value })}
          className="w-full bg-slate-900 text-white border border-slate-600 rounded px-2 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-2">
        <input
          type="text"
          placeholder="Herramienta actual"
          value={step.currentTool}
          onChange={(e) => onChange(index, { ...step, currentTool: e.target.value })}
          className="w-full bg-slate-900 text-white border border-slate-600 rounded px-2 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-1">
        <input
          type="number"
          placeholder="Min"
          value={step.estimatedTimeMinutes || ''}
          onChange={(e) => onChange(index, { ...step, estimatedTimeMinutes: parseInt(e.target.value) || 0 })}
          className="w-full bg-slate-900 text-white border border-slate-600 rounded px-2 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-1 flex items-center justify-center pt-1">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={step.agentCandidate}
            onChange={(e) => onChange(index, { ...step, agentCandidate: e.target.checked })}
            className="rounded border-slate-600"
          />
          <span className="text-xs text-slate-400">Agente</span>
        </label>
      </div>
      <div className="col-span-2 flex gap-1">
        <input
          type="text"
          placeholder="Punto de dolor"
          value={step.painPoint}
          onChange={(e) => onChange(index, { ...step, painPoint: e.target.value })}
          className="flex-1 bg-slate-900 text-white border border-slate-600 rounded px-2 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300 px-1"
        >
          X
        </button>
      </div>
    </div>
  );
}

export default function CujMapperPage() {
  const { orgId, cujId } = useParams<{ orgId: string; cujId?: string }>();
  const navigate = useNavigate();
  const { currentCuj, fetchCuj, createCuj, updateCuj, isLoading } = useCujStore();

  const [name, setName] = useState('');
  const [actor, setActor] = useState('');
  const [objective, setObjective] = useState('');
  const [steps, setSteps] = useState<StepDraft[]>([{ ...EMPTY_STEP, stepOrder: 1 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cujId) void fetchCuj(cujId);
  }, [cujId, fetchCuj]);

  useEffect(() => {
    if (currentCuj && cujId) {
      setName(currentCuj.name);
      setActor(currentCuj.actor);
      setObjective(currentCuj.objective);
      setSteps(
        currentCuj.steps.map((s) => ({
          stepOrder: s.stepOrder,
          description: s.description,
          actor: s.actor,
          currentTool: s.currentTool,
          estimatedTimeMinutes: s.estimatedTimeMinutes,
          painPoint: s.painPoint,
          agentCandidate: s.agentCandidate,
        })),
      );
    }
  }, [currentCuj, cujId]);

  function handleStepChange(index: number, step: StepDraft) {
    setSteps((prev) => prev.map((s, i) => (i === index ? step : s)));
  }

  function handleRemoveStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddStep() {
    setSteps((prev) => [...prev, { ...EMPTY_STEP, stepOrder: prev.length + 1 }]);
  }

  async function handleSave() {
    if (!orgId || !name || !actor || !objective) return;
    setSaving(true);
    try {
      const stepsWithOrder = steps.map((s, i) => ({ ...s, stepOrder: i + 1 }));
      if (cujId) {
        await updateCuj(cujId, { name, actor, objective, steps: stepsWithOrder });
      } else {
        // engagementId se obtiene del contexto de la org — se pasa como query param
        const params = new URLSearchParams(window.location.search);
        const engagementId = params.get('engagementId') ?? '';
        await createCuj({ engagementId, name, actor, objective, steps: stepsWithOrder });
      }
      navigate(`/org/${orgId}/pilots`);
    } catch {
      // Error manejado por el store
    } finally {
      setSaving(false);
    }
  }

  // Métricas calculadas
  const totalTime = steps.reduce((sum, s) => sum + s.estimatedTimeMinutes, 0);
  const totalSteps = steps.length;
  const agentCandidates = steps.filter((s) => s.agentCandidate).length;
  const automatizablePercent = totalSteps > 0 ? Math.round((agentCandidates / totalSteps) * 100) : 0;

  if (isLoading) {
    return <div className="p-6 text-slate-400">Cargando...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          {cujId ? 'Editar' : 'Nuevo'} Critical User Journey
        </h1>
        <button
          type="button"
          onClick={() => navigate(`/org/${orgId}/pilots`)}
          className="text-slate-400 hover:text-white text-sm"
        >
          Volver a pilotos
        </button>
      </div>

      {/* Metadata del CUJ */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Nombre del journey</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Onboarding de cliente nuevo"
            className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Actor principal (rol)</label>
          <input
            type="text"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Ej: Ejecutivo de cuenta"
            className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Objetivo final</label>
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Ej: Cliente activo en menos de 48h"
            className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{totalTime} min</div>
          <div className="text-sm text-slate-400">Tiempo total</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{totalSteps}</div>
          <div className="text-sm text-slate-400">Pasos totales</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-blue-400">{agentCandidates}</div>
          <div className="text-sm text-slate-400">Candidatos a agente</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-emerald-400">{automatizablePercent}%</div>
          <div className="text-sm text-slate-400">Automatizable</div>
        </div>
      </div>

      {/* Header de columnas */}
      <div className="grid grid-cols-12 gap-2 mb-2 px-3 text-xs text-slate-500 font-medium">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Paso</div>
        <div className="col-span-2">Actor</div>
        <div className="col-span-2">Herramienta</div>
        <div className="col-span-1">Min</div>
        <div className="col-span-1">IA</div>
        <div className="col-span-2">Dolor</div>
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-4">
        {steps.map((step, i) => (
          <StepRow
            key={i}
            step={step}
            index={i}
            onChange={handleStepChange}
            onRemove={handleRemoveStep}
          />
        ))}
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAddStep}
          className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm"
        >
          + Agregar paso
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name || !actor || !objective}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? 'Guardando...' : 'Guardar Journey'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Agregar rutas en App.tsx**

Agregar import después de `import ProcessMapDetailPage` (línea ~23):

```tsx
import CujMapperPage from './pages/CujMapperPage';
```

Agregar rutas después del bloque de procesos (después de línea ~57):

```tsx
          {/* CUJ Mapper */}
          <Route path="/org/:orgId/cujs/new" element={<CujMapperPage />} />
          <Route path="/org/:orgId/cujs/:cujId" element={<CujMapperPage />} />
```

- [ ] **Step 3: Verificar typecheck del frontend**

Run: `cd C:/Productos/AICompass/ai-compass && npx tsc --noEmit`
Expected: Sin errores de tipo nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CujMapperPage.tsx src/App.tsx
git commit -m "feat: CUJ Mapper Page con editor de steps y métricas calculadas"
```

---

## Task 11: Frontend — Value Engineering Page

**Files:**
- Create: `src/pages/ValueEngineeringPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear la página de Value Engineering**

```tsx
// ══════════════════════════════════════════════
// VALUE ENGINEERING PAGE — Matriz de priorización
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet } from '@/services/apiClient';
import type { ValueEffort, ValueRisk, ValueTimeToValue } from '@/types';

interface PilotValueRow {
  id: string;
  title: string;
  status: string;
  tool: string;
  valuePnl: number | null;
  valuePnlType: string | null;
  valueEffort: string | null;
  valueRisk: string | null;
  valueTimeToValue: string | null;
  valueScore: number | null;
  implementationType: string | null;
  cujId: string | null;
  startDate: string | null;
  committeeDecision: string | null;
}

interface ValueMatrixResponse {
  pilots: PilotValueRow[];
  summary: {
    total: number;
    evaluated: number;
    pending: number;
    totalPnl: number;
  };
}

const EFFORT_LABELS: Record<ValueEffort, string> = {
  S: 'Pequeno (S)',
  M: 'Mediano (M)',
  L: 'Grande (L)',
  XL: 'Muy grande (XL)',
};

const RISK_LABELS: Record<ValueRisk, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
};

const TTV_LABELS: Record<ValueTimeToValue, string> = {
  under_4w: '< 4 semanas',
  '4_to_12w': '4-12 semanas',
  over_12w: '> 12 semanas',
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-slate-500 text-sm">Sin evaluar</span>;
  }
  const color =
    score >= 70 ? 'bg-emerald-900 text-emerald-300' :
    score >= 40 ? 'bg-yellow-900 text-yellow-300' :
    'bg-red-900 text-red-300';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {score}
    </span>
  );
}

function formatCurrency(amount: number | null): string {
  if (amount === null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export default function ValueEngineeringPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ValueMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setIsLoading(true);
    apiGet<ValueMatrixResponse>(`/value-engineering/organization/${orgId}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [orgId]);

  if (isLoading) {
    return <div className="p-6 text-slate-400">Cargando matriz de priorización...</div>;
  }

  if (!data) {
    return <div className="p-6 text-red-400">Error al cargar datos de Value Engineering.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Matriz de Value Engineering</h1>
        <button
          type="button"
          onClick={() => navigate(`/org/${orgId}/pilots`)}
          className="text-slate-400 hover:text-white text-sm"
        >
          Volver a pilotos
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{data.summary.total}</div>
          <div className="text-sm text-slate-400">Pilotos totales</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-emerald-400">{data.summary.evaluated}</div>
          <div className="text-sm text-slate-400">Evaluados</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-yellow-400">{data.summary.pending}</div>
          <div className="text-sm text-slate-400">Sin evaluar</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(data.summary.totalPnl)}</div>
          <div className="text-sm text-slate-400">Impacto P&L total</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left px-4 py-3 font-medium">Score</th>
              <th className="text-left px-4 py-3 font-medium">Piloto</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-right px-4 py-3 font-medium">Impacto P&L</th>
              <th className="text-left px-4 py-3 font-medium">Esfuerzo</th>
              <th className="text-left px-4 py-3 font-medium">Riesgo</th>
              <th className="text-left px-4 py-3 font-medium">Tiempo al valor</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {data.pilots.map((pilot) => (
              <tr
                key={pilot.id}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer"
                onClick={() => navigate(`/org/${orgId}/pilots/${pilot.id}`)}
              >
                <td className="px-4 py-3">
                  <ScoreBadge score={pilot.valueScore} />
                </td>
                <td className="px-4 py-3 text-white font-medium">{pilot.title}</td>
                <td className="px-4 py-3 text-slate-300 capitalize">{pilot.status}</td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {formatCurrency(pilot.valuePnl)}
                  {pilot.valuePnlType && (
                    <span className="text-xs text-slate-500 ml-1">
                      ({pilot.valuePnlType === 'savings' ? 'ahorro' : 'ingreso'})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {pilot.valueEffort ? EFFORT_LABELS[pilot.valueEffort as ValueEffort] ?? pilot.valueEffort : '—'}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {pilot.valueRisk ? RISK_LABELS[pilot.valueRisk as ValueRisk] ?? pilot.valueRisk : '—'}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {pilot.valueTimeToValue ? TTV_LABELS[pilot.valueTimeToValue as ValueTimeToValue] ?? pilot.valueTimeToValue : '—'}
                </td>
                <td className="px-4 py-3 text-slate-300 capitalize">
                  {pilot.implementationType === 'digitalization' ? 'Digitalización' : 'Rediseño'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Agregar ruta en App.tsx**

Agregar import:

```tsx
import ValueEngineeringPage from './pages/ValueEngineeringPage';
```

Agregar ruta después de las rutas de CUJ:

```tsx
          {/* Value Engineering */}
          <Route path="/org/:orgId/value-engineering" element={<ValueEngineeringPage />} />
```

- [ ] **Step 3: Verificar typecheck del frontend**

Run: `cd C:/Productos/AICompass/ai-compass && npx tsc --noEmit`
Expected: Sin errores de tipo nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ValueEngineeringPage.tsx src/App.tsx
git commit -m "feat: Value Engineering Page — matriz de priorización con score calculado"
```

---

## Task 12: Integración — Value Engineering en PilotDetailPage

**Files:**
- Modify: `src/stores/pilotStore.ts`
- Modify: `src/pages/PilotDetailPage.tsx` (sección parcial)

- [ ] **Step 1: Extender CreatePilotData y UpdatePilotData en pilotStore.ts**

Agregar a `CreatePilotData` (después de `championEmail`):

```typescript
  implementationType?: 'digitalization' | 'redesign';
  cujId?: string;
  valuePnl?: number;
  valuePnlType?: 'savings' | 'revenue';
  valueEffort?: 'S' | 'M' | 'L' | 'XL';
  valueRisk?: 'low' | 'medium' | 'high';
  valueTimeToValue?: 'under_4w' | '4_to_12w' | 'over_12w';
```

Agregar los mismos campos a `UpdatePilotData` (después de `roleImpacts`):

```typescript
  implementationType?: 'digitalization' | 'redesign';
  cujId?: string | null;
  valuePnl?: number | null;
  valuePnlType?: 'savings' | 'revenue' | null;
  valueEffort?: 'S' | 'M' | 'L' | 'XL' | null;
  valueRisk?: 'low' | 'medium' | 'high' | null;
  valueTimeToValue?: 'under_4w' | '4_to_12w' | 'over_12w' | null;
```

- [ ] **Step 2: Agregar sección de Value Engineering al PilotDetailPage**

Nota: PilotDetailPage es un archivo grande. Agregar una sección después de la sección de baseline/métricas existente. El implementador debe localizar el punto correcto en el archivo y agregar un bloque `<section>` con:

- Select para `implementationType` (Digitalización / Rediseño)
- Input numérico para `valuePnl`
- Select para `valuePnlType` (Ahorro / Ingreso)
- Select para `valueEffort` (S/M/L/XL)
- Select para `valueRisk` (Bajo/Medio/Alto)
- Select para `valueTimeToValue` (< 4 sem / 4-12 sem / > 12 sem)
- Visualización del `valueScore` calculado (read-only)
- Link "Mapear Journey" que navega a `/org/${orgId}/cujs/new?engagementId=${engagementId}&pilotId=${pilotId}`

El implementador debe leer `PilotDetailPage.tsx` completo para encontrar la ubicación correcta y seguir los patrones de formulario existentes (bg-slate-800, rounded-xl, etc.).

- [ ] **Step 3: Verificar typecheck del frontend**

Run: `cd C:/Productos/AICompass/ai-compass && npx tsc --noEmit`
Expected: Sin errores de tipo nuevos.

- [ ] **Step 4: Verificar en browser**

Run: `cd C:/Productos/AICompass/ai-compass && npm run dev`
Navegar a un piloto existente y verificar que:
1. La sección de Value Engineering aparece
2. Los selects funcionan
3. El link a CUJ Mapper navega correctamente

- [ ] **Step 5: Commit**

```bash
git add src/stores/pilotStore.ts src/pages/PilotDetailPage.tsx
git commit -m "feat: integración de Value Engineering en detalle de piloto + link a CUJ"
```

---

## Task 13: Validación final

**Files:** Ninguno nuevo

- [ ] **Step 1: Ejecutar lint**

Run: `cd C:/Productos/AICompass/ai-compass && npm run validate`
Expected: Sin errores de lint (warnings aceptables).

- [ ] **Step 2: Ejecutar build**

Run: `cd C:/Productos/AICompass/ai-compass && npm run build`
Expected: Build exitoso sin errores.

- [ ] **Step 3: Verificar en browser — flujo completo**

Run: `cd C:/Productos/AICompass/ai-compass && npm run dev`

Verificar:
1. Red Flags nuevas: Crear un piloto con `implementationType: 'digitalization'` y verificar que RF-13 aparece en el banner
2. CUJ Mapper: Navegar a `/org/{orgId}/cujs/new`, crear un journey con 3+ pasos, verificar métricas calculadas
3. Value Engineering: Navegar a `/org/{orgId}/value-engineering`, verificar tabla con scores
4. Integración: En un piloto, completar campos de value engineering y ver que el score se calcula

- [ ] **Step 4: Commit final si hay ajustes**

```bash
git add -A
git commit -m "fix: ajustes de validación final — herramientas de transformación agéntica"
```
