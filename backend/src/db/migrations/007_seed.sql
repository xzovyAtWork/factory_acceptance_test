-- 007_seed.sql : Initial seed data for HVAC Inspection System

------------------------------------------------------------
-- USERS
------------------------------------------------------------

INSERT INTO users (email, password_hash, full_name, role)
VALUES
  ('admin@example.com',
   '$2b$10$GhQLG2tHP6KbkSNguhDf/.YF8Y7AirBLps4/gSwclItHp3PtuP0Ze', 
   'System Administrator',
   'admin'),

  ('tech1@example.com',
   '$2b$10$GhQLG2tHP6KbkSNguhDf/.YF8Y7AirBLps4/gSwclItHp3PtuP0Ze',
   'Technician One',
   'technician'),

  ('tech2@example.com',
   '$2b$10$GhQLG2tHP6KbkSNguhDf/.YF8Y7AirBLps4/gSwclItHp3PtuP0Ze',
   'Technician Two',
   'technician');

-- NOTE:
-- Replace password_hash values with real bcrypt hashes.
-- Example bcrypt hash for "password123":
-- $2b$10$u1k9xN8YgZrQm8xVwF8qUu6qQ1uFZ8u3lJxJxJxJxJxJxJxJxJx


------------------------------------------------------------
-- UNIT DESIGNATIONS
------------------------------------------------------------

INSERT INTO unit_designations (code, label)
VALUES
  ('L', 'Left'),
  ('R', 'Right'),
  ('T', 'Top'),
  ('B', 'Bottom'),
  ('A', 'Designation A'),
  ('B2', 'Designation B'),
  ('C', 'Designation C')
ON CONFLICT DO NOTHING;


------------------------------------------------------------
-- SAMPLE WIKI PAGE
------------------------------------------------------------

INSERT INTO wiki_pages (title, slug, content, created_by)
VALUES
  ('Evaporator Coil Cleaning',
   'evaporator-coil-cleaning',
   '<h2>Evaporator Coil Cleaning</h2><p>Ensure coil is free of debris and buildup.</p>',
   1);


------------------------------------------------------------
-- SAMPLE TEMPLATE
------------------------------------------------------------

INSERT INTO templates
  (name, unit_style, supported_test_types, allowed_designations, created_by)
VALUES
  ('Standard RTU Template',
   'RTU-STD',
   '{"bypass","full_water"}',
   '{"L","R","A","B2"}',
   1)
RETURNING id INTO TEMP TABLE new_template;

-- Retrieve template ID
WITH tpl AS (SELECT id FROM new_template)
INSERT INTO template_sections (template_id, name, sort_order)
VALUES
  ((SELECT id FROM tpl), 'Evaporator Section', 1),
  ((SELECT id FROM tpl), 'Motor Section', 2);

-- Retrieve section IDs
WITH sec AS (
  SELECT id, name FROM template_sections
  WHERE template_id = (SELECT id FROM new_template)
)
INSERT INTO template_test_points
  (template_section_id, test_type, description, wiki_page_id, sort_order)
VALUES
  ((SELECT id FROM sec WHERE name='Evaporator Section'),
    'bypass', 'Check evaporator coil cleanliness', 1, 1),

  ((SELECT id FROM sec WHERE name='Evaporator Section'),
    'full_water', 'Verify water distribution across coil', 1, 2),

  ((SELECT id FROM sec WHERE name='Motor Section'),
    'bypass', 'Check motor amperage', NULL, 1),

  ((SELECT id FROM sec WHERE name='Motor Section'),
    'full_water', 'Verify motor vibration levels', NULL, 2);


------------------------------------------------------------
-- SAMPLE UNIT
------------------------------------------------------------

INSERT INTO units (unit_number, job_number)
VALUES ('CU-1001', 'JOB-5001')
RETURNING id INTO TEMP TABLE new_unit;


------------------------------------------------------------
-- SAMPLE INSPECTION FORM
------------------------------------------------------------

-- Create form
INSERT INTO inspection_forms
  (template_id, unit_id, unit_number, job_number, unit_designation, test_type, created_by)
VALUES
  ((SELECT id FROM new_template),
   (SELECT id FROM new_unit),
   'CU-1001',
   'JOB-5001',
   'L',
   'bypass',
   2)
RETURNING id INTO TEMP TABLE new_form;

-- Create form sections
WITH tpl_sec AS (
  SELECT * FROM template_sections
  WHERE template_id = (SELECT id FROM new_template)
)
INSERT INTO inspection_form_sections
  (inspection_form_id, template_section_id, name, sort_order)
SELECT
  (SELECT id FROM new_form),
  tpl_sec.id,
  tpl_sec.name,
  tpl_sec.sort_order
FROM tpl_sec;

-- Create form test points
WITH form_sec AS (
  SELECT * FROM inspection_form_sections
  WHERE inspection_form_id = (SELECT id FROM new_form)
),
tpl_points AS (
  SELECT * FROM template_test_points
  WHERE test_type = 'bypass'
)
INSERT INTO inspection_form_test_points
  (inspection_form_section_id, template_test_point_id, description, wiki_page_id)
SELECT
  form_sec.id,
  tpl_points.id,
  tpl_points.description,
  tpl_points.wiki_page_id
FROM form_sec
JOIN tpl_points ON tpl_points.template_section_id = form_sec.template_section_id;


------------------------------------------------------------
-- SIGN-ON SAMPLE
------------------------------------------------------------

INSERT INTO technician_signons (inspection_form_id, user_id, role_at_time)
VALUES
  ((SELECT id FROM new_form), 2, 'technician');