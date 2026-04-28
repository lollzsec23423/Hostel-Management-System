require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log("Running migrations...");
        
        // Add contact_number
        try {
            await db.execute("ALTER TABLE users ADD COLUMN contact_number VARCHAR(15) DEFAULT NULL AFTER name");
            console.log("Added contact_number to users.");
        } catch(e) { console.log("contact_number already exists or error:", e.message); }

        // Create disciplinary_cases
        await db.execute(`
            CREATE TABLE IF NOT EXISTS disciplinary_cases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                reason TEXT NOT NULL,
                action_taken ENUM('Warning', 'Fine', 'Suspension', 'YB') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Created disciplinary_cases.");

        // Create property_damages
        await db.execute(`
            CREATE TABLE IF NOT EXISTS property_damages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                item_damaged VARCHAR(150) NOT NULL,
                damage_cost DECIMAL(10, 2) NOT NULL,
                status ENUM('Pending', 'Paid') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Created property_damages.");

        console.log("Migrations applied successfully.");
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
migrate();
