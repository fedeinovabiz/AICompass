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
