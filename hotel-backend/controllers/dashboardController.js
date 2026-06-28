const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalRooms, availableRooms, occupiedRooms, maintenanceRooms,
      totalGuests, totalBookings, activeBookings,
      todayCheckIns, todayCheckOuts,
      monthlyRevenue, totalRevenue,
    ] = await Promise.all([
      Room.countDocuments({ isActive: true }),
      Room.countDocuments({ status: 'available', isActive: true }),
      Room.countDocuments({ status: 'occupied', isActive: true }),
      Room.countDocuments({ status: 'maintenance', isActive: true }),
      Guest.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['confirmed', 'checked_in'] } }),
      Booking.countDocuments({ checkIn: { $gte: today, $lt: tomorrow } }),
      Booking.countDocuments({ checkOut: { $gte: today, $lt: tomorrow }, status: 'checked_in' }),
      Booking.aggregate([
        { $match: { createdAt: { $gte: firstDayOfMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
    ]);

    // Weekly revenue for chart
    const weeklyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        rooms: { total: totalRooms, available: availableRooms, occupied: occupiedRooms, maintenance: maintenanceRooms, occupancyRate },
        guests: { total: totalGuests },
        bookings: { total: totalBookings, active: activeBookings, todayCheckIns, todayCheckOuts },
        revenue: {
          monthly: monthlyRevenue[0]?.total || 0,
          total: totalRevenue[0]?.total || 0,
        },
        weeklyRevenue,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const groupBy = period === 'daily' ? { $dayOfMonth: '$createdAt' }
      : period === 'weekly' ? { $week: '$createdAt' }
      : { $month: '$createdAt' };

    const report = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: groupBy, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
