const db = require('../config/db');

exports.createComplaint = async (req, res) => {
    const student_id = req.user.id;
    const { category, title, description, image_url } = req.body;

    if (!category || !title || !description) {
        return res.status(400).json({ error: 'Category, title, and description are required' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO complaints (student_id, category, title, description, image_url, status) VALUES (?, ?, ?, ?, ?, ?)',
            [student_id, category, title, description, image_url || null, 'Pending']
        );
        res.status(201).json({ message: 'Complaint registered successfully', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMyComplaints = async (req, res) => {
    try {
        const [complaints] = await db.execute(
            'SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        let query = `
            SELECT c.*, u.name as student_name, u.email 
            FROM complaints c
            JOIN users u ON c.student_id = u.id
        `;
        const params = [];

        if (req.user.role === 'Warden') {
            // Only fetch complaints for students who have an approved booking in the warden's hostel
            query += `
                JOIN room_bookings b ON c.student_id = b.student_id AND b.status = 'Approved'
                JOIN rooms r ON b.room_id = r.id AND r.hostel_id = ?
            `;
            params.push(req.user.hostel_id);
        }

        query += ' ORDER BY c.created_at DESC';

        const [complaints] = await db.execute(query, params);
        res.json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    const { id } = req.params;
    const { status, resolution_comment } = req.body;

    try {
        if (req.user.role === 'Warden') {
            // Verify complaint belongs to their hostel
            const [complaints] = await db.execute(`
                SELECT c.id FROM complaints c
                JOIN room_bookings b ON c.student_id = b.student_id AND b.status = 'Approved'
                JOIN rooms r ON b.room_id = r.id
                WHERE c.id = ? AND r.hostel_id = ?
            `, [id, req.user.hostel_id]);

            if (complaints.length === 0) {
                return res.status(403).json({ error: 'Access denied or complaint not found within your hostel' });
            }
        }

        let query = 'UPDATE complaints SET ';
        const params = [];

        if (status) {
            if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            query += 'status = ? ';
            params.push(status);
        }

        if (resolution_comment !== undefined) {
            if (params.length > 0) query += ', ';
            query += 'resolution_comment = ? ';
            params.push(resolution_comment);
        }

        if (params.length === 0) {
            return res.status(400).json({ error: 'No update fields provided' });
        }

        query += 'WHERE id = ?';
        params.push(id);

        await db.execute(query, params);
        res.json({ message: 'Complaint updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
