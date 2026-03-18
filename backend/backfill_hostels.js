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

        // Find all users who have an approved room booking and update their hostel_id
        const query = `
            SELECT u.id as user_id, u.name, r.hostel_id 
            FROM users u
            JOIN room_bookings b ON u.id = b.student_id
            JOIN rooms r ON b.room_id = r.id
            WHERE b.status = 'Approved' AND u.hostel_id IS NULL
        `;

        const [usersToUpdate] = await conn.execute(query);
        console.log(`Found ${usersToUpdate.length} students missing a hostel_id despite having an approved room.`);

        for (const user of usersToUpdate) {
            await conn.execute('UPDATE users SET hostel_id = ? WHERE id = ?', [user.hostel_id, user.user_id]);
            console.log(`Updated Student ${user.name} (ID: ${user.user_id}) to Hostel ID ${user.hostel_id}`);
        }

        await conn.end();
        console.log("Backfill complete.");
    } catch (err) {
        console.error("Migration failed", err);
    }
}

run();
