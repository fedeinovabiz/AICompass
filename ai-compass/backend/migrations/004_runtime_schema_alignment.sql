-- 004_runtime_schema_alignment.sql
-- Alinea las migraciones con tablas que existen en runtime pero nunca se versionaron.
-- Usa CREATE TABLE IF NOT EXISTS para que sea idempotente en ambientes que ya las tienen.
--
-- Tablas creadas: process_maps, ai_tool_catalog, governance_evolutions,
-- scaling_plans, scaling_metrics, industry_benchmarks.

-- ──────────────────────────────────────────────
-- process_maps — Mapeo y rediseño de procesos (Etapa 4)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS process_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  value_chain_segment VARCHAR(255),
  current_steps JSONB DEFAULT '[]',
  redesigned_steps JSONB DEFAULT '[]',
  implementation_level VARCHAR(20) DEFAULT 'prompting'
    CHECK (implementation_level IN ('prompting', 'no-code', 'custom')),
  estimated_hours_saved_weekly NUMERIC DEFAULT 0,
  estimated_impact TEXT,
  priority_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'mapped'
    CHECK (status IN ('mapped', 'analyzed', 'redesigned', 'approved', 'implementing')),
  cuj_id UUID REFERENCES cujs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_process_maps_org ON process_maps(organization_id);

-- ──────────────────────────────────────────────
-- ai_tool_catalog — Catálogo de herramientas IA por organización
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_tool_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  licenses INTEGER DEFAULT 0,
  monthly_cost NUMERIC DEFAULT 0,
  teams_using JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'evaluating', 'deprecated')),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tool_catalog_org ON ai_tool_catalog(organization_id);

-- ──────────────────────────────────────────────
-- governance_evolutions — Evolución de decisiones fundacionales
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS governance_evolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  original_decision_number INTEGER NOT NULL,
  evolution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  change_description TEXT NOT NULL,
  decided_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_evolutions_org ON governance_evolutions(organization_id);

-- ──────────────────────────────────────────────
-- scaling_plans — Planes de escalamiento por piloto
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scaling_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  target_areas JSONB DEFAULT '[]',
  total_target_users INTEGER DEFAULT 0,
  scaling_start_date DATE,
  scaling_status VARCHAR(20) DEFAULT 'planning'
    CHECK (scaling_status IN ('planning', 'active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scaling_plans_pilot ON scaling_plans(pilot_id);
CREATE INDEX IF NOT EXISTS idx_scaling_plans_org ON scaling_plans(organization_id);

-- ──────────────────────────────────────────────
-- scaling_metrics — Métricas de adopción del escalamiento
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scaling_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scaling_plan_id UUID NOT NULL REFERENCES scaling_plans(id) ON DELETE CASCADE,
  area_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  adoption_percentage NUMERIC DEFAULT 0,
  users_active INTEGER DEFAULT 0,
  impact_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scaling_metrics_plan ON scaling_metrics(scaling_plan_id);

-- ──────────────────────────────────────────────
-- industry_benchmarks — Benchmark de madurez por industria y tamaño (F-018)
-- Tabla referenciada por backend/src/routes/benchmarks.ts pero nunca creada.
-- Se deja vacía: el route ya maneja "sin filas" devolviendo scores={} y source='framework'.
-- Para sembrar datos reales, insertar filas por (industry, size_category, dimension).
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry VARCHAR(255) NOT NULL,
  size_category VARCHAR(20) NOT NULL
    CHECK (size_category IN ('1-50', '51-200', '201-500', '501+')),
  dimension VARCHAR(50) NOT NULL,
  avg_score NUMERIC(3, 2) NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 0,
  source VARCHAR(50) NOT NULL DEFAULT 'framework',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(industry, size_category, dimension)
);

CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_lookup
  ON industry_benchmarks(industry, size_category);
