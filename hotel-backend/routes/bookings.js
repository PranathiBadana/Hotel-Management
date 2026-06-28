const express = require('express');
const router = express.Router();
const { getAllBookings, getBookingById, createBooking, updateBooking, checkIn, checkOut, cancelBooking, getTodaysActivity } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAllBookings);
router.get('/today', getTodaysActivity);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.patch('/:id/check-in', checkIn);
router.patch('/:id/check-out', checkOut);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
