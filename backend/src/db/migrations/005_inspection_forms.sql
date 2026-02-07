-- 005_inspection_forms.sql

CREATE TABLE IF NOT EXISTS inspection_forms (
  id              SERIAL PRIMARY KEY,
  template_id     INTEGER NOT NULL REFERENCES templates(id),
  unit_id         INTEGER REFERENCES units(id),
  unit_number     VARCHAR(50) NOT NULL,
  job_number      VARCHAR(50) NOT NULL,
  unit_designation VARCHAR(5) NOT NULL,
  test_type       VARCHAR(50) NOT NULL CHECK (test_type IN ('bypass', 'full_water')),
  status          VARCHAR(50) NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress','completed','reopened')),
  created_by      INTEGER NOT NULL REFERENCES users(id),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  conditionally_signed_off BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS inspection_form_sections (
  id              SERIAL PRIMARY KEY,
  inspection_form_id INTEGER NOT NULL REFERENCES inspection_forms(id) ON DELETE CASCADE,
  template_section_id INTEGER REFERENCES template_sections(id),
  name            VARCHAR(255) NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inspection_form_test_points (
  id              SERIAL PRIMARY KEY,
  inspection_form_section_id INTEGER NOT NULL REFERENCES inspection_form_sections(id) ON DELETE CASCADE,
  template_test_point_id INTEGER REFERENCES template_test_points(id),
  description     TEXT NOT NULL,
  wiki_page_id    INTEGER REFERENCES wiki_pages(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'incomplete'
                  CHECK (status IN ('pass','fail','incomplete')),
  comment         TEXT,
  requires_correction BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS technician_signons (
  id              SERIAL PRIMARY KEY,
  inspection_form_id INTEGER NOT NULL REFERENCES inspection_forms(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  role_at_time    VARCHAR(20) NOT NULL,
  signed_on_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (inspection_form_id, user_id)
);

CREATE TABLE IF NOT EXISTS unit_signoffs (
  id              SERIAL PRIMARY KEY,
  inspection_form_id INTEGER NOT NULL UNIQUE REFERENCES inspection_forms(id) ON DELETE CASCADE,
  signed_off_by   INTEGER NOT NULL REFERENCES users(id),
  signed_off_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  conditional     BOOLEAN NOT NULL DEFAULT FALSE
);