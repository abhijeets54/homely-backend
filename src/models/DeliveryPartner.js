const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DeliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  vehicleType: { type: String, enum: ['bike', 'scooter', 'car'], required: true },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
DeliveryPartnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('DeliveryPartner', DeliveryPartnerSchema);
