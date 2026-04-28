const mysql = require('mysql2/promise');
require('dotenv').config();

const items = ['Ceiling Fan', 'Study Light', 'Bathroom Sink', 'Shower Head', 'Door Lock', 'Bed Frame', 'Cupboard Hinge', 'Window Latch', 'AC Unit'];
const descriptions = [
    'Not working properly, makes noise',
    'Completely broken since yesterday',
    'Needs replacement urgently',
    'Leaking water constantly',
    'Key is getting stuck',
    'Loose fitting, needs tightening'
];
const statuses = ['Pending', 'In Progress', 'Resolved'];

async function run() {
    const pool = mysql.createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,database:process.env.DB_NAME,port:process.env.DB_PORT||3306});
    try {
        const [students] = await pool.query('SELECT id FROM users WHERE role="Student"');
        if (students.length === 0) return console.log('No students found.');

        for (let i = 0; i < 25; i++) {
            const student = students[Math.floor(Math.random() * students.length)];
            const item = items[Math.floor(Math.random() * items.length)];
            const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Random date in past 2 years
            const date = new Date(Date.now() - Math.floor(Math.random() * 2 * 365 * 24 * 60 * 60 * 1000));
            
            await pool.query(`
                INSERT INTO maintenance_requests (student_id, item_to_fix, description, status, created_at)
                VALUES (?, ?, ?, ?, ?)
            `, [student.id, item, desc, status, date]);
        }
        console.log('Successfully injected 25 maintenance records.');
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
