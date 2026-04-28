const express = require('express');
const router = express.Router();
const damageController = require('../controllers/damageController');
const { authMiddleware, isWarden } = require('../middleware/authMiddleware');

router.get('/my-damages', authMiddleware, damageController.getMyDamages);
router.get('/', authMiddleware, isWarden, damageController.getAllDamages);
router.post('/', authMiddleware, isWarden, damageController.addDamage);
router.put('/:id/status', authMiddleware, isWarden, damageController.updateStatus);
router.delete('/:id', authMiddleware, isWarden, damageController.deleteDamage);

module.exports = router;
