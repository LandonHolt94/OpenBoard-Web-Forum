const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('DB connect → host:', process.env.DB_HOST, 'port:', process.env.DB_PORT, 'user:', process.env.DB_USER, 'db:', process.env.DB_NAME);


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

module.exports = pool;
