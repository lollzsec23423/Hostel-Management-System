const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    const { name, email, password, course, gender, year_of_study, role, hostel_id } = req.body;

    if (!name || !email || !password || !gender || !year_of_study) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const [existing] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRole = role || 'Student';
        const userHostelId = hostel_id || null;

        await db.execute(
            'INSERT INTO users (name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, userRole, course || 'None', gender, parseInt(year_of_study), userHostelId]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, name: user.name, hostel_id: user.hostel_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                course: user.course,
                hostel_id: user.hostel_id
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, role, course, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
