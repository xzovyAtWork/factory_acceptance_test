// src/routes/pdfRoutes.js
const router = require('express').Router();
const requireRole = require('../middleware/role');
const ctrl = require('../controllers/pdfController');

router.get('/forms/:id', requireRole('technician','admin'), ctrl.exportFormPdf);

module.exports = router;