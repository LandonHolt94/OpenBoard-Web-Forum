const db = require('./db');

async function testDBConnection() {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        console.log('✅ DB connected! Result:', rows);
    } catch (err) {
        console.error('❌ DB connection failed:', err);
    }
}

testDBConnection();