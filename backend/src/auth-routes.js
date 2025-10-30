// src/auth-routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db'); // uses your existing db pool/connection
const { requireAuth } = require('./middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

function sign(user) {
  const payload = { userId: user.UserID, username: user.Username, role: user.Role || 'user' };
  const secret = process.env.JWT_SECRET || 'dev_secret_only';
  return jwt.sign(payload, secret, { expiresIn: '2h' });
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required' });
    }

    // unique checks
    const [u1] = await db.query('SELECT 1 FROM users WHERE Username=? OR Email=? LIMIT 1', [username, email]);
    if (u1.length) return res.status(409).json({ error: 'Username or email already in use' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await db.query(
      'INSERT INTO users (Username, Email, PasswordHash) VALUES (?, ?, ?)',
      [username, email, hash]
    );

    const user = { UserID: result.insertId, Username: username, Role: 'user' };
    const token = sign(user);
    return res.status(201).json({ message: 'registered', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const [rows] = await db.query('SELECT * FROM users WHERE Email=? LIMIT 1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.PasswordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = sign(user);
    return res.json({ message: 'logged_in', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// GET /auth/me (protected)
router.get('/me', requireAuth, async (req, res) => {
  // req.user is set by middleware/auth.js
  res.json({ user: req.user });
});

module.exports = router;
