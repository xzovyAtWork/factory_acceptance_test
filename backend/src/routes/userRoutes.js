const router = require('express').Router();
const requireRole = require('../middleware/role');
const userController = require('../controllers/userController');

// Admin: create user (technician or admin)
router.post('/', requireRole('admin'), userController.createUser);

// Admin: list users
router.get('/', requireRole('admin'), userController.listUsers);

// Admin: get single user
router.get('/:id', requireRole('admin'), userController.getUser);

// Admin: update user (role, active flag, etc.)
router.put('/:id', requireRole('admin'), userController.updateUser);

// Admin: deactivate user
router.post('/:id/deactivate', requireRole('admin'), userController.deactivateUser);

module.exports = router;