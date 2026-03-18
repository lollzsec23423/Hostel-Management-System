const db = require('../config/db');

// @desc    Create a new outing request (Student)
// @route   POST /api/outings
exports.createOuting = async (req, res) => {
    try {
        const { destination, reason, departure_date, return_date } = req.body;
        const student_id = req.user.id; // From authMiddleware

        if (!destination || !reason || !departure_date || !return_date) {
            return res.status(400).json({ error: 'Please provide all required fields (destination, reason, departure_date, return_date)' });
        }

        const query = `
            INSERT INTO outings (student_id, destination, reason, departure_date, return_date, status)
            VALUES (?, ?, ?, ?, ?, 'Pending')
        `;

        const [result] = await db.execute(query, [student_id, destination, reason, departure_date, return_date]);

        res.status(201).json({
            message: 'Outing request created successfully',
            outingId: result.insertId
        });
    } catch (error) {
        console.error('Error creating outing request:', error);
        res.status(500).json({ error: 'Internal server error while creating outing request' });
    }
};

// @desc    Get all outing requests for logged-in student
// @route   GET /api/outings/my-requests
exports.getStudentOutings = async (req, res) => {
    try {
        const student_id = req.user.id;

        const query = `
            SELECT * FROM outings 
            WHERE student_id = ? 
            ORDER BY created_at DESC
        `;

        const [outings] = await db.execute(query, [student_id]);

        res.status(200).json(outings);
    } catch (error) {
        console.error('Error fetching student outings:', error);
        res.status(500).json({ error: 'Internal server error while fetching outings' });
    }
};

// @desc    Get all outing requests (Warden/Admin)
// @route   GET /api/outings
exports.getAllOutings = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userHostelId = req.user.hostel_id;

        let query = `
            SELECT o.*, u.name as student_name, u.email as student_email, u.course, u.year_of_study 
            FROM outings o
            JOIN users u ON o.student_id = u.id
        `;
        let queryParams = [];

        if (userRole === 'Warden') {
            if (!userHostelId) {
                // Return empty if Warden has no assigned hostel
                return res.status(200).json([]);
            }
            query += ` WHERE u.hostel_id = ? `;
            queryParams.push(userHostelId);
        }

        query += ` ORDER BY o.created_at DESC `;

        const [outings] = await db.execute(query, queryParams);

        res.status(200).json(outings);
    } catch (error) {
        console.error('Error fetching all outings:', error);
        res.status(500).json({ error: 'Internal server error while fetching outings' });
    }
};

// @desc    Update status of an outing request (Warden/Admin)
// @route   PUT /api/outings/:id/status
exports.updateOutingStatus = async (req, res) => {
    try {
        const outingId = req.params.id;
        const { status } = req.body;
        const userRole = req.user.role;
        const userHostelId = req.user.hostel_id;

        // Ensure status is valid
        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        // Fetch the outing request to check the student's hostel
        const fetchQuery = `
            SELECT o.id, u.hostel_id as student_hostel_id 
            FROM outings o
            JOIN users u ON o.student_id = u.id
            WHERE o.id = ?
        `;
        const [existingOutings] = await db.execute(fetchQuery, [outingId]);

        if (existingOutings.length === 0) {
            return res.status(404).json({ error: 'Outing request not found' });
        }

        const studentHostelId = existingOutings[0].student_hostel_id;

        // Authorization check: Wardens can only modify requests for students in their assigned hostel
        if (userRole === 'Warden') {
            if (!userHostelId) {
                return res.status(403).json({ error: 'Access Denied: You are not assigned to any hostel.' });
            }
            if (studentHostelId !== userHostelId) {
                return res.status(403).json({ error: 'Access Denied: You cannot modify outing requests for students outside your assigned hostel.' });
            }
        }

        const query = `
            UPDATE outings 
            SET status = ? 
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [status, outingId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Outing request not found' });
        }

        res.status(200).json({ message: `Outing request status updated to ${status}` });
    } catch (error) {
        console.error('Error updating outing status:', error);
        res.status(500).json({ error: 'Internal server error while updating outing status' });
    }
};
