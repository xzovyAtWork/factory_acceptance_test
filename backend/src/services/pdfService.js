// src/services/pdfService.js
const PDFDocument = require('pdfkit');
const db = require('../config/db');

async function fetchFormData(formId) {
  // Load form, sections, points, sign-ons, sign-off, failed points
  const { rows: formRows } = await db.query(
    'SELECT * FROM inspection_forms WHERE id = $1',
    [formId]
  );
  const form = formRows[0];

  const { rows: sections } = await db.query(
    `SELECT * FROM inspection_form_sections
     WHERE inspection_form_id = $1 ORDER BY sort_order`,
    [formId]
  );

  const { rows: points } = await db.query(
    `SELECT p.*, s.id AS section_id
     FROM inspection_form_test_points p
     JOIN inspection_form_sections s ON p.inspection_form_section_id = s.id
     WHERE s.inspection_form_id = $1
     ORDER BY s.sort_order, p.id`,
    [formId]
  );

  const { rows: signons } = await db.query(
    `SELECT ts.*, u.full_name
     FROM technician_signons ts
     JOIN users u ON ts.user_id = u.id
     WHERE ts.inspection_form_id = $1
     ORDER BY ts.signed_on_at`,
    [formId]
  );

  const { rows: signoffRows } = await db.query(
    `SELECT so.*, u.full_name
     FROM unit_signoffs so
     JOIN users u ON so.signed_off_by = u.id
     WHERE so.inspection_form_id = $1`,
    [formId]
  );

  return { form, sections, points, signons, signoff: signoffRows[0] };
}

exports.generateFormPdf = async (formId, res) => {
  const data = await fetchFormData(formId);
  const doc = new PDFDocument({ margin: 40 });

  // Stream to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="inspection-${formId}.pdf"`
  );
  doc.pipe(res);

  doc.fontSize(18).text('HVAC Inspection Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Unit Number: ${data.form.unit_number}`);
  doc.text(`Job Number: ${data.form.job_number}`);
  doc.text(`Unit Designation: ${data.form.unit_designation}`);
  doc.text(`Test Type: ${data.form.test_type}`);
  doc.text(`Status: ${data.form.status}`);
  doc.text(`Conditionally Signed Off: ${data.form.conditionally_signed_off ? 'Yes' : 'No'}`);
  doc.moveDown();

  // Technician sign-on list
  doc.fontSize(14).text('Technician Sign-On');
  data.signons.forEach(s => {
    doc.fontSize(11).text(
      `- ${s.full_name} (${s.role_at_time}) at ${new Date(s.signed_on_at).toLocaleString()}`
    );
  });
  doc.moveDown();

  // Sections & test points
  doc.fontSize(14).text('Inspection Details');
  for (const section of data.sections) {
    doc.moveDown().fontSize(13).text(section.name, { underline: true });
    const sectionPoints = data.points.filter(p => p.section_id === section.id);
    sectionPoints.forEach(p => {
      doc.fontSize(11).text(`• ${p.description}`);
      doc.text(`  Status: ${p.status}`);
      if (p.comment) doc.text(`  Comment: ${p.comment}`);
      if (p.requires_correction) doc.text('  Requires correction: YES');
      doc.moveDown(0.2);
    });
  }

  // Sign-off
  if (data.signoff) {
    doc.addPage();
    doc.fontSize(14).text('Unit Sign-Off');
    doc.fontSize(12).text(`Signed Off By: ${data.signoff.full_name}`);
    doc.text(`Signed Off At: ${new Date(data.signoff.signed_off_at).toLocaleString()}`);
    doc.text(`Conditional: ${data.signoff.conditional ? 'Yes' : 'No'}`);
  }

  // Export timestamp
  doc.moveDown();
  doc.fontSize(10).text(`Exported at: ${new Date().toLocaleString()}`, { align: 'right' });

  doc.end();
};