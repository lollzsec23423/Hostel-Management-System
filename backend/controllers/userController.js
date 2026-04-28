const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getStudents = async (req, res) => {
    try {
        const [students] = await db.execute(`
            SELECT u.id, u.name, u.contact_number, u.email, u.course, u.gender, u.year_of_study, u.hostel_id, h.name as hostel_name 
            FROM users u
            LEFT JOIN hostels h ON u.hostel_id = h.id
            WHERE u.role = 'Student'
            ORDER BY u.created_at DESC
        `);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
}

exports.addStudent = async (req, res) => {
    try {
        const { name, contact_number, email, password, course, gender, year_of_study, hostel_id } = req.body;
        const hashedPassword = await bcrypt.hash(password || 'student123', 10);
        
        await db.execute(
            `INSERT INTO users (name, contact_number, email, password, role, course, gender, year_of_study, hostel_id) 
             VALUES (?, ?, ?, ?, 'Student', ?, ?, ?, ?)`,
            [name, contact_number, email, hashedPassword, course, gender, year_of_study, hostel_id || null]
        );
        res.status(201).json({ message: "Student added successfully" });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add student" });
    }
}

exports.updateStudent = async (req, res) => {
    try {
        const { name, contact_number, course, gender, year_of_study, hostel_id } = req.body;
        const studentId = req.params.id;

        await db.execute(
            `UPDATE users SET name=?, contact_number=?, course=?, gender=?, year_of_study=?, hostel_id=? 
             WHERE id=? AND role='Student'`,
            [name, contact_number, course, gender, year_of_study, hostel_id || null, studentId]
        );
        res.status(200).json({ message: "Student updated successfully" });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update student" });
    }
}

exports.deleteStudent = async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id=? AND role="Student"', [req.params.id]);
        res.status(200).json({ message: "Student deleted successfully" });
    } catch(err) {
        res.status(500).json({ error: "Failed to delete student" });
    }
}
