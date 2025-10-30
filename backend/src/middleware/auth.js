// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
 

    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) {
            return res.status(401).json({ error: 'Missing token' });
        }

        // Use the same logic for the secret as in your auth routes
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not set for middleware!');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const payload = jwt.verify(token, secret);
        req.user = payload; // Attach user payload (e.g., { userId, username }) to the request
        next(); // User is authenticated, proceed to the route
    } catch (err) {
        // This will catch expired tokens or invalid signatures
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Export under multiple names
module.exports = {
    requireAuth,
    authenticateToken: requireAuth,
    authMiddleware: requireAuth,
    // The stray 'd' character has been removed from here
};
