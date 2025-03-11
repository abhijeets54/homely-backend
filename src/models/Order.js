const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  status: { 
    type: String, 
    enum: ['placed', 'preparing', 'out for delivery', 'delivered', 'cancelled'], 
    default: 'placed' 
  },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'India' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryInstructions: { type: String, default: '' },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  cancelledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
