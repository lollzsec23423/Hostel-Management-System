const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        // Check current state
        const [schema] = await pool.query('DESCRIBE room_bookings');
        console.log('Schema:', schema.map(c => c.Field + ' (' + c.Type + ')').join(', '));

        const [current] = await pool.query('SELECT status, COUNT(*) as count FROM room_bookings GROUP BY status');
        console.log('Current counts:', current);

        // Get available students and rooms
        const [students] = await pool.query('SELECT id FROM users WHERE role = "Student"');
        const [rooms] = await pool.query('SELECT id, hostel_id FROM rooms');

        if (students.length === 0 || rooms.length === 0) {
            console.log('No students or rooms found.');
            process.exit(0);
        }

        // Insert Pending bookings
        for (let i = 0; i < 8; i++) {
            const student = students[Math.floor(Math.random() * students.length)];
            const room = rooms[Math.floor(Math.random() * rooms.length)];
            const daysAgo = Math.floor(Math.random() * 14) + 1;
            const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

            await pool.query(
                'INSERT INTO room_bookings (student_id, room_id, status, created_at) VALUES (?, ?, ?, ?)',
                [student.id, room.id, 'Pending', date]
            );
        }
        console.log('Inserted 8 Pending bookings.');

        // Insert Rejected bookings
        for (let i = 0; i < 5; i++) {
            const student = students[Math.floor(Math.random() * students.length)];
            const room = rooms[Math.floor(Math.random() * rooms.length)];
            const daysAgo = Math.floor(Math.random() * 30) + 5;
            const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

            await pool.query(
                'INSERT INTO room_bookings (student_id, room_id, status, created_at) VALUES (?, ?, ?, ?)',
                [student.id, room.id, 'Rejected', date]
            );
        }
        console.log('Inserted 5 Rejected bookings.');

        // Final counts
        const [final] = await pool.query('SELECT status, COUNT(*) as count FROM room_bookings GROUP BY status');
        console.log('Final counts:', final);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

run();
