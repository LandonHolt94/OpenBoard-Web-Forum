require('dotenv').config(); // Load environment variables
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db'); // Your promise-based db.js

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ----------------------
// TEST ROUTE
// ----------------------
app.get('/', (req, res) => {
  res.send('Hello from the Open Web Board!');
});

// ----------------------
// REGISTER ROUTE
// ----------------------
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    // Check if username or email already exists
    const [existing] = await db.query(
      'SELECT * FROM users WHERE Username = ? OR Email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const sql = 'INSERT INTO users (Username, Email, PasswordHash) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [username, email, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------
// LOGIN ROUTE
// ----------------------
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE Email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.UserID, username: user.Username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------
// POSTS ROUTE
// ----------------------
const postsRouter = require('./posts'); // adjust if in ./routes/posts
app.use('/', postsRouter); // Gives /posts route

const authRoutes = require('./auth-routes');
app.use(express.json());       // ensure body parsing
app.use('/auth', authRoutes);  // mount auth endpoints

// ----------------------
// START SERVER
// ----------------------

// --- Health check ---
app.get('/health', (req, res) => {
  let version = process.env.APP_VERSION || 'dev';
  try {
    // if your repo root has package.json, this will work:
    const pkg = require('../../package.json');
    if (pkg?.version) version = pkg.version;
  } catch (_) {
    // ignore; fall back to env/dev
  }

  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    version,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
