const bcrypt = require('bcrypt');
const db = require('./config/db');

async function forceInsert() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('student123', salt);
        
        await db.execute(
            "INSERT IGNORE INTO users (name, email, password, role, course, gender, year_of_study, hostel_id) VALUES ('SQL Import Test Student', 'sql.test@nmims.edu', ?, 'Student', 'B.Tech CE', 'Male', 1, NULL)",
            [hash]
        );
        console.log('Successfully inserted sql.test@nmims.edu');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
forceInsert();
