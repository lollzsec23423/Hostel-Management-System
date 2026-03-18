const db = require('../config/db');

exports.getRoomsByHostel = async (req, res) => {
    const { hostelId } = req.params;
    try {
        const [rooms] = await db.execute('SELECT * FROM rooms WHERE hostel_id = ?', [hostelId]);
        res.json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllRooms = async (req, res) => {
    try {
        const [rooms] = await db.execute(`
            SELECT r.*, h.name as hostel_name 
            FROM rooms r 
            JOIN hostels h ON r.hostel_id = h.id
        `);
        res.json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createRoom = async (req, res) => {
    const { hostel_id, room_number, capacity } = req.body;

    if (!hostel_id || !room_number) return res.status(400).json({ error: 'Hostel ID and room number required' });

    try {
        const [result] = await db.execute(
            'INSERT INTO rooms (hostel_id, room_number, capacity, status) VALUES (?, ?, ?, ?)',
            [hostel_id, room_number, capacity || 2, 'Available']
        );
        res.status(201).json({ message: 'Room created', id: result.insertId });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Room number already exists in this hostel' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateRoom = async (req, res) => {
    const { id } = req.params;
    const { capacity, status } = req.body;

    try {
        await db.execute(
            'UPDATE rooms SET capacity = COALESCE(?, capacity), status = COALESCE(?, status) WHERE id = ?',
            [capacity, status, id]
        );
        res.json({ message: 'Room updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM rooms WHERE id = ?', [id]);
        res.json({ message: 'Room deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Bookings
exports.bookRoom = async (req, res) => {
    const student_id = req.user.id;
    const { room_id } = req.body;

    try {
        // Check if student already has a pending or approved booking
        const [existing] = await db.execute(
            'SELECT * FROM room_bookings WHERE student_id = ? AND status IN ("Pending", "Approved")',
            [student_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'You already have an active room booking' });
        }

        // Check room availability
        const [rooms] = await db.execute('SELECT * FROM rooms WHERE id = ?', [room_id]);
        if (rooms.length === 0) return res.status(404).json({ error: 'Room not found' });

        const room = rooms[0];
        if (room.occupied_seats >= room.capacity || room.status !== 'Available') {
            return res.status(400).json({ error: 'Room is full or unavailable' });
        }

        // Create booking request
        await db.execute(
            'INSERT INTO room_bookings (student_id, room_id, status) VALUES (?, ?, "Pending")',
            [student_id, room_id]
        );

        res.status(201).json({ message: 'Room booking request submitted successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getBookings = async (req, res) => {
    try {
        let query = `
            SELECT b.id, b.status, b.created_at, u.name as student_name, u.email, 
                   r.room_number, h.name as hostel_name
            FROM room_bookings b
            JOIN users u ON b.student_id = u.id
            JOIN rooms r ON b.room_id = r.id
            JOIN hostels h ON r.hostel_id = h.id
        `;
        const params = [];

        if (req.user.role === 'Warden') {
            query += ' WHERE h.id = ?';
            params.push(req.user.hostel_id);
        }

        query += ' ORDER BY b.created_at DESC';

        const [bookings] = await db.execute(query, params);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const query = `
            SELECT b.id, b.status, b.created_at, r.room_number, h.name as hostel_name, r.capacity, r.occupied_seats
            FROM room_bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN hostels h ON r.hostel_id = h.id
            WHERE b.student_id = ?
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await db.execute(query, [req.user.id]);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.approveBooking = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get booking and lock row for update
        const [bookings] = await connection.execute(
            'SELECT * FROM room_bookings WHERE id = ? FOR UPDATE',
            [id]
        );

        if (bookings.length === 0) throw new Error('Booking not found');
        const booking = bookings[0];

        // Check room
        const [rooms] = await connection.execute('SELECT * FROM rooms WHERE id = ? FOR UPDATE', [booking.room_id]);
        if (rooms.length === 0) throw new Error('Room not found');
        const room = rooms[0];

        // If user is a Warden, ensure room belongs to their hostel
        if (req.user.role === 'Warden' && room.hostel_id !== req.user.hostel_id) {
            throw new Error('Access denied. Room belongs to a different hostel.');
        }

        if (booking.status !== 'Pending') {
            throw new Error('Booking is already processed');
        }

        if (status === 'Approved') {
            if (room.occupied_seats >= room.capacity) {
                throw new Error('Room is already full');
            }

            // Update room occupancy
            const newOccupied = room.occupied_seats + 1;
            const newRoomStatus = newOccupied >= room.capacity ? 'Full' : 'Available';

            await connection.execute(
                'UPDATE rooms SET occupied_seats = ?, status = ? WHERE id = ?',
                [newOccupied, newRoomStatus, booking.room_id]
            );

            // Also update the student's assigned hostel in the users table
            await connection.execute(
                'UPDATE users SET hostel_id = ? WHERE id = ?',
                [room.hostel_id, booking.student_id]
            );
        }

        // Update booking status
        await connection.execute(
            'UPDATE room_bookings SET status = ? WHERE id = ?',
            [status, id]
        );

        await connection.commit();
        res.json({ message: `Booking ${status.toLowerCase()} successfully` });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(400).json({ error: err.message || 'Internal server error' });
    } finally {
        connection.release();
    }
};

exports.getWardenHostelOccupancy = async (req, res) => {
    try {
        const rawHostelId = req.user.hostel_id;
        console.log("Extracted hostel_id from token:", rawHostelId, typeof rawHostelId);

        const hostelId = parseInt(rawHostelId, 10);
        console.log("Parsed hostelId:", hostelId);

        if (!hostelId || isNaN(hostelId)) {
            return res.status(403).json({ error: "No valid hostel assigned to this warden" });
        }

        // Fetch all rooms for the hostel
        const [rooms] = await db.execute('SELECT * FROM rooms WHERE hostel_id = ? ORDER BY room_number ASC', [hostelId]);
        console.log(`Found ${rooms.length} rooms for hostel ${hostelId}`);

        // Fetch all approved occupants for those rooms
        const [occupants] = await db.execute(`
            SELECT b.room_id, u.id as student_id, u.name, u.email, u.course, u.year_of_study 
            FROM room_bookings b
            JOIN users u ON b.student_id = u.id
            WHERE b.status = 'Approved' AND b.room_id IN (SELECT id FROM rooms WHERE hostel_id = ?)
        `, [hostelId]);
        console.log(`Found ${occupants.length} occupants for hostel ${hostelId}`);

        // Map occupants to their respective rooms
        const roomsWithOccupants = rooms.map(room => {
            const roomOccupants = occupants.filter(o => o.room_id === room.id);
            return {
                ...room,
                occupants: roomOccupants
            };
        });

        res.json(roomsWithOccupants);

    } catch (err) {
        console.error("Occupancy Fetch Error:", err);
        res.status(500).json({ error: 'Internal server error while fetching occupancy' });
    }
};
