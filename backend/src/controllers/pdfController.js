// src/controllers/pdfController.js
const db = require('../config/db');
const { generateFormPdf } = require('../services/pdfService');

exports.exportFormPdf = async (req, res, next) => {
  try {
    const formId = parseInt(req.params.id, 10);

    // Check permissions: admin can export any; technician only their own completed forms
    const { rows } = await db.query(
      `SELECT f.*, EXISTS (
         SELECT 1 FROM technician_signons ts
         WHERE ts.inspection_form_id = f.id AND ts.user_id = $2
       ) AS is_signed_on
       FROM inspection_forms f
       WHERE f.id = $1`,
      [formId, req.user.id]
    );
    const form = rows[0];
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (req.user.role !== 'admin') {
      if (!form.is_signed_on || form.status !== 'completed') {
        return res.status(403).json({ error: 'Not allowed to export this form' });
      }
    }

    await generateFormPdf(formId, res);
  } catch (err) {
    next(err);
  }
};