// src/routes/posts.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth'); // For protecting routes

// GET /api/posts
// Get all posts (this is a public route)
router.get('/', async (req, res) => {
    try {
        // We join with 'users' to get the Username
        const [posts] = await db.query(
            `SELECT p.PostID, p.Title, p.Body, p.CreatedAt, u.Username 
        FROM posts p
        JOIN users u ON p.UserID = u.UserID
        WHERE p.HidePost = 0
        ORDER BY p.CreatedAt DESC`
        );
        res.json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Server error fetching posts' });
    }
});

// GET /api/posts/:id
// Get a single post by its ID (also public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            `SELECT p.PostID, p.Title, p.Body, p.CreatedAt, u.Username 
        FROM posts p
        JOIN users u ON p.UserID = u.UserID
        WHERE p.PostID = ? AND p.HidePost = 0`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching single post:', err);
        res.status(500).json({ error: 'Server error fetching post' });
    }
});


// POST /api/posts
// Create a new post (this MUST be a protected route)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, body } = req.body;
        // req.user.userId comes from your requireAuth middleware
        const { userId } = req.user;

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        const [result] = await db.query(
            'INSERT INTO posts (UserID, Title, Body) VALUES (?, ?, ?)',
            [userId, title, body]
        );

        res.status(201).json({
            message: 'Post created',
            postId: result.insertId,
            title: title,
            body: body,
            userId: userId
        });

    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Server error creating post' });
    }
});

// PUT /api/posts/:id
// Update a post (this MUST be a protected route)
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params; // The PostID from the URL
        const { title, body } = req.body; // The new data
        const { userId } = req.user; // The user from the token

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        // This is the important part:
        // We update the post *only if* the PostID matches AND the UserID matches.
        // This prevents one user from editing another user's post.
        const [result] = await db.query(
            `UPDATE posts 
             SET Title = ?, Body = ? 
             WHERE PostID = ? AND UserID = ?`,
            [title, body, id, userId]
        );

        // Check if any rows were actually changed
        if (result.affectedRows === 0) {
            // This can mean two things:
            // 1. The post with that ID doesn't exist.
            // 2. The post exists, but it belongs to a different user.
            // For security, we don't tell them which one.
            return res.status(404).json({ error: 'Post not found or you do not have permission to edit it.' });
        }

        res.json({
            message: 'Post updated successfully',
            postId: id,
            title: title,
            body: body
        });

    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Server error updating post' });
    }
});

// --- THIS IS THE NEW CODE BLOCK ---
// DELETE /api/posts/:id
// Delete a post (this MUST be a protected route)
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params; // The PostID from the URL
        const { userId } = req.user; // The user from the token

        // We delete the post *only if* the PostID matches AND the UserID matches.
        // This prevents one user from deleting another user's post.
        const [result] = await db.query(
            `DELETE FROM posts 
             WHERE PostID = ? AND UserID = ?`,
            [id, userId]
        );

        // Check if any rows were actually deleted
        if (result.affectedRows === 0) {
            // This can mean two things:
            // 1. The post with that ID doesn't exist.
            // 2. The post exists, but it belongs to a different user.
            return res.status(404).json({ error: 'Post not found or you do not have permission to delete it.' });
        }

        res.json({ message: 'Post deleted successfully' });

    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Server error deleting post' });
    }
});


// This line is the most important! It exports the router as a function.
module.exports = router;