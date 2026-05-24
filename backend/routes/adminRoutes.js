const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, updateUserRole, deleteUser } = require('../controllers/adminController');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');

// All routes here are restricted to Admin role only
router.get('/stats', authenticateToken, requireRoles(['admin']), getDashboardStats);
router.get('/users', authenticateToken, requireRoles(['admin']), getUsers);
router.put('/users/:id/role', authenticateToken, requireRoles(['admin']), updateUserRole);
router.delete('/users/:id', authenticateToken, requireRoles(['admin']), deleteUser);

module.exports = router;
