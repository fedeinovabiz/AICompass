# AI Compass — Plan Maestro de Implementación v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir AI Compass MVP (Etapas 1-3): diagnóstico de madurez en IA organizacional con sesiones estructuradas, procesamiento de transcripciones con IA, constitución de comité, y tracking de pilotos.

**Architecture:** Producto nuevo independiente. Frontend React 19 + Backend Express + PostgreSQL. Motor de IA con abstracción de proveedor (solo Gemini para MVP). Zustand para estado, React Router para navegación, Tailwind CSS para estilos.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Zustand, Recharts, Node.js, Express, PostgreSQL, JWT, Multer, Google Gemini.

**Spec de referencia:** `superpowers/specs/2026-04-10-ai-compass-design-v2.md`
**Product Discovery:** `docs/product/01-framing.md` a `docs/product/04-journeys.md`
**Decisiones del usuario:** `docs/plans/ai-compass-CONTEXT.md`

---

## Priorización MoSCoW

| Prioridad | Features | Impacto |
|-----------|----------|---------|
| **Must-Have** | F-001 a F-006: Sesiones + IA + Validación + Diagnóstico + Spider Chart + Auth | Sin esto el producto no existe |
| **Should-Have** | F-007 a F-010: Comité + Pilotos + Red Flags + Recomendación comité | Mejora significativa, facilitador puede sobrevivir sin esto inicialmente |
| **Could-Have** | F-011 a F-013: PDF/PPTX + ReportBuilder + Dashboard Council | Nice-to-have para MVP |

**Orden de implementación:** Must-Have primero (Olas 1-4), Should-Have en paralelo (Ola 4), Could-Have post-MVP.

---

## Arquitectura de Módulos (14 módulos, 5 olas)

### Clasificación de módulos

| ID | Nombre | Tipo | Complejidad | Features |
|----|--------|------|-------------|----------|
| M01 | Fundación Frontend | INDEPENDIENTE | M | Infraestructura |
| M02 | Fundación Backend | INDEPENDIENTE | M | Infraestructura |
| M03 | Tipos y Constantes Frontend | DEPENDIENTE de M01 | S | Infraestructura |
| M04 | Schema DB + Constantes Backend | DEPENDIENTE de M02 | S | Infraestructura |
| M05 | Auth Backend | DEPENDIENTE de M04 | S | F-006 |
| M06 | CRUD Backend completo | DEPENDIENTE de M04 | L | F-001, F-007, F-008 |
| M07 | Motor IA Backend | DEPENDIENTE de M04 | L | F-002, F-004 |
| M08 | Shell Frontend | DEPENDIENTE de M03 | M | F-006 |
| M09 | Módulo Sesiones Frontend | DEPENDIENTE de M08 | L | F-001, F-002, F-003 |
| M10 | Módulo Comité Frontend | DEPENDIENTE de M08 | M | F-007, F-010 |
| M11 | Diagnóstico y Reportes Frontend | DEPENDIENTE de M08 | M | F-004, F-005 |
| M12 | Módulo Pilotos Frontend | DEPENDIENTE de M08 | M | F-008 |
| M13 | Sistema Red Flags Frontend | DEPENDIENTE de M09+M10+M12 | S | F-009 |
| M14 | Integración y Routing Final | DEPENDIENTE de todos | S | Integración |

### Grafo de dependencias y olas

```
OLA 1:  [M01-FE Scaffolding]  [M02-BE Scaffolding]       <- 2 agentes
                |                       |
OLA 2:  [M03-FE Tipos+Const]  [M04-BE Schema+Const]      <- 2 agentes
                |                       |
OLA 3:  [M08-Shell FE] [M05-Auth BE] [M06-CRUD BE] [M07-IA BE]  <- 4 agentes (max)
                |
OLA 4:  [M09-Sesiones] [M10-Comité] [M11-Diagnóstico] [M12-Pilotos]  <- 4 agentes
                    \       |             |         /
OLA 5:         [M13-RedFlags] -> [M14-Integración]        <- secuencial
```

### Contratos de frontera entre módulos

Estos son los artefactos que un módulo necesita de otro para arrancar:

- **M03 -> M08**: `src/types/index.ts` completo con todas las interfaces
- **M04 -> M05, M06, M07**: Tablas creadas en PostgreSQL + `db.ts` con funciones `query/getOne/getMany`
- **M08 -> M09, M10, M11, M12**: `apiClient.ts` con `get/post/put/delete`, `authStore.ts` con `{ user, token, logout }`, `Layout.tsx` con sidebar + header + Outlet
- **M09 -> M13**: `sessionStore.ts` con `{ sessions, activeSession }`
- **M10 -> M13**: `committeeStore.ts` con `{ committee }`
- **M12 -> M13**: `pilotStore.ts` con `{ pilots }`

### Archivos de sincronización (no modificar sin coordinación)

- `src/types/index.ts` — contratos de dominio
- `src/types/api.ts` — contratos de API
- `src/services/apiClient.ts` — punto único de HTTP
- `src/App.tsx` — árbol de rutas
- `backend/src/index.ts` — registro de rutas
- `backend/migrations/001_initial_schema.sql` — esquema de DB

---

## Estructura de archivos del proyecto

```
ai-compass/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .eslintrc.cjs
├── .prettierrc
├── .env.local
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   ├── index.ts                    # Todas las interfaces del dominio
│   │   └── api.ts                      # Tipos de request/response API
│   ├── constants/
│   │   ├── dimensions.ts               # 6 dimensiones con niveles de madurez
│   │   ├── questions.ts                # Preguntas por sesión y dimensión (20 preguntas)
│   │   ├── stages.ts                   # 5 etapas con criterios de avance + governanceExpectations
│   │   ├── foundationalDecisions.ts    # 8 decisiones del comité
│   │   ├── redFlags.ts                 # Reglas de alertas automatizadas
│   │   ├── failurePatterns.ts          # 7 patrones de fracaso documentados (frameworks)
│   │   └── deepDiveGuides.ts           # Guía de contenido para 5 tipos de deep dive
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── organizationStore.ts
│   │   ├── sessionStore.ts
│   │   ├── committeeStore.ts
│   │   └── pilotStore.ts
│   ├── services/
│   │   └── apiClient.ts                # HTTP client con JWT + camelCase transform
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
│   │   ├── RedFlagAlert.tsx            # Componente de alerta individual
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
│       ├── MaturityMapPage.tsx         # Spider chart + mapa de etapas
│       ├── SessionListPage.tsx         # Lista de sesiones del engagement
│       ├── SessionViewPage.tsx         # Conducir/revisar sesión individual
│       ├── TranscriptReviewPage.tsx    # Panel de validación post-IA
│       ├── CommitteeDesignPage.tsx     # Recomendación de composición
│       ├── CommitteeConstitutionPage.tsx # 8 decisiones fundacionales
│       ├── DiagnosticReportPage.tsx    # Spider chart + diagnóstico completo
│       ├── PilotListPage.tsx           # Dashboard de pilotos
│       └── PilotDetailPage.tsx         # Detalle y métricas de un piloto
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── src/
│   │   ├── index.ts                    # Entry point Express
│   │   ├── config.ts                   # Variables de entorno
│   │   ├── db.ts                       # Conexión PostgreSQL
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # JWT middleware
│   │   │   ├── roleGuard.ts            # Guard por rol
│   │   │   └── errorHandler.ts         # Error handling global
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── organizations.ts
│   │   │   ├── engagements.ts
│   │   │   ├── sessions.ts
│   │   │   ├── transcripts.ts
│   │   │   ├── committees.ts
│   │   │   ├── pilots.ts
│   │   │   └── ai.ts
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── types.ts
│   │   │   │   ├── aiService.ts
│   │   │   │   ├── providers/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── geminiProvider.ts
│   │   │   │   └── prompts/
│   │   │   │       ├── sessionAnalysis.ts
│   │   │   │       ├── transcriptExtraction.ts
│   │   │   │       └── crossSessionAnalysis.ts
│   │   │   ├── transcriptParser.ts
│   │   │   └── redFlagEvaluator.ts
│   │   └── constants/
│   │       ├── dimensions.ts
│   │       ├── questions.ts
│   │       ├── stages.ts
│   │       ├── foundationalDecisions.ts
│   │       └── redFlags.ts
│   └── migrations/
│       └── 001_initial_schema.sql
```

---

## OLA 1: Fundación (2 agentes en paralelo)

### M01 — Fundación Frontend

**Archivos:** `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `.eslintrc.cjs`, `.prettierrc`, `index.html`, `.env.local`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `.gitignore`

- [ ] **Step 1: Crear directorio del proyecto e inicializar**

```bash
mkdir -p ai-compass && cd ai-compass
npm init -y
```

- [ ] **Step 2: Instalar dependencias**

```bash
npm install react@19 react-dom@19 react-router-dom zustand recharts
npm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react tailwindcss @tailwindcss/vite postcss autoprefixer eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks prettier
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
    "paths": { "@/*": ["src/*"] }
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
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3001,
    proxy: { '/api': 'http://localhost:3002' },
  },
});
```

- [ ] **Step 5: Crear .eslintrc.cjs**

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'error',
  },
};
```

- [ ] **Step 6: Crear .prettierrc**

```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

- [ ] **Step 7: Crear index.html**

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Compass</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Crear src/main.tsx, src/App.tsx, src/index.css, .env.local**

`src/index.css`:
```css
@import "tailwindcss";

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
}
```

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

`.env.local`:
```
VITE_API_URL=http://localhost:3002/api
```

- [ ] **Step 9: Agregar scripts a package.json**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "format": "prettier --write src",
    "validate": "tsc --noEmit && eslint src --ext .ts,.tsx --max-warnings 0",
    "validate:fix": "tsc --noEmit && eslint src --ext .ts,.tsx --fix"
  }
}
```

- [ ] **Step 10: Crear .gitignore**

```
node_modules
dist
.env.local
*.local
```

- [ ] **Step 11: Verificar que arranca**

```bash
npx vite --open
```

Expected: Browser abre en localhost:3001 mostrando "AI Compass".

- [ ] **Step 12: Commit**

```bash
git init
git add .
git commit -m "feat: scaffolding inicial del proyecto AI Compass con ESLint strict + Prettier"
```

---

### M02 — Fundación Backend

**Archivos:** `backend/package.json`, `backend/tsconfig.json`, `backend/src/index.ts`, `backend/src/config.ts`, `backend/src/db.ts`, `backend/src/middleware/errorHandler.ts`

- [ ] **Step 1: Inicializar backend**

```bash
mkdir -p backend && cd backend
npm init -y
npm install express cors dotenv pg bcryptjs jsonwebtoken multer uuid
npm install -D typescript @types/express @types/cors @types/pg @types/bcryptjs @types/jsonwebtoken @types/multer @types/uuid ts-node nodemon
```

- [ ] **Step 2: Crear tsconfig.json del backend**

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
  nodeEnv: process.env.NODE_ENV || 'development',
};
```

- [ ] **Step 4: Crear db.ts**

```typescript
import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
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

- [ ] **Step 5: Crear errorHandler.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function errorHandler(err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) {
  // Errores de dominio con statusCode propio
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message, code: err.code || 'DOMAIN_ERROR' });
  }

  // JSON inválido
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON inválido', code: 'INVALID_JSON' });
  }

  // Errores de PostgreSQL
  const pgError = err as Error & { code?: string; constraint?: string };
  if (pgError.code === '23505') {
    return res.status(409).json({ message: 'El registro ya existe', code: 'DUPLICATE' });
  }
  if (pgError.code === '23503') {
    return res.status(404).json({ message: 'Recurso relacionado no encontrado', code: 'FK_NOT_FOUND' });
  }

  // Error genérico
  const response: Record<string, unknown> = { message: 'Error interno del servidor', code: 'INTERNAL_ERROR' };
  if (config.nodeEnv !== 'production') {
    response.stack = err.stack;
    response.originalMessage = err.message;
  }
  return res.status(500).json(response);
}
```

- [ ] **Step 6: Crear entry point del backend**

```typescript
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-compass-api' });
});

// Las rutas se registran aquí (M05, M06, M07 las agregan)

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`AI Compass API corriendo en puerto ${config.port}`);
});
```

- [ ] **Step 7: Agregar scripts al package.json**

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

- [ ] **Step 8: Verificar que arranca**

```bash
cd backend && npm run dev
# En otra terminal:
curl http://localhost:3002/api/health
```

Expected: `{"status":"ok","service":"ai-compass-api"}`

- [ ] **Step 9: Commit**

```bash
git add backend/
git commit -m "feat: backend setup con Express, error handler global y conexión PostgreSQL"
```

---

## OLA 2: Tipos + Schema + Constantes (2 agentes en paralelo)

### M03 — Tipos y Constantes Frontend

**Archivos:** `src/types/index.ts`, `src/types/api.ts`, `src/constants/dimensions.ts`, `src/constants/questions.ts`, `src/constants/stages.ts`, `src/constants/foundationalDecisions.ts`, `src/constants/redFlags.ts`

- [ ] **Step 1: Crear tipos del dominio** (`src/types/index.ts`)

Incluir todas las interfaces definidas en la spec v2. Los tipos incluyen los campos nuevos:
- `ValueChainSegment` type: `'market-to-lead' | 'lead-to-sale' | 'sale-to-delivery' | 'delivery-to-success' | 'success-to-market'`
- `ImplementationLevel` type: `'prompting' | 'no-code' | 'custom'`
- En `QuickWinSuggestion`: agregar `valueChainSegment`, `implementationLevel`, `diminishingReturns`
- En `Pilot`: agregar `roleImpacts: RoleImpact[]` con `{ roleName, timeFreedPercent, newResponsibilities, proposedIncentive }`
- En `Pilot`: agregar `workflowDesign: WorkflowDesign` con `{ workflowBefore, workflowAfter, humanValidationPoints: string[], eliminatedSteps: string[], newSteps: string[] }`
- En `Pilot`: agregar `champions: ChampionAssignment[]` con `{ name, area, responsibilities: string[], weeklyHours, communicationChannel }`
- En `PilotMetricEntry`: agregar `adoptionMetrics?: { activePercentage, usageFrequency: 'daily'|'weekly'|'sporadic', habitualUsers, noviceUsers, nps?: number }`
- Nuevo type `FailurePattern` con `{ id, name, description, source, prevention }`
- En `StageDefinition`: agregar `governanceExpectations: string[]`

**IMPORTANTE:** Copiar los tipos completos del plan original (líneas 316-712) y agregar TODOS los campos nuevos listados arriba.

- [ ] **Step 2: Crear tipos de API** (`src/types/api.ts`)

Copiar del plan original (líneas 654-712).

- [ ] **Step 3: Crear constantes del dominio**

Copiar las constantes del plan original (líneas 740-1280) para los 5 archivos de constantes.

Agregar nueva constante `src/constants/failurePatterns.ts` con los 7 patrones de fracaso:
1. Muerte por mil pilotos (McKinsey Rewired)
2. IA como capa, no como integración (McKinsey State of AI)
3. El estancamiento del 20% (Microsoft Copilot Playbook)
4. Sponsor fantasma (McKinsey + Microsoft)
5. Gobernanza asfixiante / Shadow AI (Microsoft Copilot Playbook)
6. Métricas vanidosas (Microsoft + McKinsey)
7. Transformación sin cultura (Collective Academy + McKinsey Rewired)

Agregar `governanceExpectations` a cada etapa en `stages.ts`:
- Etapa 1: ["Definir qué datos NO usar con IA externa", "Comunicar posición oficial sobre uso de IA", "Identificar quién decide sobre IA"]
- Etapa 2: ["Comité constituido con sponsor y líder operativo", "8 decisiones fundacionales documentadas", "Política de uso aceptable escrita"]
- Etapa 3: ["Baseline obligatorio antes de activar piloto", "Tracking semanal de métricas de impacto Y adopción", "Champions asignados", "Red flags monitoreados"]

Agregar constante `src/constants/deepDiveGuides.ts` con la guía de contenido para los 5 tipos de deep dive (Cultura, Procesos, Datos, Brecha ejecutivo-operativo, Tecnología fragmentada). Contenido detallado en la spec v2 sección "Guía de contenido por Deep Dive".

En `questions.ts`, agregar las 2 preguntas nuevas:

```typescript
// Agregar al final de las preguntas de S2 (Operativa)
{
  id: 'S2-PRO-04',
  sessionType: 'operativa',
  dimension: 'procesos',
  text: '¿De los procesos que mencionaron, cuáles se hacen 100% en computadora y cuáles requieren presencia física?',
  probeQuestions: [
    '¿El trabajo remoto es viable para esta tarea?',
    '¿Qué porcentaje del equipo trabaja remoto vs presencial?',
  ],
},
{
  id: 'S2-PRO-05',
  sessionType: 'operativa',
  dimension: 'procesos',
  text: '¿Si tuvieran que clasificar sus tareas en tres niveles — las que se resuelven con una conversación con ChatGPT, las que necesitan una automatización tipo workflow, y las que necesitan desarrollo técnico custom — dónde cae cada una?',
  probeQuestions: [
    '¿Alguien del equipo ya usa herramientas no-code como Make o Zapier?',
    '¿Tienen desarrolladores internos o dependen de proveedores?',
  ],
},
```

- [ ] **Step 4: Verificar compilación**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/types/ src/constants/
git commit -m "feat: tipos del dominio y constantes (dimensiones, preguntas, etapas, decisiones, red flags)"
```

---

### M04 — Schema DB + Constantes Backend

**Archivos:** `backend/migrations/001_initial_schema.sql`, `backend/src/constants/*.ts`

- [ ] **Step 1: Crear base de datos PostgreSQL**

```bash
createdb ai_compass
```

- [ ] **Step 2: Crear migración SQL**

Copiar esquema del plan original (líneas 1391-1630) y agregar:

```sql
-- Campos nuevos en tabla pilots (gaps de frameworks):
ALTER TABLE pilots ADD COLUMN role_impacts JSONB DEFAULT '[]';
ALTER TABLE pilots ADD COLUMN workflow_design JSONB DEFAULT '{}';
ALTER TABLE pilots ADD COLUMN champion_assignments JSONB DEFAULT '[]';

-- Campos de adopción en pilot_metrics:
ALTER TABLE pilot_metrics ADD COLUMN adoption_metrics JSONB DEFAULT '{}';
-- adoption_metrics contiene: { activePercentage, usageFrequency, habitualUsers, noviceUsers, nps }

-- cross_session_analyses: los quick_win_suggestions ya son JSONB, los nuevos campos van dentro del JSON
```

- [ ] **Step 3: Ejecutar migración**

```bash
cd backend
psql postgresql://postgres:postgres@localhost:5432/ai_compass -f migrations/001_initial_schema.sql
```

- [ ] **Step 4: Crear constantes duplicadas en backend**

Copiar `dimensions.ts`, `questions.ts`, `stages.ts`, `foundationalDecisions.ts`, `redFlags.ts` del frontend a `backend/src/constants/`. Incluir las 2 preguntas nuevas (S2-PRO-04 y S2-PRO-05).

**IMPORTANTE:** Las constantes del backend NO usan path aliases (@/). Usar imports relativos.

- [ ] **Step 5: Crear usuario admin seed**

```bash
cd backend
npx ts-node -e "
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/ai_compass' });
(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(\"INSERT INTO users (email, password_hash, name, role) VALUES ('admin@inovabiz.com', \\\$1, 'Admin InovaBiz', 'admin') ON CONFLICT (email) DO NOTHING\", [hash]);
  const hash2 = await bcrypt.hash('facilitador123', 10);
  await pool.query(\"INSERT INTO users (email, password_hash, name, role) VALUES ('federico@inovabiz.com', \\\$2, 'Federico Marsiglia', 'facilitator') ON CONFLICT (email) DO NOTHING\", [hash2]);
  console.log('Seeds creados');
  pool.end();
})();
"
```

- [ ] **Step 6: Verificar compilación backend**

```bash
cd backend && npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat: esquema de base de datos, constantes backend y seeds iniciales"
```

---

## OLA 3: Backend API + Frontend Shell (4 agentes en paralelo)

### M05 — Auth Backend

**Archivos:** `backend/src/middleware/auth.ts`, `backend/src/middleware/roleGuard.ts`, `backend/src/routes/auth.ts`

Implementar exactamente como el plan original (líneas 1712-1841). Incluye:
- JWT middleware con `AuthPayload` (userId, email, role, organizationId)
- Role guard genérico `roleGuard(...allowedRoles)`
- Rutas: `POST /api/auth/login`, `POST /api/auth/register` (solo admin), `GET /api/auth/me`
- Registrar en `backend/src/index.ts`

Verificar con: `curl -X POST http://localhost:3002/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@inovabiz.com","password":"admin123"}'`

---

### M06 — CRUD Backend completo

**Archivos:** `backend/src/routes/organizations.ts`, `backend/src/routes/engagements.ts`, `backend/src/routes/sessions.ts`, `backend/src/routes/transcripts.ts`, `backend/src/routes/committees.ts`, `backend/src/routes/pilots.ts`, `backend/src/services/transcriptParser.ts`

Implementar todo el CRUD del plan original (líneas 1888-2560). Cambios respecto al original:

1. **Sesiones (sessions.ts):** NO importar constantes del frontend. Usar `backend/src/constants/questions.ts`.
2. **Transcripciones (transcripts.ts):** Implementar parser VTT/SRT/texto como en el plan original.
3. **Pilotos (pilots.ts):** Agregar campo `role_impacts` (JSONB) en los endpoints de crear/actualizar piloto.
4. **Comités (committees.ts):** Implementar como en el plan original.

Registrar TODAS las rutas en `backend/src/index.ts` de una sola vez.

---

### M07 — Motor IA Backend

**Archivos:** `backend/src/services/ai/types.ts`, `backend/src/services/ai/aiService.ts`, `backend/src/services/ai/providers/index.ts`, `backend/src/services/ai/providers/geminiProvider.ts`, `backend/src/services/ai/prompts/sessionAnalysis.ts`, `backend/src/services/ai/prompts/transcriptExtraction.ts`, `backend/src/services/ai/prompts/crossSessionAnalysis.ts`, `backend/src/routes/ai.ts`

Implementar como en el plan original (líneas 2560-3120) con estos cambios:

1. **crossSessionAnalysis.ts:** El prompt debe instruir a la IA a clasificar quick wins con:
   - `valueChainSegment`: segmento de la cadena de valor (market-to-lead, lead-to-sale, etc.)
   - `implementationLevel`: nivel de dificultad (prompting, no-code, custom)
   - `diminishingReturns`: descripción de a qué escala deja de generar valor

2. **Instalar dependencia de Gemini:**

```bash
cd backend && npm install @google/genai
```

3. **Solo implementar `geminiProvider.ts`.** Los otros providers (Claude, OpenAI) quedan como comentarios en el registry indicando que están preparados para futuro.

---

### M08 — Shell Frontend (Auth + Layout + Dashboard)

**Archivos:** `src/services/apiClient.ts`, `src/stores/authStore.ts`, `src/stores/organizationStore.ts`, `src/components/Layout.tsx`, `src/components/ProtectedRoute.tsx`, `src/pages/LoginPage.tsx`, `src/pages/DashboardPage.tsx`, `src/App.tsx`

- [ ] **Step 1: Crear apiClient.ts**

HTTP client con:
- Base URL desde `VITE_API_URL`
- Interceptor JWT: agrega `Authorization: Bearer {token}` a cada request
- Interceptor camelCase: transforma `snake_case` de PostgreSQL a `camelCase` en cada response
- Métodos: `get<T>`, `post<T>`, `put<T>`, `del<T>`
- En error 401: limpiar token y redirigir a `/login`

- [ ] **Step 2: Crear authStore.ts**

Zustand store con:
- State: `user: User | null`, `token: string | null`, `isLoading: boolean`, `error: string | null`
- Actions: `login(email, password)`, `logout()`, `loadUser()` (llama GET /api/auth/me)
- Persistencia: token en localStorage
- `isAuthenticated` como getter derivado

- [ ] **Step 3: Crear organizationStore.ts**

Zustand store con:
- State: `organizations: Organization[]`, `currentOrganization: Organization | null`, `isLoading: boolean`
- Actions: `fetchOrganizations()`, `fetchOrganization(id)`, `createOrganization(data)`, `updateOrganization(id, data)`

- [ ] **Step 4: Crear ProtectedRoute.tsx**

```typescript
// Wrapper que:
// - Si no hay token: redirige a /login
// - Si hay token pero rol no permitido: redirige a /dashboard con mensaje
// - Props: allowedRoles?: UserRole[] (si no se pasa, permite todos)
// - Renderiza <Outlet /> si pasa validación
```

- [ ] **Step 5: Crear Layout.tsx**

Shell principal con:
- Sidebar izquierdo (240px): logo "AI Compass", navegación por secciones (Dashboard, Organización activa con sub-items según etapa)
- Header: nombre del usuario, botón logout, nombre de la organización activa (si hay)
- Contenido: `<Outlet />` de React Router
- Estilo: fondo `bg-slate-900`, sidebar `bg-slate-800`, texto `text-slate-100`
- Responsive: sidebar colapsable en mobile

- [ ] **Step 6: Crear LoginPage.tsx**

Spec detallada:
- **Estado local:** `email: string`, `password: string`
- **Store:** `authStore.login()`, `authStore.isLoading`, `authStore.error`
- **Comportamiento:**
  - Submit: llama `login()`, en éxito `navigate('/dashboard')`, en error muestra mensaje
  - Botón deshabilitado mientras `isLoading`
  - Enter en cualquier campo dispara submit
  - Validación client-side: email con formato, contraseña mínimo 6 chars
- **Estados UI:**
  - Default: formulario vacío
  - Loading: botón con spinner, campos deshabilitados
  - Error: mensaje rojo bajo el campo de contraseña
- **Ruta:** `/login` (pública, sin ProtectedRoute)

- [ ] **Step 7: Crear DashboardPage.tsx**

Spec detallada:
- **Store:** `organizationStore.organizations`, `organizationStore.isLoading`, `authStore.user.role`
- **Comportamiento:**
  - Al montar: `fetchOrganizations()`
  - Cards de organizaciones: nombre, industria, etapa actual (badge), score promedio de madurez
  - Click en card: `navigate('/org/:id')`
  - Botón "Nueva Organización" (solo `facilitator`/`admin`): abre modal con formulario (nombre, industria, tamaño, contacto nombre, contacto email)
- **Estados UI:**
  - Loading: skeleton de cards
  - Empty: "No hay organizaciones aún. Crea la primera para empezar."
  - Error: mensaje con botón retry
- **Ruta:** `/dashboard` (protegida, todos los roles)

- [ ] **Step 8: Actualizar App.tsx con rutas iniciales**

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
          {/* Stubs para rutas futuras — M09-M12 reemplazan el element */}
          <Route path="/org/:orgId" element={<div className="p-8 text-white">Organización (pendiente)</div>} />
          <Route path="/org/:orgId/sessions" element={<div className="p-8 text-white">Sesiones (pendiente)</div>} />
          <Route path="/org/:orgId/sessions/:sessionId" element={<div className="p-8 text-white">Sesión (pendiente)</div>} />
          <Route path="/org/:orgId/sessions/:sessionId/review" element={<div className="p-8 text-white">Revisión (pendiente)</div>} />
          <Route path="/org/:orgId/maturity" element={<div className="p-8 text-white">Mapa de madurez (pendiente)</div>} />
          <Route path="/org/:orgId/diagnostic" element={<div className="p-8 text-white">Diagnóstico (pendiente)</div>} />
          <Route path="/org/:orgId/committee/design" element={<div className="p-8 text-white">Diseño comité (pendiente)</div>} />
          <Route path="/org/:orgId/committee/constitution" element={<div className="p-8 text-white">Constitución (pendiente)</div>} />
          <Route path="/org/:orgId/pilots" element={<div className="p-8 text-white">Pilotos (pendiente)</div>} />
          <Route path="/org/:orgId/pilots/:pilotId" element={<div className="p-8 text-white">Piloto detalle (pendiente)</div>} />
        </Route>
      </Route>
    </Routes>
  );
}
```

- [ ] **Step 9: Verificar flujo login -> dashboard**

Abrir localhost:3001. Debe redirigir a /login. Autenticarse. Debe llegar al dashboard.

- [ ] **Step 10: Commit**

```bash
git add src/
git commit -m "feat: frontend shell con auth, routing protegido, layout y dashboard"
```

---

## OLA 4: Módulos de dominio del Frontend (4 agentes en paralelo)

### M09 — Módulo Sesiones Frontend (MUST-HAVE: F-001, F-002, F-003)

**Archivos:** `src/stores/sessionStore.ts`, `src/hooks/useTranscriptProcessing.ts`, `src/components/QuestionCard.tsx`, `src/components/ValidationPanel.tsx`, `src/components/TranscriptUploader.tsx`, `src/components/ParticipantManager.tsx`, `src/components/ConfidenceBadge.tsx`, `src/components/FindingsPanel.tsx`, `src/components/StageMap.tsx`, `src/components/StageProgress.tsx`, `src/pages/MaturityMapPage.tsx`, `src/pages/SessionListPage.tsx`, `src/pages/SessionViewPage.tsx`, `src/pages/TranscriptReviewPage.tsx`, `src/pages/OrganizationPage.tsx`

Este es el módulo más grande. Implementar en 3 sub-fases internas:

#### Sub-fase 1: Store + Hooks

- [ ] **Step 1: Crear sessionStore.ts**

```
State: sessions, currentSession (incluye questions, participants, findings), isLoading, isProcessingAI
Actions: fetchSessions(engagementId), fetchSession(id), createSession(data), updateSession(id, data),
         updateQuestionAnswer(sessionId, questionId, { manualAnswer, finalAnswer, validationStatus, editedAnswer }),
         addParticipant(sessionId, participant), removeParticipant(sessionId, participantId),
         processWithAI(sessionId), uploadTranscript(sessionId, file), uploadTranscriptText(sessionId, text)
```

- [ ] **Step 2: Crear hooks**

`useTranscriptProcessing`: encapsula la lógica de subir transcripción + procesar con IA + polling de estado
`useStageProgress`: calcula criterios de avance cumplidos para la etapa actual de la organización

#### Sub-fase 2: Componentes atómicos

- [ ] **Step 3: Crear ConfidenceBadge.tsx**

Props: `level: 'alto' | 'medio' | 'bajo'`. Badge visual: alto=verde, medio=amarillo, bajo=rojo.

- [ ] **Step 4: Crear ParticipantManager.tsx**

Props: `participants: Participant[]`, `onAdd(p)`, `onRemove(id)`, `readOnly: boolean`
Lista con formulario inline. Campos: nombre, rol, área. Botón agregar/eliminar.

- [ ] **Step 5: Crear QuestionCard.tsx**

Props: `question: SessionQuestion`, `onValidate(status, editedAnswer?)`, `readOnly: boolean`
- Muestra: texto de la pregunta, dimensión (badge)
- Modo basic (sin IA): textarea para `manualAnswer`
- Modo IA (hay `suggestedAnswer`): muestra respuesta sugerida + `ConfidenceBadge` + nivel sugerido + citas expandibles
- 4 botones: Aprobar, Editar (abre textarea), Rechazar, No mencionado
- Estado visual según `validationStatus`: pending=gris, approved=verde, edited=azul, rejected=rojo, not-mentioned=naranja

- [ ] **Step 6: Crear ValidationPanel.tsx**

Props: `questions: SessionQuestion[]`, `onValidate(questionId, status, editedAnswer?)`
- Filtros: todas, pendientes, aprobadas, sin cobertura
- Barra de progreso: "X de Y validadas"
- Lista de QuestionCards filtradas
- Botón "Completar validación" habilitado cuando no quedan pendientes

- [ ] **Step 7: Crear TranscriptUploader.tsx**

Props: `onFileUpload(file)`, `onTextSubmit(text)`, `currentTranscript?: string`
- Zona drag & drop para .vtt, .srt, .txt (max 50MB)
- Tab alternativa: textarea para pegar texto
- Preview del texto parseado con conteo de palabras
- Si ya hay transcripción: muestra nombre del archivo + botón "Reemplazar"

- [ ] **Step 8: Crear FindingsPanel.tsx**

Props: `findings: EmergentFinding[]`
- Lista de hallazgos con icono por tipo (alignment=check, misalignment=warning, champion=star, resistance=shield, uncovered-topic=question)
- Cada hallazgo: descripción, citas expandibles, dimensiones relacionadas (badges)

- [ ] **Step 9: Crear StageMap.tsx**

Props: `currentStage: Stage`, `onStageClick?(stage: Stage)`
- Visualización horizontal de las 5 etapas
- Etapa actual resaltada (borde brillante), anteriores completadas (check), futuras atenuadas
- Nombre y duración de cada etapa

- [ ] **Step 10: Crear StageProgress.tsx**

Props: `stage: Stage`, `criteria: Record<string, boolean>`
- Checklist de criterios de avance de la etapa actual
- Barra de progreso (X de Y cumplidos)
- Criterios cumplidos con check verde, pendientes con círculo gris

#### Sub-fase 3: Páginas

- [ ] **Step 11: Crear OrganizationPage.tsx**

Lee `:orgId` de useParams. Muestra:
- Header: nombre, industria, tamaño
- StageMap con etapa actual
- StageProgress con criterios
- Lista resumida de sesiones
- Acciones según etapa: "Crear sesión", "Ver diagnóstico", "Diseñar comité", etc.

- [ ] **Step 12: Crear MaturityMapPage.tsx**

Lee `:orgId` de useParams. Muestra:
- StageMap centrado
- Si hay scores: SpiderChart + cards por dimensión
- Si no hay scores: mensaje "Complete las 3 sesiones de discovery para generar el diagnóstico"
- Botón "Generar análisis cross-sesión" (requiere S1+S2+S3 validated)

- [ ] **Step 13: Crear SessionListPage.tsx**

Lee `:orgId` de useParams. Muestra:
- Lista cronológica de sesiones
- Cada item: tipo (badge), título, modalidad, estado (badge color: draft=gris, in-progress=azul, completed=verde, validated=esmeralda)
- Botón "Nueva sesión" con selector de tipo
- Click en sesión: navega a SessionViewPage

- [ ] **Step 14: Crear SessionViewPage.tsx**

Lee `:sessionId` de useParams. Dos modos:
- **Modo sesión** (status draft/in-progress): ParticipantManager + notas (textarea auto-save) + lista de QuestionCards en modo basic
- **Modo revisión** (status completed/validated): ValidationPanel + FindingsPanel
- Botón "Subir transcripción" -> navega a TranscriptReviewPage
- Botón "Marcar como completada" (requiere >= 1 participante)
- Para `council`: todo en modo lectura

- [ ] **Step 15: Crear TranscriptReviewPage.tsx**

Lee `:sessionId` de useParams. Experiencia central del producto:
- TranscriptUploader
- Botón "Procesar con IA" (habilitado con transcripción): spinner ~30s
- Después de procesar: ValidationPanel con resultados
- Barra de progreso de validación
- Botón "Completar validación" -> cambia sesión a "validated"

- [ ] **Step 16: Actualizar App.tsx** — Reemplazar stubs de sesiones con componentes reales

- [ ] **Step 17: Commit**

```bash
git add src/
git commit -m "feat: módulo de sesiones completo con preguntas, transcripciones, IA y validación"
```

---

### M10 — Módulo Comité Frontend (SHOULD-HAVE: F-007, F-010)

**Archivos:** `src/stores/committeeStore.ts`, `src/components/DecisionCard.tsx`, `src/pages/CommitteeDesignPage.tsx`, `src/pages/CommitteeConstitutionPage.tsx`

- [ ] **Step 1: Crear committeeStore.ts**

```
State: committee (incluye members, decisions, meetings), isLoading
Actions: fetchCommittee(orgId), createCommittee(orgId, meetingCadence),
         addMember(member), removeMember(id), updateMember(id, data),
         updateDecision(decisionNumber, response),
         constituteCommittee(orgId)
```

- [ ] **Step 2: Crear DecisionCard.tsx**

Props: `decision: FoundationalDecision`, `template: DecisionTemplate`, `onUpdate(response)`, `readOnly: boolean`
- Muestra: número, título, descripción, guía del catálogo (colapsable)
- Campo de texto para la respuesta
- Estado: pendiente (sin respuesta) / decidida (con respuesta y fecha)
- Badge: número circular (1-8)

- [ ] **Step 3: Crear CommitteeDesignPage.tsx**

Lee `:orgId` de useParams. Muestra:
- Recomendación de composición de la IA (si existe cross-analysis)
- Para cada rol: persona sugerida + justificación + campo editable de nombre/email
- Roles obligatorios (sponsor, operational-leader) con asterisco
- Alerta si > 7 miembros
- Botón "Continuar a Constitución" (habilitado con 2 roles obligatorios)

- [ ] **Step 4: Crear CommitteeConstitutionPage.tsx**

Lee `:orgId` de useParams. Muestra:
- Header: lista de miembros confirmados (solo lectura)
- 8 DecisionCards con las plantillas del catálogo
- Progreso: "X de 8 decisiones"
- Red flag inline si falta operational-leader
- Botón "Constituir Comité" (habilitado >= 6 decisiones). Al constituir: crea cuentas council
- Campo "Cadencia de reuniones" (dropdown)

- [ ] **Step 5: Actualizar App.tsx** — Reemplazar stubs de comité

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: módulo de comité con diseño, decisiones fundacionales y constitución"
```

---

### M11 — Diagnóstico y Reportes Frontend (MUST-HAVE: F-004, F-005)

**Archivos:** `src/components/SpiderChart.tsx`, `src/hooks/useMaturityScore.ts`, `src/pages/DiagnosticReportPage.tsx`

- [ ] **Step 1: Crear useMaturityScore.ts**

Hook que calcula scores promedio por dimensión a partir de las respuestas validadas de todas las sesiones de la organización.

- [ ] **Step 2: Crear SpiderChart.tsx**

```typescript
// Props: scores: Partial<Record<DimensionKey, number | null>>, benchmark?: Partial<Record<DimensionKey, number>>
// Recharts RadarChart con PolarGrid, 6 dimensiones
// Dos Radar lines: "Organización" (verde, fill opacity 0.3) y "Benchmark" (azul, dashed, opacity 0.1)
// Domain: [0, 4]
// ResponsiveContainer height={400}
```

Implementar exactamente como en el plan original (líneas 3311-3344).

- [ ] **Step 3: Crear DiagnosticReportPage.tsx**

Lee `:orgId` de useParams. Muestra:
- SpiderChart grande con benchmark superpuesto (si disponible)
- 6 paneles de dimensión expandibles: score, resumen, gaps, evidencia (citas)
- Sección "Quick Wins sugeridos": cards con proceso antes/después, herramienta, nivel de implementación (badge: prompting=verde, no-code=amarillo, custom=rojo), segmento de cadena de valor, retornos decrecientes
- Sección "Deep Dives recomendados": trigger, título, justificación, preguntas sugeridas
- Botón "Generar análisis cross-sesión" (para facilitador, requiere S1+S2+S3 validated)
- Botón "Publicar para el Comité" (cambia estado a published)
- Para `council`: solo visible si publicado

- [ ] **Step 4: Actualizar App.tsx** — Reemplazar stubs de diagnóstico

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: spider chart de madurez, diagnóstico consolidado con quick wins y deep dives"
```

---

### M12 — Módulo Pilotos Frontend (SHOULD-HAVE: F-008)

**Archivos:** `src/stores/pilotStore.ts`, `src/pages/PilotListPage.tsx`, `src/pages/PilotDetailPage.tsx`

- [ ] **Step 1: Crear pilotStore.ts**

```
State: pilots, currentPilot, isLoading
Actions: fetchPilots(orgId), fetchPilot(id), createPilot(data), updatePilot(id, data),
         updateStatus(id, status), addMetricEntry(id, entry), setBaseline(id, metrics),
         addRoleImpact(id, impact), setCommitteeDecision(id, decision, justification)
```

- [ ] **Step 2: Crear PilotListPage.tsx**

Lee `:orgId` de useParams. Muestra:
- Cards por piloto: título, herramienta, champion, estado (badge color: designing=gris, active=azul, evaluating=amarillo, scale=verde, iterate=naranja, kill=rojo), semanas desde inicio
- Alerta si > 5 pilotos activos
- Click en piloto: navega a PilotDetailPage
- Botón "Nuevo Piloto" (facilitador): formulario con título, proceso antes/después, herramienta, tamaño equipo, champion nombre/email

- [ ] **Step 3: Crear PilotDetailPage.tsx**

Lee `:pilotId` de useParams. Muestra:
- Header: título, herramienta, estado (badge editable para facilitador)
- **Sección "Workflow Design" (GAP CRÍTICO 1):** Dos columnas: workflow antes (pasos actuales) y workflow después (pasos con IA). Cada paso es editable. Campos adicionales: puntos de validación humana (checkboxes), pasos eliminados (tachados visualmente), pasos nuevos (resaltados en verde). Esta sección debe completarse ANTES de activar el piloto.
- Sección "Baseline": tabla editable de métricas (nombre, unidad, valor). Red flag si piloto activo sin baseline.
- **Sección "Red de Champions" (GAP CRÍTICO 2):** Lista de champions asignados al piloto con: nombre, área, responsabilidades (multi-select: peer training, soporte primer nivel, feedback loop, documentación de prompts), horas semanales dedicadas, canal de comunicación. Botón "Agregar champion". Ratio ideal mostrado: "X champions para Y usuarios (ideal: 1:50)".
- Sección "Tracking de métricas": Recharts LineChart por métrica, evolución vs baseline. Botón "+ Entrada semanal" con formulario que incluye:
  - Métricas de impacto (las del baseline)
  - **Métricas de adopción (GAP CRÍTICO 3):** % del equipo usando la herramienta esta semana, frecuencia predominante (diario/semanal/esporádico), conteo de usuarios habituales vs novatos, NPS del equipo (opcional, cada 2 semanas)
- **Sección "Impacto en roles":** Tabla con: rol afectado, % tiempo liberado, nuevas responsabilidades, incentivo propuesto. Botón "Agregar rol impactado". Alerta si timeFreedPercent > 30% sin incentivo definido.
- Sección "Decisión del comité": dropdown (escalar/iterar/matar) + justificación + fecha. Visible en estado "evaluating".

- [ ] **Step 4: Actualizar App.tsx** — Reemplazar stubs de pilotos

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: dashboard de pilotos con tracking de métricas, impacto en roles y decisiones"
```

---

## OLA 5: Red Flags + Integración (secuencial)

### M13 — Sistema Red Flags

**Archivos:** `backend/src/services/redFlagEvaluator.ts`, `src/hooks/useRedFlags.ts`, `src/components/RedFlagAlert.tsx`, `src/components/RedFlagBanner.tsx`

- [ ] **Step 1: Crear redFlagEvaluator.ts en backend**

Función que recibe el estado de una organización y evalúa todas las reglas de `RED_FLAG_RULES`. Se ejecuta después de acciones clave (completar sesión, constituir comité, activar piloto, registrar reunión). Inserta/resuelve red flags en la tabla `red_flags`.

- [ ] **Step 2: Agregar endpoint** `GET /api/organizations/:orgId/red-flags` y llamar al evaluator después de cada mutación relevante.

- [ ] **Step 3: Crear useRedFlags.ts**

Hook que consulta red flags activos de la organización. Re-fetch tras acciones.

- [ ] **Step 4: Crear RedFlagAlert.tsx**

Props: `redFlag: RedFlag`, `onResolve?(id, resolution)`, `onOverride?(id, justification)`
- Severidad visual: warning=amarillo, alert=naranja, block=rojo
- Título, descripción, botón resolver/override (solo facilitador)

- [ ] **Step 5: Crear RedFlagBanner.tsx**

Props: `redFlags: RedFlag[]`
- Banner fijo en top del Layout
- Agrupa por severidad, blocks primero
- No renderiza si no hay red flags activos

- [ ] **Step 6: Integrar en Layout.tsx**

- [ ] **Step 7: Commit**

```bash
git add src/ backend/src/
git commit -m "feat: sistema de red flags con detección automática y alertas por severidad"
```

---

### M14 — Integración y Routing Final

- [ ] **Step 1: Actualizar App.tsx** — Reemplazar todos los stubs restantes con componentes reales. Verificar que todas las rutas funcionan.

- [ ] **Step 2: Registrar todas las rutas de backend** — Verificar que `backend/src/index.ts` tiene todos los routers importados y registrados.

- [ ] **Step 3: Crear script de seed completo**

Seed con: usuario admin, usuario facilitador, organización de prueba, engagement, sesiones con preguntas pre-pobladas.

- [ ] **Step 4: Testear flujo end-to-end**

1. Login como facilitador
2. Crear organización
3. Crear engagement
4. Crear sesión ejecutiva -> responder preguntas -> procesar con IA
5. Crear sesión operativa -> subir transcripción -> procesar -> validar
6. Crear sesión técnica -> completar
7. Ejecutar análisis cross-sesión
8. Ver diagnóstico con spider chart y quick wins con niveles de implementación
9. Diseñar comité basado en recomendación
10. Constituir comité con 8 decisiones
11. Crear piloto con baseline y sección de impacto en roles
12. Agregar métricas semanales
13. Verificar red flags en cada paso

- [ ] **Step 5: Verificar permisos** — Login como council member, verificar acceso acotado.

- [ ] **Step 6: Run lint y typecheck**

```bash
npx tsc --noEmit
npm run lint
cd backend && npx tsc --noEmit
```

- [ ] **Step 7: Commit final**

```bash
git add .
git commit -m "feat: AI Compass MVP completo — diagnóstico, comité, pilotos (Etapas 1-3)"
```

---

## Estrategia de Testing

### Backend (Supertest)

| Suite | Cobertura |
|-------|-----------|
| Auth | Login válido/inválido, token expirado, endpoint protegido sin token |
| Organizaciones | CRUD completo, filtrado por rol |
| Sesiones | Crear sesión genera preguntas, actualizar respuesta, participantes |
| IA | Mock de Gemini, validar estructura de respuesta contra schema |
| Red Flags | Cada regla disparada con datos mínimos |

### Frontend (Vitest + React Testing Library)

| Componente | Escenarios |
|------------|-----------|
| QuestionCard | Modo basic vs modo IA, 4 botones de validación |
| ValidationPanel | Filtros, progreso, completar validación |
| SpiderChart | Datos completos, parciales, vacíos |
| ProtectedRoute | Sin token -> login, rol incorrecto -> redirect |
| RedFlagBanner | Sin flags -> no renderiza, con flags -> renderiza |
| TranscriptUploader | Drag & drop, pegar texto, archivo existente |

### Stores

| Store | Acciones a testear |
|-------|-------------------|
| authStore | login éxito/fallo, logout limpia estado |
| sessionStore | updateQuestionAnswer, processWithAI |
| pilotStore | addMetricEntry, updateStatus con validación baseline |

---

## Riesgos de Integración y Mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| M08 arranca sin backend disponible | `apiClient.ts` debe manejar errores de red gracefully. Stores inicializan con arrays vacíos. |
| Tipos cambian entre Ola 2 y Ola 4 | Tipos se declaran completos en M03 y se consideran frozen. Nuevos tipos se agregan sin modificar existentes. |
| M06 y M07 modifican `backend/src/index.ts` | Cada módulo registra sus routes. M14 consolida todo. |
| M09 es el módulo más largo | Sub-dividido en 3 fases internas. Si se bloquea en fase 3, M14 puede continuar con stubs. |
| Constantes duplicadas se desincronizan | Los IDs de preguntas son literales fijos. Si se modifica en frontend, debe modificarse en backend en el mismo commit. |
| IA devuelve JSON malformado | Gemini usa `response_mime_type: "application/json"`. Backend valida campos requeridos antes de retornar. |
| apiClient snake_case vs camelCase | Interceptor en `apiClient.ts` transforma en un único punto. Backend retorna snake_case (convención PG). |

---

## Resumen de Olas

| Ola | Agentes | Módulos | Qué produce | Duración estimada |
|-----|---------|---------|-------------|-------------------|
| 1 | 2 | M01, M02 | Proyecto scaffolded, ESLint, backend con health check | Corta |
| 2 | 2 | M03, M04 | Tipos completos, DB creada, constantes, seeds | Corta |
| 3 | 4 | M05, M06, M07, M08 | API completa, motor IA, frontend shell funcional | Media |
| 4 | 4 | M09, M10, M11, M12 | Todos los módulos de dominio del frontend | Larga |
| 5 | 1 | M13, M14 | Red flags, integración end-to-end, validación | Media |

**Reducción estimada vs secuencial: ~60%** (5 olas de 1-4 agentes vs 16 tasks lineales).

---

## Changelog respecto al plan original

### Cambios del plan original (v1 -> plan maestro)
1. **ESLint + Prettier** agregados al scaffolding (M01)
2. **Error handler global** agregado al backend (M02)
3. **Constantes duplicadas** en backend en vez de importar del frontend (M04)
4. **2 preguntas nuevas** en sesión operativa: procesos remotos/presenciales y niveles de dificultad IA (S2-PRO-04, S2-PRO-05)
5. **3 campos nuevos en Quick Wins**: `valueChainSegment`, `implementationLevel`, `diminishingReturns`
6. **Sección "Impacto en roles"** agregada a pilotos: rol, % tiempo liberado, responsabilidades, incentivo
7. **Priorización MoSCoW** formal: Must-Have (F-001 a F-006) primero, Should-Have (F-007 a F-010) en paralelo
8. **14 módulos en 5 olas** en vez de 16 tasks secuenciales en 10 fases
9. **Specs detalladas** para cada página frontend (props, store, comportamiento, estados UI)
10. **Stubs de rutas** en App.tsx desde M08 para evitar conflictos de merge
11. **Contratos de frontera** explícitos entre módulos
12. **Product Discovery** formalizado en 4 niveles (framing, opportunities, features, journeys)

### Cambios por análisis de frameworks de referencia (7 gaps incorporados)
13. **Rediseño de workflows en pilotos (GAP CRÍTICO 1)**: `workflowDesign` en Pilot con workflow before/after detallado, puntos de validación humana, pasos eliminados/nuevos. Fuente: McKinsey (21% redesigna workflows, 3x más valor).
14. **Champions como red de adopción (GAP CRÍTICO 2)**: `championAssignments` en Pilot con nombre, área, responsabilidades, horas. Ratio 1:50. Fuente: Microsoft (+30% adopción con champions).
15. **Métricas de adopción en tracking semanal (GAP CRÍTICO 3)**: `adoptionMetrics` en PilotMetricEntry con % activo, frecuencia, habituales/novatos, NPS. Fuente: McKinsey (3x más éxito con KPIs) + Microsoft (4 capas métricas).
16. **Patrones de fracaso documentados (GAP MEDIO 4)**: Nueva constante `failurePatterns.ts` con 7 antipatrones. Fuente: McKinsey, Microsoft, Collective Academy.
17. **Gobernanza progresiva por etapa (GAP MEDIO 5)**: `governanceExpectations` en cada Stage con prácticas mínimas. Fuente: Microsoft (5 niveles), McKinsey AI Trust (44% más madurez con propiedad clara).
18. **Guía de contenido para deep dives (GAP MEDIO 6)**: Nueva constante `deepDiveGuides.ts` con guía detallada para 5 tipos de deep dive. Fuente: spec v2 actualizada.
19. **Transformación cultural explícita (GAP MEDIO 7)**: Deep dive de Cultura incluye beachheads, incentivos, narrativa, programa champions, quick wins culturales. Fuente: Collective Academy, McKinsey Rewired.

---

*Plan generado el 2026-04-10. Producto de InovaBiz.*
