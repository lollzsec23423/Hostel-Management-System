const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');
const { authMiddleware, isWarden } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, hostelController.getAllHostels);
router.post('/', authMiddleware, isWarden, hostelController.createHostel);
router.put('/:id', authMiddleware, isWarden, hostelController.updateHostel);
router.delete('/:id', authMiddleware, isWarden, hostelController.deleteHostel);

module.exports = router;
