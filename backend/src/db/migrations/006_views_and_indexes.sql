-- 006_views_and_indexes.sql

CREATE VIEW inspection_form_failed_points AS
SELECT
  p.*
FROM inspection_form_test_points p
WHERE p.status IN ('fail','incomplete');

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_inspection_form_sections_form
  ON inspection_form_sections (inspection_form_id);

CREATE INDEX IF NOT EXISTS idx_inspection_form_points_section
  ON inspection_form_test_points (inspection_form_section_id);

CREATE INDEX IF NOT EXISTS idx_template_sections_template
  ON template_sections (template_id);

CREATE INDEX IF NOT EXISTS idx_template_points_section
  ON template_test_points (template_section_id);