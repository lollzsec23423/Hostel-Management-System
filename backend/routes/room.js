const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware, isAdmin, isWarden } = require('../middleware/authMiddleware');

// Warden Room Visibility (Must be before dynamic /hostel/:hostelId)
router.get('/hostel/occupancy', authMiddleware, isWarden, roomController.getWardenHostelOccupancy);
router.get('/hostel/occupancy/export', authMiddleware, isWarden, roomController.exportWardenHostelOccupancy);
router.post('/hostel/occupancy/import', authMiddleware, isWarden, roomController.importWardenHostelOccupancy);


// Student & Admin Room fetching
router.get('/', authMiddleware, roomController.getAllRooms);
router.get('/hostel/:hostelId', authMiddleware, roomController.getRoomsByHostel);

// Admin Room Management
router.post('/', authMiddleware, isWarden, roomController.createRoom);
router.put('/:id', authMiddleware, isWarden, roomController.updateRoom);
router.delete('/:id', authMiddleware, isWarden, roomController.deleteRoom);

// Bookings
router.post('/book', authMiddleware, roomController.bookRoom);
router.get('/bookings/my', authMiddleware, roomController.getMyBookings);
router.get('/bookings', authMiddleware, isWarden, roomController.getBookings);
router.put('/bookings/:id/approve', authMiddleware, isWarden, roomController.approveBooking);

module.exports = router;
