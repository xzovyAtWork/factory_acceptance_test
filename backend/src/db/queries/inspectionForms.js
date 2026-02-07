// src/db/queries/inspectionForms.js
const db = require('../../config/db');

exports.createInspectionFormFromTemplate = async ({
  templateId,
  unit_number,
  job_number,
  unit_designation,
  test_type,
  created_by,
}) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: tplRows } = await client.query(
      'SELECT * FROM templates WHERE id = $1',
      [templateId]
    );
    const template = tplRows[0];
    if (!template) throw new Error('Template not found');

    const { rows: formRows } = await client.query(
      `INSERT INTO inspection_forms
       (template_id, unit_number, job_number, unit_designation, test_type, created_by)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [templateId, unit_number, job_number, unit_designation, test_type, created_by]
    );
    const form = formRows[0];

    const { rows: sections } = await client.query(
      `SELECT * FROM template_sections WHERE template_id = $1 ORDER BY sort_order`,
      [templateId]
    );

    for (const sec of sections) {
      const { rows: formSecRows } = await client.query(
        `INSERT INTO inspection_form_sections
         (inspection_form_id, template_section_id, name, sort_order)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [form.id, sec.id, sec.name, sec.sort_order]
      );
      const formSec = formSecRows[0];

      const { rows: points } = await client.query(
        `SELECT * FROM template_test_points
         WHERE template_section_id = $1 AND test_type = $2
         ORDER BY sort_order`,
        [sec.id, test_type]
      );

      for (const p of points) {
        await client.query(
          `INSERT INTO inspection_form_test_points
           (inspection_form_section_id, template_test_point_id, description, wiki_page_id)
           VALUES ($1,$2,$3,$4)`,
          [formSec.id, p.id, p.description, p.wiki_page_id]
        );
      }
    }

    await client.query('COMMIT');
    return form;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};