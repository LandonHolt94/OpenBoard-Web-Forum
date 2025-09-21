// In app.js or server.js

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
registerUser('testuser', 'test@example.com', 'fakepassword123');