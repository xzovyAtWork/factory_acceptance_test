// src/controllers/inspectionFormController.js

const db = require('../config/db');
const { validateCreateInspectionForm } = require('../utils/validation');
const logic = require('../services/inspectionLogicService');
const formsQuery = require('../db/queries/inspectionForms');

// ------------------------------------------------------------
// Create a new inspection form from a template
// ------------------------------------------------------------
exports.createForm = async (req, res, next) => {
  try {
    const errors = validateCreateInspectionForm(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const form = await formsQuery.createInspectionFormFromTemplate({
      templateId: req.body.template_id,
      unit_number: req.body.unit_number,
      job_number: req.body.job_number,
      unit_designation: req.body.unit_designation,
      test_type: req.body.test_type,
      created_by: req.user.id
    });

    res.status(201).json(form);
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------
// List all inspection forms
// Technician: can view all, but only edit signed-on forms
// Admin: full access
// ------------------------------------------------------------
exports.listForms = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT f.*, u.full_name AS creator_name
       FROM inspection_forms f
       JOIN users u ON f.created_by = u.id
       ORDER BY f.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------
// Get a single inspection form with sections + test points
// ------------------------------------------------------------
exports.getForm = async (req, res, next) => {
  try {
    const formId = parseInt(req.params.id, 10);

    const { rows: formRows } = await db.query(
      `SELECT * FROM inspection_forms WHERE id = $1`,
      [formId]
    );
    const form = formRows[0];
    if (!form) return res.status(404).json({ error: 'Form not found' });

    // Load sections
    const { rows: sections } = await db.query(
      `SELECT * FROM inspection_form_sections
       WHERE inspection_form_id = $1
       ORDER BY sort_order`,
      [formId]
    );

    // Load test points
    const { rows: points } = await db.query(
      `SELECT p.*, s.id AS section_id
       FROM inspection_form_test_points p
       JOIN inspection_form_sections s ON p.inspection_form_section_id = s.id
       WHERE s.inspection_form_id = $1
       ORDER BY s.sort_order, p.id`,
      [formId]
    );

    // Load sign-ons
    const { rows: signons } = await db.query(
      `SELECT ts.*, u.full_name
       FROM technician_signons ts
       JOIN users u ON ts.user_id = u.id
       WHERE ts.inspection_form_id = $1
       ORDER BY ts.signed_on_at`,
      [formId]
    );

    const isSignedOn = signons.some((s) => s.user_id === req.user.id);

    // Build section structure
    const sectionsWithPoints = sections.map((s) => ({
      ...s,
      test_points: points.filter((p) => p.section_id === s.id)
    }));

    res.json({
      form,
      sections: sectionsWithPoints,
      signons,
      isSignedOn
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------
// Technician/Admin sign-on
// ------------------------------------------------------------
exports.signOn = async (req, res, next) => {
  try {
    const formId = parseInt(req.params.id, 10);

    // Check if already signed on
    const { rows: existing } = await db.query(
      `SELECT 1 FROM technician_signons
       WHERE inspection_form_id = $1 AND user_id = $2`,
      [formId, req.user.id]
    );
    if (existing[0]) {
      return res.json({ message: 'Already signed on' });
    }

    await db.query(
      `INSERT INTO technician_signons (inspection_form_id, user_id, role_at_time)
       VALUES ($1, $2, $3)`,
      [formId, req.user.id, req.user.role]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------
// Update a test point (status/comment)
// ------------------------------------------------------------
exports.updateTestPoint = async (req, res, next) => {
  try {
    const formId = parseInt(req.params.id, 10);
    const pointId = parseInt(req.params.pointId, 10);
    const { status, comment } = req.body;

    // Load form
    const { rows: formRows } = await db.query(
      `SELECT * FROM inspection_forms WHERE id = $1`,
      [formId]
    );
    const form = formRows[0];
    if (!form) return res.status(404).json({ error: 'Form not found' });

    // Admin can always edit
    if (req.user.role !== 'admin') {
      // Must be signed-on technician
      const { rows: signRows } = await db.query(
        `SELECT 1 FROM technician_signons
         WHERE inspection_form_id = $1 AND user_id = $2`,
        [formId, req.user.id]
      );
      if (!signRows[0]) {
        return res.status(403).json({ error: 'Not signed on to this form' });
      }
    }

    const requiresCorrection = status === 'fail' || status === 'incomplete';

    await db.query(
      `UPDATE inspection_form_test_points
       SET status = COALESCE($1, status),
           comment = COALESCE($2, comment),
           requires_correction = $3
       WHERE id = $4
         AND inspection_form_section_id IN (
           SELECT id FROM inspection_form_sections WHERE inspection_form_id = $5
         )`,
      [status, comment || null, requiresCorrection, pointId, formId]
    );

    // Update conditional sign-off flag
    await logic.updateConditionalFlag(formId);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------
// Complete & sign-off
// ------------------------------------------------------------
exports.signOff = async (req, res, next) => {
  try {
    const formId = parseInt(req.params.id, 10);
    const { conditional } = req.body;

    // Load form
    const { rows: formRows } = await db.query(
      `SELECT * FROM inspection_forms WHERE id = $1`,
      [formId]
    );
    const form = formRows[0];
    if (!form) return res.status(404).json({ error: 'Form not found' });

    // Admin can always sign off
    if (req.user.role !== 'admin') {
      // Must be signed-on technician
      const { rows: signRows } = await db.query(
        `SELECT 1 FROM technician_signons
         WHERE inspection_form_id = $1 AND user_id = $2`,
        [formId, req.user.id]
      );
      if (!signRows[0]) {
        return res.status(403).json({ error: 'Not signed on to this form' });
      }
    }

    // Insert sign-off
    await db.query(
      `INSERT INTO unit_signoffs (inspection_form_id, signed_off_by, conditional)
       VALUES ($1, $2, $3)
       ON CONFLICT (inspection_form_id)
       DO UPDATE SET signed_off_by = EXCLUDED.signed_off_by,
                     conditional = EXCLUDED.conditional,
                     signed_off_at = NOW()`,
      [formId, req.user.id, conditional]
    );

    // Mark form completed
    await db.query(
      `UPDATE inspection_forms
       SET status = 'completed',
           conditionally_signed_off = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [conditional, formId]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------
// Admin-only: reopen a completed form
// ------------------------------------------------------------
exports.reopenForm = async (req, res, next) => {
  try {
    const formId = parseInt(req.params.id, 10);

    await db.query(
      `UPDATE inspection_forms
       SET status = 'reopened',
           updated_at = NOW()
       WHERE id = $1`,
      [formId]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------
// Admin-only: manage sign-on list (add/remove technicians)
// ------------------------------------------------------------
exports.manageSignOn = async (req, res, next) => {
  try {
    const formId = parseInt(req.params.id, 10);
    const { user_id, action } = req.body;

    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    if (action === 'add') {
      await db.query(
        `INSERT INTO technician_signons (inspection_form_id, user_id, role_at_time)
         VALUES ($1, $2, 'technician')
         ON CONFLICT DO NOTHING`,
        [formId, user_id]
      );
    }

    if (action === 'remove') {
      await db.query(
        `DELETE FROM technician_signons
         WHERE inspection_form_id = $1 AND user_id = $2`,
        [formId, user_id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};