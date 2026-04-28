const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, isAdmin, isWarden } = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, isWarden, adminController.getDashboardStats);
router.get('/database/export', authMiddleware, isAdmin, adminController.exportDatabase);
router.post('/database/import', authMiddleware, isAdmin, adminController.importDatabase);
router.post('/query', authMiddleware, isAdmin, adminController.runQuery);

module.exports = router;
