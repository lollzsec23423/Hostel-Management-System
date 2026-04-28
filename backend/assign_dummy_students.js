const db = require('./config/db');

async function assignStudents() {
    console.log("Starting to assign unassigned students to rooms...");

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get all students without a hostel
        const [students] = await connection.execute("SELECT id, name, gender, year_of_study FROM users WHERE role = 'Student' AND hostel_id IS NULL");
        console.log(`Found ${students.length} students to assign.`);

        if (students.length === 0) {
            console.log("No students need assignment.");
            process.exit(0);
        }

        let assignedCount = 0;

        for (const student of students) {
            // Determine the target hostel
            let targetHostelId = 0;
            if (student.gender === 'Female') {
                targetHostelId = 3; // Girls Hostel
            } else {
                if (student.year_of_study === 1) {
                    targetHostelId = 1; // First Year Boys
                } else {
                    targetHostelId = 2; // Senior Boys
                }
            }

            // 2. Find an available room in this hostel
            let [rooms] = await connection.execute(
                "SELECT id, room_number, capacity, occupied_seats, status FROM rooms WHERE hostel_id = ? AND status != 'Full' AND occupied_seats < capacity LIMIT 1 FOR UPDATE",
                [targetHostelId]
            );

            let room;

            if (rooms.length === 0) {
                // 3. Create a new room if all are full
                const [allRooms] = await connection.execute(
                    "SELECT room_number FROM rooms WHERE hostel_id = ? ORDER BY CAST(room_number AS UNSIGNED) DESC LIMIT 1",
                    [targetHostelId]
                );
                
                let nextRoomNum = targetHostelId * 100 + 1; // default '101', '201', '301'
                if (allRooms.length > 0) {
                    const highestNum = parseInt(allRooms[0].room_number, 10);
                    if (!isNaN(highestNum)) {
                        nextRoomNum = highestNum + 1;
                    }
                }
                const newRoomStr = String(nextRoomNum);
                
                const [insertRoom] = await connection.execute(
                    "INSERT INTO rooms (hostel_id, room_number, capacity, occupied_seats, status) VALUES (?, ?, 2, 0, 'Available')",
                    [targetHostelId, newRoomStr]
                );
                console.log(`Created new room ${newRoomStr} for hostel ${targetHostelId}`);
                
                room = {
                    id: insertRoom.insertId,
                    room_number: newRoomStr,
                    capacity: 2,
                    occupied_seats: 0
                };
            } else {
                room = rooms[0];
            }

            // 4. Update the room occupancy
            const newOccupied = room.occupied_seats + 1;
            const newStatus = (newOccupied >= room.capacity) ? 'Full' : 'Available';

            await connection.execute(
                "UPDATE rooms SET occupied_seats = ?, status = ? WHERE id = ?",
                [newOccupied, newStatus, room.id]
            );

            // 5. Create the booking as 'Approved'
            await connection.execute(
                "INSERT IGNORE INTO room_bookings (student_id, room_id, status) VALUES (?, ?, 'Approved')",
                [student.id, room.id]
            );

            // 6. Update user's hostel_id
            await connection.execute(
                "UPDATE users SET hostel_id = ? WHERE id = ?",
                [targetHostelId, student.id]
            );

            assignedCount++;
        }

        await connection.commit();
        console.log(`Successfully assigned ${assignedCount} students to rooms.`);

    } catch (err) {
        await connection.rollback();
        console.error("Error during allocation:", err.message);
    } finally {
        connection.release();
        process.exit(0);
    }
}

assignStudents();
