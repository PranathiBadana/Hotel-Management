const express = require('express');
const router = express.Router();
const { getAllGuests, getGuestById, createGuest, updateGuest, deleteGuest } = require('../controllers/guestController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAllGuests);
router.get('/:id', getGuestById);
router.post('/', createGuest);
router.put('/:id', updateGuest);
router.delete('/:id', authorize('admin', 'manager'), deleteGuest);

module.exports = router;
