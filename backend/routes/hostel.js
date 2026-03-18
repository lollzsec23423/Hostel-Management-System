const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, hostelController.getAllHostels);
router.post('/', authMiddleware, isAdmin, hostelController.createHostel);
router.put('/:id', authMiddleware, isAdmin, hostelController.updateHostel);
router.delete('/:id', authMiddleware, isAdmin, hostelController.deleteHostel);

module.exports = router;
