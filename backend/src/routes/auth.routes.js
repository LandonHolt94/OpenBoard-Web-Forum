// src/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Correct path: '../' goes up one folder from 'routes' to 'src', then finds 'db.js'
const { requireAuth } = require('../middleware/auth'); 

const router = express.Router();
const SALT_ROUNDS = 10;

/**
 * Creates a JWT token for a user
 * @param {object} user - The user object from the database (e.g., { UserID, Username, Role })
 * @returns {string} A signed JWT
 */
function sign(user) {
    const payload = { userId: user.UserID, username: user.Username, role: user.Role || 'user' };
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error('JWT_SECRET is not set! Using default, which is insecure.');
    }

    // Use a default secret for development ONLY if JWT_SECRET is not in .env
    const effectiveSecret = secret || 'dev_secret_only_replace_this_in_production';

    return jwt.sign(payload, effectiveSecret, { expiresIn: '2h' }); // Good practice to have an expiry
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body || {};
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if user already exists
        const [existing] = await db.query('SELECT 1 FROM users WHERE Username=? OR Email=? LIMIT 1', [username, email]);
        if (existing.length) {
            return res.status(409).json({ error: 'Username or email already in use' });
        }

        // Hash password
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (Username, Email, PasswordHash) VALUES (?, ?, ?)',
            [username, email, hash]
        );

        // Create a user object to sign the token, matching your database schema
        const user = { UserID: result.insertId, Username: username, Role: 'user' };

        // Create and return the token
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

        // Find user by email
        const [rows] = await db.query('SELECT * FROM users WHERE Email=? LIMIT 1', [email]);
        if (!rows.length) {
            // Use a generic error message for security
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            // Use a generic error message for security
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Passwords match, create and return token
        const token = sign(user);
        return res.json({ message: 'Login successful', token: token });

    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// GET /api/auth/me (protected)

router.get('/me', requireAuth, async (req, res) => {
  // req.user will be set by your auth middleware
  res.json({ user: req.user });
});


module.exports = router;
