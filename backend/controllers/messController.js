const db = require('../config/db');

// --- MESS MENU ---
exports.getMenu = async (req, res) => {
    try {
        const [menuItems] = await db.execute('SELECT * FROM mess_menu ORDER BY day_number, meal_type');

        // Calculate dates for the next 14-day cycle starting from today
        const today = new Date();
        const refDate = new Date('2024-01-01'); // Known Monday
        const diffMs = today - refDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const todayDayNumber = (diffDays % 14) + 1;

        // Map them to actual dates for the frontend to render smoothly
        const processedMenu = menuItems.map(m => {
            let offset = m.day_number - todayDayNumber;
            // If the day_number has already passed in the current 14-day cycle, 
            // project it to the next cycle (+14 days) so it always appears forward-looking.
            // But we actually just want to show the current 14-day block, relative to today.
            if (offset < 0) offset += 14;

            const itemDate = new Date();
            itemDate.setDate(today.getDate() + offset);

            return {
                id: m.id,
                day_number: m.day_number,
                menu_date: itemDate.toISOString().split('T')[0],
                meal_type: m.meal_type,
                items: m.items
            };
        });

        // Sort by projected date, then meal type order
        processedMenu.sort((a, b) => {
            if (a.menu_date !== b.menu_date) return a.menu_date.localeCompare(b.menu_date);
            const order = { 'Breakfast': 1, 'Lunch': 2, 'Dinner': 3 };
            return order[a.meal_type] - order[b.meal_type];
        });

        res.json(processedMenu);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTodayMenu = async (req, res) => {
    try {
        const [menu] = await db.execute(`
            SELECT * FROM mess_menu 
            WHERE day_number = (DATEDIFF(CURDATE(), '2024-01-01') % 14) + 1
        `);
        res.json(menu);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.addMenu = async (req, res) => {
    const { day_number, meal_type, items } = req.body;
    if (!day_number || !meal_type || !items) return res.status(400).json({ error: 'All fields are required' });

    try {
        await db.execute(
            'INSERT INTO mess_menu (day_number, meal_type, items) VALUES (?, ?, ?)',
            [day_number, meal_type, items]
        );
        res.status(201).json({ message: 'Menu block added successfully' });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Menu block for this cycle day and meal already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateMenu = async (req, res) => {
    const { id } = req.params;
    const { items } = req.body;

    try {
        await db.execute('UPDATE mess_menu SET items = ? WHERE id = ?', [items, id]);
        res.json({ message: 'Menu updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteMenu = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM mess_menu WHERE id = ?', [id]);
        res.json({ message: 'Menu deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// --- MESS ATTENDANCE ---
exports.markAttendance = async (req, res) => {
    const student_id = req.user.id;
    const { meal_type } = req.body; // Breakfast, Lunch, Dinner

    // Validate meal type
    if (!['Breakfast', 'Lunch', 'Dinner'].includes(meal_type)) {
        return res.status(400).json({ error: 'Invalid meal type' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO mess_attendance (student_id, attendance_date, meal_type) VALUES (?, CURDATE(), ?)',
            [student_id, meal_type]
        );
        res.status(201).json({ message: 'Attendance marked successfully' });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Attendance already marked for this meal today' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMyAttendance = async (req, res) => {
    try {
        const [attendance] = await db.execute(
            'SELECT * FROM mess_attendance WHERE student_id = ? ORDER BY attendance_date DESC, marked_at DESC',
            [req.user.id]
        );
        res.json(attendance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllAttendance = async (req, res) => {
    const { date } = req.query;

    try {
        let query = `
            SELECT a.*, u.name as student_name, u.course
            FROM mess_attendance a
            JOIN users u ON a.student_id = u.id
        `;
        const params = [];

        if (date) {
            query += ' WHERE a.attendance_date = ?';
            params.push(date);
        }

        query += ' ORDER BY a.attendance_date DESC, a.marked_at DESC';

        const [attendance] = await db.execute(query, params);
        res.json(attendance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
