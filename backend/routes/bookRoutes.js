const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookController');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getBookings);
router.post('/', authenticateToken, requireRoles(['buyer']), createBooking);
router.put('/:id/status', authenticateToken, requireRoles(['admin', 'agent', 'seller']), updateBookingStatus);

module.exports = router;
