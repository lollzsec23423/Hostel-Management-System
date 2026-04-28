const express = require('express');
const router = express.Router();
const dcController = require('../controllers/dcController');
const { authMiddleware, isWarden } = require('../middleware/authMiddleware');

router.get('/my-cases', authMiddleware, dcController.getMyCases);
router.get('/', authMiddleware, isWarden, dcController.getAllCases);
router.post('/', authMiddleware, isWarden, dcController.addCase);
router.delete('/:id', authMiddleware, isWarden, dcController.deleteCase);

module.exports = router;
