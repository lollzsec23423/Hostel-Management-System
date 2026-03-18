const db = require('../config/db');

exports.getAllHostels = async (req, res) => {
    try {
        const [hostels] = await db.execute('SELECT * FROM hostels');

        // If it's a student, filter hostels based on their gender and year
        if (req.user && req.user.role === 'Student') {
            const [users] = await db.execute('SELECT gender, year_of_study FROM users WHERE id = ?', [req.user.id]);
            if (users.length > 0) {
                const user = users[0];
                let filteredHostels = [];
                if (user.gender === 'Female') {
                    filteredHostels = hostels.filter(h => h.type === 'Girls');
                } else if (user.gender === 'Male') {
                    if (user.year_of_study === 1) {
                        filteredHostels = hostels.filter(h => h.name.includes('First Year') && h.type === 'Boys');
                    } else {
                        filteredHostels = hostels.filter(h => h.name.includes('Senior') && h.type === 'Boys');
                    }
                }
                return res.json(filteredHostels);
            }
        }

        res.json(hostels);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createHostel = async (req, res) => {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type required' });

    try {
        const [result] = await db.execute(
            'INSERT INTO hostels (name, type) VALUES (?, ?)',
            [name, type]
        );
        res.status(201).json({ message: 'Hostel created', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateHostel = async (req, res) => {
    const { id } = req.params;
    const { name, type } = req.body;

    try {
        await db.execute(
            'UPDATE hostels SET name = COALESCE(?, name), type = COALESCE(?, type) WHERE id = ?',
            [name, type, id]
        );
        res.json({ message: 'Hostel updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteHostel = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM hostels WHERE id = ?', [id]);
        res.json({ message: 'Hostel deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
