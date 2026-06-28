const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  idType: { type: String, enum: ['passport', 'driving_license', 'national_id', 'other'] },
  idNumber: { type: String },
  dateOfBirth: { type: Date },
  nationality: { type: String },
  notes: { type: String },
  totalStays: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Guest', guestSchema);
