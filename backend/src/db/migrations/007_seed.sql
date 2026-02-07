// src/db/seed.js
require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('🌱 Starting seed...');

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // ------------------------------------------------------------
    // USERS
    // ------------------------------------------------------------
    const adminPass = await bcrypt.hash('Admin123!', 10);
    const tech1Pass = await bcrypt.hash('Tech123!', 10);
    const tech2Pass = await bcrypt.hash('Tech456!', 10);

    const admin = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      ['admin@example.com', adminPass, 'System Administrator', 'admin']
    );

    const tech1 = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      ['tech1@example.com', tech1Pass, 'Technician One', 'technician']
    );

    const tech2 = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      ['tech2@example.com', tech2Pass, 'Technician Two', 'technician']
    );

    const adminId = admin.rows[0].id;
    const tech1Id = tech1.rows[0].id;

    console.log('✔ Users seeded');

    // ------------------------------------------------------------
    // UNIT DESIGNATIONS
    // ------------------------------------------------------------
    const designations = ['L', 'R', 'T', 'B', 'A', 'B2', 'C'];

    for (const code of designations) {
      await client.query(
        `INSERT INTO unit_designations (code, label)
         VALUES ($1, $2)
         ON CONFLICT (code) DO NOTHING`,
        [code, `Designation ${code}`]
      );
    }

    console.log('✔ Unit designations seeded');

    // ------------------------------------------------------------
    // WIKI PAGE
    // ------------------------------------------------------------
    const wiki = await client.query(
      `INSERT INTO wiki_pages (title, slug, content, created_by)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
       RETURNING id`,
      [
        'Evaporator Coil Cleaning',
        'evaporator-coil-cleaning',
        '<h2>Evaporator Coil Cleaning</h2><p>Ensure coil is free of debris.</p>',
        adminId
      ]
    );

    const wikiId = wiki.rows[0].id;
    console.log('✔ Wiki page seeded');

    // ------------------------------------------------------------
    // TEMPLATE
    // ------------------------------------------------------------
    const template = await client.query(
      `INSERT INTO templates
        (name, unit_style, supported_test_types, allowed_designations, created_by)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [
        'Standard RTU Template',
        'RTU-STD',
        ['bypass', 'full_water'],
        ['L', 'R', 'A', 'B2'],
        adminId
      ]
    );

    const templateId = template.rows[0].id;
    console.log('✔ Template seeded');

    // ------------------------------------------------------------
    // TEMPLATE SECTIONS
    // ------------------------------------------------------------
    const evapSec = await client.query(
      `INSERT INTO template_sections (template_id, name, sort_order)
       VALUES ($1,$2,$3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [templateId, 'Evaporator Section', 1]
    );

    const motorSec = await client.query(
      `INSERT INTO template_sections (template_id, name, sort_order)
       VALUES ($1,$2,$3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [templateId, 'Motor Section', 2]
    );

    const evapSecId = evapSec.rows[0]?.id;
    const motorSecId = motorSec.rows[0]?.id;

    console.log('✔ Template sections seeded');

    // ------------------------------------------------------------
    // TEMPLATE TEST POINTS
    // ------------------------------------------------------------
    await client.query(
      `INSERT INTO template_test_points
        (template_section_id, test_type, description, wiki_page_id, sort_order)
       VALUES
        ($1,'bypass','Check evaporator coil cleanliness',$3,1),
        ($1,'full_water','Verify water distribution across coil',$3,2),
        ($2,'bypass','Check motor amperage',NULL,1),
        ($2,'full_water','Verify motor vibration levels',NULL,2)
       ON CONFLICT DO NOTHING`,
      [evapSecId, motorSecId, wikiId]
    );

    console.log('✔ Template test points seeded');

    // ------------------------------------------------------------
    // UNIT
    // ------------------------------------------------------------
    const unit = await client.query(
      `INSERT INTO units (unit_number, job_number)
       VALUES ($1,$2)
       ON CONFLICT (unit_number, job_number) DO UPDATE SET unit_number = EXCLUDED.unit_number
       RETURNING id`,
      ['CU-1001', 'JOB-5001']
    );

    const unitId = unit.rows[0].id;
    console.log('✔ Unit seeded');

    // ------------------------------------------------------------
    // INSPECTION FORM
    // ------------------------------------------------------------
    const form = await client.query(
      `INSERT INTO inspection_forms
        (template_id, unit_id, unit_number, job_number, unit_designation, test_type, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [
        templateId,
        unitId,
        'CU-1001',
        'JOB-5001',
        'L',
        'bypass',
        tech1Id
      ]
    );

    const formId = form.rows[0]?.id;

    if (formId) {
      console.log('✔ Inspection form seeded');

      // ------------------------------------------------------------
      // FORM SECTIONS
      // ------------------------------------------------------------
      const formSections = await client.query(
        `INSERT INTO inspection_form_sections
          (inspection_form_id, template_section_id, name, sort_order)
         SELECT $1, id, name, sort_order
         FROM template_sections
         WHERE template_id = $2
         RETURNING id, template_section_id`,
        [formId, templateId]
      );

      // ------------------------------------------------------------
      // FORM TEST POINTS
      // ------------------------------------------------------------
      for (const sec of formSections.rows) {
        await client.query(
          `INSERT INTO inspection_form_test_points
            (inspection_form_section_id, template_test_point_id, description, wiki_page_id)
           SELECT $1, id, description, wiki_page_id
           FROM template_test_points
           WHERE template_section_id = $2 AND test_type = 'bypass'
           ON CONFLICT DO NOTHING`,
          [sec.id, sec.template_section_id]
        );
      }

      console.log('✔ Form sections + test points seeded');

      // ------------------------------------------------------------
      // SIGN-ON
      // ------------------------------------------------------------
      await client.query(
        `INSERT INTO technician_signons
          (inspection_form_id, user_id, role_at_time)
         VALUES ($1,$2,'technician')
         ON CONFLICT DO NOTHING`,
        [formId, tech1Id]
      );

      console.log('✔ Technician sign-on seeded');
    }

    await client.query('COMMIT');
    console.log('🎉 Seed complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();