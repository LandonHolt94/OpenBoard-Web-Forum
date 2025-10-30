// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const secret = process.env.JWT_SECRET || 'dev_secret_only';
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Export under multiple names in case routes expect a different identifier
module.exports = {
  requireAuth,
  authenticateToken: requireAuth,
  authMiddleware: requireAuth,
};
