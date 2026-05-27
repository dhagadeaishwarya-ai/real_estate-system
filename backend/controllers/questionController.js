const { getPool } = require('../config/db');

async function getPropertyQuestions(req, res) {
  const { propertyId } = req.params;

  try {
    const db = getPool();

    const [questions] = await db.query(`
      SELECT q.*,
             buyer.name as buyer_name,
             responder.name as answered_by_name,
             responder.role as answered_by_role
      FROM property_questions q
      JOIN users buyer ON q.buyer_id = buyer.id
      LEFT JOIN users responder ON q.answered_by = responder.id
      WHERE q.property_id = ?
      ORDER BY q.created_at DESC
    `, [propertyId]);

    return res.json(questions);
  } catch (error) {
    console.error('Get Property Questions Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

async function createQuestion(req, res) {
  const { property_id, question } = req.body;

  if (!property_id || !question || question.trim().length < 5) {
    return res.status(400).json({ message: 'Please enter a question with at least 5 characters.' });
  }

  try {
    const db = getPool();

    const [properties] = await db.query('SELECT id FROM properties WHERE id = ?', [property_id]);
    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const [result] = await db.query(
      'INSERT INTO property_questions (property_id, buyer_id, question) VALUES (?, ?, ?)',
      [property_id, req.user.id, question.trim()]
    );

    return res.status(201).json({
      message: 'Question posted successfully.',
      questionId: result.insertId
    });
  } catch (error) {
    console.error('Create Question Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

async function answerQuestion(req, res) {
  const { id } = req.params;
  const { answer } = req.body;

  if (!answer || answer.trim().length < 3) {
    return res.status(400).json({ message: 'Please enter a valid answer.' });
  }

  try {
    const db = getPool();

    const [questions] = await db.query(`
      SELECT q.id, p.owner_id
      FROM property_questions q
      JOIN properties p ON q.property_id = p.id
      WHERE q.id = ?
    `, [id]);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const { owner_id } = questions[0];
    const canAnswer = req.user.role === 'admin' || req.user.role === 'agent' || Number(req.user.id) === Number(owner_id);

    if (!canAnswer) {
      return res.status(403).json({ message: 'Access denied. Only admins, agents, or the listing owner can answer.' });
    }

    await db.query(
      'UPDATE property_questions SET answer = ?, answered_by = ?, answered_at = CURRENT_TIMESTAMP WHERE id = ?',
      [answer.trim(), req.user.id, id]
    );

    return res.json({ message: 'Answer saved successfully.' });
  } catch (error) {
    console.error('Answer Question Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

async function deleteQuestion(req, res) {
  const { id } = req.params;

  try {
    const db = getPool();

    const [questions] = await db.query(`
      SELECT q.buyer_id, p.owner_id
      FROM property_questions q
      JOIN properties p ON q.property_id = p.id
      WHERE q.id = ?
    `, [id]);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const question = questions[0];
    const canDelete = req.user.role === 'admin' ||
      req.user.role === 'agent' ||
      Number(req.user.id) === Number(question.owner_id) ||
      Number(req.user.id) === Number(question.buyer_id);

    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied. You cannot delete this question.' });
    }

    await db.query('DELETE FROM property_questions WHERE id = ?', [id]);
    return res.json({ message: 'Question deleted successfully.' });
  } catch (error) {
    console.error('Delete Question Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

module.exports = {
  getPropertyQuestions,
  createQuestion,
  answerQuestion,
  deleteQuestion
};
