const db = require('../config/db');
const templatesQuery = require('../db/queries/templates');
const { validateCreateTemplate } = require('../utils/validation');

exports.createTemplate = async (req, res, next) => {
  try {
    const errors = validateCreateTemplate(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const template = await templatesQuery.createTemplate(
      {
        name: req.body.name,
        unit_style: req.body.unit_style,
        supported_test_types: req.body.supported_test_types,
        allowed_designations: req.body.allowed_designations,
        created_by: req.user.id,
      },
      req.body.sections || []
    );

    res.status(201).json(template);
  } catch (err) {
    next(err);
  }
};

exports.listTemplates = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, unit_style, supported_test_types, allowed_designations, is_active FROM templates ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getTemplate = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const { rows: tplRows } = await db.query(
      'SELECT * FROM templates WHERE id = $1',
      [id]
    );
    const template = tplRows[0];
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const { rows: sections } = await db.query(
      'SELECT * FROM template_sections WHERE template_id = $1 ORDER BY sort_order',
      [id]
    );

    const { rows: points } = await db.query(
      `SELECT p.*, s.id AS section_id
       FROM template_test_points p
       JOIN template_sections s ON p.template_section_id = s.id
       WHERE s.template_id = $1
       ORDER BY s.sort_order, p.sort_order`,
      [id]
    );

    const sectionsWithPoints = sections.map((s) => ({
      ...s,
      test_points: points.filter((p) => p.section_id === s.id),
    }));

    res.json({ ...template, sections: sectionsWithPoints });
  } catch (err) {
    next(err);
  }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Simple update of top-level fields; for full section/point editing
    // you might implement a more complex diff or replace strategy.
    const { name, unit_style, supported_test_types, allowed_designations, is_active } = req.body;

    const { rows } = await db.query(
      `UPDATE templates
       SET name = COALESCE($2, name),
           unit_style = COALESCE($3, unit_style),
           supported_test_types = COALESCE($4, supported_test_types),
           allowed_designations = COALESCE($5, allowed_designations),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, unit_style, supported_test_types, allowed_designations, is_active]
    );

    const template = rows[0];
    if (!template) return res.status(404).json({ error: 'Template not found' });

    res.json(template);
  } catch (err) {
    next(err);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rowCount } = await db.query(
      'DELETE FROM templates WHERE id = $1',
      [id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Template not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};