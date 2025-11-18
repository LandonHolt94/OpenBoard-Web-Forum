// src/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

function sign(user) {
    //
    // --- FIX: Use UPPERCASE 'Username' to match your database ---
    //
    const payload = { userId: user.UserID, username: user.Username, role: user.Role || 'user' };
    const secret = process.env.JWT_SECRET || 'dev_secret_only_replace_this_in_production';

    return jwt.sign(payload, secret, { expiresIn: '2h' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body || {};
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        //
        // --- FIX: Use UPPERCASE 'Username' to match your database ---
        //
        const [existing] = await db.query('SELECT 1 FROM users WHERE Username=? OR Email=? LIMIT 1', [username, email]);
        if (existing.length) {
            return res.status(409).json({ error: 'Username or email already in use' });
        }

        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        //
        // --- FIX: Use UPPERCASE 'Username' to match your database ---
        //
        const [result] = await db.query(
            'INSERT INTO users (Username, Email, PasswordHash) VALUES (?, ?, ?)',
            [username, email, hash]
        );

        //
        // --- FIX: Use UPPERCASE 'Username' to match your database ---
        //
        const user = { UserID: result.insertId, Username: username, Role: 'user' };

        const token = sign(user);
        return res.status(201).json({ message: 'User registered successfully', token: token });

    } catch (err) {
        console.error('Error during registration:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE Email=? LIMIT 1', [email]);
        if (!rows.length) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0]; // This 'user' object has 'user.Username' (UPPERCASE)

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // This will now work, because sign() expects 'user.Username' (UPPERCASE)
        const token = sign(user);
        return res.json({ message: 'Login successful', token: token });

    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// GET /api/auth/me (protected)
router.get('/me', requireAuth, async (req, res) => {
    res.json(req.user);
});


module.exports = router;