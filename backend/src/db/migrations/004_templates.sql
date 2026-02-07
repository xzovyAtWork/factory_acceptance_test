-- 004_templates.sql

CREATE TABLE IF NOT EXISTS templates (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  unit_style      VARCHAR(255) NOT NULL,
  supported_test_types TEXT[] NOT NULL,
  allowed_designations TEXT[] NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      INTEGER NOT NULL REFERENCES users(id),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_sections (
  id              SERIAL PRIMARY KEY,
  template_id     INTEGER NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS template_test_points (
  id              SERIAL PRIMARY KEY,
  template_section_id INTEGER NOT NULL REFERENCES template_sections(id) ON DELETE CASCADE,
  test_type       VARCHAR(50) NOT NULL CHECK (test_type IN ('bypass', 'full_water')),
  description     TEXT NOT NULL,
  wiki_page_id    INTEGER REFERENCES wiki_pages(id),
  sort_order      INTEGER NOT NULL DEFAULT 0
);