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

        const createOutingsTable = `
            CREATE TABLE IF NOT EXISTS outings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                destination VARCHAR(255) NOT NULL,
                reason TEXT NOT NULL,
                departure_date DATETIME NOT NULL,
                return_date DATETIME NOT NULL,
                status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        await conn.execute(createOutingsTable);
        console.log("Created 'outings' table successfully.");

        await conn.end();
        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration failed", err);
    }
}

run();
