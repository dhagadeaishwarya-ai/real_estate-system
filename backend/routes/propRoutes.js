const express = require('express');
const router = express.Router();
const { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty } = require('../controllers/propController');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');

router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Restricted to Admin, Agent, and Seller roles for editing/adding
router.post('/', authenticateToken, requireRoles(['admin', 'agent', 'seller']), createProperty);
router.put('/:id', authenticateToken, requireRoles(['admin', 'agent', 'seller']), updateProperty);
router.delete('/:id', authenticateToken, requireRoles(['admin', 'agent', 'seller']), deleteProperty);

module.exports = router;
