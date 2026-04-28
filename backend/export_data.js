const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function exportData() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'svkm_hostel_db'
        });

        let sqlOutput = '';

        // 1. Export Users (Students)
        const [users] = await connection.execute('SELECT * FROM users WHERE role = "Student"');
        if (users.length > 0) {
            sqlOutput += '-- INSERT Users (Students)\n';
            users.forEach(u => {
                const hostelId = u.hostel_id !== null ? u.hostel_id : 'NULL';
                sqlOutput += `INSERT IGNORE INTO users (id, name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (${u.id}, ${connection.escape(u.name)}, ${connection.escape(u.email)}, ${connection.escape(u.password)}, ${connection.escape(u.role)}, ${connection.escape(u.course)}, ${connection.escape(u.gender)}, ${u.year_of_study}, ${hostelId});\n`;
            });
            sqlOutput += '\n';
        }

        // 2. Export Rooms
        const [rooms] = await connection.execute('SELECT * FROM rooms');
        if (rooms.length > 0) {
            sqlOutput += '-- INSERT Rooms\n';
            rooms.forEach(r => {
                sqlOutput += `INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (${r.id}, ${r.hostel_id}, ${connection.escape(r.room_number)}, ${r.capacity}, ${r.occupied_seats}, ${connection.escape(r.status)});\n`;
            });
            sqlOutput += '\n';
        }

        // 3. Export Room Bookings
        const [bookings] = await connection.execute('SELECT * FROM room_bookings');
        if (bookings.length > 0) {
            sqlOutput += '-- INSERT Room Bookings\n';
            bookings.forEach(b => {
                sqlOutput += `INSERT IGNORE INTO room_bookings (id, student_id, room_id, status) VALUES (${b.id}, ${b.student_id}, ${b.room_id}, ${connection.escape(b.status)});\n`;
            });
            sqlOutput += '\n';
        }

        fs.writeFileSync(path.join(__dirname, 'room_occupancy_export.sql'), sqlOutput);
        console.log('SQL Export successful: room_occupancy_export.sql');
        
        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

exportData();
