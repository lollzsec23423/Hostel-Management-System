const express = require('express');
const router = express.Router();
const outingController = require('../controllers/outingController');
const { authMiddleware, isWarden } = require('../middleware/authMiddleware');

// Student routes
router.post('/', authMiddleware, outingController.createOuting); // Create new request
router.get('/my-requests', authMiddleware, outingController.getStudentOutings); // Get student's requests

// Warden/Admin routes
router.get('/', authMiddleware, isWarden, outingController.getAllOutings); // Get all requests
router.put('/:id/status', authMiddleware, isWarden, outingController.updateOutingStatus); // Update status

module.exports = router;
