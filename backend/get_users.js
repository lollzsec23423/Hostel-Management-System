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
        console.log(JSON.stringify(rows, null, 2));

        await conn.end();
    } catch (err) {
        console.error("Failed", err);
    }
}

run();
