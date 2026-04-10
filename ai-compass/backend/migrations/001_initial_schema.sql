-- AI COMPASS — ESQUEMA INICIAL

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
  workflow_design JSONB DEFAULT '{}',
  champion_assignments JSONB DEFAULT '[]',
  role_impacts JSONB DEFAULT '[]',
  start_date DATE,
  evaluation_date DATE,
  committee_decision TEXT,
  committee_decision_date TIMESTAMPTZ,
  quick_win_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métricas de pilotos
CREATE TABLE pilot_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  values JSONB NOT NULL,
  adoption_metrics JSONB DEFAULT '{}',
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
