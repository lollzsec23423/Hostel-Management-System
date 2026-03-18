const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'svkm_hostel_db'
        });

        const [rows] = await conn.execute("SELECT id, name, email, role, course, hostel_id FROM users");
        fs.writeFileSync('users_output2.txt', JSON.stringify(rows, null, 2), 'utf8');

        await conn.end();
    } catch (err) {
        console.error("Failed", err);
    }
}

run();
