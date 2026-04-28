const db = require('../config/db');

exports.getAllCases = async (req, res) => {
    try {
        const [cases] = await db.execute(`
            SELECT dc.*, u.name as student_name, u.email as student_email 
            FROM disciplinary_cases dc 
            JOIN users u ON dc.student_id = u.id 
            ORDER BY dc.created_at DESC
        `);
        res.status(200).json(cases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching disciplinary cases' });
    }
};

exports.getMyCases = async (req, res) => {
    try {
        const studentId = req.user.id;
        const [cases] = await db.execute(`
            SELECT * FROM disciplinary_cases WHERE student_id = ? ORDER BY created_at DESC
        `, [studentId]);
        res.status(200).json(cases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching my cases' });
    }
};

exports.addCase = async (req, res) => {
    try {
        const { student_id, reason, action_taken } = req.body;
        if (!student_id || !reason || !action_taken) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        await db.execute(`
            INSERT INTO disciplinary_cases (student_id, reason, action_taken) 
            VALUES (?, ?, ?)
        `, [student_id, reason, action_taken]);
        res.status(201).json({ message: 'Disciplinary case logged successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding case' });
    }
};

exports.deleteCase = async (req, res) => {
    try {
        await db.execute('DELETE FROM disciplinary_cases WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
