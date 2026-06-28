const express = require('express');
const router = express.Router();
const { getDashboardStats, getRevenueReport } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/revenue-report', getRevenueReport);

module.exports = router;
