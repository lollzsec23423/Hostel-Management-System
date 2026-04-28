const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, isWarden } = require('../middleware/authMiddleware');

router.get('/students', authMiddleware, isWarden, userController.getStudents);
router.post('/students', authMiddleware, isWarden, userController.addStudent);
router.put('/students/:id', authMiddleware, isWarden, userController.updateStudent);
router.delete('/students/:id', authMiddleware, isWarden, userController.deleteStudent);

module.exports = router;
