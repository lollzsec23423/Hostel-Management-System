const mysql = require('mysql2/promise');

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'svkm_hostel_db'
        });

        console.log("Connected to DB");

        await conn.execute('INSERT IGNORE INTO users (name, email, password, role, course, hostel_id) VALUES (?, ?, ?, ?, ?, ?)', ['Warden User', 'warden@nmims.edu', '$2b$10$UnKiqyZdzX0i3zpDWXgBaeplamMQ9CNGwBjDA2ZDcCbJa25vKBcGC', 'Warden', 'None', 1]);
        await conn.execute('INSERT IGNORE INTO users (name, email, password, role, course, hostel_id) VALUES (?, ?, ?, ?, ?, ?)', ['Mess Owner', 'mess@nmims.edu', '$2b$10$ydxl6I4YOpHma1okuWc91OxX/8v5rtd2iKWedy9SptCYH.lb8ik.W', 'Mess Owner', 'None', null]);

        console.log("Inserted dummy roles into live DB");
        await conn.end();
    } catch (err) {
        console.error("Migration failed", err);
    }
}

run();
