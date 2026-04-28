const db = require('../config/db');

exports.getAllDamages = async (req, res) => {
    try {
        const [damages] = await db.execute(`
            SELECT pd.*, u.name as student_name, u.email as student_email 
            FROM property_damages pd 
            JOIN users u ON pd.student_id = u.id 
            ORDER BY pd.created_at DESC
        `);
        res.status(200).json(damages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching damages' });
    }
};

exports.getMyDamages = async (req, res) => {
    try {
        const studentId = req.user.id;
        const [damages] = await db.execute(`
            SELECT * FROM property_damages WHERE student_id = ? ORDER BY created_at DESC
        `, [studentId]);
        res.status(200).json(damages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching my damages' });
    }
};

exports.addDamage = async (req, res) => {
    try {
        const { student_id, item_damaged, damage_cost } = req.body;
        if (!student_id || !item_damaged || !damage_cost) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        await db.execute(`
            INSERT INTO property_damages (student_id, item_damaged, damage_cost) 
            VALUES (?, ?, ?)
        `, [student_id, item_damaged, damage_cost]);
        res.status(201).json({ message: 'Property damage logged successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding damage' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (status !== 'Pending' && status !== 'Paid') {
            return res.status(400).json({ error: 'Invalid status' });
        }
        await db.execute('UPDATE property_damages SET status = ? WHERE id = ?', [status, req.params.id]);
        res.status(200).json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating status' });
    }
};

exports.deleteDamage = async (req, res) => {
    try {
        await db.execute('DELETE FROM property_damages WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
