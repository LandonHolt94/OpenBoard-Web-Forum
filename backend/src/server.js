// In app.js or server.js

// src/server.js added for our express serve, once ran it will show local host in terminal
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// A simple test route to make sure everything is working
app.get('/', (req, res) => {
    res.send('Hello from the Open Web Board!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Import the database connection
const db = require('./db');

// An example function to add a new user
async function registerUser(username, email, password) {
    try {
        // IMPORTANT: In a real app, you MUST hash the password first!
        // This is just a simple example.
        const sql = 'INSERT INTO users (Username, Email, PasswordHash) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [username, email, password]);

        console.log(`User '${username}' was created with ID: ${result.insertId}`);
        return result;
    } catch (error) {
        console.error('Error registering user:', error);
    }
}

// Call the function to test itcb
//registerUser('testuser', 'test@example.com', 'fakepassword123');

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});