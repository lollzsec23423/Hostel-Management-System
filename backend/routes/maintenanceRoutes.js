const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authMiddleware, isWarden } = require('../middleware/authMiddleware');

router.get('/my-requests', authMiddleware, maintenanceController.getMyMaintenance);
router.post('/', authMiddleware, maintenanceController.addMaintenance);

router.get('/', authMiddleware, isWarden, maintenanceController.getAllMaintenance);
router.put('/:id/status', authMiddleware, isWarden, maintenanceController.updateStatus);
router.delete('/:id', authMiddleware, isWarden, maintenanceController.deleteMaintenance);

module.exports = router;
