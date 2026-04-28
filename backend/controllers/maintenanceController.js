const db = require('../config/db');

exports.getAllMaintenance = async (req, res) => {
    try {
        const [requests] = await db.execute(`
            SELECT m.*, u.name as student_name, u.email 
            FROM maintenance_requests m 
            JOIN users u ON m.student_id = u.id 
            ORDER BY m.created_at DESC
        `);
        res.status(200).json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching maintenance requests' });
    }
};

exports.getMyMaintenance = async (req, res) => {
    try {
        const studentId = req.user.id;
        const [requests] = await db.execute(`
            SELECT * FROM maintenance_requests WHERE student_id = ? ORDER BY created_at DESC
        `, [studentId]);
        res.status(200).json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching my maintenance requests' });
    }
};

exports.addMaintenance = async (req, res) => {
    try {
        const { item_to_fix, description } = req.body;
        const student_id = req.user.id;
        if (!item_to_fix || !description) {
            return res.status(400).json({ error: 'Item and description are required' });
        }
        await db.execute(`
            INSERT INTO maintenance_requests (student_id, item_to_fix, description) 
            VALUES (?, ?, ?)
        `, [student_id, item_to_fix, description]);
        res.status(201).json({ message: 'Maintenance request logged successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding maintenance request' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await db.execute('UPDATE maintenance_requests SET status = ? WHERE id = ?', [status, req.params.id]);
        res.status(200).json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating status' });
    }
};

exports.deleteMaintenance = async (req, res) => {
    try {
        await db.execute('DELETE FROM maintenance_requests WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting request' });
    }
};
