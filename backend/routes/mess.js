const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');
const { authMiddleware, isMessOwner } = require('../middleware/authMiddleware');

// Mess Menu
router.get('/menu', authMiddleware, messController.getMenu);
router.get('/menu/today', authMiddleware, messController.getTodayMenu);
router.post('/menu', authMiddleware, isMessOwner, messController.addMenu);
router.put('/menu/:id', authMiddleware, isMessOwner, messController.updateMenu);
router.delete('/menu/:id', authMiddleware, isMessOwner, messController.deleteMenu);

// Mess Attendance
router.post('/attendance', authMiddleware, messController.markAttendance);
router.get('/attendance/my', authMiddleware, messController.getMyAttendance);
router.get('/attendance/all', authMiddleware, isMessOwner, messController.getAllAttendance);

module.exports = router;
