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

        // Total DC Cases
        const [dcCases] = await db.execute('SELECT COUNT(*) as count FROM disciplinary_cases');
        stats.totalDCCases = dcCases[0].count;

        // Total YB Cases
        const [ybCases] = await db.execute('SELECT COUNT(*) as count FROM disciplinary_cases WHERE action_taken = "YB"');
        stats.totalYBCases = ybCases[0].count;

        // Pending Maintenance Requests
        const [maintenance] = await db.execute('SELECT COUNT(*) as count FROM maintenance_requests WHERE status = "Pending"');
        stats.pendingMaintenance = maintenance[0].count;

        // Total Damage Fines
        const [damages] = await db.execute('SELECT SUM(damage_cost) as total FROM property_damages');
        stats.totalDamageFines = damages[0].total || 0;

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.exportDatabase = async (req, res) => {
    try {
        let sqlDump = `-- Admin System Database Export\n-- Generated on: ${new Date().toISOString()}\n\n`;

        async function exportTable(tableName) {
            const [rows] = await db.query(`SELECT * FROM ${tableName}`);
            if (rows.length === 0) return '';
            
            let inserts = `-- Table: ${tableName}\n`;
            for (const row of rows) {
                const ks = Object.keys(row);
                const vs = Object.values(row).map(v => {
                    if (v === null) return 'NULL';
                    if (typeof v === 'string') return "'" + v.replace(/'/g, "\\'") + "'";
                    if (v instanceof Date) return "'" + v.toISOString().slice(0, 19).replace('T', ' ') + "'";
                    return v;
                });
                inserts += `INSERT IGNORE INTO ${tableName} (${ks.join(', ')}) VALUES (${vs.join(', ')});\n`;
            }
            return inserts + '\n';
        }

        sqlDump += await exportTable('hostels');
        sqlDump += await exportTable('users');
        sqlDump += await exportTable('rooms');
        sqlDump += await exportTable('room_bookings');
        sqlDump += await exportTable('mess_menu');
        sqlDump += await exportTable('mess_attendance');
        sqlDump += await exportTable('complaints');
        sqlDump += await exportTable('outings');

        res.setHeader('Content-disposition', 'attachment; filename=admin_system_backup.sql');
        res.setHeader('Content-type', 'application/sql');
        res.send(sqlDump);

    } catch (err) {
        console.error("Export Error:", err);
        res.status(500).json({ error: 'Internal server error while exporting database' });
    }
};

exports.importDatabase = async (req, res) => {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
        return res.status(400).json({ error: 'Invalid SQL content provided' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const statements = sql.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && s.toUpperCase().startsWith('INSERT IGNORE INTO'));

        for (const statement of statements) {
            await connection.query(statement);
        }

        await connection.commit();
        res.json({ message: `Successfully imported ${statements.length} records into the database.` });

    } catch (err) {
        await connection.rollback();
        console.error("Import Error:", err);
        res.status(500).json({ error: 'Failed to import data.' });
    } finally {
        connection.release();
    }
};

exports.runQuery = async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Please provide a valid SQL query.' });
    }

    try {
        const [results] = await db.query(query);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error("SQL Explorer Error:", err);
        res.status(400).json({
            error: err.sqlMessage || err.message || 'An error occurred while executing the query.'
        });
    }
};
