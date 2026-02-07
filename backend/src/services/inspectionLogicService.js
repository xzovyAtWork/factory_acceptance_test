// src/services/inspectionLogicService.js
const db = require('../config/db');

exports.updateConditionalFlag = async (formId) => {
  const { rows } = await db.query(
    `SELECT COUNT(*) AS cnt
     FROM inspection_form_test_points p
     JOIN inspection_form_sections s ON p.inspection_form_section_id = s.id
     WHERE s.inspection_form_id = $1
       AND p.status IN ('fail','incomplete')`,
    [formId]
  );
  const hasIssues = parseInt(rows[0].cnt, 10) > 0;

  await db.query(
    `UPDATE inspection_forms
     SET conditionally_signed_off = $1
     WHERE id = $2`,
    [hasIssues, formId]
  );
};