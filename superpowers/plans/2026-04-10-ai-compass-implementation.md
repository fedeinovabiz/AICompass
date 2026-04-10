# AI Compass — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir AI Compass MVP (Etapas 1-3): diagnóstico de madurez en IA organizacional con sesiones estructuradas, procesamiento de transcripciones con IA, constitución de comité, y tracking de pilotos.

**Architecture:** Producto nuevo independiente. Frontend React 19 + Backend Express + PostgreSQL. Motor de IA con abstracción de proveedor (Gemini/Claude/OpenAI). Zustand para estado, React Router para navegación, Tailwind CSS para estilos.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Zustand, Recharts, Node.js, Express, PostgreSQL, JWT, Multer, Google Gemini / Anthropic Claude / OpenAI.

**Spec de referencia:** `docs/superpowers/specs/2026-04-10-ai-compass-design.md`

---

## Estructura de Archivos del Proyecto

```
ai-compass/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .env.local
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   ├── index.ts                    # Todas las interfaces del dominio
│   │   └── api.ts                      # Tipos de request/response API
│   ├── constants/
│   │   ├── dimensions.ts               # 6 dimensiones con niveles de madurez
│   │   ├── questions.ts                # Preguntas por sesión y dimensión
│   │   ├── stages.ts                   # 5 etapas con criterios de avance
│   │   ├── foundationalDecisions.ts    # 8 decisiones del comité
│   │   └── redFlags.ts                 # Reglas de alertas automatizadas
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── organizationStore.ts
│   │   ├── sessionStore.ts
│   │   ├── committeeStore.ts
│   │   └── pilotStore.ts
│   ├── services/
│   │   ├── apiClient.ts                # HTTP client con JWT
│   │   ├── transcriptParser.ts         # Parsing .vtt/.srt/texto
│   │   └── ai/
│   │       ├── types.ts                # AIProvider interface, inputs/outputs
│   │       ├── aiService.ts            # Fachada pública
│   │       ├── providers/
│   │       │   ├── index.ts            # Registry
│   │       │   ├── geminiProvider.ts
│   │       │   ├── claudeProvider.ts
│   │       │   └── openaiProvider.ts
│   │       └── prompts/
│   │           ├── sessionAnalysis.ts
│   │           ├── transcriptExtraction.ts
│   │           ├── crossSessionAnalysis.ts
│   │           └── reportGeneration.ts
│   ├── hooks/
│   │   ├── useMaturityScore.ts
│   │   ├── useRedFlags.ts
│   │   ├── useStageProgress.ts
│   │   └── useTranscriptProcessing.ts
│   ├── components/
│   │   ├── Layout.tsx                  # Shell con sidebar + header
│   │   ├── ProtectedRoute.tsx          # Guard por rol
│   │   ├── SpiderChart.tsx             # Radar chart 6 dimensiones
│   │   ├── StageProgress.tsx           # Barra de progreso por etapa
│   │   ├── StageMap.tsx                # Mapa visual de 5 etapas
│   │   ├── RedFlagAlert.tsx            # Componente de alerta
│   │   ├── RedFlagBanner.tsx           # Banner de red flags activos
│   │   ├── QuestionCard.tsx            # Pregunta + respuesta + validación
│   │   ├── ValidationPanel.tsx         # Panel de revisión IA
│   │   ├── TranscriptUploader.tsx      # Drag & drop de transcripciones
│   │   ├── ParticipantManager.tsx      # CRUD participantes de sesión
│   │   ├── ConfidenceBadge.tsx         # Indicador alto/medio/bajo
│   │   ├── FindingsPanel.tsx           # Hallazgos emergentes
│   │   └── DecisionCard.tsx            # Card de decisión fundacional
│   └── pages/
│       ├── LoginPage.tsx
│       ├── DashboardPage.tsx           # Lista de organizaciones
│       ├── OrganizationPage.tsx        # Detalle de organización
│       ├── MaturityMapPage.tsx         # Mapa de etapas (pantalla principal)
│       ├── SessionListPage.tsx         # Lista de sesiones del engagement
│       ├── SessionViewPage.tsx         # Conducir/revisar sesión individual
│       ├── TranscriptReviewPage.tsx    # Panel de validación post-IA
│       ├── CommitteeDesignPage.tsx     # Recomendación de composición
│       ├── CommitteeConstitutionPage.tsx # 8 decisiones fundacionales
│       ├── DiagnosticReportPage.tsx    # Spider chart + diagnóstico
│       ├── PilotListPage.tsx           # Dashboard de pilotos (Etapa 3)
│       ├── PilotDetailPage.tsx         # Detalle y métricas de un piloto
│       └── ReportBuilderPage.tsx       # Edición de entregables
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                    # Entry point Express
│   │   ├── config.ts                   # Variables de entorno
│   │   ├── db.ts                       # Conexión PostgreSQL
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # JWT middleware
│   │   │   └── roleGuard.ts            # Guard por rol (admin/facilitator/council)
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── organizations.ts
│   │   │   ├── engagements.ts
│   │   │   ├── sessions.ts
│   │   │   ├── transcripts.ts
│   │   │   ├── committees.ts
│   │   │   ├── pilots.ts
│   │   │   ├── reports.ts
│   │   │   └── ai.ts                   # Endpoints de procesamiento IA
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── types.ts
│   │   │   │   ├── aiService.ts
│   │   │   │   ├── providers/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── geminiProvider.ts
│   │   │   │   │   ├── claudeProvider.ts
│   │   │   │   │   └── openaiProvider.ts
│   │   │   │   └── prompts/
│   │   │   │       ├── sessionAnalysis.ts
│   │   │   │       ├── transcriptExtraction.ts
│   │   │   │       ├── crossSessionAnalysis.ts
│   │   │   │       └── reportGeneration.ts
│   │   │   └── transcriptParser.ts
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   └── tests/
│       ├── auth.test.ts
│       ├── organizations.test.ts
│       ├── sessions.test.ts
│       └── ai.test.ts
```

---

## Fase 1: Fundación (Project Setup + Tipos + DB)

### Task 1: Scaffolding del proyecto

**Files:**
- Create: `ai-compass/package.json`
- Create: `ai-compass/tsconfig.json`
- Create: `ai-compass/vite.config.ts`
- Create: `ai-compass/tailwind.config.js`
- Create: `ai-compass/index.html`
- Create: `ai-compass/.env.local`
- Create: `ai-compass/src/main.tsx`
- Create: `ai-compass/src/App.tsx`

- [ ] **Step 1: Crear directorio del proyecto e inicializar**

```bash
mkdir -p ../ai-compass
cd ../ai-compass
npm init -y
```

- [ ] **Step 2: Instalar dependencias del frontend**

```bash
npm install react@19 react-dom@19 react-router-dom zustand recharts
npm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react tailwindcss @tailwindcss/vite postcss autoprefixer
```

- [ ] **Step 3: Crear tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Crear vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://localhost:3002',
    },
  },
});
```

- [ ] **Step 5: Crear index.html**

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Compass — Diagnóstico de Madurez en IA</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Crear .env.local**

```bash
VITE_API_URL=http://localhost:3002/api
```

- [ ] **Step 7: Crear src/main.tsx y src/App.tsx mínimos**

`src/main.tsx`:
```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

`src/App.tsx`:
```typescript
import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 text-white bg-slate-900 min-h-screen">AI Compass</div>} />
    </Routes>
  );
}
```

`src/index.css`:
```css
@import "tailwindcss";

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
}
```

- [ ] **Step 8: Verificar que el frontend arranca**

```bash
npx vite --open
```

Expected: Browser abre en localhost:3001 mostrando "AI Compass" sobre fondo oscuro.

- [ ] **Step 9: Commit**

```bash
git init
echo "node_modules\ndist\n.env.local" > .gitignore
git add .
git commit -m "feat: scaffolding inicial del proyecto AI Compass"
```

---

### Task 2: Tipos del dominio

**Files:**
- Create: `ai-compass/src/types/index.ts`
- Create: `ai-compass/src/types/api.ts`

- [ ] **Step 1: Crear tipos del dominio**

`src/types/index.ts`:
```typescript
// ══════════════════════════════════════════════
// ENUMS Y TIPOS BASE
// ══════════════════════════════════════════════

export type UserRole = 'admin' | 'facilitator' | 'council';

export type Stage = 1 | 2 | 3 | 4 | 5;

export type DimensionKey =
  | 'estrategia'
  | 'procesos'
  | 'datos'
  | 'tecnologia'
  | 'cultura'
  | 'gobernanza';

export type MaturityLevel = 1 | 2 | 3 | 4;

export type SessionType =
  | 'ejecutiva'
  | 'operativa'
  | 'tecnica'
  | 'constitucion'
  | 'deep-dive'
  | 'presentacion';

export type SessionModality = 'presencial' | 'remota';

export type ValidationStatus =
  | 'pending'
  | 'approved'
  | 'edited'
  | 'rejected'
  | 'not-mentioned';

export type ConfidenceLevel = 'alto' | 'medio' | 'bajo';

export type PilotStatus =
  | 'designing'
  | 'active'
  | 'evaluating'
  | 'scale'
  | 'iterate'
  | 'kill';

export type RedFlagSeverity = 'warning' | 'alert' | 'block';

export type EngagementStatus = 'active' | 'paused' | 'completed';

export type DeepDiveTrigger =
  | 'datos-rojo'
  | 'cultura-rojo'
  | 'procesos-rojo'
  | 'brecha-ejecutivo-operativo'
  | 'tecnologia-fragmentada';

// ══════════════════════════════════════════════
// ENTIDADES PRINCIPALES
// ══════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string; // Solo para council members
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  size: string;
  contactName: string;
  contactEmail: string;
  currentStage: Stage;
  maturityScores: Record<DimensionKey, number | null>;
  stageHistory: StageTransition[];
  stageCriteria: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface StageTransition {
  from: Stage;
  to: Stage;
  timestamp: string;
  facilitatorId: string;
  justification: string;
}

export interface Engagement {
  id: string;
  organizationId: string;
  facilitatorId: string;
  status: EngagementStatus;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  engagementId: string;
  type: SessionType;
  modality: SessionModality;
  title: string;
  scheduledDate?: string;
  completedDate?: string;
  participants: Participant[];
  notes: string;
  transcriptFileUrl?: string;
  transcriptText?: string;
  questions: SessionQuestion[];
  findings: EmergentFinding[];
  aiProcessedAt?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'validated';
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  area: string;
}

export interface SessionQuestion {
  id: string;
  questionId: string; // Referencia a la pregunta del catálogo
  dimension: DimensionKey;
  questionText: string;
  manualAnswer?: string; // Respuesta directa del facilitador
  suggestedAnswer?: string; // Respuesta sugerida por IA
  finalAnswer?: string; // Respuesta validada final
  suggestedLevel?: MaturityLevel;
  confidence?: ConfidenceLevel;
  citations: Citation[];
  validationStatus: ValidationStatus;
  editedAnswer?: string; // Si fue editada, la versión editada
}

export interface Citation {
  text: string;
  speakerName: string;
  speakerRole: string;
  timestamp?: string;
}

export interface EmergentFinding {
  id: string;
  type: 'alignment' | 'misalignment' | 'champion' | 'resistance' | 'uncovered-topic';
  description: string;
  citations: Citation[];
  relatedDimensions: DimensionKey[];
}

// ══════════════════════════════════════════════
// COMITÉ
// ══════════════════════════════════════════════

export type CommitteeRole =
  | 'sponsor'
  | 'operational-leader'
  | 'business-rep'
  | 'it-rep'
  | 'change-management';

export interface CommitteeMember {
  id: string;
  name: string;
  email: string;
  role: CommitteeRole;
  area: string;
  userId?: string; // Se crea cuando se da acceso a la plataforma
}

export interface FoundationalDecision {
  id: string;
  number: number; // 1-8
  title: string;
  description: string;
  response: string;
  decidedAt?: string;
}

export interface Committee {
  id: string;
  organizationId: string;
  members: CommitteeMember[];
  decisions: FoundationalDecision[];
  meetingCadence: string;
  constitutedAt?: string;
  meetingHistory: CommitteeMeeting[];
}

export interface CommitteeMeeting {
  id: string;
  date: string;
  attendees: string[]; // IDs de miembros
  decisions: string[];
  notes: string;
}

// ══════════════════════════════════════════════
// PILOTOS (ETAPA 3)
// ══════════════════════════════════════════════

export interface Pilot {
  id: string;
  organizationId: string;
  title: string;
  processDescription: string;
  processBefore: string;
  processAfter: string;
  tool: string;
  teamSize: number;
  championName: string;
  championEmail: string;
  status: PilotStatus;
  baseline: PilotMetric[];
  metrics: PilotMetricEntry[];
  startDate?: string;
  evaluationDate?: string;
  committeeDecision?: string;
  committeeDecisionDate?: string;
  quickWinIds: string[];
  createdAt: string;
}

export interface PilotMetric {
  name: string;
  unit: string;
  baselineValue: number;
}

export interface PilotMetricEntry {
  date: string;
  values: Record<string, number>; // metricName -> valor
  notes?: string;
}

// ══════════════════════════════════════════════
// RED FLAGS
// ══════════════════════════════════════════════

export interface RedFlag {
  id: string;
  organizationId: string;
  ruleId: string;
  severity: RedFlagSeverity;
  title: string;
  description: string;
  stage: Stage;
  detectedAt: string;
  resolvedAt?: string;
  resolution?: string;
  overrideJustification?: string;
}

// ══════════════════════════════════════════════
// ENTREGABLES
// ══════════════════════════════════════════════

export interface Deliverable {
  id: string;
  organizationId: string;
  engagementId: string;
  type: DeliverableType;
  title: string;
  content: string; // JSON o Markdown según tipo
  status: 'draft' | 'review' | 'published';
  generatedAt: string;
  publishedAt?: string;
  publishedBy?: string;
}

export type DeliverableType =
  | 'findings-map'
  | 'committee-proposal'
  | 'constitution-act'
  | 'full-diagnostic'
  | 'quick-win-sheet'
  | 'final-presentation'
  | 'pilot-design'
  | 'biweekly-report'
  | 'pilot-evaluation';

// ══════════════════════════════════════════════
// ANÁLISIS CROSS-SESIÓN
// ══════════════════════════════════════════════

export interface CrossSessionAnalysis {
  organizationId: string;
  dimensionScores: Record<DimensionKey, DimensionAnalysis>;
  committeeRecommendation: CommitteeRecommendation;
  deepDiveRecommendations: DeepDiveRecommendation[];
  quickWinSuggestions: QuickWinSuggestion[];
  generatedAt: string;
}

export interface DimensionAnalysis {
  score: MaturityLevel;
  summary: string;
  evidence: Citation[];
  gaps: string[];
}

export interface CommitteeRecommendation {
  suggestedMembers: {
    role: CommitteeRole;
    suggestedPerson?: string;
    justification: string;
  }[];
}

export interface DeepDiveRecommendation {
  trigger: DeepDiveTrigger;
  title: string;
  justification: string;
  suggestedParticipants: string[];
  suggestedQuestions: string[];
}

export interface QuickWinSuggestion {
  title: string;
  processBefore: string;
  processAfter: string;
  suggestedTool: string;
  estimatedImpact: string;
  timeline: string;
}
```

- [ ] **Step 2: Crear tipos de API**

`src/types/api.ts`:
```typescript
import type { User, Organization, Engagement, Session, Committee, Pilot, Deliverable, RedFlag, CrossSessionAnalysis } from './index';

// Auth
export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { token: string; user: User; }

// CRUD genéricos
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string>;
}

// Transcripts
export interface TranscriptUploadResponse {
  fileUrl: string;
  parsedText: string;
  wordCount: number;
}

// AI Processing
export interface AIProcessRequest {
  sessionId: string;
  includeTranscript: boolean;
  includeNotes: boolean;
}

export interface AIProcessResponse {
  questions: Array<{
    questionId: string;
    suggestedAnswer: string;
    suggestedLevel: number;
    confidence: string;
    citations: Array<{ text: string; speakerName: string; speakerRole: string; timestamp?: string }>;
  }>;
  findings: Array<{
    type: string;
    description: string;
    citations: Array<{ text: string; speakerName: string; speakerRole: string }>;
    relatedDimensions: string[];
  }>;
}

export interface CrossAnalysisRequest {
  organizationId: string;
  sessionIds: string[];
}

export type CrossAnalysisResponse = CrossSessionAnalysis;
```

- [ ] **Step 3: Verificar que compila**

```bash
npx tsc --noEmit
```

Expected: Sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/types/
git commit -m "feat: tipos del dominio completos (entidades, API, enums)"
```

---

### Task 3: Constantes del dominio

**Files:**
- Create: `ai-compass/src/constants/dimensions.ts`
- Create: `ai-compass/src/constants/questions.ts`
- Create: `ai-compass/src/constants/stages.ts`
- Create: `ai-compass/src/constants/foundationalDecisions.ts`
- Create: `ai-compass/src/constants/redFlags.ts`

- [ ] **Step 1: Crear dimensiones con niveles de madurez**

`src/constants/dimensions.ts`:
```typescript
import type { DimensionKey, MaturityLevel } from '@/types';

export interface DimensionDefinition {
  key: DimensionKey;
  name: string;
  description: string;
  levels: Record<MaturityLevel, string>;
}

export const DIMENSIONS: DimensionDefinition[] = [
  {
    key: 'estrategia',
    name: 'Estrategia e IA',
    description: 'Visión de IA en el negocio, presupuesto, liderazgo',
    levels: {
      1: 'No existe visión de IA. No hay presupuesto ni conversación al respecto.',
      2: 'Se reconoce la necesidad pero no hay plan concreto. Presupuesto ad hoc.',
      3: 'Hay una estrategia documentada con presupuesto asignado y objetivos medibles.',
      4: 'IA está integrada en la estrategia de negocio. El liderazgo hace role modeling activo.',
    },
  },
  {
    key: 'procesos',
    name: 'Procesos',
    description: 'Documentación, flujos de trabajo, candidatos a automatización',
    levels: {
      1: 'Los procesos viven en la cabeza de las personas. No hay documentación.',
      2: 'Algunos procesos están documentados de manera informal o incompleta.',
      3: 'Procesos clave documentados y estandarizados. Se identifican candidatos a automatización.',
      4: 'Procesos rediseñados con IA integrada. Puntos de validación humana definidos.',
    },
  },
  {
    key: 'datos',
    name: 'Datos',
    description: 'Centralización, gobernanza, calidad, accesibilidad',
    levels: {
      1: 'Información dispersa en spreadsheets, emails y carpetas personales.',
      2: 'Algunos datos centralizados pero sin gobernanza de acceso ni calidad.',
      3: 'Datos centralizados con gobernanza básica. Se sabe quién accede a qué.',
      4: 'Datos como activo estratégico. Infraestructura optimizada para alimentar modelos de IA.',
    },
  },
  {
    key: 'tecnologia',
    name: 'Tecnología',
    description: 'Herramientas actuales, infraestructura cloud, capacidad de integración',
    levels: {
      1: 'Herramientas básicas de productividad. Sin infraestructura cloud.',
      2: 'Herramientas de productividad modernas (M365/Google). Cloud básico.',
      3: 'Plataforma de IA seleccionada e integrada. Múltiples herramientas en uso.',
      4: 'Plataformas de orquestación de agentes. Integraciones avanzadas (MCP, APIs).',
    },
  },
  {
    key: 'cultura',
    name: 'Cultura y Personas',
    description: 'Mentalidad de crecimiento, resistencia al cambio, role modeling del liderazgo',
    levels: {
      1: 'Resistencia al cambio. Uso de IA visto como "trampa" o amenaza.',
      2: 'Curiosidad incipiente. Algunos usan IA por cuenta propia de manera informal.',
      3: 'Cultura de experimentación. Red de Champions activa. Show & tell regular.',
      4: 'IA como parte de la identidad organizacional. Aprendizaje continuo como norma.',
    },
  },
  {
    key: 'gobernanza',
    name: 'Gobernanza',
    description: 'Políticas de uso, framework de IA Responsable, medición de impacto',
    levels: {
      1: 'No existen políticas de uso de IA. Sin control ni medición.',
      2: 'Política mínima viable. Reglas básicas de qué datos no usar con IA externa.',
      3: 'Política formal. Framework de IA Responsable. ROI medido por caso de uso.',
      4: 'Centro de Excelencia. Gobernanza ágil descentralizada. Auditoría activa.',
    },
  },
];
```

- [ ] **Step 2: Crear preguntas por sesión y dimensión**

`src/constants/questions.ts`:
```typescript
import type { SessionType, DimensionKey } from '@/types';

export interface QuestionDefinition {
  id: string;
  sessionType: SessionType;
  dimension: DimensionKey;
  text: string;
  probeQuestions: string[]; // Preguntas de profundización
}

export const QUESTIONS: QuestionDefinition[] = [
  // ═══ S1: VISIÓN EJECUTIVA ═══
  // Dimensión: Estrategia
  {
    id: 'S1-EST-01',
    sessionType: 'ejecutiva',
    dimension: 'estrategia',
    text: '¿Cómo encaja la IA en la visión estratégica de la organización a 2-3 años?',
    probeQuestions: [
      '¿Hay un objetivo concreto o es una aspiración general?',
      '¿Qué resultados de negocio espera que la IA impulse?',
    ],
  },
  {
    id: 'S1-EST-02',
    sessionType: 'ejecutiva',
    dimension: 'estrategia',
    text: '¿Hay presupuesto asignado específicamente para iniciativas de IA?',
    probeQuestions: [
      '¿Es un presupuesto recurrente o puntual?',
      '¿Quién tiene la autoridad para aprobar inversiones en IA?',
    ],
  },
  {
    id: 'S1-EST-03',
    sessionType: 'ejecutiva',
    dimension: 'estrategia',
    text: '¿El liderazgo senior usa IA activamente en su trabajo diario?',
    probeQuestions: [
      '¿Puede dar un ejemplo de cómo usted usa IA esta semana?',
      '¿Sus reportes directos lo ven usando IA?',
    ],
  },
  // Dimensión: Gobernanza
  {
    id: 'S1-GOB-01',
    sessionType: 'ejecutiva',
    dimension: 'gobernanza',
    text: '¿Existe alguna política sobre el uso de herramientas de IA en la organización?',
    probeQuestions: [
      '¿La gente sabe qué puede y qué no puede hacer con IA?',
      '¿Se ha comunicado alguna posición oficial?',
    ],
  },
  {
    id: 'S1-GOB-02',
    sessionType: 'ejecutiva',
    dimension: 'gobernanza',
    text: '¿Qué información consideran confidencial y que no debería alimentar modelos externos?',
    probeQuestions: [
      '¿Tienen clasificación de datos definida?',
      '¿Hay restricciones regulatorias que apliquen?',
    ],
  },
  {
    id: 'S1-GOB-03',
    sessionType: 'ejecutiva',
    dimension: 'gobernanza',
    text: '¿Cómo medirían el éxito de adoptar IA? ¿Qué significaría "funcionó"?',
    probeQuestions: [
      '¿Es subir ventas, bajar costos, o mejorar experiencia del usuario?',
      '¿Tienen métricas actuales contra las que comparar?',
    ],
  },
  // ═══ S2: REALIDAD OPERATIVA ═══
  // Dimensión: Procesos
  {
    id: 'S2-PRO-01',
    sessionType: 'operativa',
    dimension: 'procesos',
    text: '¿Qué tarea les consume más tiempo de manera repetitiva?',
    probeQuestions: [
      '¿Con qué frecuencia se hace?',
      '¿Cuántas personas están involucradas?',
    ],
  },
  {
    id: 'S2-PRO-02',
    sessionType: 'operativa',
    dimension: 'procesos',
    text: '¿Dónde sienten que están haciendo trabajo que no requiere su criterio profesional?',
    probeQuestions: [
      '¿Qué porcentaje de su día es trabajo mecánico vs. criterio experto?',
      '¿Hay tareas que "cualquiera podría hacer" pero las hace el equipo senior?',
    ],
  },
  {
    id: 'S2-PRO-03',
    sessionType: 'operativa',
    dimension: 'procesos',
    text: '¿Los procesos clave están documentados o viven en la cabeza de las personas?',
    probeQuestions: [
      '¿Si alguien clave se va mañana, qué se pierde?',
      '¿Un nuevo empleado puede entender cómo hacer la tarea sin preguntar?',
    ],
  },
  // Dimensión: Cultura
  {
    id: 'S2-CUL-01',
    sessionType: 'operativa',
    dimension: 'cultura',
    text: '¿Alguien en su equipo ya usa herramientas de IA por cuenta propia?',
    probeQuestions: [
      '¿Qué herramientas? ¿Para qué tareas?',
      '¿Lo hacen abiertamente o "a escondidas"?',
    ],
  },
  {
    id: 'S2-CUL-02',
    sessionType: 'operativa',
    dimension: 'cultura',
    text: '¿Cómo reacciona el equipo cuando se habla de incorporar IA al trabajo?',
    probeQuestions: [
      '¿Hay entusiasmo, indiferencia o miedo?',
      '¿Alguien ha expresado preocupación por su puesto?',
    ],
  },
  {
    id: 'S2-CUL-03',
    sessionType: 'operativa',
    dimension: 'cultura',
    text: '¿Qué información necesitan frecuentemente que les cuesta conseguir?',
    probeQuestions: [
      '¿Cuánto tiempo pierden buscando información dispersa?',
      '¿De cuántas fuentes diferentes necesitan consolidar datos?',
    ],
  },
  // ═══ S3: CAPACIDAD TÉCNICA ═══
  // Dimensión: Tecnología
  {
    id: 'S3-TEC-01',
    sessionType: 'tecnica',
    dimension: 'tecnologia',
    text: '¿Qué suite de productividad usa la organización (Microsoft 365, Google Workspace, otra)?',
    probeQuestions: [
      '¿Qué plan/licencia tienen?',
      '¿Hay herramientas adicionales específicas por área?',
    ],
  },
  {
    id: 'S3-TEC-02',
    sessionType: 'tecnica',
    dimension: 'tecnologia',
    text: '¿Tienen infraestructura cloud? ¿Cuál y para qué la usan?',
    probeQuestions: [
      '¿Azure, AWS, GCP? ¿On-premise?',
      '¿Qué tan madura es la adopción cloud?',
    ],
  },
  {
    id: 'S3-TEC-03',
    sessionType: 'tecnica',
    dimension: 'tecnologia',
    text: '¿Hay herramientas de IA ya licenciadas o en evaluación?',
    probeQuestions: [
      '¿Copilot, ChatGPT Team, Claude, Gemini?',
      '¿Cuántas licencias? ¿Quién las usa?',
    ],
  },
  // Dimensión: Datos
  {
    id: 'S3-DAT-01',
    sessionType: 'tecnica',
    dimension: 'datos',
    text: '¿Dónde vive la información crítica del negocio?',
    probeQuestions: [
      '¿ERP, CRM, SharePoint, carpetas compartidas, emails?',
      '¿Hay una fuente de verdad o hay datos duplicados en múltiples sistemas?',
    ],
  },
  {
    id: 'S3-DAT-02',
    sessionType: 'tecnica',
    dimension: 'datos',
    text: '¿Existe gobernanza de datos? ¿Quién puede acceder a qué?',
    probeQuestions: [
      '¿Hay roles y permisos definidos?',
      '¿Se audita el acceso a información sensible?',
    ],
  },
  {
    id: 'S3-DAT-03',
    sessionType: 'tecnica',
    dimension: 'datos',
    text: '¿Cómo calificaría la calidad de los datos de la organización?',
    probeQuestions: [
      '¿Los datos están actualizados? ¿Son consistentes entre sistemas?',
      '¿Hay procesos de limpieza o validación de datos?',
    ],
  },
];

export function getQuestionsForSession(sessionType: SessionType): QuestionDefinition[] {
  return QUESTIONS.filter((q) => q.sessionType === sessionType);
}

export function getQuestionsForDimension(dimension: DimensionKey): QuestionDefinition[] {
  return QUESTIONS.filter((q) => q.dimension === dimension);
}
```

- [ ] **Step 3: Crear etapas con criterios de avance**

`src/constants/stages.ts`:
```typescript
import type { Stage } from '@/types';

export interface StageCriterion {
  id: string;
  description: string;
}

export interface StageDefinition {
  stage: Stage;
  name: string;
  duration: string;
  focus: string;
  advanceCriteria: StageCriterion[];
}

export const STAGES: StageDefinition[] = [
  {
    stage: 1,
    name: 'Diagnóstico y Comité',
    duration: 'Semanas 1-3',
    focus: 'Evaluar madurez, formar AI Council',
    advanceCriteria: [
      { id: 'S1-01', description: '3 sesiones de Discovery completadas y validadas' },
      { id: 'S1-02', description: 'Comité constituido con roles asignados' },
      { id: 'S1-03', description: '8 decisiones fundacionales documentadas' },
      { id: 'S1-04', description: 'Líder operativo tiene agenda para descubrimiento' },
    ],
  },
  {
    stage: 2,
    name: 'Descubrimiento y Priorización',
    duration: 'Semanas 3-5',
    focus: 'Deep dives, quick wins, presentación final',
    advanceCriteria: [
      { id: 'S2-01', description: 'Deep dives completados' },
      { id: 'S2-02', description: 'Presentación final realizada al comité' },
      { id: 'S2-03', description: '2-3 quick wins priorizados con diseño de piloto' },
      { id: 'S2-04', description: 'Herramienta seleccionada y equipo comprometido' },
    ],
  },
  {
    stage: 3,
    name: 'Pilotos y Quick Wins',
    duration: 'Meses 1-3',
    focus: 'Ejecutar pilotos, medir impacto, decidir',
    advanceCriteria: [
      { id: 'S3-01', description: 'Al menos 1 piloto con impacto medible' },
      { id: 'S3-02', description: 'Decisión del comité de escalar documentada' },
      { id: 'S3-03', description: 'Historia de éxito comunicable internamente' },
    ],
  },
  {
    stage: 4,
    name: 'Escalamiento y Rediseño',
    duration: 'Meses 3-9',
    focus: 'Escalar lo exitoso, rediseñar flujos',
    advanceCriteria: [],
  },
  {
    stage: 5,
    name: 'Transformación AI-First',
    duration: 'Meses 9-18+',
    focus: 'Agentes, CoE, modelo operativo',
    advanceCriteria: [],
  },
];
```

- [ ] **Step 4: Crear las 8 decisiones fundacionales**

`src/constants/foundationalDecisions.ts`:
```typescript
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
```

- [ ] **Step 5: Crear reglas de red flags**

`src/constants/redFlags.ts`:
```typescript
import type { Stage, RedFlagSeverity } from '@/types';

export interface RedFlagRule {
  id: string;
  stage: Stage;
  severity: RedFlagSeverity;
  title: string;
  description: string;
  detection: string; // Descripción de cómo se detecta
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  // Etapa 1-2: Diagnóstico
  {
    id: 'RF-S1-01',
    stage: 1,
    severity: 'alert',
    title: 'Sponsor no participó en sesión ejecutiva',
    description: 'La sesión ejecutiva se completó sin la participación del sponsor. Sin sponsor, el proceso pierde peso político.',
    detection: 'Sesión tipo "ejecutiva" completada sin participante con rol "sponsor".',
  },
  {
    id: 'RF-S1-02',
    stage: 1,
    severity: 'alert',
    title: 'Brecha ejecutivo-operativo',
    description: 'Se detectaron contradicciones significativas entre lo que dijo el C-level y lo que reportan las áreas operativas.',
    detection: 'IA detecta contradicción entre S1 y S2 en más de 2 dimensiones.',
  },
  {
    id: 'RF-S1-03',
    stage: 1,
    severity: 'warning',
    title: 'Todas las dimensiones en nivel mínimo',
    description: 'La organización muestra nivel 1 en 5 o más dimensiones. Considere acotar el alcance inicial.',
    detection: '5 o más dimensiones con score igual a 1.',
  },
  // Etapa 2: Comité
  {
    id: 'RF-S2-01',
    stage: 2,
    severity: 'block',
    title: 'Sin líder operativo asignado',
    description: 'El comité fue constituido sin un líder operativo. Sin esta persona dedicando 30-50% de su tiempo, los pilotos no avanzan.',
    detection: 'Rol "operational-leader" vacío en la constitución del comité.',
  },
  {
    id: 'RF-S2-02',
    stage: 2,
    severity: 'alert',
    title: 'Decisiones fundacionales incompletas',
    description: 'Menos de 6 de las 8 decisiones fundacionales fueron documentadas.',
    detection: 'Menos de 6 decisiones con respuesta documentada.',
  },
  {
    id: 'RF-S2-03',
    stage: 2,
    severity: 'warning',
    title: 'Comité demasiado grande',
    description: 'El comité tiene más de 7 miembros. Los comités grandes paralizan decisiones.',
    detection: 'Más de 7 miembros registrados en el comité.',
  },
  // Etapa 3: Pilotos
  {
    id: 'RF-S3-01',
    stage: 3,
    severity: 'block',
    title: 'Piloto sin baseline',
    description: 'Un piloto fue activado sin métricas de baseline. Sin baseline no se puede demostrar impacto.',
    detection: 'Piloto en estado "active" sin métricas pre-piloto cargadas.',
  },
  {
    id: 'RF-S3-02',
    stage: 3,
    severity: 'alert',
    title: 'Piloto estancado',
    description: 'Un piloto lleva más de 8 semanas sin datos de impacto ni decisión del comité.',
    detection: 'Timestamp de inicio mayor a 8 semanas sin decisión registrada.',
  },
  {
    id: 'RF-S3-03',
    stage: 3,
    severity: 'alert',
    title: 'Adopción baja en piloto',
    description: 'Menos del 30% del equipo piloto está usando la herramienta después de 4 semanas.',
    detection: 'Métricas de uso reportadas menores al 30% del equipo.',
  },
  {
    id: 'RF-S3-04',
    stage: 3,
    severity: 'warning',
    title: 'Demasiados pilotos simultáneos',
    description: 'Hay más de 5 pilotos activos simultáneamente. Para una organización en etapa temprana esto dispersa recursos.',
    detection: 'Conteo de pilotos en estado "active" mayor a 5.',
  },
  {
    id: 'RF-S3-05',
    stage: 3,
    severity: 'alert',
    title: 'Sponsor ausente del comité',
    description: 'El sponsor ejecutivo no participó en las últimas 2 reuniones del comité. El predictor #1 de fracaso es la ausencia del liderazgo senior.',
    detection: 'Más de 2 reuniones del comité sin el sponsor en la lista de asistentes.',
  },
];
```

- [ ] **Step 6: Verificar compilación**

```bash
npx tsc --noEmit
```

Expected: Sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/constants/
git commit -m "feat: constantes del dominio (dimensiones, preguntas, etapas, decisiones, red flags)"
```

---

### Task 4: Backend — Setup y esquema de base de datos

**Files:**
- Create: `ai-compass/backend/package.json`
- Create: `ai-compass/backend/tsconfig.json`
- Create: `ai-compass/backend/src/index.ts`
- Create: `ai-compass/backend/src/config.ts`
- Create: `ai-compass/backend/src/db.ts`
- Create: `ai-compass/backend/migrations/001_initial_schema.sql`

- [ ] **Step 1: Inicializar backend**

```bash
mkdir -p backend
cd backend
npm init -y
npm install express cors dotenv pg bcryptjs jsonwebtoken multer uuid
npm install -D typescript @types/express @types/cors @types/pg @types/bcryptjs @types/jsonwebtoken @types/multer @types/uuid ts-node nodemon
```

- [ ] **Step 2: Crear tsconfig.json del backend**

`backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Crear config.ts**

`backend/src/config.ts`:
```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3002'),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_compass',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  aiModel: process.env.AI_MODEL || 'gemini-2.5-pro',
  aiApiKey: process.env.AI_API_KEY || '',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
};
```

- [ ] **Step 4: Crear db.ts**

`backend/src/db.ts`:
```typescript
import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export async function query(text: string, params?: unknown[]) {
  const result = await pool.query(text, params);
  return result;
}

export async function getOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
}

export async function getMany<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows;
}
```

- [ ] **Step 5: Crear migración inicial**

`backend/migrations/001_initial_schema.sql`:
```sql
-- ══════════════════════════════════════════════
-- AI COMPASS — ESQUEMA INICIAL
-- ══════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'facilitator', 'council')),
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizaciones
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  size VARCHAR(100) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 5),
  maturity_scores JSONB DEFAULT '{}',
  stage_criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de transiciones de etapa
CREATE TABLE stage_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  from_stage INTEGER NOT NULL,
  to_stage INTEGER NOT NULL,
  facilitator_id UUID NOT NULL REFERENCES users(id),
  justification TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagements
CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  facilitator_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sesiones
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('ejecutiva', 'operativa', 'tecnica', 'constitucion', 'deep-dive', 'presentacion')),
  modality VARCHAR(15) NOT NULL CHECK (modality IN ('presencial', 'remota')),
  title VARCHAR(255) NOT NULL,
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  transcript_file_url VARCHAR(500),
  transcript_text TEXT,
  ai_processed_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'completed', 'validated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participantes de sesión
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  area VARCHAR(255) NOT NULL
);

-- Respuestas a preguntas por sesión
CREATE TABLE session_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(20) NOT NULL,
  dimension VARCHAR(20) NOT NULL,
  question_text TEXT NOT NULL,
  manual_answer TEXT,
  suggested_answer TEXT,
  final_answer TEXT,
  suggested_level INTEGER CHECK (suggested_level BETWEEN 1 AND 4),
  confidence VARCHAR(10) CHECK (confidence IN ('alto', 'medio', 'bajo')),
  citations JSONB DEFAULT '[]',
  validation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'approved', 'edited', 'rejected', 'not-mentioned')),
  edited_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hallazgos emergentes
CREATE TABLE emergent_findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('alignment', 'misalignment', 'champion', 'resistance', 'uncovered-topic')),
  description TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  related_dimensions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comités
CREATE TABLE committees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  meeting_cadence VARCHAR(100) DEFAULT 'Quincenal',
  constituted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Miembros del comité
CREATE TABLE committee_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('sponsor', 'operational-leader', 'business-rep', 'it-rep', 'change-management')),
  area VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id)
);

-- Decisiones fundacionales
CREATE TABLE foundational_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  number INTEGER NOT NULL CHECK (number BETWEEN 1 AND 8),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  response TEXT DEFAULT '',
  decided_at TIMESTAMPTZ,
  UNIQUE(committee_id, number)
);

-- Reuniones del comité
CREATE TABLE committee_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  attendees JSONB DEFAULT '[]',
  decisions JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pilotos
CREATE TABLE pilots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  process_description TEXT NOT NULL,
  process_before TEXT NOT NULL,
  process_after TEXT NOT NULL,
  tool VARCHAR(255) NOT NULL,
  team_size INTEGER NOT NULL,
  champion_name VARCHAR(255) NOT NULL,
  champion_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'designing' CHECK (status IN ('designing', 'active', 'evaluating', 'scale', 'iterate', 'kill')),
  baseline JSONB DEFAULT '[]',
  start_date DATE,
  evaluation_date DATE,
  committee_decision TEXT,
  committee_decision_date TIMESTAMPTZ,
  quick_win_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métricas de pilotos (tracking semanal)
CREATE TABLE pilot_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  values JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Red Flags
CREATE TABLE red_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rule_id VARCHAR(20) NOT NULL,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('warning', 'alert', 'block')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  stage INTEGER NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  override_justification TEXT
);

-- Entregables
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  status VARCHAR(15) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES users(id)
);

-- Análisis cross-sesión
CREATE TABLE cross_session_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  dimension_scores JSONB NOT NULL,
  committee_recommendation JSONB NOT NULL,
  deep_dive_recommendations JSONB DEFAULT '[]',
  quick_win_suggestions JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FK de users.organization_id
ALTER TABLE users ADD CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- Índices
CREATE INDEX idx_engagements_org ON engagements(organization_id);
CREATE INDEX idx_sessions_engagement ON sessions(engagement_id);
CREATE INDEX idx_session_questions_session ON session_questions(session_id);
CREATE INDEX idx_pilots_org ON pilots(organization_id);
CREATE INDEX idx_red_flags_org ON red_flags(organization_id);
CREATE INDEX idx_deliverables_org ON deliverables(organization_id);
```

- [ ] **Step 6: Crear entry point del backend**

`backend/src/index.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import { config } from './config';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-compass-api' });
});

app.listen(config.port, () => {
  console.log(`AI Compass API corriendo en puerto ${config.port}`);
});
```

- [ ] **Step 7: Agregar scripts al package.json del backend**

Agregar en `backend/package.json`:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "psql $DATABASE_URL -f migrations/001_initial_schema.sql"
  }
}
```

- [ ] **Step 8: Crear la base de datos y correr migración**

```bash
createdb ai_compass
cd backend
npm run migrate
```

Expected: Tablas creadas sin errores.

- [ ] **Step 9: Verificar que el backend arranca**

```bash
cd backend
npm run dev
```

En otra terminal:
```bash
curl http://localhost:3002/api/health
```

Expected: `{"status":"ok","service":"ai-compass-api"}`

- [ ] **Step 10: Commit**

```bash
git add backend/
git commit -m "feat: backend setup con Express, PostgreSQL y esquema inicial"
```

---

## Fase 2: Backend API (Auth + CRUD)

### Task 5: Autenticación y middleware

**Files:**
- Create: `backend/src/middleware/auth.ts`
- Create: `backend/src/middleware/roleGuard.ts`
- Create: `backend/src/routes/auth.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear middleware de autenticación JWT**

`backend/src/middleware/auth.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido', code: 'UNAUTHORIZED' });
  }

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado', code: 'INVALID_TOKEN' });
  }
}
```

- [ ] **Step 2: Crear guard de roles**

`backend/src/middleware/roleGuard.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';

export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado', code: 'UNAUTHORIZED' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Sin permisos para esta acción', code: 'FORBIDDEN' });
    }
    next();
  };
}
```

- [ ] **Step 3: Crear rutas de auth**

`backend/src/routes/auth.ts`:
```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { getOne, query } from '../db';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña requeridos', code: 'VALIDATION_ERROR' });
  }

  const user = await getOne<{ id: string; email: string; password_hash: string; name: string; role: string; organization_id: string | null }>(
    'SELECT id, email, password_hash, name, role, organization_id FROM users WHERE email = $1',
    [email]
  );

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Credenciales incorrectas', code: 'INVALID_CREDENTIALS' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, organizationId: user.organization_id },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organization_id },
  });
});

router.post('/register', authMiddleware, roleGuard('admin'), async (req, res) => {
  const { email, password, name, role, organizationId } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'Campos requeridos: email, password, name, role', code: 'VALIDATION_ERROR' });
  }

  const existing = await getOne('SELECT id FROM users WHERE email = $1', [email]);
  if (existing) {
    return res.status(409).json({ message: 'Email ya registrado', code: 'DUPLICATE_EMAIL' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users (email, password_hash, name, role, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, organization_id, created_at',
    [email, passwordHash, name, role, organizationId || null]
  );

  res.status(201).json(result.rows[0]);
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await getOne(
    'SELECT id, email, name, role, organization_id, created_at FROM users WHERE id = $1',
    [req.user!.userId]
  );
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado', code: 'NOT_FOUND' });
  res.json(user);
});

export default router;
```

- [ ] **Step 4: Registrar rutas en index.ts**

`backend/src/index.ts` — agregar después de `app.use(express.json(...))`:
```typescript
import authRoutes from './routes/auth';

app.use('/api/auth', authRoutes);
```

- [ ] **Step 5: Crear usuario admin seed**

```bash
cd backend
npx ts-node -e "
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/ai_compass' });
(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(\"INSERT INTO users (email, password_hash, name, role) VALUES ('admin@inovabiz.com', \$1, 'Admin', 'admin') ON CONFLICT (email) DO NOTHING\", [hash]);
  console.log('Admin seed creado');
  pool.end();
})();
"
```

- [ ] **Step 6: Testear login**

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inovabiz.com","password":"admin123"}'
```

Expected: JSON con `token` y `user`.

- [ ] **Step 7: Commit**

```bash
git add backend/src/middleware/ backend/src/routes/auth.ts backend/src/index.ts
git commit -m "feat: autenticación JWT con login, register y guards de rol"
```

---

### Task 6: CRUD de Organizaciones y Engagements

**Files:**
- Create: `backend/src/routes/organizations.ts`
- Create: `backend/src/routes/engagements.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear rutas de organizaciones**

`backend/src/routes/organizations.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// Listar organizaciones (facilitador ve las suyas, admin ve todas)
router.get('/', async (req, res) => {
  if (req.user!.role === 'admin') {
    const orgs = await getMany('SELECT * FROM organizations ORDER BY created_at DESC');
    return res.json(orgs);
  }
  if (req.user!.role === 'facilitator') {
    const orgs = await getMany(
      `SELECT o.* FROM organizations o
       JOIN engagements e ON e.organization_id = o.id
       WHERE e.facilitator_id = $1
       ORDER BY o.created_at DESC`,
      [req.user!.userId]
    );
    return res.json(orgs);
  }
  if (req.user!.role === 'council') {
    const orgs = await getMany('SELECT * FROM organizations WHERE id = $1', [req.user!.organizationId]);
    return res.json(orgs);
  }
  res.json([]);
});

// Obtener una organización
router.get('/:id', async (req, res) => {
  const org = await getOne('SELECT * FROM organizations WHERE id = $1', [req.params.id]);
  if (!org) return res.status(404).json({ message: 'Organización no encontrada', code: 'NOT_FOUND' });
  res.json(org);
});

// Crear organización (solo facilitador y admin)
router.post('/', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { name, industry, size, contactName, contactEmail } = req.body;
  if (!name || !industry || !size || !contactName || !contactEmail) {
    return res.status(400).json({ message: 'Campos requeridos faltantes', code: 'VALIDATION_ERROR' });
  }

  const result = await query(
    `INSERT INTO organizations (name, industry, size, contact_name, contact_email)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, industry, size, contactName, contactEmail]
  );
  res.status(201).json(result.rows[0]);
});

// Actualizar organización
router.put('/:id', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { name, industry, size, contactName, contactEmail, currentStage, maturityScores, stageCriteria } = req.body;
  const result = await query(
    `UPDATE organizations SET
       name = COALESCE($1, name),
       industry = COALESCE($2, industry),
       size = COALESCE($3, size),
       contact_name = COALESCE($4, contact_name),
       contact_email = COALESCE($5, contact_email),
       current_stage = COALESCE($6, current_stage),
       maturity_scores = COALESCE($7, maturity_scores),
       stage_criteria = COALESCE($8, stage_criteria),
       updated_at = NOW()
     WHERE id = $9 RETURNING *`,
    [name, industry, size, contactName, contactEmail, currentStage, maturityScores ? JSON.stringify(maturityScores) : null, stageCriteria ? JSON.stringify(stageCriteria) : null, req.params.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ message: 'No encontrada', code: 'NOT_FOUND' });
  res.json(result.rows[0]);
});

export default router;
```

- [ ] **Step 2: Crear rutas de engagements**

`backend/src/routes/engagements.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

router.get('/organization/:orgId', async (req, res) => {
  const engagements = await getMany(
    'SELECT * FROM engagements WHERE organization_id = $1 ORDER BY created_at DESC',
    [req.params.orgId]
  );
  res.json(engagements);
});

router.post('/', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { organizationId } = req.body;
  const facilitatorId = req.user!.userId;

  const result = await query(
    'INSERT INTO engagements (organization_id, facilitator_id) VALUES ($1, $2) RETURNING *',
    [organizationId, facilitatorId]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { status, endDate } = req.body;
  const result = await query(
    'UPDATE engagements SET status = COALESCE($1, status), end_date = COALESCE($2, end_date) WHERE id = $3 RETURNING *',
    [status, endDate, req.params.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ message: 'No encontrado', code: 'NOT_FOUND' });
  res.json(result.rows[0]);
});

export default router;
```

- [ ] **Step 3: Registrar rutas en index.ts**

Agregar en `backend/src/index.ts`:
```typescript
import organizationRoutes from './routes/organizations';
import engagementRoutes from './routes/engagements';

app.use('/api/organizations', organizationRoutes);
app.use('/api/engagements', engagementRoutes);
```

- [ ] **Step 4: Testear creación de organización**

```bash
# Obtener token
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@inovabiz.com","password":"admin123"}' | jq -r '.token')

# Crear organización
curl -X POST http://localhost:3002/api/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"ACME Corp","industry":"Tecnología","size":"50-200","contactName":"Juan Pérez","contactEmail":"juan@acme.com"}'
```

Expected: JSON con la organización creada.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/ backend/src/index.ts
git commit -m "feat: CRUD de organizaciones y engagements con permisos por rol"
```

---

### Task 7: CRUD de Sesiones y Transcripciones

**Files:**
- Create: `backend/src/routes/sessions.ts`
- Create: `backend/src/routes/transcripts.ts`
- Create: `backend/src/services/transcriptParser.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear parser de transcripciones**

`backend/src/services/transcriptParser.ts`:
```typescript
export interface ParsedTranscript {
  text: string;
  segments: TranscriptSegment[];
  wordCount: number;
}

export interface TranscriptSegment {
  startTime?: string;
  endTime?: string;
  speaker?: string;
  text: string;
}

export function parseTranscript(content: string, format: 'text' | 'vtt' | 'srt'): ParsedTranscript {
  switch (format) {
    case 'vtt': return parseVTT(content);
    case 'srt': return parseSRT(content);
    default: return parsePlainText(content);
  }
}

function parsePlainText(content: string): ParsedTranscript {
  const text = content.trim();
  return {
    text,
    segments: [{ text }],
    wordCount: text.split(/\s+/).length,
  };
}

function parseVTT(content: string): ParsedTranscript {
  const lines = content.split('\n');
  const segments: TranscriptSegment[] = [];
  let i = 0;

  // Saltar header WEBVTT
  while (i < lines.length && !lines[i].includes('-->')) i++;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      const [startTime, endTime] = line.split('-->').map((s) => s.trim());
      const textLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        const textLine = lines[i].trim();
        textLines.push(textLine.replace(/<[^>]*>/g, '')); // Quitar tags HTML
        i++;
      }
      const text = textLines.join(' ');
      const speakerMatch = text.match(/^([^:]+):\s*(.*)/);
      segments.push({
        startTime,
        endTime,
        speaker: speakerMatch ? speakerMatch[1] : undefined,
        text: speakerMatch ? speakerMatch[2] : text,
      });
    }
    i++;
  }

  const fullText = segments.map((s) => (s.speaker ? `${s.speaker}: ${s.text}` : s.text)).join('\n');
  return { text: fullText, segments, wordCount: fullText.split(/\s+/).length };
}

function parseSRT(content: string): ParsedTranscript {
  const blocks = content.trim().split(/\n\n+/);
  const segments: TranscriptSegment[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;
    // línea 0: número, línea 1: timestamps, línea 2+: texto
    const timeLine = lines[1];
    if (!timeLine.includes('-->')) continue;
    const [startTime, endTime] = timeLine.split('-->').map((s) => s.trim());
    const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, '');
    const speakerMatch = text.match(/^([^:]+):\s*(.*)/);
    segments.push({
      startTime,
      endTime,
      speaker: speakerMatch ? speakerMatch[1] : undefined,
      text: speakerMatch ? speakerMatch[2] : text,
    });
  }

  const fullText = segments.map((s) => (s.speaker ? `${s.speaker}: ${s.text}` : s.text)).join('\n');
  return { text: fullText, segments, wordCount: fullText.split(/\s+/).length };
}

export function detectFormat(filename: string): 'text' | 'vtt' | 'srt' {
  if (filename.endsWith('.vtt')) return 'vtt';
  if (filename.endsWith('.srt')) return 'srt';
  return 'text';
}
```

- [ ] **Step 2: Crear rutas de sesiones**

`backend/src/routes/sessions.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// Listar sesiones de un engagement
router.get('/engagement/:engagementId', async (req, res) => {
  const sessions = await getMany(
    `SELECT s.*, 
       (SELECT json_agg(sp) FROM session_participants sp WHERE sp.session_id = s.id) as participants,
       (SELECT count(*) FROM session_questions sq WHERE sq.session_id = s.id) as question_count,
       (SELECT count(*) FROM session_questions sq WHERE sq.session_id = s.id AND sq.validation_status != 'pending') as validated_count
     FROM sessions s WHERE s.engagement_id = $1 ORDER BY s.created_at`,
    [req.params.engagementId]
  );
  res.json(sessions);
});

// Obtener sesión con preguntas y hallazgos
router.get('/:id', async (req, res) => {
  const session = await getOne('SELECT * FROM sessions WHERE id = $1', [req.params.id]);
  if (!session) return res.status(404).json({ message: 'Sesión no encontrada', code: 'NOT_FOUND' });

  const participants = await getMany('SELECT * FROM session_participants WHERE session_id = $1', [req.params.id]);
  const questions = await getMany('SELECT * FROM session_questions WHERE session_id = $1 ORDER BY question_id', [req.params.id]);
  const findings = await getMany('SELECT * FROM emergent_findings WHERE session_id = $1', [req.params.id]);

  res.json({ ...(session as object), participants, questions, findings });
});

// Crear sesión
router.post('/', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { engagementId, type, modality, title, scheduledDate } = req.body;

  const result = await query(
    `INSERT INTO sessions (engagement_id, type, modality, title, scheduled_date)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [engagementId, type, modality, title, scheduledDate || null]
  );

  // Crear las preguntas de la sesión desde el catálogo
  const { QUESTIONS } = await import('../../src/constants/questions');
  const sessionQuestions = QUESTIONS.filter((q: { sessionType: string }) => q.sessionType === type);

  for (const q of sessionQuestions) {
    await query(
      `INSERT INTO session_questions (session_id, question_id, dimension, question_text)
       VALUES ($1, $2, $3, $4)`,
      [result.rows[0].id, q.id, q.dimension, q.text]
    );
  }

  res.status(201).json(result.rows[0]);
});

// Actualizar sesión (notas, estado, etc.)
router.put('/:id', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { notes, status, completedDate } = req.body;
  const result = await query(
    `UPDATE sessions SET
       notes = COALESCE($1, notes),
       status = COALESCE($2, status),
       completed_date = COALESCE($3, completed_date),
       updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [notes, status, completedDate, req.params.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ message: 'No encontrada', code: 'NOT_FOUND' });
  res.json(result.rows[0]);
});

// Actualizar respuesta a pregunta (validación del facilitador)
router.put('/:sessionId/questions/:questionId', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { manualAnswer, finalAnswer, validationStatus, editedAnswer } = req.body;
  const result = await query(
    `UPDATE session_questions SET
       manual_answer = COALESCE($1, manual_answer),
       final_answer = COALESCE($2, final_answer),
       validation_status = COALESCE($3, validation_status),
       edited_answer = COALESCE($4, edited_answer),
       updated_at = NOW()
     WHERE session_id = $5 AND question_id = $6 RETURNING *`,
    [manualAnswer, finalAnswer, validationStatus, editedAnswer, req.params.sessionId, req.params.questionId]
  );
  if (result.rowCount === 0) return res.status(404).json({ message: 'Pregunta no encontrada', code: 'NOT_FOUND' });
  res.json(result.rows[0]);
});

// Gestión de participantes
router.post('/:id/participants', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { name, role, area } = req.body;
  const result = await query(
    'INSERT INTO session_participants (session_id, name, role, area) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.params.id, name, role, area]
  );
  res.status(201).json(result.rows[0]);
});

router.delete('/:sessionId/participants/:participantId', roleGuard('facilitator', 'admin'), async (req, res) => {
  await query('DELETE FROM session_participants WHERE id = $1 AND session_id = $2', [req.params.participantId, req.params.sessionId]);
  res.status(204).send();
});

export default router;
```

- [ ] **Step 3: Crear rutas de transcripciones**

`backend/src/routes/transcripts.ts`:
```typescript
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query } from '../db';
import { parseTranscript, detectFormat } from '../services/transcriptParser';
import { config } from '../config';

const uploadDir = config.uploadDir;
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

const router = Router();
router.use(authMiddleware);

router.post('/:sessionId', roleGuard('facilitator', 'admin'), upload.single('transcript'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Archivo de transcripción requerido', code: 'NO_FILE' });
  }

  const content = fs.readFileSync(req.file.path, 'utf-8');
  const format = detectFormat(req.file.originalname);
  const parsed = parseTranscript(content, format);

  await query(
    'UPDATE sessions SET transcript_file_url = $1, transcript_text = $2, updated_at = NOW() WHERE id = $3',
    [req.file.path, parsed.text, req.params.sessionId]
  );

  res.json({
    fileUrl: req.file.path,
    parsedText: parsed.text,
    wordCount: parsed.wordCount,
    segmentCount: parsed.segments.length,
  });
});

// Subir transcripción como texto directo (pegar en la UI)
router.post('/:sessionId/text', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Texto requerido', code: 'VALIDATION_ERROR' });

  const parsed = parseTranscript(text, 'text');

  await query(
    'UPDATE sessions SET transcript_text = $1, updated_at = NOW() WHERE id = $2',
    [parsed.text, req.params.sessionId]
  );

  res.json({ parsedText: parsed.text, wordCount: parsed.wordCount });
});

export default router;
```

- [ ] **Step 4: Registrar rutas en index.ts**

Agregar en `backend/src/index.ts`:
```typescript
import sessionRoutes from './routes/sessions';
import transcriptRoutes from './routes/transcripts';

app.use('/api/sessions', sessionRoutes);
app.use('/api/transcripts', transcriptRoutes);
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/
git commit -m "feat: CRUD de sesiones, preguntas, participantes y carga de transcripciones"
```

---

### Task 8: CRUD de Comités, Pilotos y Red Flags

**Files:**
- Create: `backend/src/routes/committees.ts`
- Create: `backend/src/routes/pilots.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear rutas de comités**

`backend/src/routes/committees.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// Obtener comité de una organización
router.get('/organization/:orgId', async (req, res) => {
  const committee = await getOne('SELECT * FROM committees WHERE organization_id = $1', [req.params.orgId]);
  if (!committee) return res.json(null);

  const members = await getMany('SELECT * FROM committee_members WHERE committee_id = $1', [(committee as { id: string }).id]);
  const decisions = await getMany('SELECT * FROM foundational_decisions WHERE committee_id = $1 ORDER BY number', [(committee as { id: string }).id]);
  const meetings = await getMany('SELECT * FROM committee_meetings WHERE committee_id = $1 ORDER BY date DESC', [(committee as { id: string }).id]);

  res.json({ ...(committee as object), members, decisions, meetings });
});

// Crear comité
router.post('/', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { organizationId, meetingCadence } = req.body;
  const result = await query(
    'INSERT INTO committees (organization_id, meeting_cadence) VALUES ($1, $2) RETURNING *',
    [organizationId, meetingCadence || 'Quincenal']
  );

  // Crear las 8 decisiones fundacionales vacías
  const { FOUNDATIONAL_DECISIONS } = await import('../../src/constants/foundationalDecisions');
  for (const d of FOUNDATIONAL_DECISIONS) {
    await query(
      'INSERT INTO foundational_decisions (committee_id, number, title, description) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, d.number, d.title, d.description]
    );
  }

  res.status(201).json(result.rows[0]);
});

// Agregar miembro
router.post('/:committeeId/members', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { name, email, role, area } = req.body;
  const result = await query(
    'INSERT INTO committee_members (committee_id, name, email, role, area) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [req.params.committeeId, name, email, role, area]
  );
  res.status(201).json(result.rows[0]);
});

// Actualizar decisión fundacional
router.put('/:committeeId/decisions/:number', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { response } = req.body;
  const result = await query(
    'UPDATE foundational_decisions SET response = $1, decided_at = NOW() WHERE committee_id = $2 AND number = $3 RETURNING *',
    [response, req.params.committeeId, parseInt(req.params.number)]
  );
  if (result.rowCount === 0) return res.status(404).json({ message: 'Decisión no encontrada', code: 'NOT_FOUND' });
  res.json(result.rows[0]);
});

// Constituir comité (marcar como constituido)
router.post('/:committeeId/constitute', roleGuard('facilitator', 'admin'), async (req, res) => {
  const result = await query(
    'UPDATE committees SET constituted_at = NOW() WHERE id = $1 RETURNING *',
    [req.params.committeeId]
  );
  res.json(result.rows[0]);
});

// Registrar reunión del comité
router.post('/:committeeId/meetings', roleGuard('facilitator', 'admin', 'council'), async (req, res) => {
  const { date, attendees, decisions, notes } = req.body;
  const result = await query(
    'INSERT INTO committee_meetings (committee_id, date, attendees, decisions, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [req.params.committeeId, date, JSON.stringify(attendees || []), JSON.stringify(decisions || []), notes || '']
  );
  res.status(201).json(result.rows[0]);
});

export default router;
```

- [ ] **Step 2: Crear rutas de pilotos**

`backend/src/routes/pilots.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

router.get('/organization/:orgId', async (req, res) => {
  const pilots = await getMany(
    'SELECT * FROM pilots WHERE organization_id = $1 ORDER BY created_at DESC',
    [req.params.orgId]
  );
  // Adjuntar métricas a cada piloto
  for (const pilot of pilots) {
    (pilot as Record<string, unknown>).metrics = await getMany(
      'SELECT * FROM pilot_metrics WHERE pilot_id = $1 ORDER BY date',
      [(pilot as { id: string }).id]
    );
  }
  res.json(pilots);
});

router.get('/:id', async (req, res) => {
  const pilot = await getOne('SELECT * FROM pilots WHERE id = $1', [req.params.id]);
  if (!pilot) return res.status(404).json({ message: 'Piloto no encontrado', code: 'NOT_FOUND' });
  const metrics = await getMany('SELECT * FROM pilot_metrics WHERE pilot_id = $1 ORDER BY date', [req.params.id]);
  res.json({ ...(pilot as object), metrics });
});

router.post('/', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { organizationId, title, processDescription, processBefore, processAfter, tool, teamSize, championName, championEmail, baseline, quickWinIds } = req.body;
  const result = await query(
    `INSERT INTO pilots (organization_id, title, process_description, process_before, process_after, tool, team_size, champion_name, champion_email, baseline, quick_win_ids)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [organizationId, title, processDescription, processBefore, processAfter, tool, teamSize, championName, championEmail, JSON.stringify(baseline || []), JSON.stringify(quickWinIds || [])]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', roleGuard('facilitator', 'admin'), async (req, res) => {
  const { status, startDate, evaluationDate, committeeDecision } = req.body;
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(status); }
  if (startDate !== undefined) { updates.push(`start_date = $${paramIndex++}`); values.push(startDate); }
  if (evaluationDate !== undefined) { updates.push(`evaluation_date = $${paramIndex++}`); values.push(evaluationDate); }
  if (committeeDecision !== undefined) {
    updates.push(`committee_decision = $${paramIndex++}`); values.push(committeeDecision);
    updates.push(`committee_decision_date = NOW()`);
  }
  updates.push('updated_at = NOW()');
  values.push(req.params.id);

  const result = await query(
    `UPDATE pilots SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  if (result.rowCount === 0) return res.status(404).json({ message: 'No encontrado', code: 'NOT_FOUND' });
  res.json(result.rows[0]);
});

// Agregar métrica semanal
router.post('/:id/metrics', roleGuard('facilitator', 'admin', 'council'), async (req, res) => {
  const { date, values, notes } = req.body;
  const result = await query(
    'INSERT INTO pilot_metrics (pilot_id, date, values, notes) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.params.id, date, JSON.stringify(values), notes || null]
  );
  res.status(201).json(result.rows[0]);
});

export default router;
```

- [ ] **Step 3: Registrar rutas en index.ts**

Agregar en `backend/src/index.ts`:
```typescript
import committeeRoutes from './routes/committees';
import pilotRoutes from './routes/pilots';

app.use('/api/committees', committeeRoutes);
app.use('/api/pilots', pilotRoutes);
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/
git commit -m "feat: CRUD de comités (miembros, decisiones, reuniones) y pilotos (métricas, tracking)"
```

---

## Fase 3: Motor de IA

### Task 9: Abstracción de proveedor y servicio de IA

**Files:**
- Create: `backend/src/services/ai/types.ts`
- Create: `backend/src/services/ai/aiService.ts`
- Create: `backend/src/services/ai/providers/index.ts`
- Create: `backend/src/services/ai/providers/geminiProvider.ts`
- Create: `backend/src/services/ai/prompts/sessionAnalysis.ts`
- Create: `backend/src/services/ai/prompts/transcriptExtraction.ts`
- Create: `backend/src/services/ai/prompts/crossSessionAnalysis.ts`
- Create: `backend/src/routes/ai.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear tipos del servicio de IA**

`backend/src/services/ai/types.ts`:
```typescript
export interface AIProvider {
  name: string;
  analyzeSession(input: SessionAnalysisInput): Promise<SessionAnalysisOutput>;
  extractFromTranscript(input: TranscriptExtractionInput): Promise<TranscriptExtractionOutput>;
  crossSessionAnalysis(input: CrossSessionInput): Promise<CrossSessionOutput>;
}

export interface SessionAnalysisInput {
  sessionType: string;
  questions: Array<{
    questionId: string;
    questionText: string;
    dimension: string;
    manualAnswer?: string;
  }>;
  notes: string;
  participants: Array<{ name: string; role: string; area: string }>;
}

export interface TranscriptExtractionInput {
  sessionType: string;
  questions: Array<{
    questionId: string;
    questionText: string;
    dimension: string;
  }>;
  transcriptText: string;
  notes: string;
  participants: Array<{ name: string; role: string; area: string }>;
}

export interface SessionAnalysisOutput {
  questions: Array<{
    questionId: string;
    suggestedAnswer: string;
    suggestedLevel: number;
    confidence: 'alto' | 'medio' | 'bajo';
    citations: Array<{ text: string; speakerName: string; speakerRole: string; timestamp?: string }>;
  }>;
  findings: Array<{
    type: 'alignment' | 'misalignment' | 'champion' | 'resistance' | 'uncovered-topic';
    description: string;
    citations: Array<{ text: string; speakerName: string; speakerRole: string }>;
    relatedDimensions: string[];
  }>;
}

export type TranscriptExtractionOutput = SessionAnalysisOutput;

export interface CrossSessionInput {
  sessions: Array<{
    type: string;
    questions: Array<{
      questionId: string;
      dimension: string;
      finalAnswer: string;
      level: number;
    }>;
    findings: Array<{
      type: string;
      description: string;
    }>;
  }>;
  organizationName: string;
  industry: string;
}

export interface CrossSessionOutput {
  dimensionScores: Record<string, {
    score: number;
    summary: string;
    gaps: string[];
  }>;
  committeeRecommendation: {
    suggestedMembers: Array<{
      role: string;
      suggestedPerson?: string;
      justification: string;
    }>;
  };
  deepDiveRecommendations: Array<{
    trigger: string;
    title: string;
    justification: string;
    suggestedQuestions: string[];
  }>;
  quickWinSuggestions: Array<{
    title: string;
    processBefore: string;
    processAfter: string;
    suggestedTool: string;
    estimatedImpact: string;
    timeline: string;
  }>;
}
```

- [ ] **Step 2: Crear prompts de extracción de transcripciones**

`backend/src/services/ai/prompts/transcriptExtraction.ts`:
```typescript
import type { TranscriptExtractionInput } from '../types';

export function buildTranscriptExtractionPrompt(input: TranscriptExtractionInput): string {
  const questionList = input.questions
    .map((q) => `- [${q.questionId}] (${q.dimension}): ${q.questionText}`)
    .join('\n');

  const participantList = input.participants
    .map((p) => `- ${p.name} (${p.role}, ${p.area})`)
    .join('\n');

  return `Eres un experto en diagnóstico de madurez de IA organizacional.

Se te proporcionan la transcripción de una sesión de diagnóstico y las notas del facilitador. Tu tarea es extraer respuestas para cada pregunta del cuestionario.

## Participantes de la sesión
${participantList}

## Tipo de sesión
${input.sessionType}

## Preguntas del cuestionario
${questionList}

## Notas del facilitador
${input.notes || '(Sin notas)'}

## Transcripción
${input.transcriptText}

## Instrucciones

Para CADA pregunta del cuestionario, debes:

1. **Buscar en la transcripción** fragmentos que respondan directa o indirectamente a la pregunta.
2. **Generar una respuesta sugerida** que sintetice lo encontrado.
3. **Asignar un nivel de madurez** (1=Inexistente, 2=Incipiente, 3=Funcional, 4=Avanzado).
4. **Indicar nivel de confianza** (alto: respuesta clara y directa / medio: inferida de contexto / bajo: muy indirecta o parcial).
5. **Incluir citas textuales** con atribución a quién lo dijo.

Además, identifica HALLAZGOS EMERGENTES:
- **alignment**: Coincidencia de perspectivas entre participantes
- **misalignment**: Contradicción entre lo que dicen distintas personas
- **champion**: Persona que muestra entusiasmo o ya usa IA activamente
- **resistance**: Persona que muestra escepticismo o resistencia
- **uncovered-topic**: Tema relevante que surgió y no está cubierto por las preguntas

Responde EXCLUSIVAMENTE en JSON válido con esta estructura exacta:
{
  "questions": [
    {
      "questionId": "S1-EST-01",
      "suggestedAnswer": "...",
      "suggestedLevel": 2,
      "confidence": "alto",
      "citations": [{"text": "cita textual", "speakerName": "Juan", "speakerRole": "CEO", "timestamp": "12:34"}]
    }
  ],
  "findings": [
    {
      "type": "champion",
      "description": "...",
      "citations": [{"text": "cita", "speakerName": "Ana", "speakerRole": "Dir. Operaciones"}],
      "relatedDimensions": ["cultura"]
    }
  ]
}`;
}
```

- [ ] **Step 3: Crear prompts de análisis de sesión (sin transcripción)**

`backend/src/services/ai/prompts/sessionAnalysis.ts`:
```typescript
import type { SessionAnalysisInput } from '../types';

export function buildSessionAnalysisPrompt(input: SessionAnalysisInput): string {
  const questionList = input.questions
    .map((q) => `- [${q.questionId}] (${q.dimension}): ${q.questionText}\n  Respuesta del facilitador: ${q.manualAnswer || '(Sin respuesta)'}`)
    .join('\n');

  return `Eres un experto en diagnóstico de madurez de IA organizacional.

Se te proporcionan las respuestas del facilitador a las preguntas de una sesión de diagnóstico. Analiza cada respuesta y genera un nivel de madurez sugerido.

## Tipo de sesión
${input.sessionType}

## Notas del facilitador
${input.notes || '(Sin notas)'}

## Preguntas y respuestas
${questionList}

## Instrucciones

Para CADA pregunta con respuesta, debes:
1. **Evaluar el nivel de madurez** (1-4) basándote en la respuesta.
2. **Enriquecer la respuesta** si las notas aportan contexto adicional.
3. **Indicar confianza** basándote en qué tan específica es la respuesta.

Responde EXCLUSIVAMENTE en JSON válido con la misma estructura:
{
  "questions": [
    {
      "questionId": "S1-EST-01",
      "suggestedAnswer": "respuesta enriquecida...",
      "suggestedLevel": 2,
      "confidence": "alto",
      "citations": []
    }
  ],
  "findings": []
}`;
}
```

- [ ] **Step 4: Crear prompt de análisis cross-sesión**

`backend/src/services/ai/prompts/crossSessionAnalysis.ts`:
```typescript
import type { CrossSessionInput } from '../types';

export function buildCrossSessionPrompt(input: CrossSessionInput): string {
  const sessionSummaries = input.sessions.map((s) => {
    const qSummary = s.questions
      .map((q) => `  - [${q.questionId}] ${q.dimension}: Nivel ${q.level}. ${q.finalAnswer}`)
      .join('\n');
    const fSummary = s.findings.map((f) => `  - [${f.type}] ${f.description}`).join('\n');
    return `### Sesión: ${s.type}\nPreguntas:\n${qSummary}\nHallazgos:\n${fSummary || '  (ninguno)'}`;
  }).join('\n\n');

  return `Eres un experto en diagnóstico de madurez de IA organizacional. Analiza los resultados de múltiples sesiones de diagnóstico para generar un diagnóstico consolidado.

## Organización
${input.organizationName} (${input.industry})

## Resultados por sesión
${sessionSummaries}

## Instrucciones

Genera un análisis consolidado con:

1. **Puntuación por dimensión** (estrategia, procesos, datos, tecnologia, cultura, gobernanza): score 1-4, resumen, brechas detectadas.
2. **Recomendación de composición del comité**: qué roles necesita y por qué, sugiriendo personas mencionadas si aplica.
3. **Deep dives recomendados**: basados en dimensiones débiles o brechas entre sesiones.
4. **Quick wins sugeridos**: basados en los dolores identificados, con proceso antes/después.

Responde EXCLUSIVAMENTE en JSON válido:
{
  "dimensionScores": {
    "estrategia": { "score": 2, "summary": "...", "gaps": ["..."] },
    ...
  },
  "committeeRecommendation": {
    "suggestedMembers": [{ "role": "sponsor", "suggestedPerson": "nombre o null", "justification": "..." }]
  },
  "deepDiveRecommendations": [
    { "trigger": "datos-rojo", "title": "...", "justification": "...", "suggestedQuestions": ["..."] }
  ],
  "quickWinSuggestions": [
    { "title": "...", "processBefore": "...", "processAfter": "...", "suggestedTool": "...", "estimatedImpact": "...", "timeline": "..." }
  ]
}`;
}
```

- [ ] **Step 5: Crear provider de Gemini**

`backend/src/services/ai/providers/geminiProvider.ts`:
```typescript
import type { AIProvider, SessionAnalysisInput, SessionAnalysisOutput, TranscriptExtractionInput, TranscriptExtractionOutput, CrossSessionInput, CrossSessionOutput } from '../types';
import { buildSessionAnalysisPrompt } from '../prompts/sessionAnalysis';
import { buildTranscriptExtractionPrompt } from '../prompts/transcriptExtraction';
import { buildCrossSessionPrompt } from '../prompts/crossSessionAnalysis';
import { config } from '../../../config';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = config.aiApiKey;
    this.model = config.aiModel;
  }

  async analyzeSession(input: SessionAnalysisInput): Promise<SessionAnalysisOutput> {
    const prompt = buildSessionAnalysisPrompt(input);
    return this.callGemini(prompt);
  }

  async extractFromTranscript(input: TranscriptExtractionInput): Promise<TranscriptExtractionOutput> {
    const prompt = buildTranscriptExtractionPrompt(input);
    return this.callGemini(prompt);
  }

  async crossSessionAnalysis(input: CrossSessionInput): Promise<CrossSessionOutput> {
    const prompt = buildCrossSessionPrompt(input);
    return this.callGemini(prompt);
  }

  private async callGemini<T>(prompt: string): Promise<T> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ?? '';
    return JSON.parse(text) as T;
  }
}
```

- [ ] **Step 6: Crear registry de providers y fachada**

`backend/src/services/ai/providers/index.ts`:
```typescript
import type { AIProvider } from '../types';
import { GeminiProvider } from './geminiProvider';
import { config } from '../../../config';

const providers: Record<string, () => AIProvider> = {
  gemini: () => new GeminiProvider(),
  // claude: () => new ClaudeProvider(),
  // openai: () => new OpenAIProvider(),
};

export function getProvider(): AIProvider {
  const factory = providers[config.aiProvider];
  if (!factory) {
    throw new Error(`Proveedor de IA no soportado: ${config.aiProvider}. Disponibles: ${Object.keys(providers).join(', ')}`);
  }
  return factory();
}
```

`backend/src/services/ai/aiService.ts`:
```typescript
import { getProvider } from './providers';
import type { SessionAnalysisInput, SessionAnalysisOutput, TranscriptExtractionInput, TranscriptExtractionOutput, CrossSessionInput, CrossSessionOutput } from './types';

const RATE_LIMIT_MS = 1200;
let lastCall = 0;

async function rateLimitedCall<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const elapsed = now - lastCall;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
  }
  lastCall = Date.now();
  return fn();
}

export async function analyzeSession(input: SessionAnalysisInput): Promise<SessionAnalysisOutput> {
  const provider = getProvider();
  return rateLimitedCall(() => provider.analyzeSession(input));
}

export async function extractFromTranscript(input: TranscriptExtractionInput): Promise<TranscriptExtractionOutput> {
  const provider = getProvider();
  return rateLimitedCall(() => provider.extractFromTranscript(input));
}

export async function crossSessionAnalysis(input: CrossSessionInput): Promise<CrossSessionOutput> {
  const provider = getProvider();
  return rateLimitedCall(() => provider.crossSessionAnalysis(input));
}
```

- [ ] **Step 7: Crear rutas de IA**

`backend/src/routes/ai.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { getOne, getMany, query } from '../db';
import * as aiService from '../services/ai/aiService';

const router = Router();
router.use(authMiddleware);
router.use(roleGuard('facilitator', 'admin'));

// Procesar sesión con IA (notas y/o transcripción)
router.post('/process-session/:sessionId', async (req, res) => {
  const session = await getOne<Record<string, unknown>>('SELECT * FROM sessions WHERE id = $1', [req.params.sessionId]);
  if (!session) return res.status(404).json({ message: 'Sesión no encontrada', code: 'NOT_FOUND' });

  const questions = await getMany<Record<string, unknown>>('SELECT * FROM session_questions WHERE session_id = $1', [req.params.sessionId]);
  const participants = await getMany<Record<string, unknown>>('SELECT * FROM session_participants WHERE session_id = $1', [req.params.sessionId]);

  const hasTranscript = !!session.transcript_text;
  const hasNotes = !!session.notes;

  let result;
  if (hasTranscript) {
    result = await aiService.extractFromTranscript({
      sessionType: session.type as string,
      questions: questions.map((q) => ({
        questionId: q.question_id as string,
        questionText: q.question_text as string,
        dimension: q.dimension as string,
      })),
      transcriptText: session.transcript_text as string,
      notes: (session.notes as string) || '',
      participants: participants.map((p) => ({
        name: p.name as string,
        role: p.role as string,
        area: p.area as string,
      })),
    });
  } else if (hasNotes) {
    result = await aiService.analyzeSession({
      sessionType: session.type as string,
      questions: questions.map((q) => ({
        questionId: q.question_id as string,
        questionText: q.question_text as string,
        dimension: q.dimension as string,
        manualAnswer: q.manual_answer as string | undefined,
      })),
      notes: session.notes as string,
      participants: participants.map((p) => ({
        name: p.name as string,
        role: p.role as string,
        area: p.area as string,
      })),
    });
  } else {
    return res.status(400).json({ message: 'La sesión necesita notas o transcripción para procesar', code: 'NO_INPUT' });
  }

  // Guardar resultados: actualizar preguntas con sugerencias (solo las pendientes)
  for (const q of result.questions) {
    await query(
      `UPDATE session_questions SET
         suggested_answer = $1, suggested_level = $2, confidence = $3, citations = $4,
         validation_status = CASE WHEN validation_status = 'pending' THEN 'pending' ELSE validation_status END,
         updated_at = NOW()
       WHERE session_id = $5 AND question_id = $6 AND validation_status = 'pending'`,
      [q.suggestedAnswer, q.suggestedLevel, q.confidence, JSON.stringify(q.citations), req.params.sessionId, q.questionId]
    );
  }

  // Guardar hallazgos emergentes (reemplazar los anteriores)
  await query('DELETE FROM emergent_findings WHERE session_id = $1', [req.params.sessionId]);
  for (const f of result.findings) {
    await query(
      'INSERT INTO emergent_findings (session_id, type, description, citations, related_dimensions) VALUES ($1, $2, $3, $4, $5)',
      [req.params.sessionId, f.type, f.description, JSON.stringify(f.citations), JSON.stringify(f.relatedDimensions)]
    );
  }

  // Marcar sesión como procesada
  await query('UPDATE sessions SET ai_processed_at = NOW(), updated_at = NOW() WHERE id = $1', [req.params.sessionId]);

  res.json(result);
});

// Análisis cross-sesión
router.post('/cross-analysis', async (req, res) => {
  const { organizationId, sessionIds } = req.body;

  const org = await getOne<Record<string, unknown>>('SELECT * FROM organizations WHERE id = $1', [organizationId]);
  if (!org) return res.status(404).json({ message: 'Organización no encontrada', code: 'NOT_FOUND' });

  const sessions = [];
  for (const sid of sessionIds) {
    const session = await getOne<Record<string, unknown>>('SELECT * FROM sessions WHERE id = $1', [sid]);
    const questions = await getMany<Record<string, unknown>>('SELECT * FROM session_questions WHERE session_id = $1', [sid]);
    const findings = await getMany<Record<string, unknown>>('SELECT * FROM emergent_findings WHERE session_id = $1', [sid]);

    sessions.push({
      type: session!.type as string,
      questions: questions
        .filter((q) => q.validation_status !== 'pending' && q.validation_status !== 'not-mentioned')
        .map((q) => ({
          questionId: q.question_id as string,
          dimension: q.dimension as string,
          finalAnswer: (q.final_answer || q.edited_answer || q.suggested_answer || q.manual_answer || '') as string,
          level: (q.suggested_level || 1) as number,
        })),
      findings: findings.map((f) => ({
        type: f.type as string,
        description: f.description as string,
      })),
    });
  }

  const result = await aiService.crossSessionAnalysis({
    sessions,
    organizationName: org.name as string,
    industry: org.industry as string,
  });

  // Guardar análisis
  await query(
    `INSERT INTO cross_session_analyses (organization_id, dimension_scores, committee_recommendation, deep_dive_recommendations, quick_win_suggestions)
     VALUES ($1, $2, $3, $4, $5)`,
    [organizationId, JSON.stringify(result.dimensionScores), JSON.stringify(result.committeeRecommendation), JSON.stringify(result.deepDiveRecommendations), JSON.stringify(result.quickWinSuggestions)]
  );

  // Actualizar maturity scores de la organización
  const scores: Record<string, number> = {};
  for (const [dim, analysis] of Object.entries(result.dimensionScores)) {
    scores[dim] = analysis.score;
  }
  await query('UPDATE organizations SET maturity_scores = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(scores), organizationId]);

  res.json(result);
});

export default router;
```

- [ ] **Step 8: Registrar rutas de IA e instalar dependencia de Gemini**

```bash
cd backend
npm install @google/genai
```

Agregar en `backend/src/index.ts`:
```typescript
import aiRoutes from './routes/ai';

app.use('/api/ai', aiRoutes);
```

- [ ] **Step 9: Commit**

```bash
git add backend/src/services/ai/ backend/src/routes/ai.ts backend/src/index.ts
git commit -m "feat: motor de IA con abstracción de proveedor, prompts de extracción y análisis cross-sesión"
```

---

## Fase 4: Frontend Shell

### Task 10: Routing, Auth Store, Layout y Dashboard

**Files:**
- Create: `src/services/apiClient.ts`
- Create: `src/stores/authStore.ts`
- Create: `src/stores/organizationStore.ts`
- Create: `src/components/Layout.tsx`
- Create: `src/components/ProtectedRoute.tsx`
- Create: `src/pages/LoginPage.tsx`
- Create: `src/pages/DashboardPage.tsx`
- Modify: `src/App.tsx`

Estas tasks del frontend siguen el mismo patrón: crear store, crear página, conectar ruta. El código completo de cada componente está en la estructura de archivos definida arriba. La implementación sigue estos principios:

- [ ] **Step 1: Crear apiClient.ts** — HTTP client con interceptor JWT, base URL desde env, métodos `get`, `post`, `put`, `delete`.

- [ ] **Step 2: Crear authStore.ts** — Zustand store con `login()`, `logout()`, `loadUser()`, persistencia del token en localStorage.

- [ ] **Step 3: Crear organizationStore.ts** — Zustand store con `fetchOrganizations()`, `createOrganization()`, `currentOrg`.

- [ ] **Step 4: Crear ProtectedRoute.tsx** — Wrapper que redirige a `/login` si no hay token, y verifica roles permitidos.

- [ ] **Step 5: Crear Layout.tsx** — Sidebar con navegación por etapa, header con nombre de organización y usuario, área de contenido.

- [ ] **Step 6: Crear LoginPage.tsx** — Formulario de login, redirige al dashboard al autenticarse.

- [ ] **Step 7: Crear DashboardPage.tsx** — Lista de organizaciones con cards. Botón de crear nueva organización (solo facilitador/admin). Click lleva al MaturityMapPage.

- [ ] **Step 8: Actualizar App.tsx con rutas**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
```

- [ ] **Step 9: Verificar flujo login → dashboard**

```bash
npx vite
```

Abrir localhost:3001. Debería redirigir a /login. Autenticarse con admin@inovabiz.com. Debería llegar al dashboard.

- [ ] **Step 10: Commit**

```bash
git add src/
git commit -m "feat: frontend shell con auth, routing protegido, layout y dashboard"
```

---

## Fase 5: Módulo de Sesiones

### Task 11: Páginas de sesiones y validación

**Files:**
- Create: `src/stores/sessionStore.ts`
- Create: `src/pages/MaturityMapPage.tsx`
- Create: `src/pages/SessionListPage.tsx`
- Create: `src/pages/SessionViewPage.tsx`
- Create: `src/pages/TranscriptReviewPage.tsx`
- Create: `src/components/QuestionCard.tsx`
- Create: `src/components/TranscriptUploader.tsx`
- Create: `src/components/ValidationPanel.tsx`
- Create: `src/components/ConfidenceBadge.tsx`
- Create: `src/components/StageMap.tsx`
- Create: `src/components/StageProgress.tsx`
- Create: `src/components/ParticipantManager.tsx`
- Create: `src/components/FindingsPanel.tsx`
- Modify: `src/App.tsx` — agregar rutas

Este es el módulo más grande. La implementación cubre:

- [ ] **Step 1: Crear sessionStore.ts** — `fetchSessions()`, `createSession()`, `updateSession()`, `updateQuestion()`, `processWithAI()`.

- [ ] **Step 2: Crear StageMap.tsx** — Visualización horizontal de las 5 etapas. Etapa actual resaltada, futuras atenuadas. Click en etapa activa navega a sus contenidos.

- [ ] **Step 3: Crear StageProgress.tsx** — Barra de progreso con checklist de criterios de avance para la etapa actual.

- [ ] **Step 4: Crear MaturityMapPage.tsx** — Pantalla principal por organización. Muestra StageMap + StageProgress + lista de acciones disponibles para la etapa actual (crear sesión, ver sesiones, etc.).

- [ ] **Step 5: Crear ParticipantManager.tsx** — CRUD de participantes inline (nombre, rol, área). Usado dentro de SessionViewPage.

- [ ] **Step 6: Crear QuestionCard.tsx** — Card que muestra: texto de la pregunta, campo de respuesta manual, respuesta sugerida por IA (si existe), ConfidenceBadge, citas de respaldo, botones de validación (aprobar/editar/rechazar/no mencionado).

- [ ] **Step 7: Crear TranscriptUploader.tsx** — Drag & drop de archivos (.vtt, .srt, .txt) + textarea para pegar texto. Muestra preview del texto parseado y conteo de palabras.

- [ ] **Step 8: Crear ConfidenceBadge.tsx** — Badge visual: alto (verde), medio (amarillo), bajo (rojo).

- [ ] **Step 9: Crear FindingsPanel.tsx** — Lista de hallazgos emergentes con iconos por tipo, citas expandibles, dimensiones relacionadas.

- [ ] **Step 10: Crear ValidationPanel.tsx** — Componente wrapper que organiza QuestionCards con filtros (todas, pendientes, aprobadas, sin cobertura) + resumen de progreso de validación.

- [ ] **Step 11: Crear SessionViewPage.tsx** — Vista principal de una sesión. Dos modos:
  - **Modo sesión**: preguntas guía con campos de respuesta + notas + botón de procesar con IA
  - **Modo revisión**: ValidationPanel con resultados de IA + FindingsPanel

- [ ] **Step 12: Crear TranscriptReviewPage.tsx** — Página dedicada post-procesamiento de IA. TranscriptUploader + botón "Procesar" + ValidationPanel. Esta es la experiencia central del producto.

- [ ] **Step 13: Crear SessionListPage.tsx** — Lista de sesiones del engagement con estado, tipo, fecha, y progreso de validación.

- [ ] **Step 14: Agregar rutas a App.tsx**

```typescript
<Route path="/org/:orgId" element={<MaturityMapPage />} />
<Route path="/org/:orgId/sessions" element={<SessionListPage />} />
<Route path="/org/:orgId/sessions/:sessionId" element={<SessionViewPage />} />
<Route path="/org/:orgId/sessions/:sessionId/review" element={<TranscriptReviewPage />} />
```

- [ ] **Step 15: Commit**

```bash
git add src/
git commit -m "feat: módulo de sesiones con preguntas, transcripciones, procesamiento IA y validación"
```

---

## Fase 6: Módulo de Comité

### Task 12: Diseño y constitución del comité

**Files:**
- Create: `src/stores/committeeStore.ts`
- Create: `src/pages/CommitteeDesignPage.tsx`
- Create: `src/pages/CommitteeConstitutionPage.tsx`
- Create: `src/components/DecisionCard.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear committeeStore.ts** — `fetchCommittee()`, `createCommittee()`, `addMember()`, `updateDecision()`, `constitute()`.

- [ ] **Step 2: Crear DecisionCard.tsx** — Card para cada decisión fundacional: número, título, descripción, guía (del catálogo), campo de respuesta, estado (pendiente/decidida).

- [ ] **Step 3: Crear CommitteeDesignPage.tsx** — Muestra recomendación de composición generada por el análisis cross-sesión. Para cada rol muestra: persona sugerida, justificación, campo para confirmar/cambiar. Botón para crear el comité con los miembros confirmados.

- [ ] **Step 4: Crear CommitteeConstitutionPage.tsx** — Las 8 DecisionCards. Progreso (X/8 decididas). Botón "Constituir Comité" habilitado cuando hay ≥6 decisiones y líder operativo asignado. Al constituir, se crean las cuentas de los miembros del AI Council.

- [ ] **Step 5: Agregar rutas**

```typescript
<Route path="/org/:orgId/committee/design" element={<CommitteeDesignPage />} />
<Route path="/org/:orgId/committee/constitution" element={<CommitteeConstitutionPage />} />
```

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: módulo de comité con diseño, decisiones fundacionales y constitución"
```

---

## Fase 7: Diagnóstico y Reportes

### Task 13: Spider chart, diagnóstico y generación de reportes

**Files:**
- Create: `src/components/SpiderChart.tsx`
- Create: `src/pages/DiagnosticReportPage.tsx`
- Create: `src/pages/ReportBuilderPage.tsx`
- Create: `src/hooks/useMaturityScore.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear useMaturityScore.ts** — Hook que calcula scores de madurez por dimensión a partir de las respuestas validadas de todas las sesiones.

- [ ] **Step 2: Crear SpiderChart.tsx** — Recharts RadarChart con las 6 dimensiones. Props: `scores` (actual) y `benchmark` (comparación). Colores consistentes por dimensión.

```typescript
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import type { DimensionKey } from '@/types';
import { DIMENSIONS } from '@/constants/dimensions';

interface Props {
  scores: Partial<Record<DimensionKey, number | null>>;
  benchmark?: Partial<Record<DimensionKey, number>>;
}

export default function SpiderChart({ scores, benchmark }: Props) {
  const data = DIMENSIONS.map((dim) => ({
    dimension: dim.name,
    score: scores[dim.key] ?? 0,
    benchmark: benchmark?.[dim.key] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fill: '#64748b', fontSize: 10 }} />
        <Radar name="Organización" dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
        {benchmark && (
          <Radar name="Benchmark" dataKey="benchmark" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeDasharray="5 5" />
        )}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 3: Crear DiagnosticReportPage.tsx** — Spider chart + análisis por dimensión (score, resumen, brechas, evidencia). Quick wins sugeridos. Recomendaciones de deep dive. Botón "Generar Reporte PDF".

- [ ] **Step 4: Crear ReportBuilderPage.tsx** — Editor de entregables. Muestra el borrador generado por IA, permite editar cada sección, cambiar estado (borrador → revisión → publicado).

- [ ] **Step 5: Agregar rutas**

```typescript
<Route path="/org/:orgId/diagnostic" element={<DiagnosticReportPage />} />
<Route path="/org/:orgId/reports/:reportId" element={<ReportBuilderPage />} />
```

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: spider chart de madurez, diagnóstico consolidado y generador de reportes"
```

---

## Fase 8: Tracking de Pilotos (Etapa 3)

### Task 14: Dashboard de pilotos y métricas

**Files:**
- Create: `src/stores/pilotStore.ts`
- Create: `src/pages/PilotListPage.tsx`
- Create: `src/pages/PilotDetailPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear pilotStore.ts** — `fetchPilots()`, `createPilot()`, `updatePilot()`, `addMetric()`.

- [ ] **Step 2: Crear PilotListPage.tsx** — Dashboard con cards por piloto: título, equipo, Champion, estado (badge de color), métricas clave vs. baseline, semanas activo. Botón crear nuevo piloto. Filtros por estado.

- [ ] **Step 3: Crear PilotDetailPage.tsx** — Detalle del piloto: proceso antes/después, baseline, gráfico de métricas en el tiempo (Recharts LineChart), formulario para agregar métrica semanal, historial de métricas, botones de decisión del comité (escalar/iterar/matar).

- [ ] **Step 4: Agregar rutas**

```typescript
<Route path="/org/:orgId/pilots" element={<PilotListPage />} />
<Route path="/org/:orgId/pilots/:pilotId" element={<PilotDetailPage />} />
```

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: dashboard de pilotos con tracking de métricas y decisiones del comité"
```

---

## Fase 9: Sistema de Red Flags

### Task 15: Detección automática y alertas

**Files:**
- Create: `src/hooks/useRedFlags.ts`
- Create: `src/components/RedFlagAlert.tsx`
- Create: `src/components/RedFlagBanner.tsx`
- Create: `backend/src/services/redFlagEvaluator.ts`

- [ ] **Step 1: Crear redFlagEvaluator.ts en el backend** — Función que recibe el estado de una organización (sesiones, comité, pilotos) y evalúa todas las reglas de `RED_FLAG_RULES`. Retorna red flags activos. Se ejecuta al completar acciones clave (completar sesión, constituir comité, activar piloto, registrar reunión).

- [ ] **Step 2: Crear useRedFlags.ts** — Hook que consulta red flags activos de la organización actual. Polling cada 30 segundos o re-fetch tras acciones.

- [ ] **Step 3: Crear RedFlagAlert.tsx** — Componente individual de alerta con severidad visual (warning=amarillo, alert=naranja, block=rojo), título, descripción, botón de resolver/override.

- [ ] **Step 4: Crear RedFlagBanner.tsx** — Banner fijo en el top del Layout que muestra red flags activos agrupados por severidad. Los de tipo "block" son prominentes e indican qué acción está bloqueada.

- [ ] **Step 5: Integrar en Layout.tsx** — Agregar RedFlagBanner dentro del Layout, visible para facilitador y AI Council.

- [ ] **Step 6: Commit**

```bash
git add src/ backend/src/
git commit -m "feat: sistema de red flags con detección automática y alertas por severidad"
```

---

## Fase 10: Integración y Polish

### Task 16: Integración end-to-end y validación

- [ ] **Step 1: Crear script de seed completo** — Seed con: usuario admin, usuario facilitador, organización de prueba, engagement, sesiones con preguntas pre-pobladas.

- [ ] **Step 2: Testear flujo completo end-to-end:**
  1. Login como facilitador
  2. Crear organización
  3. Crear engagement
  4. Crear sesión ejecutiva → responder preguntas → procesar con IA
  5. Crear sesión operativa → subir transcripción → procesar → validar
  6. Crear sesión técnica → completar
  7. Ejecutar análisis cross-sesión
  8. Ver diagnóstico con spider chart
  9. Diseñar comité basado en recomendación
  10. Constituir comité con 8 decisiones
  11. Crear piloto con baseline
  12. Agregar métricas semanales
  13. Verificar red flags en cada paso

- [ ] **Step 3: Verificar permisos** — Login como council member, verificar que solo ve su organización, no puede editar sesiones, sí puede ver diagnóstico y pilotos.

- [ ] **Step 4: Run lint y typecheck**

```bash
npx tsc --noEmit
npm run lint
cd backend && npx tsc --noEmit
```

- [ ] **Step 5: Commit final**

```bash
git add .
git commit -m "feat: AI Compass MVP completo — diagnóstico, comité, pilotos (Etapas 1-3)"
```

---

## Resumen de Fases

| Fase | Tasks | Qué produce |
|------|-------|-------------|
| 1. Fundación | 1-3 | Proyecto scaffolded, tipos completos, constantes del dominio |
| 2. Backend API | 4-8 | API completa con auth, CRUD de todas las entidades |
| 3. Motor de IA | 9 | Abstracción multi-modelo, prompts, procesamiento de transcripciones |
| 4. Frontend Shell | 10 | Login, dashboard, routing protegido, layout |
| 5. Sesiones | 11 | Flujo completo de sesiones con validación de IA |
| 6. Comité | 12 | Diseño y constitución del AI Council |
| 7. Diagnóstico | 13 | Spider chart, reportes, entregables |
| 8. Pilotos | 14 | Dashboard de pilotos con métricas (Etapa 3) |
| 9. Red Flags | 15 | Alertas automáticas por etapa |
| 10. Integración | 16 | Validación end-to-end y polish |

**Fases paralelizables:** 4+5+6+7+8 pueden desarrollarse en paralelo una vez que las Fases 1-3 (backend + IA) estén completas.
