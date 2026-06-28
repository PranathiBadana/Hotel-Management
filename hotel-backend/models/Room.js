const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['single', 'double', 'suite', 'deluxe', 'presidential'], required: true },
  floor: { type: Number, required: true },
  capacity: { type: Number, required: true, default: 2 },
  pricePerNight: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied', 'maintenance', 'cleaning'], default: 'available' },
  amenities: [{ type: String }],
  description: { type: String },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
