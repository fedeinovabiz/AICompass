-- 002_agentic_tools.sql — Herramientas de Transformación Agéntica

-- CUJs (Critical User Journeys)
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

-- Value Engineering en pilots
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
