// src/db/queries/templates.js
const db = require('../../config/db');

exports.createTemplate = async (template, sectionsWithPoints) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: tRows } = await client.query(
      `INSERT INTO templates
       (name, unit_style, supported_test_types, allowed_designations, created_by)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        template.name,
        template.unit_style,
        template.supported_test_types,
        template.allowed_designations,
        template.created_by,
      ]
    );
    const tpl = tRows[0];

    for (const section of sectionsWithPoints) {
      const { rows: sRows } = await client.query(
        `INSERT INTO template_sections (template_id, name, sort_order)
         VALUES ($1,$2,$3)
         RETURNING *`,
        [tpl.id, section.name, section.sort_order || 0]
      );
      const sec = sRows[0];

      for (const point of section.test_points) {
        await client.query(
          `INSERT INTO template_test_points
           (template_section_id, test_type, description, wiki_page_id, sort_order)
           VALUES ($1,$2,$3,$4,$5)`,
          [
            sec.id,
            point.test_type,
            point.description,
            point.wiki_page_id || null,
            point.sort_order || 0,
          ]
        );
      }
    }

    await client.query('COMMIT');
    return tpl;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};