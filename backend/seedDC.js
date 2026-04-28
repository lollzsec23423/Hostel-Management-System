require('dotenv').config();
const db = require('./config/db');

async function verify() {
    try {
        console.log("Verifying Database Insertion & Fetch...");
        
        // Find a random student
        const [users] = await db.execute('SELECT id FROM users WHERE role="Student" LIMIT 1');
        if (users.length === 0) {
            console.log("No students found. Skipping verification insert.");
            process.exit(0);
        }
        const studentId = users[0].id;
        
        // Insert dummy DC
        await db.execute(
            'INSERT INTO disciplinary_cases (student_id, reason, action_taken) VALUES (?, ?, ?)',
            [studentId, 'Failed to attend mandatory meeting.', 'YB']
        );
        console.log("Inserted Dummy YB Disciplinary Case.");

        // Insert dummy Damage
        await db.execute(
            'INSERT INTO property_damages (student_id, item_damaged, damage_cost, status) VALUES (?, ?, ?, ?)',
            [studentId, 'Broken Fan Regulator', 750.00, 'Pending']
        );
        console.log("Inserted Dummy Property Damage (750.00).");

        // Verify Dashboard Stats
        const [dcCount] = await db.execute('SELECT COUNT(*) as c FROM disciplinary_cases');
        const [damageCost] = await db.execute('SELECT SUM(damage_cost) as s FROM property_damages');
        
        console.log(`Current Total DC Cases: ${dcCount[0].c}`);
        console.log(`Current Total Damage Fines pending: ${damageCost[0].s}`);

        console.log("Verification Success.");
        process.exit(0);
    } catch(err) {
        console.error("Verification Failed:", err);
        process.exit(1);
    }
}
verify();
