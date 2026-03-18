const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, isAdmin, adminController.getDashboardStats);

module.exports = router;
