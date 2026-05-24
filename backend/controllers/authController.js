const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

// Register a new user
async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  const validRoles = ['buyer', 'seller', 'agent', 'admin'];
  const userRole = role && validRoles.includes(role) ? role : 'buyer';

  try {
    const db = getPool();

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, name, email, role: userRole },
      process.env.JWT_SECRET || 'supersecuresecretkeyrealestate123',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: userId, name, email, role: userRole }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Login user
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  try {
    const db = getPool();

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'supersecuresecretkeyrealestate123',
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Get user profile
async function getProfile(req, res) {
  try {
    const db = getPool();
    const [users] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(users[0]);
  } catch (error) {
    console.error('Profile Get Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

module.exports = {
  register,
  login,
  getProfile
};
