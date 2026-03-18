const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {};

        // Total Students
        const [students] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "Student"');
        stats.totalStudents = students[0].count;

        // Total Hostels
        const [hostels] = await db.execute('SELECT COUNT(*) as count FROM hostels');
        stats.totalHostels = hostels[0].count;

        // Total Rooms
        const [rooms] = await db.execute('SELECT COUNT(*) as count FROM rooms');
        stats.totalRooms = rooms[0].count;

        // Active Complaints
        const [complaints] = await db.execute('SELECT COUNT(*) as count FROM complaints WHERE status != "Resolved"');
        stats.activeComplaints = complaints[0].count;

        // Pending Bookings
        const [bookings] = await db.execute('SELECT COUNT(*) as count FROM room_bookings WHERE status = "Pending"');
        stats.pendingBookings = bookings[0].count;

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
