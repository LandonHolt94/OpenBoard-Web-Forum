const mysql = require('mysql2');

// Create a connection pool with your real credentials
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',         // your MySQL username
    password: 'password', // your MySQL password
    database: 'openboard_db', // your actual database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the pool
module.exports = pool.promise();