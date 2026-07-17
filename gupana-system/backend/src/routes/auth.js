const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { logActivity } = require('../config/helpers');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { user_id: user.user_id, role: user.role, email: user.email, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register  (clients self-register)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone_number, address } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'full_name, email and password are required.' });
    }

    const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (role, full_name, email, password_hash, phone_number, address)
       VALUES ('client', $1, $2, $3, $4, $5)
       RETURNING user_id, role, full_name, email, phone_number, address, created_at`,
      [full_name, email, hash, phone_number || null, address || null]
    );

    const user = rows[0];
    const token = signToken(user);
    await logActivity(user.user_id, 'Registered account', 'Auth');
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register.' });
  }
});

// POST /api/auth/login  (shared by clients and admins)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'This account is not active. Contact the administrator.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    delete user.password_hash;
    const token = signToken(user);
    await logActivity(user.user_id, 'Logged in', 'Auth');
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT user_id, role, full_name, email, phone_number, address, avatar_url, status, created_at
     FROM users WHERE user_id = $1`,
    [req.user.user_id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
  res.json(rows[0]);
});

module.exports = router;
