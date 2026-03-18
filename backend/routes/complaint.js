const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authMiddleware, isWarden } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, complaintController.createComplaint);
router.get('/my', authMiddleware, complaintController.getMyComplaints);
router.get('/', authMiddleware, isWarden, complaintController.getAllComplaints);
router.put('/:id', authMiddleware, isWarden, complaintController.updateComplaintStatus);

module.exports = router;
