const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,database:process.env.DB_NAME,port:process.env.DB_PORT||3306});
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS maintenance_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                item_to_fix VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Maintenance table created');
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
