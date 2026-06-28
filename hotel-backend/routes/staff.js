const express = require('express');
const router = express.Router();
const { getAllStaff, getStaffById, createStaff, updateStaff, toggleStaffStatus } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager'));
router.get('/', getAllStaff);
router.get('/:id', getStaffById);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.patch('/:id/toggle-status', toggleStaffStatus);

module.exports = router;
