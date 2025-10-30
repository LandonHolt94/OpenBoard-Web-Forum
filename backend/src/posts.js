console.log("--- src/posts.js file was loaded at: " + new Date().toLocaleTimeString() + " ---");

// src/posts.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json([]);
});


router.post('/', (req, res) => {
    const { title, body } = req.body;

    // Simple validation
    if (!title || !body) {
        return res.status(400).json({ error: "Title and body are required" });
    }

    // --- DATABASE LOGIC GOES HERE ---
    // Right now, we'll just pretend we created it
    // and send back what the user gave us.
    console.log('Creating a new post...');
    const newPost = {
        id: Date.now(), // Use a timestamp as a temporary unique ID
        title: title,
        body: body
    };

    // Send 201 "Created" and the new post object
    res.status(201).json(newPost);
});

// --- NEW ROUTE ---
// router.get('/:id', ...)
// This will match requests like GET /api/posts/1 or GET /api/posts/abc
router.get('/:id', (req, res) => {
    // We can access the ':id' part of the URL from req.params.id
    const postId = req.params.id;

    // --- DATABASE LOGIC GOES HERE ---
    // You would search your database for a post with this ID.
    // We will just mock this for now.

    console.log(`Searching for post with ID: ${postId}`);

    // Let's pretend we found a post
    const mockPost = {
        id: postId,
        title: "A specific post",
        body: "This is the body of the post you requested."
    };

    // You also need to handle the case where the post isn't found
    if (postId === "404") { // Just as an example to test "not found"
        return res.status(404).json({ error: "Post not found" });
    }

    // If found, send it back
    res.json(mockPost);
});


// --- NEW ROUTE (UPDATE) ---
// router.put('/:id', ...)
// This will match requests like PUT /api/posts/123
router.put('/:id', (req, res) => {
    // Get the ID from the URL
    const postId = req.params.id;
    // Get the new data from the request body
    const { title, body } = req.body;

    console.log(`Updating post with ID: ${postId}`);

    // Validation
    if (!title || !body) {
        return res.status(400).json({ error: "Title and body are required for update" });
    }

    // --- DATABASE LOGIC GOES HERE ---
    // You would find the post by 'postId' and update its fields.

    
    const updatedPost = {
        id: postId,
        title: title, // The new title from the request body
        body: body   // The new body from the request body
    };

    // Send back the updated post
    res.json(updatedPost);
});

module.exports = router;

