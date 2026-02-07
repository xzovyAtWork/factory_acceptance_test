// utils/validation.js

const isNonEmptyString = (v) =>
  typeof v === 'string' && v.trim().length > 0;

exports.validateCreateTemplate = (body) => {
  const errors = [];

  if (!isNonEmptyString(body.name)) errors.push('Template name is required');
  if (!isNonEmptyString(body.unit_style)) errors.push('unit_style is required');

  if (!Array.isArray(body.supported_test_types) || body.supported_test_types.length === 0) {
    errors.push('supported_test_types must be a non-empty array');
  }

  if (!Array.isArray(body.allowed_designations) || body.allowed_designations.length === 0) {
    errors.push('allowed_designations must be a non-empty array');
  }

  if (!Array.isArray(body.sections) || body.sections.length === 0) {
    errors.push('sections must be a non-empty array');
  } else {
    body.sections.forEach((section, i) => {
      if (!isNonEmptyString(section.name)) {
        errors.push(`sections[${i}].name is required`);
      }

      if (!Array.isArray(section.test_points)) {
        errors.push(`sections[${i}].test_points must be an array`);
      } else {
        section.test_points.forEach((tp, j) => {
          if (!isNonEmptyString(tp.description)) {
            errors.push(`sections[${i}].test_points[${j}].description is required`);
          }
          if (!isNonEmptyString(tp.test_type)) {
            errors.push(`sections[${i}].test_points[${j}].test_type is required`);
          }
        });
      }
    });
  }

  return errors;
};

exports.validateCreateInspectionForm = (body) => {
  const errors = [];

  if (!body.template_id) errors.push('template_id is required');
  if (!isNonEmptyString(body.unit_number)) errors.push('unit_number is required');
  if (!isNonEmptyString(body.job_number)) errors.push('job_number is required');
  if (!isNonEmptyString(body.unit_designation)) errors.push('unit_designation is required');
  if (!isNonEmptyString(body.test_type)) errors.push('test_type is required');

  return errors;
};