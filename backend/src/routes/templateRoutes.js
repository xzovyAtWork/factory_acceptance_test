const router = require('express').Router();
const requireRole = require('../middleware/role');
const templateController = require('../controllers/templateController');

// Admin: create template
router.post('/', requireRole('admin'), templateController.createTemplate);

// All: list templates
router.get('/', templateController.listTemplates);

// All: get single template (with sections & points)
router.get('/:id', templateController.getTemplate);

// Admin: update template
router.put('/:id', requireRole('admin'), templateController.updateTemplate);

// Admin: delete template
router.delete('/:id', requireRole('admin'), templateController.deleteTemplate);

module.exports = router;