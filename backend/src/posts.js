console.log("--- src/posts.js file was loaded at: " + new Date().toLocaleTimeString() + " ---");

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json([]);
});

router.post('/', (req, res) => {
    const { title, body } = req.body;

    if (!title || !body) {
        return res.status(400).json({ error: "Title and body are required" });
    }

    console.log('Creating a new post...');

    // --- THIS OBJECT IS NOW FIXED ---
    const newPost = {
        id: Date.now(),
        Title: title,   // Changed from 'title'
        Content: body  // Changed from 'body'
    };

    res.status(201).json(newPost);
});

router.get('/:id', (req, res) => {
    const postId = req.params.id;
    console.log(`Searching for post with ID: ${postId}`);

    // --- THIS OBJECT IS ALSO FIXED ---
    const mockPost = {
        id: postId,
        Title: "A specific post", // Changed from 'title'
        Content: "This is the body of the post you requested." // Changed from 'body'
    };

    if (postId === "404") {
        return res.status(404).json({ error: "Post not found" });
    }
    res.json(mockPost);
});

router.put('/:id', (req, res) => {
    const postId = req.params.id;
    const { title, body } = req.body;

    console.log(`Updating post with ID: ${postId}`);

    if (!title || !body) {
        return res.status(400).json({ error: "Title and body are required for update" });
    }

    // --- AND THIS OBJECT IS FIXED ---
    const updatedPost = {
        id: postId,
        Title: title,   // Changed from 'title'
        Content: body  // Changed from 'body'
    };

    res.json(updatedPost);
});

module.exports = router;