const express = require('express');
const router = express.Router();
const { getAllRooms, getRoomById, createRoom, updateRoom, updateRoomStatus, deleteRoom, getAvailableRooms } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAllRooms);
router.get('/available', getAvailableRooms);
router.get('/:id', getRoomById);
router.post('/', authorize('admin', 'manager'), createRoom);
router.put('/:id', authorize('admin', 'manager'), updateRoom);
router.patch('/:id/status', updateRoomStatus);
router.delete('/:id', authorize('admin'), deleteRoom);

module.exports = router;
