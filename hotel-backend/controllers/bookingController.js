const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

exports.getAllBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.checkIn = {};
      if (startDate) filter.checkIn.$gte = new Date(startDate);
      if (endDate) filter.checkIn.$lte = new Date(endDate);
    }
    const bookings = await Booking.find(filter)
      .populate('guest', 'firstName lastName email phone')
      .populate('room', 'roomNumber type pricePerNight')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest')
      .populate('room')
      .populate('createdBy', 'name');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { room: roomId, checkIn, checkOut } = req.body;
    const room = await Room.findById(roomId);
    if (!room || room.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Room is not available' });
    }
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.pricePerNight;
    const booking = await Booking.create({ ...req.body, totalAmount, createdBy: req.user._id });
    await Room.findByIdAndUpdate(roomId, { status: 'occupied' });
    const populated = await booking.populate(['guest', 'room']);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('guest', 'firstName lastName email')
      .populate('room', 'roomNumber type');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id,
      { status: 'checked_in', checkInTime: new Date() }, { new: true }).populate('room');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking, message: 'Guest checked in successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id,
      { status: 'checked_out', checkOutTime: new Date(), paymentStatus: 'paid' }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    await Room.findByIdAndUpdate(booking.room, { status: 'cleaning' });
    await Guest.findByIdAndUpdate(booking.guest, { $inc: { totalStays: 1, totalSpent: booking.totalAmount } });
    res.json({ success: true, data: booking, message: 'Guest checked out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id,
      { status: 'cancelled' }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    await Room.findByIdAndUpdate(booking.room, { status: 'available' });
    res.json({ success: true, data: booking, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTodaysActivity = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [checkIns, checkOuts] = await Promise.all([
      Booking.find({ checkIn: { $gte: today, $lt: tomorrow }, status: { $in: ['confirmed', 'checked_in'] } }).populate('guest room'),
      Booking.find({ checkOut: { $gte: today, $lt: tomorrow }, status: 'checked_in' }).populate('guest room'),
    ]);
    res.json({ success: true, data: { checkIns, checkOuts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
