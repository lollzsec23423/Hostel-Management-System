require('dotenv').config();
const mysql = require('mysql2/promise');

async function createOutingsTable() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'svkm_hostel_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS outings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                destination VARCHAR(255) NOT NULL,
                reason TEXT NOT NULL,
                departure_date DATETIME NOT NULL,
                return_date DATETIME NOT NULL,
                status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        await pool.execute(createTableQuery);
        console.log('Outings table created or verified successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating outings table:', error);
        process.exit(1);
    }
}

createOutingsTable();
