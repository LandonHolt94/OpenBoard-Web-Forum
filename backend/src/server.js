require('dotenv').config(); // Load environment variables FIRST
const express = require('express');
const db = require('./db'); // Your promise-based db.js

// --- Create App ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Global Middleware ---
app.use(express.json()); // Parse JSON bodies

// --- Import Routes ---
// We tell Node to look for your route files
const authRoutes = require('./routes/auth.routes');
const postsRoutes = require('./routes/posts.routes');

// --- Mount Routes ---
// All auth routes will be prefixed with /api/auth
// (e.g., /api/auth/register, /api/auth/login)
app.use('/api/auth', authRoutes);

// All post routes will be prefixed with /api/posts
app.use('/api/posts', postsRoutes);

// --- Test & Health Routes ---
app.get('/api', (req, res) => {
    res.send('Hello from the Open Web Board API!');
});

app.get('/health', (req, res) => {
    const version = process.env.APP_VERSION || 'dev';
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        version,
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});