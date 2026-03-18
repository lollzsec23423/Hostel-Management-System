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

        await conn.execute("ALTER TABLE users MODIFY COLUMN role ENUM('Student', 'Admin', 'Warden', 'Mess Owner') DEFAULT 'Student'");
        console.log("Updated role ENUM");

        await conn.execute("ALTER TABLE users ADD COLUMN hostel_id INT DEFAULT NULL");
        console.log("Added hostel_id");

        await conn.execute("ALTER TABLE users ADD FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE SET NULL");
        console.log("Added foreign key");

        await conn.end();
        console.log("Migration complete");
    } catch (err) {
        console.error("Migration failed", err);
    }
}

run();
