require('dotenv').config();
const db = require('./config/db');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Format date for MySQL DATETIME
function formatDatetime(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) {
        return new Date().toISOString().slice(0, 19).replace('T', ' '); // fallback
    }
    // Adjust for local timezone offset when generating the ISO string if necessary, 
    // but the simplest is just using it as UTC string and hoping DB handles it,
    // or manually building the string:
    const pad = (n) => n.toString().padStart(2, '0');
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
}

async function spreadDates() {
    console.log("Starting to spread dates over the last 2 years...");
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Get all students
        const [students] = await connection.execute("SELECT id FROM users WHERE role = 'Student'");
        
        const now = new Date();
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(now.getFullYear() - 2);
        const twoYearsMs = now.getTime() - twoYearsAgo.getTime();
        
        for (const student of students) {
            // Random created_at for user between now and 2 years ago
            const userCreatedMs = twoYearsAgo.getTime() + Math.random() * twoYearsMs;
            const userCreatedAt = new Date(userCreatedMs);
            
            await connection.execute("UPDATE users SET created_at = ? WHERE id = ?", [formatDatetime(userCreatedAt), student.id]);
            
            // Randomize complaints if any
            const [complaints] = await connection.execute("SELECT id FROM complaints WHERE student_id = ? FOR UPDATE", [student.id]);
            for (const comp of complaints) {
                const compCreatedMs = userCreatedMs + Math.random() * (now.getTime() - userCreatedMs);
                await connection.execute("UPDATE complaints SET created_at = ? WHERE id = ?", [formatDatetime(new Date(compCreatedMs)), comp.id]);
            }
            
            // Randomize outings if any
            const [outings] = await connection.execute("SELECT id FROM outings WHERE student_id = ? FOR UPDATE", [student.id]);
            for (const out of outings) {
                const outCreatedMs = userCreatedMs + Math.random() * (now.getTime() - userCreatedMs);
                const outCreatedAt = new Date(outCreatedMs);
                
                const departureDate = new Date(outCreatedAt.getTime() + getRandomInt(1, 5) * 86400000); // 1-5 days after creation
                const returnDate = new Date(departureDate.getTime() + getRandomInt(1, 4) * 86400000);   // 1-4 days after departure
                
                await connection.execute("UPDATE outings SET created_at = ?, departure_date = ?, return_date = ? WHERE id = ?", [formatDatetime(outCreatedAt), formatDatetime(departureDate), formatDatetime(returnDate), out.id]);
            }
            
            // Randomize room_bookings if any
            const [bookings] = await connection.execute("SELECT id FROM room_bookings WHERE student_id = ? FOR UPDATE", [student.id]);
            for (const book of bookings) {
                // Bookings usually happen soon after user creation
                const bookCreatedMs = userCreatedMs + Math.random() * (30 * 86400000); // within 30 days
                // Cap to now
                const safeBookTime = Math.min(bookCreatedMs, now.getTime());
                await connection.execute("UPDATE room_bookings SET created_at = ? WHERE id = ?", [formatDatetime(new Date(safeBookTime)), book.id]);
            }
        }
        
        await connection.commit();
        console.log(`Successfully updated dates for ${students.length} students and their associated records.`);
    } catch(err) {
        await connection.rollback();
        console.error("Failed to update dates:", err);
    } finally {
        connection.release();
        process.exit(0);
    }
}

spreadDates();
