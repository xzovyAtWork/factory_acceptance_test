// src/routes/inspectionFormRoutes.js

const router = require('express').Router();
const requireRole = require('../middleware/role');
const inspectionController = require('../controllers/inspectionFormController');

// ------------------------------------------------------------
// Create a new inspection form from a template
// Technician or Admin
// ------------------------------------------------------------
router.post(
  '/',
  requireRole('technician', 'admin'),
  inspectionController.createForm
);

// ------------------------------------------------------------
// List all inspection forms
// Technician: can view all, but only edit signed-on forms
// Admin: full access
// ------------------------------------------------------------
router.get(
  '/',
  requireRole('technician', 'admin'),
  inspectionController.listForms
);

// ------------------------------------------------------------
// Get a single inspection form with sections + test points
// ------------------------------------------------------------
router.get(
  '/:id',
  requireRole('technician', 'admin'),
  inspectionController.getForm
);

// ------------------------------------------------------------
// Technician/Admin sign-on to a form
// ------------------------------------------------------------
router.post(
  '/:id/signon',
  requireRole('technician', 'admin'),
  inspectionController.signOn
);

// ------------------------------------------------------------
// Update a test point (status/comment)
// Technician: only if signed-on
// Admin: always allowed
// ------------------------------------------------------------
router.patch(
  '/:id/test-points/:pointId',
  requireRole('technician', 'admin'),
  inspectionController.updateTestPoint
);

// ------------------------------------------------------------
// Complete & sign-off a form
// Technician: only if signed-on
// Admin: always allowed
// ------------------------------------------------------------
router.post(
  '/:id/signoff',
  requireRole('technician', 'admin'),
  inspectionController.signOff
);

// ------------------------------------------------------------
// Admin-only: reopen a completed form
// ------------------------------------------------------------
router.post(
  '/:id/reopen',
  requireRole('admin'),
  inspectionController.reopenForm
);

// ------------------------------------------------------------
// Admin-only: add/remove technicians from sign-on list
// ------------------------------------------------------------
router.post(
  '/:id/signon/manage',
  requireRole('admin'),
  inspectionController.manageSignOn
);

module.exports = router;