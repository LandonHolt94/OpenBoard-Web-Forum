// src/routes/survey.routes.js
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth'); // We need this!

const router = express.Router();

// POST /api/survey
// We use 'requireAuth' to make sure only logged-in users can submit the survey
router.post('/', requireAuth, async (req, res) => {
    // 'req.user' is added by the 'requireAuth' middleware
    // It contains { userId, username, ... }
    const userId = req.user.userId;

    // Get the survey answer from the request body
    // (We'll make sure main.js sends it in this format)
    const { referral } = req.body;

    if (!referral) {
        return res.status(400).json({ error: 'Survey response is required' });
    }

    try {
        // Insert the response into the new table
        await db.query(
            'INSERT INTO SurveyResponses (UserID, ResponseData) VALUES (?, ?)',
            [userId, referral]
        );

        res.status(201).json({ message: 'Survey response saved successfully!' });

    } catch (err) {
        console.error('Error saving survey response:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;