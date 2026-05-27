const express = require('express');
const router = express.Router();
const {
  getPropertyQuestions,
  createQuestion,
  answerQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');

router.get('/property/:propertyId', getPropertyQuestions);
router.post('/', authenticateToken, requireRoles(['buyer']), createQuestion);
router.put('/:id/answer', authenticateToken, requireRoles(['admin', 'agent', 'seller']), answerQuestion);
router.delete('/:id', authenticateToken, deleteQuestion);

module.exports = router;
