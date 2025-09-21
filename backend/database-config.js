// In db.js

const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
	host: 'localhost',      // Your database host (usually 'localhost')
	user: 'your_username',  // Your MySQL username
	password: 'your_password',// Your MySQL password
	database: 'openboard_db', // The name of your forum's database
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

// Export the pool with a promise-based interface
module.exports = pool.promise();