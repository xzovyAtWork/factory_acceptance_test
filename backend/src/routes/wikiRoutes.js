const router = require('express').Router();
const requireRole = require('../middleware/role');
const wikiController = require('../controllers/wikiController');

// All: list wiki pages
router.get('/', wikiController.listPages);

// All: get by slug
router.get('/:slug', wikiController.getPageBySlug);

// Admin: create page
router.post('/', requireRole('admin'), wikiController.createPage);

// Admin: update page
router.put('/:id', requireRole('admin'), wikiController.updatePage);

// Admin: delete page
router.delete('/:id', requireRole('admin'), wikiController.deletePage);

module.exports = router;